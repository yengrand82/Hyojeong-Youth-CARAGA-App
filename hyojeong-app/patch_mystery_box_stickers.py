#!/usr/bin/env python3
"""
Patch 2: Beautify unlocked Mystery Box sticker cards
----------------------------------------------------
Makes EARNED stickers feel special — subtle & elegant:
  - keeps each sticker's own pastel color (now as a soft gradient)
  - gentle floating motion + soft colored glow
  - a quiet shine sheen across the card
  - a small ✓ "earned" badge in the corner
Locked cards stay calm and quiet so unlocked ones stand out by contrast.

Run AFTER patch_mystery_box.py (it edits the sticker shelf that patch added).

Safe by design: exact-string anchor, timestamped .bak backup, aborts if the
anchor isn't found or is ambiguous, and refuses to double-apply.

Usage:
  python3 patch_mystery_box_stickers.py src/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_mystery_box_stickers.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    if "mbStickerFloat" in src or "mb-sticker-card" in src:
        fail("Sticker beautify patch already applied (found marker). Nothing to do.")

    if "{stickers.map(s => (" not in src:
        fail("Could not find the sticker shelf. Run patch_mystery_box.py first.")

    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # ------------------------------------------------------------------
    # 1) Replace the sticker card render block
    # ------------------------------------------------------------------
    old_cards = """            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
              {stickers.map(s => (
                <div key={s.id} title={s.owned ? s.name : 'Locked'}
                  style={{aspectRatio:'1', borderRadius:14, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, background: s.owned ? s.color : '#F3F4F6', opacity: s.owned ? 1 : 0.5}}>
                  <span style={{fontSize:26, filter: s.owned ? 'none' : 'grayscale(1)'}}>{s.owned ? s.art : '❔'}</span>
                  <span style={{fontSize:8.5, fontWeight:700, color: s.owned ? '#4c1d95' : '#9CA3AF', textAlign:'center', lineHeight:1.1, padding:'0 2px'}}>{s.owned ? s.name : '???'}</span>
                </div>
              ))}
            </div>"""

    new_cards = """            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
              {stickers.map((s, i) => (
                s.owned ? (
                  <div key={s.id} title={s.name} className="mb-sticker-card"
                    style={{position:'relative', aspectRatio:'1', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, overflow:'hidden',
                      background:`linear-gradient(150deg, ${s.color} 0%, #ffffff 130%)`,
                      border:'1px solid rgba(255,255,255,0.7)',
                      boxShadow:`0 4px 14px -2px ${s.color}, 0 1px 3px rgba(76,29,149,0.12)`,
                      animation:`mbStickerFloat 3.2s ease-in-out ${(i % 4) * 0.25}s infinite`}}>
                    {/* soft shine sheen */}
                    <span style={{position:'absolute', inset:0, background:'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 48%, transparent 62%)', pointerEvents:'none', animation:`mbStickerSheen 4.5s ease-in-out ${(i % 5) * 0.4}s infinite`}} />
                    {/* earned badge */}
                    <span style={{position:'absolute', top:4, right:4, width:16, height:16, borderRadius:'50%', background:'rgba(255,255,255,0.9)', color:'#16a34a', fontSize:10, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.12)'}}>✓</span>
                    <span style={{fontSize:28, position:'relative', filter:'drop-shadow(0 1px 1px rgba(0,0,0,0.12))'}}>{s.art}</span>
                    <span style={{fontSize:8.5, fontWeight:800, color:'#4c1d95', textAlign:'center', lineHeight:1.1, padding:'0 2px', position:'relative'}}>{s.name}</span>
                  </div>
                ) : (
                  <div key={s.id} title="Locked"
                    style={{aspectRatio:'1', borderRadius:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, background:'#F3F4F6', border:'1px dashed #E5E7EB', opacity:0.7}}>
                    <span style={{fontSize:24, filter:'grayscale(1)', opacity:0.6}}>❔</span>
                    <span style={{fontSize:8.5, fontWeight:700, color:'#C4C4CC', textAlign:'center', lineHeight:1.1}}>???</span>
                  </div>
                )
              ))}
            </div>"""

    if old_cards not in src:
        fail("The sticker card block didn't match exactly (it may already be customized). No changes made.")
    if src.count(old_cards) > 1:
        fail("The sticker card block appears more than once (unexpected). No changes made.")
    src = src.replace(old_cards, new_cards, 1)

    # ------------------------------------------------------------------
    # 2) Add the keyframes to the page's <style> block
    # ------------------------------------------------------------------
    old_style = """          @keyframes mbReveal { 0%{opacity:0; transform:scale(0.4) translateY(20px)} 60%{transform:scale(1.1)} 100%{opacity:1; transform:scale(1) translateY(0)} }
        `}</style>"""
    new_style = """          @keyframes mbReveal { 0%{opacity:0; transform:scale(0.4) translateY(20px)} 60%{transform:scale(1.1)} 100%{opacity:1; transform:scale(1) translateY(0)} }
          @keyframes mbStickerFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
          @keyframes mbStickerSheen { 0%,70%,100%{transform:translateX(-120%)} 85%{transform:translateX(120%)} }
        `}</style>"""
    if old_style not in src:
        fail("Could not find the <style> block to add keyframes. No changes written beyond backup; restore from .bak if needed.")
    src = src.replace(old_style, new_style, 1)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ Sticker cards beautified (soft glow + gentle float + sheen + ✓ badge).")
    print(f"✓ Updated: {path}")
    print("\nNext: npm run dev → open the Mystery Box page and check the shelf.")
    print("Restore from the .bak above if anything looks off.")

if __name__ == "__main__":
    main()
