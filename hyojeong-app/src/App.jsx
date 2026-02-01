import React, { useState, useEffect } from 'react';
import { Home, User, BookOpen, Award, ChevronRight, Calendar, TrendingUp, Users, Heart, MessageSquare, RefreshCw, Trophy, ArrowLeft, X, Sparkles, Gift, Target, UserPlus } from 'lucide-react';

// Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbypzDlCOSiRvwOceWsOESFpwCO1U5fHAjywlWeHgE20Nl6UFBFsfPODmPUp3Osms1NNnw/exec';
const TOTAL_SESSIONS = 8; // Change this number for each program// Inspirational Quotes - True Parents & Bible Verses
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

// Achievement Badges
const BADGES = [
  { id: 'grateful_heart', name: 'Grateful Heart', icon: '💛', desc: '5 gratitude entries', type: 'gratitude', count: 5, color: 'from-pink-400 to-rose-400' },
  { id: 'grateful_soul', name: 'Overflowing Heart', icon: '💖', desc: '10 gratitude entries', type: 'gratitude', count: 10, color: 'from-purple-400 to-pink-400' },
  { id: 'perfect_attendance', name: 'Faithful Heart', icon: '💜', desc: '100% attendance', type: 'attendance', percent: 100, color: 'from-blue-400 to-cyan-400' },
  { id: 'dedicated_learner', name: 'Blossoming Spirit', icon: '🌸', desc: '90%+ attendance', type: 'attendance', percent: 90, color: 'from-indigo-400 to-blue-400' },
  { id: 'service_star', name: 'Serving Heart', icon: '💙', desc: 'Complete service', type: 'service', points: 1, color: 'from-green-400 to-emerald-400' },
  { id: 'scholar', name: 'Seeking Heart', icon: '🧡', desc: '90%+ quiz', type: 'quiz', score: 1.8, color: 'from-yellow-400 to-orange-400' },
  { id: 'rising_star', name: 'Growing Heart', icon: '💚', desc: '80%+ grade', type: 'grade', percent: 80, color: 'from-cyan-400 to-teal-400' },
  { id: 'excellence', name: 'Shining Heart', icon: '✨', desc: '90%+ grade', type: 'grade', percent: 90, color: 'from-yellow-400 to-yellow-500' },
  { id: 'super_achiever', name: 'First Seed Planted', icon: '🌱', desc: '100 points', type: 'points', count: 100, color: 'from-purple-500 to-indigo-500' },
  { id: 'loving_heart', name: 'Loving Heart', icon: '❤️', desc: 'All 3 goals set', type: 'goals', goalsSet: 3, color: 'from-red-400 to-pink-400' }
];

