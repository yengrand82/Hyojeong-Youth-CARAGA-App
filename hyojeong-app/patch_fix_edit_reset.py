#!/usr/bin/env python3
"""Hotfix: reset Edit Info form state when the student modal closes."""
import shutil, sys
path = "src/App.jsx"
old = "onClick={() => { setSelectedStudentDetail(null); setSelectedStudentProgress(null); }}"
new = "onClick={() => { setSelectedStudentDetail(null); setSelectedStudentProgress(null); setStudentInfoEdit(null); }}"
with open(path, "r", encoding="utf-8") as f:
    src = f.read()
n = src.count(old)
if n < 1:
    print(f"❌ anchor found {n} times — aborting, nothing written."); sys.exit(1)
shutil.copyfile(path, path + ".bak2")
src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print(f"✅ {path}: reset added to {n} close handler(s) (backup: {path}.bak2)")
