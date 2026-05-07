import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import {
  STATUS_META,
  SEMESTER_OPTIONS,
  BATCH_OPTIONS,
  YEAR_OPTIONS,
} from "./Examstorage.jsx"; 
import apiBaseUrl from "../../../config/baseurl";

// 🎯 HELPER: Safely grabs the token from local storage
const getAuthConfig = () => {
  let token = localStorage.getItem("token");
  if (!token || token === "undefined") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      token = userObj?.token || userObj?.data?.token;
    } catch (e) {}
  }
  
  const config = { headers: {} }; 
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// ─── 🚀 Bulletproof Date Logic ────────────────────────────────────────────────
const calculateStatus = (dateStr, timeStr, durationMinutes) => {
  if (!dateStr || !timeStr) return "UNKNOWN";

  try {
    const examDate = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const startDateTime = new Date(
      examDate.getFullYear(), examDate.getMonth(), examDate.getDate(),
      hours, minutes, 0
    );

    const endDateTime = new Date(startDateTime.getTime() + (Number(durationMinutes) || 0) * 60000);
    const now = new Date();

    if (now < startDateTime) return "UPCOMING";
    if (now >= startDateTime && now <= endDateTime) return "ONGOING";
    return "COMPLETED";
  } catch (error) {
    console.error("Status calculation error:", error);
    return "UNKNOWN";
  }
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Select = ({ value, onChange, options, placeholder }) => (
  <select
    value={value}
    onChange={onChange}
    className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
  >
    <option value="" className="text-gray-900">{placeholder}</option>
    {options.map((o, index) => (
      <option key={`${o.value}-${index}`} value={o.value} className="text-gray-900">{o.label}</option>
    ))}
  </select>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
export const Examlist = () => {
  const navigate = useNavigate();
  const [exams, setExams]       = useState([]);
  const [dynamicBatches, setDynamicBatches] = useState([]); // 🚀 NEW: Store dynamic batches for the filter
  const [filters, setFilters]   = useState({ semester: "", batch: "", year: "", status: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading]   = useState(true); 

  // 🚀 DYNAMIC FETCH FROM MYSQL (Exams + Dropdown Data)
  const fetchData = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      if (!config.headers.Authorization) return;

      const [examsRes, formRes] = await Promise.all([
        axios.get(`${apiBaseUrl}/admin/exams`, config),
        axios.get(`${apiBaseUrl}/admin/exams/form-data`, config).catch(() => null)
      ]);

      if (examsRes.data.success) {
        setExams(examsRes.data.data || []);
      }
      
      if (formRes?.data?.success) {
        const batches = formRes.data.data.batches || [];
        setDynamicBatches(batches.map(b => ({ value: b.name, label: b.name })));
      }
    } catch (err) {
      console.error("Fetch Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const setFilter = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  const confirmDelete = (id) => setDeleteId(id);

  // 🚀 DYNAMIC DELETE TO MYSQL
  const handleDelete = async () => {
    try {
      const config = getAuthConfig();
      await axios.delete(`${apiBaseUrl}/admin/exams/${deleteId}`, config);

      // Update UI instantly
      setExams(exams.filter((e) => e.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Delete Exam Error:", err);
      alert("Failed to delete exam.");
    }
  };

  // 🎯 Status Enrichment
  const enriched = exams.map((ex) => ({
    ...ex,
    status: calculateStatus(ex.examDate || ex.exam_date, ex.startTime || ex.start_time, ex.duration),
  }));

  const total     = enriched.length;
  const upcoming  = enriched.filter((e) => e.status === "UPCOMING").length;
  const ongoing   = enriched.filter((e) => e.status === "ONGOING").length;
  const completed = enriched.filter((e) => e.status === "COMPLETED").length;

  const filtered = enriched.filter((ex) => {
    if (filters.semester && String(ex.semester) !== String(filters.semester)) return false;
    if (filters.batch    && String(ex.batch)    !== String(filters.batch))    return false;
    if (filters.year     && String(ex.year)     !== String(filters.year))     return false;
    if (filters.status   && ex.status   !== filters.status)   return false;
    return true;
  });

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  // Helper to cleanly format the hierarchical venue
  const getVenueString = (ex) => {
    const parts = [];
    if (ex.campus) parts.push(ex.campus);
    if (ex.building) parts.push(ex.building);
    if (ex.block) parts.push(`Blk ${ex.block}`);
    if (ex.floor) parts.push(`Fl ${ex.floor}`);
    if (ex.room) parts.push(`Rm ${ex.room}`);
    
    // Fallback to legacy 'venue' if it exists, otherwise TBA
    if (parts.length === 0) return ex.venue || 'TBA';
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 text-left">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 max-w-8xl mx-auto">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Exam Management</h1>
          <p className="text-sm font-semibold text-gray-500 mt-0.5">Schedule exams and build question papers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/admin/exams/create")}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95 uppercase tracking-wider"
          >
            + Schedule Exam
          </button>
        </div>
      </div>

      <div className="max-w-8xl mx-auto">
        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Exams" value={total}     icon="📋" color="bg-indigo-100 text-indigo-700" />
          <StatCard label="Upcoming"    value={upcoming}  icon="🗓" color="bg-blue-100 text-blue-700"   />
          <StatCard label="Ongoing"     value={ongoing}   icon="⏳" color="bg-emerald-100 text-emerald-700"  />
          <StatCard label="Completed"   value={completed} icon="✅" color="bg-gray-200 text-gray-700"   />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
          <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 mr-2">Filter By:</span>
          <Select value={filters.semester} onChange={setFilter("semester")} options={SEMESTER_OPTIONS} placeholder="All Semesters" />
          {/* 🚀 FIXED: Now uses real dynamic batches from your database! */}
          <Select value={filters.batch}    onChange={setFilter("batch")}    options={dynamicBatches.length > 0 ? dynamicBatches : BATCH_OPTIONS} placeholder="All Batches"   />
          <Select value={filters.year}     onChange={setFilter("year")}     options={YEAR_OPTIONS}     placeholder="All Years"     />
          <Select
            value={filters.status}
            onChange={setFilter("status")}
            options={[
              { value: "UPCOMING",  label: "Upcoming"  },
              { value: "ONGOING",   label: "Ongoing"   },
              { value: "COMPLETED", label: "Completed" },
            ]}
            placeholder="All Status"
          />
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => setFilters({ semester: "", batch: "", year: "", status: "" })}
              className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
            >
              ✕ Clear Filters
            </button>
          )}
        </div>

        {/* ── Exam Cards ── */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 font-bold animate-pulse">Loading Exams...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-gray-400 text-center shadow-sm">
            <p className="text-6xl mb-4">📭</p>
            <p className="font-black text-xl text-gray-700 tracking-tight">
              {exams.length === 0 ? "No exams scheduled yet" : "No exams match the filters"}
            </p>
            <p className="text-sm mt-2 text-gray-500 font-medium">
              {exams.length === 0 ? "Click 'Schedule Exam' to get started" : "Try adjusting the dropdown filters above"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((ex) => {
              const sm = STATUS_META[ex.status] || { bg: "#f3f4f6", color: "#4b5563", dot: "#9ca3af", label: "Unknown" };
              return (
                <div
                  key={ex.id}
                  className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-6 flex flex-col h-full group"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="font-black text-lg text-gray-900 truncate tracking-tight">{ex.title}</p>
                      {/* 🚀 NEW: Added the description field here */}
                      {ex.description && <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5 mb-1.5">{ex.description}</p>}
                      <p className="text-xs font-bold text-gray-500 mt-1.5 truncate">
                        {ex.specialization && <span className="text-blue-600">{ex.specialization}</span>}
                        {ex.specialization && <span className="mx-1.5 text-gray-300">•</span>}
                        {ex.subject} 
                        <span className="mx-1.5 text-gray-300">•</span> 
                        {ex.examType?.replace("_", " ")}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest flex-shrink-0 uppercase shadow-sm border border-black/5"
                      style={{ background: sm.bg, color: sm.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sm.dot }} />
                      {sm.label}
                    </span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6 flex-1">
                    {[
                      { label: "Batch & Sem", value: `${ex.batch || '-'} (Sem ${ex.semester || '-'})` },
                      { label: "Shift",       value: ex.examShift || '-' },
                      { label: "Date & Time", value: `${formatDate(ex.examDate || ex.exam_date)} • ${formatTime(ex.startTime || ex.start_time)}` },
                      { label: "Venue",       value: getVenueString(ex) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
                        <p className="text-xs font-bold text-gray-800 mt-1.5 truncate" title={value}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Marks row */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3.5 mb-6 border border-blue-100/50">
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-black text-blue-600/70 uppercase tracking-widest">Total Marks</p>
                      <p className="text-base font-black text-blue-900 mt-0.5">{ex.totalMarks || ex.total_marks}</p>
                    </div>
                    <div className="w-px h-8 bg-blue-200/50" />
                    <div className="text-center flex-1">
                      <p className="text-[9px] font-black text-indigo-600/70 uppercase tracking-widest">Passing</p>
                      <p className="text-base font-black text-indigo-900 mt-0.5">{ex.passingMarks || ex.passing_marks}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => navigate("/admin/exams/results", { state: { examId: ex.id } })}
                      className="flex-1 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all"
                    >
                      📊 Results
                    </button>
                    <button
                      onClick={() => navigate("/admin/exams/questions", { state: { semester: ex.semester, batch: ex.batch, year: ex.year } })}
                      className="flex-1 py-2.5 text-[11px] uppercase tracking-widest font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-100 hover:border-purple-600 transition-all"
                    >
                      📚 Qs
                    </button>
                    <button
                      onClick={() => navigate("/admin/exams/create", { state: { exam: ex } })}
                      className="w-10 flex items-center justify-center text-sm font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => confirmDelete(ex.id)}
                      className="w-10 flex items-center justify-center text-sm font-medium rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl mb-5 border border-red-100">
              🗑
            </div>
            <p className="text-xl font-black text-gray-900 tracking-tight mb-2">Delete Exam?</p>
            <p className="text-sm font-medium text-gray-500 mb-8 leading-relaxed">
              This will permanently remove the exam record, question paper, and any associated results. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-md shadow-red-500/30 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Examlist;