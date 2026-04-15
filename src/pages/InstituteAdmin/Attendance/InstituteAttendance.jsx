import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar, Save, Users, Clock,
  LogIn, LogOut, AlertCircle, ShieldCheck,
  BookOpen, CheckCircle, XCircle, HourglassIcon, UserCheck,
  Loader2
} from "lucide-react";

// --- CONFIG & UTILS ---
const SHIFT_START = { h: 9, m: 30 };
const SHIFT_END   = { h: 18, m: 30 };

const toMin = (h, m) => h * 60 + m;
const nowMin = () => { const n = new Date(); return toMin(n.getHours(), n.getMinutes()); };
const getCurrentTime = () => {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};
const fmt12 = (t) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return `${((h % 12) || 12)}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
const isShiftActive = () => {
  const n = nowMin();
  return n >= toMin(SHIFT_START.h, SHIFT_START.m) && n <= toMin(SHIFT_END.h, SHIFT_END.m);
};
const getDuration = (punchIn, punchOut) => {
  if (!punchIn || !punchOut) return null;
  const [ih, im] = punchIn.split(":").map(Number);
  const [oh, om] = punchOut.split(":").map(Number);
  const diff = toMin(oh, om) - toMin(ih, im);
  if (diff <= 0) return null;
  return `${Math.floor(diff / 60)}h ${diff % 60}m`;
};
const formatTableDate = (d) => {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  } catch { return d; }
};

const DEPARTMENTS = ["All Departments", "Computer Science", "Mathematics", "Physics", "Chemistry", "English"];

const deptColor = (dept) => ({
  "Computer Science": { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", avatar: "bg-blue-600" },
  "Mathematics": { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", avatar: "bg-violet-600" },
  "Physics": { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200", avatar: "bg-cyan-600" },
  "Chemistry": { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", avatar: "bg-emerald-600" },
  "English": { bg: "bg-rose-100", text: "text-rose-700", border: "border-rose-200", avatar: "bg-rose-600" },
}[dept] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", avatar: "bg-gray-600" });

const initAdminRecord = () => ({ punchIn: null, punchOut: null, status: "Absent" });
const initFacRecord = () => ({ punchIn: null, punchOut: null, status: "Absent", approvedBy: null });

export default function InstituteAttendance() {
  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [date, setDate] = useState(getTodayDate());
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [clockNow, setClockNow] = useState(getCurrentTime());
  const [shiftOn, setShiftOn] = useState(isShiftActive());
  const [filterTab, setFilterTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [facultyList, setFacultyList] = useState([]); 
  const [adminRecord, setAdminRecord] = useState(initAdminRecord());
  const [records, setRecords] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      // 🎯 GRAB THE TOKEN FROM STORAGE
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🔴 No token found. Please log in again.");
        return;
      }

      setLoading(true);

      // 🎯 ATTACH TOKEN TO HEADERS TO PREVENT 401 UNAUTHORIZED
      const config = { headers: { Authorization: `Bearer ${token}` } };

      try {
        console.log("🟢 Fetching faculty and attendance...");
        
        // 1. Fetch Faculty List
        const facRes = await axios.get(`http://localhost:5000/api/admin/faculty`, config);
        const currentFaculty = facRes.data.faculty || [];
        setFacultyList(currentFaculty);

        // 2. Fetch Attendance Records
        const attRes = await axios.get(`http://localhost:5000/api/admin/attendance?date=${date}`, config);

        if (attRes.data.success) {
          setAdminRecord(attRes.data.adminRecord || initAdminRecord());
          
          // Force string keys for consistency
          const initialRecords = Object.fromEntries(
            currentFaculty.map(f => [String(f.id), initFacRecord()])
          );
          
          const dbRecords = {};
          if (attRes.data.records) {
             Object.entries(attRes.data.records).forEach(([id, val]) => {
                dbRecords[String(id)] = val;
             });
          }

          setRecords({ ...initialRecords, ...dbRecords });
        }
      } catch (err) {
        console.error("🔴 API Error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
        setSaved(false);
      }
    };
    fetchData();
  }, [date]);

  useEffect(() => {
    const t = setInterval(() => {
      setClockNow(getCurrentTime());
      setShiftOn(isShiftActive());
    }, 60000);
    return () => clearInterval(t);
  }, []);

  const handleAdminPunchIn = () => {
    if (!shiftOn || adminRecord.punchIn) return;
    const now = getCurrentTime();
    const isLate = nowMin() > toMin(SHIFT_START.h, SHIFT_START.m) + 15;
    setAdminRecord(prev => ({ ...prev, punchIn: now, status: isLate ? "Late" : "Present" }));
    setSaved(false);
  };

  const handleAdminPunchOut = () => {
    if (!shiftOn || !adminRecord.punchIn || adminRecord.punchOut) return;
    setAdminRecord(prev => ({ ...prev, punchOut: getCurrentTime() }));
    setSaved(false);
  };

  const handleApprove = (id) => {
    const stringId = String(id);
    const rec = records[stringId];
    if (!rec?.punchIn || rec.status !== "Pending") return;
    const [ih, im] = rec.punchIn.split(":").map(Number);
    const isLate = toMin(ih, im) > toMin(SHIFT_START.h, SHIFT_START.m) + 15;
    setRecords(prev => ({
      ...prev,
      [stringId]: { ...prev[stringId], status: isLate ? "Late" : "Present", approvedBy: "Institute Admin" },
    }));
    setSaved(false);
  };

  const handleReject = (id) => {
    const stringId = String(id);
    setRecords(prev => ({
      ...prev,
      [stringId]: { ...prev[stringId], punchIn: null, status: "Rejected", approvedBy: null },
    }));
    setSaved(false);
  };

  const approveAll = () => {
    const next = { ...records };
    facultyList.forEach(({ id }) => {
      const stringId = String(id);
      if (next[stringId]?.status === "Pending") {
        const [ih, im] = next[stringId].punchIn.split(":").map(Number);
        const isLate = toMin(ih, im) > toMin(SHIFT_START.h, SHIFT_START.m) + 15;
        next[stringId] = { ...next[stringId], status: isLate ? "Late" : "Present", approvedBy: "Institute Admin" };
      }
    });
    setRecords(next);
    setSaved(false);
  };

  const handlePunchOut = (id) => {
    const stringId = String(id);
    const rec = records[stringId];
    if (!shiftOn || !rec?.punchIn || rec.punchOut) return;
    setRecords(prev => ({ ...prev, [stringId]: { ...prev[stringId], punchOut: getCurrentTime() } }));
    setSaved(false);
  };

 const handlePunchOutAll = () => {
  if (!shiftOn) return;
  
  const now = getCurrentTime();
  const next = { ...records };
  let count = 0;

  // We loop through the faculty currently visible on your list
  facultyList.forEach((faculty) => {
    const id = String(faculty.id);
    const rec = next[id];

    // 🔍 The Logic Gate:
    if (
      rec?.punchIn &&                // 1. Must have punched in
      !rec.punchOut &&               // 2. Must NOT have punched out already
      (rec.status === "Present" || rec.status === "Late") // 3. Must be APPROVED
    ) {
      next[id] = { ...rec, punchOut: now };
      count++;
    }
  });

  if (count > 0) {
    setRecords(next);
    setSaved(false); // Enable the Save button
    setSaveMsg(`Action: ${count} faculty members punched out locally.`);
  } else {
    setSaveMsg("No approved faculty found to punch out.");
    setTimeout(() => setSaveMsg(""), 3000);
  }
};

  const handleSave = async () => {
    try {
      // 🎯 ATTACH TOKEN TO SAVE REQUEST AS WELL
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } }; 
      
      const response = await axios.post('http://localhost:5000/api/admin/attendance', {
        date,
        adminRecord,
        records
      }, config);

      if (response.data.success) {
        setSaved(true);
        setSaveMsg(`Saved successfully for ${formatTableDate(date)}`);
        setTimeout(() => setSaveMsg(""), 4000);
      }
    } catch (err) {
      setSaveMsg("Failed to connect to server.");
    }
  };

  const baseFaculty = selectedDept === "All Departments" ? facultyList : facultyList.filter((f) => f.dept === selectedDept);
  
  const visibleFaculty =
    filterTab === "pending" ? baseFaculty.filter((f) => records[String(f.id)]?.status === "Pending")
      : filterTab === "approved" ? baseFaculty.filter((f) => ["Present", "Late"].includes(records[String(f.id)]?.status))
        : filterTab === "absent" ? baseFaculty.filter((f) => ["Absent", "Rejected"].includes(records[String(f.id)]?.status))
          : baseFaculty;

  const allRecs = Object.values(records);
  const presentCount = allRecs.filter((r) => r.status === "Present" || r.status === "Late").length;
  const pendingCount = allRecs.filter((r) => r.status === "Pending").length;
  const absentCount = allRecs.filter((r) => r.status === "Absent" || r.status === "Rejected").length;
  const lateCount = allRecs.filter((r) => r.status === "Late").length;
  const rejectedCount = allRecs.filter((r) => r.status === "Rejected").length;

  const adminDur = getDuration(adminRecord.punchIn, adminRecord.punchOut);

  const statusBadge = (r) => {
    if (r.status === "Pending") return { label: "Awaiting Approval", cls: "bg-amber-50 text-amber-700 border-amber-300" };
    if (r.status === "Rejected") return { label: "Rejected", cls: "bg-red-50 text-red-600 border-red-200" };
    if (r.punchOut) return { label: "Completed", cls: "bg-blue-50 text-blue-600 border-blue-200" };
    if (r.status === "Late") return { label: "Late", cls: "bg-orange-50 text-orange-600 border-orange-200" };
    if (r.status === "Present") return { label: "Present", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    return { label: "Absent", cls: "bg-red-50 text-red-500 border-red-200" };
  };

  const TABS = [
    { id: "all", label: "All", count: baseFaculty.length },
    { id: "pending", label: "Pending", count: baseFaculty.filter(f => records[String(f.id)]?.status === "Pending").length },
    { id: "approved", label: "Approved", count: baseFaculty.filter(f => ["Present", "Late"].includes(records[String(f.id)]?.status)).length },
    { id: "absent", label: "Absent/Rejected", count: baseFaculty.filter(f => ["Absent", "Rejected"].includes(records[String(f.id)]?.status)).length },
  ];

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Georgia', serif" }}>
      <div className="w-full max-w-8xl mx-auto px-4 py-8 pb-32">

        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Institute Attendance</h1>
              <p className="text-sm text-slate-500" style={{ fontFamily: "sans-serif" }}>
                Mark your attendance · Approve faculty · Shift: <span className="font-semibold text-slate-700">9:30 AM – 6:30 PM</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3" style={{ fontFamily: "sans-serif" }}>
            <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl text-sm">
              <Calendar size={14} className="text-slate-400" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="outline-none bg-transparent text-slate-700 font-semibold" />
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-4 py-2.5 rounded-xl text-sm">
              <BookOpen size={14} className="text-slate-400" />
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="outline-none bg-transparent text-slate-700 font-semibold">
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2" style={{ fontFamily: "sans-serif" }}>
            <UserCheck className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-blue-600">My Attendance (Institute Admin)</h2>
            <span className="ml-auto text-xs font-semibold text-blue-600">{formatTableDate(date)}</span>
          </div>

          <div className="p-6" style={{ fontFamily: "sans-serif" }}>
            {!shiftOn && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-xs font-semibold">Punch-in is only available during shift hours (9:30 AM – 6:30 PM).</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md relative">
                  IA
                </div>
                <div>
                  <p className="font-bold text-slate-800" style={{ fontFamily: "Georgia, serif" }}>Institute Admin</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${adminRecord.punchOut ? "bg-blue-50 text-blue-600 border-blue-200" : adminRecord.status === "Present" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : adminRecord.status === "Late" ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                    {adminRecord.punchOut ? "Completed" : adminRecord.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold min-w-[120px] ${adminRecord.punchIn ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-50 border-dashed border-slate-300 text-slate-400"}`}>
                  <LogIn size={14} className={adminRecord.punchIn ? "text-emerald-500" : "text-slate-300"} />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-black opacity-60">Punch In</p>
                    <p className="tabular-nums text-base">{adminRecord.punchIn ? fmt12(adminRecord.punchIn) : "--:-- --"}</p>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-400 min-w-[50px] text-center">
                  {adminDur ? <span className="text-blue-600 font-bold text-sm">{adminDur}</span> : <span className="text-slate-300 text-base">→</span>}
                </div>

                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold min-w-[120px] ${adminRecord.punchOut ? "bg-rose-50 border-rose-300 text-rose-600" : "bg-slate-50 border-dashed border-slate-300 text-slate-400"}`}>
                  <LogOut size={14} className={adminRecord.punchOut ? "text-rose-400" : "text-slate-300"} />
                  <div>
                    <p className="text-[9px] uppercase tracking-wider font-black opacity-60">Punch Out</p>
                    <p className="tabular-nums text-base">{adminRecord.punchOut ? fmt12(adminRecord.punchOut) : "--:-- --"}</p>
                  </div>
                </div>

                <div className="flex gap-3 ml-auto">
                  <button onClick={handleAdminPunchIn} disabled={!shiftOn || !!adminRecord.punchIn} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition active:scale-95 shadow-sm ${adminRecord.punchIn ? "bg-emerald-100 text-emerald-700 border-emerald-200 cursor-default" : shiftOn ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 cursor-pointer" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}>
                    <LogIn size={14} /> {adminRecord.punchIn ? "Punched In ✓" : "Punch In"}
                  </button>
                  <button onClick={handleAdminPunchOut} disabled={!shiftOn || !adminRecord.punchIn || !!adminRecord.punchOut} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition active:scale-95 shadow-sm ${adminRecord.punchOut ? "bg-rose-100 text-rose-600 border-rose-200 cursor-default" : adminRecord.punchIn && shiftOn ? "bg-white text-slate-700 border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 cursor-pointer" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}>
                    <LogOut size={14} /> {adminRecord.punchOut ? "Punched Out ✓" : "Punch Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3" style={{ fontFamily: "sans-serif" }}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-800">Faculty Attendance Approval</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700 tabular-nums">{fmt12(clockNow)}</span>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${shiftOn ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${shiftOn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {shiftOn ? "Shift Active" : "Outside Shift"}
              </span>
            </div>
          </div>

          <div className="p-6" style={{ fontFamily: "sans-serif" }}>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
              {[
                { label: "Present", value: presentCount, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
                { label: "Absent", value: absentCount, color: "text-red-600", bg: "bg-red-50 border-red-100" },
                { label: "Late", value: lateCount, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
                { label: "Pending", value: pendingCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                { label: "Rejected", value: rejectedCount, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
                { label: "Total", value: facultyList.length, color: "text-slate-800", bg: "bg-slate-50 border-slate-200" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={approveAll} disabled={pendingCount === 0} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <CheckCircle size={14} /> Approve All Pending
              </button>
              <button onClick={handlePunchOutAll} disabled={!shiftOn} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <LogOut size={14} /> Punch-Out All Approved
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 pt-4 pb-0 bg-slate-50 border-b border-slate-200" style={{ fontFamily: "sans-serif" }}>
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button key={tab.id} onClick={() => setFilterTab(tab.id)} className={`px-3 py-1.5 text-xs font-bold rounded-t-lg border-b-2 transition-all ${filterTab === tab.id ? "border-indigo-600 text-indigo-700 bg-white" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  {tab.label} {tab.count > 0 && <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-slate-200 text-slate-600">{tab.count}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {visibleFaculty.map((faculty) => {
              const rec = records[String(faculty.id)] || initFacRecord();
              const badge = statusBadge(rec);
              const dur = getDuration(rec.punchIn, rec.punchOut);
              const dc = deptColor(faculty.dept);

              return (
                <div key={faculty.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className={`w-11 h-11 rounded-xl ${dc.avatar} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}>
                        {faculty.icon || faculty.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{faculty.name}</p>
                        <p className="text-xs text-slate-500">{faculty.designation}</p>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${dc.bg} ${dc.text} ${dc.border}`}>
                          {faculty.dept}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold min-w-[105px] ${rec.punchIn ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-slate-50 border-dashed border-slate-300 text-slate-400"}`}>
                        <LogIn size={12} className={rec.punchIn ? "text-emerald-500" : "text-slate-300"} />
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-black opacity-60">Requested In</p>
                          <p className="tabular-nums">{rec.punchIn ? fmt12(rec.punchIn) : "--:-- --"}</p>
                        </div>
                      </div>

                      <div className="text-center text-xs font-semibold text-slate-400 min-w-[44px]">
                        {dur ? <span className="text-indigo-600 font-bold">{dur}</span> : <span className="text-slate-300">→</span>}
                      </div>

                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold min-w-[105px] ${rec.punchOut ? "bg-rose-50 border-rose-300 text-rose-600" : "bg-slate-50 border-dashed border-slate-300 text-slate-400"}`}>
                        <LogOut size={12} className={rec.punchOut ? "text-rose-400" : "text-slate-300"} />
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-black opacity-60">Out</p>
                          <p className="tabular-nums">{rec.punchOut ? fmt12(rec.punchOut) : "--:-- --"}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${badge.cls}`}>
                        {badge.label}
                      </span>

                      <div className="flex gap-2 ml-auto">
                        {rec.status === "Pending" && (
                          <>
                            <button onClick={() => handleApprove(faculty.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 transition active:scale-95 shadow-sm">
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => handleReject(faculty.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-red-50 text-red-600 border-red-300 hover:bg-red-100 transition active:scale-95">
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {(rec.status === "Present" || rec.status === "Late") && (
                          <button onClick={() => handlePunchOut(faculty.id)} disabled={!shiftOn || rec.punchOut} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition active:scale-95 ${rec.punchOut ? "bg-rose-100 text-rose-600 border-rose-200" : shiftOn ? "bg-white text-slate-600 border-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300" : "bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed"}`}>
                            <LogOut size={12} /> {rec.punchOut ? "Out ✓" : "Punch Out"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] flex justify-between items-center z-10" style={{ fontFamily: "sans-serif" }}>
        <p className="text-xs text-slate-500 hidden sm:block">
          {saveMsg ? <span className="text-emerald-600 font-semibold">✓ {saveMsg}</span> : <>
            <span className="font-semibold text-indigo-700">Admin: {adminRecord.status}</span> · <span className="font-semibold text-emerald-700">{presentCount}</span> faculty approved · <span className="font-semibold text-amber-600">{pendingCount}</span> pending
          </>}
        </p>
        <div className="flex gap-3 ml-auto">
          <button onClick={handleSave} className={`px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow-lg ${saved ? "bg-emerald-600 text-white shadow-emerald-500/30" : "bg-blue-600 text-white hover:bg-blue-700 shadow-indigo-500/30"}`}>
            <Save size={15} /> {saved ? "Saved ✓" : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}