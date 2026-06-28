#!/usr/bin/env python3
import sys, shutil, os

APP = "src/App.jsx"
if not os.path.exists(APP):
    print("ERROR: src/App.jsx not found. Run from the hyojeong-app folder.")
    sys.exit(1)

with open(APP) as f:
    src = f.read()
orig = src

# Add onSaved={recomputeAllGrades} to the ZoomAttendance render block.
anchor = """      <ZoomAttendance
        students={allStudents.map(s => ({
          student_id: s['Student ID'],
          first_name: s['First Name'],
          last_name: s['Last Name'],
        }))}
        onClose={() => setCurrentPage('admin-dashboard')}
      />"""

replacement = """      <ZoomAttendance
        students={allStudents.map(s => ({
          student_id: s['Student ID'],
          first_name: s['First Name'],
          last_name: s['Last Name'],
        }))}
        onClose={() => setCurrentPage('admin-dashboard')}
        onSaved={recomputeAllGrades}
      />"""

if "onSaved={recomputeAllGrades}" in src:
    print("• onSaved already wired — nothing to do.")
    sys.exit(0)
elif anchor in src:
    src = src.replace(anchor, replacement, 1)
    shutil.copy(APP, APP + ".backup2")
    with open(APP, "w") as f:
        f.write(src)
    print("Backup saved to src/App.jsx.backup2")
    print("Added onSaved={recomputeAllGrades} to the ZoomAttendance render block.")
    print("Line count:", len(src.splitlines()), "(was", len(orig.splitlines()), ")")
else:
    print("WARNING: could not find the ZoomAttendance render block to patch.")
    print("It may have different whitespace. Paste me the block and I'll adjust.")
    sys.exit(1)
