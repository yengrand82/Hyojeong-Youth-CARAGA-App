import React, { useState } from 'react';
import { Home, User, CheckSquare, BookOpen, Award, ChevronRight, Calendar, TrendingUp, Users } from 'lucide-react';
import { STUDENT_DATA } from './studentData';

const HyojeongYouthApp = () => {
  const [currentPage, setCurrentPage] = useState('login');
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState('');
  const [taskSubmission, setTaskSubmission] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [allSubmissions, setAllSubmissions] = useState([]);

  const allStudents = STUDENT_DATA;

  const handleLogin = () => {
    setError('');
    if (!studentId.trim()) { setError('Please enter your Student ID'); return; }
    if (studentId.toUpperCase() === 'ADMIN') { setCurrentPage('admin-login'); return; }
    const searchId = studentId.trim().toUpperCase();
    const student = allStudents.find(s => (s['Student ID'] || '').toString().trim().toUpperCase() === searchId);
    if (student) { setStudentData(student); setIsAdmin(false); setCurrentPage('home'); }
    else { setError('Student ID not found. Please check and try again.'); }
  };

  const handleAdminLogin = () => {
    if (adminPassword === 'hjadmin2026') { setIsAdmin(true); setCurrentPage('admin-dashboard'); loadAllSubmissions(); }
    else { setError('Incorrect admin password'); }
  };

  const loadAllSubmissions = () => {
    try {
      const submissions = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('task-')) { const data = localStorage.getItem(key); if (data) submissions.push(JSON.parse(data)); }
      }
      setAllSubmissions(submissions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (err) { console.error('Error loading submissions:', err); }
  };

  const handleLogout = () => { setStudentData(null); setStudentId(''); setIsAdmin(false); setAdminPassword(''); setCurrentPage('login'); };

  const handleTaskSubmit = () => {
    if (!taskSubmission.trim() || !selectedSession) { setError('Please fill in all fields'); return; }
    try {
      const submission = { studentId: studentData['Student ID'], studentName: `${studentData['First Name']} ${studentData['Last Name']}`, session: selectedSession, content: taskSubmission, timestamp: new Date().toISOString() };
      localStorage.setItem(`task-${studentData['Student ID']}-${Date.now()}`, JSON.stringify(submission));
      alert('✅ Task submitted successfully!'); setTaskSubmission(''); setSelectedSession(''); setCurrentPage('home');
    } catch (err) { setError('Failed to submit task. Please try again.'); }
  };

  const getPhotoUrl = (url) => {
    if (!url) return null;
    const cleanUrl = url.trim();
    if (cleanUrl.includes('i.imgur.com') || cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.png')) return cleanUrl;
    if (cleanUrl.includes('drive.google.com/thumbnail')) return cleanUrl;
    let fileId = null;
    if (cleanUrl.includes('/file/d/')) fileId = cleanUrl.split('/file/d/')[1].split('/')[0];
    else if (cleanUrl.includes('/open?id=')) fileId = cleanUrl.split('/open?id=')[1].split('&')[0];
    if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    return cleanUrl;
  };

  const getColorFromName = (firstName, lastName) => {
    const name = `${firstName || ''}${lastName || ''}`;
    const colors = ['from-purple-400 to-pink-400', 'from-blue-400 to-indigo-400', 'from-green-400 to-teal-400', 'from-orange-400 to-red-400', 'from-pink-400 to-rose-400', 'from-cyan-400 to-blue-400', 'from-violet-400 to-purple-400', 'from-amber-400 to-orange-400'];
    let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  const Avatar = ({ firstName, lastName, photoUrl, size = 'md' }) => {
    const [imageError, setImageError] = useState(false);
    const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();
    const gradient = getColorFromName(firstName, lastName);
    const url = getPhotoUrl(photoUrl);
    const sizeClasses = { sm: 'w-12 h-12 text-lg', md: 'w-16 h-16 text-2xl', lg: 'w-32 h-32 text-5xl' };
    if (url && !imageError) return <img src={url} alt={`${firstName} ${lastName}`} className={`${sizeClasses[size]} rounded-xl object-cover border-4 border-white shadow-lg`} onError={() => setImageError(true)} />;
    return <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center border-4 border-white shadow-lg`}><span className="font-black text-white drop-shadow">{initials}</span></div>;
  };

  const calculateAttendance = () => {
    if (!studentData) return 0;
    let present = 0, total = 0;
    for (let i = 1; i <= 20; i++) { const key = `Session ${i} - Attendance`; if (studentData[key] !== undefined && studentData[key] !== '') { total++; if (studentData[key] === true || studentData[key] === 'TRUE') present++; } }
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const NavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-purple-300 shadow-lg">
      <div className="flex justify-around items-center py-3">
        {[{ page: 'home', icon: Home, label: 'Home' }, { page: 'profile', icon: User, label: 'Profile' }, { page: 'tasks', icon: CheckSquare, label: 'Tasks' }, { page: 'grades', icon: BookOpen, label: 'Grades' }].map(({ page, icon: Icon, label }) => (
          <button key={page} onClick={() => setCurrentPage(page)} className={`flex flex-col items-center ${currentPage === page ? 'text-purple-600' : 'text-gray-400'}`}>
            <Icon className="w-6 h-6" /><span className="text-xs font-bold mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (currentPage === 'login') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center shadow-lg"><Award className="w-14 h-14 text-purple-600" /></div>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-lg">Hyojeong Youth</h1>
          <p className="text-white text-lg font-bold">Caraga 2026 🌟</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
          <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Welcome Back! 👋</h2>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter your Student ID (e.g., HJ001)" className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4" />
          {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
          <button onClick={handleLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg">Login 🚀</button>
          <div className="mt-4 text-center text-xs text-gray-500">{allStudents.filter(s => s['Student ID']).length} students registered</div>
        </div>
      </div>
    </div>
  );

  if (currentPage === 'admin-login') return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-white">
          <div className="text-center mb-6"><div className="bg-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"><Award className="w-12 h-12 text-purple-600" /></div><h2 className="text-2xl font-black text-gray-800">Admin Login 🔐</h2></div>
          <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()} placeholder="Enter admin password" className="w-full px-4 py-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 text-lg font-semibold mb-4" />
          {error && <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
          <button onClick={handleAdminLogin} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg mb-3">Login as Admin</button>
          <button onClick={() => { setCurrentPage('login'); setError(''); }} className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-bold">Back to Student Login</button>
        </div>
      </div>
    </div>
  );

  if (currentPage === 'admin-dashboard' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6"><h1 className="text-3xl font-black text-white">Admin Dashboard 👨‍💼</h1><button onClick={handleLogout} className="px-4 py-2 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-100">Logout</button></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-blue-200"><Users className="w-8 h-8 text-blue-600 mb-2" /><p className="text-sm text-gray-600 font-bold">Total Students</p><p className="text-3xl font-black text-blue-600">{allStudents.filter(s => s['Student ID']).length}</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-green-200"><CheckSquare className="w-8 h-8 text-green-600 mb-2" /><p className="text-sm text-gray-600 font-bold">Submissions</p><p className="text-3xl font-black text-green-600">{allSubmissions.length}</p></div>
        </div>
        <div className="space-y-3 mb-6">
          <button onClick={() => setCurrentPage('admin-students')} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"><div className="flex items-center gap-3"><Users className="w-6 h-6" /><span className="font-bold">View All Students</span></div><ChevronRight className="w-6 h-6" /></button>
          <button onClick={() => { loadAllSubmissions(); setCurrentPage('admin-submissions'); }} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"><div className="flex items-center gap-3"><CheckSquare className="w-6 h-6" /><span className="font-bold">View Task Submissions</span></div><ChevronRight className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );

  if (currentPage === 'admin-students' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6"><button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">← Back</button><h1 className="text-3xl font-black text-white">All Students</h1></div>
        <div className="space-y-3">
          {allStudents.filter(s => s['Student ID']).map((student, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border-4 border-white">
              <div className="flex items-center gap-3">
                <Avatar firstName={student['First Name']} lastName={student['Last Name']} photoUrl={student['Photo']} size="sm" />
                <div className="flex-1"><p className="font-black text-gray-800">{student['First Name']} {student['Last Name']}</p><p className="text-sm text-purple-600 font-bold">{student['Student ID']}</p></div>
                <div className="text-right"><p className="text-xs text-gray-600">{student['Category']}</p><p className="text-sm font-bold text-gray-800">{student['TEAM']}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (currentPage === 'admin-submissions' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-6"><button onClick={() => setCurrentPage('admin-dashboard')} className="text-white font-bold">← Back</button><h1 className="text-3xl font-black text-white">Task Submissions</h1></div>
        {allSubmissions.length === 0 ? <div className="bg-white rounded-2xl shadow-lg p-8 border-4 border-white text-center"><p className="text-gray-500">No submissions yet</p></div> : (
          <div className="space-y-4">{allSubmissions.map((sub, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-lg border-4 border-white">
              <div className="flex items-center justify-between mb-3"><div><p className="font-black text-gray-800">{sub.studentName}</p><p className="text-sm text-purple-600 font-bold">{sub.studentId}</p></div><div className="text-right"><p className="text-sm font-bold text-gray-800">{sub.session}</p><p className="text-xs text-gray-500">{new Date(sub.timestamp).toLocaleDateString()}</p></div></div>
              <div className="bg-gray-50 rounded-xl p-3"><p className="text-sm text-gray-800">{sub.content}</p></div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );

  if (currentPage === 'home' && studentData) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 border-4 border-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3"><Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={studentData['Photo']} size="md" /><div><h2 className="text-lg font-black text-gray-800">{studentData['First Name']} {studentData['Last Name']}</h2><p className="text-sm text-purple-600 font-bold">{studentData['Student ID']}</p></div></div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700 font-semibold">Logout</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-blue-200"><Calendar className="w-8 h-8 text-blue-600 mb-2" /><p className="text-sm text-gray-600 font-bold">Attendance</p><p className="text-3xl font-black text-blue-600">{calculateAttendance()}%</p></div>
          <div className="bg-white rounded-2xl p-4 shadow-lg border-4 border-green-200"><TrendingUp className="w-8 h-8 text-green-600 mb-2" /><p className="text-sm text-gray-600 font-bold">Progress</p><p className="text-3xl font-black text-green-600">{typeof studentData['Percentage'] === 'number' ? `${Math.round(studentData['Percentage'] * 100)}%` : '0%'}</p></div>
        </div>
        <div className="space-y-3">
          <button onClick={() => setCurrentPage('tasks')} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"><div className="flex items-center gap-3"><CheckSquare className="w-6 h-6" /><span className="font-bold">Submit Weekly Task</span></div><ChevronRight className="w-6 h-6" /></button>
          <button onClick={() => setCurrentPage('grades')} className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"><div className="flex items-center gap-3"><BookOpen className="w-6 h-6" /><span className="font-bold">View My Grades</span></div><ChevronRight className="w-6 h-6" /></button>
          <button onClick={() => setCurrentPage('profile')} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-2xl p-4 shadow-lg flex items-center justify-between"><div className="flex items-center gap-3"><User className="w-6 h-6" /><span className="font-bold">My Profile & Team</span></div><ChevronRight className="w-6 h-6" /></button>
        </div>
        {studentData['TEAM'] && <div className="mt-4 bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-4 text-center"><p className="text-yellow-800 font-black text-lg">🎉 Team: {studentData['TEAM']} 🎉</p></div>}
      </div>
      <NavBar />
    </div>
  );

  if (currentPage === 'profile' && studentData) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <h1 className="text-3xl font-black text-white mb-4">My Profile 👤</h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4">
          <div className="flex justify-center"><Avatar firstName={studentData['First Name']} lastName={studentData['Last Name']} photoUrl={studentData['Photo']} size="lg" /></div>
          <div className="space-y-3">
            <div className="bg-purple-50 rounded-xl p-3"><p className="text-sm text-gray-600 font-bold">Full Name</p><p className="text-lg font-black text-gray-800">{studentData['First Name']} {studentData['Last Name']}</p></div>
            <div className="bg-blue-50 rounded-xl p-3"><p className="text-sm text-gray-600 font-bold">Student ID</p><p className="text-lg font-black text-gray-800">{studentData['Student ID']}</p></div>
            {studentData['Age'] && <div className="bg-green-50 rounded-xl p-3"><p className="text-sm text-gray-600 font-bold">Age</p><p className="text-lg font-black text-gray-800">{studentData['Age']} years old</p></div>}
            {studentData['Address'] && <div className="bg-yellow-50 rounded-xl p-3"><p className="text-sm text-gray-600 font-bold">Address</p><p className="text-lg font-black text-gray-800">{studentData['Address']}</p></div>}
            {studentData['TEAM'] && <div className="bg-pink-50 rounded-xl p-3"><p className="text-sm text-gray-600 font-bold">Team</p><p className="text-lg font-black text-gray-800">{studentData['TEAM']}</p></div>}
            {studentData['Category'] && <div className="bg-indigo-50 rounded-xl p-3"><p className="text-sm text-gray-600 font-bold">Category</p><p className="text-lg font-black text-gray-800">{studentData['Category']}</p></div>}
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );

  if (currentPage === 'tasks' && studentData) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <h1 className="text-3xl font-black text-white mb-4">Submit Task 📝</h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white space-y-4">
          <div><label className="block text-sm font-bold text-gray-700 mb-2">Select Session</label><select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 font-semibold"><option value="">Choose a session...</option>{[...Array(20)].map((_, i) => <option key={i} value={`Session ${i + 1}`}>Session {i + 1}</option>)}</select></div>
          <div><label className="block text-sm font-bold text-gray-700 mb-2">Your Task / Homework</label><textarea value={taskSubmission} onChange={(e) => setTaskSubmission(e.target.value)} placeholder="Write your task, homework, or reflection here..." className="w-full h-40 px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300" /></div>
          {error && <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-600 text-sm font-semibold">{error}</div>}
          <button onClick={handleTaskSubmit} className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition font-bold text-lg shadow-lg">Submit Task 🚀</button>
        </div>
      </div>
      <NavBar />
    </div>
  );

  if (currentPage === 'grades' && studentData) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">
        <h1 className="text-3xl font-black text-white mb-4">My Grades 📊</h1>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-4 border-white mb-4">
          <div className="text-center"><p className="text-sm text-gray-600 font-bold mb-2">Overall HJ Grade</p><div className="text-6xl font-black text-purple-600">{typeof studentData['HJ Grade'] === 'number' ? `${Math.round(studentData['HJ Grade'] * 100)}%` : studentData['HJ Grade'] || 'N/A'}</div><p className="text-lg text-gray-600 font-bold mt-2">{typeof studentData['Percentage'] === 'number' ? `${Math.round(studentData['Percentage'] * 100)}%` : '0%'} Complete</p></div>
        </div>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-blue-200"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 font-bold">Attendance</p><p className="text-3xl font-black text-blue-600">{calculateAttendance()}%</p></div><Calendar className="w-12 h-12 text-blue-600" /></div></div>
          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-green-200"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 font-bold">Service</p><p className="text-3xl font-black text-green-600">{studentData['HJ Service'] || 'N/A'}</p></div><Award className="w-12 h-12 text-green-600" /></div></div>
          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-purple-200"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 font-bold">Quiz Average</p><p className="text-3xl font-black text-purple-600">{studentData['HJ Quiz'] || 'N/A'}</p></div><BookOpen className="w-12 h-12 text-purple-600" /></div></div>
        </div>
      </div>
      <NavBar />
    </div>
  );

  return null;
};

export default HyojeongYouthApp;
