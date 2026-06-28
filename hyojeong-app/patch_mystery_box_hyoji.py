#!/usr/bin/env python3
"""
Patch 3: Hyoji character stickers (SVG art with arms + legs)
------------------------------------------------------------
Replaces the placeholder emoji in the Mystery Box with 12 little drawn Hyoji
characters (the same pink heart mascot, posed with each item). Updates BOTH:
  - the box-reveal animation (the big burst when a box opens)
  - the collection shelf cards
Praise rewards keep their 💌 emoji (handled by a fallback).

Run AFTER patch_mystery_box.py and patch_mystery_box_stickers.py.

Safe by design: exact-string anchors, timestamped .bak backup, aborts if an
anchor is missing/ambiguous, refuses to double-apply.

Usage:
  python3 patch_mystery_box_hyoji.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

# --- The 12 Hyoji SVGs as compact strings (viewBox 0 0 120 150) ---------------
# Each is a self-contained <svg>. gradient ids are unique per sticker (h1..h12).
def hyoji(gid, extra_top="", item="", eyes="open"):
    # base limbs (legs + feet, two arms default down) — arms/extra overridden per pose via `extra_top`
    pass  # not used; SVGs are inlined explicitly below for clarity/safety

SVGS = {
"hyoji_wave": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h1' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='30' y1='80' x2='14' y2='88'/><line x1='90' y1='78' x2='104' y2='58'/></g><circle cx='12' cy='90' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><circle cx='106' cy='56' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h1)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 71 Q60 78 67 71' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/></svg>",
"hyoji_heart": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h2' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='32' y1='82' x2='46' y2='96'/><line x1='88' y1='82' x2='74' y2='96'/></g><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h2)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 71 Q60 78 67 71' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><path d='M60 100 C52 92 42 95 44 103 C45 109 53 113 60 118 C67 113 75 109 76 103 C78 95 68 92 60 100Z' fill='%23ef4444' stroke='%23b91c1c' stroke-width='1.2'/></svg>",
"hyoji_pray": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h3' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='34' y1='84' x2='54' y2='98'/><line x1='86' y1='84' x2='66' y2='98'/></g><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h3)' stroke='%23db2777' stroke-width='1.5'/><path d='M40 55 Q46 50 52 55' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><path d='M68 55 Q74 50 80 55' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><ellipse cx='40' cy='66' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='66' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M54 72 Q60 76 66 72' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><ellipse cx='60' cy='100' rx='9' ry='12' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><path d='M60 90 L60 110 M53 95 L67 95' stroke='%23f9a8d4' stroke-width='1.5' stroke-linecap='round'/></svg>",
"hyoji_star": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h4' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='30' y1='80' x2='16' y2='64'/><line x1='90' y1='80' x2='104' y2='64'/></g><circle cx='14' cy='62' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><circle cx='106' cy='62' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h4)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 71 Q60 78 67 71' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><path d='M60 6 l3 7 7.5 1 -5.5 5.5 1.3 7.7 -6.3-3.6 -6.3 3.6 1.3-7.7 -5.5-5.5 7.5-1Z' fill='%23fbbf24' stroke='%23f59e0b' stroke-width='1'/></svg>",
"hyoji_sun": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h5' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23fbbf24' stroke-width='3' stroke-linecap='round'><line x1='60' y1='2' x2='60' y2='12'/><line x1='98' y1='16' x2='91' y2='23'/><line x1='22' y1='16' x2='29' y2='23'/></g><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='30' y1='80' x2='14' y2='74'/><line x1='90' y1='80' x2='106' y2='74'/></g><circle cx='12' cy='74' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><circle cx='108' cy='74' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h5)' stroke='%23db2777' stroke-width='1.5'/><path d='M40 54 Q46 49 52 54' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><path d='M68 54 Q74 49 80 54' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><ellipse cx='40' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M51 71 Q60 80 69 71' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/></svg>",
"hyoji_flower": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h6' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='32' y1='82' x2='46' y2='94'/><line x1='90' y1='78' x2='100' y2='60'/></g><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h6)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='54' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='55' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='53.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 71 Q60 78 67 71' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><g transform='translate(103,54)'><circle r='3.5' fill='%23fde047'/><ellipse cx='0' cy='-7' rx='3' ry='4.5' fill='%23f472b6'/><ellipse cx='0' cy='7' rx='3' ry='4.5' fill='%23f472b6'/><ellipse cx='7' cy='0' rx='4.5' ry='3' fill='%23f472b6'/><ellipse cx='-7' cy='0' rx='4.5' ry='3' fill='%23f472b6'/><circle r='2.5' fill='%23fde047'/></g></svg>",
"hyoji_dove": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h7' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='46' y2='128'/><line x1='70' y1='108' x2='74' y2='128'/></g><ellipse cx='44' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='30' y1='80' x2='14' y2='86'/><line x1='90' y1='78' x2='100' y2='62'/></g><circle cx='12' cy='88' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h7)' stroke='%23db2777' stroke-width='1.5'/><path d='M40 54 Q46 49 52 54' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><path d='M68 54 Q74 49 80 54' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><ellipse cx='40' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='65' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 71 Q60 78 67 71' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><g transform='translate(101,56)'><ellipse cx='0' cy='0' rx='8' ry='5.5' fill='%23fff' stroke='%23cbd5e1' stroke-width='1'/><path d='M-8 0 q-5 -3 -9 1 q4 2 9 1' fill='%23fff' stroke='%23cbd5e1' stroke-width='1'/><circle cx='3' cy='-1' r='1.2' fill='%231F2937'/></g></svg>",
"hyoji_rainbow": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h8' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><path d='M22 40 Q60 22 98 40' fill='none' stroke='%23a78bfa' stroke-width='4.5' stroke-linecap='round'/><path d='M24 44 Q60 28 96 44' fill='none' stroke='%23f472b6' stroke-width='4.5' stroke-linecap='round'/><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='110' x2='46' y2='130'/><line x1='70' y1='110' x2='74' y2='130'/></g><ellipse cx='44' cy='134' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='134' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='32' y1='84' x2='18' y2='92'/><line x1='88' y1='84' x2='102' y2='92'/></g><path d='M60 102 C26 80 17 56 21 42 C25 29 38 25 49 31 C53 33 57 36 60 40 C63 36 67 33 71 31 C82 25 95 29 99 42 C103 56 94 80 60 102Z' fill='url(%23h8)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='56' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='57' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='74' cy='56' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='57' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='40' cy='67' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='67' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 73 Q60 80 67 73' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/></svg>",
"hyoji_gift": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h9' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='106' x2='46' y2='126'/><line x1='70' y1='106' x2='74' y2='126'/></g><ellipse cx='44' cy='130' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='130' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='34' y1='80' x2='48' y2='92'/><line x1='86' y1='80' x2='72' y2='92'/></g><path d='M60 96 C26 74 17 50 21 36 C25 23 38 19 49 25 C53 27 57 30 60 34 C63 30 67 27 71 25 C82 19 95 23 99 36 C103 50 94 74 60 96Z' fill='url(%23h9)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='50' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='51' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='49.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='50' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='51' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='49.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='61' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='61' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 67 Q60 74 67 67' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><g transform='translate(60,96)'><rect x='-13' y='0' width='26' height='17' rx='2' fill='%23fbbf24' stroke='%23d97706' stroke-width='1'/><rect x='-13' y='0' width='26' height='6' fill='%23f59e0b'/><rect x='-3' y='0' width='6' height='17' fill='%23ef4444'/><path d='M0 0 q-6 -8 -10 -3 q3 4 10 3 q7 1 10 -3 q-4 -5 -10 3Z' fill='%23ef4444'/></g></svg>",
"hyoji_crown": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h10' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='110' x2='46' y2='130'/><line x1='70' y1='110' x2='74' y2='130'/></g><ellipse cx='44' cy='134' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='134' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='32' y1='84' x2='16' y2='90'/><line x1='88' y1='84' x2='104' y2='90'/></g><circle cx='14' cy='92' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><circle cx='106' cy='92' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><path d='M60 102 C26 80 17 56 21 42 C25 29 38 25 49 31 C53 33 57 36 60 40 C63 36 67 33 71 31 C82 25 95 29 99 42 C103 56 94 80 60 102Z' fill='url(%23h10)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='56' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='57' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='55.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='56' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='57' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='55.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='67' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='67' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 73 Q60 80 67 73' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><path d='M40 36 L47 43 L60 32 L73 43 L80 36 L78 49 L42 49 Z' fill='%23fbbf24' stroke='%23d97706' stroke-width='1.2' stroke-linejoin='round'/><circle cx='40' cy='35' r='2.3' fill='%23f472b6'/><circle cx='60' cy='30' r='2.3' fill='%23f472b6'/><circle cx='80' cy='35' r='2.3' fill='%23f472b6'/></svg>",
"hyoji_seed": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h11' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='110' x2='46' y2='130'/><line x1='70' y1='110' x2='74' y2='130'/></g><ellipse cx='44' cy='134' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='76' cy='134' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='30' y1='82' x2='14' y2='90'/><line x1='90' y1='82' x2='106' y2='90'/></g><circle cx='12' cy='92' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><circle cx='108' cy='92' r='4.5' fill='%23f9a8d4' stroke='%23db2777' stroke-width='1.2'/><path d='M60 102 C26 80 17 56 21 42 C25 29 38 25 49 31 C53 33 57 36 60 40 C63 36 67 33 71 31 C82 25 95 29 99 42 C103 56 94 80 60 102Z' fill='url(%23h11)' stroke='%23db2777' stroke-width='1.5'/><ellipse cx='46' cy='56' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='47' cy='57' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='48.2' cy='55.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='74' cy='56' rx='6.5' ry='7.5' fill='%23fff'/><ellipse cx='75' cy='57' rx='3.7' ry='4.2' fill='%231F2937'/><ellipse cx='76.2' cy='55.5' rx='1.3' ry='1.3' fill='%23fff'/><ellipse cx='40' cy='67' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='67' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><path d='M53 73 Q60 80 67 73' stroke='%239d174d' stroke-width='2.5' fill='none' stroke-linecap='round'/><g transform='translate(60,28)'><path d='M0 14 L0 2' stroke='%2316a34a' stroke-width='2.5'/><path d='M0 7 Q-9 3 -11 -5 Q-2 -4 0 5Z' fill='%2322c55e' stroke='%2316a34a' stroke-width='1'/><path d='M0 10 Q9 6 11 -2 Q2 -1 0 8Z' fill='%234ade80' stroke='%2316a34a' stroke-width='1'/></g></svg>",
"hyoji_moon": "<svg viewBox='0 0 120 150' xmlns='http://www.w3.org/2000/svg'><defs><radialGradient id='h12' cx='50%25' cy='40%25' r='60%25'><stop offset='0%25' stop-color='%23f9a8d4'/><stop offset='100%25' stop-color='%23ec4899'/></radialGradient></defs><g stroke='%23db2777' stroke-width='5' stroke-linecap='round'><line x1='50' y1='108' x2='48' y2='128'/><line x1='70' y1='108' x2='72' y2='128'/></g><ellipse cx='46' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><ellipse cx='74' cy='132' rx='7' ry='4' fill='%23fce7f3' stroke='%23db2777' stroke-width='1.2'/><g stroke='%23ec4899' stroke-width='5' stroke-linecap='round'><line x1='32' y1='82' x2='20' y2='94'/><line x1='88' y1='82' x2='100' y2='94'/></g><path d='M60 100 C26 78 17 54 21 40 C25 27 38 23 49 29 C53 31 57 34 60 38 C63 34 67 31 71 29 C82 23 95 27 99 40 C103 54 94 78 60 100Z' fill='url(%23h12)' stroke='%23db2777' stroke-width='1.5'/><path d='M40 56 Q46 60 52 56' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><path d='M68 56 Q74 60 80 56' fill='none' stroke='%231F2937' stroke-width='2' stroke-linecap='round'/><ellipse cx='40' cy='66' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='80' cy='66' rx='5' ry='3.5' fill='%23f59e0b' opacity='0.7'/><ellipse cx='60' cy='73' rx='3.5' ry='4.5' fill='%239d174d' opacity='0.7'/><path d='M88 16 a8 8 0 1 0 8 11 a6 6 0 0 1 -8 -11Z' fill='%23fde68a' stroke='%23f59e0b' stroke-width='1'/></svg>",
}

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_mystery_box_hyoji.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "renderStickerArt" in src or "data:image/svg+xml" in src:
        fail("Hyoji sticker patch already applied (found marker). Nothing to do.")

    old_array_head = "const MYSTERY_BOX_STICKERS = ["
    if old_array_head not in src:
        fail("Could not find MYSTERY_BOX_STICKERS. Run patch_mystery_box.py first.")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # ------------------------------------------------------------------
    # 1) Replace the sticker data array — add an `svg` data-URI to each
    # ------------------------------------------------------------------
    old_array = """const MYSTERY_BOX_STICKERS = [
  { id: 'hyoji_wave',    art: '👋', name: 'Waving Hyoji',     color: '#FDE68A' },
  { id: 'hyoji_heart',   art: '💗', name: 'Hyoji with Heart', color: '#FBCFE8' },
  { id: 'hyoji_pray',    art: '🙏', name: 'Praying Hyoji',    color: '#C7D2FE' },
  { id: 'hyoji_star',    art: '⭐', name: 'Shining Hyoji',    color: '#FEF08A' },
  { id: 'hyoji_sun',     art: '🌞', name: 'Sunny Hyoji',      color: '#FED7AA' },
  { id: 'hyoji_flower',  art: '🌸', name: 'Blossom Hyoji',    color: '#FBCFE8' },
  { id: 'hyoji_dove',    art: '🕊️', name: 'Peace Hyoji',      color: '#BAE6FD' },
  { id: 'hyoji_rainbow', art: '🌈', name: 'Rainbow Hyoji',    color: '#DDD6FE' },
  { id: 'hyoji_gift',    art: '🎁', name: 'Gift Hyoji',       color: '#BBF7D0' },
  { id: 'hyoji_crown',   art: '👑', name: 'Noble Hyoji',      color: '#FEF08A' },
  { id: 'hyoji_seed',    art: '🌱', name: 'Sprout Hyoji',     color: '#BBF7D0' },
  { id: 'hyoji_moon',    art: '🌙', name: 'Dreamy Hyoji',     color: '#C7D2FE' }
];"""

    if old_array not in src:
        fail("The sticker array didn't match exactly (it may already be customized). No changes made.")

    def uri(k):
        return "data:image/svg+xml;utf8," + SVGS[k]

    rows = [
        ("hyoji_wave",    "👋", "Waving Hyoji",     "#FDE68A"),
        ("hyoji_heart",   "💗", "Hyoji with Heart", "#FBCFE8"),
        ("hyoji_pray",    "🙏", "Praying Hyoji",    "#C7D2FE"),
        ("hyoji_star",    "⭐", "Shining Hyoji",    "#FEF08A"),
        ("hyoji_sun",     "🌞", "Sunny Hyoji",      "#FED7AA"),
        ("hyoji_flower",  "🌸", "Blossom Hyoji",    "#FBCFE8"),
        ("hyoji_dove",    "🕊️", "Peace Hyoji",      "#BAE6FD"),
        ("hyoji_rainbow", "🌈", "Rainbow Hyoji",    "#DDD6FE"),
        ("hyoji_gift",    "🎁", "Gift Hyoji",       "#BBF7D0"),
        ("hyoji_crown",   "👑", "Noble Hyoji",      "#FEF08A"),
        ("hyoji_seed",    "🌱", "Sprout Hyoji",     "#BBF7D0"),
        ("hyoji_moon",    "🌙", "Dreamy Hyoji",     "#C7D2FE"),
    ]
    new_lines = ["const MYSTERY_BOX_STICKERS = ["]
    for k, emoji, name, color in rows:
        new_lines.append(
            f"  {{ id: '{k}', art: '{emoji}', name: '{name}', color: '{color}', svg: \"{uri(k)}\" }},"
        )
    new_array = "\n".join(new_lines) + "\n];"
    src = src.replace(old_array, new_array, 1)

    # ------------------------------------------------------------------
    # 2) Add a small helper component just before the sticker shelf usage.
    #    Put it next to MYSTERY_BOX_PRAISE (module scope) so it's global.
    # ------------------------------------------------------------------
    praise_anchor = "// Gentle praise — always positive, never guilt or pressure."
    helper = """// Render a sticker's art: drawn Hyoji SVG if present, else emoji fallback.
