import React, { useState, useEffect } from 'react';
import { Home, User, CheckSquare, BookOpen, Award, ChevronRight, Calendar, TrendingUp, Users, Heart, MessageSquare, RefreshCw, Trophy, ArrowLeft, X, Star, Target, Gift, Sparkles } from 'lucide-react';

// Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbzCpdW06VEvlPsJjOZqkpWseXlnqouYrJ-gmwkoV7vlMrbuRHMx20A0w2aRd4VHnhBEmg/exec';

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

// Achievement Badges
const BADGES = [
  { id: 'grateful_heart', name: 'Grateful Heart', icon: '⭐', desc: '5 gratitude entries', type: 'gratitude', count: 5, color: 'from-pink-400 to-rose-400' },
  { id: 'grateful_soul', name: 'Grateful Soul', icon: '🌟', desc: '10 gratitude entries', type: 'gratitude', count: 10, color: 'from-purple-400 to-pink-400' },
  { id: 'perfect_attendance', name: 'Perfect Attendance', icon: '📅', desc: '100% attendance', type: 'attendance', percent: 100, color: 'from-blue-400 to-cyan-400' },
  { id: 'dedicated_learner', name: 'Dedicated', icon: '📚', desc: '90%+ attendance', type: 'attendance', percent: 90, color: 'from-indigo-400 to-blue-400' },
  { id: 'service_star', name: 'Service Star', icon: '🤝', desc: 'Complete service', type: 'service', points: 1, color: 'from-green-400 to-emerald-400' },
  { id: 'scholar', name: 'Scholar', icon: '🎓', desc: '90%+ quiz', type: 'quiz', score: 1.8, color: 'from-yellow-400 to-orange-400' },
  { id: 'rising_star', name: 'Rising Star', icon: '✨', desc: '80%+ grade', type: 'grade', percent: 80, color: 'from-cyan-400 to-teal-400' },
  { id: 'excellence', name: 'Excellence', icon: '🏆', desc: '90%+ grade', type: 'grade', percent: 90, color: 'from-yellow-400 to-yellow-500' },
  { id: 'super_achiever', name: 'Super Achiever', icon: '💫', desc: '500 points', type: 'points', count: 500, color: 'from-purple-500 to-indigo-500' }
];

