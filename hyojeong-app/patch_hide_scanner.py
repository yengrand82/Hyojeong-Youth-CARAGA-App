#!/usr/bin/env python3
"""
Patch: Hide the quiz answer-sheet scanner (panel + button)
----------------------------------------------------------
The AI scanner needs a server-side backend (the Anthropic API blocks direct
browser calls via CORS), which can't be safely built before launch. This patch
HIDES the scan panel and the per-student Scan button so nobody hits the error,
while leaving everything else intact: search box, team filter, manual quiz
entry, dashboard buttons, Mystery Box, duplicate check.

The scanner code stays dormant (unused) so it's easy to re-enable later once a
backend exists — just flip these conditions back to isAdmin.

Safe by design: exact-string anchors, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_hide_scanner.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_hide_scanner.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "/* scanner-hidden */" in src:
        fail("Scanner already hidden (found marker). Nothing to do.")
    if "📷 Scan Answer Sheets (assisted)" not in src:
        fail("Could not find the scanner panel. Is the scanner patch applied?")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # 1) Hide the scan panel: anchor by its unique heading line.
    panel_anchor = """        {isAdmin && (
          <div className=\"bg-white rounded-xl p-3 mb-3 border-2 border-purple-200\">
            <p className=\"text-xs font-black text-purple-700 uppercase tracking-wide mb-2\">📷 Scan Answer Sheets (assisted)</p>"""
    panel_new = """        {false /* scanner-hidden: needs backend, re-enable with isAdmin after building it */ && (
          <div className=\"bg-white rounded-xl p-3 mb-3 border-2 border-purple-200\">
            <p className=\"text-xs font-black text-purple-700 uppercase tracking-wide mb-2\">📷 Scan Answer Sheets (assisted)</p>"""
    if panel_anchor not in src:
        fail("Could not match the scan panel block exactly.")
    src = src.replace(panel_anchor, panel_new, 1)

    # 2) Hide the per-student Scan button: anchor by the Box(...) line that precedes it.
    btn_anchor = """                {Box('quiz1')}{Box('quiz2')}{Box('quiz3')}
                {isAdmin && (
                  <label className={`ml-1 px-2 h-10 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer ${scanBusy && scanningSid===sid ? 'bg-gray-200 text-gray-400' : 'bg-purple-100 text-purple-700'}`}>"""
    btn_new = """                {Box('quiz1')}{Box('quiz2')}{Box('quiz3')}
                {false /* scanner-hidden */ && (
                  <label className={`ml-1 px-2 h-10 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer ${scanBusy && scanningSid===sid ? 'bg-gray-200 text-gray-400' : 'bg-purple-100 text-purple-700'}`}>"""
    if btn_anchor not in src:
        fail("Could not match the Scan button block exactly.")
    src = src.replace(btn_anchor, btn_new, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Quiz scanner hidden (panel + button). Everything else stays.")
    print(f"✓ Updated: {path}")
    print("\nThe Quiz Scores screen now shows: search, team filter, and manual entry.")
    print("To re-enable the scanner later (after building a backend), change the two")
    print("'false /* scanner-hidden */' conditions back to 'isAdmin'.")

if __name__ == "__main__":
    main()
