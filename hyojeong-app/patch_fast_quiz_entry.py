#!/usr/bin/env python3
"""
Patch: Fast quiz entry — keyboard Enter-to-next + "hide entered" toggle
----------------------------------------------------------------------
Makes manual quiz-score entry quick (free, no backend):
  - Press Enter (or Tab) in a score box to jump to the next box automatically,
    so you keep your hands on the keyboard: read sheet -> type -> Enter -> next.
  - A "Hide students already entered" toggle removes done students from the
    list so you always see who's left (prevents missed students).
Works together with the existing search box and team filter.

Safe by design: exact-string anchors, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_fast_quiz_entry.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_fast_quiz_entry.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "hideEnteredQuiz" in src:
        fail("Fast-entry patch already applied (found marker). Nothing to do.")
    if "  const [quizSearch, setQuizSearch] = useState('');" not in src:
        fail("Could not find quizSearch state — apply the search patch first.")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # 1) Add state + a keydown handler (move focus to next [data-qz]).
    state_anchor = "  const [quizSearch, setQuizSearch] = useState('');"
    state_add = state_anchor + """
  const [hideEnteredQuiz, setHideEnteredQuiz] = useState(false);
  // Enter/Tab in a score box -> focus the next score box.
  const quizBoxKeyDown = (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      const boxes = Array.from(document.querySelectorAll('input[data-qz]'));
      const idx = boxes.indexOf(ev.target);
      if (idx > -1 && idx + 1 < boxes.length) boxes[idx + 1].focus();
      else if (ev.target) ev.target.blur();
    }
  };"""
    src = src.replace(state_anchor, state_add, 1)

    # 2) Add a "hide entered" filter to the roster (a student is 'entered' if
    #    any of quiz1/quiz2/quiz3 has a value in scoreEdits).
    filter_anchor = """      .filter(s => {
        const q = (quizSearch || '').trim().toLowerCase();
        if (!q) return true;
        const name = `${s['First Name']||''} ${s['Last Name']||''}`.toLowerCase();
        const id = (s['Student ID']||'').toLowerCase();
        return name.includes(q) || id.includes(q);
      })"""
    filter_new = filter_anchor + """
      .filter(s => {
        if (!hideEnteredQuiz) return true;
        const e = scoreEdits[s['Student ID']] || {};
        const has = v => v !== '' && v != null;
        return !(has(e.quiz1) || has(e.quiz2) || has(e.quiz3));
      })"""
    if filter_anchor not in src:
        fail("Could not find the quiz search filter to add the hide-entered filter.")
    src = src.replace(filter_anchor, filter_new, 1)

    # 3) Add the toggle UI right after the search box.
    search_box_anchor = """          {quizSearch && (
            <button onClick={() => setQuizSearch('')} className=\"absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg px-2\">×</button>
          )}
        </div>"""
    toggle_ui = search_box_anchor + """
        <label className=\"flex items-center gap-2 mb-2 text-white text-sm font-bold cursor-pointer select-none\">
          <input type=\"checkbox\" checked={hideEnteredQuiz} onChange={e => setHideEnteredQuiz(e.target.checked)} className=\"w-4 h-4\" />
          Hide students already entered
        </label>"""
    if search_box_anchor not in src:
        fail("Could not find the search box to place the toggle.")
    src = src.replace(search_box_anchor, toggle_ui, 1)

    # 4) Add data-qz + onKeyDown to the score Box inputs.
    box_anchor = """            const Box = (field) => (
              <input type=\"number\" min=\"0\" max=\"10\" value={e[field] ?? ''} onChange={ev => setScoreField(sid, field, ev.target.value)}
                className=\"w-11 h-10 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700\" />
            );"""
    box_new = """            const Box = (field) => (
              <input type=\"number\" min=\"0\" max=\"10\" data-qz value={e[field] ?? ''}
                onChange={ev => setScoreField(sid, field, ev.target.value)}
                onKeyDown={quizBoxKeyDown}
                className=\"w-11 h-10 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700\" />
            );"""
    if box_anchor not in src:
        fail("Could not find the score Box input to add keyboard nav.")
    src = src.replace(box_anchor, box_new, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Fast quiz entry applied: Enter-to-next + 'hide entered' toggle.")
    print(f"✓ Updated: {path}")
    print("\nHow to use:")
    print("  - Type a score, press Enter -> jumps to the next box automatically.")
    print("  - Tick 'Hide students already entered' to see only who's left.")
    print("  - Combine with the team filter to do one team at a time.")
    print("\nNext: npm run dev -> Quiz Scores -> try Enter between boxes.")

if __name__ == "__main__":
    main()
