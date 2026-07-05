#!/usr/bin/env python3
"""Customizable report columns + names-only guest list. Backups: .bak6"""
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

app = []

app.append((
"""  const printSessionAttendance = async (sessionNumber, presentList, meetingDate) => {""",
"""  const printSessionAttendance = async (sessionNumber, presentList, meetingDate, reportOpts = {}) => {"""
))

app.append((
"""    const rows = (presentRows || []).map((p, i) => {
      const s = byId[(p.id || '').toUpperCase()] || {};
      return `<tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${p.name || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${p.id || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${s['TEAM'] || ''}</td>
      </tr>`;
    }).join('');""",
"""    const wantAge = !!reportOpts.age, wantDob = !!reportOpts.dob, wantAddr = !!reportOpts.address,
          wantContact = !!reportOpts.contact, wantGoals = !!reportOpts.goals,
          wantAff = !!reportOpts.affirmation, wantGrat = !!reportOpts.gratitude;
    const esc = (v) => String(v == null ? '' : v).replace(/</g, '&lt;');
    let extraInfo = {};
    if (wantAge || wantDob || wantAddr || wantContact || wantGoals || wantAff) {
      try {
        const ids = (presentRows || []).map(p => (p.id || '').toUpperCase());
        const { data: exRows } = await supabase
          .from('students')
          .select('student_id, age, date_of_birth, address, contact_number, affirmation, goal1, goal2, goal3')
          .in('student_id', ids);
        (exRows || []).forEach(r => { extraInfo[(r.student_id || '').toUpperCase()] = r; });
      } catch (e) { console.error('Extra info fetch failed:', e); }
    }
    let gratById = {};
    if (wantGrat) {
      try {
        const { data: gRows } = await supabase
          .from('gratitude')
          .select('student_id, entry_text')
          .eq('session_number', sessionNumber);
        (gRows || []).forEach(r => { gratById[(r.student_id || '').toUpperCase()] = r.entry_text || ''; });
      } catch (e) { console.error('Gratitude fetch failed:', e); }
    }
    const th = (t) => `<th style="padding:8px;border-bottom:2px solid #e5e7eb">${t}</th>`;
    const extraHeads =
      (wantAge ? th('Age') : '') + (wantDob ? th('Date of birth') : '') +
      (wantAddr ? th('Address') : '') + (wantContact ? th('Contact') : '') +
      (wantGoals ? th('Goals') : '') + (wantAff ? th('Affirmation') : '') +
      (wantGrat ? th('Gratitude (this session)') : '');
    const rows = (presentRows || []).map((p, i) => {
      const s = byId[(p.id || '').toUpperCase()] || {};
      const ex = extraInfo[(p.id || '').toUpperCase()] || {};
      const td = (t) => `<td style="padding:6px;border-bottom:1px solid #eee">${t}</td>`;
      const goalsTxt = [ex.goal1, ex.goal2, ex.goal3].filter(Boolean).map(esc).join('; ');
      const extraCells =
        (wantAge ? td(esc(ex.age)) : '') + (wantDob ? td(esc(ex.date_of_birth)) : '') +
        (wantAddr ? td(esc(ex.address)) : '') + (wantContact ? td(esc(ex.contact_number)) : '') +
        (wantGoals ? td(goalsTxt) : '') + (wantAff ? td(esc(ex.affirmation)) : '') +
        (wantGrat ? td(esc(gratById[(p.id || '').toUpperCase()])) : '');
      return `<tr>
        ${td(i + 1)}
        ${td(esc(p.name))}
        ${td(esc(p.id))}
        ${td(esc(s['TEAM']))}
        ${extraCells}
      </tr>`;
    }).join('');"""
))

app.append((
"""              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Team</th>
            </tr>""",
"""              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Team</th>
              ${extraHeads}
            </tr>"""
))

app.append((
"""      if (!gErr && guestRows && guestRows.length > 0) {
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
      }""",
"""      const cleanGuestName = (display) => {
        let t = String(display || '').replace(/^\\s*name\\s*:\\s*/i, '');
        t = t.split(/\\(\\s*[A-Z][a-z]{2}\\s+\\d/)[0];
        t = t.split(/\\b(?:age|from)\\b\\s*:?/i)[0];
        t = t.split(/\\bpurok\\b/i)[0];
        t = t.replace(/\\bp\\s*-\\s*\\d+.*/i, '');
        t = t.replace(/[-\\u2013]\\s*\\d+\\s*$/, '');
        t = t.replace(/[|,;:.]+\\s*$/, '').trim();
        const letters = (t.match(/[a-z\\u00e0-\\u00ff\\u00f1]/gi) || []).length;
        return letters >= 3 ? t : null;
      };
      const seen = new Set();
      const cleanedGuests = (guestRows || [])
        .map((g) => cleanGuestName(g.display_name))
        .filter((nm) => {
          if (!nm) return false;
          const k = nm.toLowerCase();
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
      if (!gErr && cleanedGuests.length > 0) {
        const gRows = cleanedGuests.map((nm, i) => `<tr>
          <td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td>
          <td style="padding:6px;border-bottom:1px solid #eee">${nm.replace(/</g, '&lt;')}</td>
        </tr>`).join('');
        guestsHtml = `
        <h2 style="margin:28px 0 4px;font-size:17px;color:#1b2a4a">Guests</h2>
        <p style="font-size:14px;margin:4px 0 12px"><strong>${cleanedGuests.length}</strong> guest(s) joined this session</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f3f4f6;text-align:left">
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">#</th>
              <th style="padding:8px;border-bottom:2px solid #e5e7eb">Name</th>
            </tr>
          </thead>
          <tbody>${gRows}</tbody>
        </table>`;
      }"""
))

apply("src/App.jsx", app, ".bak6")

zoom = []

zoom.append((
"""  const [showHistory, setShowHistory] = useState(false);""",
"""  const [showHistory, setShowHistory] = useState(false);
  const [reportOpts, setReportOpts] = useState({});"""
))

zoom.append((
"""          <div style={styles.resultBtnRow}>
            {typeof onReport === "function" && result.presentList && (
              <button
                style={styles.reportBtn}
                onClick={() => onReport(result.session, result.presentList, result.date)}
              >
                Download report
              </button>
            )}""",
"""          {typeof onReport === "function" && result.presentList && (
            <div style={{ margin: "10px 0 2px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Include in report:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 13 }}>
                {[["age", "Age"], ["dob", "Date of birth"], ["address", "Address"], ["contact", "Contact"], ["goals", "Goals"], ["affirmation", "Affirmation"], ["gratitude", "Gratitude (this session)"]].map(([k, lbl]) => (
                  <label key={k} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={!!reportOpts[k]}
                      onChange={(e) => setReportOpts((p) => ({ ...p, [k]: e.target.checked }))}
                    />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div style={styles.resultBtnRow}>
            {typeof onReport === "function" && result.presentList && (
              <button
                style={styles.reportBtn}
                onClick={() => onReport(result.session, result.presentList, result.date, reportOpts)}
              >
                Download report
              </button>
            )}"""
))

apply("src/ZoomAttendance.jsx", zoom, ".bak6")
