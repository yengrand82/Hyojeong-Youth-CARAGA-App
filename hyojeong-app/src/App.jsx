import React, { useState, useEffect } from 'react';
import { Award, BookOpen, Clock, Target, Upload, Users, LogOut, Home } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('login'); // 'login', 'student', 'admin'
  const [studentId, setStudentId] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [allStudentsData, setAllStudentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if there's saved login data
  useEffect(() => {
    const savedStudentId = localStorage.getItem('studentId');
    const savedStudentData = localStorage.getItem('studentData');
    if (savedStudentId && savedStudentData) {
      setStudentId(savedStudentId);
      setStudentData(JSON.parse(savedStudentData));
      setCurrentView('student');
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSs9l7Ah1Cak85O3H1GTPD6OTc7S0K9i2cERr6gvjV0V1gOlP8XF5PF6xK8FuPp01oQW5mDxq4Gz9bV/pub?output=csv');
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(','));
      
      const headers = rows[0];
      const studentRow = rows.find(row => row[0] === studentId.toUpperCase());
      
      if (studentRow) {
        const student = {
          id: studentRow[0],
          name: studentRow[1],
          photo: studentRow[2],
          team: studentRow[3],
          attendance: {
            session1: studentRow[4],
            session2: studentRow[5],
            session3: studentRow[6],
            session4: studentRow[7],
            session5: studentRow[8],
            session6: studentRow[9],
            session7: studentRow[10],
            session8: studentRow[11]
          },
          quizzes: {
            quiz1: studentRow[12],
            quiz2: studentRow[13],
            quiz3: studentRow[14],
            quiz4: studentRow[15]
          },
          serviceHours: studentRow[16],
          grade: studentRow[17]
        };
        
        setStudentData(student);
        localStorage.setItem('studentId', studentId);
        localStorage.setItem('studentData', JSON.stringify(student));
        setCurrentView('student');
      } else {
        setError('Student ID not found. Please check your ID and try again.');
      }
    } catch (err) {
      setError('Error loading data. Please try again.');
      console.error(err);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentData');
    setStudentId('');
    setStudentData(null);
    setCurrentView('login');
  };

  const handleAdminImport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vSs9l7Ah1Cak85O3H1GTPD6OTc7S0K9i2cERr6gvjV0V1gOlP8XF5PF6xK8FuPp01oQW5mDxq4Gz9bV/pub?output=csv');
      const csvText = await response.text();
      const rows = csvText.split('\n').map(row => row.split(','));
      
      const headers = rows[0];
      const students = rows.slice(1).filter(row => row[0]).map(row => ({
        id: row[0],
        name: row[1],
        photo: row[2],
        team: row[3],
        attendance: {
          session1: row[4],
          session2: row[5],
          session3: row[6],
          session4: row[7],
          session5: row[8],
          session6: row[9],
          session7: row[10],
          session8: row[11]
        },
        quizzes: {
          quiz1: row[12],
          quiz2: row[13],
          quiz3: row[14],
          quiz4: row[15]
        },
        serviceHours: row[16],
        grade: row[17]
      }));
      
      setAllStudentsData(students);
      alert(`Successfully imported ${students.length} students!`);
    } catch (err) {
      setError('Error importing data. Please try again.');
      console.error(err);
    }
    
    setLoading(false);
  };

  // Login View
  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <Award className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Hyojeong Youth</h1>
            <p className="text-white text-lg">Caraga 2026 ⭐</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Student Login</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your Student ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., HJ001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                />
              </div>

              <button
                onClick={handleLogin}
                disabled={loading || !studentId}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentView('admin')}
                className="w-full text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Admin Access
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin View
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <div className="inline-block p-6 bg-white rounded-full shadow-lg mb-4">
              <Award className="w-12 h-12 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Hyojeong Youth</h1>
            <p className="text-white text-lg">Caraga 2026 ⭐</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 mb-4">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">Admin: Import Data</h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <p className="text-gray-600 mb-6">
              To get started, click below to import student data from your Google Sheet.
            </p>

            <button
              onClick={handleAdminImport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import Data'}
            </button>

            {allStudentsData.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-700 mb-3">Imported Students: {allStudentsData.length}</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {allStudentsData.map(student => (
                    <div key={student.id} className="p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      {student.photo && (
                        <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.id} - Team {student.team}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentView('login')}
            className="w-full bg-white text-purple-600 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Student Login
          </button>
        </div>
      </div>
    );
  }

  // Student Dashboard View
  if (currentView === 'student' && studentData) {
    const attendanceCount = Object.values(studentData.attendance).filter(a => a === 'Present').length;
    const totalSessions = Object.keys(studentData.attendance).length;
    const attendancePercentage = (attendanceCount / totalSessions * 100).toFixed(0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with Logout */}
          <div className="flex justify-between items-center mb-6 pt-4">
            <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-white text-purple-600 px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              {studentData.photo && (
                <img
                  src={studentData.photo}
                  alt={studentData.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-purple-200"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{studentData.name}</h2>
                <p className="text-gray-600">{studentData.id}</p>
                <p className="text-purple-600 font-semibold">Team {studentData.team}</p>
              </div>
            </div>

            {/* Overall Grade */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <span className="font-semibold text-gray-700">Overall Grade</span>
                </div>
                <span className="text-3xl font-bold text-purple-600">{studentData.grade}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Attendance */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-700">Attendance</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">{attendancePercentage}%</div>
              <p className="text-sm text-gray-600">{attendanceCount} of {totalSessions} sessions</p>
            </div>

            {/* Service Hours */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-700">Service Hours</h3>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">{studentData.serviceHours}</div>
              <p className="text-sm text-gray-600">Hours completed</p>
            </div>

            {/* Quizzes */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-gray-700">Quizzes</h3>
              </div>
              <div className="space-y-1">
                {Object.entries(studentData.quizzes).map(([quiz, score]) => (
                  <div key={quiz} className="flex justify-between text-sm">
                    <span className="text-gray-600">{quiz.replace('quiz', 'Quiz ')}</span>
                    <span className="font-semibold text-orange-600">{score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Session Attendance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(studentData.attendance).map(([session, status]) => (
                <div
                  key={session}
                  className={`p-3 rounded-xl text-center ${
                    status === 'Present'
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="font-semibold text-gray-700 text-sm mb-1">
                    {session.replace('session', 'Session ')}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      status === 'Present' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
