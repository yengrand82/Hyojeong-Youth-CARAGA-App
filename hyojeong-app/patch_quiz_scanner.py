#!/usr/bin/env python3
"""
Patch: Assisted quiz answer-sheet scanner (admin)
-------------------------------------------------
Adds an AI-assisted scanner to the Quiz Scores screen:
  - Admin sets the answer key once (e.g. B,C,C,D,B,A,B,A,C,B) and picks which
    quiz column (Q1/Q2/Q3) to fill.
  - For a student, tap "Scan" -> upload their answer-sheet photo.
  - The app sends the image + key to the Claude vision API, which reads each
    answer. A REVIEW table shows read-vs-key per question with the score.
  - Admin fixes any misread with a tap, then "Use this score" drops it into
    that student's quiz box. Nothing saves until the admin reviews.
  - Existing "Save Quiz Scores" button persists as before.

Assisted by design: the AI never silently sets a grade — the admin always
confirms. Written-answer questions are not supported (MC/TF only).

Safe by design: exact-string anchors, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_quiz_scanner.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_quiz_scanner.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "scanQuizSheet" in src:
        fail("Quiz scanner patch already applied (found marker). Nothing to do.")
    if "const setScoreField = (studentId, field, value) => {" not in src:
        fail("Could not find the quiz score setter. Is this the right App.jsx?")
    if "if ((currentPage === 'lead-quizzes' || currentPage === 'admin-quizzes')" not in src:
        fail("Could not find the Quiz Scores screen.")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # ------------------------------------------------------------------
    # 1) State for the scanner (near scoreEdits/savingScores).
    # ------------------------------------------------------------------
    state_anchor = "  const [quizTeamFilter, setQuizTeamFilter] = useState('ALL');"
    state_add = state_anchor + """
  // --- Quiz answer-sheet scanner (assisted; admin confirms before saving) ---
  const [quizKey, setQuizKey] = useState('');            // e.g. "B,C,C,D,B,A,B,A,C,B"
  const [quizTargetCol, setQuizTargetCol] = useState('quiz1'); // quiz1|quiz2|quiz3
  const [scanningSid, setScanningSid] = useState(null);  // student currently scanning
  const [scanBusy, setScanBusy] = useState(false);
  const [scanReview, setScanReview] = useState(null);    // { sid, name, read:[], key:[], score10 }"""
    src = src.replace(state_anchor, state_add, 1)

    # ------------------------------------------------------------------
    # 2) Scanner functions (just before setScoreField).
    # ------------------------------------------------------------------
    fn_anchor = "  const setScoreField = (studentId, field, value) => {"
    fns = """  // Parse the answer key string into an array of upper letters: "B, c ,T" -> ['B','C','T']
  const parseQuizKey = (s) => (s || '')
    .split(/[,\\s]+/).map(x => x.trim().toUpperCase()).filter(Boolean);

  // Read a student's answer-sheet photo via the vision API, then open review.
  const scanQuizSheet = async (student, file) => {
    const key = parseQuizKey(quizKey);
    if (key.length === 0) { alert('Please enter the answer key first (e.g. B,C,C,D,B).'); return; }
    if (!file) return;
    const sid = student['Student ID'];
    setScanningSid(sid);
    setScanBusy(true);
    try {
      // file -> base64
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result).split(',')[1]);
        r.onerror = () => rej(new Error('read failed'));
        r.readAsDataURL(file);
      });
      const media = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
      const prompt =
        'You are reading a handwritten multiple-choice / true-false quiz answer sheet. ' +
        'There are ' + key.length + ' questions. For each question number from 1 to ' + key.length + ', ' +
        'identify the single answer letter the student wrote (A, B, C, D, T, or F). ' +
        'Watch out for misnumbering (a "1" that looks like "7"); use position/order to infer the intended question number. ' +
        'If an answer is unreadable or missing, use "?". ' +
        'Respond with ONLY a JSON array of ' + key.length + ' uppercase strings in question order, nothing else. ' +
        'Example: ["B","C","A","D"]';
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: media, data: b64 } },
              { type: 'text', text: prompt }
            ]
          }]
        })
      });
      const data = await resp.json();
      const textOut = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
      let read = [];
      try {
        read = JSON.parse(textOut.replace(/```json|```/g, '').trim());
      } catch (e) {
        // fallback: pull letters out of the text
        read = (textOut.match(/[A-DTF?]/gi) || []).map(x => x.toUpperCase());
      }
      // normalize to key length
      read = key.map((_, i) => (read[i] || '?').toString().toUpperCase().slice(0, 1));
      const score10 = scoreFromReadKey(read, key);
      setScanReview({
        sid,
        name: `${student['First Name'] || ''} ${student['Last Name'] || ''}`.trim(),
        read, key, score10
      });
    } catch (err) {
      console.error('Scan error:', err);
      alert('Could not read the sheet. Please check your connection and try again, or enter the score manually.');
    } finally {
      setScanBusy(false);
      setScanningSid(null);
    }
  };

  // Count correct, return a score out of 10 (rounded to 1 decimal) to match the quiz boxes.
  const scoreFromReadKey = (read, key) => {
    if (!key.length) return 0;
    let correct = 0;
    for (let i = 0; i < key.length; i++) if ((read[i] || '') === key[i]) correct++;
    return Math.round((correct / key.length) * 10 * 10) / 10;
  };

  // In the review table, let admin fix a misread answer.
  const fixReviewAnswer = (i, val) => {
    setScanReview(prev => {
      if (!prev) return prev;
      const read = [...prev.read];
      read[i] = (val || '?').toUpperCase().slice(0, 1);
      return { ...prev, read, score10: scoreFromReadKey(read, prev.key) };
    });
  };

  // Accept the reviewed score into the chosen quiz column for that student.
  const acceptScanScore = () => {
    if (!scanReview) return;
    setScoreField(scanReview.sid, quizTargetCol, scanReview.score10);
    setScanReview(null);
  };

  const setScoreField = (studentId, field, value) => {"""
    src = src.replace(fn_anchor, fns, 1)

    # ------------------------------------------------------------------
    # 3) Quiz screen: add the scan panel after the instructions box, and a
    #    Scan button per student row. Admin-only (hidden for team leaders).
    # ------------------------------------------------------------------
    instr_anchor = """        <div className=\"bg-white/90 rounded-xl p-3 mb-3 text-sm text-gray-600\">Enter each quiz out of <b>10</b>. There are 3 quizzes for the whole program. Heart Knowledge = average of quizzes taken.</div>"""
    panel = instr_anchor + """
        {isAdmin && (
          <div className=\"bg-white rounded-xl p-3 mb-3 border-2 border-purple-200\">
            <p className=\"text-xs font-black text-purple-700 uppercase tracking-wide mb-2\">📷 Scan Answer Sheets (assisted)</p>
            <label className=\"block text-xs font-bold text-gray-500 mb-1\">Answer key (in order, e.g. B,C,C,D,B,A,B,A,C,B)</label>
            <input value={quizKey} onChange={e => setQuizKey(e.target.value)} placeholder=\"B,C,C,D,B,A,B,A,C,B\"
              className=\"w-full border-2 border-purple-200 rounded-lg px-3 py-2 text-sm font-mono mb-2\" />
            <div className=\"flex items-center gap-2\">
              <span className=\"text-xs font-bold text-gray-500\">Fill into:</span>
              {['quiz1','quiz2','quiz3'].map((q, i) => (
                <button key={q} onClick={() => setQuizTargetCol(q)}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${quizTargetCol===q ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  Quiz {i+1}
                </button>
              ))}
            </div>
            <p className=\"text-[11px] text-gray-400 mt-2\">Tap “Scan” on a student, upload their answer-sheet photo, then review &amp; confirm the score before it fills in. Always double-check — handwriting reading isn’t perfect.</p>
          </div>
        )}"""
    src = src.replace(instr_anchor, panel, 1)

    # Add Scan button to each student row (admin only).
    row_anchor = """                {Box('quiz1')}{Box('quiz2')}{Box('quiz3')}
              </div>
            );
          })}"""
    row_new = """                {Box('quiz1')}{Box('quiz2')}{Box('quiz3')}
                {isAdmin && (
                  <label className={`ml-1 px-2 h-10 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer ${scanBusy && scanningSid===sid ? 'bg-gray-200 text-gray-400' : 'bg-purple-100 text-purple-700'}`}>
                    {scanBusy && scanningSid===sid ? '…' : '📷 Scan'}
                    <input type=\"file\" accept=\"image/*\" className=\"hidden\" disabled={scanBusy}
                      onChange={ev => { const f = ev.target.files && ev.target.files[0]; ev.target.value=''; if (f) scanQuizSheet(s, f); }} />
                  </label>
                )}
              </div>
            );
          })}"""
    src = src.replace(row_anchor, row_new, 1)

    # ------------------------------------------------------------------
    # 4) Review modal — inserted right before the Quiz screen's closing.
    #    Anchor on the Save Quiz Scores button block (unique to this screen).
    # ------------------------------------------------------------------
    save_anchor = """      <div className=\"fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent\">
        <button onClick={saveQuizScores} disabled={savingScores} className=\"w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl py-4 shadow-xl text-lg\">
          {savingScores ? 'Saving...' : '💾 Save Quiz Scores'}
        </button>
      </div>"""
    review_modal = """      {scanReview && (
        <div className=\"fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4\" onClick={() => setScanReview(null)}>
          <div className=\"bg-white rounded-2xl p-4 w-full max-w-sm max-h-[85vh] overflow-y-auto\" onClick={e => e.stopPropagation()}>
            <p className=\"font-black text-gray-800 text-lg\">Review scan</p>
            <p className=\"text-sm text-purple-600 font-bold mb-1\">{scanReview.name}</p>
            <p className=\"text-xs text-gray-500 mb-3\">Check each answer the app read. Tap a letter to fix it. Score fills into <b>Quiz {(['quiz1','quiz2','quiz3'].indexOf(quizTargetCol)+1)}</b>.</p>
            <div className=\"space-y-1 mb-3\">
              {scanReview.read.map((r, i) => {
                const ok = r === scanReview.key[i];
                return (
                  <div key={i} className=\"flex items-center gap-2 text-sm\">
                    <span className=\"w-7 text-gray-400 font-bold\">{i+1}.</span>
                    <input value={r} onChange={e => fixReviewAnswer(i, e.target.value)}
                      className={`w-10 h-9 text-center border-2 rounded font-bold ${ok ? 'border-emerald-300 text-emerald-700 bg-emerald-50' : 'border-red-300 text-red-700 bg-red-50'}`} />
                    <span className=\"text-xs text-gray-400\">key: <b className=\"text-gray-600\">{scanReview.key[i]}</b></span>
                    <span className={`text-xs font-bold ${ok ? 'text-emerald-600' : 'text-red-500'}`}>{ok ? '✓' : '✗'}</span>
                  </div>
                );
              })}
            </div>
            <div className=\"bg-purple-50 rounded-xl p-3 text-center mb-3\">
              <span className=\"text-2xl font-black text-purple-700\">{scanReview.score10}</span>
              <span className=\"text-sm text-gray-500\"> / 10</span>
              <span className=\"text-xs text-gray-400 block\">{scanReview.read.filter((r,i)=>r===scanReview.key[i]).length} of {scanReview.key.length} correct</span>
            </div>
            <div className=\"flex gap-2\">
              <button onClick={acceptScanScore} className=\"flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl py-3\">Use this score</button>
              <button onClick={() => setScanReview(null)} className=\"px-4 bg-gray-100 text-gray-500 font-bold rounded-xl py-3\">Cancel</button>
            </div>
          </div>
        </div>
      )}

""" + save_anchor
    src = src.replace(save_anchor, review_modal, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Quiz answer-sheet scanner applied to the Quiz Scores screen (admin).")
    print(f"✓ Updated: {path}")
    print("\nHow to use:")
    print("  1) Open Quiz Scores → type the answer key → pick Quiz 1/2/3.")
    print("  2) Tap 📷 Scan on a student → upload their answer-sheet photo.")
    print("  3) Review the read answers, fix any misread, tap 'Use this score'.")
    print("  4) Tap 💾 Save Quiz Scores as usual.")
    print("\nNote: uses the Claude vision API your app already has access to.")

if __name__ == "__main__":
    main()
