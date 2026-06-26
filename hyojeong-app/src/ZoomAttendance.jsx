import React, { useState, useRef, useMemo } from "react";
import { supabase } from "./supabaseClient"; // <-- adjust path if your client lives elsewhere

/**
 * ZoomAttendance
 * --------------
 * Paste or upload a Zoom chat export. Students write their Student ID (e.g. HJ019)
 * in the chat. This screen parses the chat, marks matched students present for a
 * chosen session, flags unknown/typo IDs for review, and logs everyone else as a guest.
 *
 * Writes attended students -> attendance_marks (UPSERT on student_id + session_number)
 * Writes guests            -> guests
 *
 * Requires the SQL migration (guests table + unique constraint) to be run first.
 */

const ID_REGEX = /HJ\s*-?\s*0*(\d{1,4})/i; // tolerant: HJ019, hj 19, HJ-019, HJ19

// Normalise any matched ID to canonical form HJ### (zero-padded to 3 digits)
function canonicalId(rawDigits) {
  const n = parseInt(rawDigits, 10);
  if (Number.isNaN(n)) return null;
  return "HJ" + String(n).padStart(3, "0");
}

// Pull the Zoom display name + message text out of a chat line.
// Zoom export lines look like:  09:14:03 From Unice Kiera to Everyone: HJ019
// Some exports drop the timestamp or use "From X:" — we handle both.
function parseLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Try full format: [time] From NAME to Everyone: MESSAGE
  let m = trimmed.match(/From\s+(.*?)\s+to\s+.*?:\s*(.*)$/i);
  if (m) return { name: m[1].trim(), text: m[2].trim() };

  // Fallback: From NAME: MESSAGE
  m = trimmed.match(/From\s+(.*?):\s*(.*)$/i);
  if (m) return { name: m[1].trim(), text: m[2].trim() };

  // Fallback: NAME: MESSAGE  (no "From")
  m = trimmed.match(/^(.*?):\s*(.*)$/);
  if (m && m[2]) return { name: m[1].trim(), text: m[2].trim() };

  // Last resort: a bare line (maybe just an ID typed alone)
  return { name: "", text: trimmed };
}

