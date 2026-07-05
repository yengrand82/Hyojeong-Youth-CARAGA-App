#!/usr/bin/env python3
"""Report button with options inside Saved attendance; names as 'Last, First'. Backups: .bak8"""
import shutil, sys

def apply(path, changes, bak):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    for i, (old, new) in enumerate(changes, 1):
        n = src.count(old)
        if n != 1:
            print(f"ANCHOR FAIL {path} #{i}: found {n} times (need 1). Aborting."); sys.exit(1)
    shutil.copyfile(path, path + bak)
    for old, new in changes:
        src = src.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"OK: {path}: {len(changes)} change(s) applied")

app = [(
"""          const nm = `${s['First Name'] || ''} ${s['Last Name'] || ''}`.trim();
          return { id: m.student_id, name: nm || '(unknown)', last: (s['Last Name'] || '').toLowerCase(), first: (s['First Name'] || '').toLowerCase(), shirt: !!m.hj_shirt };""",
"""          const nm = [s['Last Name'], s['First Name']].filter(Boolean).join(', ');
          return { id: m.student_id, name: nm || '(unknown)', last: (s['Last Name'] || '').toLowerCase(), first: (s['First Name'] || '').toLowerCase(), shirt: !!m.hj_shirt };"""
)]
apply("src/App.jsx", app, ".bak8")

zoom = []

zoom.append((
"""      {showHistory && (
        <AttendanceHistory students={students} onSaved={onSaved} />
      )}""",
"""      {showHistory && (
        <AttendanceHistory students={students} onSaved={onSaved} onReport={onReport} />
      )}"""
))

zoom.append((
"""function AttendanceHistory({ students, onSaved }) {""",
"""function AttendanceHistory({ students, onSaved, onReport }) {"""
))
zoom.append((
"""  const [busyKey, setBusyKey] = useState(null);

  const nameById = useMemo(() => {""",
"""  const [busyKey, setBusyKey] = useState(null);
  const [hOpts, setHOpts] = useState({});

  const nameById = useMemo(() => {"""
))

zoom.append((
"""              <button
                style={histStyles.deleteSessionBtn}
                disabled={busyKey === "sess" + sn}
                onClick={() => deleteSession(sn, present.length, gl.length)}
              >""",
"""              {typeof onReport === "function" && (
                <div style={{ marginTop: 12, padding: "10px", background: "#fff", border: "1px solid #e6e9f0", borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Include in report:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13, marginBottom: 8 }}>
                    {[["age", "Age"], ["dob", "Date of birth"], ["address", "Address"], ["contact", "Contact"], ["goals", "Goals"], ["affirmation", "Affirmation"], ["gratitude", "Gratitude (this session)"]].map(([k, lbl]) => (
                      <label key={k} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={!!hOpts[k]}
                          onChange={(e) => setHOpts((p) => ({ ...p, [k]: e.target.checked }))}
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>
                  <button
                    style={{ ...styles.reportBtn, width: "100%" }}
                    onClick={() => onReport(sn, [], null, hOpts)}
                  >
                    📄 Download session {sn} report
                  </button>
                </div>
              )}
              <button
                style={histStyles.deleteSessionBtn}
                disabled={busyKey === "sess" + sn}
                onClick={() => deleteSession(sn, present.length, gl.length)}
              >"""
))

apply("src/ZoomAttendance.jsx", zoom, ".bak8")
