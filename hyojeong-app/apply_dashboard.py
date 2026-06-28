#!/usr/bin/env python3
import sys, shutil, os
APP = "src/App.jsx"
if not os.path.exists(APP):
    print("ERROR: src/App.jsx not found. Run from the hyojeong-app folder.")
    sys.exit(1)
with open(APP) as f:
    src = f.read()
orig = src
made = []

admin_old_start = '''  if (currentPage === \'admin-dashboard\' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">'''
admin_anchor_end = '''        </div>
      </div>

      {/* Add New Student Modal */}'''
ADMIN_NEW = r"""      <div className="p-4 max-w-md mx-auto">
        {/* Header card with stats */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden" style={{background:'#1b2a4a'}}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{background:'rgba(201,162,39,0.16)'}}></div>
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white grid place-items-center shrink-0 overflow-hidden">
                <img src="https://i.imgur.com/bhXEh9q.png" alt="Hyojeong Youth Caraga Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">Admin Dashboard</h1>
                <p className="text-xs font-bold" style={{color:'#aeb9d4'}}>Hyojeong Youth Caraga</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-white px-3 py-2 rounded-lg" style={{background:'rgba(255,255,255,0.16)'}}>Logout</button>
          </div>
          <div className="flex gap-8 mt-4 relative">
            <div>
              <p className="text-2xl font-black text-white leading-none">{allStudents.filter(s => (s['Status'] || 'active') === 'active').length}<span className="text-sm font-bold" style={{color:'#9aa6c4'}}> /{allStudents.length}</span></p>
              <p className="text-[10px] font-bold uppercase tracking-wide mt-1" style={{color:'#aeb9d4'}}>Active Students</p>
            </div>
            <div>
              <p className="text-2xl font-black leading-none" style={{color:'#e9d9a3'}}>{allGratitudeEntries.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide mt-1" style={{color:'#aeb9d4'}}>Gratitude Entries</p>
            </div>
          </div>
        </div>

        {/* TODAY */}
        <p className="text-[11px] font-black tracking-wider uppercase text-gray-500 mb-2 ml-1">Today</p>
        <button onClick={() => setCurrentPage('zoom-attendance')} className="w-full rounded-2xl p-4 mb-5 flex items-center gap-3 shadow-lg" style={{background:'linear-gradient(135deg,#c9a227,#bd9620)'}}>
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{background:'rgba(255,255,255,0.25)'}}><Calendar className="w-5 h-5" style={{color:'#1b2a4a'}} /></div>
          <span className="font-black text-left flex-1" style={{color:'#1b2a4a'}}>Zoom Attendance</span>
          <ChevronRight className="w-5 h-5" style={{color:'#1b2a4a'}} />
        </button>

        {/* STUDENTS */}
        <p className="text-[11px] font-black tracking-wider uppercase text-gray-500 mb-2 ml-1">Students</p>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button onClick={() => { loadAllMarks(); setCurrentPage('admin-students'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#e7edfb'}}><Users className="w-4 h-4" style={{color:'#3257c4'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>View All Students</span>
          </button>
          <button onClick={() => setShowAddStudentForm(true)} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#e3f5ea'}}><UserPlus className="w-4 h-4" style={{color:'#1f9e57'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Add New Student</span>
          </button>
          <button onClick={() => { loadPendingRegs(); setCurrentPage('admin-pending'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition relative">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#e3f5ea'}}><UserPlus className="w-4 h-4" style={{color:'#1f9e57'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>New Registrations</span>
            {pendingRegs.length > 0 && <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-white px-1.5 py-0.5 rounded-full" style={{background:'#1f9e57'}}>{pendingRegs.length}</span>}
          </button>
          <button onClick={() => { loadPhotoApprovals(); setCurrentPage('admin-photos'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition relative">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#efe6fb'}}><User className="w-4 h-4" style={{color:'#7b3fc4'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Photo Approvals</span>
            {photoApprovals.length > 0 && <span className="absolute top-2.5 right-2.5 text-[10px] font-black text-white px-1.5 py-0.5 rounded-full" style={{background:'#7b3fc4'}}>{photoApprovals.length}</span>}
          </button>
        </div>

        {/* ENGAGEMENT */}
        <p className="text-[11px] font-black tracking-wider uppercase text-gray-500 mb-2 ml-1">Engagement</p>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button onClick={() => setCurrentPage('admin-leaderboard')} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#fdf0d8'}}><Trophy className="w-4 h-4" style={{color:'#b8860b'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Leaderboards</span>
          </button>
          <button onClick={() => setCurrentPage('admin-gratitude')} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#fde7ef'}}><Heart className="w-4 h-4" style={{color:'#c43066'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Heart Journals</span>
          </button>
          <button onClick={() => { loadAnnouncements(); setCurrentPage('admin-announce'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#fde7ef'}}><MessageSquare className="w-4 h-4" style={{color:'#c43066'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Announcements</span>
          </button>
        </div>

        {/* PROGRAM */}
        <p className="text-[11px] font-black tracking-wider uppercase text-gray-500 mb-2 ml-1">Program</p>
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button onClick={() => { setSetupForm(null); setCurrentPage('admin-setup'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#efe6fb'}}><Target className="w-4 h-4" style={{color:'#7b3fc4'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Program Setup</span>
          </button>
          <button onClick={() => { loadArchives(); setViewingArchive(null); setCurrentPage('admin-archives'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#e7edfb'}}><Clock className="w-4 h-4" style={{color:'#3257c4'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Past Programs</span>
          </button>
          <button onClick={() => { setNewProgramForm({ archiveName: programSettings.program_name || 'Program', newName: '', startDate: '', endDate: '', sessions: 21, gratitudeSessions: 21, quizzes: 0, services: 0, confirm: '' }); setCurrentPage('admin-new-program'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition col-span-2 flex-row items-center">
            <div className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{background:'#fde7ef'}}><Sparkles className="w-4 h-4" style={{color:'#c43066'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Start New Program</span>
          </button>
        </div>

        {/* MAINTENANCE */}
        <button onClick={handleRecomputeAll} disabled={recomputing} className="w-full rounded-2xl p-3.5 flex items-center justify-center gap-2 border border-gray-200 bg-white/70 disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${recomputing ? 'animate-spin' : ''}`} />
          <span className="text-[13px] font-bold text-gray-600">{recomputing ? 'Recomputing…' : 'Recompute All Grades'}</span>
        </button>
      </div>"""

