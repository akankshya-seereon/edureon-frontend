import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Save, X, Check, ChevronDown, BookOpen, Clock, Hash,
  Layers, AlertCircle, FileText, Send, CheckCircle,
  Bell, Search, GraduationCap, CalendarDays, MessageSquare,
  Inbox, Trash2, Receipt, Plus, User
} from "lucide-react";
import apiBaseUrl from "../../../config/baseurl";

// ─── Token Helper ─────────────────────────────────────────────────────────────
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user?.token || user?.data?.token;
  }
  return token;
};

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

const defaultFS = { studentId: "", course: "", fees: [{ feeTitle: "", amount: "" }], semesters: [], status: "Draft" };

// ─── Semester Grid ─────────────────────────────────────────────────────────────
const SemesterGrid = ({ total, selected, onToggle, onCopyAll }) => (
  <div className="space-y-3">
    <div className="flex justify-end">
      <button 
        type="button" 
        onClick={onCopyAll}
        className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
      >
        Copy to All Semesters
      </button>
    </div>
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
  </div>
);

// ─── Fee Structure Form ────────────────────────────────────────────────────────
const FeeStructureForm = ({ students, onSaved }) => {
  const [form, setForm] = useState(defaultFS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showStudentDropdown) return;
    const handler = (e) => {
      if (!e.target.closest("#student-field-wrapper")) {
        setShowStudentDropdown(false);
        setStudentSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showStudentDropdown]);

  const course = COURSES.find(c => c.name === form.course);
  const selectedStudent = students.find(s => String(s.id) === String(form.studentId));

  const filteredStudents = students.filter(s => {
    if (!studentSearch) return true;
    const q = studentSearch.toLowerCase();
    const name = (s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim()).toLowerCase();
    const roll = (s.roll_no || s.roll || "").toLowerCase();
    return name.includes(q) || roll.includes(q);
  });

  const addFeeRow = () => {
    setForm(p => ({ ...p, fees: [...p.fees, { feeTitle: "", amount: "" }] }));
  };

  const removeFeeRow = (index) => {
    setForm(p => ({ ...p, fees: p.fees.filter((_, i) => i !== index) }));
  };

  const updateFeeRow = (index, field, value) => {
    const updatedFees = [...form.fees];
    updatedFees[index][field] = value;
    setForm(p => ({ ...p, fees: updatedFees }));
    if (errors[`fee_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`fee_${index}_${field}`]: undefined }));
    }
  };

  const toggleSem = (s) => setForm(p => ({
    ...p,
    semesters: p.semesters.includes(s)
      ? p.semesters.filter(x => x !== s)
      : [...p.semesters, s].sort((a, b) => a - b),
  }));

  const copyToAllSems = () => {
    if(!course) return;
    const allSems = Array.from({ length: course.semesters }, (_, i) => i + 1);
    setForm(p => ({ ...p, semesters: allSems }));
  };

  const validate = () => {
    const e = {};
    if (!form.course) e.course = "Select a course";
    form.fees.forEach((fee, i) => {
      if (!fee.feeTitle) e[`fee_${i}_feeTitle`] = "Select fee type";
      if (!fee.amount || isNaN(fee.amount) || Number(fee.amount) <= 0) e[`fee_${i}_amount`] = "Enter valid amount";
    });
    if (form.semesters.length === 0) e.semesters = "Select at least one semester";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const promises = form.fees.map(f => {
      const payload = {
        course: form.course,
        feeTitle: f.feeTitle, 
        amountPerSem: Number(f.amount),
        totalAmount: Number(f.amount) * form.semesters.length,
        semesters: form.semesters, 
        status: "Draft",
        student_id: form.studentId ? Number(form.studentId) : null,
        studentId: form.studentId ? Number(form.studentId) : null
      };
      return axios.post(`${apiBaseUrl}/admin/fees/create`, payload, getAuthHeaders());
    });

    try {
      await Promise.all(promises);
      setSaved(true);
      setForm(defaultFS);
      setStudentSearch("");
      setErrors({});
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save fee structure");
    } finally {
      setSaving(false);
    }
  };

  const totalPerSem = form.fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const grandTotal = totalPerSem * form.semesters.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
      <div className="bg-blue-600 px-6 py-5 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-xl"><Layers size={18} className="text-white" /></div>
        <div>
          <h2 className="text-white font-black text-lg">Fee Structure</h2>
          <p className="text-blue-200 text-xs mt-0.5">Define course-wise fee configuration</p>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ── STUDENT FIELD ── */}
        <div className="space-y-1.5" id="student-field-wrapper">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            <User size={10} /> Assign To Student
            <span className="text-slate-400 font-bold normal-case text-[9px] ml-1">(Optional: Leave empty for all students)</span>
          </label>

          <div className="relative">
            <div
              onClick={() => { setShowStudentDropdown(p => !p); setStudentSearch(""); }}
              className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold cursor-pointer flex items-center justify-between transition-all select-none
                ${showStudentDropdown ? "border-blue-600 ring-2 ring-blue-100 bg-white" : "border-slate-200 bg-slate-50 hover:border-blue-300"}`}
            >
              {selectedStudent ? (
                <span className="text-blue-700 flex items-center gap-2">
                  {selectedStudent.name || `${selectedStudent.first_name || ""} ${selectedStudent.last_name || ""}`.trim()}
                  <span className="text-xs font-bold bg-blue-100 px-2 py-0.5 rounded-md text-blue-600">
                    {selectedStudent.roll_no || selectedStudent.roll || "No Roll"}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400 text-sm font-medium">Search & Select Student...</span>
              )}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {selectedStudent && (
                  <button type="button" onClick={e => { e.stopPropagation(); setForm(p => ({ ...p, studentId: "" })); }} className="p-0.5 text-slate-400 hover:text-red-500 rounded transition-colors">
                    <X size={14} />
                  </button>
                )}
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showStudentDropdown ? "rotate-180" : ""}`} />
              </div>
            </div>

            {showStudentDropdown && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input autoFocus value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Search by name or roll no..." className="w-full pl-7 pr-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-all" />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredStudents.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-5">No students match your search</p>
                  ) : (
                    filteredStudents.map(s => {
                      const name = s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Unknown";
                      const roll = s.roll_no || s.roll || "N/A";
                      const studentCourse = s.course_name || s.course || "";
                      const isActive = String(s.id) === String(form.studentId);
                      return (
                        <div key={s.id} onClick={() => {
                            setForm(p => ({ ...p, studentId: String(s.id), course: studentCourse || p.course }));
                            setShowStudentDropdown(false);
                            setStudentSearch("");
                          }}
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${isActive ? "bg-blue-50" : "hover:bg-slate-50"}`}>
                          <div>
                            <p className={`text-sm font-semibold ${isActive ? "text-blue-700" : "text-slate-700"}`}>{name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{roll}{studentCourse ? ` · ${studentCourse}` : ""}</p>
                          </div>
                          {isActive && <Check size={14} className="text-blue-600 flex-shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

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
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <FileText size={10} /> Fee Breakdowns <span className="text-red-500">*</span>
            </label>
            <button type="button" onClick={addFeeRow} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={12}/> Add Fee
            </button>
          </div>
          
          <div className="space-y-2">
            {form.fees.map((fee, idx) => (
              <div key={idx} className="flex gap-2 items-start relative bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1 space-y-1">
                  <div className="relative">
                    <select value={fee.feeTitle} onChange={e => updateFeeRow(idx, 'feeTitle', e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border text-xs font-semibold outline-none appearance-none transition-all
                        ${errors[`fee_${idx}_feeTitle`] ? "border-red-400 bg-red-50" : "border-slate-200 bg-white focus:border-blue-600"}`}>
                      <option value="">Select Fee Type</option>
                      {FEE_TITLES.map(t => <option key={t} disabled={form.fees.some((f, i) => f.feeTitle === t && i !== idx)}>{t}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {errors[`fee_${idx}_feeTitle`] && <p className="text-[10px] text-red-600 font-medium">{errors[`fee_${idx}_feeTitle`]}</p>}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black text-xs">₹</span>
                    <input type="number" value={fee.amount} onChange={e => updateFeeRow(idx, 'amount', e.target.value)} placeholder="Amount"
                      className={`w-full pl-7 pr-3 py-2.5 rounded-lg border text-xs font-semibold outline-none transition-all
                        ${errors[`fee_${idx}_amount`] ? "border-red-400 bg-red-50" : "border-slate-200 bg-white focus:border-blue-600"}`} />
                  </div>
                  {errors[`fee_${idx}_amount`] && <p className="text-[10px] text-red-600 font-medium">{errors[`fee_${idx}_amount`]}</p>}
                </div>

                {form.fees.length > 1 && (
                  <button type="button" onClick={() => removeFeeRow(idx)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-0.5">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {course ? (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1"><Hash size={10} /> Select Semesters <span className="text-red-500">*</span></span>
              {form.semesters.length > 0 && (
                <span className="text-blue-600 font-bold normal-case">{form.semesters.length} selected</span>
              )}
            </label>
            <SemesterGrid total={course.semesters} selected={form.semesters} onToggle={toggleSem} onCopyAll={copyToAllSems} />
            {errors.semesters && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{errors.semesters}</p>}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-400 font-semibold">Select a course to see semester options</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving || saved}
          className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all mt-4
            ${saved ? "bg-emerald-500 text-white"
            : saving ? "bg-blue-400 text-white cursor-wait"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
          {saved ? <><CheckCircle size={16} /> Saved!</> : saving ? "Saving..." : <><Save size={16} /> Save Fee Structure</>}
        </button>
      </div>
    </div>
  );
};

// ─── Student Fee Notification Panel (UPDATED FOR HISTORY AND TARGETING) ────────
const StudentFeeNotification = ({ structures, students, onSent }) => {
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectedFee, setSelectedFee] = useState("");
  const [message, setMessage] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [notifHistory, setNotifHistory] = useState([]);
  const [tab, setTab] = useState("send");

  useEffect(() => {
    if (tab === "history") {
      axios.get(`${apiBaseUrl}/admin/fees/notifications`, getAuthHeaders())
        .then(res => setNotifHistory(res.data.notifications || []))
        .catch(err => console.error("Failed to load notifications", err));
    }
  }, [tab]);

  const filtered = students.filter(s => {
    if (!s) return false;
    const q = search.toLowerCase();
    const fName = s.first_name || s.name || "";
    const lName = s.last_name || "";
    const fullName = `${fName} ${lName}`.toLowerCase();
    const rollMatch = (s.roll_no || s.roll || "").toLowerCase().includes(q);
    const courseMatch = (s.course_name || s.course || "").toLowerCase().includes(q);
    return fullName.includes(q) || rollMatch || courseMatch;
  });

  const toggleStudent = (id) =>
    setSelectedStudents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const toggleAll = () => {
    if (selectedStudents.length === filtered.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filtered.map(s => s.id));
    }
  };

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
      
      // 🚀 CRITICAL FIX: Send exactly which IDs this applies to so the backend 
      // can insert it into the student's personal notification module
      student_ids: selectedStudents, 
      
      students_snapshot: JSON.stringify(selectedStudents.map(id => {
        const s = students.find(st => String(st.id) === String(id));
        return s ? (s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim()) : "Unknown Student";
      })),
      message, 
      due_date: dueDate || null
    };

    try {
      await axios.post(`${apiBaseUrl}/admin/fees/notify`, payload, getAuthHeaders());
      setSent(true);
      setSelectedStudents([]); setSelectedFee(""); setMessage(""); setDueDate("");
      onSent?.();
      setTab("history");
    } catch (err) {
      toast.error("Failed to send notifications");
    } finally {
      setSending(false);
      setTimeout(() => setSent(false), 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {selectedStudents.length} selected
                  </span>
                  <button onClick={toggleAll} className="text-[10px] font-black text-slate-500 hover:text-slate-800">
                    Select All
                  </button>
                </div>
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
                const displayName = st.name || `${st.first_name || ""} ${st.last_name || ""}`.trim() || "Unknown Student";
                const displayCourse = st.course_name || st.course || "No Course";
                const displayRoll = st.roll_no || st.roll || "N/A";

                return (
                  <div key={st.id} onClick={() => toggleStudent(st.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                      {isSelected && <Check size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{displayRoll} · {displayCourse}</p>
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
          {/* 🚀 CRITICAL FIX: The History Tab now shows the Student Name & Payment Status */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {notifHistory.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">No notifications sent yet.</p>
            ) : (
              notifHistory.map(n => {
                // Safely parse the student names
                let parsedNames = [];
                try { parsedNames = JSON.parse(n.students_snapshot || "[]"); } catch(e) {}
                const namesList = parsedNames.length > 0 ? parsedNames.join(", ") : "All Students";

                // Determines Payment Badge logic based on status and due dates
                // Falls back to generic logic if your backend isn't sending a `payment_status` yet
                const isPaid = n.payment_status === 'Paid' || n.payment_status === 'Cleared' || n.status === 'Paid';
                const isOverdue = !isPaid && n.due_date && new Date(n.due_date) < new Date();

                return (
                  <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-black text-slate-800">{n.fee_title}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1">
                          <User size={10} /> {namesList}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-700 block">₹{Number(n.amount).toLocaleString()}</span>
                        {/* Status Badges */}
                        {isPaid ? (
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">Payment Cleared</span>
                        ) : isOverdue ? (
                          <span className="text-[9px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded border border-red-200 mt-1 inline-block">Overdue</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">Payment Pending</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-2">
                      <span className="text-[9px] font-semibold text-slate-400">
                        {n.due_date ? `Due: ${new Date(n.due_date).toLocaleDateString()}` : "No Due Date"}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">Sent: {new Date(n.sent_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Fee Structure Table ───────────────────────────────────────────────────────
const FeeStructureTable = ({ structures, students, onDelete }) => {
  const studentSpecificStructures = structures.filter(fs => {
    const id = fs.student_id || fs.studentId || fs.studentID;
    return id && String(id) !== "null" && String(id) !== "0";
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-black text-slate-800">Student-Specific Fee Structures</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Student", "Course", "Fee Type", "Per Sem", "Total", ""].map(h => (
                <th key={h} className="px-4 py-3 text-[10px] font-black uppercase text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {studentSpecificStructures.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-400 text-sm font-semibold">
                  No student-specific fee structures found.
                </td>
              </tr>
            ) : (
              studentSpecificStructures.map((fs) => {
                const validStudentId = fs.student_id || fs.studentId || fs.studentID;
                const assignedStudent = students.find(s => String(s.id) === String(validStudentId));
                
                const studentName = assignedStudent 
                    ? (assignedStudent.name || `${assignedStudent.first_name || ""} ${assignedStudent.last_name || ""}`.trim()) 
                    : (fs.student_name || fs.studentName || "Unknown Student");

                return (
                  <tr key={fs.id} className="hover:bg-slate-50 group">
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100 inline-flex items-center gap-1">
                        <User size={10} /> {studentName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{fs.course}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-600">{fs.fee_title}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-700">₹{Number(fs.amount_per_sem).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-black text-slate-900">₹{Number(fs.total_amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(fs.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const FeeStructure = () => {
  const [structures, setStructures] = useState([]);
  const [students, setStudents] = useState([]); 

  const fetchData = async () => {
    try {
      const [fsRes, stRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/admin/fees/all`, getAuthHeaders()).catch(() => ({ data: { structures: [] } })),
        axios.get(`${apiBaseUrl}/admin/fees/students`, getAuthHeaders()).catch(() => ({ data: { students: [] } }))
      ]);
      setStructures(fsRes.data.structures || []);
      setStudents(stRes.data.students || []); 
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const deleteFS = async (id) => {
    if(!window.confirm("Delete this structure?")) return;
    try {
      await axios.delete(`${apiBaseUrl}/admin/fees/delete/${id}`, getAuthHeaders());
      toast.success("Deleted!");
      fetchData();
    } catch(err) { toast.error("Delete failed"); }
  };

  return (
    <div className="w-full font-sans text-left pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Configuration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-black text-slate-900">{structures.length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Structures</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-2xl font-black text-blue-600">{students.length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <FeeStructureForm students={students} onSaved={fetchData} />
        <StudentFeeNotification structures={structures} students={students} onSent={fetchData} />
      </div>

      <FeeStructureTable structures={structures} students={students} onDelete={deleteFS} />
    </div>
  );
};

export default FeeStructure;