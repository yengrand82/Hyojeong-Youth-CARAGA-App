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

# ---- 1) Add studentSearch state next to studentTeamFilter (line ~400) ----
state_anchor = "  const [studentTeamFilter, setStudentTeamFilter] = useState('ALL'); // team filter on All Students page"
state_add = state_anchor + "\n  const [studentSearch, setStudentSearch] = useState(''); // name/ID search on All Students page"
if "const [studentSearch" in src:
    print("• studentSearch state already present.")
elif state_anchor in src:
    src = src.replace(state_anchor, state_add, 1)
    made.append("added studentSearch state")
else:
    print("WARNING: could not find studentTeamFilter state anchor.")

# ---- 2) Add the search box after the team-filter div, before the Print button ----
# Anchor: the closing of the team-filter block + the Print button start.
search_anchor = """          ))}
        </div>
        <button
          onClick={() => {
            const filtered = [...allStudents]"""
search_box = """          ))}
        </div>
        <input
          type="text"
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          placeholder="🔍 Search by name or ID..."
          className="w-full mb-4 px-4 py-3 rounded-xl border-2 border-white/60 bg-white/90 text-gray-700 font-bold placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/40"
        />
        <button
          onClick={() => {
            const filtered = [...allStudents]"""
if 'placeholder="🔍 Search by name or ID..."' in src:
    print("• search box already present.")
elif search_anchor in src:
    src = src.replace(search_anchor, search_box, 1)
    made.append("added search input box")
else:
    print("WARNING: could not find Print-button anchor for search box.")

# ---- 3) Add the search filter to the displayed list ----
# Anchor: the list's filters. Add a name/ID filter after the team filter line in the LIST
# (the one inside <div className="space-y-3">, followed by .sort(...).map((student, idx)).
list_anchor = """        <div className="space-y-3">
          {[...allStudents]
            .filter(s => studentStatusFilter === 'all' || (s['Status'] || 'active') === studentStatusFilter)
            .filter(s => studentTeamFilter === 'ALL' || (s['TEAM'] || '').toUpperCase() === studentTeamFilter.toUpperCase())
            .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.trim().localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`.trim())).map((student, idx) => {"""
list_replace = """        <div className="space-y-3">
          {[...allStudents]
            .filter(s => studentStatusFilter === 'all' || (s['Status'] || 'active') === studentStatusFilter)
            .filter(s => studentTeamFilter === 'ALL' || (s['TEAM'] || '').toUpperCase() === studentTeamFilter.toUpperCase())
            .filter(s => {
              const q = studentSearch.trim().toLowerCase();
              if (!q) return true;
              const name = `${s['First Name']||''} ${s['Last Name']||''}`.toLowerCase();
              const id = (s['Student ID']||'').toLowerCase();
              return name.includes(q) || id.includes(q);
            })
            .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.trim().localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`.trim())).map((student, idx) => {"""
if "const q = studentSearch.trim().toLowerCase();" in src:
    print("• list search filter already present.")
elif list_anchor in src:
    src = src.replace(list_anchor, list_replace, 1)
    made.append("added search filter to list")
else:
    print("WARNING: could not find student list anchor.")

if not made:
    print("\nNo changes made.")
    sys.exit(1)

shutil.copy(APP, APP + ".backup_search")
with open(APP, "w") as f:
    f.write(src)
print("Backup saved to src/App.jsx.backup_search")
for m in made:
    print("  -", m)
print("Line count:", len(src.splitlines()), "(was", len(orig.splitlines()), ")")