export default function ZoomAttendance({ students = [], onClose, onSaved, onReport }) {
  const [rawChat, setRawChat] = useState("");
  const [sessionNumber, setSessionNumber] = useState("");
  const [meetingDate, setMeetingDate] = useState(() => {
    const d = new Date();
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10); // YYYY-MM-DD, local
  });
  const [parsed, setParsed] = useState(null); // { matched, unknown, guests }
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  // Build a fast lookup of valid IDs -> student record
  const roster = useMemo(() => {
    const map = new Map();
    students.forEach((s) => map.set(s.student_id.toUpperCase(), s));
    return map;
  }, [students]);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setRawChat(String(reader.result || ""));
    reader.readAsText(file);
  }

  function handleParse() {
    setError("");
    setResult(null);
    if (!rawChat.trim()) {
      setError("Paste the Zoom chat or upload the .txt file first.");
      return;
    }

    const lines = rawChat.split(/\r?\n/);
    const matched = new Map(); // canonicalId -> { id, name }
    const unknown = new Map(); // canonicalId -> zoom name (looks like an ID but not in roster)
    const guests = new Map(); // displayName -> true

    for (const line of lines) {
      const p = parseLine(line);
      if (!p) continue;

      const idMatch = p.text.match(ID_REGEX);
      if (idMatch) {
        const canon = canonicalId(idMatch[1]);
        if (!canon) continue;
        if (roster.has(canon)) {
          const stu = roster.get(canon);
          matched.set(canon, {
            id: canon,
            name: `${stu.first_name || ""} ${stu.last_name || ""}`.trim(),
          });
        } else {
          unknown.set(canon, p.name || "(unknown)");
        }
      } else {
        // No ID in this line -> treat the Zoom display name as a guest
        const guestName = p.name || p.text;
        if (guestName) guests.set(guestName, true);
      }
    }

    setParsed({
      matched: [...matched.values()],
      unknown: [...unknown.entries()].map(([id, name]) => ({ id, name })),
      guests: [...guests.keys()].map((display_name) => ({ display_name })),
    });
  }

  async function handleConfirm() {
    setError("");
    const sn = parseInt(sessionNumber, 10);
    if (Number.isNaN(sn) || sn < 1) {
      setError("Enter a valid session number (1 or higher).");
      return;
    }
    if (!parsed || parsed.matched.length === 0) {
      setError("No matched students to save. Parse the chat first.");
      return;
    }

    setSaving(true);
    try {
      // 1) Upsert attendance for matched students.
      //    onConflict relies on the unique (student_id, session_number) constraint.
      const rows = parsed.matched.map((m) => ({
        student_id: m.id,
        session_number: sn,
        attendance: true,
        marked_by: "zoom",
      }));

      const { error: attErr } = await supabase
        .from("attendance_marks")
        .upsert(rows, { onConflict: "student_id,session_number" });
      if (attErr) throw attErr;

      // 2) Save guests (if any). Ignore duplicates via upsert on (display_name, session_number).
      let guestsSaved = 0;
      if (parsed.guests.length > 0) {
        const guestRows = parsed.guests.map((g) => ({
          display_name: g.display_name,
          session_number: sn,
          meeting_date: meetingDate,
        }));
        const { error: gErr } = await supabase
          .from("guests")
          .upsert(guestRows, { onConflict: "display_name,session_number" });
        if (gErr) throw gErr;
        guestsSaved = guestRows.length;
      }

      // Recompute grades using the app's own grade function (passed in as onSaved).
      let gradesUpdated = false;
      if (typeof onSaved === "function") {
        try {
          await onSaved();
          gradesUpdated = true;
        } catch (gradeErr) {
          // Attendance is already saved; surface a soft warning but don't fail the whole save.
          console.error("Grade recompute failed:", gradeErr);
        }
      }

      setResult({
        present: parsed.matched.length,
        guests: guestsSaved,
        unknown: parsed.unknown.length,
        session: sn,
        gradesUpdated,
        presentList: parsed.matched, // [{ id, name }]
        date: meetingDate,
      });
    } catch (err) {
      setError(err.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setRawChat("");
    setParsed(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Zoom Attendance</h2>
          <p style={styles.subtitle}>
            Paste or upload the Hoondokhae chat. Students who typed their ID get marked present.
          </p>
        </div>
        {onClose && (
          <button style={styles.ghostBtn} onClick={onClose}>Close</button>
        )}
      </div>

      {/* Session number + meeting date */}
      <div style={styles.fieldRow}>
        <div>
          <label style={styles.label}>Session number</label>
          <input
            type="number"
            min="1"
            value={sessionNumber}
            onChange={(e) => setSessionNumber(e.target.value)}
            placeholder="e.g. 7"
            style={styles.sessionInput}
          />
        </div>
        <div>
          <label style={styles.label}>Meeting date</label>
          <input
            type="date"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            style={styles.dateInput}
          />
        </div>
      </div>

      {/* Input area */}
      <label style={styles.label}>Zoom chat</label>
      <textarea
        value={rawChat}
        onChange={(e) => setRawChat(e.target.value)}
        placeholder={"Paste the Zoom chat here...\n\n09:14:03 From Unice Kiera to Everyone: HJ019"}
        style={styles.textarea}
      />

      <div style={styles.row}>
        <button style={styles.fileBtn} onClick={() => fileRef.current?.click()}>
          Upload .txt file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt"
          onChange={handleFile}
          style={{ display: "none" }}
        />
        <button style={styles.primaryBtn} onClick={handleParse}>
          Preview
        </button>
        <button style={styles.ghostBtn} onClick={reset}>Clear</button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Preview */}
      {parsed && !result && (
        <div style={styles.preview}>
          <Section
            color="#2e7d4f"
            bg="#eaf6ef"
            title={`Present (${parsed.matched.length})`}
            empty="No students matched yet."
            items={parsed.matched.map((m) => `${m.id} — ${m.name}`)}
          />
          <Section
            color="#9a6b00"
            bg="#fdf3da"
            title={`Needs review (${parsed.unknown.length})`}
            empty="No unmatched IDs."
            hint="These look like IDs but aren't in your roster (typos or not registered)."
            items={parsed.unknown.map((u) => `${u.id} — typed by ${u.name}`)}
          />
          <Section
            color="#1f3a93"
            bg="#e9eefc"
            title={`Guests (${parsed.guests.length})`}
            empty="No guests detected."
            items={parsed.guests.map((g) => g.display_name)}
          />

          <button
            style={{ ...styles.confirmBtn, opacity: saving ? 0.6 : 1 }}
            disabled={saving}
            onClick={handleConfirm}
          >
            {saving ? "Saving..." : `Confirm & mark session ${sessionNumber || "?"}`}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={styles.resultBox}>
          <h3 style={{ margin: "0 0 8px", color: "#1b2a4a" }}>Saved ✓</h3>
          <p style={styles.resultLine}>
            <strong>{result.present}</strong> students marked present for session{" "}
            <strong>{result.session}</strong>.
          </p>
          <p style={styles.resultLine}><strong>{result.guests}</strong> guests logged.</p>
          {result.gradesUpdated ? (
            <p style={{ ...styles.resultLine, color: "#2e7d4f" }}>Grades recomputed for all students.</p>
          ) : (
            <p style={{ ...styles.resultLine, color: "#9a6b00" }}>
              Attendance saved, but grades didn’t auto-update — click Recompute Grades on the dashboard.
            </p>
          )}
          {result.unknown > 0 && (
            <p style={{ ...styles.resultLine, color: "#9a6b00" }}>
              {result.unknown} unmatched ID(s) were skipped — check the “Needs review” list
              and add them manually if needed.
            </p>
          )}
          <div style={styles.resultBtnRow}>
            {typeof onReport === "function" && result.presentList && (
              <button
                style={styles.reportBtn}
                onClick={() => onReport(result.session, result.presentList, result.date)}
              >
                Download report
              </button>
            )}
            <button style={styles.primaryBtn} onClick={reset}>Do another session</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, items, empty, hint, color, bg }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ ...sectionStyles.head, color }}>{title}</div>
      {hint && <div style={sectionStyles.hint}>{hint}</div>}
      {items.length === 0 ? (
        <div style={sectionStyles.empty}>{empty}</div>
      ) : (
        <ul style={{ ...sectionStyles.list, background: bg }}>
          {items.map((t, i) => (
            <li key={i} style={sectionStyles.item}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const NAVY = "#1b2a4a";
const GOLD = "#c9a227";

const styles = {
  wrap: { maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "system-ui, sans-serif", color: NAVY },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 },
  title: { margin: 0, fontSize: 22, fontWeight: 700 },
  subtitle: { margin: "4px 0 0", fontSize: 14, color: "#5a6478" },
  label: { display: "block", fontSize: 13, fontWeight: 600, margin: "12px 0 6px" },
  sessionInput: { width: 120, padding: "10px 12px", fontSize: 15, border: "1px solid #cdd3df", borderRadius: 8 },
  dateInput: { padding: "10px 12px", fontSize: 15, border: "1px solid #cdd3df", borderRadius: 8 },
  fieldRow: { display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" },
  resultBtnRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 },
  reportBtn: { padding: "10px 18px", fontSize: 14, fontWeight: 700, background: GOLD, color: NAVY, border: "none", borderRadius: 8, cursor: "pointer" },
  textarea: { width: "100%", minHeight: 160, padding: 12, fontSize: 14, fontFamily: "monospace", border: "1px solid #cdd3df", borderRadius: 8, boxSizing: "border-box", resize: "vertical" },
  row: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
  fileBtn: { padding: "10px 16px", fontSize: 14, fontWeight: 600, background: "#fff", color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8, cursor: "pointer" },
  primaryBtn: { padding: "10px 18px", fontSize: 14, fontWeight: 600, background: NAVY, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" },
  ghostBtn: { padding: "10px 16px", fontSize: 14, fontWeight: 600, background: "transparent", color: "#5a6478", border: "1px solid #cdd3df", borderRadius: 8, cursor: "pointer" },
  confirmBtn: { width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, background: GOLD, color: NAVY, border: "none", borderRadius: 10, cursor: "pointer", marginTop: 8 },
  error: { marginTop: 12, padding: "10px 12px", background: "#fdecec", color: "#b3261e", borderRadius: 8, fontSize: 14 },
  preview: { marginTop: 20, padding: 16, background: "#fafbfd", border: "1px solid #e6e9f0", borderRadius: 12 },
  resultBox: { marginTop: 20, padding: 20, background: "#eaf6ef", border: "1px solid #bfe3cd", borderRadius: 12 },
  resultLine: { margin: "4px 0", fontSize: 15 },
};

const sectionStyles = {
  head: { fontSize: 14, fontWeight: 700, marginBottom: 6 },
  hint: { fontSize: 12, color: "#5a6478", marginBottom: 6 },
  empty: { fontSize: 13, color: "#9aa3b2", fontStyle: "italic" },
  list: { margin: 0, padding: "8px 8px 8px 28px", borderRadius: 8, listStyle: "disc" },
  item: { fontSize: 14, margin: "2px 0" },
};
