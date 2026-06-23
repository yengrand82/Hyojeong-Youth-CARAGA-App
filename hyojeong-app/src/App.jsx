import React, { useState, useEffect } from 'react';
import { Home, User, BookOpen, Award, ChevronRight, Calendar, TrendingUp, Users, Heart, MessageSquare, RefreshCw, Trophy, ArrowLeft, X, Sparkles, Gift, Target, UserPlus, Clock } from 'lucide-react';
import { supabase } from './supabaseClient';

const TOTAL_SESSIONS = 21; // Meeting sessions (attendance) per program
const TOTAL_GRATITUDE_SESSIONS = 20; // Gratitude journals per program. Feb-May 2026 = 20; set to 21 for next program.

// Inspirational Quotes - True Parents & Bible Verses
const QUOTES = [
  // True Parents Quotes
  { quote: "Love is giving and forgetting. Love is investing and then forgetting about it.", author: "True Father" },
  { quote: "The family is the school of love, and parents are the textbooks.", author: "True Father" },
  { quote: "Living for the sake of others is the way to bring peace to the world.", author: "True Parents" },
  { quote: "True love begins when you love those who do not love you.", author: "True Father" },
  { quote: "Gratitude is the foundation for receiving Heaven's blessings.", author: "True Mother" },
  { quote: "A life lived for others is a life worth living.", author: "True Father" },
  { quote: "The purpose of life is to perfect the ability to love.", author: "True Parents" },
  { quote: "When you live for others, Heaven opens its doors.", author: "True Father" },
  { quote: "Your heart should be bigger than the world.", author: "True Mother" },
  { quote: "True happiness comes from living for the sake of others.", author: "True Father" },
  { quote: "Love is the greatest power in the universe.", author: "True Parents" },
  { quote: "Be a light to the world through your example of love.", author: "True Mother" },
  { quote: "The more difficult the path, the greater the victory.", author: "True Father" },
  { quote: "Live each day with a grateful heart.", author: "True Mother" },
  { quote: "Your attitude of heart determines your destiny.", author: "True Father" },
  // Bible Verses
  { quote: "Trust in the Lord with all your heart.", author: "Proverbs 3:5" },
  { quote: "I can do all things through Christ who strengthens me.", author: "Philippians 4:13" },
  { quote: "For God has not given us a spirit of fear, but of power and love.", author: "2 Timothy 1:7" },
  { quote: "Be strong and courageous. The Lord your God will be with you.", author: "Joshua 1:9" },
  { quote: "Love is patient, love is kind.", author: "1 Corinthians 13:4" },
  { quote: "Let your light shine before others.", author: "Matthew 5:16" },
  { quote: "Be joyful in hope, patient in affliction, faithful in prayer.", author: "Romans 12:12" },
  { quote: "Whatever you do, work at it with all your heart.", author: "Colossians 3:23" },
  { quote: "Cast all your anxiety on Him because He cares for you.", author: "1 Peter 5:7" },
  { quote: "We love because He first loved us.", author: "1 John 4:19" },
  { quote: "With God all things are possible.", author: "Matthew 19:26" },
  { quote: "The joy of the Lord is your strength.", author: "Nehemiah 8:10" },
  { quote: "Be kind to one another, tenderhearted, forgiving.", author: "Ephesians 4:32" },
  { quote: "Let us not become weary in doing good.", author: "Galatians 6:9" },
  { quote: "A cheerful heart is good medicine.", author: "Proverbs 17:22" }
];

// Get daily quote (rotates based on day of year)
const getDailyQuote = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
};

// Weekly Affirmations organized by categories
const AFFIRMATIONS = {
  "Heart (Emotion)": [
    "My feelings matter, and it is okay to feel them.",
    "I am learning to be kind to myself, even on hard days.",
    "I am grateful for small joys that brighten my day.",
    "I am safe to grow at my own pace.",
    "I am thankful that I am loved and never alone."
  ],
  "Mind (Intellect)": [
    "I am learning something valuable every day.",
    "I am open to understanding myself and others better.",
    "I can think calmly and choose what is good.",
    "Mistakes help me learn and grow wiser.",
    "I seek truth with a humble and open heart."
  ],
  "Will (Choice & Responsibility)": [
    "I can choose to do what is right, even when it is not easy.",
    "Small good efforts I make today truly matter.",
    "I am growing stronger by trying again.",
    "I take responsibility for my actions with courage and hope.",
    "Today, I choose to act with integrity."
  ],
  "Love & Identity": [
    "I am a True Child of Heavenly Parent and True Parents.",
    "I am loved deeply, just as I am.",
    "I can show care and respect to the people around me.",
    "My actions can bring comfort and goodness to others.",
    "I am learning to live for the sake of others in simple ways."
  ],
  "Leadership & Purpose": [
    "Today, I am a leader through my words and actions.",
    "I lead by being kind, responsible, and thoughtful.",
    "I influence others by choosing goodness.",
    "I am becoming someone others can trust.",
    "I am thankful for the person I am growing into."
  ]
};

// Weekly Gratitude Prompts (rotates weekly)
const GRATITUDE_PROMPTS_KIDS = [
  {
    en: "What made you smile today? Why did it make you happy?",
    tl: "Ano ang bagay na nagpasaya sa'yo ngayong araw? Bakit ka nito napangiti?",
    category: "Emotion"
  },
  {
    en: "Who was kind to you today, and how did it feel?",
    tl: "Sino ang naging mabait sa'yo ngayon, at ano ang naramdaman mo?",
    category: "Emotion"
  },
  {
    en: "What is one thing you use every day that you are thankful for?",
    tl: "Ano ang isang bagay na ginagamit mo araw-araw na ipinagpapasalamat mo?",
    category: "Intellect"
  },
  {
    en: "What did you learn today that helped you understand the world better?",
    tl: "Ano ang bagong natutunan mo ngayon na nakatulong sa'yo na mas maintindihan ang mundo?",
    category: "Intellect"
  },
  {
    en: "What good choice did you make today that you feel thankful for?",
    tl: "Anong mabuting desisyon ang ginawa mo ngayon na ipinagpapasalamat mo?",
    category: "Will"
  },
  {
    en: "What is one small thing you tried even though it was hard?",
    tl: "Ano ang isang bagay na sinubukan mo kahit mahirap, at bakit ka nagpapasalamat doon?",
    category: "Will"
  },
  {
    en: "Who do you want to say 'thank you' to today?",
    tl: "Sino ang gusto mong pasalamatan ngayon? Bakit?",
    category: "Love"
  },
  {
    en: "How did you show love to someone today?",
    tl: "Paano mo ipinakita ang pagmamahal mo sa iba ngayong araw?",
    category: "Love"
  },
  {
    en: "If you could thank God for one thing today, what would it be?",
    tl: "Kung may isang bagay kang gustong ipagpasalamat sa Diyos ngayon, ano iyon?",
    category: "Whole-heart"
  },
  {
    en: "What is one good thing about yourself that you are grateful for?",
    tl: "Ano ang isang mabuting bagay tungkol sa sarili mo na ipinagpapasalamat mo?",
    category: "Whole-heart"
  }
];

const GRATITUDE_PROMPTS_TEENS = [
  {
    en: "What moment today touched your heart, even in a small way?",
    tl: "Anong sandali o pangyayari ngayong araw ang tunay na nakaantig sa iyong puso, kahit maliit lang?",
    category: "Emotion"
  },
  {
    en: "What emotion did you feel strongly today, and what are you thankful it taught you?",
    tl: "Anong damdamin ang naramdaman mo ngayon, at ano ang ipinagpapasalamat mo na itinuro nito sa'yo?",
    category: "Emotion"
  },
  {
    en: "What experience recently helped you understand yourself better?",
    tl: "Anong karanasan kamakailan ang nakatulong sa'yo na mas makilala ang iyong sarili?",
    category: "Intellect"
  },
  {
    en: "What challenge are you grateful for because it helped you grow?",
    tl: "Anong pagsubok ang ipinagpapasalamat mo dahil nakatulong ito sa iyong paglago?",
    category: "Intellect"
  },
  {
    en: "What decision did you make today that you feel proud of?",
    tl: "Anong desisyon ang ginawa mo ngayon na ipinagmamalaki mo?",
    category: "Will"
  },
  {
    en: "What habit or effort are you thankful you are trying to build?",
    tl: "Anong ugali o pagsisikap ang ipinagpapasalamat mo na sinusubukan mong paunlarin?",
    category: "Will"
  },
  {
    en: "Who influenced you positively this week, and why are you grateful for them?",
    tl: "Sino ang nagkaroon ng mabuting impluwensya sa'yo ngayong linggo, at bakit mo siya ipinagpapasalamat?",
    category: "Love"
  },
  {
    en: "How did you live for the sake of others today, even in a small way?",
    tl: "Paano ka namuhay para sa kapakanan ng iba ngayong araw, kahit sa maliit na paraan?",
    category: "Love"
  },
  {
    en: "What part of your life do you feel God has been patiently guiding?",
    tl: "Sa anong bahagi ng iyong buhay mo nararamdaman na ikaw ay dahan-dahang ginagabayan ng Diyos?",
    category: "Whole-person"
  },
  {
    en: "What kind of person are you becoming that you feel grateful for?",
    tl: "Anong uri ng tao ang unti-unti mong nagiging ikaw na ipinagpapasalamat mo?",
    category: "Whole-person"
  }
];

// Get weekly prompt based on current week and student age
const getWeeklyGratitudePrompt = (age, sessionNumber = 1) => {
  const prompts = age < 13 ? GRATITUDE_PROMPTS_KIDS : GRATITUDE_PROMPTS_TEENS;
  const promptIndex = (sessionNumber - 1) % prompts.length;
  return prompts[promptIndex];
};

// Achievement Badges
const BADGES = [
  { id: 'grateful_heart', name: 'Grateful Heart', icon: '💛', desc: '5 gratitude entries', type: 'gratitude', count: 5, color: 'from-pink-400 to-rose-400' },
  { id: 'grateful_soul', name: 'Overflowing Heart', icon: '💖', desc: '10 gratitude entries', type: 'gratitude', count: 10, color: 'from-purple-400 to-pink-400' },
  { id: 'perfect_attendance', name: 'Faithful Heart', icon: '💜', desc: '100% attendance', type: 'attendance', percent: 100, color: 'from-blue-400 to-cyan-400' },
  { id: 'dedicated_learner', name: 'Blossoming Spirit', icon: '🌸', desc: '90%+ attendance', type: 'attendance', percent: 90, color: 'from-indigo-400 to-blue-400' },
  { id: 'service_star', name: 'Serving Heart', icon: '💙', desc: 'Complete service', type: 'service', percent: 1, color: 'from-green-400 to-emerald-400' },
  { id: 'scholar', name: 'Seeking Heart', icon: '🧡', desc: '80%+ quiz', type: 'quiz', percent: 80, color: 'from-yellow-400 to-orange-400' },
  { id: 'rising_star', name: 'Growing Heart', icon: '💚', desc: '80%+ grade', type: 'grade', percent: 80, color: 'from-cyan-400 to-teal-400' },
  { id: 'excellence', name: 'Shining Heart', icon: '✨', desc: '90%+ grade', type: 'grade', percent: 90, color: 'from-yellow-400 to-yellow-500' },
  { id: 'affirmation_warrior', name: 'Heart of Purpose', icon: '✨', desc: 'Set weekly affirmation', type: 'affirmation', hasAffirmation: true, color: 'from-yellow-400 to-orange-400' },
  { id: 'loving_heart', name: 'Loving Heart', icon: '❤️', desc: 'All 3 goals set', type: 'goals', goalsSet: 3, color: 'from-red-400 to-pink-400' }
];


