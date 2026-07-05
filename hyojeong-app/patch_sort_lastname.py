#!/usr/bin/env python3
"""Report present list: alphabetical by LAST name. Backup: .bak7"""
import shutil, sys
path = "src/App.jsx"
old = """      if (!dbErr && dbMarks && dbMarks.length > 0) {
        presentRows = dbMarks.map(m => {
          const s = byId[(m.student_id || '').toUpperCase()] || {};
          const nm = `${s['First Name'] || ''} ${s['Last Name'] || ''}`.trim();
          return { id: m.student_id, name: nm || '(unknown)', shirt: !!m.hj_shirt };
        }).sort((a, b) => a.name.localeCompare(b.name));
      }"""
new = """      if (!dbErr && dbMarks && dbMarks.length > 0) {
        presentRows = dbMarks.map(m => {
          const s = byId[(m.student_id || '').toUpperCase()] || {};
          const nm = `${s['First Name'] || ''} ${s['Last Name'] || ''}`.trim();
          return { id: m.student_id, name: nm || '(unknown)', last: (s['Last Name'] || '').toLowerCase(), first: (s['First Name'] || '').toLowerCase(), shirt: !!m.hj_shirt };
        }).sort((a, b) => a.last.localeCompare(b.last) || a.first.localeCompare(b.first));
      }"""
with open(path, "r", encoding="utf-8") as f:
    src = f.read()
n = src.count(old)
if n != 1:
    print(f"ANCHOR FAIL: found {n} times (need 1). Aborting."); sys.exit(1)
shutil.copyfile(path, path + ".bak7")
src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print("OK: src/App.jsx: 1 change applied (backup: .bak7)")
