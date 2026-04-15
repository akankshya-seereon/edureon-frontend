import { useState, useEffect } from "react";
import axios from "axios";
import {
  Save, Calculator, Lock, CheckCircle2, AlertCircle, X, Send,
  ClipboardList, UserPlus, Trash2, CalendarPlus, ArrowLeft,
  Plus, Grip, ChevronDown, Users, User, Loader2
} from "lucide-react";

// ── Shared Helpers ────────────────────────────────────────────────────────────
const getGrade = (total) => {
  if (total >= 75) return { label: "A", color: "text-green-600 bg-green-50" };
  if (total >= 60) return { label: "B", color: "text-blue-600 bg-blue-50" };
  if (total >= 40) return { label: "C", color: "text-orange-500 bg-orange-50" };
  return { label: "F", color: "text-red-600 bg-red-50" };
};

// 🚀 BULLETPROOF HELPER: Get Token securely and strictly
const getToken = () => {
  let token = localStorage.getItem('token'); 
  
  // 1. Remove extra quotation marks if they exist
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }

  // 2. If token is invalid, dig into the user object
  if (!token || token === "undefined" || token === "null") {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Check multiple possible nesting levels for the token
      token = storedUser?.token || storedUser?.data?.token || storedUser?.data?.user?.token; 
    } catch (e) {
      console.error("Failed to parse user from local storage");
    }
  }
  
  // 3. Final validation
  if (!token || typeof token !== 'string' || token === "undefined" || token === "null") {
    return null;
  }
  
  return token;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE NEW EXAM — Dynamic
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_SUBJECTS  = ["Mathematics", "Physics", "Chemistry", "Computer Science"];
const FALLBACK_BATCHES   = ["Batch 2023", "Batch 2024", "Batch 2025"];
const EXAM_TYPES = ["Mid-Term", "Final Exam", "Unit Test", "Quiz", "Practical", "Viva"];
const SEMESTERS  = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"];
const YEARS      = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const DURATIONS  = ["30 mins", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours"];
const FACULTY    = ["Dr. Anita Sharma", "Prof. Rakesh Verma", "Dr. Priya Nair", "Mr. Suresh Kumar"];
const Q_TYPES    = ["Multiple Choice", "Short Answer", "Long Answer", "True / False", "Fill in the Blank"];

const newQuestion = (idx) => ({
  id: Date.now() + idx,
  text: "",
  type: "Multiple Choice",
  marks: "",
  options: ["", "", "", ""],
  answer: "",
});

const SectionLabel = ({ children }) => (
  <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">{children}</p>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-md font-medium text-gray-700 mb-1.5">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const inputCls = (err) =>
  `w-full border rounded-lg px-3 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-white ${
    err ? "border-red-400 bg-red-50" : "border-gray-300"
  }`;

export const ScheduleExam = ({ onBack }) => {
  const [tab, setTab] = useState("details"); 
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [facultyList, setFacultyList] = useState([]);

  const [form, setForm] = useState({
    subject: "", examType: "", examTitle: "",
    semester: "", batch: "", year: "",
    date: "", time: "", duration: "",
    totalMarks: "100", passingMarks: "40", venue: "Hall A",
    delegateFaculty: true, assignedFaculty: "",
    instructions: "",
  });
  const [errors, setErrors] = useState({});

  const [questions, setQuestions] = useState([]);
  const [expandedQ, setExpandedQ] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        const [cRes, bRes, fRes] = await Promise.all([
          axios.get("http://localhost:5000/api/faculty/courses", { headers }).catch(() => ({ data: { data: [] } })),
          axios.get("http://localhost:5000/api/admin/batches", { headers }).catch(() => ({ data: { data: [] } })),
          axios.get("http://localhost:5000/api/admin/faculty", { headers }).catch(() => ({ data: { faculty: [] } }))
        ]);
        
        setCourses(cRes.data?.data || []);
        setBatches(bRes.data?.data || []);
        setFacultyList(fRes.data?.faculty || []);
      } catch (err) {
        console.error("Failed to load setup data", err);
      }
    };
    fetchSetupData();
  }, []);

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const addQuestion = () => {
    const q = newQuestion(questions.length);
    setQuestions((p) => [...p, q]);
    setExpandedQ(q.id);
  };

  const updateQ = (id, patch) =>
    setQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...patch } : q)));

  const removeQ = (id) => {
    setQuestions((p) => p.filter((q) => q.id !== id));
    if (expandedQ === id) setExpandedQ(null);
  };

  const validate = () => {
    const e = {};
    if (!form.subject)    e.subject    = "Required";
    if (!form.examType)   e.examType   = "Required";
    if (!form.examTitle.trim()) e.examTitle = "Required";
    if (!form.semester)   e.semester   = "Required";
    if (!form.batch)      e.batch      = "Required";
    if (!form.year)       e.year       = "Required";
    if (!form.date)       e.date       = "Required";
    if (!form.time)       e.time       = "Required";
    if (!form.duration)   e.duration   = "Required";
    if (!form.totalMarks) e.totalMarks = "Required";
    if (!form.passingMarks) e.passingMarks = "Required";
    if (form.delegateFaculty && !form.assignedFaculty) e.assignedFaculty = "Required";
    return e;
  };

  const handleSchedule = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); setTab("details"); return; }
    
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        alert("Authentication error: No valid token found. Please log in again.");
        setLoading(false);
        return;
      }

      await axios.post("http://localhost:5000/api/faculty/exams", {
        examDetails: form,
        questions: questions
      }, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule exam. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5 ring-8 ring-green-50/60">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Scheduled!</h2>
        <p className="text-md text-gray-500 mb-6 max-w-sm">
          <span className="font-semibold text-gray-800">{form.examTitle}</span> has been
          successfully scheduled for <span className="font-semibold text-gray-800">{form.date}</span>.
        </p>
        <button onClick={onBack}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 text-md font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Exams
        </button>
      </div>
    );
  }

  const totalQ    = questions.length;
  const totalQMks = questions.reduce((a, q) => a + (+q.marks || 0), 0);

  return (
    <div className="w-full max-w-8xl mx-auto space-y-0">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold  text-gray-900">Schedule New Exam</h1>
          <p className="text-md text-gray-400 mt-0.5">Set exam details and build or assign the question paper</p>
        </div>
      </div>

      <div className="flex items-center gap-0 mb-6">
        <button onClick={() => setTab("details")} className={`px-5 py-2.5 text-md font-semibold rounded-lg transition ${tab === "details" ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          1. Exam Details
        </button>
        <button onClick={() => setTab("builder")} className={`ml-2 px-5 py-2.5 text-md font-semibold rounded-lg transition ${tab === "builder" ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
          2. Question Builder ({totalQ})
        </button>
      </div>

      {tab === "details" && (
        <div className="space-y-0 text-left">
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <SectionLabel>Exam Identity</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-left">
              <div>
                <FieldLabel required>Subject (Course)</FieldLabel>
                <select value={form.subject} onChange={(e) => set("subject", e.target.value)} className={inputCls(errors.subject)}>
                  <option value="">Select Subject</option>
                  {(courses.length > 0 ? courses.map(c => c.course_name || c.courseTitle || c.id) : FALLBACK_SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div>
                <FieldLabel required>Exam Type</FieldLabel>
                <select value={form.examType} onChange={(e) => set("examType", e.target.value)} className={inputCls(errors.examType)}>
                  <option value="">Select Type</option>
                  {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.examType && <p className="text-xs text-red-500 mt-1">{errors.examType}</p>}
              </div>
            </div>
            <div>
              <FieldLabel required>Exam Title</FieldLabel>
              <input type="text" value={form.examTitle} placeholder="e.g. Mathematics - Mid-Term Exam" onChange={(e) => set("examTitle", e.target.value)} className={inputCls(errors.examTitle)} />
              {errors.examTitle && <p className="text-xs text-red-500 mt-1">{errors.examTitle}</p>}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <SectionLabel>Target & Schedule</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
              <div>
                <FieldLabel required>Semester</FieldLabel>
                <select value={form.semester} onChange={(e) => set("semester", e.target.value)} className={inputCls(errors.semester)}>
                  <option value="">Select</option>
                  {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.semester && <p className="text-xs text-red-500 mt-1">{errors.semester}</p>}
              </div>
              <div>
                <FieldLabel required>Batch</FieldLabel>
                <select value={form.batch} onChange={(e) => set("batch", e.target.value)} className={inputCls(errors.batch)}>
                  <option value="">Select</option>
                  {(batches.length > 0 ? batches.map(b => b.batch_name) : FALLBACK_BATCHES).map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.batch && <p className="text-xs text-red-500 mt-1">{errors.batch}</p>}
              </div>
              <div>
                <FieldLabel required>Year</FieldLabel>
                <select value={form.year} onChange={(e) => set("year", e.target.value)} className={inputCls(errors.year)}>
                  <option value="">Select</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <FieldLabel required>Date</FieldLabel>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls(errors.date)} />
                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
              </div>
              <div>
                <FieldLabel required>Time</FieldLabel>
                <input type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className={inputCls(errors.time)} />
                {errors.time && <p className="text-xs text-red-500 mt-1">{errors.time}</p>}
              </div>
              <div>
                <FieldLabel required>Duration</FieldLabel>
                <select value={form.duration} onChange={(e) => set("duration", e.target.value)} className={inputCls(errors.duration)}>
                  <option value="">Select</option>
                  {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <SectionLabel>Marks & Venue</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <FieldLabel required>Total Marks</FieldLabel>
                <input type="number" value={form.totalMarks} placeholder="100" onChange={(e) => set("totalMarks", e.target.value)} className={inputCls(errors.totalMarks)} />
                {errors.totalMarks && <p className="text-xs text-red-500 mt-1">{errors.totalMarks}</p>}
              </div>
              <div>
                <FieldLabel required>Passing Marks</FieldLabel>
                <input type="number" value={form.passingMarks} placeholder="40" onChange={(e) => set("passingMarks", e.target.value)} className={inputCls(errors.passingMarks)} />
                {errors.passingMarks && <p className="text-xs text-red-500 mt-1">{errors.passingMarks}</p>}
              </div>
            </div>
            <div>
              <FieldLabel>Venue / Room</FieldLabel>
              <input type="text" value={form.venue} placeholder="Hall A" onChange={(e) => set("venue", e.target.value)} className={inputCls(false)} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <SectionLabel>Faculty Assignment & Permissions</SectionLabel>
            <label className="flex items-center gap-3 cursor-pointer mb-5">
              <div onClick={() => set("delegateFaculty", !form.delegateFaculty)} className={`w-5 h-5 rounded flex items-center justify-center border-2 transition flex-shrink-0 ${form.delegateFaculty ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
                {form.delegateFaculty && (<svg className="w-3 h-3 text-white" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
              </div>
              <span className="text-md text-gray-700 font-medium">Delegate Question Paper creation to a specific Faculty?</span>
            </label>
            {form.delegateFaculty && (
              <div>
                <FieldLabel required>Assign Faculty</FieldLabel>
                <select value={form.assignedFaculty} onChange={(e) => set("assignedFaculty", e.target.value)} className={inputCls(errors.assignedFaculty)}>
                  <option value="">Select Faculty</option>
                  {facultyList.length > 0 
                    ? facultyList.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)
                    : FACULTY.map((f) => <option key={f} value={f}>{f}</option>)
                  }
                </select>
                {errors.assignedFaculty && (<p className="text-xs text-red-500 mt-1">{errors.assignedFaculty}</p>)}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <SectionLabel>Exam Instructions (Optional)</SectionLabel>
            <textarea value={form.instructions} onChange={(e) => set("instructions", e.target.value)} rows={4} placeholder="e.g. Calculators are not allowed..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-500 transition resize-none bg-white" />
          </div>

          <div className="flex items-center justify-between gap-3 pb-8">
            <button onClick={onBack} className="flex items-center gap-2 border border-gray-300 text-gray-600 text-md font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"><ArrowLeft className="w-4 h-4" /> Cancel</button>
            <div className="flex items-center gap-3">
              <button onClick={() => setTab("builder")} className="flex items-center gap-2 border border-blue-300 text-blue-600 text-md font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition">Next: Question Builder →</button>
              <button disabled={loading} onClick={handleSchedule} className="flex items-center gap-2 bg-blue-600 text-white text-md font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />} Schedule Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "builder" && (
        <div className="space-y-4">
          {questions.length > 0 && (
            <div className="flex items-center gap-5 p-4 bg-white border border-gray-200 rounded-xl text-md">
              <span className="text-gray-500">Questions: <strong className="text-gray-900">{totalQ}</strong></span>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-gray-500">Total Marks: <strong className="text-gray-900">{totalQMks}</strong></span>
              {form.totalMarks && (
                <>
                  <div className="w-px h-4 bg-gray-200" />
                  <span className={`font-semibold text-xs px-2.5 py-1 rounded-full ${totalQMks === +form.totalMarks ? "bg-green-50 text-green-700" : totalQMks > +form.totalMarks ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
                    {totalQMks === +form.totalMarks ? "✓ Marks balanced" : totalQMks > +form.totalMarks ? `⚠ ${totalQMks - +form.totalMarks} marks over` : `${+form.totalMarks - totalQMks} marks remaining`}
                  </span>
                </>
              )}
            </div>
          )}

          {questions.length === 0 && (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl py-16 px-10 flex flex-col gap-4 justify-center items-start">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center"><ClipboardList className="w-7 h-7 text-gray-300" /></div>
              <div><p className="text-md font-semibold text-gray-600">No questions yet</p><p className="text-xs text-gray-400 mt-1">Click "Add Question" to start building your paper</p></div>
              <button onClick={addQuestion} className="flex items-center gap-2 bg-blue-600 text-white text-md font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"><Plus className="w-4 h-4" /> Add First Question</button>
            </div>
          )}

          {questions.map((q, idx) => {
            const isOpen = expandedQ === q.id;
            return (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition select-none" onClick={() => setExpandedQ(isOpen ? null : q.id)}>
                  <Grip className="w-4 h-4 text-gray-300 flex-shrink-0" />
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-md truncate ${q.text ? "font-medium text-gray-800" : "text-gray-400 italic"}`}>{q.text || "Untitled question..."}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">{q.type}</span>
                      {q.marks && <span className="text-xs text-blue-500 font-medium">{q.marks} marks</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); removeQ(q.id); }} className="text-gray-300 hover:text-red-500 transition p-1"><Trash2 className="w-4 h-4" /></button>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100 space-y-4 pt-4 text-left">
                    <div>
                      <FieldLabel required>Question Text</FieldLabel>
                      <textarea rows={3} value={q.text} placeholder="Enter the question..." onChange={(e) => updateQ(q.id, { text: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-500 transition resize-none bg-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Question Type</FieldLabel>
                        <select value={q.type} onChange={(e) => updateQ(q.id, { type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">{Q_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
                      </div>
                      <div>
                        <FieldLabel>Marks</FieldLabel>
                        <input type="number" value={q.marks} placeholder="e.g. 5" onChange={(e) => updateQ(q.id, { marks: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-white" />
                      </div>
                    </div>
                    {(q.type === "Multiple Choice" || q.type === "True / False") && (
                      <div>
                        <FieldLabel>{q.type === "True / False" ? "Options" : "Answer Options"}</FieldLabel>
                        <div className="space-y-2">
                          {(q.type === "True / False" ? ["True", "False"] : q.options).map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <input type="radio" name={`correct-${q.id}`} checked={q.answer === String(oi)} onChange={() => updateQ(q.id, { answer: String(oi) })} className="accent-blue-600 flex-shrink-0" />
                              {q.type === "True / False" ? (<span className="text-md text-gray-700">{opt}</span>) : (<input type="text" value={opt} placeholder={`Option ${oi + 1}`} onChange={(e) => { const opts = [...q.options]; opts[oi] = e.target.value; updateQ(q.id, { options: opts }); }} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-md outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />)}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">Select the radio button to mark the correct answer</p>
                      </div>
                    )}
                    {(q.type === "Short Answer" || q.type === "Long Answer" || q.type === "Fill in the Blank") && (
                      <div>
                        <FieldLabel>Model Answer / Key (optional)</FieldLabel>
                        <textarea rows={q.type === "Long Answer" ? 4 : 2} value={q.answer} placeholder="Enter model answer..." onChange={(e) => updateQ(q.id, { answer: e.target.value })} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-md outline-none focus:ring-2 focus:ring-blue-400 transition resize-none" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {questions.length > 0 && (
            <button onClick={addQuestion} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-md text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"><Plus className="w-4 h-4" /> Add New Question</button>
          )}

          <div className="flex items-center justify-between gap-3 pb-8">
            <button onClick={() => setTab("details")} className="flex items-center gap-2 border border-gray-300 text-gray-600 text-md font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition"><ArrowLeft className="w-4 h-4" /> Back to Details</button>
            <button disabled={loading} onClick={handleSchedule} className="flex items-center gap-2 bg-blue-600 text-white text-md font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />} Schedule Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARKS ENTRY — Dynamic
// ─────────────────────────────────────────────────────────────────────────────

const AddStudentModal = ({ onAdd, onCancel, existingRolls }) => {
  const [form, setForm]     = useState({ roll: "", name: "", theory: "", practical: "" });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.roll.trim())  e.roll = "Roll No is required";
    else if (existingRolls.includes(form.roll.trim())) e.roll = "Roll No already exists";
    if (!form.name.trim())  e.name = "Student name is required";
    if (form.theory === ""  || isNaN(form.theory))     e.theory    = "Required";
    else if (+form.theory    < 0 || +form.theory    > 60) e.theory    = "0–60 only";
    if (form.practical === "" || isNaN(form.practical)) e.practical = "Required";
    else if (+form.practical  < 0 || +form.practical  > 20) e.practical = "0–20 only";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onAdd({ id: Date.now(), roll: form.roll.trim(), name: form.name.trim(), theory: +form.theory, practical: +form.practical, maxTheory: 60, maxPractical: 20 });
  };

  const Field = ({ label, fieldKey, placeholder, extra }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label} {extra && <span className="text-gray-400 font-normal">{extra}</span>}
      </label>
      <input
        type={fieldKey === "name" || fieldKey === "roll" ? "text" : "number"}
        value={form[fieldKey]} placeholder={placeholder}
        onChange={(e) => { setForm((p) => ({ ...p, [fieldKey]: e.target.value })); setErrors((p) => ({ ...p, [fieldKey]: "" })); }}
        className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition ${errors[fieldKey] ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
      />
      {errors[fieldKey] && <p className="text-xs text-red-500 mt-1">{errors[fieldKey]}</p>}
    </div>
  );

  const previewTotal = form.theory !== "" && form.practical !== "" && !isNaN(+form.theory) && !isNaN(+form.practical) ? +form.theory + +form.practical : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 overflow-hidden">
        <div className="h-1.5 bg-blue-600 w-full" />
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><UserPlus className="w-5 h-5 text-blue-600" /></div>
            <div><h2 className="text-base font-bold text-gray-900">Add Student Score</h2><p className="text-xs text-gray-500 mt-0.5">Enter student details and marks</p></div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-6 pb-6 space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3"><Field label="Roll No"      fieldKey="roll"      placeholder="e.g. 05" /><Field label="Student Name" fieldKey="name"      placeholder="Full name" /></div>
          <div className="grid grid-cols-2 gap-3"><Field label="Theory"    fieldKey="theory"    placeholder="0 – 60" extra="(Max 60)" /><Field label="Practical" fieldKey="practical" placeholder="0 – 20" extra="(Max 20)" /></div>
          {previewTotal !== null && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-xs text-gray-500">Preview:</span><span className="text-md font-bold text-gray-800">Total: {previewTotal}/80</span>
              {(() => { const g = getGrade(previewTotal); return <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${g.color}`}>{g.label}</span>; })()}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel} className="flex-1 border border-gray-300 text-gray-700 text-md font-medium py-2.5 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-md font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition"><UserPlus className="w-4 h-4" /> Add Student</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({ exam, classLabel, students, onConfirm, onCancel, submitting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden">
      <div className="h-1.5 bg-blue-600 w-full" />
      <div className="flex items-start justify-between p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Send className="w-5 h-5 text-blue-600" /></div>
          <div><h2 className="text-base font-bold text-gray-900">Submit Scores</h2><p className="text-xs text-gray-500 mt-0.5">Review before final submission</p></div>
        </div>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition"><X className="w-5 h-5" /></button>
      </div>
      <div className="mx-6 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-6 text-xs text-gray-600">
        <span><span className="font-semibold text-gray-800">Exam:</span> {exam}</span>
        <span><span className="font-semibold text-gray-800">Class/Batch:</span> {classLabel}</span>
        <span><span className="font-semibold text-gray-800">Students:</span> {students.length}</span>
      </div>
      <div className="mx-6 mb-5 rounded-xl border border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
        <table className="w-full text-md">
          <thead className="sticky top-0 bg-gray-50"><tr className="border-b border-gray-100"><th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Student</th><th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Theory</th><th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Practical</th><th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Total</th><th className="px-4 py-2.5 text-center text-xs font-semibold text-gray-500">Grade</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((s) => { const total = s.theory + s.practical; const g = getGrade(total); return (
              <tr key={s.id} className="hover:bg-gray-50/60 transition"><td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{s.name}</td><td className="px-4 py-2.5 text-center text-gray-600 text-xs">{s.theory}</td><td className="px-4 py-2.5 text-center text-gray-600 text-xs">{s.practical}</td><td className="px-4 py-2.5 text-center font-bold text-gray-900 text-xs">{total}</td><td className="px-4 py-2.5 text-center"><span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${g.color}`}>{g.label}</span></td></tr>
            ); })}
          </tbody>
        </table>
      </div>
      <div className="mx-6 mb-5 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">Once submitted, scores will be locked and visible to students. This action cannot be undone.</p>
      </div>
      <div className="flex items-center justify-end gap-3 px-6 pb-6">
        <button onClick={onCancel} className="border border-gray-300 text-gray-700 text-md font-medium px-5 py-2.5 rounded-lg hover:bg-gray-50 transition">Cancel</button>
        <button disabled={submitting} onClick={onConfirm} className="flex items-center gap-2 bg-blue-600 text-white text-md font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-60">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Confirm & Submit
        </button>
      </div>
    </div>
  </div>
);

const SuccessScreen = ({ exam, classLabel, students, onReset }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5 ring-8 ring-green-50/60"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
    <h2 className="text-2xl font-bold text-gray-900 mb-1">Scores Submitted!</h2>
    <p className="text-md text-gray-500 mb-6 max-w-xs">Marks for <span className="font-semibold text-gray-700">{exam}</span> — {classLabel} have been successfully submitted.</p>
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      {students.map((s) => { const total = s.theory + s.practical; const g = getGrade(total); return (
        <div key={s.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm"><span className="text-md font-medium text-gray-800">{s.name}</span><span className="text-xs text-gray-400">{total}/80</span><span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${g.color}`}>{g.label}</span></div>
      ); })}
    </div>
    <button onClick={onReset} className="flex items-center gap-2 border border-gray-300 text-gray-700 text-md font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"><ClipboardList className="w-4 h-4" /> Enter Another Exam</button>
  </div>
);

const MarksEntry = () => {
  const [scheduledExams, setScheduledExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [students, setStudents] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal,  setShowAddModal]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [draftSaved,    setDraftSaved]    = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      setLoadingExams(true);
      try {
        const token = getToken();
        
        if (!token) {
           console.error("No valid token found! You might need to log out and log back in.");
           setLoadingExams(false);
           return; 
        }

        const res = await axios.get("http://localhost:5000/api/faculty/exams", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const examsData = res.data?.data || res.data?.exams || [];
        setScheduledExams(examsData);
        if (examsData.length > 0) setSelectedExamId(examsData[0].id);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  useEffect(() => {
    if (!selectedExamId) return;
    const fetchStudents = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get(`http://localhost:5000/api/faculty/exams/${selectedExamId}/students`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setStudents(res.data?.data || res.data?.students || []);
      } catch (err) {
        setStudents([]); 
      }
    };
    fetchStudents();
  }, [selectedExamId]);

  const handleMarkChange = (id, field, value) => {
    const val = parseInt(value) || 0;
    setStudents((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const max = field === "theory" ? (s.maxTheory || 60) : (s.maxPractical || 20);
      return { ...s, [field]: val > max ? max : val < 0 ? 0 : val };
    }));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) return;

      await axios.post(`http://localhost:5000/api/faculty/exams/${selectedExamId}/marks`, { students }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowConfirm(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit marks.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => { setDraftSaved(true); setTimeout(() => setDraftSaved(false), 2500); };
  const handleReset = () => { setSubmitted(false); setStudents([]); };

  const activeExamObj = scheduledExams.find(e => e.id == selectedExamId) || {};
  const displayExamTitle = activeExamObj.title || activeExamObj.examTitle || "Selected Exam";
  const displayBatch = activeExamObj.batch || "Selected Batch";

  if (submitted) return <SuccessScreen exam={displayExamTitle} classLabel={displayBatch} students={students} onReset={handleReset} />;

  return (
    <>
      {showAddModal && <AddStudentModal existingRolls={students.map((s) => s.roll || s.roll_no)} onAdd={(s) => { setStudents((p) => [...p, s]); setShowAddModal(false); }} onCancel={() => setShowAddModal(false)} />}
      {showConfirm  && <ConfirmModal exam={displayExamTitle} classLabel={displayBatch} students={students} submitting={submitting} onConfirm={handleFinalSubmit} onCancel={() => setShowConfirm(false)} />}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">Marks Entry</h1><p className="text-md text-slate-500">Manage exam scores and grading</p></div>
        <div className="flex flex-wrap gap-3">
          <select value={selectedExamId} onChange={(e) => setSelectedExamId(e.target.value)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-md outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]">
            {loadingExams ? <option>Loading exams...</option> : scheduledExams.length === 0 ? <option>No exams scheduled</option> : scheduledExams.map(ex => <option key={ex.id} value={ex.id}>{ex.title || ex.examTitle} ({ex.batch})</option>)}
          </select>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex items-start gap-3">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg flex-shrink-0"><Calculator size={20} /></div>
        <div><h4 className="font-bold text-blue-600 text-md">Grading Logic Active</h4><p className="text-xs text-blue-600 mt-1">Total Score = Theory (Max 60) + Practical (Max 20). Grades are auto-calculated based on the total score.</p></div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <p className="text-md font-semibold text-slate-700">{students.length} {students.length === 1 ? "Student" : "Students"}</p>
          <button onClick={() => setShowAddModal(true)} disabled={!selectedExamId} className="flex items-center gap-1.5 bg-blue-600 text-white text-md font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm disabled:opacity-50">
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase">Roll No</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase">Student Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase text-center">Theory (60)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase text-center">Practical (20)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase text-center">Total (80)</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase text-center">Grade</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-500 uppercase text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-14 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <UserPlus className="w-8 h-8 opacity-40" />
                    <p className="text-md">No students found. Click <span className="text-blue-500 font-semibold">Add Student</span> to begin.</p>
                  </div>
                </td></tr>
              )}
              {students.map((student) => {
                const total = (student.theory || 0) + (student.practical || 0);
                const grade = getGrade(total);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/50 group">
                    <td className="px-6 py-4 text-md font-mono text-slate-500">{student.roll || student.roll_no}</td>
                    <td className="px-6 py-4 text-md font-medium text-slate-900">{student.name || student.student_name}</td>
                    <td className="px-6 py-4 text-center"><input type="number" min={0} max={60} value={student.theory || ""} onChange={(e) => handleMarkChange(student.id, "theory", e.target.value)} className="w-20 p-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-md font-medium" /></td>
                    <td className="px-6 py-4 text-center"><input type="number" min={0} max={20} value={student.practical || ""} onChange={(e) => handleMarkChange(student.id, "practical", e.target.value)} className="w-20 p-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-md font-medium" /></td>
                    <td className="px-6 py-4 text-center"><span className="text-md font-bold text-slate-800">{total}</span></td>
                    <td className="px-6 py-4 text-center"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${grade.color}`}>{grade.label}</span></td>
                    <td className="px-6 py-4 text-center"><button onClick={() => setStudents((p) => p.filter((s) => s.id !== student.id))} className="text-slate-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100" title="Remove student"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button onClick={handleSaveDraft} className={`px-4 py-2 border rounded-lg font-medium text-md flex items-center gap-2 transition ${draftSaved ? "border-green-400 text-green-600 bg-green-50" : "border-slate-300 text-slate-600 hover:bg-white"}`}>
            {draftSaved ? <><CheckCircle2 size={16} /> Draft Saved!</> : <><Lock size={16} /> Save Draft</>}
          </button>
          <button onClick={() => students.length > 0 && setShowConfirm(true)} disabled={students.length === 0 || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-md flex items-center gap-2 shadow-sm transition">
            <Send size={16} /> Submit Scores
          </button>
        </div>
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────

export const FacultyExams = () => {
  const [view, setView] = useState("marks"); // marks | schedule

  return (
    <div className="w-full max-w-8xl mx-auto p-6 space-y-6">
      {view === "marks" && (
        <>
          <div className="flex items-center justify-between">
            <div />
            <button
              onClick={() => setView("schedule")}
              className="flex items-center gap-2 bg-blue-600 text-white text-md font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" /> Schedule New Exam
            </button>
          </div>
          <MarksEntry />
        </>
      )}

      {view === "schedule" && (
        <ScheduleExam onBack={() => setView("marks")} />
      )}
    </div>
  );
};