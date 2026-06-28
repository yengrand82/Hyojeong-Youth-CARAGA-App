#!/usr/bin/env python3
import sys, shutil, os

APP = "src/App.jsx"
if not os.path.exists(APP):
    print("ERROR: src/App.jsx not found. Run from the hyojeong-app folder.")
    sys.exit(1)

with open(APP) as f:
    src = f.read()
orig = src
made = []

# ---- Part 1: add the report-builder function right after openPrintable ends. ----
# openPrintable ends with the line "  };" after win.document.close();
anchor_fn = """    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to open the report.'); return; }
    win.document.write(withPrint);
    win.document.close();
  };"""

report_fn = """    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to open the report.'); return; }
    win.document.write(withPrint);
    win.document.close();
  };

  // Build + open a printable per-session attendance report (present students only).
  const printSessionAttendance = (sessionNumber, presentList, meetingDate) => {
    // presentList is [{ id, name }] from the Zoom screen. Enrich with team from allStudents.
    const byId = {};
    (allStudents || []).forEach(s => { byId[(s['Student ID'] || '').toUpperCase()] = s; });
    const dateLabel = (() => {
      try {
        return new Date(meetingDate + 'T00:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) { return meetingDate || ''; }
    })();
    const rows = (presentList || []).map((p, i) => {
      const s = byId[(p.id || '').toUpperCase()] || {};
      return `<tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${p.name || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${p.id || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${s['TEAM'] || ''}</td>
      </tr>`;
    }).join('');
    const html = `<html><head><title>Session ${sessionNumber} Attendance</title></head>
      <body style="font-family:system-ui,sans-serif;padding:24px;color:#1F2937">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <img src="https://i.imgur.com/bhXEh9q.png" style="width:48px;height:48px;object-fit:contain" />
          <div>
            <h1 style="margin:0;font-size:22px;color:#1b2a4a">Hyojeong Youth Caraga</h1>
            <div style="font-size:14px;color:#6B7280">Session ${sessionNumber} Attendance &middot; ${dateLabel}</div>
          </div>
        </div>
        <p style="font-size:14px;margin:8px 0 16px"><strong>${(presentList || []).length}</strong> students present</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f3f4f6;text-align:left">
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">#</th>
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Name</th>
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Student ID</th>
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Team</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#9CA3AF">Generated ${new Date().toLocaleString()}</p>
      </body></html>`;
    openPrintable(html, `Session ${sessionNumber} Attendance`);
  };
"""

if "printSessionAttendance" in src:
    print("• printSessionAttendance already present — skipping Part 1.")
elif anchor_fn in src:
    src = src.replace(anchor_fn, report_fn, 1)
    made.append("Part 1: added printSessionAttendance function")
else:
    print("WARNING: could not find openPrintable end anchor for Part 1.")

# ---- Part 2: pass onReport into the ZoomAttendance render block. ----
anchor_prop = "        onSaved={recomputeAllGrades}\n      />"
replace_prop = "        onSaved={recomputeAllGrades}\n        onReport={printSessionAttendance}\n      />"
if "onReport={printSessionAttendance}" in src:
    print("• onReport already wired — skipping Part 2.")
elif anchor_prop in src:
    src = src.replace(anchor_prop, replace_prop, 1)
    made.append("Part 2: wired onReport prop")
else:
    print("WARNING: could not find onSaved anchor for Part 2.")

if not made:
    print("\nNo changes made.")
    sys.exit(0)

shutil.copy(APP, APP + ".backup3")
with open(APP, "w") as f:
    f.write(src)
print("\nBackup saved to src/App.jsx.backup3")
for m in made:
    print("  -", m)
print("Line count:", len(src.splitlines()), "(was", len(orig.splitlines()), ")")
