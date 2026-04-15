import React, { useState, useRef } from "react";
import {
  SEMESTER_OPTIONS,
  BATCH_OPTIONS,
  YEAR_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "./Examstorage.jsx";

// ─── Initial Form State ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  semester:      "",
  batch:         "",
  year:          "",
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
const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Select = ({ value, onChange, options, placeholder, disabled }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

const Input = ({ value, onChange, placeholder, type = "text" }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
);

const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
  const isDoc =
    file.name.endsWith(".doc") || file.name.endsWith(".docx") ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const ext    = isPdf ? "PDF" : isDoc ? "DOC" : "FILE";
  const colors = isPdf
    ? "bg-red-100 text-red-700 border-red-200"
    : isDoc
    ? "bg-blue-100 text-blue-700 border-blue-200"
    : "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 group">
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
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none
          ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"}`}
      >
        <span className="text-2xl mb-1">📎</span>
        <p className="text-xs font-semibold text-gray-500">
          {dragging ? "Drop files here" : "Click or drag & drop to attach files"}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">PDF, DOC, DOCX — multiple allowed</p>
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
const ExamQuestion = () => {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [questions, setQuestions] = useState([]);
  const [errors, setErrors]       = useState({});
  const [activeTab, setActiveTab] = useState("create");
  const [expandedFiles, setExpandedFiles] = useState({});

  // Toast state: null | { type: 'success'|'error', msg: string }
  const [toast, setToast]   = useState(null);
  const toastTimer           = useRef(null);
  const formTopRef           = useRef(null);

  const isMCQ = form.questionType === "MCQ";
  const isTF  = form.questionType === "TRUE_FALSE";

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
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
    if (!form.subject.trim())  e.subject       = "Required";
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
      // Scroll to top of form so user sees errors
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const newQ = {
      id: Date.now(),
      ...form,
      createdAt: new Date().toLocaleDateString(),
    };

    setQuestions((prev) => [newQ, ...prev]);

    // ── KEY CHANGE: keep context (semester/batch/year/subject/type/difficulty)
    //    but clear question-specific fields so next question is fast to fill ──
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

    // Scroll to question textarea so user can type immediately
    setTimeout(() => {
      document.getElementById("question-textarea")?.focus();
    }, 100);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    showToast("success", "Form cleared.");
  };

  const handleDelete = (id) =>
    setQuestions((prev) => prev.filter((q) => q.id !== id));

  const toggleFileExpand = (id) =>
    setExpandedFiles((prev) => ({ ...prev, [id]: !prev[id] }));

  const err = (field) =>
    errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Exam Questions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and create exam questions by semester, batch &amp; year
        </p>
      </div>

      {/* ── Floating Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border transition-all
          ${toast.type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"}`}>
          <span>{toast.type === "success" ? "✅" : "❌"}</span>
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600 text-base leading-none">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["create", "list"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}>
            {tab === "create" ? "➕ Create Question" : `📋 All Questions (${questions.length})`}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          CREATE FORM
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "create" && (
        <div ref={formTopRef} className="bg-white text-left rounded-2xl shadow-sm border border-gray-200 p-6 max-w-4xl">

          {/* Progress hint */}
          {questions.length > 0 && (
            <div className="mb-5 flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
              <p className="text-sm text-blue-700 font-medium">
                🎉 {questions.length} question{questions.length > 1 ? "s" : ""} added so far
              </p>
              <button onClick={() => setActiveTab("list")}
                className="text-xs text-blue-600 hover:underline font-semibold">
                View all →
              </button>
            </div>
          )}

          {/* ── Section: Exam Context (sticky across questions) ── */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-1 pb-2 border-b flex items-center gap-2">
              📌 Exam Context
              <span className="text-xs font-normal text-gray-400">— stays filled between questions</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
              <div>
                <Label required>Semester</Label>
                <Select value={form.semester} onChange={set("semester")} options={SEMESTER_OPTIONS} placeholder="Select Semester" />
                {err("semester")}
              </div>
              <div>
                <Label required>Batch</Label>
                <Select value={form.batch} onChange={set("batch")} options={BATCH_OPTIONS} placeholder="Select Batch" />
                {err("batch")}
              </div>
              <div>
                <Label required>Year</Label>
                <Select value={form.year} onChange={set("year")} options={YEAR_OPTIONS} placeholder="Select Year" />
                {err("year")}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <Label required>Subject</Label>
                <Input value={form.subject} onChange={set("subject")} placeholder="e.g. Mathematics" />
                {err("subject")}
              </div>
              <div>
                <Label required>Question Type</Label>
                <Select value={form.questionType} onChange={set("questionType")} options={QUESTION_TYPE_OPTIONS} placeholder="Select Type" />
                {err("questionType")}
              </div>
              <div>
                <Label required>Difficulty</Label>
                <Select value={form.difficulty} onChange={set("difficulty")} options={DIFFICULTY_OPTIONS} placeholder="Select Difficulty" />
                {err("difficulty")}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-gray-200 my-5" />

          {/* ── Section: This Question ── */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4 pb-2 border-b flex items-center gap-2">
              📝 Question #{questions.length + 1}
              <span className="text-xs font-normal text-gray-400">— clears after each save</span>
            </h2>

            <div className="mb-4">
              <Label required>Marks</Label>
              <div className="max-w-[160px]">
                <Input type="number" value={form.marks} onChange={set("marks")} placeholder="e.g. 5" />
              </div>
              {err("marks")}
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <Label required>Question</Label>
              <textarea
                id="question-textarea"
                value={form.question}
                onChange={set("question")}
                placeholder="Type your question here..."
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                  ${errors.question ? "border-red-400 bg-red-50" : "border-gray-300"}`}
              />
              {err("question")}
            </div>

            {/* MCQ Options */}
            {isMCQ && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-blue-700 mb-3">MCQ Options</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {["A", "B", "C", "D"].map((opt) => (
                    <div key={opt}>
                      <Label>Option {opt}</Label>
                      <Input value={form[`option${opt}`]} onChange={set(`option${opt}`)} placeholder={`Option ${opt}`} />
                      {err(`option${opt}`)}
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Label required>Correct Answer</Label>
                  <Select
                    value={form.correctAnswer}
                    onChange={set("correctAnswer")}
                    options={["A","B","C","D"].map((o) => ({ value: o, label: `Option ${o}` }))}
                    placeholder="Select Correct Option"
                  />
                  {err("correctAnswer")}
                </div>
              </div>
            )}

            {/* True / False */}
            {isTF && (
              <div className="mb-4">
                <Label required>Correct Answer</Label>
                <Select
                  value={form.correctAnswer}
                  onChange={set("correctAnswer")}
                  options={[{ value: "TRUE", label: "True" }, { value: "FALSE", label: "False" }]}
                  placeholder="Select Answer"
                />
                {err("correctAnswer")}
              </div>
            )}

            {/* Explanation */}
            <div className="mb-4">
              <Label>Explanation <span className="text-gray-400 font-normal text-xs">(Optional)</span></Label>
              <Textarea value={form.explanation} onChange={set("explanation")} placeholder="Add explanation or hints..." rows={2} />
            </div>
          </div>

          {/* ── Reference Documents ── */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-gray-700 mb-1 pb-2 border-b flex items-center gap-2">
              📎 Reference Documents
              <span className="text-xs font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">Attach reference sheets, diagrams, or supporting docs.</p>
            <FileUploadZone files={form.files} onAdd={addFile} onRemove={removeFile} />
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-wrap gap-3 justify-between items-center pt-4 border-t border-gray-100">
            <button onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 transition">
              🔄 Clear All
            </button>

            <div className="flex gap-3">
              {/* Save & add another — primary CTA */}
              <button onClick={handleSubmit}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow transition flex items-center gap-2">
                💾 Save &amp; Add Another
              </button>

              {/* View list shortcut */}
              {questions.length > 0 && (
                <button onClick={() => setActiveTab("list")}
                  className="px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition">
                  View List ({questions.length})
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          LIST VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "list" && (
        <div className="max-w-4xl">
          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-gray-400 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-medium text-gray-600">No questions yet</p>
              <p className="text-sm mt-1">Create your first question using the form</p>
              <button onClick={() => setActiveTab("create")}
                className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm">
                Create Question
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-500 font-medium">
                  {questions.length} question{questions.length > 1 ? "s" : ""} added
                </p>
                <button onClick={() => setActiveTab("create")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center gap-1.5">
                  ➕ Add Another
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Sem {q.semester}</span>
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Batch {q.batch}</span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">{q.year}</span>
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">{q.questionType}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            q.difficulty === "EASY"   ? "bg-green-50 text-green-600"  :
                            q.difficulty === "MEDIUM" ? "bg-yellow-50 text-yellow-600" :
                                                        "bg-red-50 text-red-600"
                          }`}>{q.difficulty}</span>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                            {q.marks} marks
                          </span>
                          {q.files?.length > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium flex items-center gap-1">
                              📎 {q.files.length} file{q.files.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-400 mb-1">
                          Q{idx + 1} · {q.subject} · Added {q.createdAt}
                        </p>
                        <p className="text-gray-800 text-sm font-medium">{q.question}</p>

                        {q.questionType === "MCQ" && (
                          <div className="mt-2 grid grid-cols-2 gap-1">
                            {["A","B","C","D"].map((opt) => (
                              <p key={opt} className={`text-xs px-2 py-1 rounded ${
                                q.correctAnswer === opt
                                  ? "bg-green-100 text-green-700 font-semibold"
                                  : "bg-gray-50 text-gray-600"
                              }`}>
                                {opt}. {q[`option${opt}`]}
                              </p>
                            ))}
                          </div>
                        )}

                        {q.questionType === "TRUE_FALSE" && (
                          <p className="mt-2 text-xs text-green-700 font-medium">✓ Answer: {q.correctAnswer}</p>
                        )}

                        {q.explanation && (
                          <p className="mt-2 text-xs text-gray-500 italic">💡 {q.explanation}</p>
                        )}

                        {q.files?.length > 0 && (
                          <div className="mt-3">
                            <button type="button" onClick={() => toggleFileExpand(q.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors mb-2">
                              <span>📎</span>
                              <span>
                                {expandedFiles[q.id]
                                  ? "Hide attachments"
                                  : `Show ${q.files.length} attachment${q.files.length > 1 ? "s" : ""}`}
                              </span>
                              <span className="text-gray-400">{expandedFiles[q.id] ? "▲" : "▼"}</span>
                            </button>
                            {expandedFiles[q.id] && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                {q.files.map((file, fIdx) => (
                                  <FileBadge key={fIdx} file={file} onRemove={null} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button onClick={() => handleDelete(q.id)}
                        className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0 mt-1"
                        title="Delete">
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

export default ExamQuestion;