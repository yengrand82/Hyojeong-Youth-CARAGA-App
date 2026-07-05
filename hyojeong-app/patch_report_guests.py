#!/usr/bin/env python3
"""Add a Guests section to the per-session attendance report. Backup: .bak4"""
import shutil, sys
path = "src/App.jsx"
changes = [
(
"""  const printSessionAttendance = (sessionNumber, presentList, meetingDate) => {""",
"""  const printSessionAttendance = async (sessionNumber, presentList, meetingDate) => {"""
),
(
"""    }).join('');
    const html = `<html><head><title>Session ${sessionNumber} Attendance</title></head>""",
"""    }).join('');
    // Guests for this session, straight from the guests table (reflects any admin cleanup).
    let guestsHtml = '';
    try {
      const { data: guestRows, error: gErr } = await supabase
        .from('guests')
        .select('display_name')
        .eq('session_number', sessionNumber)
        .order('display_name');
      if (!gErr && guestRows && guestRows.length > 0) {
        const gRows = guestRows.map((g, i) => `<tr>
          <td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td>
          <td style="padding:6px;border-bottom:1px solid #eee">${g.display_name || ''}</td>
        </tr>`).join('');
        guestsHtml = `
        <h2 style="margin:28px 0 4px;font-size:17px;color:#1b2a4a">Guests</h2>
        <p style="font-size:14px;margin:4px 0 12px"><strong>${guestRows.length}</strong> guest(s) joined this session</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f3f4f6;text-align:left">
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">#</th>
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Name / info as typed</th>
            </tr>
          </thead>
          <tbody>${gRows}</tbody>
        </table>`;
      }
    } catch (e) { console.error('Guest fetch for report failed:', e); }
    const html = `<html><head><title>Session ${sessionNumber} Attendance</title></head>"""
),
(
"""        </table>
        <p style="margin-top:24px;font-size:12px;color:#9CA3AF">Generated ${new Date().toLocaleString()}</p>
      </body></html>`;
    openPrintable(html, `Session ${sessionNumber} Attendance`);""",
"""        </table>
        ${guestsHtml}
        <p style="margin-top:24px;font-size:12px;color:#9CA3AF">Generated ${new Date().toLocaleString()}</p>
      </body></html>`;
    openPrintable(html, `Session ${sessionNumber} Attendance`);"""
),
]
with open(path, "r", encoding="utf-8") as f:
    src = f.read()
for i, (old, new) in enumerate(changes, 1):
    n = src.count(old)
    if n != 1:
        print(f"ANCHOR FAIL #{i}: found {n} times (need 1). Aborting."); sys.exit(1)
shutil.copyfile(path, path + ".bak4")
for old, new in changes:
    src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print(f"OK: {path}: {len(changes)} change(s) applied (backup: {path}.bak4)")