const getDailyQuote = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return QUOTES[dayOfYear % QUOTES.length];
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [allGratitudeEntries, setAllGratitudeEntries] = useState([]);
  const [myGratitudeEntries, setMyGratitudeEntries] = useState([]);
  const [adminRemark, setAdminRemark] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  
  // New spiritual growth states
  const [points, setPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [goals, setGoals] = useState({ goal1: '', goal2: '', goal3: '', goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set' });
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=getStudents`);
      const data = await response.json();
      if (data.success) {
        setAllStudents(data.students);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentProgress = async (studId) => {
    try {
      const response = await fetch(`${API_URL}?action=getStudentProgress&studentId=${studId}`);
      const data = await response.json();
      if (data.success && data.progress) {
        setPoints(data.progress.totalPoints || 0);
        setEarnedBadges(data.progress.badgesEarned || []);
        setGoals({
          goal1: data.progress.goal1 || '',
          goal2: data.progress.goal2 || '',
          goal3: data.progress.goal3 || '',
          goal1Status: data.progress.goal1Status || 'Not Set',
          goal2Status: data.progress.goal2Status || 'Not Set',
          goal3Status: data.progress.goal3Status || 'Not Set'
        });
      }
    } catch (err) {
      console.error('Error loading progress:', err);
    }
  };

  const updateProgress = async (updates) => {
    try {
      await fetch(`${API_URL}?action=updateProgress`, {
        method: 'POST',
        body: JSON.stringify({ studentId: studentData['Student ID'], ...updates })
      });
      
      if (updates.addPoints) setPoints(p => p + updates.addPoints);
      if (updates.addBadge && !earnedBadges.includes(updates.addBadge)) {
        setEarnedBadges(b => [...b, updates.addBadge]);
        const badge = BADGES.find(b => b.id === updates.addBadge);
        if (badge) {
          setShowBadgeUnlock(badge);
          setTimeout(() => setShowBadgeUnlock(null), 3000);
        }
      }
    } catch (err) {
      console.error('Error updating progress:', err);
    }
  };

  const checkAndAwardBadges = () => {
    const gratitudeCount = myGratitudeEntries.length;
    const attendance = calculateAttendance();
    const grade = Math.round((studentData['HJ Grade'] || 0) * 100);
    const quiz = studentData['HJ Quiz'] || 0;
    const service = studentData['HJ Service'] || 0;

    BADGES.forEach(badge => {
      if (earnedBadges.includes(badge.id)) return;
      
      let earned = false;
      if (badge.type === 'gratitude' && gratitudeCount >= badge.count) earned = true;
      if (badge.type === 'attendance' && attendance >= badge.percent) earned = true;
      if (badge.type === 'service' && service >= badge.points) earned = true;
      if (badge.type === 'quiz' && quiz >= badge.score) earned = true;
      if (badge.type === 'grade' && grade >= badge.percent) earned = true;
      if (badge.type === 'points' && points >= badge.count) earned = true;
      
      if (earned) {
        updateProgress({ addBadge: badge.id, addPoints: 25 });
      }
    });
  };

  const loadMyGratitudeEntries = async (studId) => {
    try {
      const response = await fetch(`${API_URL}?action=getMyGratitudeEntries&studentId=${studId}`);
      const data = await response.json();
      if (data.success) {
        setMyGratitudeEntries(data.entries);
        // Check badges after loading entries
        setTimeout(() => checkAndAwardBadges(), 1000);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadAllGratitudeEntries = async (session) => {
    try {
      setLoading(true);
      const sessionToLoad = session || 'Session 1';
      const response = await fetch(`${API_URL}?action=getGratitudeEntries&session=${sessionToLoad}`);
      const data = await response.json();
      if (data.success) {
        setAllGratitudeEntries(data.entries);
      }
    } catch (err) {
      console.error('Error:', err);
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

  const handleLogin = () => {
    setError('');
    if (!studentId.trim()) { 
      setError('Please enter your Student ID'); 
      return; 
    }
    if (studentId.toUpperCase() === 'ADMIN') { 
      setCurrentPage('admin-login'); 
      return; 
    }
    const searchId = studentId.trim().toUpperCase();
    const student = allStudents.find(s => (s['Student ID'] || '').toString().trim().toUpperCase() === searchId);
    if (student) { 
      setStudentData(student); 
      setIsAdmin(false); 
      setCurrentPage('home');
      loadMyGratitudeEntries(student['Student ID']);
      loadStudentProgress(student['Student ID']);
    } else { 
      setError('Student ID not found. Please check and try again.'); 
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'hjadmin2026') { 
      setIsAdmin(true); 
      setCurrentPage('admin-dashboard'); 
      setSelectedSessionFilter('Session 1');
      loadAllGratitudeEntries('Session 1');
    } else { 
      setError('Incorrect admin password'); 
    }
  };

  const handleLogout = () => { 
    setStudentData(null); 
    setStudentId(''); 
    setIsAdmin(false); 
    setAdminPassword(''); 
    setCurrentPage('login');
    setMyGratitudeEntries([]);
    setAllGratitudeEntries([]);
    setSelectedStudentDetail(null);
    setPoints(0);
    setEarnedBadges([]);
    setGoals({ goal1: '', goal2: '', goal3: '', goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set' });
  };

  const handleGratitudeSubmit = async () => {
    if (!gratitudeText.trim() || !selectedSession) { 
      setError('Please select a session and write your gratitude journal'); 
      return; 
    }
    try {
      setLoading(true);
      const submission = { 
        studentId: studentData['Student ID'], 
        studentName: `${studentData['First Name']} ${studentData['Last Name']}`, 
        session: selectedSession, 
        content: gratitudeText, 
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(`${API_URL}?action=submitGratitude`, {
        method: 'POST',
        body: JSON.stringify(submission)
      });
      
      const data = await response.json();
      if (data.success) {
        // Award 10 points for gratitude submission
        await updateProgress({ addPoints: 10 });
        
        alert('✨ Gratitude journal submitted! +10 points earned!'); 
        setGratitudeText(''); 
        setSelectedSession(''); 
        await loadMyGratitudeEntries(studentData['Student ID']);
        // Badges will be checked automatically after loading entries
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
      const remarkData = {
        session: entry.session,
        rowIndex: entry.rowIndex,
        remark: adminRemark
      };
      
      const response = await fetch(`${API_URL}?action=addRemark`, {
        method: 'POST',
        body: JSON.stringify(remarkData)
      });
      
      const data = await response.json();
      if (data.success) {
        alert('✅ Remark saved!');
        setAdminRemark('');
        setSelectedEntry(null);
        loadAllGratitudeEntries(selectedSessionFilter);
      } else {
        alert('Failed to save remark: ' + data.error);
      }
    } catch (err) {
      console.error('Error saving remark:', err);
      alert('Failed to save remark');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async (newGoals) => {
    await updateProgress({ 
      goal1: newGoals.goal1, 
      goal1Status: newGoals.goal1 ? 'In Progress' : 'Not Set',
      goal2: newGoals.goal2, 
      goal2Status: newGoals.goal2 ? 'In Progress' : 'Not Set',
      goal3: newGoals.goal3, 
      goal3Status: newGoals.goal3 ? 'In Progress' : 'Not Set',
      addPoints: 5
    });
    setGoals({
      goal1: newGoals.goal1,
      goal2: newGoals.goal2,
      goal3: newGoals.goal3,
      goal1Status: newGoals.goal1 ? 'In Progress' : 'Not Set',
      goal2Status: newGoals.goal2 ? 'In Progress' : 'Not Set',
      goal3Status: newGoals.goal3 ? 'In Progress' : 'Not Set'
    });
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
    // Check badges after completing goal
    setTimeout(() => checkAndAwardBadges(), 500);
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
    const sizeClasses = { sm: 'w-12 h-12 text-lg', md: 'w-16 h-16 text-2xl', lg: 'w-32 h-32 text-5xl' };
    if (url && !imageError) return <img src={url} alt={`${firstName}`} className={`${sizeClasses[size]} rounded-xl object-cover border-4 border-white shadow-lg`} onError={() => setImageError(true)} />;
    return <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${getColorFromName(firstName, lastName)} flex items-center justify-center border-4 border-white shadow-lg`}><span className="font-black text-white">{initials}</span></div>;
  };

  const calculateAttendance = (student = studentData) => {
    if (!student) return 0;
    const att = student['HJ Attendance'];
    if (typeof att === 'number') return Math.round(att * 100);
    return 0;
  };

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-300 shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        {[
          { page: 'home', icon: Home, label: 'Home' }, 
          { page: 'badges', icon: Award, label: 'Badges' }, 
          { page: 'gratitude', icon: Heart, label: 'Gratitude' }, 
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

  // Badge Unlock Notification
  const BadgeUnlockNotification = ({ badge }) => {
    if (!badge) return null;
    return (
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
        <div className={`bg-gradient-to-r ${badge.color} p-6 rounded-2xl shadow-2xl border-4 border-white`}>
          <div className="text-center">
            <div className="text-6xl mb-2">{badge.icon}</div>
            <p className="text-white font-black text-xl mb-1">Badge Unlocked!</p>
            <p className="text-white font-bold">{badge.name}</p>
            <p className="text-white/90 text-sm">+25 bonus points!</p>
          </div>
        </div>
      </div>
    );
  };

  // Daily Quote Component
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

  // LOGIN PAGE
  if (currentPage === 'login') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Award className="w-14 h-14 text-purple-600" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Hyojeong Youth</h1>
          <p className="text-white text-lg font-bold">Caraga 2026</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Welcome Back!</h2>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading students...</p>
            </div>
          ) : (
            <>
              <input 
                type="text" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()} 
                placeholder="Enter your Student ID (e.g., HJ001)" 
                className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4" 
              />
              {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
              <button onClick={handleLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all">
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ADMIN LOGIN PAGE
  if (currentPage === 'admin-login') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Admin Login</h2>
          <input 
            type="password" 
            value={adminPassword} 
            onChange={(e) => setAdminPassword(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()} 
            placeholder="Enter admin password" 
            className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4" 
          />
          {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
          <button onClick={handleAdminLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg mb-2">
            Login as Admin
          </button>
          <button onClick={() => { setCurrentPage('login'); setAdminPassword(''); setError(''); }} className="w-full px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg">
            Back
          </button>
        </div>
      </div>
    </div>
  );

  // ADMIN DASHBOARD
  if (currentPage === 'admin-dashboard' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <button onClick={handleLogout} className="text-white font-bold bg-white/20 px-4 py-2 rounded-xl">Logout</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-purple-200">
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600 font-bold">Total Students</p>
            <p className="text-3xl font-black text-purple-600">{allStudents.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-pink-200">
            <MessageSquare className="w-8 h-8 text-pink-600 mb-2" />
            <p className="text-sm text-gray-600 font-bold">Gratitude Entries</p>
            <p className="text-3xl font-black text-pink-600">{allGratitudeEntries.length}</p>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={() => setCurrentPage('admin-students')} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
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
          <button onClick={() => setCurrentPage('admin-gratitude')} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6" />
              <span className="font-bold">View Gratitude Journals</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
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
                      <p className="text-2xl font-black text-purple-600">{Math.round((student['HJ Grade'] || 0) * 100)}%</p>
                      <p className="text-xs text-gray-500">Overall Grade</p>
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
                      <p className="text-2xl font-black text-blue-600">{Math.round((student['HJ Grade'] || 0) * 100)}%</p>
                      <p className="text-xs text-gray-500">Overall Grade</p>
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

  // STUDENT DETAIL MODAL
  const StudentDetailModal = ({ student, onClose }) => {
    if (!student) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="lg" />
              <div className="text-white">
                <h2 className="text-3xl font-black">{student['First Name']} {student['Last Name']}</h2>
                <p className="text-xl font-bold opacity-90">{student['Student ID']}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-600 font-bold mb-1">Overall Grade</p>
              <p className="text-5xl font-black text-purple-600">{Math.round((student['HJ Grade'] || 0) * 100)}%</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-xs text-gray-600 font-bold">Attendance</p>
                <p className="text-2xl font-black text-blue-600">{calculateAttendance(student)}%</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                <BookOpen className="w-8 h-8 text-purple-600 mb-2" />
                <p className="text-xs text-gray-600 font-bold">Quiz Score</p>
                <p className="text-2xl font-black text-purple-600">{Math.round((student['HJ Quiz'] || 0) * 100) / 100}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <Award className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-xs text-gray-600 font-bold">Service Hours</p>
                <p className="text-2xl font-black text-green-600">{Math.round((student['HJ Service'] || 0) * 100) / 100}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
                <TrendingUp className="w-8 h-8 text-orange-600 mb-2" />
                <p className="text-xs text-gray-600 font-bold">Progress</p>
                <p className="text-2xl font-black text-orange-600">{Math.round((student['Percentage'] || 0) * 100)}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-gray-800 mb-3">Personal Information</h3>
              {student['Age'] && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-bold">Age</p>
                  <p className="text-sm font-bold text-gray-800">{student['Age']} years old</p>
                </div>
              )}
              {student['Address'] && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-bold">Address</p>
                  <p className="text-sm font-bold text-gray-800">{student['Address']}</p>
                </div>
              )}
              {student['Category'] && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 font-bold">Category</p>
                  <p className="text-sm font-bold text-gray-800">{student['Category']}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ADMIN STUDENTS LIST
  if (currentPage === 'admin-students' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      {selectedStudentDetail && (
        <StudentDetailModal 
          student={selectedStudentDetail} 
          onClose={() => setSelectedStudentDetail(null)} 
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">All Students</h1>
        </div>
        <div className="space-y-3">
          {allStudents.map((student, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedStudentDetail(student)}
              className="bg-white rounded-2xl shadow-lg p-4 border-4 border-white cursor-pointer hover:border-purple-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="sm" />
                <div className="flex-1">
                  <p className="font-black text-gray-800">{student['First Name']} {student['Last Name']}</p>
                  <p className="text-sm text-purple-600 font-bold">{student['Student ID']}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">{student['Category']}</p>
                  <p className="text-sm font-bold text-purple-600">{Math.round((student['HJ Grade'] || 0) * 100)}%</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ADMIN GRATITUDE JOURNALS
  if (currentPage === 'admin-gratitude' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">Gratitude Journals</h1>
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
                {selectedEntry?.rowIndex === entry.rowIndex ? (
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

  // HOME PAGE
  if (currentPage === 'home' && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <BadgeUnlockNotification badge={showBadgeUnlock} />
        <div className="p-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border-4 border-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={studentData['Photo']} size="md" />
                <div>
                  <h2 className="text-lg font-black text-gray-800">{studentData['First Name']} {studentData['Last Name']}</h2>
                  <p className="text-sm text-purple-600 font-bold">{studentData['Student ID']}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm text-gray-500 font-semibold">Logout</button>
            </div>
          </div>

          <DailyQuote />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-bold">My Points</p>
                  <p className="text-3xl font-black text-yellow-600">{points}</p>
                </div>
                <Gift className="w-10 h-10 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-green-200">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <p className="text-sm text-gray-600 font-bold">Grade</p>
              <p className="text-3xl font-black text-green-600">{Math.round((studentData['HJ Grade'] || 0) * 100)}%</p>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => setCurrentPage('badges')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <span className="font-bold">My Badges ({earnedBadges.length}/{BADGES.length})</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentPage('gratitude')} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <span className="font-bold">Gratitude Journal</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentPage('profile')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <span className="font-bold">My Profile</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // BADGES PAGE
  if (currentPage === 'badges' && studentData) {
    const checkBadgeEarned = (badge) => {
      if (earnedBadges.includes(badge.id)) return true;
      
      if (badge.type === 'gratitude') return myGratitudeEntries.length >= badge.count;
      if (badge.type === 'attendance') return calculateAttendance() >= badge.percent;
      if (badge.type === 'service') return studentData['HJ Service'] >= badge.points;
      if (badge.type === 'quiz') return studentData['HJ Quiz'] >= badge.score;
      if (badge.type === 'grade') return Math.round((studentData['HJ Grade'] || 0) * 100) >= badge.percent;
      if (badge.type === 'points') return points >= badge.count;
      
      return false;
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4">🏅 My Badges</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
            <div className="text-center">
              <p className="text-gray-600 font-bold mb-2">Badges Collected</p>
              <p className="text-6xl font-black text-purple-600 mb-2">{earnedBadges.length}/{BADGES.length}</p>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(earnedBadges.length / BADGES.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {BADGES.map((badge) => {
              const earned = checkBadgeEarned(badge);
              return (
                <div 
                  key={badge.id}
                  className={`rounded-2xl p-6 shadow-lg border-4 ${
                    earned 
                      ? `bg-gradient-to-br ${badge.color} border-white` 
                      : 'bg-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-3">{badge.icon}</div>
                    <p className={`text-sm font-black mb-1 ${earned ? 'text-white' : 'text-gray-600'}`}>
                      {badge.name}
                    </p>
                    <p className={`text-xs ${earned ? 'text-white/90' : 'text-gray-500'}`}>
                      {badge.desc}
                    </p>
                    {earned && (
                      <div className="mt-2 bg-white/20 rounded-full px-3 py-1">
                        <p className="text-xs font-bold text-white">✓ Unlocked!</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <NavBar />
      </div>
    );
  }

  // PROFILE PAGE (with Growth Goals)
  if (currentPage === 'profile' && studentData) {
    const [editingGoals, setEditingGoals] = useState(false);
    const [newGoals, setNewGoals] = useState({ goal1: goals.goal1, goal2: goals.goal2, goal3: goals.goal3 });

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4">My Profile</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4 mb-4">
            <div className="flex justify-center">
              <Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={studentData['Photo']} size="lg" />
            </div>
            <div className="space-y-3">
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-sm text-gray-600 font-bold">Name</p>
                <p className="text-lg font-black">{studentData['First Name']} {studentData['Last Name']}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-sm text-gray-600 font-bold">Student ID</p>
                <p className="text-lg font-black">{studentData['Student ID']}</p>
              </div>
              {studentData['Age'] && (
                <div className="bg-green-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 font-bold">Age</p>
                  <p className="text-lg font-black">{studentData['Age']} years old</p>
                </div>
              )}
              {studentData['Category'] && (
                <div className="bg-indigo-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 font-bold">Category</p>
                  <p className="text-lg font-black">{studentData['Category']}</p>
                </div>
              )}
            </div>
          </div>

          {/* Growth Goals Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-black text-gray-800">🌱 My Growth Goals</h3>
              </div>
              {!editingGoals && (
                <button 
                  onClick={() => { setEditingGoals(true); setNewGoals({ goal1: goals.goal1, goal2: goals.goal2, goal3: goals.goal3 }); }}
                  className="text-sm text-purple-600 font-bold"
                >
                  {goals.goal1 ? 'Edit' : 'Set Goals'}
                </button>
              )}
            </div>
            
            {editingGoals ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Goal 1 (e.g., Read Bible daily)"
                  value={newGoals.goal1}
                  onChange={(e) => setNewGoals({...newGoals, goal1: e.target.value})}
                  className="w-full px-3 py-3 border-2 border-purple-300 rounded-xl font-semibold"
                />
                <input
                  type="text"
                  placeholder="Goal 2 (e.g., Pray for 10 minutes)"
                  value={newGoals.goal2}
                  onChange={(e) => setNewGoals({...newGoals, goal2: e.target.value})}
                  className="w-full px-3 py-3 border-2 border-purple-300 rounded-xl font-semibold"
                />
                <input
                  type="text"
                  placeholder="Goal 3 (e.g., Serve others weekly)"
                  value={newGoals.goal3}
                  onChange={(e) => setNewGoals({...newGoals, goal3: e.target.value})}
                  className="w-full px-3 py-3 border-2 border-purple-300 rounded-xl font-semibold"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => { 
                      handleSaveGoals(newGoals); 
                      setEditingGoals(false); 
                    }} 
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl py-3 font-bold"
                  >
                    Save Goals (+5 points)
                  </button>
                  <button 
                    onClick={() => setEditingGoals(false)} 
                    className="px-4 bg-gray-200 text-gray-700 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  {text: goals.goal1, status: goals.goal1Status, num: 1},
                  {text: goals.goal2, status: goals.goal2Status, num: 2},
                  {text: goals.goal3, status: goals.goal3Status, num: 3}
                ].map((goal, idx) => (
                  <div key={idx} className={`p-4 rounded-xl ${goal.status === 'Completed' ? 'bg-green-50 border-2 border-green-300' : 'bg-purple-50 border-2 border-purple-200'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{goal.text || `Goal ${idx + 1} not set`}</p>
                        <p className="text-xs text-gray-600 mt-1">{goal.status}</p>
                      </div>
                      {goal.text && goal.status !== 'Completed' && (
                        <button
                          onClick={() => handleCompleteGoal(goal.num)}
                          className="ml-3 bg-green-500 text-white px-4 py-2 rounded-xl font-bold text-sm"
                        >
                          ✓ Complete
                        </button>
                      )}
                      {goal.status === 'Completed' && <span className="text-3xl ml-3">🎉</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grades Card */}
          <button onClick={() => setCurrentPage('grades')} className="w-full bg-white rounded-2xl shadow-lg p-6 border-4 border-white">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600 font-bold mb-1">Overall Grade</p>
                <p className="text-4xl font-black text-purple-600">{Math.round((studentData['HJ Grade'] || 0) * 100)}%</p>
              </div>
              <ChevronRight className="w-8 h-8 text-gray-400" />
            </div>
          </button>
        </div>
        <NavBar />
      </div>
    );
  }

  // GRATITUDE JOURNAL PAGE
  if (currentPage === 'gratitude' && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4">📝 Gratitude Journal</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-pink-500" />
              <h2 className="text-xl font-black text-gray-800">Write New Entry</h2>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Session</label>
              <select 
                value={selectedSession} 
                onChange={(e) => setSelectedSession(e.target.value)} 
                className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-purple-300"
              >
                <option value="">Choose session...</option>
                {[...Array(20)].map((_, i) => (
                  <option key={i} value={`Session ${i + 1}`}>Session {i + 1}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">What are you grateful for today?</label>
              <textarea 
                value={gratitudeText} 
                onChange={(e) => setGratitudeText(e.target.value)} 
                placeholder="Share your gratitude, reflections, or learnings from this session..." 
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
              {loading ? 'Submitting...' : '✨ Submit Gratitude (+10 points)'}
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
        <NavBar />
      </div>
    );
  }

  // GRADES PAGE
  if (currentPage === 'grades' && studentData) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <h1 className="text-3xl font-black text-white mb-4">📊 My Grades</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-bold mb-2">Overall Grade</p>
            <div className="text-6xl font-black text-purple-600 mb-2">
              {Math.round((studentData['HJ Grade'] || 0) * 100)}%
            </div>
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full">
              <p className="text-sm font-bold text-purple-600">
                {Math.round((studentData['HJ Grade'] || 0) * 100) >= 90 ? '🌟 Excellent!' : 
                 Math.round((studentData['HJ Grade'] || 0) * 100) >= 80 ? '✨ Great Job!' : 
                 Math.round((studentData['HJ Grade'] || 0) * 100) >= 70 ? '👍 Good!' : 
                 '💪 Keep Going!'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">📅 Attendance</p>
                <p className="text-3xl font-black text-blue-600">{calculateAttendance()}%</p>
                <p className="text-xs text-gray-500 mt-1">Sessions attended</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">📝 Quiz Scores</p>
                <p className="text-3xl font-black text-purple-600">{Math.round((studentData['HJ Quiz'] || 0) * 100) / 100}</p>
              </div>
              <BookOpen className="w-12 h-12 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">🤝 Service Hours</p>
                <p className="text-3xl font-black text-green-600">{Math.round((studentData['HJ Service'] || 0) * 100) / 100}</p>
                <p className="text-xs text-gray-500 mt-1">Points earned</p>
              </div>
              <Award className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-bold mb-1">📈 Progress</p>
                <p className="text-3xl font-black text-orange-600">{Math.round((studentData['Percentage'] || 0) * 100)}%</p>
                <p className="text-xs text-gray-500 mt-1">Tasks completed</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );

  return null;
};

export default App;
