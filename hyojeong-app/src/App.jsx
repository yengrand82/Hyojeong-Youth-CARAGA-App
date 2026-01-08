import React, { useState, useEffect } from 'react';
import { Search, Home, User, CheckSquare, BookOpen, Award, Upload, X, ChevronRight, Calendar, TrendingUp, Users } from 'lucide-react';

const HyojeongYouthApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [taskSubmission, setTaskSubmission] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [importText, setImportText] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [allSubmissions, setAllSubmissions] = useState([]);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem('hj-student-data-2026');
      if (stored) {
        const data = JSON.parse(stored);
        setAllStudents(data.students || []);
      }
    } catch (err) {
      console.error('Storage error:', err);
    }
  };

  const handleLogin = () => {
    setError('');
    setLoading(true);
    
    if (!studentId.trim()) {
      setError('Please enter your Student ID');
      setLoading(false);
      return;
    }

    if (studentId.toUpperCase() === 'ADMIN') {
      setCurrentPage('admin-login');
      setLoading(false);
      return;
    }

    const searchId = studentId.trim().toUpperCase();
    const student = allStudents.find(s => {
      const id = (s['Student ID'] || '').toString().trim().toUpperCase();
      return id === searchId;
    });

    if (student) {
      setStudentData(student);
      setIsAdmin(false);
      setCurrentPage('home');
    } else {
      setError('Student ID not found. Please check and try again.');
    }
    setLoading(false);
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'hjadmin2026') {
      setIsAdmin(true);
      setCurrentPage('admin-dashboard');
      loadAllSubmissions();
    } else {
      setError('Incorrect admin password');
    }
  };

  const loadAllSubmissions = () => {
    try {
      const submissions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('task-')) {
          const data = localStorage.getItem(key);
          if (data) {
            submissions.push(JSON.parse(data));
          }
        }
      }
      setAllSubmissions(submissions.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ));
    } catch (err) {
      console.error('Error loading submissions:', err);
    }
  };

  const handleLogout = () => {
    setStudentData(null);
    setStudentId('');
    setIsAdmin(false);
    setAdminPassword('');
    setCurrentPage('login');
  };

  const handleTaskSubmit = () => {
    if (!taskSubmission.trim() || !selectedSession) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const submissionKey = `task-${studentData['Student ID']}-${Date.now()}`;
      const submission = {
        studentId: studentData['Student ID'],
        studentName: `${studentData['First Name']} ${studentData['Last Name']}`,
        session: selectedSession,
        content: taskSubmission,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(submissionKey, JSON.stringify(submission));
      
      alert('✅ Task submitted successfully!');
      setTaskSubmission('');
      setSelectedSession('');
      setCurrentPage('home');
    } catch (err) {
      setError('Failed to submit task. Please try again.');
    }
  };

  const handleImport = () => {
    try {
      const jsonData = JSON.parse(importText);
      if (!Array.isArray(jsonData)) {
        setError('Invalid data format');
        return;
      }
      
      localStorage.setItem('hj-student-data-2026', JSON.stringify({ students: jsonData }));
      setAllStudents(jsonData);
      alert(`✅ Imported ${jsonData.length} students!`);
      setCurrentPage('login');
      setImportText('');
    } catch (err) {
      setError('Failed to import. Check your JSON data.');
    }
  };

  // Get photo URL - now works with Imgur since we're not in Claude sandbox
  const getPhotoUrl = (url) => {
    if (!url) return null;
    
    const cleanUrl = url.trim();
    
    // Direct image URLs work fine
    if (cleanUrl.includes('i.imgur.com') || 
        cleanUrl.endsWith('.jpg') || 
        cleanUrl.endsWith('.jpeg') || 
        cleanUrl.endsWith('.png') ||
        cleanUrl.endsWith('.gif')) {
      return cleanUrl;
    }
    
    // Google Drive thumbnail URLs
    if (cleanUrl.includes('drive.google.com/thumbnail')) {
      return cleanUrl;
    }
    
    // Convert Google Drive file URLs to thumbnail
    let fileId = null;
    if (cleanUrl.includes('/file/d/')) {
      const parts = cleanUrl.split('/file/d/')[1];
      fileId = parts.split('/')[0];
    } else if (cleanUrl.includes('/open?id=')) {
      fileId = cleanUrl.split('/open?id=')[1].split('&')[0];
    }
    
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }
    
    return cleanUrl;
  };

  // Generate a consistent color based on name
  const getColorFromName = (firstName, lastName) => {
    const name = `${firstName || ''}${lastName || ''}`;
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-indigo-400',
      'from-green-400 to-teal-400',
      'from-orange-400 to-red-400',
      'from-pink-400 to-rose-400',
      'from-cyan-400 to-blue-400',
      'from-violet-400 to-purple-400',
      'from-amber-400 to-orange-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Avatar component with photo support
  const Avatar = ({ firstName, lastName, photoUrl, size = 'md' }) => {
    const [imageError, setImageError] = useState(false);
    const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();
    const gradient = getColorFromName(firstName, lastName);
    const url = getPhotoUrl(photoUrl);
    
    const sizeClasses = {
      sm: 'w-12 h-12 text-lg',
      md: 'w-16 h-16 text-2xl',
      lg: 'w-32 h-32 text-5xl'
    };

    if (url && !imageError) {
      return (
        <img 
          src={url}
          alt={`${firstName} ${lastName}`}
          className={`${sizeClasses[size]} rounded-xl object-cover border-4 border-white shadow-lg`}
          onError={() => setImageError(true)}
        />
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center border-4 border-white shadow-lg`}>
        <span className="font-black text-white drop-shadow">{initials}</span>
      </div>
    );
  };

  const calculateAttendance = () => {
    if (!studentData) return 0;
    let present = 0;
    let total = 0;
    for (let i = 1; i <= 20; i++) {
      const key = `Session ${i} - Attendance`;
      if (studentData[key] !== undefined && studentData[key] !== '') {
        total++;
        if (studentData[key] === true || studentData[key] === 'TRUE') present++;
      }
    }
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-300 shadow-lg">
      <div className="flex justify-around items-center py-3">
        <button
          onClick={() => setCurrentPage('home')}
          className={`flex flex-col items-center ${currentPage === 'home' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-bold mt-1">Home</span>
        </button>
        <button
          onClick={() => setCurrentPage('profile')}
          className={`flex flex-col items-center ${currentPage === 'profile' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-bold mt-1">Profile</span>
        </button>
        <button
          onClick={() => setCurrentPage('tasks')}
          className={`flex flex-col items-center ${currentPage === 'tasks' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <CheckSquare className="w-6 h-6" />
          <span className="text-xs font-bold mt-1">Tasks</span>
        </button>
        <button
          onClick={() => setCurrentPage('grades')}
          className={`flex flex-col items-center ${currentPage === 'grades' ? 'text-purple-600' : 'text-gray-400'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs font-bold mt-1">Grades</span>
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* ADMIN LOGIN PAGE */}
      {currentPage === 'admin-login' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
              <div className="text-center mb-6">
                <div className="bg-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Award className="w-12 h-12 text-purple-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-800">Admin Login 🔐</h2>
              </div>
              
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4"
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={handleAdminLogin}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg mb-3"
              >
                Login as Admin
              </button>

              <button
                onClick={() => { setCurrentPage('login'); setError(''); }}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold"
              >
                Back to Student Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN DASHBOARD */}
      {currentPage === 'admin-dashboard' && isAdmin && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-black text-white">Admin Dashboard 👨‍💼</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100"
              >
                Logout
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-blue-200">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600 font-bold">Total Students</p>
                <p className="text-3xl font-black text-blue-600">{allStudents.filter(s => s['Student ID']).length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-green-200">
                <CheckSquare className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-600 font-bold">Submissions</p>
                <p className="text-3xl font-black text-green-600">{allSubmissions.length}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setCurrentPage('admin-students')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <span className="font-bold">View All Students</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => setCurrentPage('admin-submissions')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-6 h-6" />
                  <span className="font-bold">View Task Submissions</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => setCurrentPage('import')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6" />
                  <span className="font-bold">Update Student Data</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white">
              <h2 className="text-xl font-black text-gray-800 mb-4">Recent Submissions 📝</h2>
              {allSubmissions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No submissions yet</p>
              ) : (
                <div className="space-y-3">
                  {allSubmissions.slice(0, 5).map((sub, idx) => (
                    <div key={idx} className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200">
                      <p className="font-bold text-purple-900">{sub.studentName}</p>
                      <p className="text-sm text-gray-600">{sub.session}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sub.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN - ALL STUDENTS */}
      {currentPage === 'admin-students' && isAdmin && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setCurrentPage('admin-dashboard')}
                className="text-white font-bold"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-black text-white">All Students</h1>
            </div>

            <div className="space-y-3">
              {allStudents.filter(s => s['Student ID']).map((student, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border-4 border-white">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      firstName={student['First Name']} 
                      lastName={student['Last Name']} 
                      photoUrl={student['Photo']}
                      size="sm" 
                    />
                    <div className="flex-1">
                      <p className="font-black text-gray-800">
                        {student['First Name']} {student['Last Name']}
                      </p>
                      <p className="text-sm text-purple-600 font-bold">
                        {student['Student ID']}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{student['Category']}</p>
                      <p className="text-sm font-bold text-gray-800">{student['TEAM']}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN - SUBMISSIONS */}
      {currentPage === 'admin-submissions' && isAdmin && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setCurrentPage('admin-dashboard')}
                className="text-white font-bold"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-black text-white">Task Submissions</h1>
            </div>

            {allSubmissions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-white text-center">
                <p className="text-gray-500">No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allSubmissions.map((sub, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border-4 border-white">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-black text-gray-800">{sub.studentName}</p>
                        <p className="text-sm text-purple-600 font-bold">{sub.studentId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-800">{sub.session}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(sub.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-sm text-gray-800">{sub.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGIN PAGE */}
      {currentPage === 'login' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="bg-white rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Award className="w-14 h-14 text-purple-600" />
              </div>
              <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">
                Hyojeong Youth
              </h1>
              <p className="text-white text-lg font-bold">Caraga 2026 🌟</p>
            </div>

            {allStudents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-white">
                <h2 className="text-xl font-bold text-gray-800 mb-4">📥 Admin: Import Data</h2>
                <p className="text-sm text-gray-600 mb-4">
                  To get started, click below to import student data from your Google Sheet.
                </p>
                <button
                  onClick={() => setCurrentPage('import')}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                >
                  Import Data
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
                <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">
                  Welcome Back! 👋
                </h2>
                
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your Student ID (e.g., HJ001)"
                  className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4"
                />

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Login 🚀'}
                </button>

                <div className="mt-4 text-center text-xs text-gray-500">
                  {allStudents.filter(s => s['Student ID']).length} students registered
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMPORT PAGE */}
      {currentPage === 'import' && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-purple-700">📥 Import Student Data</h2>
                <button onClick={() => setCurrentPage('login')} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-4 text-sm">
                <p className="font-bold text-purple-900 mb-2">Instructions:</p>
                <ol className="list-decimal list-inside space-y-1 text-purple-800">
                  <li>Set up Google Apps Script API</li>
                  <li>Open the API URL in a new tab</li>
                  <li>Copy all JSON data (Ctrl+A, Ctrl+C)</li>
                  <li>Paste below and click Import</li>
                </ol>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON data here..."
                className="w-full h-48 px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 font-mono text-sm mb-4"
              />

              {error && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleImport}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold shadow-lg"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOME PAGE */}
      {currentPage === 'home' && studentData && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border-4 border-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    firstName={studentData['First Name']} 
                    lastName={studentData['Last Name']} 
                    photoUrl={studentData['Photo']}
                    size="md" 
                  />
                  <div>
                    <h2 className="text-lg font-black text-gray-800">
                      {studentData['First Name']} {studentData['Last Name']}
                    </h2>
                    <p className="text-sm text-purple-600 font-bold">{studentData['Student ID']}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-blue-200">
                <Calendar className="w-8 h-8 text-blue-600 mb-2" />
                <p className="text-sm text-gray-600 font-bold">Attendance</p>
                <p className="text-3xl font-black text-blue-600">{calculateAttendance()}%</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-green-200">
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                <p className="text-sm text-gray-600 font-bold">Progress</p>
                <p className="text-3xl font-black text-green-600">
                  {typeof studentData['Percentage'] === 'number' 
                    ? `${Math.round(studentData['Percentage'] * 100)}%` 
                    : '0%'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setCurrentPage('tasks')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-6 h-6" />
                  <span className="font-bold">Submit Weekly Task</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => setCurrentPage('grades')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6" />
                  <span className="font-bold">View My Grades</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                onClick={() => setCurrentPage('profile')}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6" />
                  <span className="font-bold">My Profile & Team</span>
                </div>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {studentData['TEAM'] && (
              <div className="mt-4 bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-4 text-center">
                <p className="text-yellow-800 font-black text-lg">
                  🎉 Team: {studentData['TEAM']} 🎉
                </p>
              </div>
            )}
          </div>
          <NavBar />
        </div>
      )}

      {/* PROFILE PAGE */}
      {currentPage === 'profile' && studentData && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <h1 className="text-3xl font-black text-white mb-4">My Profile 👤</h1>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4">
              <div className="flex justify-center">
                <Avatar 
                  firstName={studentData['First Name']} 
                  lastName={studentData['Last Name']} 
                  photoUrl={studentData['Photo']}
                  size="lg" 
                />
              </div>

              <div className="space-y-3">
                <div className="bg-purple-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 font-bold">Full Name</p>
                  <p className="text-lg font-black text-gray-800">
                    {studentData['First Name']} {studentData['Last Name']}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-sm text-gray-600 font-bold">Student ID</p>
                  <p className="text-lg font-black text-gray-800">{studentData['Student ID']}</p>
                </div>

                {studentData['Age'] && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-sm text-gray-600 font-bold">Age</p>
                    <p className="text-lg font-black text-gray-800">{studentData['Age']} years old</p>
                  </div>
                )}

                {studentData['Address'] && (
                  <div className="bg-yellow-50 rounded-xl p-3">
                    <p className="text-sm text-gray-600 font-bold">Address</p>
                    <p className="text-lg font-black text-gray-800">{studentData['Address']}</p>
                  </div>
                )}

                {studentData['TEAM'] && (
                  <div className="bg-pink-50 rounded-xl p-3">
                    <p className="text-sm text-gray-600 font-bold">Team</p>
                    <p className="text-lg font-black text-gray-800">{studentData['TEAM']}</p>
                  </div>
                )}

                {studentData['Category'] && (
                  <div className="bg-indigo-50 rounded-xl p-3">
                    <p className="text-sm text-gray-600 font-bold">Category</p>
                    <p className="text-lg font-black text-gray-800">{studentData['Category']}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <NavBar />
        </div>
      )}

      {/* TASKS PAGE */}
      {currentPage === 'tasks' && studentData && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <h1 className="text-3xl font-black text-white mb-4">Submit Task 📝</h1>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Session
                </label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold"
                >
                  <option value="">Choose a session...</option>
                  {[...Array(20)].map((_, i) => (
                    <option key={i} value={`Session ${i + 1}`}>Session {i + 1}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Your Task / Homework
                </label>
                <textarea
                  value={taskSubmission}
                  onChange={(e) => setTaskSubmission(e.target.value)}
                  placeholder="Write your task, homework, or reflection here..."
                  className="w-full h-40 px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">
                  {error}
                </div>
              )}

              <button
                onClick={handleTaskSubmit}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg"
              >
                Submit Task 🚀
              </button>
            </div>
          </div>
          <NavBar />
        </div>
      )}

      {/* GRADES PAGE */}
      {currentPage === 'grades' && studentData && (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
          <div className="p-4">
            <h1 className="text-3xl font-black text-white mb-4">My Grades 📊</h1>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 font-bold mb-2">Overall HJ Grade</p>
                <div className="text-6xl font-black text-purple-600">
                  {typeof studentData['HJ Grade'] === 'number' 
                    ? `${Math.round(studentData['HJ Grade'] * 100)}%`
                    : studentData['HJ Grade'] || 'N/A'}
                </div>
                <p className="text-lg text-gray-600 font-bold mt-2">
                  {typeof studentData['Percentage'] === 'number' 
                    ? `${Math.round(studentData['Percentage'] * 100)}%` 
                    : '0%'} Complete
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-bold">Attendance</p>
                    <p className="text-3xl font-black text-blue-600">{calculateAttendance()}%</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-bold">Service</p>
                    <p className="text-3xl font-black text-green-600">
                      {typeof studentData['HJ Service'] === 'number' 
                        ? studentData['HJ Service']
                        : studentData['HJ Service'] || 'N/A'}
                    </p>
                  </div>
                  <Award className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-bold">Quiz Average</p>
                    <p className="text-3xl font-black text-purple-600">
                      {typeof studentData['HJ Quiz'] === 'number' 
                        ? studentData['HJ Quiz']
                        : studentData['HJ Quiz'] || 'N/A'}
                    </p>
                  </div>
                  <BookOpen className="w-12 h-12 text-purple-600" />
                </div>
              </div>
            </div>

            {(studentData['HEAVENLY QUIZ #1'] || studentData['HEAVENLY QUIZ #2']) && (
              <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 border-4 border-white">
                <h3 className="text-lg font-black text-gray-800 mb-4">📚 Quiz Scores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 font-bold mb-1">Quiz #1</p>
                    <p className="text-3xl font-black text-indigo-600">
                      {studentData['HEAVENLY QUIZ #1'] || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-600 font-bold mb-1">Quiz #2</p>
                    <p className="text-3xl font-black text-indigo-600">
                      {studentData['HEAVENLY QUIZ #2'] || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <NavBar />
        </div>
      )}
    </div>
  );
};

export default HyojeongYouthApp;
