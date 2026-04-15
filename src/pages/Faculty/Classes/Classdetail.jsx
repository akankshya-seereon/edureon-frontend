import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, CalendarDays, BookOpen, Users, CheckCircle,
  XCircle, Clock, GraduationCap, ClipboardList, BarChart2,
  FileText, AlertCircle, Eye, Loader2
} from "lucide-react";

const STATUS = { PRESENT: "present", ABSENT: "absent", LATE: "late" };

const statusConfig = {
  present: { label: "Present", icon: CheckCircle, pill: "bg-green-100 text-green-700 border-green-200", iconCls: "text-green-500", dot: "bg-green-400" },
  absent:  { label: "Absent",  icon: XCircle,      pill: "bg-red-100 text-red-700 border-red-200",      iconCls: "text-red-500",   dot: "bg-red-400"   },
  late:    { label: "Late",    icon: Clock,        pill: "bg-amber-100 text-amber-700 border-amber-200", iconCls: "text-amber-500", dot: "bg-amber-400" },
};

const assignmentStatus = {
  active:   { label: "Active",   cls: "bg-blue-100 text-blue-700"   },
  graded:   { label: "Graded",   cls: "bg-green-100 text-green-700" },
  upcoming: { label: "Upcoming", cls: "bg-gray-100 text-gray-600"   },
};

