import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "./Examstorage.jsx";
import apiBaseUrl from "../../../config/baseurl";

// 🎯 HELPER: Safely grabs the token
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

// ─── Initial Form State ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  semester:      "",
  batch:         "",
  year:          "",
  specialization:"", // 🚀 Added Specialization for cascading
  subject:       "",
  questionType:  "",
  difficulty:    "",
  marks:         "",
  question:      "",
  optionA:       "",
  optionB:       "",
  optionC:       "",
  optionD:       "",
  correctAnswer: "",
  explanation:   "",
  files:         [],
};

// ─── Reusable Field Components ────────────────────────────────────────────────
const Label = ({ children, required, hint }) => (
  <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
    {children} {required && <span className="text-red-500">*</span>}
    {hint && <span className="text-gray-400 font-normal ml-2 lowercase tracking-normal">({hint})</span>}
  </label>
);

const Select = ({ value, onChange, options, placeholder, disabled, name }) => (
  <select
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 transition-all appearance-none"
  >
    <option value="">{placeholder}</option>
    {options?.map((o, idx) => (
      <option key={`${o.value || o.id}-${idx}`} value={o.value || o.id}>
        {o.label || o.name}
      </option>
    ))}
  </select>
);

const Input = ({ value, onChange, placeholder, type = "text", name }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
  />
);

