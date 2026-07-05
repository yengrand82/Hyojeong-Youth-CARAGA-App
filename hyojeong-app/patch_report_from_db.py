#!/usr/bin/env python3
"""Session report: present list from attendance_marks (DB truth). Backup: .bak5"""
import shutil, sys
path = "src/App.jsx"
changes = [
(
"""    const rows = (presentList || []).map((p, i) => {
      const s = byId[(p.id || '').toUpperCase()] || {};
      return `<tr>""",
"""    // Pull the present list from the database (includes inline/manual marks),
    // falling back to the parse-time list if the query fails.
    let presentRows = (presentList || []).map(p => ({ id: p.id, name: p.name, shirt: !!p.shirt }));
    try {
      const { data: dbMarks, error: dbErr } = await supabase
        .from('attendance_marks')
        .select('student_id, hj_shirt')
        .eq('session_number', sessionNumber)
        .eq('attendance', true);
      if (!dbErr && dbMarks && dbMarks.length > 0) {
        presentRows = dbMarks.map(m => {
          const s = byId[(m.student_id || '').toUpperCase()] || {};
          const nm = `${s['First Name'] || ''} ${s['Last Name'] || ''}`.trim();
          return { id: m.student_id, name: nm || '(unknown)', shirt: !!m.hj_shirt };
        }).sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (e) { console.error('Present fetch for report failed:', e); }
    const rows = (presentRows || []).map((p, i) => {
      const s = byId[(p.id || '').toUpperCase()] || {};
      return `<tr>"""
),
(
"""        <p style="font-size:14px;margin:8px 0 16px"><strong>${(presentList || []).length}</strong> students present</p>""",
"""        <p style="font-size:14px;margin:8px 0 16px"><strong>${(presentRows || []).length}</strong> students present</p>"""
),
]
with open(path, "r", encoding="utf-8") as f:
    src = f.read()
for i, (old, new) in enumerate(changes, 1):
    n = src.count(old)
    if n != 1:
        print(f"ANCHOR FAIL #{i}: found {n} times (need 1). Aborting."); sys.exit(1)
shutil.copyfile(path, path + ".bak5")
for old, new in changes:
    src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print(f"OK: {path}: {len(changes)} change(s) applied (backup: {path}.bak5)")
