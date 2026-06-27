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

// Shirt markers a student might type (case-insensitive).
// Positive: "shirt", "naka shirt", "naka hj shirt", "naay shirt", "✓"
const SHIRT_REGEX = /(naka[\s-]*(hj[\s-]*)?shirt|naay[\s-]*(hj[\s-]*)?shirt|\bhj[\s-]*shirt\b|\bshirt\b|✓|✔)/i;

// Negation: student explicitly says NOT wearing the shirt. This OVERRIDES a positive.
// "no shirt", "no hj shirt", "wala shirt", "walay shirt", "way shirt", "wala", "walay"
const NO_SHIRT_REGEX = /(no[\s-]*(hj[\s-]*)?shirt|wala[\s-]*y?[\s-]*(hj[\s-]*)?shirt|way[\s-]*(hj[\s-]*)?shirt|\bwala\b|\bwalay\b)/i;

// Decide shirt status for a message: true only if a positive marker is present
// AND no negation is present.
function shirtStatus(text) {
  if (!text) return false;
  if (NO_SHIRT_REGEX.test(text)) return false; // negation wins
  return SHIRT_REGEX.test(text);
}

// Normalise any matched ID to canonical form HJ### (zero-padded to 3 digits)
function canonicalId(rawDigits) {
  const n = parseInt(rawDigits, 10);
  if (Number.isNaN(n)) return null;
  return "HJ" + String(n).padStart(3, "0");
}

// Normalise a name for comparison: lowercase, strip punctuation, collapse spaces,
// drop any shirt words, and sort the word tokens so order doesn't matter.
function normalizeName(raw) {
  if (!raw) return "";
  let s = String(raw).toLowerCase();
  s = s.replace(NO_SHIRT_REGEX, " ");       // remove negation phrases
  s = s.replace(SHIRT_REGEX, " ");          // remove shirt markers
  s = s.replace(/\bhj\b/g, " ");            // stray "hj" left over
  s = s.replace(/[.,_\-/]/g, " ");           // punctuation -> space
  s = s.replace(/[^a-z0-9ñ\s]/g, " ");       // strip stray symbols (keep ñ)
  s = s.replace(/\s+/g, " ").trim();
  if (!s) return "";
  const tokens = s.split(" ").filter(Boolean).sort();
  return tokens.join(" ");
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

// Zoom exports come in two shapes:
//   (A) single line:  "09:14:03 From Unice to Everyone: HJ019"
//   (B) multi line:   "2026-06-26 10:30 From Yen to Everyone:"  then an
//                     indented next line "\tKyrra Queliope - naka hj shirt"
// flattenChat normalises shape (B) into shape (A) so the parser handles both.
// A single header can own several following message lines (each becomes its own line).
function flattenChat(raw) {
  const lines = raw.split(/\r?\n/);
  const out = [];
  // Matches a header line ending right after "to Everyone:" (no message after it).
  const headerEmpty = /(From\s+.*?\s+to\s+.*?:)\s*$/i;
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(headerEmpty);
    if (m) {
      const header = m[1]; // "...From NAME to Everyone:"
      let j = i + 1;
      let attached = 0;
      // Consume following non-empty lines that are NOT themselves new headers.
      while (j < lines.length) {
        const next = lines[j];
        if (next.trim() === "") { j++; continue; }
        if (/From\s+.*?\s+to\s+.*?:/i.test(next)) break; // next person's header
        out.push(`${header} ${next.trim()}`);
        attached++;
        j++;
      }
      if (attached === 0) out.push(line); // header with nothing after; keep as-is
      i = j;
    } else {
      out.push(line);
      i++;
    }
  }
  return out.join("\n");
}

// --- Real-world messy-chat helpers ---------------------------------------
// Students often join from phones whose Zoom name is the device model
// (e.g. "Infinix X6525", "TECNO KL4"), and type their full info on one line:
// "Jeremy delossantos age: 13 manay purok3 (GK) Butuan City". Several kids may
// also share one device, each typing their name on its own line.

