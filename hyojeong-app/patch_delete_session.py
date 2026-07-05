#!/usr/bin/env python3
"""Whole-session delete in Attendance History. Backup: .bak5"""
import shutil, sys
path = "src/ZoomAttendance.jsx"
changes = []

changes.append((
"""  return (
    <div style={histStyles.wrap}>
      <div style={histStyles.headRow}>
        <h3 style={{ margin: 0, fontSize: 17 }}>Saved attendance</h3>""",
"""  async function deleteSession(sn, presentCount, guestCount) {
    const typed = window.prompt(
      `This will permanently delete ALL saved attendance for session ${sn} ` +
      `(${presentCount} present, ${guestCount} guest(s)) and recompute every grade.\\n\\n` +
      `Type the session number (${sn}) to confirm:`
    );
    if (typed === null) return;
    if (String(typed).trim() !== String(sn)) {
      window.alert("Session number didn't match — nothing was deleted.");
      return;
    }
    const key = "sess" + sn;
    setBusyKey(key);
    setErr("");
    try {
      const { error: aErr } = await supabase.from("attendance_marks").delete().eq("session_number", sn);
      if (aErr) throw aErr;
      const { error: gErr } = await supabase.from("guests").delete().eq("session_number", sn);
      if (gErr) throw gErr;
      setMarks((prev) => prev.filter((m) => m.session_number !== sn));
      setGuests((prev) => prev.filter((g) => g.session_number !== sn));
      setOpenSession(null);
      if (typeof onSaved === "function") { try { await onSaved(); } catch (e) { console.error(e); } }
    } catch (e) {
      setErr(e.message || "Failed to delete session.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div style={histStyles.wrap}>
      <div style={histStyles.headRow}>
        <h3 style={{ margin: 0, fontSize: 17 }}>Saved attendance</h3>"""
))

changes.append((
"""              {gl.map((g) => {
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
          )}""",
"""              {gl.map((g) => {
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
              <button
                style={histStyles.deleteSessionBtn}
                disabled={busyKey === "sess" + sn}
                onClick={() => deleteSession(sn, present.length, gl.length)}
              >
                {busyKey === "sess" + sn ? "Deleting…" : `🗑 Delete entire session ${sn} (attendance + guests)`}
              </button>
            </div>
          )}"""
))

changes.append((
"""  removeBtn: { padding: "4px 10px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#b3261e", border: "1px solid #e3b7b4", borderRadius: 8, cursor: "pointer" },
};""",
"""  removeBtn: { padding: "4px 10px", fontSize: 12, fontWeight: 600, background: "#fff", color: "#b3261e", border: "1px solid #e3b7b4", borderRadius: 8, cursor: "pointer" },
  deleteSessionBtn: { width: "100%", marginTop: 12, padding: "10px", fontSize: 13, fontWeight: 700, background: "#fdecec", color: "#b3261e", border: "1px solid #e3b7b4", borderRadius: 8, cursor: "pointer" },
};"""
))

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
