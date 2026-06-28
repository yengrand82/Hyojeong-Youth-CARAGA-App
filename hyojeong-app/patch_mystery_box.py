#!/usr/bin/env python3
"""
Patch: Mystery Box feature for Hyojeong Youth CARAGA App
--------------------------------------------------------
Adds a "purely-for-fun" Mystery Box that unlocks when a student has BOTH
attendance AND gratitude for a session. One box per session. Rewards =
collectible Hyoji stickers (emoji/CSS, swappable) + gentle praise messages.
NO grade impact. Animated reveal with Hyoji. Includes a sticker collection shelf.

Safe by design:
  - Exact-string anchors; aborts if any anchor is missing or ambiguous.
  - Writes a timestamped .bak backup before changing anything.
  - Never overwrites the file blindly.

Usage:
  python3 patch_mystery_box.py path/to/App.jsx
"""

import sys, os, shutil, datetime

def fail(msg):
    print(f"\n❌ PATCH ABORTED: {msg}\n")
    sys.exit(1)

def anchor_replace(src, anchor, replacement, label):
    count = src.count(anchor)
    if count == 0:
        fail(f"[{label}] anchor not found. File may have changed.\n   Anchor: {anchor[:80]!r}")
    if count > 1:
        fail(f"[{label}] anchor appears {count} times (must be unique).\n   Anchor: {anchor[:80]!r}")
    return src.replace(anchor, replacement, 1)

