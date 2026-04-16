import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import apiBaseUrl from "../../../config/baseurl";
// ─── Grade Calculator ─────────────────────────────────────────────────────────
const getGrade = (marks, total) => {
  const pct = (marks / total) * 100;
  if (pct >= 90) return { grade: "O",  color: "text-purple-600 font-bold" };
  if (pct >= 80) return { grade: "A+", color: "text-blue-600 font-bold"   };
  if (pct >= 70) return { grade: "A",  color: "text-green-600 font-bold"  };
  if (pct >= 60) return { grade: "B+", color: "text-teal-600 font-bold"   };
  if (pct >= 50) return { grade: "B",  color: "text-yellow-600 font-bold" };
  if (pct >= 40) return { grade: "C",  color: "text-orange-600 font-bold" };
  return           { grade: "F",  color: "text-red-600 font-bold"   };
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Examresult = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const defaultExam = location.state?.examId || "";

  const [exams, setExams]               = useState([]);
  const [selectedExam, setSelectedExam] = useState(defaultExam);
  const [students, setStudents]         = useState([]); // 🚀 NEW: Real students from DB
  const [results, setResults]           = useState({});
  const [errors, setErrors]             = useState({});
  const [saved, setSaved]               = useState(false);
  const [loading, setLoading]           = useState(false);

  // 1. 🚀 FETCH EXAMS FROM DATABASE
  useEffect(() => {
    const fetchExams = async () => {
      try {
        let token = localStorage.getItem('token'); 
        if (!token || token === "undefined") {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          token = storedUser?.token || storedUser?.data?.token; 
        }
        const response = await axios.get(`${apiBaseUrl}/admin/exams`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setExams(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      }
    };
    fetchExams();
  }, []);

  // 2. 🚀 FETCH STUDENTS WHEN AN EXAM IS SELECTED
  useEffect(() => {
    if (!selectedExam) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);
      try {
        let token = localStorage.getItem('token'); 
        if (!token || token === "undefined") {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          token = storedUser?.token || storedUser?.data?.token; 
        }
        
        const response = await axios.get(`${apiBaseUrl}/admin/exams/${selectedExam}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const fetchedStudents = response.data.data || [];
          setStudents(fetchedStudents);

          // Populate the results state with any existing marks from the DB
          const initialResults = {};
          fetchedStudents.forEach(student => {
            if (student.marks !== null && student.marks !== undefined) {
               initialResults[student.id] = { marks: student.marks, absent: false };
            }
          });
          setResults({ [selectedExam]: initialResults });
        }
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedExam]);

  const exam        = exams?.find?.((e) => String(e.id) === String(selectedExam));
  const examResults = results[selectedExam] || {};
  const passMark    = exam ? Number(exam.passingMarks || exam.passing_marks) : 0;

  // ── Setters ───────────────────────────────────────────────────────────────
  const setMark = (studentId, value) => {
    setResults((prev) => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        [studentId]: { ...prev[selectedExam]?.[studentId], marks: value, absent: false },
      },
    }));
    setErrors((prev) => { const e = { ...prev }; delete e[studentId]; return e; });
  };

  const toggleAbsent = (studentId) => {
    const isAbsent = examResults[studentId]?.absent;
    setResults((prev) => ({
      ...prev,
      [selectedExam]: {
        ...prev[selectedExam],
        [studentId]: { marks: "", absent: !isAbsent },
      },
    }));
    setErrors((prev) => { const e = { ...prev }; delete e[studentId]; return e; });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const maxMarks = Number(exam.totalMarks || exam.total_marks);
    
    students.forEach((s) => {
      const row = examResults[s.id];
      if (row?.absent) return;
      const m = row?.marks;
      if (m === "" || m === undefined) { e[s.id] = "Enter marks or mark absent"; return; }
      if (isNaN(m) || Number(m) < 0)   { e[s.id] = "Invalid marks"; return; }
      if (exam && Number(m) > maxMarks) { e[s.id] = `Max is ${maxMarks}`; return; }
    });
    return e;
  };

  // 3. 🚀 SAVE MARKS TO DATABASE
  const handleSave = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return; 

    const maxMarks = Number(exam.totalMarks || exam.total_marks);

    const resultsPayload = students
      .filter(student => {
         const row = examResults[student.id];
         return row && row.marks !== "" && row.marks !== undefined;
      })
      .map(student => ({
         studentId: student.id,
         obtainedMarks: Number(examResults[student.id].marks),
         grade: getGrade(Number(examResults[student.id].marks), maxMarks)?.grade || 'F'
      }));

    if (resultsPayload.length === 0) {
        alert("No marks to save!");
        return;
    }

    try {
        let token = localStorage.getItem('token'); 
        if (!token || token === "undefined") {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          token = storedUser?.token || storedUser?.data?.token; 
        }

        await axios.post(`${apiBaseUrl}/admin/exams/results`, {
            examId: selectedExam,
            results: resultsPayload
        }, { 
            headers: { Authorization: `Bearer ${token}` } 
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    } catch (error) {
        console.error("Failed to save marks:", error);
        alert("Server error while saving marks.");
    }
  };

  // ── Summary Stats ─────────────────────────────────────────────────────────
  const appeared = students.filter((s) => !examResults[s.id]?.absent).length;
  const absent   = students.length - appeared;
  const passed   = students.filter((s) => {
    const m = Number(examResults[s.id]?.marks);
    return !examResults[s.id]?.absent && !isNaN(m) && m >= passMark;
  }).length;
  const failed = appeared - passed;

  const allMarks = students
    .filter((s) => !examResults[s.id]?.absent && examResults[s.id]?.marks !== "" && examResults[s.id]?.marks !== undefined)
    .map((s) => Number(examResults[s.id]?.marks))
    .filter((m) => !isNaN(m));

  const avg     = allMarks.length ? (allMarks.reduce((a, b) => a + b, 0) / allMarks.length).toFixed(1) : "—";
  const highest = allMarks.length ? Math.max(...allMarks) : "—";
  const lowest  = allMarks.length ? Math.min(...allMarks) : "—";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/admin/exams")}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 text-lg"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Exam Results</h1>
          <p className="text-sm text-gray-500">Enter and manage student marks dynamically</p>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex flex-wrap gap-5 items-end">
          <div className="flex-1 min-w-64">
            <label className="block text-sm text-left font-medium text-gray-700 mb-1">
              Select Exam <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setErrors({}); setSaved(false); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Choose an exam —</option>
              {exams?.map?.((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} | Sem {ex.semester} | Batch {ex.batch} | {ex.year}
                </option>
              ))}
            </select>
          </div>

          {exam && (
            <div className="flex flex-wrap gap-2">
              {[
                { icon: "📅", label: formatDate(exam.examDate || exam.exam_date)   },
                { icon: "📊", label: `Total: ${exam.totalMarks || exam.total_marks}` },
                { icon: "✅", label: `Pass: ${exam.passingMarks || exam.passing_marks}`},
              ].map(({ icon, label }) => (
                <span key={label} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                  {icon} {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!selectedExam && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-gray-400 text-center">
          <p className="text-5xl mb-3">📝</p>
          <p className="font-semibold text-gray-600 text-lg">Select an exam to enter results</p>
          <p className="text-sm mt-1">Choose from the dropdown above</p>
        </div>
      )}

      {selectedExam && exam && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-5">
            {[
              { label: "Total",    value: students.length, bg: "bg-gray-50",   text: "text-gray-700"   },
              { label: "Appeared", value: appeared,            bg: "bg-blue-50",   text: "text-blue-700"   },
              { label: "Absent",   value: absent,              bg: "bg-orange-50", text: "text-orange-600" },
              { label: "Passed",   value: passed,              bg: "bg-green-50",  text: "text-green-700"  },
              { label: "Failed",   value: failed,              bg: "bg-red-50",    text: "text-red-600"    },
              { label: "Average",  value: avg,                 bg: "bg-purple-50", text: "text-purple-700" },
            ].map(({ label, value, bg, text }) => (
              <div key={label} className={`${bg} rounded-xl p-3 border border-white shadow-sm`}>
                <p className={`text-2xl font-bold ${text}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Success Toast */}
          {saved && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              ✅ Results saved to Database successfully!
            </div>
          )}

          {/* Marks Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium w-10">#</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Roll No</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">
                      Marks <span className="text-gray-400 font-normal">/ {exam.totalMarks || exam.total_marks}</span>
                    </th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">%</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Grade</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Absent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-10 text-gray-500 font-bold">Loading students...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan="8" className="text-center py-10 text-gray-500 font-bold">No students found for this batch.</td></tr>
                  ) : students.map((student, idx) => {
                    const row       = examResults[student.id] || {};
                    const isAbsent  = !!row.absent;
                    const marksVal  = row.marks;
                    const numMarks  = Number(marksVal);
                    const hasMarks  = !isAbsent && marksVal !== "" && marksVal !== undefined && !isNaN(numMarks);
                    const isPassed  = hasMarks && numMarks >= passMark;
                    const isFailed  = hasMarks && numMarks < passMark;
                    const maxMarks  = Number(exam.totalMarks || exam.total_marks);
                    const pct       = hasMarks ? ((numMarks / maxMarks) * 100).toFixed(1) : null;
                    const gradeInfo = hasMarks ? getGrade(numMarks, maxMarks) : null;

                    return (
                      <tr key={student.id} className={`transition-colors hover:bg-gray-50/60 ${isAbsent ? "opacity-50 bg-orange-50/30" : ""}`}>
                        <td className="px-4 py-3 text-left text-gray-400 text-xs">{idx + 1}</td>
                        <td className="px-4 py-3 text-left font-medium text-gray-800">{student.name}</td>
                        <td className="px-4 py-3 text-left text-gray-500">{student.rollNo || student.roll_no}</td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex flex-col items-start">
                            <input
                              type="number"
                              value={isAbsent ? "" : (marksVal ?? "")}
                              onChange={(e) => setMark(student.id, e.target.value)}
                              disabled={isAbsent}
                              min="0"
                              max={maxMarks}
                              className={`w-20 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${errors[student.id] ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                            />
                            {errors[student.id] && <p className="text-red-500 text-xs mt-1">{errors[student.id]}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-left text-gray-500 text-xs">{pct !== null ? `${pct}%` : "—"}</td>
                        <td className="px-4 py-3 text-left">{gradeInfo ? <span className={gradeInfo.color}>{gradeInfo.grade}</span> : "—"}</td>
                        <td className="px-4 py-3 text-left">
                          {isAbsent ? <span className="px-2.5 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">Absent</span> : isPassed ? <span className="px-2.5 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">Pass</span> : isFailed ? <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">Fail</span> : "—"}
                        </td>
                        <td className="px-4 py-3 text-left">
                          <input type="checkbox" checked={isAbsent} onChange={() => toggleAbsent(student.id)} className="w-4 h-4 rounded accent-orange-500 cursor-pointer" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
            >
              💾 Save Results to Database
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// export default Examresult;