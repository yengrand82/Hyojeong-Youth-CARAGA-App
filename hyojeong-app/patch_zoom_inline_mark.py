#!/usr/bin/env python3
"""Inline Mark-Present for Needs Review + Guests. Backup: .bak3"""
import shutil, sys

path = "src/ZoomAttendance.jsx"
changes = []

changes.append((
"""  const [error, setError] = useState("");
  const fileRef = useRef(null);""",
"""  const [error, setError] = useState("");
  const [extraMarked, setExtraMarked] = useState({}); // rowKey -> { id, name }
  const [markingKey, setMarkingKey] = useState(null);
  const fileRef = useRef(null);"""
))

changes.append((
"""  async function handleConfirm() {""",
"""  function candidatesFor(line) {
    const toks = new Set(nameTokensLower(line));
    if (toks.size === 0) return [];
    const hits = [];
    for (const { s, first, last } of tokenIndex) {
      if (first.some((t) => toks.has(t)) && last.some((t) => toks.has(t))) hits.push(s);
    }
    if (hits.length === 0) {
      for (const { s, first, last } of tokenIndex) {
        if (first.some((t) => toks.has(t)) || last.some((t) => toks.has(t))) hits.push(s);
        if (hits.length >= 6) break;
      }
    }
    return hits.slice(0, 6);
  }

  async function markPresentInline(rowKey, stu) {
    setError("");
    const sn = parseInt(sessionNumber, 10);
    if (Number.isNaN(sn) || sn < 1) {
      setError("Enter a valid session number (1 or higher) before marking.");
      return;
    }
    setMarkingKey(rowKey);
    try {
      const { error: mErr } = await supabase
        .from("attendance_marks")
        .upsert(
          [{ student_id: stu.student_id.toUpperCase(), session_number: sn, attendance: true, marked_by: "zoom-manual" }],
          { onConflict: "student_id,session_number" }
        );
      if (mErr) throw mErr;
      if (typeof onSaved === "function") {
        try { await onSaved(); } catch (e) { console.error("Grade recompute failed:", e); }
      }
      setExtraMarked((prev) => ({
        ...prev,
        [rowKey]: { id: stu.student_id.toUpperCase(), name: `${stu.first_name || ""} ${stu.last_name || ""}`.trim() },
      }));
    } catch (err) {
      setError(err.message || "Failed to mark present.");
    } finally {
      setMarkingKey(null);
    }
  }

  async function handleConfirm() {"""
))

changes.append((
"""      let guestsSaved = 0;
      if (parsed.guests.length > 0) {
        const guestRows = parsed.guests.map((g) => ({""",
"""      let guestsSaved = 0;
      const guestsToSave = parsed.guests.filter((g) => !extraMarked["G:" + g.display_name]);
      if (guestsToSave.length > 0) {
        const guestRows = guestsToSave.map((g) => ({"""
))

changes.append((
"""  function reset() {
    setRawChat("");
    setParsed(null);
    setResult(null);
    setError("");""",
"""  function reset() {
    setRawChat("");
    setParsed(null);
    setResult(null);
    setError("");
    setExtraMarked({});"""
))

changes.append((
"""          <Section
            color="#9a6b00"
            bg="#fdf3da"
            title={`Needs review (${parsed.unknown.length})`}
            empty="Nothing to review."
            hint="Unmatched IDs or names matching more than one student — handle these manually."
            items={parsed.unknown.map((u) => (u.id && u.id !== "(name)" ? `${u.id} — ${u.name}` : u.name))}
          />""",
"""          <AssignSection
            color="#9a6b00"
            bg="#fdf3da"
            title={`Needs review (${parsed.unknown.length})`}
            empty="Nothing to review."
            hint="Tap the right student to mark them present, or search below each entry."
            rows={parsed.unknown.map((u, i) => {
              const isId = u.id && u.id !== "(name)";
              const label = isId ? `${u.id} — ${u.name}` : u.name;
              const line = isId ? "" : String(u.name).replace(/ — matches more than one student$/, "");
              return { key: "U:" + i + ":" + label, label, candidates: line ? candidatesFor(line) : [] };
            })}
            students={students}
            marked={extraMarked}
            markingKey={markingKey}
            onMark={markPresentInline}
          />""",
))