// Words that are address/metadata, never a person's name.
const NOISE_WORDS = new Set([
  "purok","prk","brgy","barangay","city","butuan","bayugan","agusan","norte","sur",
  "del","mahay","poblacion","loreto","gk","years","old","age","from","to","everyone",
  "street","st","zone","sitio","manay","yrs","yr",
]);
// Device-model fragments to strip out.
const DEVICE_WORDS = /(infinix|tecno|samsung|sm-?[a-z0-9]+|x\d{3,}|kl\d|redmi|xiaomi|oppo|vivo|realme|huawei|iphone|itel|cherry|nokia)/ig;

// From a raw line, pull the tokens that look like parts of a person's name,
// stripping age ("age: 13", "-16"), parentheticals ("(GK)"), devices, and noise words.
function extractNameTokens(line) {
  let s = String(line || "");
  s = s.replace(/age\s*:?\s*\d+/ig, " ");      // "age: 13", "Age:11"
  s = s.replace(/[-–]\s*\d+\b/g, " ");          // trailing "-16", "–9"
  s = s.replace(/\([^)]*\)/g, " ");             // "(GK)"
  s = s.replace(DEVICE_WORDS, " ");             // device models
  const raw = s.split(/[\s,.;:]+/).filter(Boolean);
  const out = [];
  for (const tok of raw) {
    const low = tok.toLowerCase().replace(/[^a-zñ]/gi, "");
    if (!low) continue;
    if (NOISE_WORDS.has(low)) continue;
    if (/\d/.test(tok)) continue;               // skip tokens containing digits
    if (low.length < 2 && out.length > 0) continue; // stray single letters
    out.push(tok);
  }
  return out;
}

// True (returns tokens) only if the line plausibly contains a person's name.
// Needs >=2 name tokens, OR a single short line that is one alphabetic token.
function looksLikePerson(line) {
  const toks = extractNameTokens(line);
  if (toks.length >= 2) return toks;
  if (toks.length === 1 && String(line).trim().split(/\s+/).length <= 2) return toks;
  return null;
}

// Explode a chat into individual content lines. Strips the "HH:MM From <device> :"
// or "From <name> to Everyone:" prefix; every remaining non-empty line is its own
// person (handles several kids sharing one device, each on a separate line).
function explodeLines(raw) {
  const out = [];
  for (const rawline of String(raw || "").split(/\r?\n/)) {
    const t = rawline.trim();
    if (!t) continue;
    let m = t.match(/^\d{1,2}:\d{2}(?::\d{2})?\s+From\s+.*?:\s*(.*)$/i);
    if (m) { if (m[1].trim()) out.push(m[1].trim()); continue; }
    m = t.match(/From\s+.*?\s+to\s+.*?:\s*(.*)$/i);
    if (m) { if (m[1].trim()) out.push(m[1].trim()); continue; }
    m = t.match(/From\s+.*?:\s*(.*)$/i);
    if (m) { if (m[1].trim()) out.push(m[1].trim()); continue; }
    out.push(t); // continuation line = its own person
  }
  return out;
}

// Tokenize a string into lowercase alphabetic word tokens (for name matching).
function nameTokensLower(raw) {
  return String(raw || "").toLowerCase().replace(/[^a-zñ\s]/g, " ").split(/\s+/).filter(Boolean);
}

// Conversational filler words (Bisaya/Tagalog/English). A line that is mostly
// these is chat-chatter, not a name/registration.
const CHATTER_WORDS = new Set([
  "ako","ko","ky","kay","lag","kaayu","teh","tehh","dli","ku","mka","mca","paminaw","sa","story",
  "off","cam","on","mag","magstudy","study","pray","everyday","be","friendly","na","ni","si","ang",
  "ug","og","nga","man","gud","lang","ra","pa","jud","gyud","kaau","unsa","asa","kinsa","wala",
  "oo","dili","hindi","yes","no","ok","okay","po","opo","salamat","thank","you","hello","hi","hey",
  "te","ate","kuya","maam","sir","good","morning","afternoon","evening","amen","praise","yan","ta",
]);

