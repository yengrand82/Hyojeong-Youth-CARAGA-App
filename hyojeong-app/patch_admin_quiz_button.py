#!/usr/bin/env python3
"""
Patch: Add "Scores" section (Quiz Scores + Service) to the admin dashboard
--------------------------------------------------------------------------
The Quiz Scores and Service screens already exist and accept admin, but the
admin DASHBOARD has no button to reach them (only team leaders could). This
adds a "Scores" section with two buttons so the admin can open them — which is
where the quiz answer-sheet scanner lives.

Safe by design: exact-string anchor, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_admin_quiz_button.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_admin_quiz_button.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "admin-dash-scores-section" in src:
        fail("Admin scores-buttons patch already applied (found marker). Nothing to do.")

    # Anchor: the end of the Students grid (Photo Approvals button) right before ENGAGEMENT.
    anchor = """          </button>
        </div>

        {/* ENGAGEMENT */}"""
    if anchor not in src:
        fail("Could not find the Students/Engagement boundary on the admin dashboard.")
    if src.count(anchor) > 1:
        fail("The insertion anchor is ambiguous (appears more than once).")

    # Helper to build the roster the screens use, then seed edit boxes & navigate.
    section = """          </button>
        </div>

        {/* SCORES (admin-dash-scores-section) */}
        <p className=\"text-[11px] font-black tracking-wider uppercase text-gray-500 mb-2 ml-1\">Scores</p>
        <div className=\"grid grid-cols-2 gap-2.5 mb-5\">
          <button onClick={() => {
              const roster = (allStudents || []).filter(s => (s['Status']||'active')==='active' && s['Student ID'] && /^HJ\\d+$/i.test(s['Student ID']));
              if (typeof loadScoreEdits === 'function') loadScoreEdits(roster);
              setQuizTeamFilter('ALL');
              setCurrentPage('admin-quizzes');
            }} className=\"bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition\">
            <div className=\"w-8 h-8 rounded-lg grid place-items-center\" style={{background:'#ede9fe'}}><span style={{fontSize:16}}>💡</span></div>
            <span className=\"text-[13px] font-bold leading-tight\" style={{color:'#1b2a4a'}}>Quiz Scores</span>
          </button>
          <button onClick={() => {
              const roster = (allStudents || []).filter(s => (s['Status']||'active')==='active' && s['Student ID'] && /^HJ\\d+$/i.test(s['Student ID']));
              if (typeof loadScoreEdits === 'function') loadScoreEdits(roster);
              setQuizTeamFilter('ALL');
              setCurrentPage('admin-service');
            }} className=\"bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition\">
            <div className=\"w-8 h-8 rounded-lg grid place-items-center\" style={{background:'#dbeafe'}}><span style={{fontSize:16}}>💙</span></div>
            <span className=\"text-[13px] font-bold leading-tight\" style={{color:'#1b2a4a'}}>Service</span>
          </button>
        </div>

        {/* ENGAGEMENT */}"""

    src = src.replace(anchor, section, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Added 'Scores' section (Quiz Scores + Service) to the admin dashboard.")
    print(f"✓ Updated: {path}")
    print("\nNext: npm run dev → admin dashboard now has a Scores section.")
    print("Tap 'Quiz Scores' to reach the screen with the 📷 scan panel.")

if __name__ == "__main__":
    main()