def main():
    if len(sys.argv) < 2:
        fail("Provide the path to App.jsx, e.g. python3 patch_mystery_box.py src/App.jsx")
    path = sys.argv[1]
    if not os.path.isfile(path):
        fail(f"File not found: {path}")

    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    # Idempotency guard
    if "MYSTERY_BOX_STICKERS" in src or "currentPage === 'mystery-box'" in src:
        fail("It looks like the Mystery Box patch is already applied (found marker). Nothing to do.")

    # Backup
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = f"{path}.{ts}.bak"
    shutil.copy2(path, bak)
    print(f"✓ Backup written: {bak}")

    # ------------------------------------------------------------------
    # 1) Module-level data: sticker pool + praise pool (near QUOTES)
    # ------------------------------------------------------------------
    anchor_quotes = "// Get daily quote (rotates based on day of year)"
    mystery_data = """// === MYSTERY BOX (purely for fun — no grade impact) ===
// Collectible Hyoji stickers. Swap `art` for <img> paths later when real
// artwork is ready; the rest of the app keys off `id`.
const MYSTERY_BOX_STICKERS = [
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
];

// Gentle praise — always positive, never guilt or pressure.
const MYSTERY_BOX_PRAISE = [
  "Your faithful heart shines today! 🌟",
  "Heaven smiles when you show up with love. 💗",
  "You are growing more beautiful inside every week!",
  "Thank you for living for the sake of others. 🙏",
  "Your gratitude makes the whole garden brighter! 🌸",
  "You are a true child of Heavenly Parent. 💛",
  "Small faithful steps make a great heart. Keep going!",
  "Your presence is a gift to everyone here. 🎁",
  "What a kind and bright heart you have!",
  "You make your family and community proud today. 🌞"
];

// Get daily quote (rotates based on day of year)"""
    src = anchor_replace(src, anchor_quotes, mystery_data, "module data")

    # ------------------------------------------------------------------
    # 2) State declarations (after myAttendanceMarks)
    # ------------------------------------------------------------------
    anchor_state = "  const [myAttendanceMarks, setMyAttendanceMarks] = useState([]); // logged-in student's per-session marks"
    state_add = anchor_state + """
  const [myBoxOpens, setMyBoxOpens] = useState([]); // mystery box opens for logged-in student
  const [boxRevealing, setBoxRevealing] = useState(false); // reveal animation in progress
  const [boxReward, setBoxReward] = useState(null); // the reward just revealed
  const [boxSessionTarget, setBoxSessionTarget] = useState(null); // session the open is for"""
    src = anchor_replace(src, anchor_state, state_add, "state declarations")

    # ------------------------------------------------------------------
    # 3) Loader + helpers (after loadMyAttendanceMarks function)
    # ------------------------------------------------------------------
    anchor_loader = """      setMyAttendanceMarks([]);
    }
  };

  const loadStudentProgress = async (studId) => {"""
    loader_add = """      setMyAttendanceMarks([]);
    }
  };

  // === MYSTERY BOX helpers (purely for fun — never touch grades) ===
  // Load which sessions this student has already opened a box for.
  const loadMyBoxOpens = async (studId) => {
    try {
      const { data, error } = await supabase
        .from('mystery_box_opens')
        .select('session_number, reward_type, reward_id, reward_label, opened_at')
        .eq('student_id', studId)
        .order('session_number', { ascending: true });
      if (error) { console.error('Error loading mystery boxes:', error); setMyBoxOpens([]); return; }
      setMyBoxOpens(data || []);
    } catch (err) {
      console.error('Error loading mystery boxes:', err);
      setMyBoxOpens([]);
    }
  };

  // Sessions where the student has BOTH attendance and gratitude.
  const eligibleBoxSessions = () =>
    (myAttendanceMarks || [])
      .filter(m => m.attendance && m.gratitude)
      .map(m => m.session_number);

  // The next session with an unopened, eligible box (or null).
  const nextBoxSession = () => {
    const opened = new Set((myBoxOpens || []).map(b => b.session_number));
    const eligible = eligibleBoxSessions().filter(s => !opened.has(s));
    return eligible.length ? Math.min(...eligible) : null;
  };

  // Open the box for a session: draw a random reward, save it, animate.
  const openMysteryBox = async (sessionNum) => {
    if (sessionNum == null) return;
    const studId = studentData && studentData['Student ID'];
    if (!studId) return;
    // 50/50 sticker vs praise; stickers are collectible.
    const giveSticker = Math.random() < 0.5;
    let reward;
    if (giveSticker) {
      const s = MYSTERY_BOX_STICKERS[Math.floor(Math.random() * MYSTERY_BOX_STICKERS.length)];
      reward = { type: 'sticker', id: s.id, label: s.name, art: s.art, color: s.color };
    } else {
      const msg = MYSTERY_BOX_PRAISE[Math.floor(Math.random() * MYSTERY_BOX_PRAISE.length)];
      reward = { type: 'praise', id: 'praise', label: msg, art: '💌', color: '#FBCFE8' };
    }
    // Start the reveal animation immediately.
    setBoxSessionTarget(sessionNum);
    setBoxReward(reward);
    setBoxRevealing(true);
    // Persist (unique on student_id + session_number prevents double-open).
    try {
      const { error } = await supabase.from('mystery_box_opens').upsert({
        student_id: studId,
        session_number: sessionNum,
        reward_type: reward.type,
        reward_id: reward.id,
        reward_label: reward.label,
        opened_at: new Date().toISOString()
      }, { onConflict: 'student_id,session_number' });
      if (error) console.error('Save mystery box error:', error);
      await loadMyBoxOpens(studId);
    } catch (err) {
      console.error('Save mystery box error:', err);
    }
  };

  // Distinct stickers the student has collected (for the shelf).
  const myStickerCollection = () => {
    const ids = (myBoxOpens || [])
      .filter(b => b.reward_type === 'sticker')
      .map(b => b.reward_id);
    const have = new Set(ids);
    return MYSTERY_BOX_STICKERS.map(s => ({ ...s, owned: have.has(s.id) }));
  };

  const loadStudentProgress = async (studId) => {"""
    src = anchor_replace(src, anchor_loader, loader_add, "loaders/helpers")

    # ------------------------------------------------------------------
    # 4) Load boxes on login (Promise.all in onLogin)
    # ------------------------------------------------------------------
    anchor_login = """      loadMyGratitudeEntries(student['Student ID']),
      loadStudentProgress(student['Student ID']),
      loadMyAttendanceMarks(student['Student ID']),"""
    login_add = """      loadMyGratitudeEntries(student['Student ID']),
      loadStudentProgress(student['Student ID']),
      loadMyAttendanceMarks(student['Student ID']),
      loadMyBoxOpens(student['Student ID']),"""
    src = anchor_replace(src, anchor_login, login_add, "login loaders")

    # ------------------------------------------------------------------
    # 5) Home page: add Mystery Box button (before Badges button)
    # ------------------------------------------------------------------
    anchor_home_btn = """            <button onClick={() => setCurrentPage('badges')} style={{background:'#F59E0B', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15}}>
              <span>🏅 My Hyojeong Heart Badges ({earnedBadges.length}/{BADGES.length})</span>
              <ChevronRight size={20} />
            </button>"""
    home_btn_add = """            {(() => {
              const ready = nextBoxSession();
              return (
                <button onClick={() => { setBoxReward(null); setBoxRevealing(false); setCurrentPage('mystery-box'); }}
                  style={{background: ready ? 'linear-gradient(135deg,#a855f7,#ec4899)' : '#C4B5FD', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15, position:'relative', animation: ready ? 'mbWiggle 1.4s ease-in-out infinite' : 'none'}}>
                  <span>🎁 Mystery Box {ready ? '— a box is waiting!' : ''}</span>
                  {ready
                    ? <span style={{background:'#FDE68A', color:'#92400E', borderRadius:99, fontSize:11, fontWeight:800, padding:'2px 8px'}}>NEW</span>
                    : <ChevronRight size={20} />}
                </button>
              );
            })()}
            <button onClick={() => setCurrentPage('badges')} style={{background:'#F59E0B', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15}}>
              <span>🏅 My Hyojeong Heart Badges ({earnedBadges.length}/{BADGES.length})</span>
              <ChevronRight size={20} />
            </button>"""
    src = anchor_replace(src, anchor_home_btn, home_btn_add, "home button")

    # ------------------------------------------------------------------
    # 6) New Mystery Box page (before the badges page render)
    # ------------------------------------------------------------------
    anchor_page = "  if (currentPage === 'badges' && studentData) {"
    page_add = """  if (currentPage === 'mystery-box' && studentData) {
    const ready = nextBoxSession();
    const stickers = myStickerCollection();
    const ownedCount = stickers.filter(s => s.owned).length;
    return (
      <div className="min-h-screen" style={{background:'linear-gradient(135deg,#1e1b4b,#4c1d95,#831843)', paddingBottom:90}}>
        <div style={{padding:'18px 16px', display:'flex', alignItems:'center', gap:12}}>
          <button onClick={() => { setBoxReward(null); setBoxRevealing(false); setCurrentPage('home'); }} className="text-white font-bold"><ArrowLeft className="w-6 h-6" /></button>
          <h1 style={{color:'white', fontSize:22, fontWeight:800, margin:0}}>🎁 Mystery Box</h1>
        </div>

        <div style={{padding:'0 16px'}}>
          {/* The box / reveal area */}
          <div style={{background:'rgba(255,255,255,0.08)', borderRadius:24, padding:'28px 20px', textAlign:'center', marginBottom:18, backdropFilter:'blur(6px)'}}>
            {boxReward ? (
              <div style={{animation:'mbReveal 0.5s ease-out'}}>
                <div style={{fontSize:72, lineHeight:1.1, marginBottom:8}}>{boxReward.art}</div>
                {boxReward.type === 'sticker' ? (
                  <>
                    <div style={{display:'inline-block', background:boxReward.color, borderRadius:99, padding:'6px 16px', fontWeight:800, color:'#4c1d95', marginBottom:10}}>
                      New sticker: {boxReward.label}!
                    </div>
                    <p style={{color:'#E9D5FF', fontSize:14, margin:'6px 0 0'}}>Added to your collection below. 💜</p>
                  </>
                ) : (
                  <p style={{color:'white', fontSize:17, fontWeight:700, lineHeight:1.4, maxWidth:300, margin:'0 auto'}}>{boxReward.label}</p>
                )}
                <button onClick={() => { setBoxReward(null); setBoxRevealing(false); }}
                  style={{marginTop:18, background:'white', color:'#7C3AED', border:'none', borderRadius:14, padding:'12px 28px', fontWeight:800, fontSize:15, cursor:'pointer'}}>
                  Yay! 🎉
                </button>
              </div>
            ) : ready ? (
              <>
                <div onClick={() => openMysteryBox(ready)}
                  style={{fontSize:96, lineHeight:1, cursor:'pointer', display:'inline-block', animation:'mbShake 0.9s ease-in-out infinite'}}>
                  🎁
                </div>
                <p style={{color:'white', fontSize:18, fontWeight:800, margin:'14px 0 4px'}}>A box is waiting for you!</p>
                <p style={{color:'#E9D5FF', fontSize:13, margin:'0 0 16px'}}>Tap the box to open your surprise 💜</p>
                <button onClick={() => openMysteryBox(ready)}
                  style={{background:'linear-gradient(135deg,#f9a8d4,#ec4899)', color:'white', border:'none', borderRadius:16, padding:'14px 32px', fontWeight:800, fontSize:16, cursor:'pointer', boxShadow:'0 6px 20px rgba(236,72,153,0.5)'}}>
                  Open the Box! 🎁
                </button>
              </>
            ) : (
              <>
                <div style={{fontSize:80, lineHeight:1, opacity:0.55, filter:'grayscale(0.3)'}}>🔒</div>
                <p style={{color:'white', fontSize:17, fontWeight:800, margin:'14px 0 6px'}}>No box ready right now</p>
                <p style={{color:'#E9D5FF', fontSize:13, lineHeight:1.5, maxWidth:300, margin:'0 auto'}}>
                  Mark your <b>attendance</b> and write a <b>gratitude</b> for a session, and a new Mystery Box will appear here! 💜
                </p>
              </>
            )}
          </div>

          {/* Sticker collection shelf */}
          <div style={{background:'rgba(255,255,255,0.95)', borderRadius:20, padding:'18px 16px'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12}}>
              <h2 style={{fontSize:16, fontWeight:800, color:'#4c1d95', margin:0}}>My Hyoji Stickers</h2>
              <span style={{fontSize:12, fontWeight:700, color:'#7C3AED', background:'#EDE9FE', borderRadius:99, padding:'3px 10px'}}>{ownedCount}/{stickers.length}</span>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
              {stickers.map(s => (
                <div key={s.id} title={s.owned ? s.name : 'Locked'}
                  style={{aspectRatio:'1', borderRadius:14, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, background: s.owned ? s.color : '#F3F4F6', opacity: s.owned ? 1 : 0.5}}>
                  <span style={{fontSize:26, filter: s.owned ? 'none' : 'grayscale(1)'}}>{s.owned ? s.art : '❔'}</span>
                  <span style={{fontSize:8.5, fontWeight:700, color: s.owned ? '#4c1d95' : '#9CA3AF', textAlign:'center', lineHeight:1.1, padding:'0 2px'}}>{s.owned ? s.name : '???'}</span>
                </div>
              ))}
            </div>
            <p style={{fontSize:11, color:'#9CA3AF', textAlign:'center', margin:'12px 0 0'}}>Open Mystery Boxes to collect them all! Every box is a happy surprise — just for fun. 💜</p>
          </div>
        </div>

        <style>{`
          @keyframes mbWiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-1.5deg)} 75%{transform:rotate(1.5deg)} }
          @keyframes mbShake { 0%,100%{transform:rotate(0deg) scale(1)} 20%{transform:rotate(-8deg) scale(1.05)} 40%{transform:rotate(8deg) scale(1.05)} 60%{transform:rotate(-5deg) scale(1.03)} 80%{transform:rotate(5deg) scale(1.03)} }
          @keyframes mbReveal { 0%{opacity:0; transform:scale(0.4) translateY(20px)} 60%{transform:scale(1.1)} 100%{opacity:1; transform:scale(1) translateY(0)} }
        `}</style>

        <NavBar />
      </div>
    );
  }

  if (currentPage === 'badges' && studentData) {"""
    src = anchor_replace(src, anchor_page, page_add, "mystery box page")

    # ------------------------------------------------------------------
    # Write result
    # ------------------------------------------------------------------
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)

    print("✓ All 6 anchors patched successfully.")
    print(f"✓ Updated: {path}")
    print("\nNext steps:")
    print("  1) Run the SQL (create_mystery_box_table.sql) in Supabase.")
    print("  2) npm run dev  →  log in as a student who has attendance+gratitude for a session.")
    print("  3) If anything looks off, restore from the .bak file above.")

if __name__ == "__main__":
    main()
