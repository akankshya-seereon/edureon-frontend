import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Save, X, Check, ChevronDown, BookOpen, Clock, Hash,
  DollarSign, Layers, AlertCircle, FileText, Send, CheckCircle,
  Bell, Search, GraduationCap, CalendarDays, MessageSquare,
  UserCheck, Megaphone, Inbox, Trash2, Receipt
} from "lucide-react";

// ─── Token Helper ─────────────────────────────────────────────────────────────
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user?.token || user?.data?.token;
  }
  return token;
};

// Fixed Header Configuration
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` }
});

// ─── Constants ────────────────────────────────────────────────────────────────
const COURSES = [
  { name: "B.Tech Computer Science", duration: 4, semesters: 8 },
  { name: "B.Tech Information Technology", duration: 4, semesters: 8 },
  { name: "B.Tech Electronics & Communication", duration: 4, semesters: 8 },
  { name: "B.Tech Mechanical Engineering", duration: 4, semesters: 8 },
  { name: "B.Tech Civil Engineering", duration: 4, semesters: 8 },
  { name: "B.Sc Computer Science", duration: 3, semesters: 6 },
  { name: "B.Sc Mathematics", duration: 3, semesters: 6 },
  { name: "B.Sc Physics", duration: 3, semesters: 6 },
  { name: "MBA", duration: 2, semesters: 4 },
  { name: "BBA", duration: 3, semesters: 6 },
  { name: "M.Tech", duration: 2, semesters: 4 },
  { name: "MCA", duration: 2, semesters: 4 },
];

const FEE_TITLES = [
  "Tuition Fee", "Exam Fee", "Lab Fee", "Library Fee",
  "Sports Fee", "Infrastructure Fee", "Development Fee", "Hostel Fee",
];

const defaultFS = { course: "", feeTitle: "", semesters: [], amountPerSem: "", status: "Draft" };

// ─── Semester Grid ─────────────────────────────────────────────────────────────
const SemesterGrid = ({ total, selected, onToggle }) => (
  <div className="grid grid-cols-4 gap-2">
    {Array.from({ length: total }, (_, i) => i + 1).map(sem => {
      const active = selected.includes(sem);
      return (
        <button key={sem} type="button" onClick={() => onToggle(sem)}
          className={`relative h-11 rounded-xl font-black text-sm transition-all duration-200 border-2 ${
            active
              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
          }`}>
          {active && <Check size={10} className="absolute top-1 right-1" />}
          S{sem}
        </button>
      );
    })}
  </div>
);

// ─── Fee Structure Form ────────────────────────────────────────────────────────
const FeeStructureForm = ({ onSaved }) => {
  const [form, setForm] = useState(defaultFS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const course = COURSES.find(c => c.name === form.course);

  const toggleSem = (s) => setForm(p => ({
    ...p,
    semesters: p.semesters.includes(s)
      ? p.semesters.filter(x => x !== s)
      : [...p.semesters, s].sort((a, b) => a - b),
  }));

  const validate = () => {
    const e = {};
    if (!form.course) e.course = "Select a course";
    if (!form.feeTitle) e.feeTitle = "Select fee type";
    if (!form.amountPerSem || isNaN(form.amountPerSem) || Number(form.amountPerSem) <= 0)
      e.amountPerSem = "Enter valid amount";
    if (form.semesters.length === 0) e.semesters = "Select at least one semester";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    
    // UPDATED: Mapping to match backend SQL columns
    const payload = {
      course: form.course,
      feeTitle: form.feeTitle, // Backend handles the mapping to fee_title
      amountPerSem: Number(form.amountPerSem),
      totalAmount: Number(form.amountPerSem) * form.semesters.length,
      semesters: form.semesters, // Backend handles stringify
      status: "Draft"
    };

    try {
      // UPDATED URL: Changed to /fees/create
      await axios.post("http://localhost:5000/api/admin/fees/create", payload, getAuthHeaders());
      setSaved(true);
      setForm(defaultFS); 
      setErrors({});
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save fee structure");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-blue-600 px-6 py-5 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl"><Layers size={18} className="text-white" /></div>
        <div>
          <h2 className="text-white font-black text-lg">Fee Structure</h2>
          <p className="text-blue-200 text-xs mt-0.5">Define course-wise fee configuration</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <BookOpen size={10} /> Course Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select value={form.course}
              onChange={e => setForm(p => ({ ...p, course: e.target.value, semesters: [] }))}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold outline-none appearance-none transition-all
                ${errors.course ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}>
              <option value="">Select Course</option>
              {COURSES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {errors.course && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.course}</p>}
          {course && (
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <Clock size={11} /> {course.duration} years
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
                <Hash size={11} /> {course.semesters} semesters
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <FileText size={10} /> Fee Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select value={form.feeTitle} onChange={e => setForm(p => ({ ...p, feeTitle: e.target.value }))}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold outline-none appearance-none transition-all
                ${errors.feeTitle ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}>
              <option value="">Select Fee Type</option>
              {FEE_TITLES.map(t => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          {errors.feeTitle && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.feeTitle}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <DollarSign size={10} /> Amount Per Semester <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black text-sm">₹</span>
            <input type="number" value={form.amountPerSem}
              onChange={e => setForm(p => ({ ...p, amountPerSem: e.target.value }))}
              placeholder="0"
              className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-semibold outline-none transition-all
                ${errors.amountPerSem ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`} />
          </div>
          {errors.amountPerSem && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.amountPerSem}</p>}
        </div>

        {course ? (
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1"><Hash size={10} /> Select Semesters <span className="text-red-500">*</span></span>
              {form.semesters.length > 0 && (
                <span className="text-blue-600 font-bold normal-case">{form.semesters.length} selected</span>
              )}
            </label>
            <SemesterGrid total={course.semesters} selected={form.semesters} onToggle={toggleSem} />
            {errors.semesters && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.semesters}</p>}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-semibold">Select a course to see semester options</p>
          </div>
        )}

        {form.course && form.semesters.length > 0 && form.amountPerSem && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl border border-blue-100">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Per Semester</span>
                <span className="text-slate-800 font-bold">₹{Number(form.amountPerSem).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-semibold">Semesters</span>
                <span className="text-slate-800 font-bold">{form.semesters.length} ({form.semesters.map(s => `S${s}`).join(", ")})</span>
              </div>
              <div className="border-t border-blue-200 pt-2 flex justify-between">
                <span className="text-xs font-black text-slate-700">Total Amount</span>
                <span className="text-base font-black text-blue-600">
                  ₹{(Number(form.amountPerSem) * form.semesters.length).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving || saved}
          className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all
            ${saved ? "bg-emerald-500 text-white"
            : saving ? "bg-blue-400 text-white cursor-wait"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? "Saving..." : <><Save size={16} /> Save Fee Structure</>}
        </button>
      </div>
    </div>
  );
};

