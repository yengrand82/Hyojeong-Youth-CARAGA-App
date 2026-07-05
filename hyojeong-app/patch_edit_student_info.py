#!/usr/bin/env python3
"""
Patch: Admin Edit Student Info + nickname support + dynamic quiz count in detail modal
Run from inside hyojeong-app:  python3 patch_edit_student_info.py
Backups: src/App.jsx.bak and src/ZoomAttendance.jsx.bak
REQUIRED FIRST (Supabase SQL editor):
  ALTER TABLE students ADD COLUMN IF NOT EXISTS nickname text;
"""
import shutil, sys

def patch(path, replacements):
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    shutil.copyfile(path, path + ".bak")
    for i, item in enumerate(replacements, 1):
        old, new = item[0], item[1]
        expected = item[2] if len(item) > 2 else 1
        n = src.count(old)
        if n != expected:
            print(f"❌ {path}: anchor #{i} found {n} times (need exactly {expected}). Aborting, nothing written.")
            print("   Anchor starts with:", old[:80].replace("\n", "\\n"))
            sys.exit(1)
        src = src.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    print(f"✅ {path}: {len(replacements)} change(s) applied (backup: {path}.bak)")

app_changes = []

# 1. state
app_changes.append((
"""  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);""",
"""  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [studentInfoEdit, setStudentInfoEdit] = useState(null); // admin edit of name/nickname/dob/address"""
))

# 2. load nickname in translated rows (appears in BOTH student loaders)
app_changes.append((
"""        'Status': r.status || 'active',
        'Contact': r.contact_number,""",
"""        'Status': r.status || 'active',
        'Nickname': r.nickname || '',
        'Contact': r.contact_number,""",
2
))

# 3+4. handlers
app_changes.append((
"""  // Toggle a student's active/inactive status from the admin detail view.""",
"""  // Save core student info (admin edit): name, nickname, DOB (-> age/category), address.
  const handleSaveStudentInfo = async (studId, edit) => {
    try {
      const first = (edit.firstName || '').trim();
      const last = (edit.lastName || '').trim();
      if (!first || !last) { alert('First and last name are required.'); return; }
      const dob = (edit.dateOfBirth || '').trim() || null;
      let age = null, category = null;
      if (dob) {
        const m = String(dob).match(/^(\\d{4})-(\\d{2})-(\\d{2})/);
        if (m) {
          const now = new Date();
          let a = now.getFullYear() - (+m[1]);
          const had = (now.getMonth() + 1 > +m[2]) || (now.getMonth() + 1 === +m[2] && now.getDate() >= +m[3]);
          if (!had) a--;
          if (a >= 0 && a <= 120) { age = a; category = a < 13 ? 'Kids' : 'Teens'; }
        }
      }
      const payload = {
        first_name: first,
        last_name: last,
        nickname: (edit.nickname || '').trim() || null,
        date_of_birth: dob,
        address: (edit.address || '').trim() || null
      };
      if (age != null) { payload.age = age; payload.category = category; }
      const { data, error } = await supabase.from('students')
        .update(payload).eq('student_id', studId).select('student_id');
      if (error) { alert('Failed to save info: ' + error.message); return; }
      if (!data || data.length === 0) { alert('Save blocked by permissions (0 rows updated). Check the students UPDATE policy in Supabase.'); return; }
      const patch = {
        'First Name': first, 'Last Name': last,
        'Nickname': (edit.nickname || '').trim(),
        'Date of Birth': dob, 'Address': (edit.address || '').trim(),
        ...(age != null ? { 'Age': age, 'Category': category } : {})
      };
      setAllStudents(prev => prev.map(s => s['Student ID'] === studId ? { ...s, ...patch } : s));
      setSelectedStudentDetail(prev => prev && prev['Student ID'] === studId ? { ...prev, ...patch } : prev);
      setStudentInfoEdit(null);
      alert('✅ Student info updated!');
    } catch (err) {
      console.error('Save student info error:', err);
      alert('Failed to save info.');
    }
  };

  // Save quiz (flexible array, respects quizCount) + service from the detail card.
  const handleSaveStudentScoresFlex = async (studId, quizVals, svc) => {
    try {
      const quizzes = (quizVals || []).map(v => v === '' || v == null ? null : Number(v)).filter(v => v != null && !isNaN(v));
      const avgPct = quizzes.length ? Math.round((quizzes.reduce((a, b) => a + b, 0) / quizzes.length) / 10 * 100 * 100) / 100 : 0;
      const svcPct = svc === '' || svc == null ? null : Math.min(100, Number(svc));
      const { error } = await supabase.from('students').update({
        quiz_scores: quizzes,
        quiz1: quizzes[0] ?? null, quiz2: quizzes[1] ?? null, quiz3: quizzes[2] ?? null,
        quiz_score: avgPct, hj_quiz: avgPct,
        service_scores: svcPct == null ? [] : [svcPct],
        service_pct: svcPct,
        hj_service_pct: svcPct == null ? 0 : svcPct,
        service_week_score: svcPct == null ? 0 : Math.round(svcPct / 100 * 50 * 100) / 100
      }).eq('student_id', studId);
      if (error) { alert('Failed to save scores: ' + error.message); return; }
      const patch = {
        'QuizScores': quizzes, 'ServiceScores': svcPct == null ? [] : [svcPct],
        'Quiz1': quizzes[0] ?? null, 'Quiz2': quizzes[1] ?? null, 'Quiz3': quizzes[2] ?? null,
        'ServicePct': svcPct, 'HJ Quiz': avgPct, 'HJ Service Pct': svcPct == null ? 0 : svcPct
      };
      setAllStudents(prev => prev.map(s => s['Student ID'] === studId ? { ...s, ...patch } : s));
      setSelectedStudentDetail(prev => prev && prev['Student ID'] === studId ? { ...prev, ...patch } : prev);
      alert('✅ Scores saved!');
    } catch (err) {
      console.error('Save student scores error:', err);
      alert('Failed to save scores.');
    }
  };

  // Toggle a student's active/inactive status from the admin detail view."""
))