const StickerArt = ({ sticker, size = 30 }) => {
  if (sticker && sticker.svg) {
    return <img src={sticker.svg} alt={sticker.name || 'Hyoji'} style={{width:size, height:size, objectFit:'contain', display:'block'}} draggable={false} />;
  }
  return <span style={{fontSize:size}}>{(sticker && sticker.art) || '🎁'}</span>;
};

// Gentle praise — always positive, never guilt or pressure."""
    if praise_anchor not in src:
        fail("Could not find praise anchor to insert helper. Restore from .bak if needed.")
    src = src.replace(praise_anchor, helper, 1)

    # ------------------------------------------------------------------
    # 3) Reveal animation: use the Hyoji art for sticker rewards.
    #    boxReward only has art (emoji); find its sticker by id for the svg.
    # ------------------------------------------------------------------
    old_reveal = """                <div style={{fontSize:72, lineHeight:1.1, marginBottom:8}}>{boxReward.art}</div>"""
    new_reveal = """                <div style={{marginBottom:8, display:'flex', justifyContent:'center'}}>
                  {boxReward.type === 'sticker'
                    ? <StickerArt sticker={MYSTERY_BOX_STICKERS.find(s => s.id === boxReward.id) || boxReward} size={92} />
                    : <span style={{fontSize:72, lineHeight:1.1}}>{boxReward.art}</span>}
                </div>"""
    if old_reveal not in src:
        fail("Could not find the reveal art line. No changes beyond backup.")
    src = src.replace(old_reveal, new_reveal, 1)

    # ------------------------------------------------------------------
    # 4) Shelf card: replace the emoji span with the Hyoji art.
    # ------------------------------------------------------------------
    old_shelf = """                    <span style={{fontSize:28, position:'relative', filter:'drop-shadow(0 1px 1px rgba(0,0,0,0.12))'}}>{s.art}</span>"""
    new_shelf = """                    <span style={{position:'relative', filter:'drop-shadow(0 1px 1px rgba(0,0,0,0.12))'}}><StickerArt sticker={s} size={40} /></span>"""
    if old_shelf not in src:
        fail("Could not find the shelf art span. No changes beyond backup.")
    src = src.replace(old_shelf, new_shelf, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Hyoji character stickers applied (reveal + shelf).")
    print(f"✓ Updated: {path}")
    print("\nNext: npm run dev → open a box and check the shelf.")
    print("Praise rewards keep their 💌 emoji. Restore from .bak if needed.")

if __name__ == "__main__":
    main()