const App = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
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
  const [selectedStudentProgress, setSelectedStudentProgress] = useState(null);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    address: '',
    category: '',
    photoUrl: ''
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
  const [tempAffirmation, setTempAffirmation] = useState('');
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    dateOfBirth: '',
    address: '',
    photoUrl: ''
  });

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

  const loadMyGratitudeEntries = async (studId) => {
    try {
      const response = await fetch(`${API_URL}?action=getMyGratitudeEntries&studentId=${studId}`);
      const data = await response.json();
      if (data.success) {
        setMyGratitudeEntries(data.entries);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const loadStudentProgress = async (studId) => {
    try {
      const response = await fetch(`${API_URL}?action=getStudentProgress&studentId=${studId}`);
      const data = await response.json();
      if (data.success && data.progress) {
        setPoints(data.progress.totalPoints || 0);
        setEarnedBadges(data.progress.badgesEarned || []);
        setAffirmation(data.progress.affirmation || '');
        setGoals({
          goal1: data.progress.goal1 || '',
          goal2: data.progress.goal2 || '',
          goal3: data.progress.goal3 || '',
          goal1Status: data.progress.goal1Status || 'Not Set',
          goal2Status: data.progress.goal2Status || 'Not Set',
          goal3Status: data.progress.goal3Status || 'Not Set'
        });
      } else {
        setPoints(0);
        setEarnedBadges([]);
        setAffirmation('');
        setGoals({ goal1: '', goal2: '', goal3: '', goal1Status: 'Not Set', goal2Status: 'Not Set', goal3Status: 'Not Set' });
      }
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
      await fetch(`${API_URL}?action=updateProgress`, {
        method: 'POST',
        body: JSON.stringify({ studentId: studentData['Student ID'], ...updates })
      });
      
      if (updates.addPoints) {
        setPoints(p => p + updates.addPoints);
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
    if (!tempAffirmation.trim()) {
      alert('Please write your affirmation');
      return;
    }
    if (tempAffirmation.length > 100) {
      alert('Please keep your affirmation under 100 characters');
      return;
    }
    await updateProgress({ affirmation: tempAffirmation.trim() });
    setAffirmation(tempAffirmation.trim());
    setEditingAffirmation(false);
    alert('✨ Affirmation saved!');
  };

  const handleEditAffirmation = () => {
    setTempAffirmation(affirmation);
    setEditingAffirmation(true);
  };

  const handleCancelAffirmation = () => {
    setEditingAffirmation(false);
    setTempAffirmation(affirmation);
  };

  const loadStudentProgressForAdmin = async (studId) => {
    try {
      const response = await fetch(`${API_URL}?action=getStudentProgress&studentId=${studId}`);
      const data = await response.json();
      if (data.success && data.progress) {
        setSelectedStudentProgress(data.progress);
      } else {
        setSelectedStudentProgress(null);
      }
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
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=addNewStudent`, {
        method: 'POST',
        body: JSON.stringify(newStudent)
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Student added successfully!\n\nStudent ID: ${data.studentId}\nPassword: ${data.password}\n\n⚠️ Please save this password! The student will need it to log in.`);
        setNewStudent({ firstName: '', lastName: '', dateOfBirth: '', age: '', address: '', category: '', photoUrl: '' });
        setShowAddStudentForm(false);
        await loadStudents(); // Refresh student list
      } else {
        alert('Failed to add student: ' + data.error);
      }
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
      photoUrl: studentData['Photo'] || ''
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?action=updateStudentInfo`, {
        method: 'POST',
        body: JSON.stringify({
          studentId: studentData['Student ID'],
          dateOfBirth: tempProfile.dateOfBirth,
          address: tempProfile.address,
          photoUrl: tempProfile.photoUrl
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Update local student data
        setStudentData(prev => ({
          ...prev,
          'Date of Birth': tempProfile.dateOfBirth,
          'Address': tempProfile.address,
          'Photo': tempProfile.photoUrl,
          'Age': data.age,
          'Category': data.category
        }));
        setEditingProfile(false);
        alert('✅ Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + data.error);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
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
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    const searchId = studentId.trim().toUpperCase();
    const student = allStudents.find(s => (s['Student ID'] || '').toString().trim().toUpperCase() === searchId);
    
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
    
    setStudentData(student); 
    setIsAdmin(false); 
    setCurrentPage('home');
    loadMyGratitudeEntries(student['Student ID']);
    loadStudentProgress(student['Student ID']);
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
    setPassword('');
    setIsAdmin(false); 
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
        await updateProgress({ addPoints: 10 });
        alert('✨ Gratitude journal submitted! +10 points earned!'); 
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
  
  if (student.sessions && Array.isArray(student.sessions)) {
    const attended = student.sessions.filter(s => s === true).length;
    const total = TOTAL_SESSIONS; // Use configured total instead of array length
    return Math.round((attended / total) * 100);
  }
  
  const att = student['HJ Attendance'];
  if (typeof att === 'number') return Math.round(att * 100);
  return 0;
};

  const checkIfBadgeEarned = (badge) => {
    if (!studentData) return false;
    if (earnedBadges.includes(badge.id)) return true;
    
    const gratitudeCount = myGratitudeEntries.length;
    const attendance = calculateAttendance();
    const grade = Math.round((studentData['HJ Grade'] || 0) * 100);
    const quiz = studentData['HJ Quiz'] || 0;
    const service = studentData['HJ Service'] || 0;
    
    if (badge.type === 'gratitude') return gratitudeCount >= badge.count;
    if (badge.type === 'attendance') return attendance >= badge.percent;
    if (badge.type === 'service') return service >= badge.points;
    if (badge.type === 'quiz') return quiz >= badge.score;
    if (badge.type === 'grade') return grade >= badge.percent;
    if (badge.type === 'points') return points >= badge.count;
    if (badge.type === 'goals') {
      const goalsSet = [goals.goal1, goals.goal2, goals.goal3].filter(g => g && g.trim()).length;
      return goalsSet >= badge.goalsSet;
    }
    
    return false;
  };

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-300 shadow-lg z-50">
      <div className="flex justify-around items-center py-3">
        {[
          { page: 'home', icon: Home, label: 'Home' }, 
          { page: 'badges', icon: Award, label: 'Hearts' }, 
          { page: 'gratitude', icon: Heart, label: 'Journal' }, 
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
    const textareaRef = React.useRef(null);

    React.useEffect(() => {
      if (editingAffirmation && textareaRef.current) {
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
        textareaRef.current.focus();
      }
    }, [editingAffirmation]);

    if (editingAffirmation) {
      return (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-4 border-yellow-200 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-black text-gray-800">My Weekly Affirmation</h3>
          </div>
          <textarea
            ref={textareaRef}
            value={tempAffirmation}
            onChange={(e) => setTempAffirmation(e.target.value)}
            placeholder="I am a Filial Child of Heavenly Parents and True Parents"
            maxLength={100}
            className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300 mb-3 resize-none"
            rows="3"
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{tempAffirmation.length}/100</span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelAffirmation}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAffirmation}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold"
              >
                Save
              </button>
            </div>
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
            {affirmation ? 'Edit' : 'Set'}
          </button>
        </div>
        {affirmation ? (
          <p className="text-gray-700 font-bold text-lg italic">"{affirmation}"</p>
        ) : (
          <p className="text-gray-500 italic">Set your weekly positive affirmation to inspire yourself!</p>
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
        </div>
      </div>
    </div>
  );

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
          <h2 className="text-2xl font-black text-white mb-2">Admin Access</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Enter Password</h2>
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

  // HOME PAGE - REDESIGNED
  if (currentPage === 'home' && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
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

          <WeeklyAffirmation />

          {/* PROMINENT GROWTH CARD - REDESIGNED */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6 border-4 border-white relative overflow-hidden transform hover:scale-105 transition-all duration-300">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
            
            {/* Animated background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
            
            <div className="relative z-10">
              {/* Icon with animation */}
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl p-4 shadow-2xl animate-bounce-slow">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
              </div>
              
              {/* Label */}
              <div className="text-center mb-2">
                <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Your Growth</p>
              </div>
              
              {/* Main percentage - VERY LARGE */}
              <div className="text-center mb-4">
                <p className="text-8xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Math.round((studentData['HJ Grade'] || 0) * 100)}%
                </p>
              </div>
              
              {/* Subtitle */}
              <div className="text-center mb-6">
                <p className="text-lg font-semibold text-gray-700">Keep up the amazing progress!</p>
              </div>
              
              {/* Progress bar with animation */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                  style={{ width: `${Math.round((studentData['HJ Grade'] || 0) * 100)}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => setCurrentPage('badges')} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <span className="font-bold">My Hearts ({earnedBadges.length}/{BADGES.length})</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentPage('gratitude')} className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <span className="font-bold">Heart Journal</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentPage('grades')} className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                <span className="font-bold">View My Grades</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={() => setCurrentPage('profile')} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-6 h-6" />
                <span className="font-bold">My Profile</span>
              </div>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Add shimmer animation to CSS */}
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
          }
        `}</style>
        
        <NavBar />
      </div>
    );
  }

  // ... rest of the pages remain unchanged (BADGES, GRATITUDE, GRADES, PROFILE, ADMIN pages)
  // For brevity, I'm not repeating all the other pages, but they would stay exactly the same as your original code

  return null;
};

export default App;