# 5. Edit Info form
app_changes.append((
"""                <h3 className="text-lg font-black text-gray-800 mb-3">👤 Basic Information</h3>
                <div className="grid grid-cols-2 gap-3">""",
"""                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-black text-gray-800">👤 Basic Information</h3>
                  {!studentInfoEdit && (
                    <button
                      onClick={() => setStudentInfoEdit({
                        firstName: selectedStudentDetail['First Name'] || '',
                        lastName: selectedStudentDetail['Last Name'] || '',
                        nickname: selectedStudentDetail['Nickname'] || '',
                        dateOfBirth: selectedStudentDetail['Date of Birth'] || '',
                        address: selectedStudentDetail['Address'] || ''
                      })}
                      className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs">
                      ✏️ Edit Info
                    </button>
                  )}
                </div>
                {studentInfoEdit && (
                  <div className="bg-white rounded-lg p-3 mb-3 border-2 border-indigo-300 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-indigo-600 font-bold block mb-1">First name</label>
                        <input value={studentInfoEdit.firstName}
                          onChange={e => setStudentInfoEdit(p => ({ ...p, firstName: e.target.value }))}
                          className="w-full p-2 border-2 border-indigo-200 rounded-lg font-bold text-gray-700 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-indigo-600 font-bold block mb-1">Last name</label>
                        <input value={studentInfoEdit.lastName}
                          onChange={e => setStudentInfoEdit(p => ({ ...p, lastName: e.target.value }))}
                          className="w-full p-2 border-2 border-indigo-200 rounded-lg font-bold text-gray-700 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-indigo-600 font-bold block mb-1">Nickname (for Zoom chat)</label>
                        <input value={studentInfoEdit.nickname} placeholder="e.g. KP, Shin"
                          onChange={e => setStudentInfoEdit(p => ({ ...p, nickname: e.target.value }))}
                          className="w-full p-2 border-2 border-indigo-200 rounded-lg font-bold text-gray-700 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-indigo-600 font-bold block mb-1">Date of birth</label>
                        <input type="date" value={studentInfoEdit.dateOfBirth}
                          onChange={e => setStudentInfoEdit(p => ({ ...p, dateOfBirth: e.target.value }))}
                          className="w-full p-2 border-2 border-indigo-200 rounded-lg font-bold text-gray-700 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-indigo-600 font-bold block mb-1">Address</label>
                      <input value={studentInfoEdit.address}
                        onChange={e => setStudentInfoEdit(p => ({ ...p, address: e.target.value }))}
                        className="w-full p-2 border-2 border-indigo-200 rounded-lg font-bold text-gray-700 text-sm" />
                    </div>
                    <p className="text-xs text-gray-400">Age and category recompute from the date of birth. Student ID cannot be changed.</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveStudentInfo(selectedStudentDetail['Student ID'], studentInfoEdit)}
                        className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold text-sm">
                        💾 Save Info
                      </button>
                      <button onClick={() => setStudentInfoEdit(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">"""
))

