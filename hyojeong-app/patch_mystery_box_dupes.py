#!/usr/bin/env python3
"""
Patch 4: Warm duplicates (no empty-feeling repeat stickers)
-----------------------------------------------------------
Makes the Mystery Box feel good for the whole 7-month program even with 12
stickers:
  - If the draw would give a sticker the student does NOT own yet -> new sticker
    (unchanged behaviour).
  - If it would give one they ALREADY own -> a warm "Hyoji hug" moment instead:
    the owned Hyoji appears with a kind message, never an empty repeat.
  - Once all 12 are collected -> every box is a guaranteed warm hug/praise.

No new art, no schema change. Runs AFTER the three earlier Mystery Box patches.

Safe by design: exact-string anchors, .bak backup, aborts if anchor missing,
refuses to double-apply.

Usage:
  python3 patch_mystery_box_dupes.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_mystery_box_dupes.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "MYSTERY_BOX_HUGS" in src:
        fail("Warm-duplicates patch already applied (found marker). Nothing to do.")

    if "const openMysteryBox = async" not in src:
        fail("Could not find openMysteryBox. Run the earlier Mystery Box patches first.")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # ------------------------------------------------------------------
    # 1) Add a small pool of warm "hug" lines next to the praise pool.
    # ------------------------------------------------------------------
    praise_marker = "const MYSTERY_BOX_PRAISE = ["
    if praise_marker not in src:
        fail("Could not find MYSTERY_BOX_PRAISE to anchor the hug pool.")
    hug_pool = """const MYSTERY_BOX_HUGS = [
  "Hyoji sends you a warm hug! 💗",
  "You already have this Hyoji — here's some love instead! 🤗",
  "Hyoji is so happy to see you again today! 💛",
  "A little hug from Hyoji for showing up! 🌸",
  "Hyoji says: keep shining, dear friend! ✨",
  "Same sweet Hyoji, double the love! 💕"
];

const MYSTERY_BOX_PRAISE = ["""
    src = src.replace(praise_marker, hug_pool, 1)

    # ------------------------------------------------------------------
    # 2) Rework the draw logic: check ownership; duplicates become hugs.
    # ------------------------------------------------------------------
    old_draw = """    // 50/50 sticker vs praise; stickers are collectible.
    const giveSticker = Math.random() < 0.5;
    let reward;
    if (giveSticker) {
      const s = MYSTERY_BOX_STICKERS[Math.floor(Math.random() * MYSTERY_BOX_STICKERS.length)];
      reward = { type: 'sticker', id: s.id, label: s.name, art: s.art, color: s.color };
    } else {
      const msg = MYSTERY_BOX_PRAISE[Math.floor(Math.random() * MYSTERY_BOX_PRAISE.length)];
      reward = { type: 'praise', id: 'praise', label: msg, art: '💌', color: '#FBCFE8' };
    }"""

    new_draw = """    // Which stickers does the student already own?
    const ownedIds = new Set((myBoxOpens || [])
      .filter(b => b.reward_type === 'sticker')
      .map(b => b.reward_id));
    const unowned = MYSTERY_BOX_STICKERS.filter(s => !ownedIds.has(s.id));
    // 50/50 sticker vs praise; stickers are collectible.
    const giveSticker = Math.random() < 0.5;
    let reward;
    if (giveSticker && unowned.length > 0) {
      // Brand-new sticker to collect.
      const s = unowned[Math.floor(Math.random() * unowned.length)];
      reward = { type: 'sticker', id: s.id, label: s.name, art: s.art, color: s.color };
    } else if (giveSticker && unowned.length === 0) {
      // Already collected them all -> warm hug, never an empty repeat.
      const owned = MYSTERY_BOX_STICKERS[Math.floor(Math.random() * MYSTERY_BOX_STICKERS.length)];
      const msg = MYSTERY_BOX_HUGS[Math.floor(Math.random() * MYSTERY_BOX_HUGS.length)];
      reward = { type: 'hug', id: owned.id, label: msg, art: '💗', color: owned.color };
    } else {
      // Praise message (also used as the kind landing for non-sticker draws).
      const msg = MYSTERY_BOX_PRAISE[Math.floor(Math.random() * MYSTERY_BOX_PRAISE.length)];
      reward = { type: 'praise', id: 'praise', label: msg, art: '💌', color: '#FBCFE8' };
    }"""

    if old_draw not in src:
        fail("The draw logic didn't match exactly. No changes beyond backup.")
    src = src.replace(old_draw, new_draw, 1)

    # ------------------------------------------------------------------
    # 3) Reveal: show the owned Hyoji art for 'hug' rewards (not an emoji).
    #    The art line currently switches sticker vs everything-else.
    # ------------------------------------------------------------------
    old_art = """                  {boxReward.type === 'sticker'
                    ? <StickerArt sticker={MYSTERY_BOX_STICKERS.find(s => s.id === boxReward.id) || boxReward} size={92} />
                    : <span style={{fontSize:72, lineHeight:1.1}}>{boxReward.art}</span>}"""
    new_art = """                  {(boxReward.type === 'sticker' || boxReward.type === 'hug')
                    ? <StickerArt sticker={MYSTERY_BOX_STICKERS.find(s => s.id === boxReward.id) || boxReward} size={92} />
                    : <span style={{fontSize:72, lineHeight:1.1}}>{boxReward.art}</span>}"""
    if old_art not in src:
        fail("Could not find the reveal art line to update for hugs. No changes beyond backup.")
    src = src.replace(old_art, new_art, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Warm duplicates applied — repeats now give a Hyoji hug.")
    print(f"✓ Updated: {path}")
    print("\nNote: 'hug' rewards are saved with reward_type='hug' and do NOT add a")
    print("new shelf sticker (the student already owns it). Reveal shows the Hyoji.")
    print("Next: npm run dev → collect a few, then keep opening to see a hug.")

if __name__ == "__main__":
    main()
