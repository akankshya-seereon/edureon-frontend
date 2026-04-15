import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth'; // Adjusted based on your tree structure
import {
  Clock, Calendar, AlertCircle, LogIn, LogOut,
  Users, GraduationCap, ChevronRight, User,
  CheckCircle, XCircle, ShieldCheck, BookOpen,
  Lock, Unlock, ClipboardList, ChevronDown, Loader2
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SHIFT_START = { h: 9, m: 30 };
const SHIFT_END   = { h: 18, m: 30 };
const toMin = (h, m) => h * 60 + m;

const getCurrentTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
};

const fmt12 = (t) => {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  return `${((h % 12) || 12)}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const isShiftActive = () => {
  const n = new Date();
  const mins = toMin(n.getHours(), n.getMinutes());
  return mins >= toMin(SHIFT_START.h, SHIFT_START.m) && mins <= toMin(SHIFT_END.h, SHIFT_END.m);
};

const formatDate = (d) => {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' }); }
  catch { return d; }
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

const API_BASE = "http://localhost:5000/api/attendance";
const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

// ─── Shared Punch Card ──────────────────────────────────────────────
function PunchCard() {
  const [punchIn, setPunchIn] = useState(null);
  const [punchOut, setPunchOut] = useState(null);
  const [shiftOn, setShiftOn] = useState(isShiftActive());
  const [clockNow, setClockNow] = useState(getCurrentTime());

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/punch-status`, getHeaders());
        if (res.data.punchIn) setPunchIn(res.data.punchIn);
        if (res.data.punchOut) setPunchOut(res.data.punchOut);
      } catch (err) { console.error("Punch status fetch failed"); }
    };
    fetchStatus();
    const t = setInterval(() => { setClockNow(getCurrentTime()); setShiftOn(isShiftActive()); }, 60000);
    return () => clearInterval(t);
  }, []);

  const handlePunch = async (type) => {
    try {
      const res = await axios.post(`${API_BASE}/punch`, { type }, getHeaders());
      if (res.data.success) {
        if (type === 'IN') setPunchIn(res.data.time);
        else setPunchOut(res.data.time);
      }
    } catch (err) { alert("Punch failed."); }
  };

  const getDuration = () => {
    if (!punchIn || !punchOut) return null;
    const [ih,im] = punchIn.split(':').map(Number);
    const [oh,om] = punchOut.split(':').map(Number);
    const diff = toMin(oh,om) - toMin(ih,im);
    return diff > 0 ? `${Math.floor(diff/60)}h ${diff%60}m` : null;
  };

  const duration = getDuration();

  return (
    <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm mb-6 overflow-hidden text-left">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-gray-900">Workday Punch</h2>
          <span className="text-xs text-gray-400 font-medium">{formatDate(getTodayDate())}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{fmt12(clockNow)}</span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${shiftOn ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {shiftOn ? 'Shift Active' : 'Outside Shift'}
          </span>
        </div>
      </div>
      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
          <div className={`rounded-3xl border-2 p-6 text-center transition-all ${punchIn ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-dashed border-gray-300'}`}>
            <LogIn className={`w-5 h-5 mx-auto mb-1 ${punchIn ? 'text-emerald-600' : 'text-gray-400'}`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Punch In</p>
            <p className="text-xl font-black mt-1 text-slate-800">{punchIn ? fmt12(punchIn) : '--:-- --'}</p>
            {!punchIn && <button onClick={() => handlePunch('IN')} disabled={!shiftOn} className="mt-4 w-full py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:bg-slate-200">Punch In</button>}
          </div>
          <div className="text-center">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</p>
             <p className="text-2xl font-black text-slate-900">{duration || "00h 00m"}</p>
          </div>
          <div className={`rounded-3xl border-2 p-6 text-center transition-all ${punchOut ? 'bg-rose-50 border-rose-300' : 'bg-gray-50 border-dashed border-gray-300'}`}>
            <LogOut className={`w-5 h-5 mx-auto mb-1 ${punchOut ? 'text-rose-600' : 'text-gray-400'}`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Punch Out</p>
            <p className="text-xl font-black mt-1 text-slate-800">{punchOut ? fmt12(punchOut) : '--:-- --'}</p>
            {punchIn && !punchOut && <button onClick={() => handlePunch('OUT')} disabled={!shiftOn} className="mt-4 w-full py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl disabled:bg-slate-200">Punch Out</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Faculty Page ───────────────────────────────────────────────────
// ─── Faculty Page ───────────────────────────────────────────────────
function FacultyAttendance({ user, onSwitch }) {
  // 🎯 Added 'verify' as the default tab so teachers see pending requests immediately
  const [activeTab, setActiveTab] = useState('verify'); 
  const [form, setForm] = useState({ date: getTodayDate(), department:'', classAssigned:'', period:'', remarks:'' });
  
  // States for the different tabs
  const [loading, setLoading] = useState(false);
  const [approvedSessions, setApprovedSessions] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]); // 🎯 New state for the waiting room
  const [verifyLoading, setVerifyLoading] = useState(null); // 🎯 To spin individual approve buttons
  const [success, setSuccess] = useState('');

  const DEPARTMENTS = [{ id:1, name:'Mathematics' }, { id:5, name:'Computer Science' }];
  const CLASSES = [{ id:2, name:'Btech CSE' }];
  const PERIODS = [{ id:1, name:'Period 1', time:'8:00 AM' }, { id:2, name:'Period 2', time:'9:30 AM' }];

  // Fetch History
  useEffect(() => {
    if (activeTab === 'history') {
      const fetchHistory = async () => {
        try {
          const res = await axios.get(`${API_BASE}/sessions/history`, getHeaders());
          if (res.data.data) setApprovedSessions(res.data.data);
        } catch (err) { console.error(err); }
      };
      fetchHistory();
    }
  }, [activeTab]);

  // 🎯 Fetch Pending Students when the Verify tab is opened
  useEffect(() => {
    if (activeTab === 'verify') {
      const fetchPending = async () => {
        try {
          const res = await axios.get(`${API_BASE}/pending`, getHeaders());
          if (res.data.data) setPendingStudents(res.data.data);
        } catch (err) { console.error(err); }
      };
      fetchPending();
    }
  }, [activeTab]);

  // 1. Unlock a new class
  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/session/approve`, {
        subjectId: form.department,
        classId: form.classAssigned,
        periodId: form.period,
        remarks: form.remarks,
        date: form.date
      }, getHeaders());
      if (res.data.success) {
        setSuccess("Session Unlocked!");
        setForm({ ...form, remarks: '' });
      }
    } catch (err) { alert("Failed to unlock"); }
    finally { setLoading(false); setTimeout(() => setSuccess(''), 3000); }
  };

  // 🎯 2. Verify a student's attendance request
  const handleVerify = async (recordId, action) => {
    setVerifyLoading(recordId);
    try {
      await axios.post(`${API_BASE}/verify`, { recordId, action }, getHeaders());
      // Remove the student from the waiting list instantly
      setPendingStudents(prev => prev.filter(p => p.record_id !== recordId));
    } catch (err) {
      alert("Verification failed. Please try again.");
    } finally {
      setVerifyLoading(null);
    }
  };

  const sel = "w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-700 text-sm font-bold bg-white outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-50 text-left animate-in fade-in duration-500">
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm"><User className="w-5 h-5 text-white" /></div>
          <div>
            <span className="font-black text-slate-900 uppercase tracking-widest text-[10px] block">Faculty Portal</span>
            <span className="text-[10px] font-bold text-slate-400">Logged in as {user?.first_name || "Faculty"}</span>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button onClick={onSwitch} className="flex items-center gap-2 px-6 py-2 rounded-2xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <GraduationCap size={14} /> Student View <ChevronRight size={12} />
          </button>
        )}
      </div>

      <div className="max-w-8xl mx-auto py-12 px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">Hi, {user?.first_name || "Faculty"}</h1>
          <p className="text-slate-400 font-bold mt-2 italic">Faculty Attendance & Control Panel</p>
        </div>

        <PunchCard />

        {/* 🎯 Updated Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'verify', label: 'Verify Students', icon: <CheckCircle size={14}/> },
              { id: 'approve', label: 'Unlock Session', icon: <Unlock size={14}/> },
              { id: 'history', label: 'Past Sessions', icon: <ClipboardList size={14}/> }
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)} 
                className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === t.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 border border-slate-100 hover:text-slate-600'}`}
              >
                {t.icon} {t.label}
                {/* Notification dot if there are pending students */}
                {t.id === 'verify' && pendingStudents.length > 0 && (
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse ml-1"></span>
                )}
              </button>
            ))}
        </div>

        {/* 🎯 NEW: VERIFY TAB */}
        {activeTab === 'verify' && (
          <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-800 text-lg">Pending Approvals</h3>
              <p className="text-xs font-bold text-slate-400 mt-1">Review student attendance requests</p>
            </div>
            
            {pendingStudents.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Student', 'Subject', 'Requested Status', 'Action'].map(h => <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {pendingStudents.map(p => (
                    <tr key={p.record_id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-slate-900 capitalize">{p.first_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {p.roll_no || 'N/A'}</p>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{p.subject_name || "General"}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${p.marked_as === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          {p.marked_as}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleVerify(p.record_id, 'approved')}
                            disabled={verifyLoading === p.record_id}
                            className="p-2 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            title="Approve"
                          >
                            {verifyLoading === p.record_id ? <Loader2 className="animate-spin w-5 h-5"/> : <CheckCircle className="w-5 h-5"/>}
                          </button>
                          <button 
                            onClick={() => handleVerify(p.record_id, 'rejected')}
                            disabled={verifyLoading === p.record_id}
                            className="p-2 bg-rose-100 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            title="Reject"
                          >
                            {verifyLoading === p.record_id ? <Loader2 className="animate-spin w-5 h-5"/> : <XCircle className="w-5 h-5"/>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-24 text-center">
                 <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="text-emerald-400 w-8 h-8"/>
                 </div>
                 <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">All caught up!</p>
                 <p className="text-slate-400 font-bold text-xs mt-2 italic">No pending attendance requests to review.</p>
              </div>
            )}
          </div>
        )}

        {/* UNLOCK SESSION TAB */}
        {activeTab === 'approve' && (
          <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Date</label>
                <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={sel} />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject / Department</label>
                <select value={form.department} onChange={e => setForm({...form, department: e.target.value})} className={sel}>
                  <option value="">Select Subject</option>
                  {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Course</label>
                <select value={form.classAssigned} onChange={e => setForm({...form, classAssigned: e.target.value})} className={sel}>
                  <option value="">Select Course</option>
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Schedule Period</label>
                <select value={form.period} onChange={e => setForm({...form, period: e.target.value})} className={sel}>
                  <option value="">Select Period</option>
                  {PERIODS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.time})</option>)}
                </select>
              </div>
            </div>

            {success && <div className="mb-8 p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-black uppercase tracking-widest text-xs animate-pulse text-center">✓ {success}</div>}
            
            <button onClick={handleApprove} disabled={loading} className="w-full py-5 bg-slate-900 hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-blue-900/20 disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={16}/> : <Unlock size={16}/>} Unlock Class for Students
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
           <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Date', 'Subject', 'Course', 'Status'].map(h => <th key={h} className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {approvedSessions.map(s => (
                    <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-700">{formatDate(s.session_date)}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900 uppercase tracking-tighter">{s.subject_name || "General"}</td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-500">{s.class_id === 2 ? "Btech CSE" : "Standard"}</td>
                      <td className="px-8 py-5"><span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Broadcasted</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        )}
      </div>
    </div>
  );
}
// ─── Student Page ───────────────────────────────────────────────────
function StudentAttendance({ user, onSwitch }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🎯 Add the robust name extractor we used in the Dashboard
  const studentName = user?.first_name || user?.name || user?.fullName || "Student";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE}/sessions/available`, getHeaders());
        
        // 🎯 Added a safety check in case res.data.data is undefined
        if (res.data.data) {
          setSessions(res.data.data);
        }
      } catch (err) { 
        console.error("Failed to fetch sessions:", err); 
      }
    };
    fetchData();
  }, []);

  const handleMark = async (sessionId, status) => {
    setLoading(sessionId);
    try {
      await axios.post(`${API_BASE}/mark`, { sessionId, status }, getHeaders());
      // Instantly remove the session from the screen once marked!
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      // 🎯 Updated alert to reflect the new approval workflow
      alert(`Attendance sent to Faculty for approval as ${status.toUpperCase()}!`);
    } catch (err) { 
      alert("Error recording attendance. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-left animate-in fade-in duration-500">
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-slate-900 uppercase tracking-widest text-[10px] block">Student Portal</span>
            <span className="text-[10px] font-bold text-slate-400">
              {studentName} • Section {user?.section || 'A'}
            </span>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button onClick={onSwitch} className="flex items-center gap-2 px-6 py-2 rounded-2xl border border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
            <User size={14} /> Faculty View <ChevronRight size={12} />
          </button>
        )}
      </div>

      <div className="max-w-8xl mx-auto py-12 px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter capitalize">Hi, {studentName}</h1>
          <p className="text-slate-400 font-bold mt-2">Active sessions for your course program</p>
        </div>

        <div className="grid gap-6">
          {sessions.length > 0 ? sessions.map(s => (
            <div key={s.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between group hover:border-blue-200 hover:shadow-md transition-all">
              
              <div className="flex items-center gap-8 mb-6 md:mb-0 w-full md:w-auto">
                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner shrink-0">
                  <BookOpen size={28}/>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{s.subject_name || "General Class"}</h3>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">Active Session</span>
                    <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Instructor: {s.faculty_name || "Faculty"}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  onClick={() => handleMark(s.id, 'present')} 
                  disabled={loading === s.id} 
                  className="flex-1 md:flex-none px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === s.id ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>} 
                  Mark Present
                </button>
                <button 
                  onClick={() => handleMark(s.id, 'absent')} 
                  disabled={loading === s.id} 
                  className="flex-1 md:flex-none px-8 py-4 bg-slate-50 border border-slate-200 hover:border-rose-500 hover:bg-rose-500 hover:text-white text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === s.id ? <Loader2 className="animate-spin" size={16}/> : <XCircle size={16}/>}
                  Absent
                </button>
              </div>
            </div>
          )) : (
            <div className="p-32 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-white">
               <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Lock className="text-slate-300" size={32}/>
               </div>
               <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">No active sessions broadcasted yet</p>
               <p className="text-slate-400 font-bold text-xs mt-3 italic">Wait for your instructor to unlock the session</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AttendanceApp() {
  const { user } = useAuth();
  
  // Initialize view based on actual user role
  const [view, setView] = useState(user?.role === 'faculty' ? 'faculty' : 'student');

  // Sync view if user data loads late
  useEffect(() => {
    if (user?.role) {
      setView(user.role === 'faculty' ? 'faculty' : 'student');
    }
  }, [user]);

  if (!user) return <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest text-xs animate-pulse">Establishing Secure Connection...</div>;

  return view === 'faculty'
    ? <FacultyAttendance user={user} onSwitch={() => setView('student')} />
    : <StudentAttendance user={user} onSwitch={() => setView('faculty')} />;
}