# 6. dynamic quiz inputs
app_changes.append((
"""                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2">💡 Quiz Scores (each /10)</p>
                    <div className="flex gap-2 mb-3">
                      {[['Quiz1','Q1'],['Quiz2','Q2'],['Quiz3','Q3']].map(([field,label]) => (
                        <div key={field} className="flex-1">
                          <label className="text-xs text-gray-500 block text-center mb-1">{label}</label>
                          <input type="number" min="0" max="10"
                            key={`${selectedStudentDetail['Student ID']}-${field}`}
                            defaultValue={selectedStudentDetail[field] ?? ''}
                            id={`score-${field}`}
                            className="w-full h-10 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700" />
                        </div>
                      ))}
                    </div>""",
"""                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2">💡 Quiz Scores (each /10)</p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {Array.from({ length: quizCount }, (_, i) => (
                        <div key={`${selectedStudentDetail['Student ID']}-q${i}`}>
                          <label className="text-xs text-gray-500 block text-center mb-1">Q{i + 1}</label>
                          <input type="number" min="0" max="10"
                            defaultValue={getQuizArray(selectedStudentDetail)[i] ?? ''}
                            id={`score-quiz-${i}`}
                            className="w-full h-10 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700" />
                        </div>
                      ))}
                    </div>"""
))
app_changes.append((
"""                      onClick={() => handleSaveStudentScores(
                        selectedStudentDetail['Student ID'],
                        document.getElementById('score-Quiz1').value,
                        document.getElementById('score-Quiz2').value,
                        document.getElementById('score-Quiz3').value,
                        document.getElementById('score-ServicePct').value
                      )}""",
"""                      onClick={() => handleSaveStudentScoresFlex(
                        selectedStudentDetail['Student ID'],
                        Array.from({ length: quizCount }, (_, i) => document.getElementById(`score-quiz-${i}`).value),
                        document.getElementById('score-ServicePct').value
                      )}"""
))

# 7. pass nickname to ZoomAttendance
app_changes.append((
"""        students={allStudents.map(s => ({
          student_id: s['Student ID'],
          first_name: s['First Name'],
          last_name: s['Last Name'],
        }))}""",
"""        students={allStudents.map(s => ({
          student_id: s['Student ID'],
          first_name: s['First Name'],
          last_name: s['Last Name'],
          nickname: s['Nickname'] || '',
        }))}"""
))

zoom_changes = []

# 8. exact-name index: nickname variants
zoom_changes.append((
"""    students.forEach((s) => {
      const full = normalizeName(`${s.first_name || ""} ${s.last_name || ""}`);
      if (!full) return;
      if (map.has(full)) {
        map.set(full, "AMBIGUOUS");
      } else {
        map.set(full, s);
      }
    });""",
"""    students.forEach((s) => {
      const variants = [
        `${s.first_name || ""} ${s.last_name || ""}`,
        s.nickname ? `${s.nickname}` : "",
        s.nickname ? `${s.nickname} ${s.last_name || ""}` : "",
      ];
      variants.forEach((v) => {
        const full = normalizeName(v);
        if (!full) return;
        if (map.has(full) && map.get(full) !== s) {
          map.set(full, "AMBIGUOUS");
        } else {
          map.set(full, s);
        }
      });
    });"""
))

# 9. token index: nickname tokens count as first-name tokens
zoom_changes.append((
"""    return students.map((s) => ({
      s,
      first: nameTokensLower(s.first_name),
      last: nameTokensLower(s.last_name),
    }));""",
"""    return students.map((s) => ({
      s,
      first: [...nameTokensLower(s.first_name), ...nameTokensLower(s.nickname || "")],
      last: nameTokensLower(s.last_name),
    }));"""
))

patch("src/App.jsx", app_changes)
patch("src/ZoomAttendance.jsx", zoom_changes)
print()
print("Done! Next: esbuild checks, npm run dev, test, then git commit/push.")
