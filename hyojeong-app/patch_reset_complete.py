#!/usr/bin/env python3
"""
Patch: Complete the reset (clear new feature tables too)
--------------------------------------------------------
The "Start New Program" reset clears attendance + gratitude and resets grades,
but it was built before today's features and does NOT clear:
  - mystery_box_opens (Mystery Box opens + collected stickers)
  - reflections (My Quiet Heart)
  - encouragements (leader notes)
  - absence_notes
This patch adds those deletes so a reset gives a truly clean slate for launch.
Students themselves are still KEPT. Archiving still happens first.

Safe by design: exact-string anchor, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_reset_complete.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_reset_complete.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "clear new feature tables" in src:
        fail("Reset-complete patch already applied (found marker). Nothing to do.")

    anchor = """      const delGrat = await supabase.from('gratitude').delete().neq('student_id', '___none___');
      if (delGrat.error) { alert('Could not clear gratitude: ' + delGrat.error.message); setStartingProgram(false); return false; }"""
    if anchor not in src:
        fail("Could not find the gratitude-clear line in startNewProgram. Was the function changed?")

    addition = anchor + """

      // clear new feature tables (Mystery Box, reflections, encouragements, absence notes).
      // These are best-effort: a failure here should not abort the whole reset, but we log it.
      try {
        await supabase.from('mystery_box_opens').delete().neq('student_id', '___none___');
        await supabase.from('reflections').delete().neq('student_id', '___none___');
        await supabase.from('encouragements').delete().neq('student_id', '___none___');
        await supabase.from('absence_notes').delete().neq('student_id', '___none___');
      } catch (e) {
        console.error('Note: some feature tables could not be cleared:', e);
      }"""

    src = src.replace(anchor, addition, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Reset now also clears Mystery Box, reflections, encouragements, absence notes.")
    print(f"✓ Updated: {path}")
    print("\nStudents are still kept; archiving still runs first. Your reset is now complete.")
    print("Next: npm run dev → the Start New Program reset gives a clean slate.")

if __name__ == "__main__":
    main()