// ─── File helpers ─────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const FileBadge = ({ file, onRemove }) => {
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const isDoc = file.name.endsWith(".doc") || file.name.endsWith(".docx");
  const ext    = isPdf ? "PDF" : isDoc ? "DOC" : "FILE";
  const colors = isPdf
    ? "bg-red-100 text-red-700 border-red-200"
    : isDoc
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 group shadow-sm">
      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${colors} flex-shrink-0`}>{ext}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 truncate">{file.name}</p>
        <p className="text-[10px] text-gray-400">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button type="button" onClick={onRemove}
          className="ml-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 text-base leading-none">
          ×
        </button>
      )}
    </div>
  );
};

const FileUploadZone = ({ files, onAdd, onRemove }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const processFiles = (incoming) => {
    Array.from(incoming).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        onAdd({ name: file.name, size: file.size, type: file.type, dataUrl: ev.target.result });
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"}`}
      >
        <span className="text-3xl mb-2">📎</span>
        <p className="text-sm font-bold text-gray-600">
          {dragging ? "Drop files here!" : "Click or drag & drop to attach files"}
        </p>
        <p className="text-xs text-gray-400 mt-1 font-medium">PDF, DOC, DOCX — multiple allowed</p>
        <input ref={inputRef} type="file" multiple
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => { processFiles(e.target.files); e.target.value = ""; }} />
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((file, idx) => (
            <FileBadge key={idx} file={file} onRemove={() => onRemove(idx)} />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ExamQuestion = () => {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors]       = useState({});
  const [activeTab, setActiveTab] = useState("create");
  const [expandedFiles, setExpandedFiles] = useState({});

  // 🚀 New unified dropdown state loaded from MySQL
  const [dropdownData, setDropdownData] = useState({
    subjects: [], specializations: [], batches: [], academicYears: [], semesters: []
  });

  const [toast, setToast]   = useState(null);
  const toastTimer          = useRef(null);
  const formTopRef          = useRef(null);

  const isMCQ = form.questionType === "MCQ";
  const isTF  = form.questionType === "TRUE_FALSE";

  // 🚀 Fetch real dropdown data on load
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const config = getAuthConfig(); 
        const res = await axios.get(`${apiBaseUrl}/admin/classes/form-data`, config);
        
        if (res.data?.success) {
          const data = res.data.data;
          setDropdownData({
            subjects: data.subjects?.map(s => ({ value: s.name, label: s.name, spec: s.specialization })) || [],
            specializations: data.specializations?.map(s => ({ value: s.name, label: s.name })) || [],
            batches: data.batches?.map(b => ({ value: b.name, label: b.name })) || [],
            academicYears: data.academicYears?.map(y => ({ value: y.name, label: y.name })) || [],
            semesters: data.semesters?.map(s => ({ value: s.name, label: s.name, batchId: s.batch_id })) || [],
          });
        }
      } catch (error) {
        console.error("Failed to load setup data:", error);
      }
    };
    fetchSetupData();
  }, []);

  // 🚀 Cascading Logic: Filter subjects based on specialization
  const filteredSubjects = useMemo(() => {
    if (!form.specialization) return dropdownData.subjects;
    return dropdownData.subjects.filter(s => s.spec === form.specialization);
  }, [form.specialization, dropdownData.subjects]);

  const set = (field) => (e) => {
    const value = e.target.value;
    
    // Auto-clear subject if specialization changes
    if (field === 'specialization') {
      setForm((prev) => ({ ...prev, specialization: value, subject: '' }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  };

  const showToast = (type, msg) => {
    clearTimeout(toastTimer.current);
    setToast({ type, msg });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const addFile    = (f) => setForm((prev) => ({ ...prev, files: [...prev.files, f] }));
  const removeFile = (idx) => setForm((prev) => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));

  const validate = () => {
    const e = {};
    if (!form.semester)        e.semester      = "Required";
    if (!form.batch)           e.batch         = "Required";
    if (!form.year)            e.year          = "Required";
    if (!form.subject)         e.subject       = "Required";
    if (!form.questionType)    e.questionType  = "Required";
    if (!form.difficulty)      e.difficulty    = "Required";
    if (!form.marks)           e.marks         = "Required";
    if (!form.question.trim()) e.question      = "Required";
    if (isMCQ) {
      if (!form.optionA.trim()) e.optionA       = "Required";
      if (!form.optionB.trim()) e.optionB       = "Required";
      if (!form.optionC.trim()) e.optionC       = "Required";
      if (!form.optionD.trim()) e.optionD       = "Required";
      if (!form.correctAnswer)  e.correctAnswer = "Required";
    }
    if (isTF && !form.correctAnswer) e.correctAnswer = "Required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const newQ = {
      id: Date.now(),
      ...form,
      createdAt: new Date().toLocaleDateString(),
    };

    setQuestions((prev) => [newQ, ...prev]);

    // Keep context, clear specific question details
    setForm((prev) => ({
      ...prev,
      marks:         "",
      question:      "",
      optionA:       "",
      optionB:       "",
      optionC:       "",
      optionD:       "",
      correctAnswer: "",
      explanation:   "",
      files:         [],
    }));

    setErrors({});
    showToast("success", "Question saved! Fill in the next one below.");

    setTimeout(() => { document.getElementById("question-textarea")?.focus(); }, 100);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    showToast("success", "Form cleared.");
  };

  const handleDelete = (id) => setQuestions((prev) => prev.filter((q) => q.id !== id));
  const toggleFileExpand = (id) => setExpandedFiles((prev) => ({ ...prev, [id]: !prev[id] }));
  const err = (field) => errors[field] ? <p className="text-red-500 text-xs mt-1 font-bold">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-left">

      {/* Header */}
      <div className="mb-6 max-w-8xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Question Bank</h1>
        <p className="text-sm font-semibold text-gray-500 mt-1">
          Build and manage exam questions by subject, batch, and difficulty.
        </p>
      </div>

      {/* ── Floating Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-bold border transition-all animate-in slide-in-from-top-4
          ${toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          <span className="text-lg">{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 max-w-8xl mx-auto">
        {[
          { id: "create", label: "➕ Create Question" },
          { id: "list", label: `📚 All Questions (${questions.length})` }
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-blue-200"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-blue-600"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "create" && (
        <div ref={formTopRef} className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 max-w-4xl animate-in fade-in duration-300">

          {questions.length > 0 && (
            <div className="mb-6 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl px-5 py-3">
              <p className="text-sm text-blue-800 font-bold">
                🎉 {questions.length} question{questions.length > 1 ? "s" : ""} added to the bank!
              </p>
              <button onClick={() => setActiveTab("list")} className="text-xs text-blue-600 hover:text-blue-800 uppercase tracking-widest font-black">
                View All →
              </button>
            </div>
          )}

          {/* ── Section: Exam Context ── */}
          <div className="mb-8">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100 flex justify-between items-center">
              <span>1. Exam Context</span>
              <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-lg">Stays filled between saves</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <Label required>Semester</Label>
                <Select value={form.semester} onChange={set("semester")} options={dropdownData.semesters} placeholder="Select Semester" />
                {err("semester")}
              </div>
              <div>
                <Label required>Batch</Label>
                <Select value={form.batch} onChange={set("batch")} options={dropdownData.batches} placeholder="Select Batch" />
                {err("batch")}
              </div>
              <div>
                <Label required>Academic Year</Label>
                <Select value={form.year} onChange={set("year")} options={dropdownData.academicYears} placeholder="Select Year" />
                {err("year")}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mt-5">
              <div className="sm:col-span-2">
                <Label>Specialization</Label>
                <Select value={form.specialization} onChange={set("specialization")} options={dropdownData.specializations} placeholder="All Specializations" />
              </div>
              <div className="sm:col-span-2">
                <Label required>Subject</Label>
                <Select value={form.subject} onChange={set("subject")} options={filteredSubjects} placeholder="Select Subject" disabled={!form.specialization && dropdownData.specializations.length > 0} />
                {err("subject")}
              </div>
              <div className="sm:col-span-2">
                <Label required>Question Type</Label>
                <Select value={form.questionType} onChange={set("questionType")} options={QUESTION_TYPE_OPTIONS} placeholder="Select Type" />
                {err("questionType")}
              </div>
              <div className="sm:col-span-2">
                <Label required>Difficulty</Label>
                <Select value={form.difficulty} onChange={set("difficulty")} options={DIFFICULTY_OPTIONS} placeholder="Select Difficulty" />
                {err("difficulty")}
              </div>
            </div>
          </div>

          <div className="border-t-[3px] border-dashed border-gray-100 my-8" />

          {/* ── Section: This Question ── */}
          <div className="mb-8">
            <h2 className="text-sm font-black text-purple-600 uppercase tracking-widest mb-5 pb-3 border-b border-gray-100 flex justify-between items-center">
              <span>2. Question Details (#{questions.length + 1})</span>
              <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-lg">Clears after save</span>
            </h2>

            <div className="mb-5 max-w-[200px]">
              <Label required>Marks Allocated</Label>
              <Input type="number" value={form.marks} onChange={set("marks")} placeholder="e.g. 5" />
              {err("marks")}
            </div>

            <div className="mb-5">
              <Label required>Question Text</Label>
              <textarea
                id="question-textarea"
                value={form.question}
                onChange={set("question")}
                placeholder="Type your question here..."
                rows={4}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all
                  ${errors.question ? "border-red-300 bg-red-50/50" : "border-gray-300 bg-white"}`}
              />
              {err("question")}
            </div>

            {/* MCQ Options */}
            {isMCQ && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-5">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Multiple Choice Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt}>
                      <Label>Option {opt}</Label>
                      <Input value={form[`option${opt}`]} onChange={set(`option${opt}`)} placeholder={`Option ${opt} text`} />
                      {err(`option${opt}`)}
                    </div>
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-slate-200 max-w-sm">
                  <Label required>Select the Correct Answer</Label>
                  <Select
                    value={form.correctAnswer}
                    onChange={set("correctAnswer")}
                    options={["A","B","C","D"].map((o) => ({ value: o, label: `Option ${o}` }))}
                    placeholder="Correct Option"
                  />
                  {err("correctAnswer")}
                </div>
              </div>
            )}

            {/* True / False */}
            {isTF && (
              <div className="mb-5 max-w-sm bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <Label required>Correct Answer</Label>
                <Select
                  value={form.correctAnswer}
                  onChange={set("correctAnswer")}
                  options={[{ value: "TRUE", label: "True" }, { value: "FALSE", label: "False" }]}
                  placeholder="Select True or False"
                />
                {err("correctAnswer")}
              </div>
            )}

            <div className="mb-5">
              <Label hint="Optional">Explanation / Hint</Label>
              <Textarea value={form.explanation} onChange={set("explanation")} placeholder="Add explanation to help evaluators or students..." rows={2} />
            </div>
          </div>

          {/* ── Reference Documents ── */}
          <div className="mb-8">
            <h2 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4 pb-3 border-b border-gray-100">
              3. Reference Documents <span className="text-gray-400 font-normal capitalize">(Optional)</span>
            </h2>
            <FileUploadZone files={form.files} onAdd={addFile} onRemove={removeFile} />
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-wrap gap-4 justify-between items-center pt-6 border-t border-gray-100 bg-gray-50 -mx-8 -mb-8 p-8 rounded-b-3xl">
            <button onClick={handleReset}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 font-bold hover:bg-white transition-all text-sm">
              🔄 Clear Form
            </button>

            <button onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-blue-600 text-white font-black uppercase tracking-wider text-xs hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center gap-2">
              💾 Save & Add Another
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LIST VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <div className="max-w-4xl animate-in fade-in duration-300">
          {questions.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-gray-400 text-center shadow-sm">
              <p className="text-6xl mb-4">📭</p>
              <p className="font-black text-xl text-gray-700">No questions mapped yet</p>
              <p className="text-sm mt-2 text-gray-500 font-medium">Create your first question using the form</p>
              <button onClick={() => setActiveTab("create")}
                className="mt-6 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md hover:bg-blue-700 transition-all uppercase tracking-widest">
                + Create Question
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">
                  Showing {questions.length} Question{questions.length > 1 ? "s" : ""}
                </p>
                <button onClick={() => setActiveTab("create")}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-md transition-all flex items-center gap-2">
                  ➕ Add Another
                </button>
              </div>

              <div className="space-y-5">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between gap-5">
                      <div className="flex-1">

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {q.specialization && <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[10px] uppercase tracking-widest rounded-lg font-black">{q.specialization}</span>}
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] uppercase tracking-widest rounded-lg font-black">Sem {q.semester}</span>
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] uppercase tracking-widest rounded-lg font-black">Batch {q.batch}</span>
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-[10px] uppercase tracking-widest rounded-lg font-black">{q.year}</span>
                          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] uppercase tracking-widest rounded-lg font-black">{q.questionType.replace('_', ' ')}</span>
                          <span className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded-lg font-black ${
                            q.difficulty === "EASY"   ? "bg-emerald-50 text-emerald-600 border border-emerald-100"  :
                            q.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                        "bg-red-50 text-red-600 border border-red-100"
                          }`}>{q.difficulty}</span>
                        </div>

                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                          Q{idx + 1} <span className="mx-1">•</span> {q.subject} <span className="mx-1">•</span> {q.marks} Marks
                        </p>
                        
                        <p className="text-gray-900 text-base font-bold leading-relaxed">{q.question}</p>

                        {/* Options Visualization */}
                        {q.questionType === "MCQ" && (
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {["A","B","C","D"].map((opt) => (
                              <p key={opt} className={`text-sm px-3 py-2 rounded-lg font-medium transition-all ${
                                q.correctAnswer === opt
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold shadow-sm"
                                  : "text-slate-600 border border-transparent"
                              }`}>
                                <span className="mr-2 font-black opacity-50">{opt}.</span> {q[`option${opt}`]}
                              </p>
                            ))}
                          </div>
                        )}

                        {q.questionType === "TRUE_FALSE" && (
                          <p className="mt-3 text-sm text-emerald-700 font-bold bg-emerald-50 px-3 py-2 rounded-lg inline-block border border-emerald-100">
                            ✓ Answer: {q.correctAnswer}
                          </p>
                        )}

                        {q.explanation && (
                          <p className="mt-3 text-sm text-gray-500 italic bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                            <span className="font-bold mr-1">Hint/Exp:</span> {q.explanation}
                          </p>
                        )}

                        {/* File Attachments */}
                        {q.files?.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => toggleFileExpand(q.id)}
                              className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors mb-2 bg-indigo-50 px-3 py-1.5 rounded-lg">
                              <span>📎</span>
                              <span>
                                {expandedFiles[q.id] ? "Hide Attachments" : `Show ${q.files.length} Attachment${q.files.length > 1 ? "s" : ""}`}
                              </span>
                            </button>
                            {expandedFiles[q.id] && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                {q.files.map((file, fIdx) => (
                                  <FileBadge key={fIdx} file={file} onRemove={null} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button onClick={() => handleDelete(q.id)}
                        className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 w-10 h-10 rounded-xl flex items-center justify-center transition-all opacity-50 group-hover:opacity-100 shadow-sm"
                        title="Delete Question">
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};