// ─── Avatar ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = "md" }) => {
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0`}>
      {name?.charAt(0) || "?"}
    </div>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ cls, studentCount }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
      {[
        { label: "Course Name",     value: cls.courseName,   icon: BookOpen },
        { label: "Class / Section", value: cls.classSection, icon: GraduationCap },
        { label: "Subject",         value: cls.subject,      icon: ClipboardList },
        { label: "Total Students",  value: studentCount,     icon: Users },
      ].map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      ))}
    </div>

    <div className="grid text-left lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-gray-800">Schedule Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Schedule</p>
              <p className="text-sm font-bold text-gray-900">{cls.schedule}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Academic Year</p>
              <p className="text-sm font-bold text-gray-900">{cls.academicYear}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-gray-800">Quick Stats</h3>
        <div className="space-y-3">
          {[
            { label: "Avg. Attendance", value: "88%",  bar: 88  },
            { label: "Assignments Due", value: "1",    bar: 25  },
            { label: "Class Progress",  value: "62%",  bar: 62  },
          ].map(({ label, value, bar }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-gray-600">
                <span>{label}</span><span className="font-bold text-gray-900">{value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${bar}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Student Detail Modal ─────────────────────────────────────────────────────
const StudentModal = ({ student, onClose }) => {
  if (!student) return null;
  const gradeColor = student.grade?.startsWith("A") ? "bg-green-100 text-green-700" : student.grade?.startsWith("B") ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700";
  const attNum = parseInt(student.attendance) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 px-6 pt-6 pb-10 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition text-lg font-bold">×</button>
          <div className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center text-2xl font-black mx-auto mb-3">{student.name.charAt(0)}</div>
          <h2 className="text-xl font-black text-white">{student.name}</h2>
          <p className="text-blue-200 text-xs font-mono mt-1">{student.studentId}</p>
        </div>
        <div className="px-6 -mt-5 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md grid grid-cols-2 divide-x divide-gray-100 overflow-hidden">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Grade</p>
              <span className={`px-3 py-1 rounded-lg text-sm font-black ${gradeColor}`}>{student.grade}</span>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Attendance</p>
              <p className="text-sm font-black text-gray-900">{student.attendance}%</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Attendance Progress</p>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${attNum >= 90 ? "bg-green-500" : attNum >= 75 ? "bg-blue-500" : "bg-amber-500"}`} style={{ width: `${attNum}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[ { label: "Student ID", value: student.studentId }, { label: "Current Grade", value: student.grade }, { label: "Assignments", value: "12/14" }, { label: "Status", value: "Active" } ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-medium mb-0.5 text-left">{label}</p>
                <p className="text-sm font-bold text-gray-900 text-left">{value}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ClassDetail = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { state } = useLocation();
  const navigate = useNavigate();
  const cls = state?.cls;
  const token = localStorage.getItem("token");

  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saved, setSaved] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Fetch Logic
  useEffect(() => {
    if (!cls?.id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [stuRes, assignRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/faculty/classes/${cls.id}/students`, { headers }),
          axios.get(`http://localhost:5000/api/faculty/classes/${cls.id}/assignments`, { headers })
        ]);
        if (stuRes.data.success) {
          setStudents(stuRes.data.data);
          setAttendance(Object.fromEntries(stuRes.data.data.map(s => [s.id, null])));
        }
        if (assignRes.data.success) setAssignments(assignRes.data.data);
      } catch (err) { console.error("Error loading data", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [cls?.id, token]);

  const mark = (id, status) => { setSaved(false); setAttendance(p => ({ ...p, [id]: p[id] === status ? null : status })); };
  const markAll = (status) => { setSaved(false); setAttendance(Object.fromEntries(students.map(s => [s.id, status]))); };

  const handleSaveAttendance = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/api/faculty/classes/${cls.id}/attendance`, 
        { date, attendanceData: attendance }, { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    } catch (err) { alert("Error saving attendance"); }
  };

  const handleAddAssignment = async (newAssign) => {
    try {
        const res = await axios.post(`http://localhost:5000/api/faculty/classes/${cls.id}/assignments`, 
            newAssign, { headers: { Authorization: `Bearer ${token}` } }
        );
        if(res.data.success) {
            setAssignments(p => [res.data.data, ...p]);
        }
    } catch (err) { alert("Error creating assignment"); }
  };

  const tabs = [
    { key: "overview",    label: "Overview",    icon: BarChart2     },
    { key: "students",    label: "Students",    icon: Users         },
    { key: "attendance",   label: "Attendance",   icon: CheckCircle   },
    { key: "assignments",  label: "Assignments",  icon: ClipboardList },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500 font-bold animate-pulse">Loading Class Information...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-blue-600 px-6 pt-6 pb-20">
        <button onClick={() => navigate("/faculty/classes")} className="flex items-center gap-2 text-blue-100 hover:text-white transition text-sm font-medium mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to My Classes
        </button>
        <div className="max-w-8xl mx-auto space-y-3">
          <div className="flex flex-col items-start gap-3 w-full">
            <h1 className="text-3xl font-black text-white tracking-tight text-left">{cls.courseName}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-3 py-0.5 text-xs font-semibold backdrop-blur">{cls.classSection}</span>
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-3 py-0.5 text-xs font-semibold backdrop-blur">{cls.subject}</span>
              <span className="bg-white/20 text-white border border-white/30 rounded-full px-3 py-0.5 text-xs font-semibold backdrop-blur">{cls.academicYear}</span>
              <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-0.5 backdrop-blur">
                <Users className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-xs font-semibold">{students.length} students</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-8xl mx-auto px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-1.5 flex gap-1 w-fit">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === key ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-8xl mx-auto px-6 py-6">
        {activeTab === "overview" && <OverviewTab cls={cls} studentCount={students.length} />}
        
        {activeTab === "students" && (
          <>
            {selectedStudent && <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Enrolled Students</h3>
                <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">{students.length} students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/60 text-xs text-gray-400 uppercase tracking-wide font-semibold">
                      <th className="px-6 py-3">Student</th>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Grade</th>
                      <th className="px-6 py-3">Attendance</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="px-6 py-3.5 flex items-center gap-3">
                          <Avatar name={s.name} size="sm" /> <span className="font-semibold text-gray-900">{s.name}</span>
                        </td>
                        <td className="px-6 py-3.5 text-gray-400 font-mono text-xs">{s.studentId}</td>
                        <td className="px-6 py-3.5"><span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${s.grade?.startsWith("A") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>{s.grade}</span></td>
                        <td className="px-6 py-3.5 flex items-center gap-2">
                           <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.attendance}%` }} /></div>
                           <span className="text-xs font-semibold text-gray-600">{s.attendance}%</span>
                        </td>
                        <td className="px-6 py-3.5"><button onClick={() => setSelectedStudent(s)} className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"><Eye className="w-3.5 h-3.5" /> View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "attendance" && (
           <div className="space-y-5">
             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <CalendarDays className="w-4 h-4 text-blue-500" />
                 <input type="date" value={date} max={new Date().toISOString().split("T")[0]} onChange={(e) => { setDate(e.target.value); setSaved(false); }} className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm font-bold text-gray-800 outline-none" />
               </div>
               <div className="flex items-center gap-2">
                 {['present', 'absent', 'late'].map(s => (
                   <button key={s} onClick={() => markAll(s)} className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${statusConfig[s].pill}`}>Mark All {statusConfig[s].label}</button>
                 ))}
               </div>
             </div>

             <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="divide-y divide-gray-50">
                 {students.map((student) => {
                   const current = attendance[student.id];
                   return (
                     <div key={student.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-blue-50/30 transition-colors">
                       <div className="flex items-center gap-3 text-left">
                         <Avatar name={student.name} size="sm" />
                         <div><p className="text-sm font-semibold text-gray-900">{student.name}</p><p className="text-xs text-gray-400 font-mono">{student.studentId}</p></div>
                       </div>
                       <div className="flex items-center gap-2">
                         {Object.values(STATUS).map(s => {
                           const isActive = current === s;
                           const cfg = statusConfig[s];
                           return (
                             <button key={s} onClick={() => mark(student.id, s)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${isActive ? cfg.pill : "border-gray-200 text-gray-400 bg-white"}`}>
                               <cfg.icon className={`w-3.5 h-3.5 ${isActive ? cfg.iconCls : ""}`} /> <span className="hidden sm:inline">{cfg.label}</span>
                             </button>
                           );
                         })}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </div>
             <div className="flex items-center gap-4">
               <button onClick={handleSaveAttendance} disabled={students.length === 0} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm active:scale-95">Save Attendance</button>
               {saved && <span className="flex items-center gap-1.5 text-sm text-green-600 font-semibold animate-bounce"><CheckCircle className="w-4 h-4" /> Saved successfully</span>}
             </div>
           </div>
        )}

        {activeTab === "assignments" && (
           <>
           {showAssignModal && <NewAssignmentModal onClose={() => setShowAssignModal(false)} onAdd={handleAddAssignment} />}
           <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">Assignments</h3>
                  <button onClick={() => setShowAssignModal(true)} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">+ New</button>
                </div>
                <div className="divide-y divide-gray-50">
                  {assignments.map(a => (
                    <div key={a.id} className="px-6 py-4 hover:bg-blue-50/30 transition-colors">
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex items-start gap-3 text-left">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5"><FileText className="w-4 h-4 text-blue-600" /></div>
                            <div className="space-y-1"><p className="text-sm font-bold text-gray-900">{a.title}</p><p className="text-xs text-gray-400">Due {new Date(a.dueDate).toLocaleDateString()}</p></div>
                         </div>
                         <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${assignmentStatus[a.status]?.cls}`}>{a.status}</span>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
           </div>
           </>
        )}
      </div>
    </div>
  );
};

// Modals
const NewAssignmentModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ title: "", dueDate: "", status: "upcoming" });
  const [error, setError] = useState("");
  const handleSubmit = () => {
    if (!form.title.trim() || !form.dueDate) return setError("Please fill all fields.");
    onAdd(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
          <h2 className="text-base font-black text-white">New Assignment</h2>
          <button onClick={onClose} className="text-white text-xl font-bold">×</button>
        </div>
        <div className="px-6 py-5 space-y-4 text-left">
          {error && <div className="text-red-500 text-xs font-bold">⚠️ {error}</div>}
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Title</label><input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" placeholder="Chapter Name" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-xs font-bold text-gray-400 uppercase">Due Date</label><input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} /></div>
          <div className="flex gap-3"><button onClick={onClose} className="flex-1 py-2.5 border rounded-xl text-sm font-bold">Cancel</button><button onClick={handleSubmit} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold">Add</button></div>
        </div>
      </div>
    </div>
  );
};