// True if the line is a URL/link.
function isLink(line) {
  return /https?:\/\/|www\.|\.org|\.com|\.net/i.test(String(line || ""));
}

// True if the line is mostly conversational filler (so we skip it as a "guest").
// "Name:" lines are registration info and are never treated as chatter.
function isChatter(line) {
  if (/name\s*:/i.test(line)) return false;
  const toks = String(line || "").toLowerCase().replace(/[^a-zñ\s]/g, " ").split(/\s+/).filter(Boolean);
  if (toks.length === 0) return true;
  const chat = toks.filter((t) => CHATTER_WORDS.has(t)).length;
  if (chat / toks.length >= 0.5) return true;
  if (toks.length === 1 && CHATTER_WORDS.has(toks[0])) return true;
  return false;
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

  // Build a normalized-full-name index for strict name matching.
  // Value is either a single student, or the string "AMBIGUOUS" if 2+ share that name.
  const nameIndex = useMemo(() => {
    const map = new Map();
    students.forEach((s) => {
      const full = normalizeName(`${s.first_name || ""} ${s.last_name || ""}`);
      if (!full) return;
      if (map.has(full)) {
        map.set(full, "AMBIGUOUS");
      } else {
        map.set(full, s);
      }
    });
    return map;
  }, [students]);

  // Build first-name/last-name token sets per student, for partial matching
  // (matches when a typed line contains one of the student's first-name tokens
  // AND one of their last-name tokens, and points to exactly one student).
  const tokenIndex = useMemo(() => {
    return students.map((s) => ({
      s,
      first: nameTokensLower(s.first_name),
      last: nameTokensLower(s.last_name),
    }));
  }, [students]);

  // Partial match: typed tokens must include >=1 of the student's first tokens
  // AND >=1 of their last tokens. Returns the student only if exactly one matches;
  // "AMBIGUOUS" if several; null if none.
  function partialNameMatch(typedTokens) {
    const set = new Set(typedTokens);
    const hits = [];
    for (const { s, first, last } of tokenIndex) {
      const hasFirst = first.some((t) => set.has(t));
      const hasLast = last.some((t) => set.has(t));
      if (hasFirst && hasLast) hits.push(s);
    }
    if (hits.length === 1) return hits[0];
    if (hits.length > 1) return "AMBIGUOUS";
    return null;
  }

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

    // Explode the chat: each content line = one person (handles shared devices,
    // multi-line messages, and device-name display names).
    const lines = explodeLines(rawChat);
    const matched = new Map(); // canonicalId -> { id, name, shirt }
    const unknown = new Map(); // review bucket: ambiguous names / typo IDs
    const guests = new Map(); // full info line -> true

    // Helper: record a present student, OR-ing in shirt if any line marks it.
    const addMatched = (canon, fullName, shirt) => {
      if (matched.has(canon)) {
        const prev = matched.get(canon);
        matched.set(canon, { ...prev, shirt: prev.shirt || shirt });
      } else {
        matched.set(canon, { id: canon, name: fullName, shirt });
      }
    };

    for (const line of lines) {
      const hasShirt = shirtStatus(line);

      // 1) Explicit Student ID anywhere in the line.
      const idMatch = line.match(ID_REGEX);
      if (idMatch) {
        const canon = canonicalId(idMatch[1]);
        if (canon && roster.has(canon)) {
          const stu = roster.get(canon);
          addMatched(canon, `${stu.first_name || ""} ${stu.last_name || ""}`.trim(), hasShirt);
          continue;
        }
        // ID-looking but not in roster -> review (only if it's basically just an ID)
        if (canon && line.trim().length <= 8) {
          unknown.set("ID:" + canon, { id: canon, name: "typed in chat" });
          continue;
        }
        // otherwise fall through to name handling (the line has more than an ID)
      }

      // Drop links and conversational chatter (only reaches here if no roster ID matched).
      if (isLink(line) || isChatter(line)) continue;

      // 2) Does the line plausibly contain a person's name?
      const personToks = looksLikePerson(line);
      if (!personToks) continue; // pure address/device/fragment -> drop

      // 2a) Exact full-name match.
      const fullKey = normalizeName(personToks.join(" "));
      if (fullKey && nameIndex.has(fullKey)) {
        const v = nameIndex.get(fullKey);
        if (v !== "AMBIGUOUS") {
          addMatched(v.student_id.toUpperCase(), `${v.first_name || ""} ${v.last_name || ""}`.trim(), hasShirt);
          continue;
        }
      }

      // 2b) Partial match: first-name token AND last-name token, unique student.
      const pm = partialNameMatch(nameTokensLower(personToks.join(" ")));
      if (pm && pm !== "AMBIGUOUS") {
        addMatched(pm.student_id.toUpperCase(), `${pm.first_name || ""} ${pm.last_name || ""}`.trim(), hasShirt);
        continue;
      }
      if (pm === "AMBIGUOUS") {
        unknown.set("NAME:" + line.trim(), { id: "(name)", name: `${line.trim()} — matches more than one student` });
        continue;
      }

      // 3) No match -> guest, keeping the FULL original line (name + age + address).
      guests.set(line.trim(), true);
    }

    setParsed({
      matched: [...matched.values()],
      unknown: [...unknown.values()],
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
      //    To avoid wiping an existing shirt mark, we split into two upserts:
      //    - shirt-wearers: set attendance=true AND hj_shirt=true
      //    - everyone else: set attendance=true only (hj_shirt left untouched)
      const withShirt = parsed.matched.filter((m) => m.shirt);
      const noShirt = parsed.matched.filter((m) => !m.shirt);

      if (withShirt.length > 0) {
        const shirtRows = withShirt.map((m) => ({
          student_id: m.id,
          session_number: sn,
          attendance: true,
          hj_shirt: true,
          marked_by: "zoom",
        }));
        const { error: e1 } = await supabase
          .from("attendance_marks")
          .upsert(shirtRows, { onConflict: "student_id,session_number" });
        if (e1) throw e1;
      }

      if (noShirt.length > 0) {
        const plainRows = noShirt.map((m) => ({
          student_id: m.id,
          session_number: sn,
          attendance: true,
          marked_by: "zoom",
        }));
        const { error: e2 } = await supabase
          .from("attendance_marks")
          .upsert(plainRows, { onConflict: "student_id,session_number" });
        if (e2) throw e2;
      }

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
        shirts: parsed.matched.filter((m) => m.shirt).length,
        guests: guestsSaved,
        unknown: parsed.unknown.length,
        session: sn,
        gradesUpdated,
        presentList: parsed.matched, // [{ id, name, shirt }]
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
            Paste or upload the Hoondokhae chat. Students type their ID (or full name) to be marked present — add “shirt”, “naka shirt”, or “naay shirt” for the HJ shirt.
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
        placeholder={"Paste the Zoom chat here...\n\n09:14:03 From Unice Kiera to Everyone: HJ019 naka shirt\n09:14:10 From Princess Abejay to Everyone: HJ001"}
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
            items={parsed.matched.map((m) => `${m.id} — ${m.name}${m.shirt ? "  👕 shirt" : ""}`)}
          />
          <Section
            color="#9a6b00"
            bg="#fdf3da"
            title={`Needs review (${parsed.unknown.length})`}
            empty="Nothing to review."
            hint="Unmatched IDs or names matching more than one student — handle these manually."
            items={parsed.unknown.map((u) => (u.id && u.id !== "(name)" ? `${u.id} — ${u.name}` : u.name))}
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
          <p style={styles.resultLine}><strong>{result.shirts}</strong> marked with HJ shirt 👕</p>
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