// ─── Student Fee Notification Panel ───────────────────────────────────────────
const StudentFeeNotification = ({ structures, onSent }) => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFee, setSelectedFee] = useState("");
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [notifHistory, setNotifHistory] = useState([]);
  const [tab, setTab] = useState("send");

  const fetchPanelData = async () => {
    try {
      // UPDATED URLs: Changed to /students and /fees/notifications
      const [stRes, notifRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/students", getAuthHeaders()),
        axios.get("http://localhost:5000/api/admin/fees/notifications", getAuthHeaders()).catch(() => ({ data: { notifications: [] } }))
      ]);
      
      setStudents(stRes.data.students || []);
      setNotifHistory(notifRes.data.notifications || []);
    } catch (error) {
      console.error("Failed to load panel data", error);
    }
  };

  useEffect(() => { fetchPanelData(); }, [tab]);

  const filtered = students.filter(s =>
    s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_no?.toLowerCase().includes(search.toLowerCase()) ||
    s.course_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStudent = (id) =>
    setSelectedStudents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const toggleAll = () =>
    setSelectedStudents(selectedStudents.length === filtered.length ? [] : filtered.map(s => s.id));

  const selectedFeeObj = structures.find(f => String(f.id) === String(selectedFee));

  const handleSend = async () => {
    if (selectedStudents.length === 0 || !selectedFee) return;
    setSending(true);
    
    const payload = {
      fee_id: selectedFee,
      fee_title: selectedFeeObj?.fee_title,
      course: selectedFeeObj?.course,
      amount: selectedFeeObj?.total_amount,
      student_count: selectedStudents.length,
      students_snapshot: JSON.stringify(selectedStudents.map(id => students.find(s => s.id === id)?.first_name)),
      message, 
      due_date: dueDate || null
    };

    try {
      // UPDATED URL: Changed to /fees/notify
      await axios.post("http://localhost:5000/api/admin/fees/notify", payload, getAuthHeaders());
      setSent(true);
      setSelectedStudents([]); setSelectedFee(""); setMessage(""); setDueDate("");
      onSent?.();
      fetchPanelData();
      setTimeout(() => { setSent(false); setTab("history"); }, 1500);
    } catch (err) {
      toast.error("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl"><Bell size={18} className="text-white" /></div>
          <div>
            <h2 className="text-white font-black text-lg">Fee Notifications</h2>
            <p className="text-blue-200 text-xs mt-0.5">Send fee details to students</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white/10 rounded-xl p-1">
          {[{ key: "send", label: "Send", Icon: Send }, { key: "history", label: "History", Icon: Inbox }].map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                ${tab === key ? "bg-white text-blue-700" : "text-white/80 hover:text-white"}`}>
              <Icon size={12} />{label}
            </button>
          ))}
        </div>
      </div>

      {tab === "send" ? (
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Receipt size={10} /> Select Fee Structure <span className="text-red-500">*</span>
            </label>
            {structures.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-semibold text-amber-700">No fee structures available.</p>
              </div>
            ) : (
              <div className="relative">
                <select value={selectedFee} onChange={e => setSelectedFee(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all">
                  <option value="">Select Fee Structure</option>
                  {structures.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.course} — {f.fee_title} (₹{Number(f.total_amount).toLocaleString()})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <CalendarDays size={10} /> Due Date
              </label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <MessageSquare size={10} /> Note (Optional)
              </label>
              <input type="text" value={message} onChange={e => setMessage(e.target.value)}
                placeholder="e.g. Pay before deadline"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                <GraduationCap size={10} /> Select Students <span className="text-red-500">*</span>
              </label>
              {selectedStudents.length > 0 && (
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedStudents.length} selected
                </span>
              )}
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all" />
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {filtered.map(st => {
                const isSelected = selectedStudents.includes(st.id);
                return (
                  <div key={st.id} onClick={() => toggleStudent(st.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{st.first_name} {st.last_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{st.roll_no} · {st.course_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={handleSend}
            disabled={sending || sent || selectedStudents.length === 0 || !selectedFee}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all
              ${sent ? "bg-emerald-500 text-white"
              : sending ? "bg-blue-400 text-white cursor-wait"
              : selectedStudents.length === 0 || !selectedFee
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
            {sent ? <><CheckCircle size={16} /> Sent!</> : sending ? "Sending..." : <><Send size={16} /> Send Notifications</>}
          </button>
        </div>
      ) : (
        <div className="p-5">
          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {notifHistory.map(n => (
              <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-black text-slate-800">{n.fee_title}</p>
                  <span className="text-sm font-black text-blue-700">₹{Number(n.amount).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-bold text-emerald-600">Sent to {n.student_count} students</span>
                  <span className="text-[9px] text-slate-400">{new Date(n.sent_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Fee Structure Table ───────────────────────────────────────────────────────
const FeeStructureTable = ({ structures, onDelete, onPublish }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-slate-100">
      <h3 className="font-black text-slate-800">Fee Structures</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            {["Course", "Fee Type", "Per Sem", "Total", "Status", ""].map(h => (
              <th key={h} className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {structures.map((fs) => (
            <tr key={fs.id} className="hover:bg-slate-50 group">
              <td className="px-4 py-3 text-sm font-bold text-slate-800">{fs.course}</td>
              <td className="px-4 py-3 text-xs font-bold text-slate-600">{fs.fee_title}</td>
              <td className="px-4 py-3 text-sm font-bold text-slate-700">₹{Number(fs.amount_per_sem).toLocaleString()}</td>
              <td className="px-4 py-3 text-sm font-black text-slate-900">₹{Number(fs.total_amount).toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                  fs.status === "Published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                }`}>{fs.status}</span>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  {fs.status === "Draft" && (
                    <button onClick={() => onPublish(fs.id)} className="text-emerald-600"><Send size={14} /></button>
                  )}
                  <button onClick={() => onDelete(fs.id)} className="text-red-400"><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const FeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [studentsCount, setStudentsCount] = useState(0);

  const fetchStructures = async () => {
    try {
      const [fsRes, stRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/fees/all", getAuthHeaders()),
        axios.get("http://localhost:5000/api/admin/students", getAuthHeaders())
      ]);
      setStructures(fsRes.data.structures || []);
      setStudentsCount(stRes.data.students?.length || 0);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => { fetchStructures(); }, []);

  const deleteFS = async (id) => {
    if(!window.confirm("Delete this structure?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/fees/delete/${id}`, getAuthHeaders());
      toast.success("Deleted!");
      fetchStructures();
    } catch(err) { toast.error("Delete failed"); }
  };

  const publishFS = async (id) => {
    try {
      // In the new system, update status to Published
      await axios.put(`http://localhost:5000/api/admin/fees/update/${id}`, { status: "Published" }, getAuthHeaders());
      toast.success("Published!");
      fetchStructures();
    } catch(err) { toast.error("Publish failed"); }
  };

  return (
    <div className="w-full font-sans text-left pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Configuration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-black text-slate-900">{structures.length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Structures</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-black text-emerald-600">{structures.filter(s => s.status === 'Published').length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Published</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-black text-blue-600">{studentsCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <FeeStructureForm onSaved={fetchStructures} />
        <StudentFeeNotification structures={structures} onSent={fetchStructures} />
      </div>

      <FeeStructureTable structures={structures} onDelete={deleteFS} onPublish={publishFS} />
    </div>
  );
};

export default FeeStructure;