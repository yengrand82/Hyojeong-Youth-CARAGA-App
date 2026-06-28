#!/usr/bin/env python3
import sys, shutil, os

APP = "src/App.jsx"
if not os.path.exists(APP):
    print("ERROR: src/App.jsx not found. Run this from your project root (the hyojeong-app folder).")
    sys.exit(1)

with open(APP, "r") as f:
    src = f.read()

orig = src
changes = []

# ---- Edit A: add import after the supabaseClient import ----
anchor_a = "import { supabase } from './supabaseClient';"
import_line = "import ZoomAttendance from './ZoomAttendance';"
if import_line in src:
    print("• Import already present — skipping Edit A.")
elif anchor_a in src:
    src = src.replace(anchor_a, anchor_a + "\n" + import_line, 1)
    changes.append("A: added ZoomAttendance import")
else:
    print("WARNING: could not find supabaseClient import anchor for Edit A.")

# ---- Edit B: add render block before the admin-dashboard block ----
anchor_b = "  if (currentPage === 'admin-dashboard' && isAdmin) return ("
block_b = """  if (currentPage === 'zoom-attendance' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <ZoomAttendance
        students={allStudents.map(s => ({
          student_id: s['Student ID'],
          first_name: s['First Name'],
          last_name: s['Last Name'],
        }))}
        onClose={() => setCurrentPage('admin-dashboard')}
      />
    </div>
  );

"""
if "currentPage === 'zoom-attendance'" in src:
    print("• Render block already present — skipping Edit B.")
elif anchor_b in src:
    src = src.replace(anchor_b, block_b + anchor_b, 1)
    changes.append("B: added zoom-attendance render block")
else:
    print("WARNING: could not find admin-dashboard anchor for Edit B.")

# ---- Edit C: add a dashboard button after the "View All Students" button ----
# Anchor on the full View All Students button block and append our button after its closing </button>
anchor_c = """          <button onClick={() => { loadAllMarks(); setCurrentPage('admin-students'); }} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <span className="font-bold">View All Students</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>"""
button_c = """
          <button onClick={() => setCurrentPage('zoom-attendance')} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <span className="font-bold">Zoom Attendance</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>"""
if "setCurrentPage('zoom-attendance')" in src and "Zoom Attendance" in src:
    # could already be added by button; check specifically
    if button_c.strip() in src:
        print("• Dashboard button already present — skipping Edit C.")
    elif anchor_c in src:
        src = src.replace(anchor_c, anchor_c + button_c, 1)
        changes.append("C: added Zoom Attendance dashboard button")
    else:
        print("WARNING: could not find 'View All Students' button anchor for Edit C.")
elif anchor_c in src:
    src = src.replace(anchor_c, anchor_c + button_c, 1)
    changes.append("C: added Zoom Attendance dashboard button")
else:
    print("WARNING: could not find 'View All Students' button anchor for Edit C (whitespace mismatch?).")

if not changes:
    print("\nNo changes made.")
    sys.exit(0)

# Backup then write
shutil.copy(APP, APP + ".backup")
with open(APP, "w") as f:
    f.write(src)

print("\nBackup saved to src/App.jsx.backup")
print("Applied edits:")
for c in changes:
    print("  -", c)
print("\nLine count:", len(src.splitlines()), "(was", len(orig.splitlines()), ")")
