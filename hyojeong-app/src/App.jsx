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
    
    // Calculate grade the same way as Growth Journey (average of 4 metrics)
    const quiz = studentData['HJ Quiz'] || 0;
    const service = studentData['HJ Service'] || 0;
    const gratitudePercent = Math.round((myGratitudeEntries.length / 8) * 100);
    const grade = Math.round((attendance + quiz + service + gratitudePercent) / 4);
    
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
              {/* Animated Growing Plant */}
              <div className="flex justify-center mb-4">
                <div className="relative" style={{ 
                  transform: `scale(${0.5 + (Math.round((studentData['HJ Grade'] || 0) * 100) / 100) * 0.5})`,
                  transition: 'transform 1s ease-out'
                }}>
                  {/* Pot */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-12 bg-gradient-to-b from-orange-400 to-orange-600 rounded-b-2xl shadow-lg" 
                       style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}>
                  </div>
                  
                  {/* Soil */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-lg"></div>
                  
                  {/* Stem */}
                  <div className="relative flex flex-col items-center animate-grow">
                    <div className="w-2 bg-gradient-to-b from-green-600 to-green-700 rounded-t-full shadow-md" 
                         style={{ 
                           height: `${40 + (Math.round((studentData['HJ Grade'] || 0) * 100) / 2)}px`,
                           transition: 'height 1s ease-out'
                         }}>
                    </div>
                    
                    {/* Leaves - appear as plant grows */}
                    {Math.round((studentData['HJ Grade'] || 0) * 100) > 20 && (
                      <>
                        <div className="absolute top-1/4 -left-3 w-6 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full transform -rotate-45 animate-leaf-sway" style={{animationDelay: '0s'}}></div>
                        <div className="absolute top-1/4 -right-3 w-6 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full transform rotate-45 animate-leaf-sway" style={{animationDelay: '0.3s'}}></div>
                      </>
                    )}
                    
                    {Math.round((studentData['HJ Grade'] || 0) * 100) > 40 && (
                      <>
                        <div className="absolute top-1/2 -left-4 w-7 h-9 bg-gradient-to-br from-green-300 to-green-400 rounded-full transform -rotate-45 animate-leaf-sway" style={{animationDelay: '0.6s'}}></div>
                        <div className="absolute top-1/2 -right-4 w-7 h-9 bg-gradient-to-br from-green-300 to-green-400 rounded-full transform rotate-45 animate-leaf-sway" style={{animationDelay: '0.9s'}}></div>
                      </>
                    )}
                    
                    {/* Flower - appears at 60%+ */}
                    {Math.round((studentData['HJ Grade'] || 0) * 100) > 60 && (
                      <div className="absolute -top-8 animate-bounce-slow">
                        {/* Petals */}
                        <div className="relative w-12 h-12">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-gradient-to-b from-pink-300 to-pink-400 rounded-full"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-5 bg-gradient-to-t from-pink-300 to-pink-400 rounded-full"></div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-4 bg-gradient-to-r from-pink-300 to-pink-400 rounded-full"></div>
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-4 bg-gradient-to-l from-pink-300 to-pink-400 rounded-full"></div>
                          
                          {/* Center */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full shadow-md"></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Sparkles at 80%+ */}
                    {Math.round((studentData['HJ Grade'] || 0) * 100) > 80 && (
                      <>
                        <div className="absolute -top-12 -left-4 text-2xl animate-sparkle" style={{animationDelay: '0s'}}>✨</div>
                        <div className="absolute -top-10 -right-4 text-xl animate-sparkle" style={{animationDelay: '0.5s'}}>⭐</div>
                        <div className="absolute -top-14 right-2 text-lg animate-sparkle" style={{animationDelay: '1s'}}>💫</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Label */}
              <div className="text-center mb-2">
                <p className="text-sm font-bold text-green-700 uppercase tracking-wider">Your Spiritual Growth</p>
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
          @keyframes leaf-sway {
            0%, 100% { transform: rotate(-45deg) translateX(0); }
            50% { transform: rotate(-45deg) translateX(3px); }
          }
          .animate-leaf-sway {
            animation: leaf-sway 2s ease-in-out infinite;
          }
          @keyframes grow {
            0% { transform: scaleY(0); }
            100% { transform: scaleY(1); }
          }
          .animate-grow {
            animation: grow 1.5s ease-out;
            transform-origin: bottom;
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
          }
          .animate-sparkle {
            animation: sparkle 2s ease-in-out infinite;
          }
          @keyframes bounce-kid {
            0%, 100% { 
              transform: translateY(0) scale(1);
            }
            25% {
              transform: translateY(-15px) scale(1.1);
            }
            50% { 
              transform: translateY(-25px) scale(1.05) rotate(-5deg);
            }
            75% {
              transform: translateY(-15px) scale(1.1) rotate(5deg);
            }
          }
          .animate-bounce-kid {
            animation: bounce-kid 2s ease-in-out infinite;
          }
        `}</style>
        
        <NavBar />
      </div>
    );
  }

  // BADGES PAGE
  if (currentPage === 'badges' && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4">💖 My Hearts</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
            <div className="text-center">
              <p className="text-gray-600 font-bold mb-2">Hearts Collected</p>
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
              const earned = checkIfBadgeEarned(badge);
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
                        <p className="text-xs font-bold text-white">✓ Earned!</p>
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

  // GRATITUDE PAGE
  if (currentPage === 'gratitude' && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4">💖 Heart Journal</h1>
          
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
              {loading ? 'Submitting...' : '✨ Submit Gratitude'}
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
        <h1 className="text-3xl font-black text-white mb-4">🌸 My Growth Journey</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 font-bold mb-2">Growth Journey</p>
            <div className="text-6xl font-black text-purple-600 mb-2">
              {Math.round((
  calculateAttendance(studentData) + 
  (studentData['HJ Quiz'] || 0) + 
  (studentData['HJ Service'] || 0) + 
  Math.round((myGratitudeEntries.length / 8) * 100)
) / 4)}%
            </div>
            <div className="inline-block px-4 py-2 bg-purple-100 rounded-full">
              <p className="text-sm font-bold text-purple-600">
                {Math.round((studentData['HJ Grade'] || 0) * 100) >= 90 ? '🌟 Shining Brightly!' : 
                 Math.round((studentData['HJ Grade'] || 0) * 100) >= 80 ? '🌸 Beautifully Growing!' : 
                 Math.round((studentData['HJ Grade'] || 0) * 100) >= 70 ? '🌱 Growing Well!' : 
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
                <p className="text-3xl font-black text-green-600">{Math.round((studentData['HJ Service'] || 0) * 100) / 100}</p>
                <p className="text-xs text-gray-500 mt-1">Act of Service Completed</p>
              </div>
              <Award className="w-12 h-12 text-green-600" />
            </div>
          </div>

         <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-orange-200">
  <div className="flex items-center justify-between">
  <div>
    <p className="text-sm text-gray-600 font-bold mb-1">💖 Heart of Gratitude</p>
    <p className="text-3xl font-black text-pink-600">{Math.round((myGratitudeEntries.length / 8) * 100)}%</p>
    <p className="text-xs text-gray-500 mt-1">Gratitude entries submitted</p>
  </div>
  <Heart className="w-12 h-12 text-pink-600" />
</div>
</div>
        </div>
      </div>
      <NavBar />
    </div>
  );

  // PROFILE PAGE
  if (currentPage === 'profile' && studentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
        <div className="p-4">
          <h1 className="text-3xl font-black text-white mb-4 drop-shadow-lg">✨ My Profile ✨</h1>
          
          {/* Main Profile Card - More Vibrant! */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl p-8 border-4 border-white mb-4">
            {/* Edit Button */}
            <div className="flex justify-end mb-4">
              {!editingProfile ? (
                <button
                  onClick={handleEditProfile}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-xl font-bold disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : '💾 Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Larger Photo with Fun Border */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-3xl blur-xl opacity-50"></div>
                <div className="relative">
                  <Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={editingProfile ? tempProfile.photoUrl : studentData['Photo']} size="lg" />
                </div>
              </div>
            </div>

            {editingProfile ? (
              /* Editing Mode */
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                  <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">👤 Full Name</p>
                  <p className="text-xl font-black text-gray-400">{studentData['First Name']} {studentData['Last Name']}</p>
                  <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">🆔 Student ID</p>
                  <p className="text-lg font-black text-gray-400">{studentData['Student ID']}</p>
                  <p className="text-xs text-gray-500 mt-1">ID cannot be changed</p>
                </div>

                <div className="bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
                  <label className="text-xs text-orange-600 font-bold uppercase tracking-wide mb-2 block">📅 Birthday</label>
                  <input
                    type="date"
                    value={tempProfile.dateOfBirth}
                    onChange={(e) => setTempProfile(p => ({...p, dateOfBirth: e.target.value}))}
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-orange-300"
                  />
                </div>

                <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
                  <label className="text-xs text-pink-600 font-bold uppercase tracking-wide mb-2 block">📍 Address</label>
                  <textarea
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile(p => ({...p, address: e.target.value}))}
                    placeholder="Enter your address"
                    rows="2"
                    className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-300 resize-none"
                  />
                </div>

                <div className="bg-indigo-50 rounded-2xl p-4 border-2 border-indigo-200">
                  <label className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-2 block">📸 Photo URL</label>
                  <input
                    type="text"
                    value={tempProfile.photoUrl}
                    onChange={(e) => setTempProfile(p => ({...p, photoUrl: e.target.value}))}
                    placeholder="https://..."
                    className="w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">Google Drive or Imgur link</p>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border-2 border-purple-200">
                <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">👤 Full Name</p>
                <p className="text-xl font-black text-gray-800">{studentData['First Name']} {studentData['Last Name']}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-4 border-2 border-blue-200">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wide mb-1">🆔 Student ID</p>
                <p className="text-lg font-black text-gray-800">{studentData['Student ID']}</p>
              </div>
              
              {studentData['Age'] && (
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border-2 border-green-200">
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-1">🎂 Age</p>
                  <p className="text-lg font-black text-gray-800">{studentData['Age']} years</p>
                </div>
              )}
              
              {studentData['Date of Birth'] && (
                <div className="col-span-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-4 border-2 border-yellow-200">
                  <p className="text-xs text-orange-600 font-bold uppercase tracking-wide mb-1">📅 Birthday</p>
                  <p className="text-lg font-black text-gray-800">{studentData['Date of Birth']}</p>
                </div>
              )}
              
              {studentData['Address'] && (
                <div className="col-span-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-4 border-2 border-pink-200">
                  <p className="text-xs text-pink-600 font-bold uppercase tracking-wide mb-1">📍 Address</p>
                  <p className="text-base font-bold text-gray-800">{studentData['Address']}</p>
                </div>
              )}
              
              {studentData['Category'] && (
                <div className="col-span-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-4 border-2 border-indigo-200">
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">⭐ Category</p>
                  <p className="text-lg font-black text-gray-800">{studentData['Category']}</p>
                </div>
              )}
            </div>
            )}
          </div>

          <WeeklyAffirmation />

          {/* Growth Goals Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
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

          <button 
            onClick={() => setCurrentPage('grades')} 
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <span className="font-bold">View My Grades</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
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
          <button onClick={() => setShowAddStudentForm(true)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6" />
              <span className="font-bold">Add New Student</span>
            </div>
            <ChevronRight className="w-6 h-6" />
          </button>
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
              <span className="font-bold">View Heart Journals</span>
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
                </div>
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
                    <p className="text-3xl font-black text-purple-600">{Math.round((selectedStudentDetail['HJ Grade'] || 0) * 100)}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <Calendar className="w-6 h-6 text-blue-600 mb-1" />
                    <p className="text-xs text-gray-600 font-bold mb-1">Faithful Presence</p>
                    <p className="text-2xl font-black text-blue-600">{calculateAttendance(selectedStudentDetail)}%</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <BookOpen className="w-6 h-6 text-purple-600 mb-1" />
                    <p className="text-xs text-gray-600 font-bold mb-1">Heart Knowledge</p>
                    <p className="text-2xl font-black text-purple-600">{Math.round((selectedStudentDetail['HJ Quiz'] || 0) * 100) / 100}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <Award className="w-6 h-6 text-green-600 mb-1" />
                    <p className="text-xs text-gray-600 font-bold mb-1">Filial Actions</p>
                    <p className="text-2xl font-black text-green-600">{Math.round((selectedStudentDetail['HJ Service'] || 0) * 100) / 100}</p>
                  </div>
                </div>
              </div>

              {/* Heart Cultivation */}
              {selectedStudentProgress && (
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
                        <p className="text-3xl font-black text-purple-600">{selectedStudentProgress.badgesEarned?.length || 0}/{BADGES.length}</p>
                      </div>
                    </div>
                    {selectedStudentProgress.badgesEarned && selectedStudentProgress.badgesEarned.length > 0 && (
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-xs text-gray-600 font-bold mb-2">Earned Hearts:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStudentProgress.badgesEarned.map(badgeId => {
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
              )}
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
        <div className="space-y-3">
          {allStudents.map((student, idx) => (
            <div 
              key={idx} 
              onClick={() => {
                setSelectedStudentDetail(student);
                loadStudentProgressForAdmin(student['Student ID']);
              }}
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

  // ADMIN GRATITUDE JOURNALS
  if (currentPage === 'admin-gratitude' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-black text-white">💖 Heart Journals</h1>
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

  return null;
};

export default App;