i_start = src.find(admin_old_start)
i_end = src.find(admin_anchor_end)
if i_start == -1:
    print("WARNING: admin start anchor not found.")
elif i_end == -1:
    print("WARNING: admin end anchor not found.")
elif i_end < i_start:
    print("WARNING: admin anchors out of order.")
else:
    new_admin_block = ('''  if (currentPage === \'admin-dashboard\' && isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
''' + ADMIN_NEW + '''

      {/* Add New Student Modal */}''')
    src = src[:i_start] + new_admin_block + src[i_end + len(admin_anchor_end):]
    made.append("admin dashboard redesigned")

lead_old_start = '''  if (currentPage === \'lead-dashboard\' && leadTeam) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
      <div className="p-4">'''
lead_anchor_end = '''        </div>
      </div>
    </div>
    );
  }'''
LEAD_NEW = r"""      <div className="p-4 max-w-md mx-auto">
        {/* Header card */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden" style={{background:'#1b2a4a'}}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full" style={{background:'rgba(201,162,39,0.16)'}}></div>
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white grid place-items-center shrink-0 overflow-hidden">
                <img src="https://i.imgur.com/bhXEh9q.png" alt="Hyojeong Youth Caraga Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">Team {leadTeam}</h1>
                <p className="text-xs font-bold" style={{color:'#aeb9d4'}}>Welcome, Team Lead 💝</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-xs font-bold text-white px-3 py-2 rounded-lg" style={{background:'rgba(255,255,255,0.16)'}}>Logout</button>
          </div>
          <p className="text-sm font-bold mt-3 relative" style={{color:'#e9d9a3'}}>Mark your team's growth</p>
        </div>

        {/* Featured: Mark Attendance */}
        <button onClick={() => { setAttendanceSession(1); loadAttendanceMarks(1); setCurrentPage('lead-attendance'); }} className="w-full rounded-2xl p-4 mb-3 flex items-center gap-3 shadow-lg" style={{background:'linear-gradient(135deg,#c9a227,#bd9620)'}}>
          <div className="w-10 h-10 rounded-xl grid place-items-center" style={{background:'rgba(255,255,255,0.25)'}}><Calendar className="w-5 h-5" style={{color:'#1b2a4a'}} /></div>
          <span className="font-black text-left flex-1" style={{color:'#1b2a4a'}}>Mark Attendance</span>
          <ChevronRight className="w-5 h-5" style={{color:'#1b2a4a'}} />
        </button>

        {/* Other actions */}
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => { loadAllMarks(); setCurrentPage('lead-students'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#e7edfb'}}><Users className="w-4 h-4" style={{color:'#3257c4'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>My Team Members</span>
          </button>
          <button onClick={() => { loadAnnouncements(); setCurrentPage('lead-announce'); }} className="bg-white rounded-2xl p-3.5 border border-gray-200 text-left flex flex-col gap-2 min-h-[78px] active:scale-95 transition">
            <div className="w-8 h-8 rounded-lg grid place-items-center" style={{background:'#fde7ef'}}><MessageSquare className="w-4 h-4" style={{color:'#c43066'}} /></div>
            <span className="text-[13px] font-bold leading-tight" style={{color:'#1b2a4a'}}>Announcements</span>
          </button>
        </div>
      </div>"""

j_start = src.find(lead_old_start)
j_end = src.find(lead_anchor_end, j_start if j_start!=-1 else 0)
if j_start == -1:
    print("WARNING: leader start anchor not found.")
elif j_end == -1:
    print("WARNING: leader end anchor not found.")
else:
    new_lead_block = ('''  if (currentPage === \'lead-dashboard\' && leadTeam) {
    return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400 pb-20">
''' + LEAD_NEW + '''
    </div>
    );
  }''')
    src = src[:j_start] + new_lead_block + src[j_end + len(lead_anchor_end):]
    made.append("leader dashboard redesigned")

if not made:
    print("\nNo changes made.")
    sys.exit(1)
shutil.copy(APP, APP + ".backup_dash")
with open(APP, "w") as f:
    f.write(src)
print("Backup saved to src/App.jsx.backup_dash")
for m in made:
    print("  -", m)
print("Line count:", len(src.splitlines()), "(was", len(orig.splitlines()), ")")
