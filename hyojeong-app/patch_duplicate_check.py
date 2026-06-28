#!/usr/bin/env python3
"""
Patch: Duplicate registration helper (pending screen)
-----------------------------------------------------
When someone fills the sign-up form but ALREADY has an account, the pending
card now:
  - Shows a clear red "May already be registered (HJxxx)" banner.
  - Offers a "Copy 'Already Registered' Message" button (English) so you can
    paste a warm note on Messenger telling them they're already in and how to
    log in — then you Reject the duplicate.

Matching is name + birthday (first+last+DOB, case/space-insensitive), compared
against ACTIVE students in the roster. The app never sends messages itself —
it copies text for you to paste, exactly like the welcome message.

Safe by design: exact-string anchors, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_duplicate_check.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_duplicate_check.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "findExistingMatch" in src:
        fail("Duplicate-check patch already applied (found marker). Nothing to do.")

    if "const copyWelcomeMessage = async (reg) => {" not in src:
        fail("Could not find the pending screen functions. Is this the right App.jsx?")

    # Pre-flight: make sure the loadPendingRegs anchor we patch exists.
    if "      setPendingRegs(data || []);" not in src:
        fail("Could not find loadPendingRegs body to ensure roster load.")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # ------------------------------------------------------------------
    # 1) Add helpers just before copyWelcomeMessage.
    #    - normalize() for tolerant string compare
    #    - findExistingMatch(reg) -> matching ACTIVE student or null
    #    - copyAlreadyRegisteredMessage(reg, existing)
    # ------------------------------------------------------------------
    anchor = "  const copyWelcomeMessage = async (reg) => {"
    helpers = """  // --- Duplicate registration detection (name + birthday) ---
  const normalizeName = (s) => (s || '').toString().trim().toLowerCase().replace(/\\s+/g, ' ');
  const normalizeDob = (s) => (s || '').toString().trim().slice(0, 10); // YYYY-MM-DD

  // Find an existing ACTIVE student matching this pending reg by name + DOB.
  // Returns the matching roster record, or null. Never matches the reg itself.
  const findExistingMatch = (reg) => {
    const fn = normalizeName(reg.first_name);
    const ln = normalizeName(reg.last_name);
    const dob = normalizeDob(reg.date_of_birth);
    if (!fn || !ln) return null;
    const list = allStudents || [];
    for (const s of list) {
      if (s['Student ID'] === reg.student_id) continue;      // skip self
      if ((s['Status'] || 'active') === 'pending') continue;  // only existing accounts
      const sameName = normalizeName(s['First Name']) === fn && normalizeName(s['Last Name']) === ln;
      if (!sameName) continue;
      // If both have a DOB, require it to match; if either is missing, name match is enough to flag.
      const sDob = normalizeDob(s['Date of Birth']);
      if (dob && sDob && dob !== sDob) continue;
      return s;
    }
    return null;
  };

  // Copy a friendly "you already have an account" message to paste on Messenger.
  const copyAlreadyRegisteredMessage = async (reg, existing) => {
    const name = (reg.first_name || '').trim() || 'there';
    const sid = (existing && existing['Student ID']) || '(your existing ID)';
    const msg =
      `Hi ${name}! 🌱 Thank you for signing up again — but good news, ` +
      `you already have an account with us! 💜\\n\\n` +
      `There's no need to register a second time. Here's your login:\\n\\n` +
      `🆔 Student ID: ${sid}\\n` +
      `🔑 Password: hyojeong2026 (or the one you set)\\n\\n` +
      `Just open the app at hjcaraga.org and log in. If you forgot your password, ` +
      `message me and I'll help you. 😊\\n\\n` +
      `We're so happy you're part of Hyojeong Youth Caraga. You belong here! 🎉`;
    try {
      await navigator.clipboard.writeText(msg);
      alert('Message copied! 📋\\nNow paste it to ' + name + ' on Facebook Messenger, then Reject this duplicate.');
    } catch (err) {
      window.prompt('Copy this message:', msg);
    }
  };

  const copyWelcomeMessage = async (reg) => {"""
    if anchor not in src:
        fail("Could not find copyWelcomeMessage anchor.")
    src = src.replace(anchor, helpers, 1)

    # ------------------------------------------------------------------
    # 1b) Ensure the roster is loaded when opening Pending (so matching works
    #     even if the admin somehow lands here before loadStudents ran).
    # ------------------------------------------------------------------
    old_load = "      setPendingRegs(data || []);"
    new_load = ("      setPendingRegs(data || []);\n"
                "      if ((allStudents || []).length === 0 && typeof loadStudents === 'function') { try { await loadStudents(); } catch (e) {} }")
    if old_load not in src:
        fail("Could not find setPendingRegs line for roster-load safety.")
    src = src.replace(old_load, new_load, 1)

    # ------------------------------------------------------------------
    # 2) In the pending card map, compute the match per card.
    # ------------------------------------------------------------------
    old_compute = """          const edit = pendingEdits[reg.student_id] || {};
          const realAge = ageFromDob(reg.date_of_birth);"""
    new_compute = """          const edit = pendingEdits[reg.student_id] || {};
          const existingMatch = findExistingMatch(reg);
          const realAge = ageFromDob(reg.date_of_birth);"""
    if old_compute not in src:
        fail("Could not find the per-card compute anchor.")
    src = src.replace(old_compute, new_compute, 1)

    # ------------------------------------------------------------------
    # 3) Add the duplicate banner right after the age warning block.
    # ------------------------------------------------------------------
    old_banner = """              {(veryYoung || adult) && (
                <div className={`mt-2 text-xs font-bold rounded-lg px-3 py-2 ${veryYoung ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {veryYoung ? '⚠️ Very young — confirm this is a child member and check guardian details.' : 'ℹ️ Age 25+ — confirm member vs. parent/guardian.'}
                </div>
              )}"""
    new_banner = old_banner + """

              {existingMatch && (
                <div className="mt-2 text-xs font-bold rounded-lg px-3 py-2 bg-red-100 text-red-700">
                  ⚠️ May already be registered as {existingMatch['First Name']} {existingMatch['Last Name']} ({existingMatch['Student ID']}). Consider rejecting this duplicate instead of approving.
                </div>
              )}"""
    if old_banner not in src:
        fail("Could not find the age-warning block to anchor the duplicate banner.")
    src = src.replace(old_banner, new_banner, 1)

    # ------------------------------------------------------------------
    # 4) Add the "Already Registered" copy button before the welcome button,
    #    shown ONLY when there's a match.
    # ------------------------------------------------------------------
    old_welcome_btn = """              <button
                onClick={() => copyWelcomeMessage(reg)}
                className=\"mt-4 w-full bg-blue-50 text-blue-600 font-bold rounded-xl py-3 border-2 border-blue-200 flex items-center justify-center gap-2\"
              >
                📋 Copy Welcome Message (for Facebook)
              </button>"""
    new_welcome_btn = """              {existingMatch && (
                <button
                  onClick={() => copyAlreadyRegisteredMessage(reg, existingMatch)}
                  className=\"mt-4 w-full bg-red-50 text-red-600 font-bold rounded-xl py-3 border-2 border-red-200 flex items-center justify-center gap-2\"
                >
                  📋 Copy \"Already Registered\" Message
                </button>
              )}

              <button
                onClick={() => copyWelcomeMessage(reg)}
                className=\"mt-4 w-full bg-blue-50 text-blue-600 font-bold rounded-xl py-3 border-2 border-blue-200 flex items-center justify-center gap-2\"
              >
                📋 Copy Welcome Message (for Facebook)
              </button>"""
    if old_welcome_btn not in src:
        fail("Could not find the welcome-message button to anchor the new button.")
    src = src.replace(old_welcome_btn, new_welcome_btn, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Duplicate-registration helper applied to the pending screen.")
    print(f"✓ Updated: {path}")
    print("\nHow it works:")
    print("  - A red banner flags pending sign-ups that match an existing account.")
    print("  - A red 'Already Registered' button copies a message to paste, then Reject.")
    print("  - Matching is name + birthday vs. active students.")
    print("\nNext: npm run dev → open Pending Registrations. Renz (HJ183) should flag")
    print("if his existing account has the same name + birthday.")

if __name__ == "__main__":
    main()