// Hyoji floating helper component — an app-help guide for students.
const HyojiHelper = ({ page, studentData, earnedBadges, BADGES, growthPercentage }) => {
  const [open, setOpen] = React.useState(false);
  const [bounce, setBounce] = React.useState(false);
  const [activeQ, setActiveQ] = React.useState(null);

  React.useEffect(() => {
    setBounce(true);
    const t = setTimeout(() => setBounce(false), 1000);
    return () => clearTimeout(t);
  }, [page]);

  React.useEffect(() => { setActiveQ(null); }, [open, page]);

  // All help topics. `tags` lets us surface the most relevant ones first per page.
  const helpTopics = [
    { q: 'How do I write in my gratitude journal?',
      a: "Tap the 💗 Gratitude Journal button on your home page. Pick the session, type what you're thankful for, and tap Submit. Try to write one every session — it grows your Heart of Gratitude!",
      tags: ['gratitude'] },
    { q: 'How do I earn badges?',
      a: "Badges unlock as you grow! Attend sessions, write gratitude, complete service, and finish your goals. Tap '🏅 My Hyojeong Heart Badges' to see which ones you've earned and what's still locked.",
      tags: ['badges', 'home'] },
    { q: 'What is my Growth Journey %?',
      a: "Your HJ Grade adds up: Attendance, Service, Gratitude, One Heart One Shirt, and Quiz. The more faithfully you join in, the more your heart grows — from Seeking Heart 🕊️ to Faithful 🙏 to Loving 💜 to Filial Heart 👑. You can see your pillars right on your home page! 💝",
      tags: ['home', 'grades'] },
    { q: 'What do the pillars mean?',
      a: "Each pillar is a part of your growth: 💜 Faithful Presence (coming to sessions), 💙 Filial Actions (service), 🫂 One Heart One Shirt (wearing your HJ shirt), 💡 Heart Knowledge (quizzes), and 💖 Heart of Gratitude (your journal).",
      tags: ['home'] },
    { q: 'What do the green and grey boxes mean?',
      a: "In 'Session by session', each numbered box is one session. Green/colored means you did it (attended, wore your shirt, or wrote gratitude). Grey means not yet. It helps you see which sessions to catch up on!",
      tags: ['home'] },
    { q: 'How is my grade calculated?',
      a: "Your HJ Grade adds up: Attendance, Service, Gratitude, One Heart One Shirt, and Quiz. The more faithfully you join in, the more your heart grows. You can see all your pillars right on your home page! 💝",
      tags: ['grades'] },
    { q: 'How do I set my goals?',
      a: "Open '👤 My HJ Profile'. You can write your goals there and update them as you work toward them. Finishing your goals also helps your heart grow!",
      tags: ['profile'] },
    { q: 'How do I update my profile?',
      a: "Tap '👤 My HJ Profile', then edit your photo, birthday, or address. Tap Save when you're done so your team knows you better. 😊",
      tags: ['profile'] },
    { q: 'I forgot my password — what do I do?',
      a: "No worries! Ask your team leader or program admin — they can look up or reset it for you.",
      tags: ['home'] },
  ];

  // Order topics so the ones tagged for the current page come first.
  const ordered = [...helpTopics].sort((a, b) => {
    const aRel = a.tags.includes(page) ? 0 : 1;
    const bRel = b.tags.includes(page) ? 0 : 1;
    return aRel - bRel;
  });

  return (
    <div style={{position:'fixed', bottom:80, right:16, zIndex:999}}>
      {open && (
        <div style={{background:'white', borderRadius:'16px 16px 4px 16px', padding:'14px 16px', marginBottom:8, boxShadow:'0 8px 30px rgba(0,0,0,0.18)', width:270, maxHeight:380, overflowY:'auto', animation:'hyojiTipFade 0.3s ease-out'}}>
          <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:8}}>
            <span style={{fontSize:16}}>💝</span>
            <p style={{margin:0, fontSize:14, fontWeight:700, color:'#db2777'}}>Hi! I'm Hyoji</p>
          </div>
          {activeQ === null ? (
            <>
              <p style={{margin:'0 0 10px', fontSize:12, color:'#6B7280'}}>How can I help you with the app?</p>
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {ordered.map((t, i) => (
                  <button key={i} onClick={() => setActiveQ(t)}
                    style={{textAlign:'left', background:'#FCE7F3', border:'none', borderRadius:10, padding:'8px 10px', fontSize:12, fontWeight:600, color:'#9d174d', cursor:'pointer', lineHeight:1.3}}>
                    {t.q}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p style={{margin:'0 0 6px', fontSize:13, fontWeight:700, color:'#831843', lineHeight:1.35}}>{activeQ.q}</p>
              <p style={{margin:'0 0 12px', fontSize:12.5, color:'#4B5563', lineHeight:1.5}}>{activeQ.a}</p>
              <button onClick={() => setActiveQ(null)}
                style={{background:'#F3E8FF', border:'none', borderRadius:10, padding:'7px 12px', fontSize:12, fontWeight:700, color:'#7C3AED', cursor:'pointer'}}>
                ← Back to questions
              </button>
            </>
          )}
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        style={{width:56, height:56, borderRadius:'50%', border:'none', background:'linear-gradient(135deg,#f9a8d4,#ec4899)', cursor:'pointer', boxShadow:'0 4px 16px rgba(236,72,153,0.4)', display:'flex', alignItems:'center', justifyContent:'center', animation: bounce ? 'hyojiBtnBounce 0.5s ease-out' : 'hyojiBtnFloat 3s ease-in-out infinite', padding:0}}
      >
        <svg width="36" height="40" viewBox="0 0 120 130">
          <defs>
            <radialGradient id="hbtn" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fce7f3"/>
              <stop offset="100%" stopColor="#f9a8d4"/>
            </radialGradient>
          </defs>
          <path d="M60 100 C20 75 10 50 15 35 C20 20 35 15 48 22 C52 24 56 28 60 32 C64 28 68 24 72 22 C85 15 100 20 105 35 C110 50 100 75 60 100Z" fill="url(#hbtn)" stroke="#db2777" strokeWidth="2"/>
          <ellipse cx="42" cy="52" rx="7" ry="8" fill="white"/>
          <ellipse cx="43" cy="53" rx="4" ry="4.5" fill="#1F2937"/>
          <ellipse cx="44.5" cy="51.5" rx="1.5" ry="1.5" fill="white"/>
          <ellipse cx="78" cy="52" rx="7" ry="8" fill="white"/>
          <ellipse cx="79" cy="53" rx="4" ry="4.5" fill="#1F2937"/>
          <ellipse cx="80.5" cy="51.5" rx="1.5" ry="1.5" fill="white"/>
          <ellipse cx="35" cy="64" rx="5" ry="3.5" fill="#fde68a" opacity="0.9"/>
          <ellipse cx="85" cy="64" rx="5" ry="3.5" fill="#fde68a" opacity="0.9"/>
          <path d="M52 70 Q60 78 68 70" stroke="#9d174d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>
      <style>{`
        @keyframes hyojiBtnFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes hyojiBtnBounce { 0%{transform:scale(1)} 30%{transform:scale(1.2)} 60%{transform:scale(0.95)} 100%{transform:scale(1)} }
        @keyframes hyojiTipFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

// Heart level for a given grade % — used across leaderboards instead of raw numbers.
const heartLevelFor = (grade) => {
  const g = Math.round(parseFloat(grade) || 0);
  return [
    { name: 'Seeking Heart', icon: '🕊️', min: 0, color: '#F59E0B', cheer: 'Every great heart starts here. Keep showing up — you are growing! 🌱' },
    { name: 'Faithful Heart', icon: '🙏', min: 26, color: '#10B981', cheer: 'Your faithfulness is blooming. Keep walking forward with heart! 💚' },
    { name: 'Loving Heart', icon: '💜', min: 51, color: '#8B5CF6', cheer: 'Love is moving through you. You inspire those around you! 💜' },
    { name: 'Filial Heart', icon: '👑', min: 76, color: '#EC4899', cheer: 'You shine with a true filial heart. What a beautiful example you are! 👑' }
  ].filter(l => g >= l.min).pop();
};

// Wholesome, faith-aligned mottos a student can choose from (admin-approved list).
const MOTTO_OPTIONS = [
  'Living for the sake of others 💗',
  'Love in action 💛',
  'A grateful heart, every day 🙏',
  'I shine so others can shine 🌟',
  'Small acts, great love ✨',
  'Faithful in the little things 🌱',
  'Kindness is my superpower 💪',
  'I choose joy 😊',
  'Together we grow 🤝',
  'My heart belongs to Heaven 🕊️'
];

// Blocklist for student-written mottos — profanity + negative/harmful words.
// Kept simple and broad; admin can always edit a student's motto if needed.
const MOTTO_BLOCKLIST = [
  'fuck','shit','bitch','ass','damn','hell','crap','dick','piss','bastard','slut','whore','cunt','fag','retard',
  'sex','sexy','porn','nude','naked','kill','die','death','dead','suicide','hate','stupid','idiot','dumb','ugly',
  'loser','worthless','useless','hopeless','kill myself','kms','wanna die','i hate','drugs','weed','marijuana',
  'putang','puta','gago','tanga','bobo','ulol','tarantado','pakyu','yawa','bilat','pisti','animal ka'
];

const mottoHasBadWord = (text) => {
  const t = ' ' + (text || '').toLowerCase().replace(/[^a-z\u00f1\s]/g, ' ') + ' ';
  return MOTTO_BLOCKLIST.some(w => t.includes(' ' + w + ' ') || t.includes(w));
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [leadTeam, setLeadTeam] = useState(null); // team name if logged in as a team lead
  const [adminPassword, setAdminPassword] = useState('');
  const [loginRole, setLoginRole] = useState('member'); // 'member' | 'lead' | 'admin'
  const [allGratitudeEntries, setAllGratitudeEntries] = useState([]);
  const [myGratitudeEntries, setMyGratitudeEntries] = useState([]);
  const [myAttendanceMarks, setMyAttendanceMarks] = useState([]); // logged-in student's per-session marks
  const [expandedPillar, setExpandedPillar] = useState(null); // which pillar's detail is open on home
  const [studentStatusFilter, setStudentStatusFilter] = useState('active'); // All Students page filter
  const [scoreEdits, setScoreEdits] = useState({}); // { studentId: {quiz1,quiz2,quiz3,service_pct} }
  const [savingScores, setSavingScores] = useState(false);
  const [quizTeamFilter, setQuizTeamFilter] = useState('ALL');
  const [allMarks, setAllMarks] = useState([]); // every student's attendance marks (for admin list)
  const [studentTeamFilter, setStudentTeamFilter] = useState('ALL'); // team filter on All Students page
  const [announcements, setAnnouncements] = useState([]);
  const [announceText, setAnnounceText] = useState('');
  const [announceTitle, setAnnounceTitle] = useState('');
  const [postingAnnounce, setPostingAnnounce] = useState(false);
  const [recomputing, setRecomputing] = useState(false);
  const [archives, setArchives] = useState([]);
  const [viewingArchive, setViewingArchive] = useState(null);
  const [archiveStudents, setArchiveStudents] = useState([]);
  const [loadingArchive, setLoadingArchive] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [startingProgram, setStartingProgram] = useState(false);
  const [newProgramForm, setNewProgramForm] = useState(null);
  const [encourageFor, setEncourageFor] = useState(null);
  const [encourageText, setEncourageText] = useState('');
  const [sendingEncourage, setSendingEncourage] = useState(false);
  const [myEncouragements, setMyEncouragements] = useState([]);
  const [myReflections, setMyReflections] = useState([]);
  const [reflectionText, setReflectionText] = useState('');
  const [savingReflection, setSavingReflection] = useState(false);
  const [absenceFor, setAbsenceFor] = useState(null);
  const [absenceReason, setAbsenceReason] = useState('');
  const [detailReflections, setDetailReflections] = useState([]);
  const [expandedStudent, setExpandedStudent] = useState(null); // which student row is expanded in admin list
  const [inlineMarkEdits, setInlineMarkEdits] = useState({}); // { 'sid-session': {attendance,hj_shirt,gratitude} } unsaved edits
  const [inlineScoreEdits, setInlineScoreEdits] = useState({}); // { sid: {quiz1,quiz2,quiz3,service_pct} }
  const [savingInline, setSavingInline] = useState(false);
  const [adminRemark, setAdminRemark] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('');
  const [attendanceSession, setAttendanceSession] = useState(1);
  const [attendanceMarks, setAttendanceMarks] = useState({}); // { studentId: {attendance, hj_shirt, gratitude} }
  const [attendanceTeamFilter, setAttendanceTeamFilter] = useState('ALL');
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    address: '',
    category: '',
    photoUrl: '',
    contactNumber: '',
    fbAccount: ''
  });
  
  // Points system
  const [points, setPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  
  // Goals system
  const [goals, setGoals] = useState({ 
    goal1: '', goal2: '', goal3: '',
    goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set'
  });
  const [editingGoals, setEditingGoals] = useState(false);
  const [tempGoals, setTempGoals] = useState({ goal1: '', goal2: '', goal3: '' });
  const [affirmation, setAffirmation] = useState('');
  const [editingAffirmation, setEditingAffirmation] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAffirmation, setSelectedAffirmation] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasSeenCelebration, setHasSeenCelebration] = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('overall');
  const [leaderboardTeam, setLeaderboardTeam] = useState('MARC');
  const [setupForm, setSetupForm] = useState(null); // editable copy of program settings
  // Program settings (loaded from program_settings table; fall back to constants)
  const [programSettings, setProgramSettings] = useState({
    program_name: 'Hyojeong Youth CARAGA',
    start_date: '', end_date: '',
    total_sessions: TOTAL_SESSIONS,
    total_gratitude_sessions: TOTAL_GRATITUDE_SESSIONS,
    num_quizzes: 3,
    num_services: 1,
    session_dates: [],
    teams: [],
    heart_messages: []
  });
  const [tempProfile, setTempProfile] = useState({
    dateOfBirth: '',
    address: '',
    contactNumber: '',
    fbAccount: '',
    photoUrl: '',
    motto: '',
    newPassword: '',
    currentPassword: ''
  });

  // Students loaded on login click only

  // Load program settings once on mount.
  const loadProgramSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('program_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (error) { console.error('Settings load error:', error); return; }
      if (data) {
        setProgramSettings({
          program_name: data.program_name || 'Hyojeong Youth CARAGA',
          start_date: data.start_date || '',
          end_date: data.end_date || '',
          total_sessions: data.total_sessions || TOTAL_SESSIONS,
          total_gratitude_sessions: data.total_gratitude_sessions || TOTAL_GRATITUDE_SESSIONS,
          num_quizzes: data.num_quizzes || 3,
          num_services: data.num_services || 1,
          session_dates: Array.isArray(data.session_dates) ? data.session_dates : [],
          teams: Array.isArray(data.teams) ? data.teams : [],
          heart_messages: Array.isArray(data.heart_messages) ? data.heart_messages : []
        });
      }
    } catch (err) { console.error('Settings load error:', err); }
  };

  useEffect(() => { loadProgramSettings(); }, []);

  // Resolved counts the whole app uses (settings override the constants).
  const sessionCount = programSettings.total_sessions || TOTAL_SESSIONS;
  const gratitudeCount = programSettings.total_gratitude_sessions || TOTAL_GRATITUDE_SESSIONS;
  const quizCount = programSettings.num_quizzes || 3;
  const serviceCount = programSettings.num_services || 1;

  // Compute quiz % from an array of /10 scores (average of taken quizzes).
  const quizPctFromArray = (arr) => {
    const taken = (arr || []).map(Number).filter(v => !isNaN(v) && v !== null);
    if (!taken.length) return 0;
    return Math.round((taken.reduce((a, b) => a + b, 0) / taken.length) / 10 * 100 * 100) / 100;
  };
  // Compute service % from an array of /100 scores (average of done projects).
  const servicePctFromArray = (arr) => {
    const taken = (arr || []).map(Number).filter(v => !isNaN(v) && v !== null);
    if (!taken.length) return 0;
    return Math.round(taken.reduce((a, b) => a + b, 0) / taken.length * 100) / 100;
  };
  // Migrate old quiz1/2/3 + service_pct into arrays if arrays are empty (backward compat).
  const getQuizArray = (student) => {
    const arr = student['QuizScores'];
    if (Array.isArray(arr) && arr.length) return arr;
    const old = [student['Quiz1'], student['Quiz2'], student['Quiz3']].filter(v => v != null && v !== '');
    return old.length ? old.map(Number) : [];
  };
  const getServiceArray = (student) => {
    const arr = student['ServiceScores'];
    if (Array.isArray(arr) && arr.length) return arr;
    const old = student['ServicePct'];
    return (old != null && old !== '') ? [Number(old)] : [];
  };
  const sessionDates = programSettings.session_dates || [];
  const dateForSession = (n) => (sessionDates[n - 1] || '');

  // Save program settings back to the single settings row.
  const saveProgramSettings = async (next) => {
    try {
      const payload = {
        id: 1,
        program_name: next.program_name,
        start_date: next.start_date,
        end_date: next.end_date,
        total_sessions: parseInt(next.total_sessions, 10) || TOTAL_SESSIONS,
        total_gratitude_sessions: parseInt(next.total_gratitude_sessions, 10) || TOTAL_GRATITUDE_SESSIONS,
        num_quizzes: parseInt(next.num_quizzes, 10) || 3,
        num_services: parseInt(next.num_services, 10) || 1,
        session_dates: next.session_dates || [],
        teams: next.teams || [],
        heart_messages: next.heart_messages || [],
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase
        .from('program_settings')
        .upsert(payload, { onConflict: 'id' });
      if (error) { alert('Failed to save settings: ' + error.message); return; }
      setProgramSettings(payload);
      alert('✅ Program settings saved!');
    } catch (err) {
      console.error('Save settings error:', err);
      alert('Failed to save settings.');
    }
  };

  // Update earned badges when student data or entries change
  useEffect(() => {
    if (studentData) {
      const newEarnedBadges = BADGES.filter(badge => checkIfBadgeEarned(badge)).map(b => b.id);
      setEarnedBadges(newEarnedBadges);
      
      // Trigger celebration when all badges are earned for the first time
      if (newEarnedBadges.length === BADGES.length && !hasSeenCelebration) {
        setTimeout(() => {
          setShowCelebration(true);
          setHasSeenCelebration(true);
        }, 500);
      }
    }
  }, [studentData, myGratitudeEntries, points, goals]);

 const loadStudents = async () => {
    try {
      setLoading(true);
      // Fetch students from Supabase
      const { data: rows, error } = await supabase
        .from('students')
        .select('*');
      if (error) {
        console.error('Supabase error loading students:', error);
        return;
      }
      // Translate Supabase columns -> field names the app expects
      const translated = (rows || []).map(r => ({
        'Student ID': r.student_id,
        'Password': r.password,
        'First Name': r.first_name,
        'Last Name': r.last_name,
        'Photo': r.photo_url,
        'Date of Birth': r.date_of_birth,
        'Age': r.age,
        'Category': r.category,
        'TEAM': r.team || r.team_id,
        'HJ Service': r.hj_service_points,
        'HJ Grade': r.hj_grade,
        'HJ Attendance': r.hj_attendance,
        'HJ Service Pct': r.hj_service_pct,
        'HJ Shirt Pct': r.hj_shirt_pct,
        'Status': r.status || 'active',
        'Contact': r.contact_number,
        'FB': r.fb_account,
        'Motto': r.motto,
        'Quiz1': r.quiz1, 'Quiz2': r.quiz2, 'Quiz3': r.quiz3, 'ServicePct': r.service_pct,
        'QuizScores': Array.isArray(r.quiz_scores) ? r.quiz_scores : [], 'ServiceScores': Array.isArray(r.service_scores) ? r.service_scores : [],
        'HJ Quiz': r.hj_quiz,
        'Percentage': r.percentage,
      }));
      setAllStudents(translated);
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyGratitudeEntries = async (studId) => {
    try {
      const { data: rows, error } = await supabase
        .from('gratitude')
        .select('*')
        .eq('student_id', studId);
      if (error) {
        console.error('Supabase error loading gratitude:', error);
        return;
      }
      // Translate Supabase rows -> field names the app expects
      const translated = (rows || []).map(r => ({
        studentId: r.student_id,
        session: `Session ${r.session_number}`,
        content: r.entry_text,
        timestamp: r.date_submitted,
        adminRemark: r.admin_remark
      }));
      setMyGratitudeEntries(translated);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Load the logged-in student's per-session attendance marks.
  const loadMyAttendanceMarks = async (studId) => {
    try {
      const { data, error } = await supabase
        .from('attendance_marks')
        .select('session_number, attendance, hj_shirt, gratitude')
        .eq('student_id', studId)
        .order('session_number', { ascending: true });
      if (error) { console.error('Error loading my attendance:', error); setMyAttendanceMarks([]); return; }
      setMyAttendanceMarks(data || []);
    } catch (err) {
      console.error('Error loading my attendance:', err);
      setMyAttendanceMarks([]);
    }
  };

  const loadStudentProgress = async (studId) => {
    try {
      const { data: row, error } = await supabase
        .from('students')
        .select('total_points, affirmation, goal1, goal1_status, goal2, goal2_status, goal3, goal3_status')
        .eq('student_id', studId)
        .single();

      if (error || !row) {
        if (error) console.error('Supabase error loading progress:', error);
        setPoints(0);
        setEarnedBadges([]);
        setAffirmation('');
        setGoals({ goal1: '', goal2: '', goal3: '', goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set' });
        return;
      }

      setPoints(row.total_points || 0);
      // Badges are derived from activity elsewhere, so start empty here.
      setEarnedBadges([]);
      setAffirmation(row.affirmation || '');
      setGoals({
        goal1: row.goal1 || '',
        goal2: row.goal2 || '',
        goal3: row.goal3 || '',
        goal1Status: row.goal1_status || 'Not Set',
        goal2Status: row.goal2_status || 'Not Set',
        goal3Status: row.goal3_status || 'Not Set'
      });
    } catch (err) {
      console.error('Error loading progress:', err);
      setPoints(0);
      setEarnedBadges([]);
      setAffirmation('');
      setGoals({ goal1: '', goal2: '', goal3: '', goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set' });
    }
  };

  const updateProgress = async (updates) => {
    try {
      const studId = studentData && studentData['Student ID'];
      if (!studId) {
        console.error('No logged-in student to save progress for');
        return;
      }

      // Map incoming camelCase fields to the students table columns.
      const colMap = {
        affirmation: 'affirmation',
        goal1: 'goal1',
        goal2: 'goal2',
        goal3: 'goal3',
        goal1Status: 'goal1_status',
        goal2Status: 'goal2_status',
        goal3Status: 'goal3_status'
      };

      const payload = {};
      Object.keys(colMap).forEach(key => {
        if (updates[key] !== undefined) payload[colMap[key]] = updates[key];
      });

      // Points are additive: read current, add, write back.
      let newPoints = points;
      if (updates.addPoints) {
        newPoints = points + updates.addPoints;
        payload.total_points = newPoints;
      }

      if (Object.keys(payload).length > 0) {
        const { error } = await supabase
          .from('students')
          .update(payload)
          .eq('student_id', studId);
        if (error) {
          console.error('Supabase error saving progress:', error);
          alert('Failed to save: ' + error.message);
          return;
        }
      }

      // Update local points display after a successful write.
      if (updates.addPoints) {
        setPoints(newPoints);
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const handleSaveGoals = async () => {
    await updateProgress({ 
      goal1: tempGoals.goal1, 
      goal1Status: tempGoals.goal1 ? 'In Progress' : 'Not Set',
      goal2: tempGoals.goal2, 
      goal2Status: tempGoals.goal2 ? 'In Progress' : 'Not Set',
      goal3: tempGoals.goal3, 
      goal3Status: tempGoals.goal3 ? 'In Progress' : 'Not Set',
      addPoints: 5
    });
    setGoals({
      goal1: tempGoals.goal1,
      goal2: tempGoals.goal2,
      goal3: tempGoals.goal3,
      goal1Status: tempGoals.goal1 ? 'In Progress' : 'Not Set',
      goal2Status: tempGoals.goal2 ? 'In Progress' : 'Not Set',
      goal3Status: tempGoals.goal3 ? 'In Progress' : 'Not Set'
    });
    setEditingGoals(false);
    alert('✨ Goals saved! +5 points earned!');
  };

  const handleCompleteGoal = async (goalNum) => {
    const statusKey = `goal${goalNum}Status`;
    await updateProgress({ 
      [statusKey]: 'Completed',
      addPoints: 25
    });
    setGoals(g => ({...g, [statusKey]: 'Completed'}));
    alert('🎉 Goal completed! +25 points earned!');
  };

  const handleSaveAffirmation = async () => {
    if (!selectedAffirmation) {
      alert('Please select an affirmation');
      return;
    }
    await updateProgress({ affirmation: selectedAffirmation });
    setAffirmation(selectedAffirmation);
    setEditingAffirmation(false);
    setSelectedCategory('');
    setSelectedAffirmation('');
    alert('✨ Affirmation saved!');
  };

  const handleEditAffirmation = () => {
    setSelectedCategory('');
    setSelectedAffirmation(affirmation);
    setEditingAffirmation(true);
  };

  const handleCancelAffirmation = () => {
    setEditingAffirmation(false);
    setSelectedCategory('');
    setSelectedAffirmation('');
  };

  const loadStudentProgressForAdmin = async (studId) => {
    try {
      // Also load this student's private reflections so caring adults can support them.
      loadMyReflectionsForDetail(studId);
      const { data: row, error } = await supabase
        .from('students')
        .select('total_points, affirmation, goal1, goal1_status, goal2, goal2_status, goal3, goal3_status')
        .eq('student_id', studId)
        .single();

      if (error || !row) {
        if (error) console.error('Supabase error loading student progress:', error);
        setSelectedStudentProgress(null);
        return;
      }

      // Shape the row into the field names the admin view expects.
      setSelectedStudentProgress({
        totalPoints: row.total_points || 0,
        badgesEarned: [],
        affirmation: row.affirmation || '',
        goal1: row.goal1 || '',
        goal2: row.goal2 || '',
        goal3: row.goal3 || '',
        goal1Status: row.goal1_status || 'Not Set',
        goal2Status: row.goal2_status || 'Not Set',
        goal3Status: row.goal3_status || 'Not Set'
      });
    } catch (err) {
      console.error('Error loading student progress:', err);
      setSelectedStudentProgress(null);
    }
  };

  const handleAddNewStudent = async () => {
    if (!newStudent.firstName.trim() || !newStudent.lastName.trim()) {
      alert('Please enter first name and last name');
      return;
    }
    if (!newStudent.dateOfBirth) {
      alert('Please enter date of birth');
      return;
    }

    try {
      setLoading(true);

      // 1. Generate the next Student ID by looking at existing IDs.
      //    Assumes IDs look like "HJ001", "HJ002", ... Adjust PREFIX if yours differs.
      const PREFIX = 'HJ';
      const { data: existing, error: fetchErr } = await supabase
        .from('students')
        .select('student_id')
        .like('student_id', `${PREFIX}%`);

      if (fetchErr) {
        console.error('Supabase error reading existing IDs:', fetchErr);
        alert('Failed to generate Student ID: ' + fetchErr.message);
        return;
      }

      let maxNum = 0;
      (existing || []).forEach(r => {
        const n = parseInt(String(r.student_id).replace(PREFIX, ''), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      });
      const studentId = `${PREFIX}${String(maxNum + 1).padStart(3, '0')}`;

      // 2. Generate a simple login password.
      const password = Math.random().toString(36).slice(-6).toUpperCase();

      // 3. Insert the new student.
      const { error: insertErr } = await supabase
        .from('students')
        .insert({
          student_id: studentId,
          password: password,
          first_name: newStudent.firstName.trim(),
          last_name: newStudent.lastName.trim(),
          date_of_birth: newStudent.dateOfBirth || null,
          age: newStudent.age ? parseInt(newStudent.age, 10) : null,
          address: newStudent.address || null,
          category: newStudent.category || null,
          photo_url: newStudent.photoUrl || null,
          contact_number: newStudent.contactNumber || null,
          fb_account: newStudent.fbAccount || null,
          hj_service_points: 0
        });

      if (insertErr) {
        console.error('Supabase error adding student:', insertErr);
        alert('Failed to add student: ' + insertErr.message);
        return;
      }

      alert(`✅ Student added successfully!\n\nStudent ID: ${studentId}\nPassword: ${password}\n\n⚠️ Please save this password! The student will need it to log in.`);
      setNewStudent({ firstName: '', lastName: '', dateOfBirth: '', age: '', address: '', category: '', photoUrl: '', contactNumber: '', fbAccount: '' });
      setShowAddStudentForm(false);
      await loadStudents(); // Refresh student list
    } catch (err) {
      console.error('Error adding student:', err);
      alert('Failed to add student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeAndCategory = (dateOfBirth) => {
    if (!dateOfBirth) return { age: '', category: '' };
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    // Classify as Kids (under 13) or Teens (13+)
    const category = age < 13 ? 'Kids' : 'Teens';
    
    return { age, category };
  };

  const handleDateOfBirthChange = (dateOfBirth) => {
    const { age, category } = calculateAgeAndCategory(dateOfBirth);
    setNewStudent(s => ({
      ...s,
      dateOfBirth,
      age: age.toString(),
      category
    }));
  };

  const handleEditProfile = () => {
    setTempProfile({
      dateOfBirth: studentData['Date of Birth'] || '',
      address: studentData['Address'] || '',
      contactNumber: studentData['Contact'] || '',
      fbAccount: studentData['FB'] || '',
      photoUrl: studentData['Photo'] || '',
      motto: studentData['Motto'] || '',
      newPassword: '',
      currentPassword: ''
    });
    setEditingProfile(true);
  };

  // Save quiz + service scores for a single student (from the detail card).
  const handleSaveStudentScores = async (studId, q1, q2, q3, svc) => {
    try {
      const quizzes = [q1, q2, q3].map(v => v === '' || v == null ? null : Number(v));
      const taken = quizzes.filter(v => v != null && !isNaN(v));
      const avgPct = taken.length ? Math.round((taken.reduce((a, b) => a + b, 0) / taken.length) / 10 * 100 * 100) / 100 : 0;
      const svcPct = svc === '' || svc == null ? null : Math.min(100, Number(svc));
      const { error } = await supabase.from('students').update({
        quiz1: quizzes[0], quiz2: quizzes[1], quiz3: quizzes[2],
        quiz_score: avgPct, hj_quiz: avgPct,
        service_pct: svcPct,
        hj_service_pct: svcPct == null ? 0 : svcPct,
        service_week_score: svcPct == null ? 0 : Math.round(svcPct / 100 * 50 * 100) / 100
      }).eq('student_id', studId);
      if (error) { alert('Failed to save scores: ' + error.message); return; }
      const patch = { 'Quiz1': quizzes[0], 'Quiz2': quizzes[1], 'Quiz3': quizzes[2], 'ServicePct': svcPct, 'HJ Quiz': avgPct, 'HJ Service Pct': svcPct == null ? 0 : svcPct };
      setAllStudents(prev => prev.map(s => s['Student ID'] === studId ? { ...s, ...patch } : s));
      setSelectedStudentDetail(prev => prev && prev['Student ID'] === studId ? { ...prev, ...patch } : prev);
      alert('✅ Scores saved!');
    } catch (err) {
      console.error('Save student scores error:', err);
      alert('Failed to save scores.');
    }
  };

  // Toggle a student's active/inactive status from the admin detail view.
  const handleToggleStatus = async (studId, newStatus) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ status: newStatus })
        .eq('student_id', studId);
      if (error) { alert('Failed to update status: ' + error.message); return; }
      setAllStudents(prev => prev.map(s => s['Student ID'] === studId ? { ...s, 'Status': newStatus } : s));
      setSelectedStudentDetail(prev => prev && prev['Student ID'] === studId ? { ...prev, 'Status': newStatus } : prev);
    } catch (err) {
      console.error('Status toggle error:', err);
      alert('Failed to update status.');
    }
  };

  // Assign (or change) a student's team from the admin detail view.
  const handleAssignTeam = async (studId, teamName) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ team: teamName || null })
        .eq('student_id', studId);
      if (error) { alert('Failed to assign team: ' + error.message); return; }
      // Update local roster + the open detail view immediately.
      setAllStudents(prev => prev.map(s => s['Student ID'] === studId ? { ...s, 'TEAM': teamName } : s));
      setSelectedStudentDetail(prev => prev && prev['Student ID'] === studId ? { ...prev, 'TEAM': teamName } : prev);
    } catch (err) {
      console.error('Assign team error:', err);
      alert('Failed to assign team.');
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Filter student-written motto for bad/negative words.
      if (tempProfile.motto && !MOTTO_OPTIONS.includes(tempProfile.motto) && mottoHasBadWord(tempProfile.motto)) {
        alert('Let\'s keep your motto kind and positive 💜 Please remove any unkind or negative words and try again.');
        setLoading(false);
        return;
      }

      // Optional password change — requires the current password to match.
      const wantsPwChange = (tempProfile.newPassword || '').trim().length > 0;
      if (wantsPwChange) {
        const current = studentData['Password'] || '';
        if ((tempProfile.currentPassword || '') !== current) {
          alert('Your current password is incorrect. Please try again, or ask your team leader for help.');
          setLoading(false);
          return;
        }
        if ((tempProfile.newPassword || '').trim().length < 4) {
          alert('Your new password should be at least 4 characters.');
          setLoading(false);
          return;
        }
      }

      const updateFields = {
        date_of_birth: tempProfile.dateOfBirth || null,
        address: tempProfile.address,
        contact_number: tempProfile.contactNumber || null,
        fb_account: tempProfile.fbAccount || null,
        photo_url: tempProfile.photoUrl,
        motto: tempProfile.motto || null
      };
      if (wantsPwChange) updateFields.password = tempProfile.newPassword.trim();

      const { error } = await supabase
        .from('students')
        .update(updateFields)
        .eq('student_id', studentData['Student ID']);

      if (error) {
        console.error('Supabase error updating profile:', error);
        alert('Failed to update profile: ' + error.message);
        return;
      }

      // Update local display
      setStudentData(prev => ({
        ...prev,
        'Date of Birth': tempProfile.dateOfBirth,
        'Address': tempProfile.address,
        'Contact': tempProfile.contactNumber,
        'FB': tempProfile.fbAccount,
        'Photo': tempProfile.photoUrl,
        'Motto': tempProfile.motto,
        ...(wantsPwChange ? { 'Password': tempProfile.newPassword.trim() } : {})
      }));
      setEditingProfile(false);
      alert(wantsPwChange ? '✅ Profile and password updated! Remember your new password. 💗' : '✅ Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send a private encouragement message to one student (leader/admin).
  const sendEncouragement = async () => {
    if (!encourageFor || !encourageText.trim()) return;
    try {
      setSendingEncourage(true);
      const fromName = isAdmin ? 'Admin' : (leadTeam ? `Team ${leadTeam} Leader` : 'Leader');
      const fromRole = isAdmin ? 'admin' : 'leader';
      const { error } = await supabase.from('encouragements').insert({
        student_id: encourageFor['Student ID'] || encourageFor.student_id,
        message: encourageText.trim(),
        from_name: fromName,
        from_role: fromRole
      });
      if (error) { alert('Could not send: ' + error.message); return; }
      setEncourageFor(null);
      setEncourageText('');
      alert('💌 Encouragement sent! It will appear on their home page.');
    } catch (err) {
      console.error('Send encouragement error:', err);
      alert('Something went wrong sending the encouragement.');
    } finally {
      setSendingEncourage(false);
    }
  };

  // Load a student's encouragements (shown on their home).
  const loadMyEncouragements = async (sid) => {
    try {
      const { data, error } = await supabase
        .from('encouragements')
        .select('*')
        .eq('student_id', sid)
        .order('created_at', { ascending: false });
      if (error) { console.error('Load encouragements error:', error); return; }
      setMyEncouragements(data || []);
    } catch (err) { console.error('Load encouragements error:', err); }
  };

  // Load reflections for the admin/leader detail view.
  const loadMyReflectionsForDetail = async (sid) => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('student_id', sid)
        .order('created_at', { ascending: false });
      if (error) { console.error('Load detail reflections error:', error); setDetailReflections([]); return; }
      setDetailReflections(data || []);
    } catch (err) { console.error('Load detail reflections error:', err); setDetailReflections([]); }
  };

  // Load a student's private reflections.
  const loadMyReflections = async (sid) => {
    try {
      const { data, error } = await supabase
        .from('reflections')
        .select('*')
        .eq('student_id', sid)
        .order('created_at', { ascending: false });
      if (error) { console.error('Load reflections error:', error); return; }
      setMyReflections(data || []);
    } catch (err) { console.error('Load reflections error:', err); }
  };

  // Student saves a private reflection.
  const saveReflection = async () => {
    if (!reflectionText.trim() || !studentData) return;
    try {
      setSavingReflection(true);
      const sid = studentData['Student ID'];
      const { error } = await supabase.from('reflections').insert({
        student_id: sid, body: reflectionText.trim()
      });
      if (error) { alert('Could not save: ' + error.message); return; }
      setReflectionText('');
      await loadMyReflections(sid);
    } catch (err) {
      console.error('Save reflection error:', err);
      alert('Something went wrong saving your reflection.');
    } finally {
      setSavingReflection(false);
    }
  };

  // Leader/admin records why a student was absent for a session.
  const saveAbsenceNote = async () => {
    if (!absenceFor) return;
    try {
      const sid = absenceFor['Student ID'] || absenceFor.student_id;
      const noter = isAdmin ? 'admin' : (leadTeam ? `lead:${leadTeam}` : 'leader');
      const { error } = await supabase.from('absence_notes').upsert({
        student_id: sid,
        session_number: parseInt(attendanceSession, 10) || null,
        reason: absenceReason.trim(),
        noted_by: noter
      }, { onConflict: 'student_id,session_number' });
      if (error) { alert('Could not save note: ' + error.message); return; }
      setAbsenceFor(null);
      setAbsenceReason('');
      alert('📝 Absence note saved.');
    } catch (err) {
      console.error('Save absence note error:', err);
      alert('Something went wrong saving the note.');
    }
  };

  // Save inline edits for one student from the expanded list row:
  // attendance marks (per session) + quiz + service, then recompute grades.
  const saveInlineStudent = async (sid) => {
    try {
      setSavingInline(true);
      // 1. Attendance marks: gather this student's current marks (from allMarks) merged with edits.
      const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);
      const existing = {};
      allMarks.filter(m => m.student_id === sid).forEach(m => { existing[m.session_number] = m; });
      const records = sessions.map(n => {
        const editKey = `${sid}-${n}`;
        const base = existing[n] || { attendance: false, hj_shirt: false, gratitude: false };
        const edit = inlineMarkEdits[editKey] || {};
        return {
          student_id: sid,
          session_number: n,
          attendance: edit.attendance != null ? edit.attendance : !!base.attendance,
          hj_shirt: edit.hj_shirt != null ? edit.hj_shirt : !!base.hj_shirt,
          gratitude: edit.gratitude != null ? edit.gratitude : !!base.gratitude,
          marked_by: 'admin',
          updated_at: new Date().toISOString()
        };
      }).filter(r => r.attendance || r.hj_shirt || r.gratitude); // only store sessions with a mark
      if (records.length > 0) {
        const { error } = await supabase.from('attendance_marks').upsert(records, { onConflict: 'student_id,session_number' });
        if (error) { alert('Failed to save marks: ' + error.message); return; }
      }
      // 2. Quiz + service scores (flexible arrays).
      const se = inlineScoreEdits[sid] || {};
      const quizzes = (se.quizzes || []).map(v => v === '' || v == null ? null : Number(v)).filter(v => v != null && !isNaN(v));
      const services = (se.services || []).map(v => v === '' || v == null ? null : Math.min(100, Number(v))).filter(v => v != null && !isNaN(v));
      const avgPct = quizzes.length ? Math.round((quizzes.reduce((a,b)=>a+b,0)/quizzes.length)/10*100*100)/100 : 0;
      const svcPct = services.length ? Math.round(services.reduce((a,b)=>a+b,0)/services.length*100)/100 : 0;
      await supabase.from('students').update({
        quiz_scores: quizzes, service_scores: services,
        quiz1: quizzes[0] ?? null, quiz2: quizzes[1] ?? null, quiz3: quizzes[2] ?? null,
        quiz_score: avgPct, hj_quiz: avgPct,
        service_pct: services[0] ?? null, hj_service_pct: svcPct,
        service_week_score: Math.round(svcPct/100*50*100)/100
      }).eq('student_id', sid);
      // 3. Refresh data + recompute grades.
      await recomputeAllGrades();
      await loadAllMarks();
      // Clear this student's inline edits.
      setInlineMarkEdits(prev => { const n = {...prev}; Object.keys(n).forEach(k => { if (k.startsWith(sid + '-')) delete n[k]; }); return n; });
      alert('✅ Saved!');
    } catch (err) {
      console.error('Inline save error:', err);
      alert('Failed to save.');
    } finally {
      setSavingInline(false);
    }
  };

  // Build a printable HTML report for one student and open the print dialog.
  // Print a summary report for an archived program.
  // Open a printable HTML report reliably on both desktop and mobile.
  // Mobile browsers block window.open+document.write, so we use a Blob URL,
  // which they treat as a real page that can be viewed, shared, and printed.
  const openPrintable = (html, title) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
    // Ensure the page auto-opens the print dialog once it loads.
    const withPrint = html.includes('window.print()')
      ? html
      : html.replace('</body>', `<script>window.addEventListener('load',function(){setTimeout(function(){window.print();},400);});</script></body>`);
    if (isMobile) {
      const blob = new Blob([withPrint], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        // Pop-up blocked: navigate the current tab to the report instead.
        window.location.href = url;
      }
      // Clean up the object URL after a while.
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }
    const win = window.open('', '_blank');
    if (!win) { alert('Please allow pop-ups to open the report.'); return; }
    win.document.write(withPrint);
    win.document.close();
  };

  const printArchiveReport = (archive, students) => {
    const heartFor = (g) => heartLevelFor(Math.round(parseFloat(g) || 0));
    const rows = (students || []).map((s, i) => {
      const hl = heartFor(s.hj_grade);
      return `<tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${i + 1}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${s.first_name || ''} ${s.last_name || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${s.student_id || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${s.team || ''}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${hl.icon} ${hl.name}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${Math.round(parseFloat(s.hj_grade) || 0)}%</td>
      </tr>`;
    }).join('');
    const html = `<html><head><title>${archive.archive_name}</title></head>
      <body style="font-family:system-ui,sans-serif;padding:24px;color:#1F2937">
        <h1 style="color:#2563EB">📜 ${archive.archive_name}</h1>
        <p style="color:#6B7280">${archive.start_date || ''}${archive.end_date ? ` – ${archive.end_date}` : ''} · ${archive.student_count} students · ${archive.total_sessions} sessions</p>
        <button onclick="window.print()" style="padding:10px 20px;background:#2563EB;color:#fff;border:none;border-radius:8px;font-weight:bold;cursor:pointer;margin-bottom:16px">🖨️ Print / Save as PDF</button>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <tr style="background:#EFF6FF"><th style="padding:6px;text-align:left">#</th><th style="padding:6px;text-align:left">Name</th><th style="padding:6px;text-align:left">ID</th><th style="padding:6px;text-align:left">Team</th><th style="padding:6px;text-align:left">Heart Level</th><th style="padding:6px;text-align:right">Grade</th></tr>
          ${rows}
        </table>
      </body></html>`;
    openPrintable(html, archive.archive_name);
  };

  const printStudentReport = (student, marks, gratEntries) => {
    const sid = student['Student ID'];
    const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);
    const mMap = {}; (marks || []).forEach(m => { mMap[m.session_number] = m; });
    const pct = (field) => Math.round(sessions.filter(n => mMap[n] && mMap[n][field]).length / sessionCount * 100);
    const box = (on, color) => `<span style="display:inline-block;width:20px;height:20px;border-radius:4px;margin:1px;background:${on?color:'#E5E7EB'};color:#fff;font-size:9px;text-align:center;line-height:20px;font-weight:bold"></span>`;
    const grid = (field, color) => sessions.map(n => box(mMap[n] && mMap[n][field], color)).join('');
    const grade = Math.round(parseFloat(student['HJ Grade']) || 0);
    const quiz = Math.round(parseFloat(student['HJ Quiz']) || 0);
    const svc = Math.round(parseFloat(student['HJ Service Pct']) || 0);
    const grats = (gratEntries || []).filter(g => g.studentId === sid || g.student_id === sid);
    const gratHtml = grats.length ? grats.map(g => `<div style="background:#FFF1F2;border-radius:8px;padding:8px;margin-bottom:6px"><b style="color:#E11D48;font-size:11px">${g.session || ('Session ' + g.session_number)}</b><br>${(g.content || g.entry_text || '').replace(/</g,'&lt;')}</div>`).join('') : '<i style="color:#9CA3AF">No gratitude entries yet.</i>';
    const w_html = `<!DOCTYPE html><html><head><title>${student['First Name']} ${student['Last Name']} - HJ Report</title>
      <style>body{font-family:-apple-system,Arial,sans-serif;padding:30px;color:#1F2937;max-width:800px;margin:0 auto}
      h1{color:#7C3AED;margin-bottom:0}.sub{color:#6B7280;margin-top:4px}
      .pillar{margin:14px 0}.plabel{display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin-bottom:4px}
      .scores{display:flex;gap:12px;margin:16px 0}.score{flex:1;text-align:center;background:#F9FAFB;border-radius:10px;padding:12px}
      .score .v{font-size:24px;font-weight:bold}.head{display:flex;align-items:center;gap:16px;border-bottom:2px solid #EDE9FE;padding-bottom:16px}
      @media print{button{display:none}}</style></head><body>
      <div class="head">
        ${student['Photo'] ? `<img src="${student['Photo']}" style="width:70px;height:70px;border-radius:50%;object-fit:cover">` : ''}
        <div><h1>${student['First Name']} ${student['Last Name']}</h1>
        <p class="sub">${sid} · ${student['Category']||''} ${student['TEAM']?'· '+student['TEAM']:''} ${student['Contact']?'· '+student['Contact']:''}</p></div>
        <div style="margin-left:auto;text-align:center"><div style="font-size:32px;font-weight:bold;color:#7C3AED">${grade}%</div><div style="font-size:11px;color:#6B7280">HJ Grade</div></div>
      </div>
      <div class="scores">
        <div class="score"><div class="v" style="color:#7C3AED">${pct('attendance')}%</div><div>Attendance</div></div>
        <div class="score"><div class="v" style="color:#0D9488">${pct('hj_shirt')}%</div><div>One Heart One Shirt</div></div>
        <div class="score"><div class="v" style="color:#E11D48">${pct('gratitude')}%</div><div>Gratitude</div></div>
        <div class="score"><div class="v" style="color:#D97706">${quiz}%</div><div>Quiz</div></div>
        <div class="score"><div class="v" style="color:#3B82F6">${svc}%</div><div>Service</div></div>
      </div>
      <div class="pillar"><div class="plabel"><span>📅 Attendance</span><span style="color:#7C3AED">${pct('attendance')}%</span></div>${grid('attendance','#7C3AED')}</div>
      <div class="pillar"><div class="plabel"><span>🫂 One Heart One Shirt</span><span style="color:#0D9488">${pct('hj_shirt')}%</span></div>${grid('hj_shirt','#0D9488')}</div>
      <div class="pillar"><div class="plabel"><span>💗 Gratitude</span><span style="color:#E11D48">${pct('gratitude')}%</span></div>${grid('gratitude','#E11D48')}</div>
      <h3 style="color:#E11D48;margin-top:24px">💗 Gratitude Journal (${grats.length})</h3>
      ${gratHtml}
      <p style="margin-top:24px;color:#9CA3AF;font-size:11px;text-align:center">Hyojeong Youth CARAGA · Generated ${new Date().toLocaleDateString()}</p>
      <button onclick="window.print()" style="display:block;margin:20px auto;padding:12px 28px;background:#7C3AED;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:bold;cursor:pointer">🖨️ Print / Save as PDF</button>
      </body></html>`;
    openPrintable(w_html, `${student['First Name']} ${student['Last Name']} - HJ Report`);
  };

  // Build a printable summary report of all (filtered) students.
  const printAllStudentsReport = (students, marks) => {
    const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);
    const rows = students.map(s => {
      const sid = s['Student ID'];
      const mm = {}; marks.filter(m => m.student_id === sid).forEach(m => { mm[m.session_number] = m; });
      const p = (f) => Math.round(sessions.filter(n => mm[n] && mm[n][f]).length / sessionCount * 100);
      return `<tr>
        <td>${s['First Name']} ${s['Last Name']}</td><td>${sid}</td><td>${s['TEAM']||'-'}</td>
        <td style="text-align:center">${p('attendance')}%</td><td style="text-align:center">${p('hj_shirt')}%</td>
        <td style="text-align:center">${p('gratitude')}%</td><td style="text-align:center">${Math.round(parseFloat(s['HJ Quiz'])||0)}%</td>
        <td style="text-align:center">${Math.round(parseFloat(s['HJ Service Pct'])||0)}%</td>
        <td style="text-align:center;font-weight:bold;color:#7C3AED">${Math.round(parseFloat(s['HJ Grade'])||0)}%</td></tr>`;
    }).join('');
    const all_html = `<!DOCTYPE html><html><head><title>All Students Report</title>
      <style>body{font-family:-apple-system,Arial,sans-serif;padding:24px;color:#1F2937}h1{color:#7C3AED}
      table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #E5E7EB;padding:6px 8px;text-align:left}
      th{background:#EDE9FE;color:#5B21B6}tr:nth-child(even){background:#FAFAFB}@media print{button{display:none}}</style></head><body>
      <h1>Hyojeong Youth CARAGA — All Students Report</h1>
      <p style="color:#6B7280">${students.length} students · Generated ${new Date().toLocaleDateString()}</p>
      <table><thead><tr><th>Name</th><th>ID</th><th>Team</th><th>Att</th><th>Shirt</th><th>Grat</th><th>Quiz</th><th>Service</th><th>Grade</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <button onclick="window.print()" style="display:block;margin:20px auto;padding:12px 28px;background:#7C3AED;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:bold;cursor:pointer">🖨️ Print / Save as PDF</button>
      </body></html>`;
    openPrintable(all_html, 'All Students Report');
  };

  // Load announcements relevant to the current viewer.
  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) { console.error('Error loading announcements:', error); setAnnouncements([]); return; }
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Error loading announcements:', err);
      setAnnouncements([]);
    }
  };

  // Post a new announcement. Admin -> 'all'; lead -> their team.
  const postAnnouncement = async () => {
    if (!announceText.trim()) { alert('Please write your announcement first.'); return; }
    try {
      setPostingAnnounce(true);
      const record = {
        author_role: isAdmin ? 'admin' : 'lead',
        author_name: isAdmin ? 'Admin' : `Team ${leadTeam} Lead`,
        audience: isAdmin ? 'all' : leadTeam,
        title: announceTitle.trim() || null,
        body: announceText.trim()
      };
      const { error } = await supabase.from('announcements').insert([record]);
      if (error) { alert('Failed to post: ' + error.message); return; }
      setAnnounceText(''); setAnnounceTitle('');
      await loadAnnouncements();
      alert('✅ Announcement posted!');
    } catch (err) {
      console.error('Post announcement error:', err);
      alert('Failed to post announcement.');
    } finally {
      setPostingAnnounce(false);
    }
  };

  // Load every student's attendance marks (for the admin student list overview).
  const loadAllMarks = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_marks')
        .select('student_id, session_number, attendance, hj_shirt, gratitude');
      if (error) { console.error('Error loading all marks:', error); setAllMarks([]); return; }
      setAllMarks(data || []);
    } catch (err) {
      console.error('Error loading all marks:', err);
      setAllMarks([]);
    }
  };

  // Load current quiz/service values into editable state for a roster.
  const loadScoreEdits = (roster) => {
    const edits = {};
    roster.forEach(s => {
      const sid = s['Student ID'];
      edits[sid] = {
        quiz1: s['Quiz1'] ?? '',
        quiz2: s['Quiz2'] ?? '',
        quiz3: s['Quiz3'] ?? '',
        service_pct: s['ServicePct'] ?? ''
      };
    });
    setScoreEdits(edits);
  };

  const setScoreField = (studentId, field, value) => {
    setScoreEdits(prev => ({ ...prev, [studentId]: { ...(prev[studentId] || {}), [field]: value } }));
  };

  // Save quiz scores: writes quiz1-3, and the averaged quiz_score (%) + hj_quiz for display.
  const saveQuizScores = async () => {
    try {
      setSavingScores(true);
      const updates = Object.keys(scoreEdits).map(sid => {
        const e = scoreEdits[sid];
        const q = ['quiz1', 'quiz2', 'quiz3'].map(k => e[k] === '' || e[k] == null ? null : Number(e[k]));
        const taken = q.filter(v => v != null && !isNaN(v));
        const avgPct = taken.length ? Math.round((taken.reduce((a, b) => a + b, 0) / taken.length) / 10 * 100 * 100) / 100 : 0;
        return supabase.from('students').update({
          quiz1: q[0], quiz2: q[1], quiz3: q[2],
          quiz_score: avgPct, hj_quiz: avgPct
        }).eq('student_id', sid);
      });
      await Promise.all(updates);
      await loadStudents();
      alert('✅ Quiz scores saved!');
    } catch (err) {
      console.error('Save quiz error:', err);
      alert('Failed to save quiz scores.');
    } finally {
      setSavingScores(false);
    }
  };

  // Save service scores: writes service_pct (%) and hj_service_pct for display.
  const saveServiceScores = async () => {
    try {
      setSavingScores(true);
      const updates = Object.keys(scoreEdits).map(sid => {
        const e = scoreEdits[sid];
        const pct = e.service_pct === '' || e.service_pct == null ? null : Math.min(100, Number(e.service_pct));
        return supabase.from('students').update({
          service_pct: pct,
          hj_service_pct: pct == null ? 0 : pct,
          service_week_score: pct == null ? 0 : Math.round(pct / 100 * 50 * 100) / 100
        }).eq('student_id', sid);
      });
      await Promise.all(updates);
      await loadStudents();
      alert('✅ Service scores saved!');
    } catch (err) {
      console.error('Save service error:', err);
      alert('Failed to save service scores.');
    } finally {
      setSavingScores(false);
    }
  };

  // Load existing attendance marks for a session into editable state.
  const loadAttendanceMarks = async (sessionNum) => {
    try {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from('attendance_marks')
        .select('*')
        .eq('session_number', sessionNum);
      if (error) {
        console.error('Error loading attendance marks:', error);
        setAttendanceMarks({});
        return;
      }
      const marks = {};
      (rows || []).forEach(r => {
        marks[r.student_id] = {
          attendance: !!r.attendance,
          hj_shirt: !!r.hj_shirt,
          gratitude: !!r.gratitude
        };
      });
      setAttendanceMarks(marks);
    } catch (err) {
      console.error('Error:', err);
      setAttendanceMarks({});
    } finally {
      setLoading(false);
    }
  };

  // Toggle a single mark for a student in local state.
  const toggleMark = (studentId, field) => {
    setAttendanceMarks(prev => {
      const cur = prev[studentId] || { attendance: false, hj_shirt: false, gratitude: false };
      return { ...prev, [studentId]: { ...cur, [field]: !cur[field] } };
    });
  };

  // Save all marks for the current session to Supabase (upsert per student).
  // Recompute every student's HJ Grade from the new 5-factor formula.
  // Attendance 40% + Service 20% + Gratitude 20% + One Heart One Shirt 10% + Quiz 10%.
  // Attendance & shirt come from attendance_marks; gratitude from real entries
  // (falling back to the attendance gratitude checkbox); service & quiz from students.
  // Admin button: recompute every student's grade and refresh.
  const handleRecomputeAll = async () => {
    if (!window.confirm('Recompute grades for all students using the latest data and formula?')) return;
    try {
      setRecomputing(true);
      await recomputeAllGrades();
      await loadStudents();
      alert('✅ All grades recomputed!');
    } catch (err) {
      console.error('Recompute all error:', err);
      alert('Something went wrong recomputing grades.');
    } finally {
      setRecomputing(false);
    }
  };

  // Load the list of past program archives (newest first).
  const recomputeAllGrades = async () => {
    try {
      // Pull everything we need in three queries.
      const [studentsRes, marksRes, gratRes] = await Promise.all([
        supabase.from('students').select('student_id, service_week_score, quiz_score'),
        supabase.from('attendance_marks').select('student_id, session_number, attendance, hj_shirt, gratitude'),
        supabase.from('gratitude').select('student_id, session_number')
      ]);

      if (studentsRes.error || marksRes.error) {
        console.error('Recompute load error:', studentsRes.error || marksRes.error);
        return;
      }

      const students = studentsRes.data || [];
      const marks = marksRes.data || [];
      const gratEntries = gratRes.data || [];

      // Tally attendance & shirt marks, and checkbox-gratitude, per student.
      const tally = {}; // sid -> {att, shirt, gratChk}
      marks.forEach(m => {
        const t = tally[m.student_id] || { att: 0, shirt: 0, gratChk: 0 };
        if (m.attendance) t.att += 1;
        if (m.hj_shirt) t.shirt += 1;
        if (m.gratitude) t.gratChk += 1;
        tally[m.student_id] = t;
      });

      // Count distinct gratitude sessions with a real entry, per student.
      const gratReal = {}; // sid -> Set of sessions
      gratEntries.forEach(g => {
        if (!gratReal[g.student_id]) gratReal[g.student_id] = new Set();
        gratReal[g.student_id].add(g.session_number);
      });

      // Build one UPDATE per student.
      const updates = students.map(s => {
        const sid = s.student_id;
        const t = tally[sid] || { att: 0, shirt: 0, gratChk: 0 };
        const attPct = Math.min(100, (t.att / sessionCount) * 100);
        const shirtPct = Math.min(100, (t.shirt / sessionCount) * 100);
        // Gratitude: prefer real entries; fall back to checkbox count if no entries exist.
        const realCount = gratReal[sid] ? gratReal[sid].size : 0;
        const gratCount = realCount > 0 ? realCount : t.gratChk;
        const gratPct = Math.min(100, (gratCount / gratitudeCount) * 100);
        const svcPct = Math.min(100, Number(s.service_week_score || 0) / 50 * 100);
        const quizPct = Math.min(100, Number(s.quiz_score || 0));

        const grade = Math.round(
          (attPct * 0.4 + svcPct * 0.2 + gratPct * 0.2 + shirtPct * 0.1 + quizPct * 0.1) * 100
        ) / 100;

        return supabase.from('students').update({
          hj_grade: grade,
          hj_attendance: Math.round(attPct * 100) / 100,
          hj_shirt_pct: Math.round(shirtPct * 100) / 100,
          hj_service_pct: Math.round(svcPct * 100) / 100,
          hj_quiz: Math.round(quizPct * 100) / 100,
          percentage: Math.round(attPct * 100) / 100
        }).eq('student_id', sid);
      });

      await Promise.all(updates);
      // Refresh the in-app roster so new grades show immediately.
      if (typeof loadStudents === 'function') await loadStudents();
    } catch (err) {
      console.error('Recompute error:', err);
    }
  };

  // Load the list of archived programs.
  const loadArchives = async () => {
    try {
      const { data, error } = await supabase
        .from('program_archives')
        .select('*')
        .order('archived_at', { ascending: false });
      if (error) { console.error('Load archives error:', error); return; }
      setArchives(data || []);
    } catch (err) { console.error('Load archives error:', err); }
  };

  // Load one archive's student snapshots.
  const loadArchiveStudents = async (archive) => {
    try {
      setLoadingArchive(true);
      setViewingArchive(archive);
      const { data, error } = await supabase
        .from('program_archive_students')
        .select('*')
        .eq('archive_id', archive.id)
        .order('hj_grade', { ascending: false });
      if (error) { console.error('Load archive students error:', error); setArchiveStudents([]); }
      else setArchiveStudents(data || []);
    } catch (err) { console.error('Load archive students error:', err); setArchiveStudents([]); }
    finally { setLoadingArchive(false); }
  };

  // Build a full snapshot of the current program and write it to the archive tables.
  const archiveCurrentProgram = async (archiveName) => {
    const [studentsRes, marksRes, gratRes] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('attendance_marks').select('*'),
      supabase.from('gratitude').select('*')
    ]);
    if (studentsRes.error) { alert('Archive failed loading students: ' + studentsRes.error.message); return null; }
    const students = studentsRes.data || [];
    const marks = marksRes.data || [];
    const grat = gratRes.data || [];

    const { data: archRow, error: archErr } = await supabase
      .from('program_archives')
      .insert({
        archive_name: archiveName,
        program_name: programSettings.program_name,
        start_date: programSettings.start_date,
        end_date: programSettings.end_date,
        total_sessions: sessionCount,
        total_gratitude_sessions: gratitudeCount,
        num_quizzes: quizCount,
        num_services: serviceCount,
        student_count: students.length
      })
      .select()
      .single();
    if (archErr || !archRow) { alert('Archive failed: ' + (archErr?.message || 'no row')); return null; }
    const archiveId = archRow.id;

    const marksBy = {}; marks.forEach(m => { (marksBy[m.student_id] = marksBy[m.student_id] || []).push(m); });
    const gratBy = {}; grat.forEach(g => { (gratBy[g.student_id] = gratBy[g.student_id] || []).push(g); });

    const rows = students.map(s => ({
      archive_id: archiveId,
      student_id: s.student_id,
      first_name: s.first_name,
      last_name: s.last_name,
      team: s.team,
      category: s.category,
      photo_url: s.photo_url,
      hj_grade: s.hj_grade || 0,
      hj_attendance: s.hj_attendance || 0,
      hj_service_pct: s.hj_service_pct || 0,
      hj_gratitude_pct: s.hj_gratitude_pct || 0,
      hj_shirt_pct: s.hj_shirt_pct || 0,
      hj_quiz: s.hj_quiz || 0,
      detail: {
        quiz_scores: s.quiz_scores || [],
        service_scores: s.service_scores || [],
        status: s.status || 'active',
        attendance_marks: (marksBy[s.student_id] || []).map(m => ({
          session: m.session_number, attendance: m.attendance, hj_shirt: m.hj_shirt, gratitude: m.gratitude
        })),
        gratitude_entries: (gratBy[s.student_id] || []).map(g => ({
          session: g.session_number, text: g.text || g.entry || ''
        }))
      }
    }));

    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error } = await supabase.from('program_archive_students').insert(chunk);
      if (error) { alert('Archive detail failed: ' + error.message); return archiveId; }
    }
    return archiveId;
  };

  // Stage 4: Start a New Program.
  // 1) Archive everything, 2) clear attendance + gratitude, 3) reset grades/scores,
  // 4) save the new program's settings (length/quizzes/services/name/dates).
  // Students are KEPT (you set active/inactive afterward).
  const startNewProgram = async (opts) => {
    // opts: { archiveName, newName, startDate, endDate, sessions, gratitudeSessions, quizzes, services }
    try {
      setStartingProgram(true);

      // 1) Archive the current program first (nothing is lost).
      const archiveId = await archiveCurrentProgram(opts.archiveName);
      if (!archiveId) { setStartingProgram(false); return false; } // archive failed → abort, no clearing

      // 2) Clear attendance marks and gratitude entries (delete all rows).
      const delMarks = await supabase.from('attendance_marks').delete().neq('student_id', '___none___');
      if (delMarks.error) { alert('Could not clear attendance: ' + delMarks.error.message); setStartingProgram(false); return false; }
      const delGrat = await supabase.from('gratitude').delete().neq('student_id', '___none___');
      if (delGrat.error) { alert('Could not clear gratitude: ' + delGrat.error.message); setStartingProgram(false); return false; }

      // 3) Reset every student's grade/score fields to 0 (keep the students themselves).
      const resetRes = await supabase.from('students').update({
        hj_grade: 0, hj_attendance: 0, hj_service_pct: 0, hj_gratitude_pct: 0, hj_shirt_pct: 0, hj_quiz: 0,
        quiz_score: 0, service_week_score: 0, service_pct: null,
        quiz1: null, quiz2: null, quiz3: null,
        quiz_scores: [], service_scores: []
      }).neq('student_id', '___none___');
      if (resetRes.error) { alert('Could not reset student scores: ' + resetRes.error.message); setStartingProgram(false); return false; }

      // 4) Save the new program settings.
      const dates = [];
      const next = {
        ...programSettings,
        program_name: opts.newName || 'New Program',
        start_date: opts.startDate || '',
        end_date: opts.endDate || '',
        total_sessions: parseInt(opts.sessions, 10) || 21,
        total_gratitude_sessions: parseInt(opts.gratitudeSessions, 10) || parseInt(opts.sessions, 10) || 21,
        num_quizzes: parseInt(opts.quizzes, 10) || 0,
        num_services: parseInt(opts.services, 10) || 0,
        session_dates: dates
      };
      await saveProgramSettings(next);

      // Refresh local data.
      await loadStudents();
      await loadArchives();
      setStartingProgram(false);
      return true;
    } catch (err) {
      console.error('Start new program error:', err);
      alert('Something went wrong starting the new program.');
      setStartingProgram(false);
      return false;
    }
  };

  const saveAttendanceMarks = async () => {
    try {
      setSavingAttendance(true);
      const sessionNum = attendanceSession;
      const records = Object.keys(attendanceMarks).map(sid => ({
        student_id: sid,
        session_number: sessionNum,
        attendance: attendanceMarks[sid].attendance,
        hj_shirt: attendanceMarks[sid].hj_shirt,
        gratitude: attendanceMarks[sid].gratitude,
        marked_by: isAdmin ? 'admin' : (leadTeam ? `lead:${leadTeam}` : (studentData ? studentData['Student ID'] : 'unknown')),
        updated_at: new Date().toISOString()
      }));
      if (records.length === 0) {
        alert('No marks to save. Tap students to mark them first.');
        return;
      }
      const { error } = await supabase
        .from('attendance_marks')
        .upsert(records, { onConflict: 'student_id,session_number' });
      if (error) {
        console.error('Error saving attendance:', error);
        alert('Failed to save: ' + error.message);
        return;
      }
      // Recompute grades from the updated marks, then confirm.
      await recomputeAllGrades();
      alert(`✅ Saved Session ${sessionNum} and updated grades! (${records.length} students)`);
    } catch (err) {
      console.error('Error saving attendance:', err);
      alert('Failed to save attendance.');
    } finally {
      setSavingAttendance(false);
    }
  };

  const loadAllGratitudeEntries = async (session) => {
    try {
      setLoading(true);
      const sessionToLoad = session || 'Session 1';
      const sessionNum = parseInt(String(sessionToLoad).replace(/\D/g, ''), 10);

      // Load all gratitude entries for this session from Supabase.
      const { data: rows, error } = await supabase
        .from('gratitude')
        .select('*')
        .eq('session_number', sessionNum);

      if (error) {
        console.error('Supabase error loading gratitude entries:', error);
        setAllGratitudeEntries([]);
        return;
      }

      // Build a lookup of student names. Prefer already-loaded students,
      // but fetch from Supabase if they aren't in memory yet so names
      // always display instead of falling back to IDs.
      let studentList = allStudents;
      if (!studentList || studentList.length === 0) {
        const { data: sRows } = await supabase
          .from('students')
          .select('student_id, first_name, last_name');
        studentList = (sRows || []).map(s => ({
          'Student ID': s.student_id,
          'First Name': s.first_name,
          'Last Name': s.last_name
        }));
      }
      const nameById = {};
      (studentList || []).forEach(s => {
        nameById[s['Student ID']] = `${s['First Name'] || ''} ${s['Last Name'] || ''}`.trim();
      });

      // Translate Supabase rows -> the shape the admin panel expects.
      // We carry student_id + session_number as the entry's identity so a
      // remark can be written back to the correct row.
      const translated = (rows || []).map(r => ({
        studentId: r.student_id,
        studentName: nameById[r.student_id] || r.student_id,
        session: `Session ${r.session_number}`,
        sessionNumber: r.session_number,
        content: r.entry_text,
        timestamp: r.date_submitted,
        adminRemark: r.admin_remark
      }));

      setAllGratitudeEntries(translated);
    } catch (err) {
      console.error('Error:', err);
      setAllGratitudeEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = (category) => {
    return allStudents
      .filter(s => s.Category === category)
      .sort((a, b) => (b['HJ Grade'] || 0) - (a['HJ Grade'] || 0))
      .slice(0, 10);
  };

  const handleLogin = async () => {
    setError('');
    if (!studentId.trim()) { 
      setError('Please enter your Student ID'); 
      return; 
    }
    if (studentId.toUpperCase() === 'ADMIN') { 
      setCurrentPage('admin-login'); 
      return; 
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    let students = allStudents;
    if (!students || students.length === 0) {
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from('students')
          .select('*');
        if (error) {
          console.error('Supabase error loading students at login:', error);
          setError('Connection error. Please try again.');
          setLoading(false);
          return;
        }
        students = (rows || []).map(r => ({
          'Student ID': r.student_id,
          'Password': r.password,
          'First Name': r.first_name,
          'Last Name': r.last_name,
          'Photo': r.photo_url,
          'Date of Birth': r.date_of_birth,
          'Age': r.age,
          'Category': r.category,
          'TEAM': r.team || r.team_id,
          'HJ Service': r.hj_service_points,
          'HJ Grade': r.hj_grade,
          'HJ Attendance': r.hj_attendance,
          'HJ Service Pct': r.hj_service_pct,
        'HJ Shirt Pct': r.hj_shirt_pct,
        'Status': r.status || 'active',
        'Contact': r.contact_number,
        'FB': r.fb_account,
        'Motto': r.motto,
        'Quiz1': r.quiz1, 'Quiz2': r.quiz2, 'Quiz3': r.quiz3, 'ServicePct': r.service_pct,
        'QuizScores': Array.isArray(r.quiz_scores) ? r.quiz_scores : [], 'ServiceScores': Array.isArray(r.service_scores) ? r.service_scores : [],
          'HJ Quiz': r.hj_quiz,
          'Percentage': r.percentage,
        }));
        setAllStudents(students);
      } catch (err) {
        setError('Connection error. Please try again.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    const searchId = studentId.trim().toUpperCase();
    const student = students.find(s => (s['Student ID'] || '').toString().trim().toUpperCase() === searchId);
    
    if (!student) { 
      setError('Student ID not found. Please check and try again.'); 
      return;
    }
    
    // Check password
    const correctPassword = student['Password'] || '';
    if (password !== correctPassword) {
      setError('Incorrect password. Please try again.');
      return;
    }
    
    setLoading(true);
    setStudentData(student);
    setIsAdmin(false);
    await Promise.all([
      loadMyGratitudeEntries(student['Student ID']),
      loadStudentProgress(student['Student ID']),
      loadMyAttendanceMarks(student['Student ID']),
      loadAnnouncements(),
      loadMyEncouragements(student['Student ID']),
      loadMyReflections(student['Student ID'])
    ]);
    setLoading(false);
    setCurrentPage('home');
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'hjadmin2026') { 
      setIsAdmin(true); 
      setLeadTeam(null);
      setCurrentPage('admin-dashboard'); 
      setSelectedSessionFilter('Session 1');
      loadStudents();
      loadAllGratitudeEntries('Session 1');
      return;
    }
    // Otherwise, check if it matches a team lead's PIN.
    const teams = programSettings.teams || [];
    const match = teams.find(t => t.lead_pin && String(t.lead_pin).trim() === adminPassword.trim() && t.name);
    if (match) {
      setIsAdmin(false);
      setLeadTeam(match.name);
      setAttendanceTeamFilter(match.name);
      setAttendanceSession(1);
      loadStudents();
      loadAttendanceMarks(1);
      loadAnnouncements();
      setCurrentPage('lead-dashboard');
      setError('');
      return;
    }
    setError('Incorrect password or PIN');
  };

  // Team-lead login: PIN must match a team in settings.
  const handleLeadLogin = () => {
    const teams = programSettings.teams || [];
    const match = teams.find(t => t.lead_pin && String(t.lead_pin).trim() === adminPassword.trim() && t.name);
    if (match) {
      setIsAdmin(false);
      setLeadTeam(match.name);
      setAttendanceTeamFilter(match.name);
      setAttendanceSession(1);
      loadStudents();
      loadAttendanceMarks(1);
      loadAnnouncements();
      setCurrentPage('lead-dashboard');
      setError('');
    } else {
      setError('Incorrect team PIN');
    }
  };

  // Admin-only login.
  const handleAdminOnlyLogin = () => {
    if (adminPassword === 'hjadmin2026') {
      setIsAdmin(true);
      setLeadTeam(null);
      setCurrentPage('admin-dashboard');
      setSelectedSessionFilter('Session 1');
      loadStudents();
      loadAllGratitudeEntries('Session 1');
      setError('');
    } else {
      setError('Incorrect admin password');
    }
  };

  const handleLogout = () => { 
    setStudentData(null); 
    setStudentId(''); 
    setPassword('');
    setIsAdmin(false); 
    setLeadTeam(null);
    setAdminPassword(''); 
    setCurrentPage('login');
    setMyGratitudeEntries([]);
    setAllGratitudeEntries([]);
    setSelectedStudentDetail(null);
    setPoints(0);
    setEarnedBadges([]);
    setGoals({ goal1: '', goal2: '', goal3: '', goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set' });
    setEditingGoals(false);
  };

  const handleGratitudeSubmit = async () => {
    if (!gratitudeText.trim() || !selectedSession) { 
      setError('Please select a session and write your gratitude journal'); 
      return; 
    }
    
    try {
      setLoading(true);
      
      // Check if entry already exists for this session
      const existingEntry = myGratitudeEntries.find(
        entry => entry.session === selectedSession && entry.studentId === studentData['Student ID']
      );
      
      const submission = { 
        studentId: studentData['Student ID'], 
        studentName: `${studentData['First Name']} ${studentData['Last Name']}`, 
        session: selectedSession, 
        content: gratitudeText, 
        timestamp: new Date().toISOString(),
        isUpdate: !!existingEntry // Flag to indicate if this is an update
      };
      
     // Save gratitude to Supabase — check the DATABASE for an existing row, not the in-memory list
      const sessionNum = parseInt(String(selectedSession).replace(/\D/g, ''), 10);
      let saveError = null;

      const { data: existingRows } = await supabase
        .from('gratitude')
        .select('id')
        .eq('student_id', studentData['Student ID'])
        .eq('session_number', sessionNum);

      const reallyExists = existingRows && existingRows.length > 0;

      if (reallyExists) {
        const { error } = await supabase
          .from('gratitude')
          .update({ entry_text: gratitudeText })
          .eq('student_id', studentData['Student ID'])
          .eq('session_number', sessionNum);
        saveError = error;
      } else {
        const { error } = await supabase
          .from('gratitude')
          .insert({
            student_id: studentData['Student ID'],
            session_number: sessionNum,
            entry_text: gratitudeText
          });
        saveError = error;
      }

      const data = { success: !saveError, error: saveError?.message };
      if (data.success) {
        // Only award points if it's a NEW entry (not an update)
        if (!existingEntry) {
          await updateProgress({ addPoints: 10 });
          alert('✨ Gratitude journal submitted! +10 points earned!'); 
        } else {
          alert('✨ Gratitude journal updated!');
        }
        
        setGratitudeText(''); 
        setSelectedSession(''); 
        await loadMyGratitudeEntries(studentData['Student ID']);
        setCurrentPage('home');
      } else {
        setError('Failed to submit: ' + data.error);
      }
    } catch (err) { 
      setError('Failed to submit. Please try again.'); 
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRemarkSubmit = async (entry) => {
    if (!adminRemark.trim()) {
      alert('Please write a remark');
      return;
    }
    try {
      setLoading(true);

      // Update the remark on the row matching this student + session.
      // (One entry per student per session, so this targets exactly one row.)
      const { error } = await supabase
        .from('gratitude')
        .update({ admin_remark: adminRemark })
        .eq('student_id', entry.studentId)
        .eq('session_number', entry.sessionNumber);

      if (error) {
        console.error('Supabase error saving remark:', error);
        alert('Failed to save remark: ' + error.message);
        return;
      }

      alert('✅ Remark saved!');
      setAdminRemark('');
      setSelectedEntry(null);
      loadAllGratitudeEntries(selectedSessionFilter);
    } catch (err) {
      console.error('Error saving remark:', err);
      alert('Failed to save remark');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (url) => {
    if (!url) return null;
    if (url.includes('i.imgur.com') || url.includes('drive.google.com/thumbnail')) return url;
    if (url.includes('/file/d/')) return `https://drive.google.com/thumbnail?id=${url.split('/file/d/')[1].split('/')[0]}&sz=w400`;
    return url;
  };

  const getColorFromName = (firstName, lastName) => {
    const name = `${firstName || ''}${lastName || ''}`;
    const colors = ['from-purple-400 to-pink-400', 'from-blue-400 to-indigo-400', 'from-green-400 to-teal-400', 'from-orange-400 to-red-400', 'from-pink-400 to-rose-400', 'from-cyan-400 to-blue-400'];
    let hash = 0; 
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const Avatar = ({ firstName, lastName, photoUrl, size = 'md' }) => {
    const [imageError, setImageError] = useState(false);
    const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();
    const url = getPhotoUrl(photoUrl);
    const sizeClasses = { sm: 'w-12 h-12 text-lg', md: 'w-16 h-16 text-2xl', lg: 'w-48 h-48 text-7xl' };
    if (url && !imageError) return <img src={url} alt={`${firstName}`} className={`${sizeClasses[size]} rounded-3xl object-cover border-4 border-white shadow-2xl`} onError={() => setImageError(true)} />;
    return <div className={`${sizeClasses[size]} rounded-3xl bg-gradient-to-br ${getColorFromName(firstName, lastName)} flex items-center justify-center border-4 border-white shadow-2xl`}><span className="font-black text-white">{initials}</span></div>;
  };

  const calculateAttendance = (student = studentData) => {
  if (!student) return 0;

  // Prefer the stored HJ Attendance percentage (reliable post-migration).
  const att = student['HJ Attendance'];
  if (att !== undefined && att !== null && att !== '') {
    const n = parseFloat(att);
    if (!isNaN(n)) {
      // Stored as a percentage (e.g. 95.24); older data used a 0–1 decimal.
      return n > 1 ? Math.round(n) : Math.round(n * 100);
    }
  }

  // Fallback: count from the per-session marks if present.
  if (student.sessions && Array.isArray(student.sessions) && student.sessions.length > 0) {
    const attended = student.sessions.filter(s => s === true).length;
    return Math.round((attended / sessionCount) * 100);
  }
  return 0;
};

  // Number of sessions attended, derived from the stored percentage when the
  // per-session array isn't available (post-migration).
  const attendedSessions = (student = studentData) => {
    if (student && student.sessions && Array.isArray(student.sessions) && student.sessions.length > 0) {
      return student.sessions.filter(s => s === true).length;
    }
    return Math.round((calculateAttendance(student) / 100) * sessionCount);
  };

  // Compute which badges a SELECTED student (admin view) has earned,
  // from their stored scores + progress. Mirrors checkIfBadgeEarned but for
  // any student, not just the logged-in one.
  const computeBadgesForStudent = (detail, progress, gratitudeCount = 0) => {
    if (!detail) return [];
    const attendance = (() => {
      const a = parseFloat(detail['HJ Attendance']);
      if (isNaN(a)) return 0;
      return a > 1 ? Math.round(a) : Math.round(a * 100);
    })();
    const service = parseFloat(detail['HJ Service Pct']) || 0;
    const quiz = parseFloat(detail['HJ Quiz']) || 0;
    const grade = parseFloat(detail['HJ Grade']) || 0;
    const affirmation = progress && progress.affirmation ? String(progress.affirmation).trim() : '';
    const goalsSet = progress
      ? [progress.goal1, progress.goal2, progress.goal3].filter(g => g && String(g).trim()).length
      : 0;

    const earned = [];
    BADGES.forEach(badge => {
      let ok = false;
      if (badge.type === 'gratitude') ok = gratitudeCount >= badge.count;
      else if (badge.type === 'attendance') ok = attendance >= badge.percent;
      else if (badge.type === 'service') ok = service >= badge.percent;
      else if (badge.type === 'quiz') ok = quiz >= badge.percent;
      else if (badge.type === 'grade') ok = grade >= badge.percent;
      else if (badge.type === 'affirmation') ok = affirmation.length > 0;
      else if (badge.type === 'goals') ok = goalsSet >= badge.goalsSet;
      if (ok) earned.push(badge.id);
    });
    return earned;
  };

  const checkIfBadgeEarned = (badge) => {
    if (!studentData) return false;
    if (earnedBadges.includes(badge.id)) return true;
    
    const gratitudeCount = myGratitudeEntries.length;
    const attendance = calculateAttendance();
    
    // Calculate grade the same way as Growth Journey (average of 4 metrics)
    const quiz = studentData['HJ Quiz'] || 0;
    const service = studentData['HJ Service'] || 0;
    const gratitudePercent = Math.min(100, Math.round((myGratitudeEntries.length / gratitudeCount) * 100));
    const grade = Math.round((attendance + quiz + service + gratitudePercent) / 4);
    
    if (badge.type === 'gratitude') return gratitudeCount >= badge.count;
    if (badge.type === 'attendance') return attendance >= badge.percent;
    if (badge.type === 'service') return service >= badge.percent;
    if (badge.type === 'quiz') return quiz >= badge.percent;
    if (badge.type === 'grade') return grade >= badge.percent;
    if (badge.type === 'affirmation') return affirmation && affirmation.trim().length > 0;
    if (badge.type === 'goals') {
      const goalsSet = [goals.goal1, goals.goal2, goals.goal3].filter(g => g && g.trim()).length;
      return goalsSet >= badge.goalsSet;
    }
    
    return false;
  };

  // CELEBRATION MODAL FOR ALL BADGES UNLOCKED
  const CelebrationModal = () => {
    const confettiColors = ['#FF6B9D', '#C44569', '#FFA502', '#FFD32A', '#05C46B', '#0ABDE3', '#5F27CD', '#FF9FF3'];
    const confettiPieces = Array(50).fill(null);
    
    const downloadCertificate = () => {
      const certificateHTML = `<!DOCTYPE html>
<html><head><style>
body{font-family:Arial,sans-serif;text-align:center;padding:50px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}
.certificate{background:white;padding:60px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:800px;margin:0 auto;border:10px solid gold}
h1{color:#764ba2;font-size:48px;margin-bottom:20px}h2{color:#667eea;font-size:32px}p{font-size:20px;line-height:1.8;color:#333}
.name{font-size:36px;color:#C44569;font-weight:bold;margin:30px 0}.hearts{font-size:48px}
</style></head><body><div class="certificate">
<h1>🏆 Certificate of Heart Mastery 🏆</h1><p>This is to certify that</p>
<div class="name">${studentData['First Name']} ${studentData['Last Name']}</div>
<p>has successfully unlocked all</p><div class="hearts">💛 💖 💜 🌸 💙 🧡 💚 ✨ ✨ ❤️</div>
<h2>10 Hearts of Hyojeong Youth Caraga!</h2>
<p style="margin-top:40px">Presented on ${new Date().toLocaleDateString()}</p>
<p style="font-style:italic;color:#666;margin-top:30px">"Living for the sake of others is the way to bring peace to the world."<br>- True Parents</p>
</div></body></html>`;
      
      const blob = new Blob([certificateHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Heart_Champion_Certificate_${studentData['Student ID']}.html`;
      a.click();
      URL.revokeObjectURL(url);
    };
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        {confettiPieces.map((_, i) => (
          <div key={i} className="fixed w-3 h-3 animate-confetti" style={{
            left: `${Math.random() * 100}%`, top: '-20px',
            backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s`
          }} />
        ))}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-8 border-yellow-400 animate-celebration">
          <button onClick={() => setShowCelebration(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center mb-6">
            <div className="inline-block animate-bounce-slow">
              <div className="text-8xl mb-4">🏆</div>
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">CONGRATULATIONS!</h2>
            <p className="text-xl font-bold text-gray-700">Binabati kita!</p>
          </div>
          <div className="text-center mb-6">
            <p className="text-lg font-bold text-gray-800 mb-2">You've Unlocked All 10 Hearts!</p>
            <p className="text-base text-gray-600">Na-unlock mo na ang lahat ng 10 Puso!</p>
          </div>
          <div className="flex justify-center gap-2 mb-6 flex-wrap">
            {BADGES.map((badge, i) => (
              <div key={badge.id} className="text-3xl animate-bounce-slow" style={{animationDelay: `${i * 0.1}s`}}>{badge.icon}</div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 border-4 border-yellow-400 mb-6">
            <div className="text-center">
              <p className="text-2xl font-black text-transparent bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text mb-1">💖 HEART CHAMPION 💖</p>
              <p className="text-sm font-bold text-gray-600">You are now a Heart Champion!</p>
            </div>
          </div>
          <button onClick={downloadCertificate} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all mb-3">
            📜 Download Certificate
          </button>
          <button onClick={() => setShowCelebration(false)} className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all">Continue</button>
        </div>
      </div>
    );
  };

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-300 shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        {[
          { page: 'home', icon: Home, label: 'Home' }, 
          { page: 'badges', icon: Award, label: 'Hearts' }, 
          { page: 'gratitude', icon: Heart, label: 'Journal' },
          { page: 'leaderboard', icon: Sparkles, label: 'HJ Garden' },
          { page: 'profile', icon: User, label: 'Profile' }
        ].map(({ page, icon: Icon, label }) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`flex flex-col items-center ${currentPage === page ? 'text-purple-600' : 'text-gray-400'}`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-bold mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const DailyQuote = () => {
    const quote = getDailyQuote();
    return (
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-4 border-purple-200 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-black text-gray-800">Today's Inspiration</h3>
        </div>
        <p className="text-gray-700 italic text-base mb-2">"{quote.quote}"</p>
        <p className="text-purple-600 font-bold text-sm">— {quote.author}</p>
      </div>
    );
  };

  const WeeklyAffirmation = () => {
    if (editingAffirmation) {
      return (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-4 border-yellow-200 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-black text-gray-800">Choose Your Weekly Affirmation</h3>
          </div>
          
          {/* Category Selection */}
          <div className="mb-3">
            <label className="block text-sm font-bold text-gray-700 mb-2">1. Select a Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedAffirmation('');
              }}
              className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300 font-semibold"
            >
              <option value="">-- Choose a category --</option>
              {Object.keys(AFFIRMATIONS).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Affirmation Selection */}
          {selectedCategory && (
            <div className="mb-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">2. Choose Your Affirmation</label>
              <select
                value={selectedAffirmation}
                onChange={(e) => setSelectedAffirmation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300 font-semibold"
              >
                <option value="">-- Select an affirmation --</option>
                {AFFIRMATIONS[selectedCategory].map((aff, index) => (
                  <option key={index} value={aff}>{aff}</option>
                ))}
              </select>
            </div>
          )}

          {/* Preview */}
          {selectedAffirmation && (
            <div className="mb-3 p-4 bg-white rounded-xl border-2 border-orange-200">
              <p className="text-sm text-gray-600 font-bold mb-1">Preview:</p>
              <p className="text-gray-800 font-bold italic">"{selectedAffirmation}"</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancelAffirmation}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAffirmation}
              disabled={!selectedAffirmation}
              className={`px-4 py-2 rounded-xl font-bold ${
                selectedAffirmation 
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-4 border-yellow-200 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-black text-gray-800">My Weekly Affirmation</h3>
          </div>
          <button
            onClick={handleEditAffirmation}
            className="text-orange-600 font-bold text-sm"
          >
            {affirmation ? 'Change' : 'Set'}
          </button>
        </div>
        {affirmation ? (
          <p className="text-gray-700 font-bold text-lg italic">"{affirmation}"</p>
        ) : (
          <p className="text-gray-500 italic">Choose your weekly affirmation to inspire yourself!</p>
        )}
      </div>
    );
  };

  // LOGIN PAGE
  if (currentPage === 'login') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 rounded-full blur-2xl opacity-75 animate-pulse"></div>
              {/* Logo container */}
              <div className="relative bg-white rounded-full p-2 shadow-2xl animate-bounce-slow">
                <img 
                  src="https://i.imgur.com/bhXEh9q.png" 
                  alt="Hyojeong Youth Caraga Logo" 
                  className="w-48 h-48 object-cover rounded-full"
                />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Hyojeong Youth Caraga</h1>
          <p className="text-white text-lg font-bold">A Youth Circle of FFWPU</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white relative overflow-hidden">
          {/* FFWPU Logo Watermark Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <img 
              src="https://i.imgur.com/sdbdHPL.png" 
              alt="FFWPU" 
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center relative z-10">Welcome Back!</h2>
          {loading ? (
            <div style={{minHeight:'320px', background:'linear-gradient(135deg,#c084fc 0%,#f9a8d4 50%,#93c5fd 100%)', borderRadius:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 20px', margin:'8px 0'}}>
              <style>{`
                @keyframes hyojiBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes hyojiPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
                @keyframes hyojiBlink { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.1)} }
                @keyframes hyojiDot1 { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.2)} }
                @keyframes hyojiDot2 { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.2)} }
                @keyframes hyojiDot3 { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.2)} }
                @keyframes hyojiSparkle { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} }
                @keyframes hyojiWave { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(20deg)} 75%{transform:rotate(-10deg)} }
                .hyoji-mascot { animation: hyojiBounce 1.2s ease-in-out infinite; }
                .hyoji-body { animation: hyojiPulse 1.2s ease-in-out infinite; }
                .hyoji-eye { animation: hyojiBlink 3s ease-in-out infinite; transform-origin: center; }
                .hyoji-sp1 { animation: hyojiSparkle 2s ease-in-out infinite 0s; }
                .hyoji-sp2 { animation: hyojiSparkle 2s ease-in-out infinite 0.6s; }
                .hyoji-sp3 { animation: hyojiSparkle 2s ease-in-out infinite 1.2s; }
                .hyoji-d1 { animation: hyojiDot1 1.4s ease-in-out infinite 0s; }
                .hyoji-d2 { animation: hyojiDot2 1.4s ease-in-out infinite 0.2s; }
                .hyoji-d3 { animation: hyojiDot3 1.4s ease-in-out infinite 0.4s; }
                .hyoji-wave { animation: hyojiWave 1s ease-in-out infinite; transform-origin: bottom center; display:inline-block; }
              `}</style>

              <div style={{position:'relative', marginBottom:8}}>
                <div style={{background:'white', borderRadius:'20px 20px 20px 4px', padding:'10px 16px', marginBottom:8, boxShadow:'0 2px 12px rgba(0,0,0,0.1)'}}>
                  <p style={{margin:0, fontSize:14, fontWeight:700, color:'#db2777'}}>Hi! I'm Hyoji <span className="hyoji-wave">👋</span></p>
                  <p style={{margin:'2px 0 0', fontSize:12, color:'#9CA3AF'}}>Loading your heart journey...</p>
                </div>

                <div className="hyoji-mascot" style={{position:'relative'}}>
                  <div className="hyoji-sp1" style={{position:'absolute', top:-20, left:-10, fontSize:18}}>✨</div>
                  <div className="hyoji-sp2" style={{position:'absolute', top:-15, right:-8, fontSize:14}}>⭐</div>
                  <div className="hyoji-sp3" style={{position:'absolute', bottom:10, right:-20, fontSize:12}}>💫</div>

                  <svg width="120" height="130" viewBox="0 0 120 130">
                    <defs>
                      <radialGradient id="hbg" cx="50%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#f9a8d4"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </radialGradient>
                      <radialGradient id="hck" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fde68a"/>
                        <stop offset="100%" stopColor="#f59e0b"/>
                      </radialGradient>
                    </defs>
                    <g className="hyoji-body">
                      <path d="M60 100 C20 75 10 50 15 35 C20 20 35 15 48 22 C52 24 56 28 60 32 C64 28 68 24 72 22 C85 15 100 20 105 35 C110 50 100 75 60 100Z" fill="url(#hbg)" stroke="#db2777" strokeWidth="1.5"/>
                      <path d="M60 95 C25 72 16 50 20 37 C24 24 37 20 49 26 C53 28 57 31 60 35 C63 31 67 28 71 26 C83 20 96 24 100 37 C104 50 95 72 60 95Z" fill="#fbcfe8" opacity="0.4"/>
                    </g>
                    <g className="hyoji-eye" style={{transformOrigin:'42px 52px'}}>
                      <ellipse cx="42" cy="52" rx="7" ry="8" fill="white"/>
                      <ellipse cx="43" cy="53" rx="4" ry="4.5" fill="#1F2937"/>
                      <ellipse cx="44.5" cy="51.5" rx="1.5" ry="1.5" fill="white"/>
                    </g>
                    <g className="hyoji-eye" style={{transformOrigin:'78px 52px'}}>
                      <ellipse cx="78" cy="52" rx="7" ry="8" fill="white"/>
                      <ellipse cx="79" cy="53" rx="4" ry="4.5" fill="#1F2937"/>
                      <ellipse cx="80.5" cy="51.5" rx="1.5" ry="1.5" fill="white"/>
                    </g>
                    <ellipse cx="35" cy="64" rx="6" ry="4" fill="url(#hck)" opacity="0.8"/>
                    <ellipse cx="85" cy="64" rx="6" ry="4" fill="url(#hck)" opacity="0.8"/>
                    <path d="M52 70 Q60 78 68 70" stroke="#9d174d" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <ellipse cx="35" cy="88" rx="10" ry="6" fill="#ec4899" opacity="0.6" transform="rotate(-20,35,88)"/>
                    <ellipse cx="85" cy="88" rx="10" ry="6" fill="#ec4899" opacity="0.6" transform="rotate(20,85,88)"/>
                    <path d="M50 105 Q60 115 70 105" stroke="#db2777" strokeWidth="3" fill="none" strokeLinecap="round"/>
                    <ellipse cx="50" cy="108" rx="5" ry="4" fill="#fce7f3"/>
                    <ellipse cx="70" cy="108" rx="5" ry="4" fill="#fce7f3"/>
                  </svg>
                </div>
              </div>

              <p style={{fontSize:13, color:'rgba(255,255,255,0.9)', margin:'8px 0 16px', fontStyle:'italic', textAlign:'center'}}>"Love is giving and forgetting." — True Father</p>
              <div style={{display:'flex', gap:10, alignItems:'center'}}>
                <div className="hyoji-d1" style={{width:12, height:12, borderRadius:'50%', background:'white'}}></div>
                <div className="hyoji-d2" style={{width:12, height:12, borderRadius:'50%', background:'white', opacity:0.8}}></div>
                <div className="hyoji-d3" style={{width:12, height:12, borderRadius:'50%', background:'white', opacity:0.6}}></div>
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              {/* Role selector */}
              <p className="text-sm font-bold text-gray-500 mb-2 text-center">Who's logging in?</p>
              <div className="flex gap-2 mb-5">
                {[
                  { key: 'member', label: 'Member', icon: '🙋' },
                  { key: 'lead', label: 'Team Leader', icon: '⭐' },
                  { key: 'admin', label: 'Admin', icon: '🔑' }
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => { setLoginRole(r.key); setError(''); setAdminPassword(''); setPassword(''); }}
                    className={`flex-1 flex flex-col items-center gap-1 px-2 py-3 rounded-2xl transition-all border-2 ${loginRole === r.key ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg' : 'bg-white text-gray-700 border-gray-200'}`}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    <span className="font-black text-xs leading-tight text-center">{r.label}</span>
                  </button>
                ))}
              </div>

              {loginRole === 'member' && (
                <>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your Student ID (e.g., HJ001)"
                    className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your password"
                    className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4"
                  />
                  {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
                  <button onClick={handleLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                    Login
                  </button>
                </>
              )}

              {loginRole === 'lead' && (
                <>
                  <p className="text-sm text-gray-500 mb-3">Enter your Team Leader PIN to mark your team's attendance.</p>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLeadLogin()}
                    placeholder="Team PIN"
                    className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4"
                  />
                  {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
                  <button onClick={handleLeadLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                    Login as Team Leader
                  </button>
                </>
              )}

              {loginRole === 'admin' && (
                <>
                  <p className="text-sm text-gray-500 mb-3">Enter the admin password.</p>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminOnlyLogin()}
                    placeholder="Admin password"
                    className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4"
                  />
                  {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
                  <button onClick={handleAdminOnlyLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                    Login as Admin
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // LEADERBOARD PAGE
  if (currentPage === 'leaderboard' && studentData) {

    const getXP = (s) => {
      const att = calculateAttendance(s);
      const svc = parseFloat(s['HJ Service Pct']) || 0;
      const quiz = Math.min(100, Math.round(parseFloat(s['HJ Quiz'])||0));
      const grade = Math.round(parseFloat(s['HJ Grade'])||0) || Math.round(parseFloat(s['Percentage'])||0);
      return Math.round((att*5)+(svc*3)+(quiz*2)+(grade*2));
    };

    const getGrade = (s) => {
      // Use the stored HJ Grade (a percentage like 90.45) imported from the program records.
      return Math.round(parseFloat(s['HJ Grade']) || 0);
    };

    if (!allStudents || allStudents.length === 0) return (<div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center"><div style={{background:'white',borderRadius:20,padding:24,textAlign:'center'}}><p style={{fontSize:18,fontWeight:700,color:'#7C3AED'}}>Loading rankings...</p><p style={{color:'#9CA3AF',fontSize:13}}>Please go back and try again</p><button onClick={()=>setCurrentPage('home')} style={{marginTop:12,background:'#7C3AED',color:'white',border:'none',borderRadius:12,padding:'10px 20px',cursor:'pointer',fontWeight:600}}>Go Home</button></div></div>);
    const sorted = [...allStudents]
      .filter(s => s['Student ID'] && s['Student ID'].match(/^HJ\d+$/i))
      .filter(s => (s['Status'] || 'active') === 'active')
      .sort((a, b) => getGrade(b) - getGrade(a));

    const teamSorted = sorted.filter(s => (s['TEAM']||'').toUpperCase() === leaderboardTeam.toUpperCase());
    const displayList = leaderboardTab === 'overall' ? sorted.slice(0, 20) : teamSorted.slice(0, 20);
    const myRank = sorted.findIndex(s => s['Student ID'] === studentData['Student ID']) + 1;
    const myTeamSorted = sorted.filter(s => (s['TEAM']||'').toUpperCase() === (studentData['TEAM']||'').toUpperCase());
    const myTeamRank = myTeamSorted.findIndex(s => s['Student ID'] === studentData['Student ID']) + 1;

    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32'];
    const medals = ['🥇', '🥈', '🥉'];

    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
        <div className="p-4 max-w-lg mx-auto">

          {/* Header */}
          <div style={{background:'white', borderRadius:20, padding:'16px 20px', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <h1 style={{fontSize:22, fontWeight:800, color:'#1F2937', margin:0}}>🌷 Our Heart Garden</h1>
            <p style={{fontSize:13, color:'#9CA3AF', margin:'2px 0 0'}}>Every heart is growing — see where everyone is blooming 💗</p>
          </div>

          {/* My heart card */}
          <div style={{background:'linear-gradient(135deg,#7C3AED,#EC4899)', borderRadius:20, padding:'16px 18px', marginBottom:12, color:'white'}}>
            <p style={{fontSize:12, opacity:0.85, margin:0}}>My heart today</p>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{width:48, height:48, borderRadius:'50%', overflow:'hidden', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                  {studentData['Photo'] ? <img src={studentData['Photo']} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <span style={{fontSize:20, fontWeight:800}}>{(studentData['First Name']||'?')[0]}</span>}
                </div>
                <div>
                  <p style={{fontWeight:700, fontSize:16, margin:0}}>{studentData['First Name']} {studentData['Last Name']}</p>
                  <p style={{fontSize:12, opacity:0.85, margin:0}}>{studentData['TEAM'] || 'No team'}</p>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                {(() => {
                  const g = getGrade(studentData);
                  const lv = heartLevelFor(g);
                  return (<>
                    <p style={{fontSize:30, margin:0, lineHeight:1}}>{lv.icon}</p>
                    <p style={{fontSize:14, fontWeight:800, opacity:0.95, margin:'2px 0 0'}}>{lv.name}</p>
                  </>);
                })()}
              </div>
            </div>
          </div>

          {/* Heart Garden — grouped by heart level, no ranks/percentages */}
          {(() => {
            const levels = [
              { name: 'Filial Heart', icon: '👑', min: 76, color: '#EC4899', bg: '#FCE7F3', blurb: 'Shining with a true filial heart' },
              { name: 'Loving Heart', icon: '💜', min: 51, color: '#8B5CF6', bg: '#F3E8FF', blurb: 'Love is moving through them' },
              { name: 'Faithful Heart', icon: '🙏', min: 26, color: '#10B981', bg: '#D1FAE5', blurb: 'Growing faithful, step by step' },
              { name: 'Seeking Heart', icon: '🕊️', min: 0, color: '#F59E0B', bg: '#FEF3C7', blurb: 'Beginning a beautiful journey' }
            ];
            // Group active students by their heart level.
            const inLevel = (s, lv, idx) => {
              const g = getGrade(s);
              const next = levels[idx - 1];
              return g >= lv.min && (!next || g < next.min);
            };
            // Sort names alphabetically within a group (no score order → no "top/bottom").
            const byName = (a, b) => (`${a['First Name']} ${a['Last Name']}`).localeCompare(`${b['First Name']} ${b['Last Name']}`);
            return (
              <div style={{display:'flex', flexDirection:'column', gap:12}}>
                {levels.map((lv, li) => {
                  const members = sorted.filter(s => inLevel(s, lv, li)).sort(byName);
                  if (members.length === 0) return null;
                  return (
                    <div key={lv.name} style={{background:'white', borderRadius:20, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                      <div style={{background:lv.bg, padding:'12px 16px', display:'flex', alignItems:'center', gap:10}}>
                        <span style={{fontSize:24}}>{lv.icon}</span>
                        <div style={{flex:1}}>
                          <p style={{fontSize:15, fontWeight:800, color:lv.color, margin:0}}>{lv.name}s</p>
                          <p style={{fontSize:11, color:'#6B7280', margin:0}}>{lv.blurb}</p>
                        </div>
                        <span style={{fontSize:13, fontWeight:700, color:lv.color, background:'white', borderRadius:12, padding:'2px 10px'}}>{members.length}</span>
                      </div>
                      <div>
                        {members.map((student, idx) => {
                          const isMe = student['Student ID'] === studentData['Student ID'];
                          return (
                            <div key={student['Student ID']} style={{
                              display:'flex', alignItems:'center', gap:12, padding:'10px 16px',
                              background: isMe ? '#FDF4FF' : 'white',
                              borderBottom: idx < members.length-1 ? '1px solid #F9FAFB' : 'none',
                              borderLeft: isMe ? `4px solid ${lv.color}` : '4px solid transparent'
                            }}>
                              <div style={{width:38, height:38, borderRadius:'50%', overflow:'hidden', flexShrink:0, border:`2px solid ${lv.bg}`}}>
                                {student['Photo'] ? <img src={student['Photo']} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#C4B5FD,#F9A8D4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'white'}}>{(student['First Name']||'?')[0]}</div>}
                              </div>
                              <div style={{flex:1, minWidth:0}}>
                                <p style={{fontWeight: isMe ? 700 : 500, fontSize:14, color: isMe ? lv.color : '#1F2937', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                                  {student['First Name']} {student['Last Name']} {isMe ? '(You)' : ''}
                                </p>
                                <p style={{fontSize:11, color:'#9CA3AF', margin:0}}>{student['TEAM'] || 'No team'}</p>
                              </div>
                              <span style={{fontSize:20, flexShrink:0}}>{lv.icon}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
        <HyojiHelper page="leaderboard" studentData={studentData} earnedBadges={earnedBadges} BADGES={BADGES} growthPercentage={0} />
        <NavBar />
      </div>
    );
  }

    // ADMIN LOGIN
  if (currentPage === 'admin-login') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-75 animate-pulse"></div>
              {/* Logo container */}
              <div className="relative bg-white rounded-full p-2 shadow-2xl">
                <img 
                  src="https://i.imgur.com/bhXEh9q.png" 
                  alt="Hyojeong Youth Caraga Logo" 
                  className="w-32 h-32 object-cover rounded-full"
                />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Admin / Team Lead Access</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
          <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">Enter Password or PIN</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Admins enter the admin password. Team leads enter their PIN.</p>
          <input 
            type="password" 
            value={adminPassword} 
            onChange={(e) => setAdminPassword(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()} 
            placeholder="Admin password or team PIN" 
            className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4" 
          />
          {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
          <button onClick={handleAdminLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg mb-2">
            Login
          </button>
          <button onClick={() => { setCurrentPage('login'); setAdminPassword(''); setError(''); }} className="w-full px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg">
            Back
          </button>
        </div>
      </div>
    </div>
  );

  // HOME PAGE - DUOLINGO STYLE
  if (currentPage === 'home' && studentData) {
    const attendancePct = calculateAttendance(studentData);
    const servicePct = Math.min(100, Math.round(parseFloat(studentData['HJ Service Pct']) || 0));
    const quizPct = Math.min(100, Math.round(studentData['HJ Quiz'] || 0));
    const gratitudePct = Math.min(100, Math.round((myGratitudeEntries.length / gratitudeCount) * 100));
    const shirtMarksDone = myAttendanceMarks.filter(m => m.hj_shirt).length;
    const shirtPct = Math.min(100, Math.round((shirtMarksDone / sessionCount) * 100));
    // Official HJ Grade (same weighted formula as admin) — single source of truth.
    const growthPercentage = Math.round(parseFloat(studentData['HJ Grade']) || 0);
    const xpTotal = Math.round((attendancePct * 5) + (servicePct * 3) + (quizPct * 2) + (gratitudePct * 2) + (earnedBadges.length * 50));
    const streakCount = myGratitudeEntries.length;

    const heartLevels = [
      { name: 'Seeking Heart', icon: '🕊️', min: 0, color: '#F59E0B' },
      { name: 'Faithful Heart', icon: '🙏', min: 26, color: '#10B981' },
      { name: 'Loving Heart', icon: '💜', min: 51, color: '#8B5CF6' },
      { name: 'Filial Heart', icon: '👑', min: 76, color: '#EC4899' },
    ];
    const currentLevel = heartLevels.filter(l => growthPercentage >= l.min).pop();
    const nextLevel = heartLevels.find(l => l.min > growthPercentage);
    const xpToNext = nextLevel ? `${nextLevel.min - growthPercentage}% to ${nextLevel.name}` : 'Max level reached!';

    // Daily heart message from True Parents' teachings.
    // Admin-managed quotes (from Program Setup) are used when available;
    // otherwise these gentle theme-based defaults show until quotes are added.
    const defaultHeartMessages = [
      { text: 'True love is living for the sake of others. The person who lives for others will prosper.', theme: 'True Love' },
      { text: 'Loving God and loving humankind are not two separate things — they are one.', theme: 'One Heart' },
      { text: 'A filial child is one who attends their parents with a loving heart, in all seasons of life.', theme: 'Filial Heart' },
      { text: 'Begin each day with gratitude, and your heart will grow closer to Heaven.', theme: 'Gratitude' },
    ];
    const adminMessages = (programSettings.heart_messages || []).filter(m => m && m.text && m.text.trim());
    const heartMessages = adminMessages.length > 0 ? adminMessages : defaultHeartMessages;
    // Rotate by day of year so it changes daily but is the same for everyone that day.
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const todaysMessage = heartMessages[dayOfYear % heartMessages.length];

    return (
      <div className="min-h-screen pb-20 bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
        <style jsx>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
          .animate-shimmer { animation: shimmer 2s infinite; }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
          @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); } 50% { opacity: 1; transform: scale(1) rotate(180deg); } }
          .animate-sparkle { animation: sparkle 2s ease-in-out infinite; }
          .xp-bar-bg { background: #E5E7EB; border-radius: 99px; height: 10px; overflow: hidden; margin-top: 6px; }
          .xp-bar-fill { height: 100%; border-radius: 99px; transition: width 1.2s ease; }
          .duo-card { background: white; border-radius: 16px; padding: 16px 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
          .pillar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
          .pillar-icon { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        `}</style>

        <div className="p-4 max-w-lg mx-auto">

          <div className="duo-card" style={{marginBottom: 12}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={studentData['Photo']} size="md" />
                <div>
                  <p style={{fontWeight:600, fontSize:17, margin:0, color:'#1F2937'}}>{studentData['First Name']} {studentData['Last Name']}</p>
                  <p style={{fontSize:13, color:'#7C3AED', margin:0, fontWeight:500}}>{studentData['Student ID']} · {studentData['TEAM'] || 'No team'}</p>
                </div>
              </div>
              <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <button onClick={handleLogout} style={{fontSize:12, fontWeight:600, color:'#7C3AED', background:'#F3E8FF', border:'none', padding:'8px 12px', borderRadius:12, cursor:'pointer'}}>Logout</button>
                        </div>
            </div>
          </div>

          {/* Daily heart message from True Parents */}
          <div style={{background:'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 50%, #FEF3C7 100%)', borderRadius:16, padding:'18px 20px', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', position:'relative', overflow:'hidden'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
              <span style={{fontSize:18}}>💝</span>
              <p style={{fontSize:11, fontWeight:700, color:'#BE185D', textTransform:'uppercase', letterSpacing:'0.08em', margin:0}}>A word for your heart today</p>
            </div>
            <p style={{fontSize:15, fontWeight:600, color:'#831843', lineHeight:1.5, margin:'0 0 8px', fontStyle:'italic'}}>"{todaysMessage.text}"</p>
            <p style={{fontSize:12, color:'#9D174D', margin:0, fontWeight:600}}>— True Parents · {todaysMessage.theme}</p>
          </div>

          {myEncouragements.length > 0 && (
            <div style={{background:'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 100%)', borderRadius:16, padding:'16px 18px', marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'2px solid #A5B4FC'}}>
              <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:10}}>
                <span style={{fontSize:18}}>💌</span>
                <p style={{fontSize:11, fontWeight:700, color:'#4338CA', textTransform:'uppercase', letterSpacing:'0.08em', margin:0}}>A note just for you</p>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:8}}>
                {myEncouragements.slice(0, 4).map(e => (
                  <div key={e.id} style={{background:'rgba(255,255,255,0.7)', borderRadius:10, padding:'10px 12px'}}>
                    <p style={{fontSize:14, color:'#1E3A8A', margin:'0 0 4px', lineHeight:1.5}}>{e.message}</p>
                    <p style={{fontSize:11, color:'#6366F1', margin:0, fontWeight:600}}>— {e.from_name || 'Your leader'} 💙</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(() => {
            const myTeam = (studentData['TEAM'] || '').toUpperCase();
            const visible = announcements.filter(a => a.audience === 'all' || (a.audience || '').toUpperCase() === myTeam).slice(0, 5);
            if (visible.length === 0) return null;
            return (
              <div className="duo-card" style={{marginBottom:12}}>
                <p style={{fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 10px'}}>📢 Announcements</p>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {visible.map(a => (
                    <div key={a.id} style={{background:'#F9FAFB', borderRadius:10, padding:'10px 12px'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2}}>
                        <span style={{fontSize:10, fontWeight:700, color:'#7C3AED'}}>{a.audience === 'all' ? '🌍 Everyone' : `👥 ${a.audience}`}</span>
                        <span style={{fontSize:10, color:'#9CA3AF'}}>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                      {a.title && <p style={{fontSize:13, fontWeight:700, color:'#1F2937', margin:'0 0 2px'}}>{a.title}</p>}
                      <p style={{fontSize:12, color:'#4B5563', margin:0, lineHeight:1.4}}>{a.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div className="duo-card" style={{background: currentLevel.color, border:'none', marginBottom:12}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
              <div>
                <p style={{fontSize:13, color:'rgba(255,255,255,0.8)', margin:0}}>Growth Journey</p>
                <p style={{fontSize:38, fontWeight:700, margin:0, color:'white', lineHeight:1.1}}>{growthPercentage}%</p>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{background:'rgba(255,255,255,0.25)', color:'white', padding:'5px 14px', borderRadius:99, fontSize:13, fontWeight:600, marginBottom:4}}>
                  {currentLevel.icon} {currentLevel.name}
                </div>
                <p style={{fontSize:12, color:'rgba(255,255,255,0.75)', margin:0}}>{xpTotal} XP total</p>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,0.25)', borderRadius:99, height:10, overflow:'hidden'}}>
              <div style={{width:`${growthPercentage}%`, height:'100%', background:'white', borderRadius:99, opacity:0.9}}></div>
            </div>
            <p style={{fontSize:11, color:'rgba(255,255,255,0.75)', margin:'6px 0 0'}}>{xpToNext}</p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12}}>
            <div className="duo-card" style={{textAlign:'center', margin:0}}>
              <p style={{fontSize:24, fontWeight:700, color:'#1F2937', margin:0}}>{earnedBadges.length}</p>
              <p style={{fontSize:12, color:'#6B7280', margin:0}}>🏅 Badges earned</p>
            </div>
            <div className="duo-card" style={{textAlign:'center', margin:0}}>
              <p style={{fontSize:24, fontWeight:700, color:'#1F2937', margin:0}}>{attendedSessions(studentData)}</p>
              <p style={{fontSize:12, color:'#6B7280', margin:0}}>📅 Sessions done</p>
            </div>
          </div>

          {(() => {
            const markMap = {};
            myAttendanceMarks.forEach(m => { markMap[m.session_number] = m; });
            const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);

            // Reusable session-box grid for a given mark field.
            const SessionGrid = ({ field, color }) => (
              <div style={{display:'flex', flexWrap:'wrap', gap:5, marginTop:4}}>
                {sessions.map(n => {
                  const on = markMap[n] && markMap[n][field];
                  return (
                    <div key={n} title={dateForSession(n) || `Session ${n}`}
                      style={{width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700, background: on ? color : '#F3F4F6', color: on ? 'white' : '#C7CBD1'}}>
                      {n}
                    </div>
                  );
                })}
              </div>
            );

            // One pillar row: tappable header + inline expanding detail.
            const Pillar = ({ id, icon, iconBg, name, pct, color, caption, last, children }) => {
              const isOpen = expandedPillar === id;
              return (
                <div style={{marginBottom: last ? 0 : 16}}>
                  <div onClick={() => setExpandedPillar(isOpen ? null : id)}
                    style={{display:'flex', alignItems:'center', gap:14, cursor:'pointer'}}>
                    <div className="pillar-icon" style={{background:iconBg}}>{icon}</div>
                    <div style={{flex:1}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                        <span style={{fontSize:14, fontWeight:600, color:'#1F2937'}}>{name} <span style={{fontSize:11, color:'#C7CBD1'}}>{isOpen ? '▲' : '▼'}</span></span>
                        <span style={{fontSize:17, fontWeight:700, color}}>{pct}%</span>
                      </div>
                      <div className="xp-bar-bg"><div className="xp-bar-fill" style={{width:`${pct}%`, background:color}}></div></div>
                      <p style={{fontSize:11, color:'#9CA3AF', margin:'3px 0 0'}}>{caption}</p>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{marginTop:12, marginLeft:0, padding:'12px 14px', background:'#FAFAFB', borderRadius:12}}>
                      {children}
                    </div>
                  )}
                </div>
              );
            };

            return (
            <div className="duo-card">
              <p style={{fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 16px'}}>Your pillars · tap to see details</p>

              <Pillar id="attendance" icon="💜" iconBg="#EDE9FE" name="Faithful Presence" pct={attendancePct} color="#7C3AED"
                caption={`${attendedSessions(studentData)} of ${sessionCount} sessions attended`}>
                <p style={{fontSize:11, fontWeight:600, color:'#6B7280', margin:'0 0 4px'}}>Which sessions you attended</p>
                <SessionGrid field="attendance" color="#7C3AED" />
                <p style={{fontSize:10, color:'#9CA3AF', margin:'8px 0 0'}}>Grey = missed. Tap & hold a box for its date.</p>
              </Pillar>

              <Pillar id="service" icon="💙" iconBg="#D1FAE5" name="Filial Actions" pct={servicePct} color="#059669"
                caption={servicePct === 100 ? 'Service week completed! 🎉' : 'Complete your service week'}>
                <p style={{fontSize:12, color:'#4B5563', margin:0, lineHeight:1.5}}>
                  {servicePct === 100
                    ? 'You completed your HJ Service Week — wonderful! 🎉 Service is love in action.'
                    : `Your service progress is at ${servicePct}%. Completing your HJ Service Week fills this pillar.`}
                </p>
              </Pillar>

              <Pillar id="shirt" icon="🫂" iconBg="#CCFBF1" name="One Heart, One Shirt" pct={shirtPct} color="#0D9488"
                caption={shirtPct === 100 ? 'Wearing the Heart of Hyojeong every time! 🫂' : 'Wear your HJ shirt to every session'}>
                <p style={{fontSize:11, fontWeight:600, color:'#6B7280', margin:'0 0 4px'}}>Sessions you wore your HJ shirt</p>
                <SessionGrid field="hj_shirt" color="#0D9488" />
                <p style={{fontSize:10, color:'#9CA3AF', margin:'8px 0 0'}}>Grey = not worn. Let's aim for all green! 🫂</p>
              </Pillar>

              <Pillar id="quiz" icon="💡" iconBg="#FEF3C7" name="Heart Knowledge" pct={quizPct} color="#D97706"
                caption="Quiz score average">
                <p style={{fontSize:12, color:'#4B5563', margin:0, lineHeight:1.5}}>
                  Your quiz score average is <b>{quizPct}%</b>. This grows as you take the Heavenly Quizzes during sessions. Keep learning! 💡
                </p>
              </Pillar>

              <Pillar id="gratitude" icon="💗" iconBg="#FFE4E6" name="Heart of Gratitude" pct={gratitudePct} color="#E11D48" last
                caption={`${myGratitudeEntries.length} of ${gratitudeCount} entries submitted`}>
                <p style={{fontSize:11, fontWeight:600, color:'#6B7280', margin:'0 0 4px'}}>Sessions you logged gratitude</p>
                <SessionGrid field="gratitude" color="#E11D48" />
                <p style={{fontSize:11, fontWeight:600, color:'#6B7280', margin:'12px 0 6px'}}>My gratitude entries</p>
                {myGratitudeEntries.length === 0 ? (
                  <p style={{fontSize:12, color:'#9CA3AF', fontStyle:'italic', margin:0}}>No entries yet. Write your first one from the Gratitude Journal! 💗</p>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:240, overflowY:'auto'}}>
                    {[...myGratitudeEntries]
                      .sort((a,b) => (parseInt((b.session||'').replace(/\D/g,''))||0) - (parseInt((a.session||'').replace(/\D/g,''))||0))
                      .map((e, i) => (
                      <div key={i} style={{background:'white', borderRadius:10, padding:'8px 10px', boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                        <p style={{fontSize:10, fontWeight:700, color:'#E11D48', margin:'0 0 2px'}}>{e.session || 'Entry'}</p>
                        <p style={{fontSize:12, color:'#374151', margin:0, lineHeight:1.4}}>{e.content || ''}</p>
                        {e.adminRemark && <p style={{fontSize:11, color:'#7C3AED', margin:'4px 0 0', fontStyle:'italic'}}>💬 {e.adminRemark}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </Pillar>
            </div>
            );
          })()}


          <div className="duo-card">
            <p style={{fontSize:11, fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 14px'}}>Heart level journey</p>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:6}}>
              {heartLevels.map((level, idx) => {
                const isActive = currentLevel.name === level.name;
                const isPassed = growthPercentage >= level.min;
                return (
                  <React.Fragment key={level.name}>
                    <div style={{textAlign:'center', flex:1}}>
                      <div style={{width:44, height:44, borderRadius:'50%', background: isPassed ? level.color : '#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, margin:'0 auto 4px', border: isActive ? `3px solid ${level.color}` : 'none', opacity: isPassed ? 1 : 0.4}}>
                        {level.icon}
                      </div>
                      <p style={{fontSize:10, fontWeight: isActive ? 700 : 400, color: isActive ? level.color : '#9CA3AF', margin:0, lineHeight:1.2}}>{level.name.split(' ')[0]}<br/>{level.name.split(' ')[1]}</p>
                    </div>
                    {idx < heartLevels.length - 1 && (
                      <div style={{flex:1, height:4, background: growthPercentage >= heartLevels[idx+1].min ? level.color : '#F3F4F6', borderRadius:99}}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            <button onClick={() => setCurrentPage('badges')} style={{background:'#F59E0B', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15}}>
              <span>🏅 My Hyojeong Heart Badges ({earnedBadges.length}/{BADGES.length})</span>
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setCurrentPage('gratitude')} style={{background:'#EC4899', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15}}>
              <span>💗 Gratitude Journal</span>
              <ChevronRight size={20} />
            </button>
            <button onClick={() => setCurrentPage('profile')} style={{background:'#3B82F6', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15}}>
              <span>👤 My HJ Profile</span>
              <ChevronRight size={20} />
            </button>
            <button onClick={() => printStudentReport(studentData, myAttendanceMarks, myGratitudeEntries)} style={{background:'#10B981', color:'white', border:'none', borderRadius:14, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontWeight:600, fontSize:15}}>
              <span>🖨️ Download / Print My Report</span>
              <ChevronRight size={20} />
            </button>
          </div>

        </div>
  
      <HyojiHelper page="home" studentData={studentData} earnedBadges={earnedBadges} BADGES={BADGES} growthPercentage={Math.round((calculateAttendance(studentData) + (()=>{ const v = studentData['HJ Service']||0; return v<=1?Math.round(v*100):Math.round(v); })() + Math.min(100,Math.round(studentData['HJ Quiz']||0)) + Math.min(100,Math.round((myGratitudeEntries.length/gratitudeCount)*100)))/4)} />




      <NavBar />
      </div>
    );
  }

    // BADGES PAGE - DUOLINGO ADVENTURE PATH
  if (currentPage === 'badges' && studentData) {
    const totalEarned = BADGES.filter(b => checkIfBadgeEarned(b)).length;
    const nextBadge = BADGES.find(b => !checkIfBadgeEarned(b));

    const getBadgeProgress = (badge) => {
      if (badge.type === 'attendance') return Math.min(100, Math.round((calculateAttendance() / badge.percent) * 100));
      if (badge.type === 'service') { const s = studentData['HJ Service'] || 0; const sv = s <= 1 ? Math.round(s*100) : Math.round(s); return Math.min(100, Math.round((sv / badge.percent) * 100)); }
      if (badge.type === 'quiz') return Math.min(100, Math.round(((studentData['HJ Quiz'] || 0) / badge.percent) * 100));
      if (badge.type === 'grade') return Math.min(100, Math.round(((studentData['HJ Grade'] || 0) / badge.percent) * 100));
      if (badge.type === 'gratitude') return Math.min(100, Math.round((myGratitudeEntries.length / badge.count) * 100));
      if (badge.type === 'goals') { const g = [goals.goal1, goals.goal2, goals.goal3].filter(g => g && g.trim()).length; return Math.min(100, Math.round((g / badge.goalsSet) * 100)); }
      return 0;
    };

    const badgeXP = { attendance: 100, service: 150, quiz: 120, grade: 200, gratitude: 80, goals: 100 };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <style jsx>{`
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); } 50% { box-shadow: 0 0 0 12px rgba(255,255,255,0); } }
          .pulse-glow { animation: pulse-glow 2s infinite; }
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          .bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
          @keyframes sparkle { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: 1; transform: scale(1); } }
          .sparkle { animation: sparkle 1.5s ease-in-out infinite; }
        `}</style>

        <div className="p-4 max-w-lg mx-auto">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setCurrentPage('home')} className="text-white text-2xl font-bold">←</button>
            <h1 className="text-2xl font-black text-white">💖 My HJ Hearts</h1>
          </div>

          {/* Progress summary card */}
          <div style={{background:'white', borderRadius:20, padding:'16px 20px', marginBottom:16, boxShadow:'0 4px 16px rgba(0,0,0,0.1)'}}>
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10}}>
              <div>
                <p style={{fontSize:13, color:'#9CA3AF', margin:0}}>Hearts collected</p>
                <p style={{fontSize:28, fontWeight:800, color:'#7C3AED', margin:0}}>{totalEarned}<span style={{fontSize:16, color:'#9CA3AF'}}>/{BADGES.length}</span></p>
              </div>
              <div style={{fontSize:40}} className="bounce-slow">
                {totalEarned === BADGES.length ? '🏆' : totalEarned >= 7 ? '💜' : totalEarned >= 4 ? '💛' : '🌱'}
              </div>
            </div>
            <div style={{background:'#F3F4F6', borderRadius:99, height:12, overflow:'hidden'}}>
              <div style={{width:`${(totalEarned/BADGES.length)*100}%`, height:'100%', background:'linear-gradient(90deg, #7C3AED, #EC4899)', borderRadius:99, transition:'width 1s ease'}}></div>
            </div>
            <p style={{fontSize:12, color:'#9CA3AF', margin:'6px 0 0'}}>{BADGES.length - totalEarned} hearts remaining to unlock</p>
          </div>

          {/* Next badge to earn */}
          {nextBadge && (
            <div style={{background:'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderRadius:20, padding:'14px 18px', marginBottom:16, border:'2px dashed #F59E0B', boxShadow:'0 4px 16px rgba(245,158,11,0.2)'}}>
              <p style={{fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 8px'}}>⚡ Next to unlock</p>
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div style={{fontSize:36}} className="pulse-glow">{nextBadge.icon}</div>
                <div style={{flex:1}}>
                  <p style={{fontWeight:700, fontSize:15, color:'#92400E', margin:0}}>{nextBadge.name}</p>
                  <p style={{fontSize:12, color:'#B45309', margin:'2px 0 6px'}}>{nextBadge.desc}</p>
                  <div style={{background:'rgba(0,0,0,0.1)', borderRadius:99, height:8, overflow:'hidden'}}>
                    <div style={{width:`${getBadgeProgress(nextBadge)}%`, height:'100%', background:'#F59E0B', borderRadius:99}}></div>
                  </div>
                  <p style={{fontSize:11, color:'#B45309', margin:'3px 0 0'}}>{getBadgeProgress(nextBadge)}% complete · +{badgeXP[nextBadge.type] || 100} XP</p>
                </div>
              </div>
            </div>
          )}

          {/* Adventure path */}
          <div style={{position:'relative'}}>
            {/* Vertical path line */}
            <div style={{position:'absolute', left:'50%', top:0, bottom:0, width:4, background:'rgba(255,255,255,0.3)', borderRadius:99, transform:'translateX(-50%)', zIndex:0}}></div>

            {BADGES.map((badge, idx) => {
              const earned = checkIfBadgeEarned(badge);
              const isNext = nextBadge && nextBadge.id === badge.id;
              const progress = getBadgeProgress(badge);
              const isLeft = idx % 2 === 0;

              return (
                <div key={badge.id} style={{display:'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end', marginBottom:16, position:'relative', zIndex:1}}>
                  <div style={{
                    width:'45%',
                    background: earned ? 'white' : isNext ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    borderRadius:20,
                    padding:'14px 16px',
                    boxShadow: earned ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.08)',
                    border: earned ? '3px solid white' : isNext ? '2px dashed #F59E0B' : '2px solid rgba(255,255,255,0.3)',
                    position:'relative',
                    opacity: earned || isNext ? 1 : 0.7
                  }} className={isNext ? 'pulse-glow' : ''}>
                    
                    {/* Badge icon */}
                    <div style={{textAlign:'center', marginBottom:8}}>
                      <div style={{
                        fontSize:44,
                        filter: earned ? 'none' : 'grayscale(60%)',
                        display:'inline-block'
                      }} className={earned ? 'bounce-slow' : ''}>
                        {earned ? badge.icon : '🔒'}
                      </div>
                      {earned && (
                        <div style={{position:'absolute', top:-8, right:-8, background:'#10B981', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, boxShadow:'0 2px 8px rgba(0,0,0,0.2)'}}>✓</div>
                      )}
                    </div>

                    {/* Badge info */}
                    <p style={{fontSize:12, fontWeight:700, color: earned ? '#1F2937' : '#6B7280', margin:'0 0 2px', textAlign:'center'}}>{badge.name}</p>
                    <p style={{fontSize:10, color: earned ? '#6B7280' : '#9CA3AF', margin:'0 0 6px', textAlign:'center'}}>{badge.desc}</p>

                    {/* Progress bar for unearned */}
                    {!earned && (
                      <div style={{background:'#F3F4F6', borderRadius:99, height:6, overflow:'hidden', marginBottom:4}}>
                        <div style={{width:`${progress}%`, height:'100%', background: isNext ? '#F59E0B' : '#C4B5FD', borderRadius:99}}></div>
                      </div>
                    )}

                    {/* XP reward */}
                    <div style={{textAlign:'center'}}>
                      {earned ? (
                        <span style={{background:'#DCFCE7', color:'#166534', fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:99}}>+{badgeXP[badge.type] || 100} XP ✓</span>
                      ) : (
                        <span style={{background:'#F3F4F6', color:'#9CA3AF', fontSize:11, padding:'2px 10px', borderRadius:99}}>+{badgeXP[badge.type] || 100} XP</span>
                      )}
                    </div>
                  </div>

                  {/* Path dot connector */}
                  <div style={{
                    position:'absolute',
                    left:'50%',
                    top:'50%',
                    transform:'translate(-50%, -50%)',
                    width: earned ? 20 : 14,
                    height: earned ? 20 : 14,
                    borderRadius:'50%',
                    background: earned ? '#10B981' : isNext ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                    border:'3px solid white',
                    boxShadow:'0 2px 8px rgba(0,0,0,0.2)',
                    zIndex:2
                  }}></div>
                </div>
              );
            })}
          </div>

          {/* All earned celebration */}
          {totalEarned === BADGES.length && (
            <div style={{background:'white', borderRadius:20, padding:20, textAlign:'center', marginTop:8}}>
              <div style={{fontSize:48}} className="bounce-slow">🏆</div>
              <p style={{fontSize:20, fontWeight:800, color:'#7C3AED', margin:'8px 0 4px'}}>Heart Champion!</p>
              <p style={{fontSize:13, color:'#9CA3AF'}}>You've unlocked all 10 hearts! 🎉</p>
            </div>
          )}

        </div>
        <HyojiHelper page="badges" studentData={studentData} earnedBadges={earnedBadges} BADGES={BADGES} growthPercentage={0} />
        <NavBar />
      </div>
    );
  }

    // GRATITUDE PAGE
  if (currentPage === 'gratitude' && studentData) {
    // Get age-appropriate prompt based on session number
    const currentSessionNum = selectedSession ? parseInt(selectedSession.replace('Session ', '')) : 1;
    const weeklyPrompt = getWeeklyGratitudePrompt(studentData['Age'] || 15, currentSessionNum);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4">💖 Gratitude Journal</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-black text-gray-800">Write Your Reflection</h2>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Session</label>
              <select 
                value={selectedSession} 
                onChange={(e) => {
                  const session = e.target.value;
                  setSelectedSession(session);
                  // Auto-fill with existing content if updating
                  const existingEntry = myGratitudeEntries.find(entry => entry.session === session);
                  if (existingEntry) {
                    setGratitudeText(existingEntry.content);
                  } else {
                    setGratitudeText('');
                  }
                }} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300"
              >
                <option value="">Choose session...</option>
                {[...Array(20)].map((_, i) => {
                  const sessionName = `Session ${i + 1}`;
                  const hasEntry = myGratitudeEntries.some(entry => entry.session === sessionName);
                  return (
                    <option key={i} value={sessionName}>
                      {sessionName}{hasEntry ? ' ✓ (Already submitted)' : ''}
                    </option>
                  );
                })}
              </select>
              {selectedSession && myGratitudeEntries.some(entry => entry.session === selectedSession) && (
                <p className="text-xs text-orange-600 font-bold mt-2">
                  ⚠️ You already have an entry for this session. Submitting will UPDATE your previous entry.
                </p>
              )}
            </div>
            
            {/* Show prompt as the label */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                📝 {weeklyPrompt.en}
              </label>
              <label className="block text-xs text-gray-600 italic mb-3">
                {weeklyPrompt.tl}
              </label>
              <textarea 
                value={gratitudeText} 
                onChange={(e) => setGratitudeText(e.target.value)} 
                placeholder="Write your reflection here..." 
                className="w-full h-40 px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300" 
                disabled={loading}
              />
            </div>
            {error && <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
            <button 
              onClick={handleGratitudeSubmit} 
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : '✨ Submit Reflection'}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-gray-800">📚 My Previous Entries</h2>
              <button 
                onClick={() => loadMyGratitudeEntries(studentData['Student ID'])}
                className="text-purple-600"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            {myGratitudeEntries.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold">No entries yet</p>
                <p className="text-sm text-gray-400">Start writing your gratitude journal!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myGratitudeEntries.map((entry, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-purple-600">{entry.session}</p>
                      <p className="text-xs text-gray-500">{entry.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{entry.content}</p>
                    {entry.adminRemark && (
                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                        <p className="text-xs font-bold text-blue-600 mb-1">💬 Admin's Remark:</p>
                        <p className="text-sm text-gray-700">{entry.adminRemark}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <HyojiHelper page="gratitude" studentData={studentData} earnedBadges={earnedBadges} BADGES={BADGES} growthPercentage={0} />
        <NavBar />
      </div>
    );
  }

  // GRADES PAGE
  if (currentPage === 'grades' && studentData) {
    // Calculate growth percentage for this page
    const growthPercentage = Math.round((
      calculateAttendance(studentData) + 
      Math.min(100, Math.round(parseFloat(studentData['HJ Quiz']) || 0)) + 
      (parseFloat(studentData['HJ Service Pct']) || 0) + 
      Math.min(100, Math.round((myGratitudeEntries.length / gratitudeCount) * 100))
    ) / 4);
    
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <h1 className="text-3xl font-black text-white mb-4">🌸 My Growth Journey</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-bold mb-2">Growth Journey</p>
            <div className="text-6xl font-black text-purple-600 mb-2">
              {Math.round((
  calculateAttendance(studentData) + 
  Math.min(100, Math.round(parseFloat(studentData['HJ Quiz']) || 0)) + 
  (parseFloat(studentData['HJ Service Pct']) || 0) + 
  Math.min(100, Math.round((myGratitudeEntries.length / gratitudeCount) * 100))
) / 4)}%
            </div>
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full">
              <p className="text-sm font-bold text-purple-600">
                {growthPercentage >= 90 ? '🌟 Shining Brightly!' : 
                 growthPercentage >= 80 ? '🌸 Beautifully Growing!' : 
                 growthPercentage >= 70 ? '🌱 Growing Well!' : 
                 '💚 Keep Nurturing!'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">💜 Faithful Presence</p>
                <p className="text-3xl font-black text-blue-600">{calculateAttendance()}%</p>
                <p className="text-xs text-gray-500 mt-1">Sessions attended</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">💡 Heart Knowledge</p>
                <p className="text-3xl font-black text-purple-600">{Math.round(studentData['HJ Quiz'] || 0)}%</p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">💙 Filial Actions</p>
                <p className="text-3xl font-black text-green-600">{Math.round(parseFloat(studentData['HJ Service Pct']) || 0)}%</p>
                <p className="text-xs text-gray-500 mt-1">Act of Service Completed</p>
              </div>
              <Award className="w-12 h-12 text-green-600" />
            </div>
          </div>

         <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-orange-200">
  <div className="flex items-center justify-between">
  <div>
    <p className="text-sm text-gray-600 font-bold mb-1">💖 Heart of Gratitude</p>
    <p className="text-3xl font-black text-pink-600">{Math.min(100, Math.round((myGratitudeEntries.length / gratitudeCount) * 100))}%</p>
    <p className="text-xs text-gray-500 mt-1">Gratitude entries submitted</p>
  </div>
  <Heart className="w-12 h-12 text-pink-600" />
</div>
</div>
        </div>
      </div>
      <HyojiHelper page="grades" studentData={studentData} earnedBadges={earnedBadges} BADGES={BADGES} growthPercentage={0} />
      <NavBar />
    </div>
  );
  }

  // PROFILE PAGE
  if (currentPage === 'profile' && studentData) {
    const _g = Math.round(parseFloat(studentData['HJ Grade']) || 0);
    const _lv = heartLevelFor(_g);
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4 max-w-lg mx-auto">
          <h1 className="text-3xl font-black text-white mb-4 drop-shadow-lg">✨ My HJ Profile ✨</h1>
          
          {/* Main Profile Card */}
          <div className="rounded-3xl overflow-hidden mb-4" style={{boxShadow:'0 12px 40px rgba(124,58,237,0.18)'}}>
            {/* Colored header band tied to heart level */}
            <div className="relative px-6 pt-5 pb-20" style={{background:`linear-gradient(135deg, ${_lv.color}, ${_lv.color}AA)`}}>
              <div className="flex justify-end">
              {!editingProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="bg-white/25 backdrop-blur text-white px-5 py-2 rounded-full font-bold shadow-sm text-sm border border-white/30"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="bg-white/25 text-white px-4 py-2 rounded-full font-bold border border-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-white text-gray-800 px-6 py-2 rounded-full font-bold disabled:opacity-50 shadow-sm"
                  >
                    {loading ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* White content area */}
            <div className="bg-white px-6 pb-6 relative">
              {/* Photo overlapping the band */}
              <div className="flex justify-center" style={{marginTop:-64, marginBottom:12}}>
                <div className="rounded-3xl p-1.5 bg-white shadow-lg">
                  <Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={editingProfile ? tempProfile.photoUrl : studentData['Photo']} size="lg" />
                </div>
              </div>

            {/* Hero stats — grade, heart level, badges */}
            {!editingProfile && (() => {
              const g = Math.round(parseFloat(studentData['HJ Grade']) || 0);
              const lv = heartLevelFor(g);
              return (
                <div className="mb-5">
                  <p className="text-center text-2xl font-black text-gray-800 mb-1">{studentData['First Name']} {studentData['Last Name']}</p>
                  <p className="text-center text-sm font-bold text-purple-500 mb-2">{studentData['Student ID']} · {studentData['TEAM'] || studentData['Category'] || ''}</p>
                  {studentData['Motto'] && (
                    <p className="text-center text-sm italic text-gray-500 mb-4">"{studentData['Motto']}"</p>
                  )}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-2xl p-3 text-center border-2" style={{background:'#F3EEFE', borderColor:'#C4B5FD'}}>
                      <p className="text-2xl font-black" style={{color:'#7C3AED'}}>{g}%</p>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Grade</p>
                    </div>
                    <div className="rounded-2xl p-3 text-center border-2" style={{background:`${lv.color}1F`, borderColor:`${lv.color}66`}}>
                      <p className="text-2xl">{lv.icon}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{color:lv.color}}>{lv.name.replace(' Heart','')}</p>
                    </div>
                    <div className="rounded-2xl p-3 text-center border-2" style={{background:'#FCE9F1', borderColor:'#F9A8D4'}}>
                      <p className="text-2xl font-black" style={{color:'#DB2777'}}>{earnedBadges.length}<span className="text-sm text-gray-400">/{BADGES.length}</span></p>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Hearts</p>
                    </div>
                  </div>
                  {/* Encouragement tied to heart level */}
                  <div className="rounded-2xl p-4 text-center border-2" style={{background:`${lv.color}12`, borderColor:`${lv.color}55`}}>
                    <p className="text-sm font-bold leading-relaxed" style={{color:'#4B5563'}}>{lv.cheer}</p>
                  </div>
                </div>
              );
            })()}

            {/* Heart Champion Badge - Shows when all 10 badges unlocked */}
            {earnedBadges.length === BADGES.length && (
              <div className="mb-6 animate-bounce-slow">
                <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 rounded-3xl p-6 border-4 border-yellow-400 shadow-xl relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-20 animate-pulse"></div>
                  
                  <div className="relative text-center">
                    <div className="text-6xl mb-3 animate-bounce-slow">🏆</div>
                    <h3 className="text-3xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                      💖 HYOJEONG HEART CHAMPION 💖
                    </h3>
                    <p className="text-sm font-bold text-gray-700 mb-1">All 10 HJ Hearts Unlocked!</p>
                    <p className="text-xs text-gray-600 italic">Na-unlock mo na ang lahat ng 10 Puso!</p>
                    
                    {/* All hearts display */}
                    <div className="flex justify-center gap-1 mt-3 flex-wrap">
                      {BADGES.map(badge => (
                        <span key={badge.id} className="text-2xl">{badge.icon}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editingProfile ? (
              /* Editing Mode */
              <div className="space-y-3">
                <div className="rounded-2xl p-3 text-center border-2" style={{background:'#F3EEFE', borderColor:'#C4B5FD'}}>
                  <p className="text-base font-black text-gray-700">{studentData['First Name']} {studentData['Last Name']}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{studentData['Student ID']} · name & ID can't be changed</p>
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1 block">📅 Birthday</label>
                  <input
                    type="date"
                    value={tempProfile.dateOfBirth}
                    onChange={(e) => setTempProfile(p => ({...p, dateOfBirth: e.target.value}))}
                    className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1 block">📍 Address</label>
                  <textarea
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile(p => ({...p, address: e.target.value}))}
                    placeholder="Enter your address"
                    rows="2"
                    className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1 block">📱 Contact Number</label>
                  <input
                    type="text"
                    value={tempProfile.contactNumber}
                    onChange={(e) => setTempProfile(p => ({...p, contactNumber: e.target.value}))}
                    placeholder="e.g., 09XX XXX XXXX"
                    className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1 block">👤 Facebook Account</label>
                  <input
                    type="text"
                    value={tempProfile.fbAccount}
                    onChange={(e) => setTempProfile(p => ({...p, fbAccount: e.target.value}))}
                    placeholder="Your Facebook name or link"
                    className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1 block">📸 Photo URL</label>
                  <input
                    type="text"
                    value={tempProfile.photoUrl}
                    onChange={(e) => setTempProfile(p => ({...p, photoUrl: e.target.value}))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Google Drive or Imgur link</p>
                </div>

                {/* My Motto picker */}
                <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-300">
                  <label className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-2 block">💗 My Motto</label>
                  <div className="flex flex-wrap gap-2">
                    {MOTTO_OPTIONS.map(m => (
                      <button key={m} type="button" onClick={() => setTempProfile(p => ({...p, motto: p.motto === m ? '' : m}))}
                        className={`px-3 py-2 rounded-full text-xs font-bold ${tempProfile.motto === m ? 'bg-purple-500 text-white' : 'bg-white text-purple-600 border border-purple-200'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-2">Tap one above, or write your own below:</p>
                  <input
                    type="text"
                    maxLength={60}
                    value={MOTTO_OPTIONS.includes(tempProfile.motto) ? '' : (tempProfile.motto || '')}
                    onChange={(e) => setTempProfile(p => ({...p, motto: e.target.value}))}
                    placeholder="Write your own motto..."
                    className="w-full px-4 py-3 bg-white border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Keep it kind and positive 💜 (up to 60 characters)</p>
                </div>

                {/* Change password */}
                <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-300">
                  <label className="text-xs text-rose-600 font-bold uppercase tracking-wide mb-2 block">🔑 Change My Password</label>
                  <p className="text-xs text-gray-500 mb-2">Leave blank to keep your current password.</p>
                  <input
                    type="text"
                    value={tempProfile.currentPassword}
                    onChange={(e) => setTempProfile(p => ({...p, currentPassword: e.target.value}))}
                    placeholder="Current password"
                    className="w-full px-4 py-3 border-2 border-rose-300 rounded-xl mb-2 focus:outline-none focus:ring-4 focus:ring-rose-200"
                  />
                  <input
                    type="text"
                    value={tempProfile.newPassword}
                    onChange={(e) => setTempProfile(p => ({...p, newPassword: e.target.value}))}
                    placeholder="New password (at least 4 characters)"
                    className="w-full px-4 py-3 border-2 border-rose-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-200"
                  />
                  <p className="text-xs text-gray-500 mt-2">Remember your new password! If you forget it, ask your team leader.</p>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-2">
              {studentData['Age'] && (
                <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
                  <span className="text-xl">🎂</span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Age</p>
                    <p className="text-base font-bold text-gray-800">{studentData['Age']} years</p>
                  </div>
                </div>
              )}

              {studentData['Date of Birth'] && (
                <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
                  <span className="text-xl">📅</span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Birthday</p>
                    <p className="text-base font-bold text-gray-800">{new Date(studentData['Date of Birth']).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              )}

              {studentData['Address'] && (
                <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Address</p>
                    <p className="text-base font-bold text-gray-800">{studentData['Address']}</p>
                  </div>
                </div>
              )}

              {studentData['Contact'] && (
                <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
                  <span className="text-xl">📱</span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Contact Number</p>
                    <p className="text-base font-bold text-gray-800">{studentData['Contact']}</p>
                  </div>
                </div>
              )}

              {studentData['FB'] && (
                <div className="flex items-center gap-3 bg-purple-50 rounded-2xl p-3 border-2 border-purple-200">
                  <span className="text-xl">👤</span>
                  <div>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wide">Facebook Account</p>
                    <p className="text-base font-bold text-gray-800">{studentData['FB']}</p>
                  </div>
                </div>
              )}

              {!studentData['Age'] && !studentData['Date of Birth'] && !studentData['Address'] && !studentData['Contact'] && !studentData['FB'] && (
                <p className="text-center text-gray-400 text-sm py-2">Tap "Edit Profile" to add your details 💗</p>
              )}
            </div>
            )}
            </div>
          </div>

          <WeeklyAffirmation />

          {/* Growth Goals Section */}
          <div className="rounded-3xl p-6 mb-4" style={{background:'linear-gradient(135deg,#FFFFFF,#F5F0FF)', boxShadow:'0 8px 30px rgba(124,58,237,0.12)'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-black text-gray-800">Growth Goals</h2>
              </div>
              {!editingGoals && (
                <button 
                  onClick={() => {
                    setTempGoals({ goal1: goals.goal1, goal2: goals.goal2, goal3: goals.goal3 });
                    setEditingGoals(true);
                  }}
                  className="text-sm font-bold text-purple-600"
                >
                  Edit
                </button>
              )}
            </div>

            {editingGoals ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Goal 1</label>
                  <input 
                    type="text"
                    value={tempGoals.goal1}
                    onChange={(e) => setTempGoals(g => ({...g, goal1: e.target.value}))}
                    placeholder="e.g., Read 5 books this month"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Goal 2</label>
                  <input 
                    type="text"
                    value={tempGoals.goal2}
                    onChange={(e) => setTempGoals(g => ({...g, goal2: e.target.value}))}
                    placeholder="e.g., Practice gratitude daily"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-1 block">Goal 3</label>
                  <input 
                    type="text"
                    value={tempGoals.goal3}
                    onChange={(e) => setTempGoals(g => ({...g, goal3: e.target.value}))}
                    placeholder="e.g., Volunteer 10 hours"
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveGoals}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3 font-bold"
                  >
                    Save Goals (+5 points)
                  </button>
                  <button 
                    onClick={() => setEditingGoals(false)}
                    className="px-6 bg-gray-200 text-gray-700 rounded-xl py-3 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map(num => {
                  const goal = goals[`goal${num}`];
                  const status = goals[`goal${num}Status`];
                  return (
                    <div 
                      key={num}
                      className={`rounded-xl p-4 border-2 ${
                        status === 'Completed' ? 'bg-green-50 border-green-300' :
                        status === 'In Progress' ? 'bg-purple-50 border-purple-300' :
                        'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">Goal {num}</p>
                          {goal ? (
                            <>
                              <p className="text-sm font-bold text-gray-800 mb-2">{goal}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                  status === 'Completed' ? 'bg-green-200 text-green-700' :
                                  status === 'In Progress' ? 'bg-purple-200 text-purple-700' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                  {status}
                                </span>
                                {status === 'Completed' && <span className="text-xl">🎉</span>}
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No goal set yet</p>
                          )}
                        </div>
                        {goal && status === 'In Progress' && (
                          <button 
                            onClick={() => handleCompleteGoal(num)}
                            className="ml-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-lg hover:bg-green-600"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Quiet Heart — private reflections */}
          <div className="rounded-3xl p-6 mb-4" style={{background:'linear-gradient(135deg,#FFFFFF,#Fef6f9)', boxShadow:'0 8px 30px rgba(219,39,119,0.10)'}}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🕊️</span>
              <h2 className="text-xl font-black text-gray-800">My Quiet Heart</h2>
            </div>
            <p className="text-xs text-gray-500 mb-3">A space to write whatever is on your heart — a prayer, a worry, a thank-you. Your leaders care about you and may read these to support you. 💗</p>
            <textarea value={reflectionText} onChange={e => setReflectionText(e.target.value)} rows="3" maxLength={1000}
              placeholder="Dear God, today I feel..."
              className="w-full px-4 py-3 bg-white border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 resize-none mb-2" />
            <button onClick={saveReflection} disabled={savingReflection || !reflectionText.trim()}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold disabled:opacity-50">
              {savingReflection ? 'Saving…' : '💗 Save to my heart'}
            </button>
            {myReflections.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">My past reflections</p>
                {myReflections.slice(0, 10).map(r => (
                  <div key={r.id} className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                    <p className="text-xs text-pink-400 font-bold mb-1">{new Date(r.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // ADMIN DASHBOARD
  if (currentPage === 'admin-dashboard' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://i.imgur.com/bhXEh9q.png" 
              alt="Hyojeong Youth Caraga Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="text-white font-bold bg-white/20 px-4 py-2 rounded-xl">Logout</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-purple-200">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600 font-bold">Active Students</p>
            <p className="text-3xl font-black text-purple-600">{allStudents.filter(s => (s['Status'] || 'active') === 'active').length}<span className="text-base text-gray-400 font-bold"> / {allStudents.length}</span></p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-pink-200">
            <MessageSquare className="w-8 h-8 text-pink-600 mb-2" />
            <p className="text-sm text-gray-600 font-bold">Gratitude Entries</p>
            <p className="text-3xl font-black text-pink-600">{allGratitudeEntries.length}</p>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={() => setShowAddStudentForm(true)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6" />
              <span className="font-bold">Add New Student</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { loadAllMarks(); setCurrentPage('admin-students'); }} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" />
              <span className="font-bold">View All Students</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentPage('admin-leaderboard')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              <span className="font-bold">View Leaderboards</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { setSetupForm(null); setCurrentPage('admin-setup'); }} className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6" />
              <span className="font-bold">Program Setup</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { loadAnnouncements(); setCurrentPage('admin-announce'); }} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6" />
              <span className="font-bold">Announcements</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => setCurrentPage('admin-gratitude')} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6" />
              <span className="font-bold">View Heart Journals</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { loadArchives(); setViewingArchive(null); setCurrentPage('admin-archives'); }} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6" />
              <span className="font-bold">📜 Past Programs</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { setNewProgramForm({ archiveName: programSettings.program_name || 'Program', newName: '', startDate: '', endDate: '', sessions: 21, gratitudeSessions: 21, quizzes: 0, services: 0, confirm: '' }); setCurrentPage('admin-new-program'); }} className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <span className="font-bold">▶️ Start New Program</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={handleRecomputeAll} disabled={recomputing} className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className={`w-6 h-6 ${recomputing ? 'animate-spin' : ''}`} />
              <span className="font-bold">{recomputing ? 'Recomputing…' : 'Recompute All Grades'}</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Add New Student Modal */}
      {showAddStudentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowAddStudentForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-800">Add New Student</h2>
              <button onClick={() => setShowAddStudentForm(false)} className="text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name *</label>
                <input 
                  type="text"
                  value={newStudent.firstName}
                  onChange={(e) => setNewStudent(s => ({...s, firstName: e.target.value}))}
                  placeholder="e.g., John"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name *</label>
                <input 
                  type="text"
                  value={newStudent.lastName}
                  onChange={(e) => setNewStudent(s => ({...s, lastName: e.target.value}))}
                  placeholder="e.g., Smith"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth *</label>
                <input 
                  type="date"
                  value={newStudent.dateOfBirth}
                  onChange={(e) => handleDateOfBirthChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
                <p className="text-xs text-gray-500 mt-1">Age and category will be calculated automatically</p>
              </div>

              {newStudent.dateOfBirth && (
                <>
                  <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-green-600 font-bold uppercase">🎂 Age (Auto)</p>
                        <p className="text-2xl font-black text-gray-800">{newStudent.age} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-green-600 font-bold uppercase">⭐ Category (Auto)</p>
                        <p className="text-2xl font-black text-gray-800">{newStudent.category}</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      {newStudent.category === 'Kids' ? '🧒 Under 13 years old' : '👦 13 years or older'}
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                <textarea 
                  value={newStudent.address}
                  onChange={(e) => setNewStudent(s => ({...s, address: e.target.value}))}
                  placeholder="e.g., 123 Main Street, Butuan City"
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Contact Number</label>
                <input 
                  type="text"
                  value={newStudent.contactNumber}
                  onChange={(e) => setNewStudent(s => ({...s, contactNumber: e.target.value}))}
                  placeholder="e.g., 09XX XXX XXXX"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Facebook Account</label>
                <input 
                  type="text"
                  value={newStudent.fbAccount}
                  onChange={(e) => setNewStudent(s => ({...s, fbAccount: e.target.value}))}
                  placeholder="Facebook name or profile link"
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Photo URL (optional)</label>
                <input 
                  type="text"
                  value={newStudent.photoUrl}
                  onChange={(e) => setNewStudent(s => ({...s, photoUrl: e.target.value}))}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
                <p className="text-xs text-gray-500 mt-1">Google Drive or Imgur link</p>
              </div>

              <div className="bg-blue-50 p-3 rounded-xl border-2 border-blue-200">
                <p className="text-sm text-blue-700 font-bold">
                  ℹ️ Student ID and Password will be auto-generated
                </p>
                <p className="text-xs text-blue-600 mt-1">Example: HJ075 / HJ075-2026</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleAddNewStudent}
                  disabled={loading || !newStudent.firstName || !newStudent.lastName || !newStudent.dateOfBirth}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl py-3 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Student'}
                </button>
                <button 
                  onClick={() => setShowAddStudentForm(false)}
                  className="px-6 bg-gray-200 text-gray-700 rounded-xl py-3 font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ADMIN STUDENTS LIST
  if (currentPage === 'admin-students' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      {selectedStudentDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => { setSelectedStudentDetail(null); setSelectedStudentProgress(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl relative">
              <button onClick={() => { setSelectedStudentDetail(null); setSelectedStudentProgress(null); }} className="absolute top-4 right-4 text-white">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <Avatar firstName={selectedStudentDetail['First Name']} lastName={selectedStudentDetail['Last Name']} photoUrl={selectedStudentDetail['Photo']} size="lg" />
                <div className="text-white">
                  <h2 className="text-3xl font-black">{selectedStudentDetail['First Name']} {selectedStudentDetail['Last Name']}</h2>
                  <p className="text-xl font-bold opacity-90">{selectedStudentDetail['Student ID']}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {/* Basic Profile Info */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                <h3 className="text-lg font-black text-gray-800 mb-3">👤 Basic Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedStudentDetail['Date of Birth'] && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">📅 Date of Birth</p>
                      <p className="text-base font-black text-gray-800">{selectedStudentDetail['Date of Birth']}</p>
                    </div>
                  )}
                  {selectedStudentDetail['Age'] && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">🎂 Age</p>
                      <p className="text-base font-black text-gray-800">{selectedStudentDetail['Age']} years</p>
                    </div>
                  )}
                  {selectedStudentDetail['Category'] && (
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">⭐ Category</p>
                      <p className="text-base font-black text-gray-800">{selectedStudentDetail['Category']}</p>
                    </div>
                  )}
                  {selectedStudentDetail['Address'] && (
                    <div className="col-span-2 bg-white rounded-lg p-3">
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">📍 Address</p>
                      <p className="text-base font-bold text-gray-800">{selectedStudentDetail['Address']}</p>
                    </div>
                  )}
                  <div className="col-span-2 bg-white rounded-lg p-3">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">👥 Team</p>
                    <select
                      value={selectedStudentDetail['TEAM'] || ''}
                      onChange={(e) => handleAssignTeam(selectedStudentDetail['Student ID'], e.target.value)}
                      className="w-full p-2 border-2 border-indigo-200 rounded-lg font-bold text-gray-700"
                    >
                      <option value="">— No team —</option>
                      {Array.from(new Set([
                        ...((programSettings.teams || []).map(t => t.name).filter(Boolean)),
                        ...allStudents.map(s => s['TEAM']).filter(Boolean)
                      ])).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 bg-white rounded-lg p-3">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2">⭐ Status</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleStatus(selectedStudentDetail['Student ID'], 'active')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm ${(selectedStudentDetail['Status'] || 'active') === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                      >
                        ✓ Active
                      </button>
                      <button
                        onClick={() => handleToggleStatus(selectedStudentDetail['Student ID'], 'inactive')}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm ${selectedStudentDetail['Status'] === 'inactive' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-500'}`}
                      >
                        💤 Inactive
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Inactive students are kept but hidden from the active program. They can rejoin anytime.</p>
                  </div>
                  <div className="col-span-2 bg-white rounded-lg p-3">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2">💡 Quiz Scores (each /10)</p>
                    <div className="flex gap-2 mb-3">
                      {[['Quiz1','Q1'],['Quiz2','Q2'],['Quiz3','Q3']].map(([field,label]) => (
                        <div key={field} className="flex-1">
                          <label className="text-xs text-gray-500 block text-center mb-1">{label}</label>
                          <input type="number" min="0" max="10"
                            key={`${selectedStudentDetail['Student ID']}-${field}`}
                            defaultValue={selectedStudentDetail[field] ?? ''}
                            id={`score-${field}`}
                            className="w-full h-10 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700" />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2">💙 Service Project (/100%)</p>
                    <input type="number" min="0" max="100"
                      key={`${selectedStudentDetail['Student ID']}-service`}
                      defaultValue={selectedStudentDetail['ServicePct'] ?? ''}
                      id="score-ServicePct"
                      placeholder="0"
                      className="w-full h-10 text-center border-2 border-blue-200 rounded-lg font-bold text-gray-700 mb-3" />
                    <button
                      onClick={() => handleSaveStudentScores(
                        selectedStudentDetail['Student ID'],
                        document.getElementById('score-Quiz1').value,
                        document.getElementById('score-Quiz2').value,
                        document.getElementById('score-Quiz3').value,
                        document.getElementById('score-ServicePct').value
                      )}
                      className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold text-sm">
                      💾 Save Quiz & Service
                    </button>
                  </div>
                </div>
              </div>

              {/* Private reflections (read to support the student) */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🕊️</span>
                  <h3 className="text-lg font-black text-gray-800">Quiet Heart Reflections</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">{selectedStudentDetail['First Name']}'s private writings. Read with care — reach out if something concerns you. 💗</p>
                {detailReflections.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No reflections written yet.</p>
                ) : (
                  <div className="space-y-2">
                    {detailReflections.map(r => (
                      <div key={r.id} className="bg-white rounded-lg p-3 border border-pink-100">
                        <p className="text-xs text-pink-400 font-bold mb-1">{new Date(r.created_at).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { setEncourageFor(selectedStudentDetail); setEncourageText(''); }}
                  className="w-full mt-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm">
                  💌 Send an encouragement
                </button>
              </div>

              {/* Weekly Affirmation */}
              {selectedStudentProgress && selectedStudentProgress.affirmation && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-black text-gray-800">Weekly Affirmation</h3>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-base font-semibold text-gray-700 italic">"{selectedStudentProgress.affirmation}"</p>
                  </div>
                </div>
              )}

              {/* Hyojeong Growth */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <h3 className="text-lg font-black text-gray-800 mb-3">🌸 Hyojeong Growth</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-bold mb-1">Growth Journey</p>
                    <p className="text-3xl font-black text-purple-600">{Math.round(parseFloat(selectedStudentDetail['HJ Grade']) || 0)}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-blue-600 mb-1" />
                    <p className="text-xs text-gray-600 font-bold mb-1">Faithful Presence</p>
                    <p className="text-2xl font-black text-blue-600">{calculateAttendance(selectedStudentDetail)}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <BookOpen className="w-6 h-6 text-purple-600 mb-1" />
                    <p className="text-xs text-gray-600 font-bold mb-1">Heart Knowledge</p>
                    <p className="text-2xl font-black text-purple-600">{Math.round(parseFloat(selectedStudentDetail['HJ Quiz']) || 0)}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <Award className="w-6 h-6 text-green-600 mb-1" />
                    <p className="text-xs text-gray-600 font-bold mb-1">Filial Actions</p>
                    <p className="text-2xl font-black text-green-600">{Math.round(parseFloat(selectedStudentDetail['HJ Service Pct']) || 0)}%</p>
                  </div>
                </div>
              </div>

              {/* Heart Cultivation */}
              {selectedStudentProgress && (() => {
                const computedBadges = computeBadgesForStudent(selectedStudentDetail, selectedStudentProgress);
                return (
                <>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200">
                    <h3 className="text-lg font-black text-gray-800 mb-3">🌱 Heart Cultivation</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-3">
                        <Gift className="w-6 h-6 text-yellow-600 mb-1" />
                        <p className="text-xs text-gray-600 font-bold mb-1">Heart Seeds</p>
                        <p className="text-3xl font-black text-yellow-600">{selectedStudentProgress.totalPoints || 0}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <Award className="w-6 h-6 text-purple-600 mb-1" />
                        <p className="text-xs text-gray-600 font-bold mb-1">Hearts Earned</p>
                        <p className="text-3xl font-black text-purple-600">{computedBadges.length}/{BADGES.length}</p>
                      </div>
                    </div>
                    {computedBadges.length > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-bold mb-2">Earned Hearts:</p>
                        <div className="flex flex-wrap gap-2">
                          {computedBadges.map(badgeId => {
                            const badge = BADGES.find(b => b.id === badgeId);
                            return badge ? (
                              <div key={badgeId} className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full flex items-center gap-2">
                                <span className="text-lg">{badge.icon}</span>
                                <span className="text-xs font-bold text-gray-700">{badge.name}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Growth Goals */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-black text-gray-800">Growth Goals</h3>
                    </div>
                    <div className="space-y-2">
                      {[1, 2, 3].map(num => {
                        const goal = selectedStudentProgress[`goal${num}`];
                        const status = selectedStudentProgress[`goal${num}Status`];
                        return (
                          <div 
                            key={num}
                            className={`rounded-lg p-3 ${
                              status === 'Completed' ? 'bg-green-100' :
                              status === 'In Progress' ? 'bg-white' :
                              'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-gray-500 mb-1">Goal {num}</p>
                                {goal ? (
                                  <>
                                    <p className="text-sm font-bold text-gray-800 mb-1">{goal}</p>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full inline-block ${
                                      status === 'Completed' ? 'bg-green-200 text-green-700' :
                                      status === 'In Progress' ? 'bg-purple-200 text-purple-700' :
                                      'bg-gray-200 text-gray-600'
                                    }`}>
                                      {status}
                                    </span>
                                  </>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">No goal set</p>
                                )}
                              </div>
                              {status === 'Completed' && <span className="text-xl ml-2">🎉</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">All Students</h1>
        </div>
        <div className="flex gap-2 mb-3">
          {[
            { key: 'active', label: '✓ Active' },
            { key: 'inactive', label: '💤 Inactive' },
            { key: 'all', label: 'All' }
          ].map(f => {
            const count = f.key === 'all' ? allStudents.length : allStudents.filter(s => (s['Status'] || 'active') === f.key).length;
            return (
              <button key={f.key} onClick={() => setStudentStatusFilter(f.key)}
                className={`flex-1 py-2 rounded-xl font-bold text-sm ${studentStatusFilter === f.key ? 'bg-white text-purple-600' : 'bg-white/30 text-white'}`}>
                {f.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          {['ALL', ...((programSettings.teams || []).map(t => t.name).filter(Boolean)), ...Array.from(new Set(allStudents.map(s => s['TEAM']).filter(Boolean)))]
            .filter((v, i, arr) => arr.indexOf(v) === i)
            .map(t => (
            <button key={t} onClick={() => setStudentTeamFilter(t)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${studentTeamFilter === t ? 'bg-purple-600 text-white' : 'bg-white/50 text-gray-700'}`}>
              {t === 'ALL' ? '👥 All teams' : t}
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            const filtered = [...allStudents]
              .filter(s => studentStatusFilter === 'all' || (s['Status'] || 'active') === studentStatusFilter)
              .filter(s => studentTeamFilter === 'ALL' || (s['TEAM'] || '').toUpperCase() === studentTeamFilter.toUpperCase())
              .filter(s => s['Student ID'] && s['Student ID'].match(/^HJ\d+$/i))
              .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`));
            printAllStudentsReport(filtered, allMarks);
          }}
          className="w-full mb-4 py-3 bg-white text-purple-600 rounded-xl font-bold shadow">
          🖨️ Print All Students Report (PDF)
        </button>
        <div className="space-y-3">
          {[...allStudents]
            .filter(s => studentStatusFilter === 'all' || (s['Status'] || 'active') === studentStatusFilter)
            .filter(s => studentTeamFilter === 'ALL' || (s['TEAM'] || '').toUpperCase() === studentTeamFilter.toUpperCase())
            .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.trim().localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`.trim())).map((student, idx) => {
            const sid = student['Student ID'];
            const sMarks = allMarks.filter(m => m.student_id === sid);
            const mMap = {}; sMarks.forEach(m => { mMap[m.session_number] = m; });
            const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);
            const isExpanded = expandedStudent === sid;
            // Get the effective mark for a session+field (edit overrides saved).
            const getMark = (n, field) => {
              const editKey = `${sid}-${n}`;
              const edit = inlineMarkEdits[editKey];
              if (edit && edit[field] != null) return edit[field];
              return !!(mMap[n] && mMap[n][field]);
            };
            const toggleInline = (n, field) => {
              const editKey = `${sid}-${n}`;
              setInlineMarkEdits(prev => ({ ...prev, [editKey]: { ...(prev[editKey]||{}), [field]: !getMark(n, field) } }));
            };
            const pctFor = (field) => {
              const done = sessions.filter(n => getMark(n, field)).length;
              return Math.round(done / sessionCount * 100);
            };
            const EditGrid = ({ field, color, label }) => (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-gray-600">{label}</span>
                  <span className="text-[11px] font-bold" style={{color}}>{pctFor(field)}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sessions.map(n => {
                    const on = getMark(n, field);
                    return <button key={n} onClick={() => toggleInline(n, field)} title={`Session ${n}`}
                      style={{width:22, height:22, borderRadius:5, fontSize:9, fontWeight:700, border:'none', cursor:'pointer',
                        background: on ? color : '#E5E7EB', color: on ? 'white' : '#9CA3AF'}}>{n}</button>;
                  })}
                </div>
              </div>
            );
            const se = inlineScoreEdits[sid] || {
              quizzes: (() => { const a = getQuizArray(student).slice(); while (a.length < quizCount) a.push(''); return a.slice(0, quizCount); })(),
              services: (() => { const a = getServiceArray(student).slice(); while (a.length < serviceCount) a.push(''); return a.slice(0, serviceCount); })()
            };
            const setQ = (i, val) => setInlineScoreEdits(prev => { const cur = prev[sid] || se; const q = [...(cur.quizzes||[])]; q[i] = val; return { ...prev, [sid]: { ...cur, quizzes: q } }; });
            const setSv = (i, val) => setInlineScoreEdits(prev => { const cur = prev[sid] || se; const sv = [...(cur.services||[])]; sv[i] = val; return { ...prev, [sid]: { ...cur, services: sv } }; });
            return (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div onClick={() => { setExpandedStudent(isExpanded ? null : sid); }}
                className="flex items-center gap-3 cursor-pointer p-4">
                <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="sm" />
                <div className="flex-1">
                  <p className="font-black text-gray-800">{student['First Name']} {student['Last Name']}</p>
                  <p className="text-sm text-purple-600 font-bold">{sid} {student['TEAM'] ? `· ${student['TEAM']}` : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{student['Category']}</p>
                  <p className="text-base font-black text-purple-600">{Math.round(parseFloat(student['HJ Grade']) || 0)}%</p>
                </div>
                <span className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-2">Tap a box to mark/unmark that session.</p>
                  <EditGrid field="attendance" color="#7C3AED" label="📅 Attendance" />
                  <EditGrid field="hj_shirt" color="#0D9488" label="🫂 One Heart One Shirt" />
                  <EditGrid field="gratitude" color="#E11D48" label="💗 Gratitude" />
                  <div className="mt-3 mb-2">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">💡 Quiz (each /10)</p>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {(se.quizzes||[]).map((val, i) => (
                        <input key={i} type="number" min="0" max="10" value={val ?? ''} onChange={e => setQ(i, e.target.value)}
                          style={{width:48}} className="h-9 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700 text-sm" />
                      ))}
                      {(!se.quizzes || se.quizzes.length === 0) && <span className="text-xs text-gray-400">No quizzes this program</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mb-1">💙 Service (each /100)</p>
                    <div className="flex gap-1 flex-wrap">
                      {(se.services||[]).map((val, i) => (
                        <input key={i} type="number" min="0" max="100" value={val ?? ''} onChange={e => setSv(i, e.target.value)}
                          style={{width:60}} className="h-9 text-center border-2 border-blue-200 rounded-lg font-bold text-gray-700 text-sm" />
                      ))}
                      {(!se.services || se.services.length === 0) && <span className="text-xs text-gray-400">No service projects this program</span>}
                    </div>
                  </div>
                  <button onClick={() => saveInlineStudent(sid)} disabled={savingInline}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
                    {savingInline ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button onClick={() => printStudentReport(student, allMarks.filter(m => m.student_id === sid), [])}
                    className="w-full mt-2 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-xl font-bold text-sm">
                    🖨️ Print / Save Report (PDF)
                  </button>
                  <button onClick={() => { setEncourageFor(student); setEncourageText(''); }}
                    className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm">
                    💌 Send Encouragement
                  </button>
                  <button onClick={() => { setSelectedStudentDetail(student); loadStudentProgressForAdmin(sid); }}
                    className="w-full mt-2 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-xl font-bold text-sm">
                    Open full profile (photo, team, status…)
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
      {encourageFor && (
        <div onClick={() => setEncourageFor(null)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:50}}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className="text-lg font-black text-gray-800 mb-1">💌 Encourage {encourageFor['First Name']}</p>
            <p className="text-xs text-gray-500 mb-3">A private note of encouragement — only {encourageFor['First Name']} will see it on their home page.</p>
            <textarea value={encourageText} onChange={e => setEncourageText(e.target.value)} rows="3" maxLength={300}
              placeholder="e.g. I saw how kindly you helped today. Keep shining! 💙"
              className="w-full px-4 py-3 bg-white border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setEncourageFor(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
              <button onClick={sendEncouragement} disabled={sendingEncourage || !encourageText.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold disabled:opacity-50">
                {sendingEncourage ? 'Sending…' : 'Send 💌'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ADMIN LEADERBOARD
  if (currentPage === 'admin-leaderboard' && isAdmin) {
    const kidsLeaderboard = getLeaderboard('Kids');
    const teensLeaderboard = getLeaderboard('Teens');

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-black text-white">🏆 Leaderboards</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-black text-gray-800">Kids Category</h2>
            </div>
            {kidsLeaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students in Kids category</p>
            ) : (
              <div className="space-y-3">
                {kidsLeaderboard.map((student, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      idx === 0 ? 'bg-yellow-50 border-2 border-yellow-400' :
                      idx === 1 ? 'bg-gray-50 border-2 border-gray-400' :
                      idx === 2 ? 'bg-orange-50 border-2 border-orange-400' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      {idx === 0 && <span className="text-3xl">🥇</span>}
                      {idx === 1 && <span className="text-3xl">🥈</span>}
                      {idx === 2 && <span className="text-3xl">🥉</span>}
                      {idx > 2 && <span className="text-xl font-black text-gray-600">#{idx + 1}</span>}
                    </div>
                    <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="sm" />
                    <div className="flex-1">
                      <p className="font-black text-gray-800">{student['First Name']} {student['Last Name']}</p>
                      <p className="text-sm text-purple-600 font-bold">{student['Student ID']}</p>
                    </div>
                    <div className="text-right">
                      {(() => { const lv = heartLevelFor(student['HJ Grade']); return (<><p className="text-2xl" style={{margin:0}}>{lv.icon}</p><p className="text-xs font-bold" style={{color:lv.color}}>{lv.name}</p><p className="text-sm font-black text-gray-700">{Math.round(parseFloat(student['HJ Grade'])||0)}%</p></>); })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-black text-gray-800">Teens Category</h2>
            </div>
            {teensLeaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students in Teens category</p>
            ) : (
              <div className="space-y-3">
                {teensLeaderboard.map((student, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      idx === 0 ? 'bg-yellow-50 border-2 border-yellow-400' :
                      idx === 1 ? 'bg-gray-50 border-2 border-gray-400' :
                      idx === 2 ? 'bg-orange-50 border-2 border-orange-400' :
                      'bg-gray-50'
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                      {idx === 0 && <span className="text-3xl">🥇</span>}
                      {idx === 1 && <span className="text-3xl">🥈</span>}
                      {idx === 2 && <span className="text-3xl">🥉</span>}
                      {idx > 2 && <span className="text-xl font-black text-gray-600">#{idx + 1}</span>}
                    </div>
                    <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="sm" />
                    <div className="flex-1">
                      <p className="font-black text-gray-800">{student['First Name']} {student['Last Name']}</p>
                      <p className="text-sm text-purple-600 font-bold">{student['Student ID']}</p>
                    </div>
                    <div className="text-right">
                      {(() => { const lv = heartLevelFor(student['HJ Grade']); return (<><p className="text-2xl" style={{margin:0}}>{lv.icon}</p><p className="text-xs font-bold" style={{color:lv.color}}>{lv.name}</p><p className="text-sm font-black text-gray-700">{Math.round(parseFloat(student['HJ Grade'])||0)}%</p></>); })()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN START NEW PROGRAM
  if (currentPage === 'admin-new-program' && isAdmin) {
    const f = newProgramForm || {};
    const upd = (patch) => setNewProgramForm(prev => ({ ...(prev || {}), ...patch }));
    const canStart = (f.archiveName || '').trim().length > 0 && (f.newName || '').trim().length > 0 && f.confirm === 'START';
    const doStart = async () => {
      if (!canStart) return;
      const ok = await startNewProgram(f);
      if (ok) {
        alert('🎉 New program started! The previous program was archived. Now set your students active/inactive for this batch.');
        setNewProgramForm(null);
        setCurrentPage('admin-dashboard');
      }
    };
    return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 via-rose-300 to-pink-300 pb-32">
      <div className="p-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setNewProgramForm(null); setCurrentPage('admin-dashboard'); }} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">▶️ Start New Program</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <p className="font-black text-gray-800 mb-2">This will, in order:</p>
          <div className="space-y-2 mb-2 text-sm">
            <div className="flex items-center gap-2"><span>📜</span><span className="text-gray-700">Archive the current program (saved forever in Past Programs)</span></div>
            <div className="flex items-center gap-2"><span>🧹</span><span className="text-gray-700">Clear attendance, gratitude, quiz &amp; service data</span></div>
            <div className="flex items-center gap-2"><span>🔄</span><span className="text-gray-700">Reset all grades to 0</span></div>
            <div className="flex items-center gap-2"><span>👥</span><span className="text-gray-700">Keep all students (set active/inactive after)</span></div>
          </div>
          <p className="text-xs text-rose-600 bg-rose-50 rounded-xl p-2 font-bold">Nothing is lost — everything is archived first. But the current program's live data WILL be cleared.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4 space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-1">📜 Name for the archive (the program ending now)</label>
            <input type="text" value={f.archiveName || ''} onChange={e => upd({ archiveName: e.target.value })}
              placeholder="e.g. 21-Day Program · Feb–May 2026"
              className="w-full p-3 border-2 border-rose-200 rounded-xl font-bold text-gray-700" />
          </div>

          <div className="border-t-2 border-gray-100 pt-4">
            <p className="font-black text-gray-800 mb-3">🌱 New program details</p>
            <label className="text-sm font-bold text-gray-600 block mb-1">Program name</label>
            <input type="text" value={f.newName || ''} onChange={e => upd({ newName: e.target.value })}
              placeholder="e.g. Summer Program 2026"
              className="w-full p-3 border-2 border-purple-200 rounded-xl font-bold text-gray-700 mb-3" />

            <label className="text-sm font-bold text-gray-600 block mb-2">Program length (sessions)</label>
            <div className="flex gap-2 mb-3">
              {[7, 14, 21, 40].map(n => (
                <button key={n} onClick={() => upd({ sessions: n, gratitudeSessions: n })}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm ${parseInt(f.sessions,10) === n ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  {n} days
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Sessions (custom)</label>
                <input type="number" min="1" max="60" value={f.sessions || ''} onChange={e => upd({ sessions: e.target.value, gratitudeSessions: e.target.value })}
                  className="w-full p-3 border-2 border-purple-200 rounded-xl font-bold text-gray-700" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Gratitude sessions</label>
                <input type="number" min="1" max="60" value={f.gratitudeSessions || ''} onChange={e => upd({ gratitudeSessions: e.target.value })}
                  className="w-full p-3 border-2 border-pink-200 rounded-xl font-bold text-gray-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">💡 Number of quizzes</label>
                <input type="number" min="0" max="20" value={f.quizzes ?? 0} onChange={e => upd({ quizzes: e.target.value })}
                  className="w-full p-3 border-2 border-amber-200 rounded-xl font-bold text-gray-700" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">💙 Number of service projects</label>
                <input type="number" min="0" max="20" value={f.services ?? 0} onChange={e => upd({ services: e.target.value })}
                  className="w-full p-3 border-2 border-blue-200 rounded-xl font-bold text-gray-700" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Start date</label>
                <input type="date" value={f.startDate || ''} onChange={e => upd({ startDate: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">End date</label>
                <input type="date" value={f.endDate || ''} onChange={e => upd({ endDate: e.target.value })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700" />
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-100 pt-4">
            <label className="text-sm font-bold text-gray-600 block mb-1">Type <span className="text-rose-600">START</span> to confirm</label>
            <input type="text" value={f.confirm || ''} onChange={e => upd({ confirm: e.target.value })}
              placeholder="START"
              className="w-full p-3 border-2 border-rose-300 rounded-xl font-bold text-gray-700" />
          </div>
        </div>

        <button onClick={doStart} disabled={!canStart || startingProgram}
          className={`w-full py-4 rounded-2xl font-black text-white shadow-lg ${canStart && !startingProgram ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gray-300'}`}>
          {startingProgram ? 'Archiving & starting…' : '📜 Archive & Start New Program'}
        </button>
      </div>
    </div>
    );
  }

  // ADMIN PROGRAM SETUP
  if (currentPage === 'admin-setup' && isAdmin) {
    const f = setupForm || {
      program_name: programSettings.program_name,
      start_date: programSettings.start_date,
      end_date: programSettings.end_date,
      total_sessions: programSettings.total_sessions,
      total_gratitude_sessions: programSettings.total_gratitude_sessions,
      num_quizzes: programSettings.num_quizzes,
      num_services: programSettings.num_services,
      session_dates: [...(programSettings.session_dates || [])],
      teams: (programSettings.teams || []).map(t => ({ ...t })),
      heart_messages: (programSettings.heart_messages || []).map(m => ({ ...m }))
    };
    if (!setupForm) setTimeout(() => setSetupForm(f), 0);

    const upd = (patch) => setSetupForm({ ...f, ...patch });
    const nSessions = parseInt(f.total_sessions, 10) || 0;
    const dates = [...(f.session_dates || [])];
    while (dates.length < nSessions) dates.push('');

    const setDate = (i, val) => {
      const d = [...dates]; d[i] = val; upd({ session_dates: d });
    };
    const setTeam = (i, patch) => {
      const t = f.teams.map((tm, idx) => idx === i ? { ...tm, ...patch } : tm);
      upd({ teams: t });
    };
    const addTeam = () => upd({ teams: [...f.teams, { name: '', lead_name: '', lead_pin: '' }] });
    const removeTeam = (i) => upd({ teams: f.teams.filter((_, idx) => idx !== i) });

    const msgs = f.heart_messages || [];
    const setMsg = (i, patch) => upd({ heart_messages: msgs.map((m, idx) => idx === i ? { ...m, ...patch } : m) });
    const addMsg = () => upd({ heart_messages: [...msgs, { text: '', theme: '' }] });
    const removeMsg = (i) => upd({ heart_messages: msgs.filter((_, idx) => idx !== i) });

    return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300 pb-32">
      <div className="p-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { setSetupForm(null); setCurrentPage('admin-dashboard'); }} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">⚙️ Program Setup</h1>
        </div>

        {/* Program details */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Program details</p>
          <label className="text-sm font-bold text-gray-600 block mb-1">Program name</label>
          <input value={f.program_name || ''} onChange={e => upd({ program_name: e.target.value })}
            className="w-full p-3 border-2 border-purple-200 rounded-xl mb-3 font-semibold text-gray-700" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Start date</label>
              <input value={f.start_date || ''} onChange={e => upd({ start_date: e.target.value })}
                placeholder="2026-07-05" className="w-full p-3 border-2 border-purple-200 rounded-xl text-gray-700" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">End date</label>
              <input value={f.end_date || ''} onChange={e => upd({ end_date: e.target.value })}
                placeholder="2026-09-20" className="w-full p-3 border-2 border-purple-200 rounded-xl text-gray-700" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-sm font-bold text-gray-600 block mb-2">Program length (sessions)</label>
            <div className="flex gap-2 mb-2">
              {[7, 14, 21, 40].map(n => (
                <button key={n} onClick={() => upd({ total_sessions: n, total_gratitude_sessions: n })}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm ${parseInt(f.total_sessions,10) === n ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  {n} days
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Total sessions (custom)</label>
              <input type="number" min="1" max="60" value={f.total_sessions}
                onChange={e => upd({ total_sessions: e.target.value })}
                className="w-full p-3 border-2 border-purple-200 rounded-xl font-bold text-gray-700" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">Gratitude sessions</label>
              <input type="number" min="1" max="60" value={f.total_gratitude_sessions}
                onChange={e => upd({ total_gratitude_sessions: e.target.value })}
                className="w-full p-3 border-2 border-purple-200 rounded-xl font-bold text-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">💡 Number of quizzes</label>
              <input type="number" min="0" max="20" value={f.num_quizzes}
                onChange={e => upd({ num_quizzes: e.target.value })}
                className="w-full p-3 border-2 border-amber-200 rounded-xl font-bold text-gray-700" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-600 block mb-1">💙 Number of service projects</label>
              <input type="number" min="0" max="20" value={f.num_services}
                onChange={e => upd({ num_services: e.target.value })}
                className="w-full p-3 border-2 border-blue-200 rounded-xl font-bold text-gray-700" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 mt-3 text-xs text-purple-700">
            ℹ️ Grades auto-recalculate around the session count.
          </div>
        </div>

        {/* Session schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Session schedule ({nSessions} sessions)</p>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Array.from({ length: nSessions }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-500 w-20">Session {i + 1}</span>
                <input value={dates[i] || ''} onChange={e => setDate(i, e.target.value)}
                  placeholder="YYYY-MM-DD" className="flex-1 p-2 border-2 border-gray-200 rounded-lg text-gray-700 text-sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Teams & leaders */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Teams &amp; leaders</p>
          <div className="space-y-3">
            {f.teams.map((t, i) => (
              <div key={i} className="border-2 border-gray-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input value={t.name || ''} onChange={e => setTeam(i, { name: e.target.value.toUpperCase() })}
                    placeholder="TEAM NAME" className="flex-1 p-2 border-2 border-purple-200 rounded-lg font-bold text-gray-700" />
                  <button onClick={() => removeTeam(i)} className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Lead name</label>
                    <input value={t.lead_name || ''} onChange={e => setTeam(i, { lead_name: e.target.value })}
                      className="w-full p-2 border-2 border-gray-200 rounded-lg text-gray-700 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Lead PIN</label>
                    <input value={t.lead_pin || ''} onChange={e => setTeam(i, { lead_pin: e.target.value })}
                      placeholder="4 digits" className="w-full p-2 border-2 border-gray-200 rounded-lg text-gray-700 text-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={addTeam} className="w-full mt-3 py-2 text-purple-600 font-bold border-2 border-dashed border-purple-200 rounded-xl">
            + Add team
          </button>
        </div>

        {/* Daily Heart Messages (True Parents quotes) */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">💝 Daily heart messages</p>
          <p className="text-xs text-gray-500 mb-3">True Parents' quotes shown to students each day. One rotates daily. Add the exact wording you trust.</p>
          <div className="space-y-3">
            {msgs.map((m, i) => (
              <div key={i} className="border-2 border-pink-100 rounded-xl p-3 bg-pink-50/30">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-pink-400 mt-2">{i + 1}.</span>
                  <div className="flex-1">
                    <textarea value={m.text || ''} onChange={e => setMsg(i, { text: e.target.value })}
                      placeholder="Enter the quote exactly as spoken or written..." rows={3}
                      className="w-full p-2 border-2 border-pink-200 rounded-lg text-gray-700 text-sm mb-2" />
                    <input value={m.theme || ''} onChange={e => setMsg(i, { theme: e.target.value })}
                      placeholder="Theme or source (e.g. True Love, CSG p.123)" className="w-full p-2 border-2 border-gray-200 rounded-lg text-gray-600 text-sm" />
                  </div>
                  <button onClick={() => removeMsg(i)} className="w-9 h-9 bg-red-50 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {msgs.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-2">No quotes yet. Until you add some, gentle default messages are shown.</p>
            )}
          </div>
          <button onClick={addMsg} className="w-full mt-3 py-2 text-pink-600 font-bold border-2 border-dashed border-pink-200 rounded-xl">
            + Add heart message
          </button>
        </div>
      </div>

      {/* Sticky save */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
        <button onClick={() => saveProgramSettings({ ...f, session_dates: dates })}
          className="w-full max-w-xl mx-auto block bg-white text-purple-700 font-black rounded-2xl py-4 shadow-xl text-lg">
          💾 Save program
        </button>
      </div>
    </div>
    );
  }

  // ADMIN MARK ATTENDANCE
  // TEAM LEAD DASHBOARD
  // ANNOUNCEMENTS (post + view) for admin and leads
  if ((currentPage === 'admin-announce' || currentPage === 'lead-announce') && (isAdmin || leadTeam)) {
    const myPosts = announcements.filter(a => isAdmin ? true : (a.audience === leadTeam || a.audience === 'all'));
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage(leadTeam ? 'lead-dashboard' : 'admin-dashboard')} className="text-white font-bold"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-3xl font-black text-white">📢 Announcements</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-sm font-bold text-gray-700 mb-2">
            {isAdmin ? 'Post to everyone (all students & leaders)' : `Post to Team ${leadTeam}`}
          </p>
          <input value={announceTitle} onChange={e => setAnnounceTitle(e.target.value)} placeholder="Title (optional)"
            className="w-full p-3 border-2 border-purple-200 rounded-xl mb-2 font-bold text-gray-700" />
          <textarea value={announceText} onChange={e => setAnnounceText(e.target.value)} placeholder="Write your announcement..." rows={3}
            className="w-full p-3 border-2 border-purple-200 rounded-xl mb-2 text-gray-700" />
          <button onClick={postAnnouncement} disabled={postingAnnounce}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
            {postingAnnounce ? 'Posting...' : '📢 Post Announcement'}
          </button>
        </div>
        <p className="text-white font-bold text-sm mb-2 px-1">Recent announcements</p>
        <div className="space-y-3">
          {myPosts.length === 0 ? (
            <div className="bg-white/80 rounded-xl p-4 text-center text-gray-500">No announcements yet.</div>
          ) : myPosts.map(a => (
            <div key={a.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-purple-600">{a.audience === 'all' ? '🌍 Everyone' : `👥 ${a.audience}`}</span>
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
              {a.title && <p className="font-black text-gray-800">{a.title}</p>}
              <p className="text-sm text-gray-700">{a.body}</p>
              <p className="text-xs text-gray-400 mt-1">— {a.author_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  }

  // LEAD: MY TEAM MEMBERS (collapsible inline-edit list, locked to the lead's team)
  if (currentPage === 'lead-students' && leadTeam) {
    const roster = [...allStudents]
      .filter(s => (s['Status']||'active')==='active' && s['Student ID'] && s['Student ID'].match(/^HJ\d+$/i))
      .filter(s => (s['TEAM']||'').toUpperCase() === leadTeam.toUpperCase())
      .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.trim().localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`.trim()));
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage('lead-dashboard')} className="text-white font-bold"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="text-3xl font-black text-white">Team {leadTeam}</h1>
            <p className="text-white/90 font-bold text-sm">{roster.length} members · tap a name to edit</p>
          </div>
        </div>
        <div className="space-y-3">
          {roster.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">No members in your team yet.</div>
          ) : roster.map((student, idx) => {
            const sid = student['Student ID'];
            const sMarks = allMarks.filter(m => m.student_id === sid);
            const mMap = {}; sMarks.forEach(m => { mMap[m.session_number] = m; });
            const sessions = Array.from({ length: sessionCount }, (_, i) => i + 1);
            const isExpanded = expandedStudent === sid;
            const getMark = (n, field) => {
              const edit = inlineMarkEdits[`${sid}-${n}`];
              if (edit && edit[field] != null) return edit[field];
              return !!(mMap[n] && mMap[n][field]);
            };
            const toggleInline = (n, field) => {
              const editKey = `${sid}-${n}`;
              setInlineMarkEdits(prev => ({ ...prev, [editKey]: { ...(prev[editKey]||{}), [field]: !getMark(n, field) } }));
            };
            const pctFor = (field) => Math.round(sessions.filter(n => getMark(n, field)).length / sessionCount * 100);
            const EditGrid = ({ field, color, label }) => (
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[11px] font-bold text-gray-600">{label}</span>
                  <span className="text-[11px] font-bold" style={{color}}>{pctFor(field)}%</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sessions.map(n => {
                    const on = getMark(n, field);
                    return <button key={n} onClick={() => toggleInline(n, field)} title={`Session ${n}`}
                      style={{width:22, height:22, borderRadius:5, fontSize:9, fontWeight:700, border:'none', cursor:'pointer',
                        background: on ? color : '#E5E7EB', color: on ? 'white' : '#9CA3AF'}}>{n}</button>;
                  })}
                </div>
              </div>
            );
            const se = inlineScoreEdits[sid] || {
              quizzes: (() => { const a = getQuizArray(student).slice(); while (a.length < quizCount) a.push(''); return a.slice(0, quizCount); })(),
              services: (() => { const a = getServiceArray(student).slice(); while (a.length < serviceCount) a.push(''); return a.slice(0, serviceCount); })()
            };
            const setQ = (i, val) => setInlineScoreEdits(prev => { const cur = prev[sid] || se; const q = [...(cur.quizzes||[])]; q[i] = val; return { ...prev, [sid]: { ...cur, quizzes: q } }; });
            const setSv = (i, val) => setInlineScoreEdits(prev => { const cur = prev[sid] || se; const sv = [...(cur.services||[])]; sv[i] = val; return { ...prev, [sid]: { ...cur, services: sv } }; });
            return (
            <div key={idx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div onClick={() => { setExpandedStudent(isExpanded ? null : sid); }}
                className="flex items-center gap-3 cursor-pointer p-4">
                <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="sm" />
                <div className="flex-1">
                  <p className="font-black text-gray-800">{student['First Name']} {student['Last Name']}</p>
                  <p className="text-sm text-purple-600 font-bold">{sid}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{student['Category']}</p>
                  <p className="text-base font-black text-purple-600">{Math.round(parseFloat(student['HJ Grade']) || 0)}%</p>
                </div>
                <span className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 mb-2">Tap a box to mark/unmark that session.</p>
                  <EditGrid field="attendance" color="#7C3AED" label="📅 Attendance" />
                  <EditGrid field="hj_shirt" color="#0D9488" label="🫂 One Heart One Shirt" />
                  <EditGrid field="gratitude" color="#E11D48" label="💗 Gratitude" />
                  <div className="mt-3 mb-2">
                    <p className="text-[10px] text-gray-500 font-bold mb-1">💡 Quiz (each /10)</p>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {(se.quizzes||[]).map((val, i) => (
                        <input key={i} type="number" min="0" max="10" value={val ?? ''} onChange={e => setQ(i, e.target.value)}
                          style={{width:48}} className="h-9 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700 text-sm" />
                      ))}
                      {(!se.quizzes || se.quizzes.length === 0) && <span className="text-xs text-gray-400">No quizzes this program</span>}
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mb-1">💙 Service (each /100)</p>
                    <div className="flex gap-1 flex-wrap">
                      {(se.services||[]).map((val, i) => (
                        <input key={i} type="number" min="0" max="100" value={val ?? ''} onChange={e => setSv(i, e.target.value)}
                          style={{width:60}} className="h-9 text-center border-2 border-blue-200 rounded-lg font-bold text-gray-700 text-sm" />
                      ))}
                      {(!se.services || se.services.length === 0) && <span className="text-xs text-gray-400">No service projects this program</span>}
                    </div>
                  </div>
                  <button onClick={() => saveInlineStudent(sid)} disabled={savingInline}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold">
                    {savingInline ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button onClick={() => printStudentReport(student, allMarks.filter(m => m.student_id === sid), [])}
                    className="w-full mt-2 py-2 bg-white text-purple-600 border-2 border-purple-200 rounded-xl font-bold text-sm">
                    🖨️ Print / Save Report (PDF)
                  </button>
                  <button onClick={() => { setEncourageFor(student); setEncourageText(''); }}
                    className="w-full mt-2 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold text-sm">
                    💌 Send Encouragement
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
      {encourageFor && (
        <div onClick={() => setEncourageFor(null)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:50}}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className="text-lg font-black text-gray-800 mb-1">💌 Encourage {encourageFor['First Name']}</p>
            <p className="text-xs text-gray-500 mb-3">A private note of encouragement — only {encourageFor['First Name']} will see it on their home page.</p>
            <textarea value={encourageText} onChange={e => setEncourageText(e.target.value)} rows="3" maxLength={300}
              placeholder="e.g. I saw how kindly you helped today. Keep shining! 💙"
              className="w-full px-4 py-3 bg-white border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-200 resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setEncourageFor(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
              <button onClick={sendEncouragement} disabled={sendingEncourage || !encourageText.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-bold disabled:opacity-50">
                {sendingEncourage ? 'Sending…' : 'Send 💌'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  }

  if (currentPage === 'lead-dashboard' && leadTeam) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">Team {leadTeam}</h1>
          <button onClick={handleLogout} className="bg-white/30 text-white font-bold px-4 py-2 rounded-xl text-sm">Logout</button>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <p className="text-sm text-gray-500">Welcome, Team Lead 💝</p>
          <p className="text-lg font-black text-purple-600">Mark your team's growth</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => { loadAllMarks(); setCurrentPage('lead-students'); }}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3"><Users className="w-6 h-6" /><span className="font-bold">My Team Members</span></div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { setAttendanceSession(1); loadAttendanceMarks(1); setCurrentPage('lead-attendance'); }}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3"><Calendar className="w-6 h-6" /><span className="font-bold">Mark Attendance (whole session)</span></div>
            <ChevronRight className="w-6 h-6" />
          </button>
          <button onClick={() => { loadAnnouncements(); setCurrentPage('lead-announce'); }}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3"><MessageSquare className="w-6 h-6" /><span className="font-bold">Announcements</span></div>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
    );
  }

  // QUIZ SCORES (admin + lead)
  if ((currentPage === 'lead-quizzes' || currentPage === 'admin-quizzes') && (isAdmin || leadTeam)) {
    const teamFilter = leadTeam || quizTeamFilter;
    const roster = [...allStudents]
      .filter(s => (s['Status']||'active')==='active' && s['Student ID'] && s['Student ID'].match(/^HJ\d+$/i))
      .filter(s => !teamFilter || teamFilter === 'ALL' || (s['TEAM']||'').toUpperCase() === teamFilter.toUpperCase())
      .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`));
    const teams = ['ALL', ...((programSettings.teams || []).map(t => t.name).filter(Boolean))];
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-32">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage(leadTeam ? 'lead-dashboard' : 'admin-dashboard')} className="text-white font-bold"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="text-3xl font-black text-white">💡 Quiz Scores</h1>
            {leadTeam && <p className="text-white/90 font-bold text-sm">Team {leadTeam}</p>}
          </div>
        </div>
        <div className="bg-white/90 rounded-xl p-3 mb-3 text-sm text-gray-600">Enter each quiz out of <b>10</b>. There are 3 quizzes for the whole program. Heart Knowledge = average of quizzes taken.</div>
        {!leadTeam && (
          <div className="flex gap-2 flex-wrap mb-3">
            {teams.map(t => (
              <button key={t} onClick={() => setQuizTeamFilter(t)} className={`px-3 py-1 rounded-full text-sm font-bold ${quizTeamFilter===t ? 'bg-purple-600 text-white' : 'bg-white/60 text-gray-700'}`}>{t}</button>
            ))}
          </div>
        )}
        <div className="flex items-center px-3 mb-1">
          <div className="flex-1 text-xs font-bold text-white/90">Student</div>
          <div className="w-12 text-center text-xs font-bold text-white/90">Q1</div>
          <div className="w-12 text-center text-xs font-bold text-white/90">Q2</div>
          <div className="w-12 text-center text-xs font-bold text-white/90">Q3</div>
        </div>
        <div className="space-y-2">
          {roster.map(s => {
            const sid = s['Student ID'];
            const e = scoreEdits[sid] || {};
            const Box = (field) => (
              <input type="number" min="0" max="10" value={e[field] ?? ''} onChange={ev => setScoreField(sid, field, ev.target.value)}
                className="w-11 h-10 text-center border-2 border-amber-200 rounded-lg font-bold text-gray-700" />
            );
            return (
              <div key={sid} className="bg-white rounded-xl p-3 flex items-center shadow-sm gap-1">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{s['First Name']} {s['Last Name']}</p>
                  <p className="text-xs text-purple-600">{sid}</p>
                </div>
                {Box('quiz1')}{Box('quiz2')}{Box('quiz3')}
              </div>
            );
          })}
          {roster.length === 0 && <div className="bg-white rounded-xl p-6 text-center text-gray-500">No students in this team.</div>}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
        <button onClick={saveQuizScores} disabled={savingScores} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl py-4 shadow-xl text-lg">
          {savingScores ? 'Saving...' : '💾 Save Quiz Scores'}
        </button>
      </div>
    </div>
    );
  }

  // SERVICE SCORES (admin + lead)
  if ((currentPage === 'lead-service' || currentPage === 'admin-service') && (isAdmin || leadTeam)) {
    const teamFilter = leadTeam || quizTeamFilter;
    const roster = [...allStudents]
      .filter(s => (s['Status']||'active')==='active' && s['Student ID'] && s['Student ID'].match(/^HJ\d+$/i))
      .filter(s => !teamFilter || teamFilter === 'ALL' || (s['TEAM']||'').toUpperCase() === teamFilter.toUpperCase())
      .sort((a,b) => `${a['Last Name']||''} ${a['First Name']||''}`.localeCompare(`${b['Last Name']||''} ${b['First Name']||''}`));
    const teams = ['ALL', ...((programSettings.teams || []).map(t => t.name).filter(Boolean))];
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-32">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage(leadTeam ? 'lead-dashboard' : 'admin-dashboard')} className="text-white font-bold"><ArrowLeft className="w-6 h-6" /></button>
          <div>
            <h1 className="text-3xl font-black text-white">💙 Service Project</h1>
            {leadTeam && <p className="text-white/90 font-bold text-sm">Team {leadTeam}</p>}
          </div>
        </div>
        <div className="bg-white/90 rounded-xl p-3 mb-3 text-sm text-gray-600">Enter each student's service project score out of <b>100%</b>. One service project per program.</div>
        {!leadTeam && (
          <div className="flex gap-2 flex-wrap mb-3">
            {teams.map(t => (
              <button key={t} onClick={() => setQuizTeamFilter(t)} className={`px-3 py-1 rounded-full text-sm font-bold ${quizTeamFilter===t ? 'bg-purple-600 text-white' : 'bg-white/60 text-gray-700'}`}>{t}</button>
            ))}
          </div>
        )}
        <div className="flex items-center px-3 mb-1">
          <div className="flex-1 text-xs font-bold text-white/90">Student</div>
          <div className="w-24 text-center text-xs font-bold text-white/90">Service %</div>
        </div>
        <div className="space-y-2">
          {roster.map(s => {
            const sid = s['Student ID'];
            const e = scoreEdits[sid] || {};
            return (
              <div key={sid} className="bg-white rounded-xl p-3 flex items-center shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{s['First Name']} {s['Last Name']}</p>
                  <p className="text-xs text-purple-600">{sid}</p>
                </div>
                <input type="number" min="0" max="100" value={e.service_pct ?? ''} onChange={ev => setScoreField(sid, 'service_pct', ev.target.value)}
                  className="w-20 h-10 text-center border-2 border-blue-200 rounded-lg font-bold text-gray-700" />
              </div>
            );
          })}
          {roster.length === 0 && <div className="bg-white rounded-xl p-6 text-center text-gray-500">No students in this team.</div>}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
        <button onClick={saveServiceScores} disabled={savingScores} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-2xl py-4 shadow-xl text-lg">
          {savingScores ? 'Saving...' : '💾 Save Service Scores'}
        </button>
      </div>
    </div>
    );
  }

  if ((currentPage === 'admin-attendance' || currentPage === 'lead-attendance') && (isAdmin || leadTeam)) {
    const effectiveTeamFilter = leadTeam ? leadTeam : attendanceTeamFilter;
    const rosterForMarking = [...allStudents]
      .filter(s => (s['Status'] || 'active') === 'active')
      .filter(s => s['Student ID'] && s['Student ID'].match(/^HJ\d+$/i))
      .filter(s => effectiveTeamFilter === 'ALL' || (s['TEAM'] || '').toUpperCase() === effectiveTeamFilter.toUpperCase())
      .sort((a, b) => `${a['First Name']||''}`.localeCompare(`${b['First Name']||''}`));

    const markAllPresent = () => {
      setAttendanceMarks(prev => {
        const next = { ...prev };
        rosterForMarking.forEach(s => {
          const sid = s['Student ID'];
          const cur = next[sid] || { attendance: false, hj_shirt: false, gratitude: false };
          next[sid] = { ...cur, attendance: true };
        });
        return next;
      });
    };

    const teams = ['ALL', ...((programSettings.teams || []).map(t => t.name).filter(Boolean))];

    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-32">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => leadTeam ? setCurrentPage('lead-dashboard') : setCurrentPage('admin-dashboard')} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">📋 Mark Attendance</h1>
            {leadTeam && <p className="text-white/90 font-bold text-sm">Team {leadTeam} · Team Lead</p>}
          </div>
        </div>

        {/* Session + Team selectors */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
          <label className="text-sm font-bold text-gray-600 mb-1 block">Session</label>
          <select
            value={attendanceSession}
            onChange={(e) => { const n = parseInt(e.target.value, 10); setAttendanceSession(n); loadAttendanceMarks(n); }}
            className="w-full p-3 border-2 border-green-300 rounded-xl font-bold text-gray-700 mb-1"
          >
            {Array.from({ length: sessionCount }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>Session {n}{dateForSession(n) ? ` · ${dateForSession(n)}` : ''}</option>
            ))}
          </select>
          {dateForSession(attendanceSession) && (
            <p className="text-sm text-green-700 font-semibold mb-3">📅 {dateForSession(attendanceSession)}</p>
          )}

          {!leadTeam && (
            <>
              <label className="text-sm font-bold text-gray-600 mb-1 block">Team</label>
              <div className="flex gap-2 flex-wrap">
                {teams.map(t => (
                  <button
                    key={t}
                    onClick={() => setAttendanceTeamFilter(t)}
                    className={`px-3 py-1 rounded-full text-sm font-bold ${attendanceTeamFilter === t ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mb-3">
          <button onClick={markAllPresent} className="flex-1 bg-white/90 text-green-700 font-bold rounded-xl py-2 text-sm shadow">
            ✓ Mark all present
          </button>
          <button onClick={() => loadAttendanceMarks(attendanceSession)} className="px-4 bg-white/90 text-gray-600 font-bold rounded-xl py-2 text-sm shadow">
            ↺ Reload
          </button>
        </div>

        {/* Column headers */}
        <div className="flex items-center px-3 mb-1">
          <div className="flex-1 text-xs font-bold text-white/90">Student</div>
          <div className="w-14 text-center text-xs font-bold text-white/90">Present</div>
          <div className="w-14 text-center text-xs font-bold text-white/90">Shirt 🫂</div>
          <div className="w-14 text-center text-xs font-bold text-white/90">Grat 💗</div>
        </div>

        {/* Student rows */}
        <div className="space-y-2">
          {rosterForMarking.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">No students in this team.</div>
          ) : rosterForMarking.map(s => {
            const sid = s['Student ID'];
            const m = attendanceMarks[sid] || { attendance: false, hj_shirt: false, gratitude: false };
            const Box = ({ on, onClick }) => (
              <button onClick={onClick} className={`w-9 h-9 rounded-lg border-2 flex items-center justify-center font-black ${on ? 'bg-green-500 border-green-600 text-white' : 'bg-gray-50 border-gray-300 text-transparent'}`}>
                ✓
              </button>
            );
            return (
              <div key={sid} className="bg-white rounded-xl p-3 flex items-center shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{s['First Name']} {s['Last Name']}</p>
                  <p className="text-xs text-purple-600">{sid}{s['TEAM'] ? <span className="text-gray-400"> · {s['TEAM']}</span> : <span className="text-gray-300"> · no team</span>}</p>
                  {!m.attendance && (
                    <button onClick={() => { setAbsenceFor(s); setAbsenceReason(''); }}
                      className="text-[11px] text-amber-600 font-bold mt-0.5">📝 Why absent?</button>
                  )}
                </div>
                <div className="w-14 flex justify-center"><Box on={m.attendance} onClick={() => toggleMark(sid, 'attendance')} /></div>
                <div className="w-14 flex justify-center"><Box on={m.hj_shirt} onClick={() => toggleMark(sid, 'hj_shirt')} /></div>
                <div className="w-14 flex justify-center"><Box on={m.gratitude} onClick={() => toggleMark(sid, 'gratitude')} /></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/20 to-transparent">
        <button
          onClick={saveAttendanceMarks}
          disabled={savingAttendance}
          className="w-full bg-white text-green-700 font-black rounded-2xl py-4 shadow-xl text-lg"
        >
          {savingAttendance ? 'Saving...' : `💾 Save Session ${attendanceSession}`}
        </button>
      </div>
      {absenceFor && (
        <div onClick={() => setAbsenceFor(null)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, zIndex:50}}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <p className="text-lg font-black text-gray-800 mb-1">📝 Why was {absenceFor['First Name']} absent?</p>
            <p className="text-xs text-gray-500 mb-3">Session {attendanceSession}. This helps you care for them, and keeps attendance fair.</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Sick','Family matter','School','Travel','No transport','Other'].map(r => (
                <button key={r} type="button" onClick={() => setAbsenceReason(r)}
                  className={`px-3 py-2 rounded-full text-xs font-bold ${absenceReason === r ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={absenceReason} onChange={e => setAbsenceReason(e.target.value)} rows="2" maxLength={200}
              placeholder="Add a note (optional)…"
              className="w-full px-4 py-3 bg-white border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-amber-200 resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setAbsenceFor(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">Cancel</button>
              <button onClick={saveAbsenceNote} className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold">Save note</button>
            </div>
          </div>
        </div>
      )}
    </div>
    );
  }

  // ADMIN PAST PROGRAMS (archive list + single-archive viewer)
  if (currentPage === 'admin-archives' && isAdmin) {
    const heartFor = (g) => heartLevelFor(Math.round(parseFloat(g) || 0));
    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-300 to-purple-300 pb-20">
      <div className="p-4 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => { if (viewingArchive) { setViewingArchive(null); setArchiveStudents([]); } else { setCurrentPage('admin-dashboard'); } }} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">📜 {viewingArchive ? 'Program' : 'Past Programs'}</h1>
        </div>

        {!viewingArchive && (
          <>
            {archives.length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
                No archived programs yet. When you start a new program, the current one is saved here.
              </div>
            )}
            {archives.map(a => (
              <button key={a.id} onClick={() => loadArchiveStudents(a)}
                className="w-full bg-white rounded-2xl shadow-lg p-4 mb-3 flex items-center justify-between text-left">
                <div>
                  <p className="font-black text-gray-800">{a.archive_name}</p>
                  <p className="text-sm text-gray-500">
                    {(a.start_date || '?')}{a.end_date ? ` – ${a.end_date}` : ''} · {a.student_count} students
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {a.total_sessions} sessions · {a.num_quizzes} quizzes · {a.num_services} service
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </button>
            ))}
          </>
        )}

        {viewingArchive && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-3">
              <p className="font-black text-gray-800 text-lg">{viewingArchive.archive_name}</p>
              <p className="text-sm text-gray-500">
                {(viewingArchive.start_date || '?')}{viewingArchive.end_date ? ` – ${viewingArchive.end_date}` : ''} · archived snapshot
              </p>
              <button onClick={() => printArchiveReport(viewingArchive, archiveStudents)}
                className="mt-3 w-full py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-bold text-sm">
                🖨️ Print / Save Archive Report (PDF)
              </button>
            </div>
            {loadingArchive && <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">Loading...</div>}
            {!loadingArchive && archiveStudents.map((s, i) => {
              const hl = heartFor(s.hj_grade);
              return (
                <div key={s.id} className="bg-white rounded-2xl shadow-lg p-3 mb-2 flex items-center gap-3">
                  <span className="text-gray-400 font-black w-6 text-center">{i + 1}</span>
                  <Avatar firstName={s.first_name} lastName={s.last_name} photoUrl={s.photo_url} size="sm" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-purple-600 font-bold">{s.student_id} {s.team ? `· ${s.team}` : ''} · {hl.icon} {hl.name}</p>
                  </div>
                  <p className="text-base font-black text-blue-600">{Math.round(parseFloat(s.hj_grade) || 0)}%</p>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
    );
  }

  // ADMIN GRATITUDE JOURNALS
  if (currentPage === 'admin-gratitude' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">💖 Gratitude Journals</h1>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border-4 border-white">
          <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Session</label>
          <div className="flex gap-2">
            <select 
              value={selectedSessionFilter} 
              onChange={(e) => {
                setSelectedSessionFilter(e.target.value);
                loadAllGratitudeEntries(e.target.value);
              }}
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl font-semibold"
            >
              {[...Array(20)].map((_, i) => (
                <option key={i} value={`Session ${i + 1}`}>Session {i + 1}</option>
              ))}
            </select>
            <button 
              onClick={() => loadAllGratitudeEntries(selectedSessionFilter)}
              className="px-4 py-3 bg-purple-500 text-white rounded-xl font-bold"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-bold">Loading entries...</p>
          </div>
        ) : allGratitudeEntries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No gratitude entries for {selectedSessionFilter}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allGratitudeEntries.map((entry, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border-4 border-pink-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-black text-gray-800">{entry.studentName}</p>
                    <p className="text-sm text-purple-600 font-bold">{entry.studentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{entry.session}</p>
                    <p className="text-xs text-gray-400">{entry.timestamp}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-3 rounded-xl mb-3">
                  <p className="text-sm text-gray-700">{entry.content}</p>
                </div>
                {entry.adminRemark && (
                  <div className="bg-blue-50 p-3 rounded-xl mb-2 border-2 border-blue-200">
                    <p className="text-xs text-blue-600 font-bold mb-1">Your Remark:</p>
                    <p className="text-sm text-gray-700">{entry.adminRemark}</p>
                  </div>
                )}
                {selectedEntry?.studentId === entry.studentId && selectedEntry?.sessionNumber === entry.sessionNumber ? (
                  <div className="space-y-2">
                    <textarea 
                      value={adminRemark} 
                      onChange={(e) => setAdminRemark(e.target.value)}
                      placeholder="Write your remark here..."
                      className="w-full p-3 border-2 border-purple-300 rounded-xl text-sm"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAdminRemarkSubmit(entry)}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-2 font-bold text-sm disabled:opacity-50"
                      >
                        {loading ? 'Saving...' : 'Save Remark'}
                      </button>
                      <button 
                        onClick={() => { setSelectedEntry(null); setAdminRemark(''); }}
                        className="px-4 bg-gray-200 text-gray-700 rounded-xl py-2 font-bold text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setSelectedEntry(entry); setAdminRemark(entry.adminRemark || ''); }}
                    className="w-full bg-purple-100 text-purple-600 rounded-xl py-2 font-bold text-sm hover:bg-purple-200"
                  >
                    {entry.adminRemark ? 'Edit Remark' : 'Add Remark'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Show celebration modal if all badges unlocked
  if (showCelebration) {
    return <CelebrationModal />;
  }

  return null;
};

export default App;
// redeploy
