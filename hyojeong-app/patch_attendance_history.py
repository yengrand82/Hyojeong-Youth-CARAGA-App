#!/usr/bin/env python3
"""Attendance History viewer/editor inside ZoomAttendance. Backup: .bak4"""
import shutil, sys
path = "src/ZoomAttendance.jsx"
changes = []

changes.append((
"""  const [markingKey, setMarkingKey] = useState(null);
  const fileRef = useRef(null);""",
"""  const [markingKey, setMarkingKey] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const fileRef = useRef(null);"""
))

changes.append((
"""        {onClose && (
          <button style={styles.ghostBtn} onClick={onClose}>Close</button>
        )}
      </div>""",
"""        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.ghostBtn} onClick={() => setShowHistory((v) => !v)}>
            {showHistory ? "Back to marking" : "📋 Saved attendance"}
          </button>
          {onClose && (
            <button style={styles.ghostBtn} onClick={onClose}>Close</button>
          )}
        </div>
      </div>

      {showHistory && (
        <AttendanceHistory students={students} onSaved={onSaved} />
      )}"""
))

changes.append((
"""      {/* Session number + meeting date */}""",
"""      {!showHistory && (<>
      {/* Session number + meeting date */}"""
))

changes.append((
"""      {/* Result */}
      {result && (""",
"""      </>)}

      {/* Result */}
      {!showHistory && result && ("""
))

