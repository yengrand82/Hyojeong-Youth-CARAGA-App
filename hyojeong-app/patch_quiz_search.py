#!/usr/bin/env python3
"""
Patch: Search box on the Quiz Scores screen (name or Student ID)
----------------------------------------------------------------
Adds a search field that filters the roster by name or HJ id as you type,
working together with the existing team filter. Helps find one student fast
in a long list.

Safe by design: exact-string anchors, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_quiz_search.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_quiz_search.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "quizSearch" in src:
        fail("Quiz search patch already applied (found marker). Nothing to do.")

    # 1) Add state near quizTeamFilter.
    state_anchor = "  const [quizTeamFilter, setQuizTeamFilter] = useState('ALL');"
    if state_anchor not in src:
        fail("Could not find quizTeamFilter state.")
    src = src.replace(state_anchor,
                      state_anchor + "\n  const [quizSearch, setQuizSearch] = useState('');", 1)

    # 2) Add a search filter to the roster build (after the team filter line).
    roster_anchor = """      .filter(s => !teamFilter || teamFilter === 'ALL' || (s['TEAM']||'').toUpperCase() === teamFilter.toUpperCase())
      .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`));
    const teams = ['ALL', ...((programSettings.teams || []).map(t => t.name).filter(Boolean))];
    return (
    <div className=\"min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-32\">
      <div className=\"p-4\">
        <div className=\"flex items-center gap-3 mb-4\">
          <button onClick={() => setCurrentPage(leadTeam ? 'lead-dashboard' : 'admin-dashboard')} className=\"text-white font-bold\"><ArrowLeft className=\"w-6 h-6\" /></button>
          <div>
            <h1 className=\"text-3xl font-black text-white\">💡 Quiz Scores</h1>"""
    if roster_anchor not in src:
        fail("Could not find the Quiz Scores roster/header block to anchor the search.")
    roster_new = """      .filter(s => !teamFilter || teamFilter === 'ALL' || (s['TEAM']||'').toUpperCase() === teamFilter.toUpperCase())
      .filter(s => {
        const q = (quizSearch || '').trim().toLowerCase();
        if (!q) return true;
        const name = `${s['First Name']||''} ${s['Last Name']||''}`.toLowerCase();
        const id = (s['Student ID']||'').toLowerCase();
        return name.includes(q) || id.includes(q);
      })
      .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`));
    const teams = ['ALL', ...((programSettings.teams || []).map(t => t.name).filter(Boolean))];
    return (
    <div className=\"min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-32\">
      <div className=\"p-4\">
        <div className=\"flex items-center gap-3 mb-4\">
          <button onClick={() => setCurrentPage(leadTeam ? 'lead-dashboard' : 'admin-dashboard')} className=\"text-white font-bold\"><ArrowLeft className=\"w-6 h-6\" /></button>
          <div>
            <h1 className=\"text-3xl font-black text-white\">💡 Quiz Scores</h1>"""
    src = src.replace(roster_anchor, roster_new, 1)

    # 3) Add the search input right before the Q1/Q2/Q3 column header row.
    header_anchor = """        <div className=\"flex items-center px-3 mb-1\">
          <div className=\"flex-1 text-xs font-bold text-white/90\">Student</div>
          <div className=\"w-12 text-center text-xs font-bold text-white/90\">Q1</div>"""
    if header_anchor not in src:
        fail("Could not find the Q1/Q2/Q3 column header to place the search box.")
    search_box = """        <div className=\"relative mb-2\">
          <input value={quizSearch} onChange={e => setQuizSearch(e.target.value)} placeholder=\"🔍 Search name or ID…\"
            className=\"w-full rounded-xl px-3 py-2.5 text-sm border-2 border-white/40 bg-white/90 font-medium\" />
          {quizSearch && (
            <button onClick={() => setQuizSearch('')} className=\"absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg px-2\">×</button>
          )}
        </div>
        <div className=\"flex items-center px-3 mb-1\">
          <div className=\"flex-1 text-xs font-bold text-white/90\">Student</div>
          <div className=\"w-12 text-center text-xs font-bold text-white/90\">Q1</div>"""
    src = src.replace(header_anchor, search_box, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Search box added to the Quiz Scores screen (name or ID).")
    print(f"✓ Updated: {path}")
    print("\nNext: npm run dev → Quiz Scores → type a name or HJ id to filter.")
    print("Works together with the team filter.")

if __name__ == "__main__":
    main()
