#!/usr/bin/env python3
"""Save All button: flush every pending inline edit in one pass. Backup: .bak9"""
import shutil, sys
path = "src/App.jsx"
changes = []

changes.append((
"""  // Build a printable HTML report for one student and open the print dialog.""",
"""  // Save ALL pending inline edits (marks + scores) across every student in one pass,
  // then recompute grades once at the end.
  const saveAllInline = async () => {
    try {
      const sidOf = (k) => k.slice(0, k.lastIndexOf('-'));
      const markSids = new Set(Object.keys(inlineMarkEdits).map(sidOf));
      const scoreSids = new Set(Object.keys(inlineScoreEdits));
      const allSids = new Set([...markSids, ...scoreSids]);
      if (allSids.size === 0) { alert('No unsaved changes.'); return; }
      if (!window.confirm(`Save changes for ${allSids.size} student(s)?`)) return;
      setSavingInline(true);
      const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);
      const allRecords = [];
      markSids.forEach((sid) => {
        const existing = {};
        allMarks.filter(m => m.student_id === sid).forEach(m => { existing[m.session_number] = m; });
        sessions.forEach(n => {
          const edit = inlineMarkEdits[`${sid}-${n}`] || {};
          const base = existing[n] || { attendance: false, hj_shirt: false, gratitude: false };
          const rec = {
            student_id: sid,
            session_number: n,
            attendance: edit.attendance != null ? edit.attendance : !!base.attendance,
            hj_shirt: edit.hj_shirt != null ? edit.hj_shirt : !!base.hj_shirt,
            gratitude: edit.gratitude != null ? edit.gratitude : !!base.gratitude,
            marked_by: 'admin',
            updated_at: new Date().toISOString()
          };
          if (rec.attendance || rec.hj_shirt || rec.gratitude) allRecords.push(rec);
        });
      });
      if (allRecords.length > 0) {
        const { error } = await supabase.from('attendance_marks').upsert(allRecords, { onConflict: 'student_id,session_number' });
        if (error) { alert('Failed to save marks: ' + error.message); setSavingInline(false); return; }
      }
      const scoreUpdates = [...scoreSids].map((sid) => {
        const se = inlineScoreEdits[sid] || {};
        const quizzes = (se.quizzes || []).map(v => v === '' || v == null ? null : Number(v)).filter(v => v != null && !isNaN(v));
        const services = (se.services || []).map(v => v === '' || v == null ? null : Math.min(100, Number(v))).filter(v => v != null && !isNaN(v));
        const avgPct = quizzes.length ? Math.round((quizzes.reduce((a, b) => a + b, 0) / quizzes.length) / 10 * 100 * 100) / 100 : 0;
        const svcPct = services.length ? Math.round(services.reduce((a, b) => a + b, 0) / services.length * 100) / 100 : 0;
        return supabase.from('students').update({
          quiz_scores: quizzes, service_scores: services,
          quiz1: quizzes[0] ?? null, quiz2: quizzes[1] ?? null, quiz3: quizzes[2] ?? null,
          quiz_score: avgPct, hj_quiz: avgPct,
          service_pct: services[0] ?? null, hj_service_pct: svcPct,
          service_week_score: Math.round(svcPct / 100 * 50 * 100) / 100
        }).eq('student_id', sid);
      });
      if (scoreUpdates.length > 0) await Promise.all(scoreUpdates);
      await recomputeAllGrades();
      await loadAllMarks();
      setInlineMarkEdits({});
      setInlineScoreEdits({});
      alert(`✅ Saved changes for ${allSids.size} student(s)!`);
    } catch (err) {
      console.error('Save all error:', err);
      alert('Failed to save all changes.');
    } finally {
      setSavingInline(false);
    }
  };

  // Build a printable HTML report for one student and open the print dialog."""
))

changes.append((
"""          className="w-full mb-4 py-3 bg-white text-purple-600 rounded-xl font-bold shadow">
          🖨️ Print All Students Report (PDF)
        </button>""",
"""          className="w-full mb-4 py-3 bg-white text-purple-600 rounded-xl font-bold shadow">
          🖨️ Print All Students Report (PDF)
        </button>
        {(Object.keys(inlineMarkEdits).length > 0 || Object.keys(inlineScoreEdits).length > 0) && (
          <button
            onClick={saveAllInline}
            disabled={savingInline}
            className="w-full mb-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold shadow">
            {savingInline ? 'Saving…' : `💾 Save ALL changes (${new Set([
              ...Object.keys(inlineMarkEdits).map(k => k.slice(0, k.lastIndexOf('-'))),
              ...Object.keys(inlineScoreEdits)
            ]).size} student(s))`}
          </button>
        )}"""
))

with open(path, "r", encoding="utf-8") as f:
    src = f.read()
for i, (old, new) in enumerate(changes, 1):
    n = src.count(old)
    if n != 1:
        print(f"ANCHOR FAIL #{i}: found {n} times (need 1). Aborting."); sys.exit(1)
shutil.copyfile(path, path + ".bak9")
for old, new in changes:
    src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print(f"OK: {path}: {len(changes)} change(s) applied (backup: .bak9)")