changes.append((
"""          <Section
            color="#1f3a93"
            bg="#e9eefc"
            title={`Guests (${parsed.guests.length})`}
            empty="No guests detected."
            items={parsed.guests.map((g) => g.display_name)}
          />""",
"""          <AssignSection
            color="#1f3a93"
            bg="#e9eefc"
            title={`Guests (${parsed.guests.length})`}
            empty="No guests detected."
            hint="If a guest is actually a student, tap their name to mark them present (they won't be saved as a guest)."
            rows={parsed.guests.map((g) => ({
              key: "G:" + g.display_name,
              label: g.display_name,
              candidates: candidatesFor(g.display_name),
            }))}
            students={students}
            marked={extraMarked}
            markingKey={markingKey}
            onMark={markPresentInline}
          />""",
))

changes.append((
"""const NAVY = "#1b2a4a";""",
"""function AssignSection({ title, rows, empty, hint, color, bg, students, marked, markingKey, onMark }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...sectionStyles.head, color }}>{title}</div>
      {hint && <div style={sectionStyles.hint}>{hint}</div>}
      {rows.length === 0 ? (
        <div style={sectionStyles.empty}>{empty}</div>
      ) : (
        <div style={{ background: bg, borderRadius: 8, padding: 8 }}>
          {rows.map((r) => (
            <AssignRow key={r.key} row={r} students={students} marked={marked[r.key]} busy={markingKey === r.key} onMark={onMark} />
          ))}
        </div>
      )}
    </div>
  );
}

function AssignRow({ row, students, marked, busy, onMark }) {
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const searchHits = ql.length >= 2
    ? students
        .filter((s) => (`${s.student_id} ${s.first_name || ""} ${s.last_name || ""} ${s.nickname || ""}`).toLowerCase().includes(ql))
        .slice(0, 5)
    : [];
  return (
    <div style={assignStyles.row}>
      <div style={assignStyles.label}>{row.label}</div>
      {marked ? (
        <div style={assignStyles.done}>✓ Marked present — {marked.name} ({marked.id})</div>
      ) : (
        <div style={assignStyles.controls}>
          {row.candidates.map((s) => (
            <button key={s.student_id} style={assignStyles.candBtn} disabled={busy} onClick={() => onMark(row.key, s)}>
              ✓ {(s.first_name || "")} {(s.last_name || "")} ({s.student_id})
            </button>
          ))}
          <input
            style={assignStyles.search}
            placeholder="Search student…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {searchHits.map((s) => (
            <button key={"s" + s.student_id} style={assignStyles.candBtn} disabled={busy} onClick={() => onMark(row.key, s)}>
              ✓ {(s.first_name || "")} {(s.last_name || "")} ({s.student_id})
            </button>
          ))}
          {busy && <span style={assignStyles.busy}>saving…</span>}
        </div>
      )}
    </div>
  );
}

const assignStyles = {
  row: { padding: "8px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)" },
  label: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
  controls: { display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" },
  candBtn: { padding: "6px 10px", fontSize: 13, fontWeight: 600, background: "#fff", color: "#1b2a4a", border: "1px solid #1b2a4a", borderRadius: 8, cursor: "pointer" },
  search: { padding: "6px 10px", fontSize: 13, border: "1px solid #cdd3df", borderRadius: 8, minWidth: 140 },
  done: { fontSize: 13, fontWeight: 700, color: "#2e7d4f" },
  busy: { fontSize: 12, color: "#5a6478" },
};

const NAVY = "#1b2a4a";"""
))

with open(path, "r", encoding="utf-8") as f:
    src = f.read()
for i, (old, new) in enumerate(changes, 1):
    n = src.count(old)
    if n != 1:
        print(f"ANCHOR FAIL #{i}: found {n} times (need 1). Aborting, nothing written.")
        sys.exit(1)
shutil.copyfile(path, path + ".bak3")
for old, new in changes:
    src = src.replace(old, new)
with open(path, "w", encoding="utf-8") as f:
    f.write(src)
print(f"OK: {path}: {len(changes)} change(s) applied (backup: {path}.bak3)")