changes.append((
"""function AssignSection({ title, rows, empty, hint, color, bg, students, marked, markingKey, onMark }) {""",
"""function AttendanceHistory({ students, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [marks, setMarks] = useState([]);
  const [guests, setGuests] = useState([]);
  const [openSession, setOpenSession] = useState(null);
  const [busyKey, setBusyKey] = useState(null);

  const nameById = useMemo(() => {
    const m = {};
    (students || []).forEach((s) => {
      m[(s.student_id || "").toUpperCase()] = `${s.first_name || ""} ${s.last_name || ""}`.trim();
    });
    return m;
  }, [students]);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const { data: mData, error: mErr } = await supabase
        .from("attendance_marks")
        .select("student_id, session_number, attendance, hj_shirt, marked_by")
        .eq("attendance", true)
        .order("session_number", { ascending: true });
      if (mErr) throw mErr;
      const { data: gData, error: gErr } = await supabase
        .from("guests")
        .select("id, display_name, session_number, meeting_date")
        .order("session_number", { ascending: true });
      if (gErr) throw gErr;
      setMarks(mData || []);
      setGuests(gData || []);
    } catch (e) {
      setErr(e.message || "Failed to load attendance history.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  const sessions = useMemo(() => {
    const map = {};
    marks.forEach((m) => {
      map[m.session_number] = map[m.session_number] || { present: [], guests: [] };
      map[m.session_number].present.push(m);
    });
    guests.forEach((g) => {
      map[g.session_number] = map[g.session_number] || { present: [], guests: [] };
      map[g.session_number].guests.push(g);
    });
    return Object.keys(map).map(Number).sort((a, b) => a - b).map((sn) => ({ sn, ...map[sn] }));
  }, [marks, guests]);

  async function removeMark(m) {
    const nm = nameById[(m.student_id || "").toUpperCase()] || m.student_id;
    if (!window.confirm(`Remove ${nm} (${m.student_id}) from session ${m.session_number}? Their grade will be recomputed.`)) return;
    const key = "m" + m.student_id + ":" + m.session_number;
    setBusyKey(key);
    try {
      const { error: dErr } = await supabase
        .from("attendance_marks")
        .delete()
        .eq("student_id", m.student_id)
        .eq("session_number", m.session_number);
      if (dErr) throw dErr;
      setMarks((prev) => prev.filter((x) => !(x.student_id === m.student_id && x.session_number === m.session_number)));
      if (typeof onSaved === "function") { try { await onSaved(); } catch (e) { console.error(e); } }
    } catch (e) {
      setErr(e.message || "Failed to remove.");
    } finally {
      setBusyKey(null);
    }
  }

  async function removeGuest(g) {
    if (!window.confirm(`Delete guest "${g.display_name}" from session ${g.session_number}?`)) return;
    const key = "g" + g.id;
    setBusyKey(key);
    try {
      const { error: dErr } = await supabase.from("guests").delete().eq("id", g.id);
      if (dErr) throw dErr;
      setGuests((prev) => prev.filter((x) => x.id !== g.id));
    } catch (e) {
      setErr(e.message || "Failed to delete guest.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div style={histStyles.wrap}>
      <div style={histStyles.headRow}>
        <h3 style={{ margin: 0, fontSize: 17 }}>Saved attendance</h3>
        <button style={styles.ghostBtn} onClick={load} disabled={loading}>{loading ? "Loading…" : "↻ Refresh"}</button>
      </div>
      {err && <div style={styles.error}>{err}</div>}
      {!loading && sessions.length === 0 && (
        <p style={{ fontSize: 14, color: "#5a6478" }}>No attendance saved yet.</p>
      )}
      {sessions.map(({ sn, present, guests: gl }) => (
        <div key={sn} style={histStyles.sessionCard}>
          <button style={histStyles.sessionHead} onClick={() => setOpenSession(openSession === sn ? null : sn)}>
            <span style={{ fontWeight: 700 }}>Session {sn}</span>
            <span style={{ fontSize: 13, color: "#5a6478" }}>
              {present.length} present · {gl.length} guest(s) {openSession === sn ? "▲" : "▼"}
            </span>
          </button>
          {openSession === sn && (
            <div style={{ padding: "4px 10px 10px" }}>
              {present
                .slice()
                .sort((a, b) => (nameById[a.student_id?.toUpperCase()] || "").localeCompare(nameById[b.student_id?.toUpperCase()] || ""))
                .map((m) => {
                  const key = "m" + m.student_id + ":" + m.session_number;
                  return (
                    <div key={key} style={histStyles.row}>
                      <span style={{ flex: 1, fontSize: 14 }}>
                        {nameById[(m.student_id || "").toUpperCase()] || "(unknown)"} <span style={{ color: "#8a93a5" }}>({m.student_id})</span>
                        {m.hj_shirt ? " 👕" : ""}
                        <span style={histStyles.tag}>{m.marked_by || "?"}</span>
                      </span>
                      <button style={histStyles.removeBtn} disabled={busyKey === key} onClick={() => removeMark(m)}>
                        {busyKey === key ? "…" : "✕ Remove"}
                      </button>
                    </div>
                  );
                })}
              {gl.length > 0 && <div style={{ ...sectionStyles.head, color: "#1f3a93", marginTop: 10 }}>Guests</div>}
              {gl.map((g) => {
                const key = "g" + g.id;
                return (
                  <div key={key} style={histStyles.row}>
                    <span style={{ flex: 1, fontSize: 14 }}>{g.display_name}</span>
                    <button style={histStyles.removeBtn} disabled={busyKey === key} onClick={() => removeGuest(g)}>
                      {busyKey === key ? "…" : "✕ Delete"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const histStyles = {
  wrap: { marginTop: 8, marginBottom: 16 },
  headRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sessionCard: { border: "1px solid #e6e9f0", borderRadius: 10, marginBottom: 8, background: "#fafbfd" },
  sessionHead: { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer", fontSize: 15 },
  row: { display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" },
  tag: { marginLeft: 6, fontSize: 11, background: "#eef1f6", color: "#5a6478", borderRadius: 6, padding: "1px 6px" },
  removeBtn: { padding: "4px 10px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#b3261e", border: "1px solid #e3b7b4", borderRadius: 8, cursor: "pointer" },
};

function AssignSection({ title, rows, empty, hint, color, bg, students, marked, markingKey, onMark }) {"""
))

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
