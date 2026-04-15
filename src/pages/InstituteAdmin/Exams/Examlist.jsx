import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import {
  STATUS_META,
  SEMESTER_OPTIONS,
  BATCH_OPTIONS,
  YEAR_OPTIONS,
} from "./Examstorage.jsx"; // Note: We removed getExamStatus from here

// ─── 🚀 NEW: Bulletproof Date Logic ───────────────────────────────────────────
const calculateStatus = (dateStr, timeStr, durationMinutes) => {
  if (!dateStr || !timeStr) return "UNKNOWN";

  try {
    // 1. Create a base date from the DB date string
    const examDate = new Date(dateStr);
    
    // 2. Parse the HH:mm or HH:mm:ss from the DB time string
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // 3. Construct the exact starting millisecond of the exam
    const startDateTime = new Date(
      examDate.getFullYear(),
      examDate.getMonth(),
      examDate.getDate(),
      hours,
      minutes,
      0
    );

    // 4. Construct the exact ending millisecond
    const endDateTime = new Date(startDateTime.getTime() + (Number(durationMinutes) || 0) * 60000);
    const now = new Date();

    // 5. Compare!
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
    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="" className="text-gray-900">{placeholder}</option>
    {options.map((o, index) => (
      <option key={`${o.value}-${index}`} value={o.value} className="text-gray-900">{o.label}</option>
    ))}
  </select>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────
const Examlist = () => {
  const navigate = useNavigate();
  const [exams, setExams]       = useState([]);
  const [filters, setFilters]   = useState({ semester: "", batch: "", year: "", status: "" });
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading]   = useState(true); 

  // 🚀 DYNAMIC FETCH FROM MYSQL
  const fetchExams = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem('token'); 
      if (!token || token === "undefined") {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        token = storedUser?.token || storedUser?.data?.token; 
      }
      if (!token || token === "undefined") return;

      const response = await axios.get("http://localhost:5000/api/admin/exams", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
      setExams(response.data.data || []);
}
    } catch (err) {
      console.error("Fetch Exams Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const setFilter = (field) => (e) =>
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));

  const confirmDelete = (id) => setDeleteId(id);

  // 🚀 DYNAMIC DELETE TO MYSQL
  const handleDelete = async () => {
    try {
      let token = localStorage.getItem('token'); 
      if (!token || token === "undefined") {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        token = storedUser?.token || storedUser?.data?.token; 
      }

      await axios.delete(`http://localhost:5000/api/admin/exams/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update UI instantly
      setExams(exams.filter((e) => e.id !== deleteId));
      setDeleteId(null);
      
    } catch (err) {
      console.error("Delete Exam Error:", err);
      alert("Failed to delete exam.");
    }
  };

  // 🎯 FIXED: Using the new, robust calculateStatus function
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-sm font-medium text-gray-600 mt-0.5">Schedule exams and build question papers</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/admin/exams/create")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all active:scale-95"
          >
            + Schedule Exam
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Exams" value={total}     icon="📋" color="bg-indigo-100 text-indigo-700" />
        <StatCard label="Upcoming"    value={upcoming}  icon="🗓" color="bg-blue-100 text-blue-700"   />
        <StatCard label="Ongoing"     value={ongoing}   icon="⏳" color="bg-green-100 text-green-700"  />
        <StatCard label="Completed"   value={completed} icon="✅" color="bg-gray-200 text-gray-700"   />
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <span className="text-sm font-bold text-gray-700">Filter:</span>
        <Select value={filters.semester} onChange={setFilter("semester")} options={SEMESTER_OPTIONS} placeholder="All Semesters" />
        <Select value={filters.batch}    onChange={setFilter("batch")}    options={BATCH_OPTIONS}    placeholder="All Batches"   />
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
            className="text-sm font-bold text-red-500 hover:text-red-700 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Exam Cards ── */}
      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold">Loading Exams...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-gray-400 text-center shadow-sm">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-bold text-lg text-gray-700">
            {exams.length === 0 ? "No exams scheduled yet" : "No exams match the filters"}
          </p>
          <p className="text-sm mt-1 text-gray-500 font-medium">
            {exams.length === 0 ? "Click 'Schedule Exam' to get started" : "Try adjusting the dropdown filters above"}
          </p>
          {exams.length === 0 && (
            <button
              onClick={() => navigate("/admin/exams/create")}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition"
            >
              + Schedule Exam
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((ex) => {
            const sm = STATUS_META[ex.status] || { bg: "#f3f4f6", color: "#4b5563", dot: "#9ca3af", label: "Unknown" };
            return (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col h-full"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-bold text-[15px] text-gray-900 truncate">{ex.title}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1">
                      {ex.subject} <span className="mx-1">•</span> {ex.examType?.replace("_", " ")}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wide flex-shrink-0 uppercase shadow-sm"
                    style={{ background: sm.bg, color: sm.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                    {sm.label}
                  </span>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-3 gap-2.5 mb-5 flex-1">
                  {[
                    { label: "Semester", value: `Sem ${ex.semester || '-'}`     },
                    { label: "Batch",    value: `${ex.batch || '-'}`      },
                    { label: "Year",     value: ex.year || '-'                  },
                    { label: "Date",     value: formatDate(ex.examDate || ex.exam_date)  },
                    { label: "Time",     value: formatTime(ex.startTime || ex.start_time) },
                    { label: "Duration", value: `${ex.duration || 0} min`     },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50/80 rounded-xl p-2.5 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-bold text-gray-800 mt-1 truncate">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Marks row */}
                <div className="flex items-center justify-between bg-blue-50/50 rounded-xl p-3 mb-5 border border-blue-100/50">
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Marks</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">{ex.totalMarks || ex.total_marks}</p>
                  </div>
                  <div className="w-px h-8 bg-blue-200/50" />
                  <div className="text-center flex-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Passing</p>
                    <p className="text-sm font-black text-gray-900 mt-0.5">{ex.passingMarks || ex.passing_marks}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 mt-auto">
                  <button
                    onClick={() => navigate("/admin/exams/results", { state: { examId: ex.id } })}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all"
                  >
                    📊 Results
                  </button>
                  <button
                    onClick={() => navigate("/admin/exams/questions", { state: { semester: ex.semester, batch: ex.batch, year: ex.year } })}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-100 hover:border-purple-600 transition-all"
                  >
                    📚 Questions
                  </button>
                  <button
                    onClick={() => navigate("/admin/exams/create", { state: { exam: ex } })}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 transition-all"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => confirmDelete(ex.id)}
                    className="px-3.5 py-2 text-sm font-medium rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 transition-all"
                  >
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xl mb-4">
              🗑
            </div>
            <p className="text-xl font-bold text-gray-900 mb-2">Delete Exam?</p>
            <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
              This will permanently remove the exam record, question paper, and any associated results. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-md shadow-red-500/30 transition-all"
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