#!/usr/bin/env python3
"""Hotfix 2: Edit Info form only renders for the student it was opened for."""
import shutil, sys
path = "src/App.jsx"
changes = [
(
"""                      onClick={() => setStudentInfoEdit({
                        firstName: selectedStudentDetail['First Name'] || '',""",
"""                      onClick={() => setStudentInfoEdit({
                        _sid: selectedStudentDetail['Student ID'],
                        firstName: selectedStudentDetail['First Name'] || '',"""
),
(
"""                {studentInfoEdit && (""",
"""                {studentInfoEdit && studentInfoEdit._sid === selectedStudentDetail['Student ID'] && ("""
),
(
"""                  {!studentInfoEdit && (""",
"""                  {(!studentInfoEdit || studentInfoEdit._sid !== selectedStudentDetail['Student ID']) && ("""
),
]
with open(path, "r", encoding="utf-8") as f:
    src = f.read()
for i, (old, new) in enumerate(changes, 1):
    n = src.count(old)
    if n != 1:
        print(f"❌ anchor #{i} found {n} times (need 1). Aborting, nothing written."); sys.exit(1)
shutil.copyfile(path, path + ".bak3")
for old, new in changes:
    src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print("✅ src/App.jsx: 3 change(s) applied (backup: src/App.jsx.bak3)")
