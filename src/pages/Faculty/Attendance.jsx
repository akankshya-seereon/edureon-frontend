import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar, Clock, LogIn, LogOut, 
  AlertCircle, GraduationCap, HourglassIcon, 
  CheckCircle, XCircle, Briefcase, ChevronLeft, ChevronRight,
  Loader2, Users, ShieldCheck, RefreshCw, Unlock
} from "lucide-react";

// --- CONFIGURATION ---
const SHIFT_START = { h: 9, m: 30 };
const SHIFT_END   = { h: 18, m: 30 };
const API_BASE = "http://localhost:5000/api";

// --- HELPERS ---
const toMin = (h, m) => h * 60 + m;
const nowMin = () => { const n = new Date(); return toMin(n.getHours(), n.getMinutes()); };
const getCurrentTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};
const fmt12 = (t) => {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const isShiftActive = () => {
  const n = nowMin();
  return n >= toMin(SHIFT_START.h, SHIFT_START.m) && n <= toMin(SHIFT_END.h, SHIFT_END.m);
};
const getDurationData = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return 0;
  const [ih, im] = punchIn.split(":").map(Number);
  const [oh, om] = punchOut.split(":").map(Number);
  return (toMin(oh, om) - toMin(ih, im)) / 60;
};
const formatDuration = (hours) => {
  if (hours <= 0) return "0h 0m";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export default function FacultyAttendance() {
  const [viewMode, setViewMode] = useState("personal"); 
  const [clockNow, setClockNow] = useState(getCurrentTime());
  const [history, setHistory] = useState([]);
  const [currentRecord, setCurrentRecord] = useState({ punchIn: null, punchOut: null, status: "Absent" });
  const [profile, setProfile] = useState({ name: "Loading...", designation: "", dept: "" });
  const [loading, setLoading] = useState(true);
  
  // Student Verification State
  const [pendingStudents, setPendingStudents] = useState([]);
  const [verifyLoading, setVerifyLoading] = useState(null);

  // Assignments State (Real data from MySQL)
  const [assignments, setAssignments] = useState({ subjects: [], classes: [] });
  const [sessionForm, setSessionForm] = useState({
    subjectId: '',
    classId: '',
    periodId: '1',
    remarks: '',
    date: new Date().toISOString().split('T')[0]
  });

  // 📡 FETCH ALL DATA
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      // Keeping headers as a fallback, but relying on withCredentials for secure cookies
      const config = { 
        withCredentials: true, 
        headers: token ? { Authorization: `Bearer ${token}` } : {} 
      };

      const [profRes, historyRes, todayRes, pendingRes, assignRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/faculty/profile`, config),
        axios.get(`${API_BASE}/faculty/attendance/history`, config),
        axios.get(`${API_BASE}/faculty/attendance/today`, config),
        axios.get(`${API_BASE}/faculty/attendance/pending`, config),
        axios.get(`${API_BASE}/faculty/attendance/assignments`, config) 
      ]);

      if (profRes.status === 'fulfilled' && profRes.value.data?.success) setProfile(profRes.value.data.data);
      if (historyRes.status === 'fulfilled' && historyRes.value.data?.success) setHistory(historyRes.value.data.data || []); 
      if (todayRes.status === 'fulfilled' && todayRes.value.data?.success) setCurrentRecord(todayRes.value.data.data || { punchIn: null, punchOut: null, status: "Absent" });
      if (pendingRes.status === 'fulfilled' && pendingRes.value.data?.success) setPendingStudents(pendingRes.value.data.data || []);
      
      // 🚀 FIXED: Correctly extracted .data.data to prevent undefined map crashes
      if (assignRes.status === 'fulfilled' && assignRes.value.data?.success) {
        setAssignments(assignRes.value.data.data || { subjects: [], classes: [] });
      }

    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
    const t = setInterval(() => setClockNow(getCurrentTime()), 10000);
    return () => clearInterval(t);
  }, []);

  // ⚡ HANDLERS
  const handlePunch = async (type) => {
    try {
      const res = await axios.post(`${API_BASE}/faculty/attendance/punch`, { type }, { withCredentials: true });
      if (res.data.success) fetchData();
    } catch (err) { alert(err.response?.data?.message || "Punch failed"); }
  };

  const handleVerify = async (recordId, action) => {
    setVerifyLoading(recordId);
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE}/faculty/attendance/verify`, 
        { recordId, action }, 
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingStudents(prev => prev.filter(p => p.record_id !== recordId));
    } catch (err) { 
      alert("Verification failed."); 
    } finally { 
      setVerifyLoading(null); 
    }
  };

  // 🎯 START CLASS HANDLER
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/faculty/attendance/session/approve`, 
        sessionForm, 
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("🚀 Class Unlocked! Students can now mark attendance.");
        setViewMode("personal");
        fetchData();
      }
    } catch (err) {
      alert("Failed to start session. Ensure all fields are selected.");
    } finally {
      setLoading(false);
    }
  };

  const stats = (history || []).reduce((acc, rec) => {
    if (rec.status === "Present" || rec.status === "Late") acc.present++;
    if (rec.status === "Absent") acc.absent++;
    acc.hours += getDurationData(rec.punchIn, rec.punchOut);
    return acc;
  }, { present: 0, absent: 0, hours: 0 });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="font-bold text-slate-400 animate-pulse">Syncing Campus Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-8xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              <GraduationCap size={28} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-800">{profile.name || "Faculty Member"}</h1>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">{profile.designation || "Professor"} • {profile.dept || "Academic Dept"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                <RefreshCw size={20} />
            </button>
            <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
               <Clock size={18} className="text-blue-500" />
               <span className="text-lg font-black tabular-nums text-slate-700">{fmt12(clockNow)}</span>
            </div>
          </div>
        </div>

        {/* 🎯 NAVIGATION SWITCHER */}
        <div className="flex gap-2 mb-8 bg-slate-200/50 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setViewMode("personal")}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === "personal" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Briefcase size={16} /> My Attendance
          </button>
          
          <button 
            onClick={() => setViewMode("create")}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === "create" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Unlock size={16} /> Start Class
          </button>

          <button 
            onClick={() => setViewMode("students")}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 relative ${viewMode === "students" ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Users size={16} /> Student Approval
            {pendingStudents?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-slate-50 font-bold animate-bounce">
                {pendingStudents.length}
              </span>
            )}
          </button>
        </div>

        {/* VIEW 1: PERSONAL LOGS */}
        {viewMode === "personal" && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              {[
                { label: "Present", val: stats.present, color: "text-emerald-600", bg: "bg-emerald-50/50" },
                { label: "Hours", val: formatDuration(stats.hours), color: "text-blue-600", bg: "bg-blue-50/50" },
                { label: "Absent", val: stats.absent, color: "text-rose-600", bg: "bg-rose-50/50" },
                { label: "Status", val: currentRecord.status, color: "text-amber-600", bg: "bg-amber-50/50" },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} p-6 rounded-[2rem] border border-white shadow-sm`}>
                  <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">{s.label}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-1">
                <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-8">Workday Pulse</h3>
                  <div className="flex justify-between items-center mb-10">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Entry</p>
                      <p className="font-black text-xl text-slate-700">{fmt12(currentRecord.punchIn)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Exit</p>
                      <p className="font-black text-xl text-slate-700">{fmt12(currentRecord.punchOut)}</p>
                    </div>
                  </div>
                  {!currentRecord.punchIn ? (
                    <button onClick={() => handlePunch('in')} disabled={!isShiftActive()} className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] shadow-lg hover:bg-blue-700 disabled:opacity-40">
                      Punch In
                    </button>
                  ) : (
                    <button onClick={() => handlePunch('out')} disabled={!!currentRecord.punchOut} className="w-full py-5 bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-[1.5rem] font-black uppercase text-[10px] hover:border-rose-200 transition-all disabled:opacity-30">
                      Punch Out
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <h2 className="font-black text-slate-800 text-lg">Personal Log</h2>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[450px] overflow-y-auto">
                    {history?.map((rec, i) => (
                      <div key={i} className="px-10 py-6 flex items-center justify-between hover:bg-slate-50">
                        <div className="flex items-center gap-6 text-left">
                          <div className="bg-slate-100 w-12 h-12 rounded-2xl flex flex-col items-center justify-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase">{new Date(rec.date).toLocaleString('default', { month: 'short' })}</p>
                            <p className="text-lg font-black leading-none">{new Date(rec.date).getDate()}</p>
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{fmt12(rec.punchIn)} — {fmt12(rec.punchOut)}</p>
                          </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${rec.status === "Present" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"}`}>
                          {rec.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 VIEW 2: START CLASS (CREATE SESSION) */}
        {viewMode === "create" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm max-w-3xl mx-auto text-left shadow-2xl shadow-blue-100/50">
              <div className="mb-8">
                <h3 className="font-black text-slate-800 text-xl tracking-tight flex items-center gap-3">
                  <Unlock className="text-blue-600" size={24}/> Broadcast Class Session
                </h3>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Select the subject and batch to begin</p>
              </div>

              <form onSubmit={handleCreateSession} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Subject Name</label>
                  <select 
                    required 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold text-sm transition-all"
                    value={sessionForm.subjectId}
                    onChange={(e) => setSessionForm({...sessionForm, subjectId: e.target.value})}
                  >
                    <option value="">Choose Subject</option>
                    {/* 🚀 FIXED: Added optional chaining (?.) here */}
                    {assignments?.subjects?.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.subject_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Target Batch / Section</label>
                  <select 
                    required 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 font-bold text-sm transition-all"
                    value={sessionForm.classId}
                    onChange={(e) => setSessionForm({...sessionForm, classId: e.target.value})}
                  >
                    <option value="">Choose Class</option>
                    {/* 🚀 FIXED: Added optional chaining (?.) here */}
                    {assignments?.classes?.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.course_name} — {cls.class_section}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                    <Unlock size={18} /> Open Attendance for Students
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 3: STUDENT APPROVALS */}
        {viewMode === "students" && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-200 shadow-sm">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-left">
                <div>
                  <h3 className="font-black text-slate-800 text-xl tracking-tight flex items-center gap-3"><ShieldCheck className="text-blue-600" size={24}/> Student Approvals</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Verify and finalize student attendance</p>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                  {pendingStudents?.length || 0} Requests Pending
                </div>
              </div>
              
              {pendingStudents?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        {['Student Info', 'Subject', 'Marked As', 'Actions'].map(h => (
                          <th key={h} className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pendingStudents?.map(p => (
                        <tr key={p.record_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-10 py-6">
                            <p className="text-sm font-black text-slate-800 capitalize">{p.first_name || "Unknown Student"}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Roll: {p.roll_no || 'N/A'}</p>
                          </td>
                          <td className="px-10 py-6 text-sm font-bold text-slate-600">{p.subject_name || "General"}</td>
                          <td className="px-10 py-6">
                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase border ${p.marked_as === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {p.marked_as}
                            </span>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex gap-3">
                              <button onClick={() => handleVerify(p.record_id, 'approved')} disabled={verifyLoading === p.record_id} className="w-10 h-10 bg-emerald-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-all">
                                {verifyLoading === p.record_id ? <Loader2 className="animate-spin w-4 h-4"/> : <CheckCircle size={18}/>}
                              </button>
                              <button onClick={() => handleVerify(p.record_id, 'rejected')} disabled={verifyLoading === p.record_id} className="w-10 h-10 bg-rose-500 text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-rose-600 transition-all">
                                {verifyLoading === p.record_id ? <Loader2 className="animate-spin w-4 h-4"/> : <XCircle size={18}/>}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-32 text-center text-left">
                   <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="text-emerald-400 w-10 h-10"/>
                   </div>
                   <p className="text-slate-800 font-black uppercase tracking-[0.2em] text-xs">Verification Clear</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}