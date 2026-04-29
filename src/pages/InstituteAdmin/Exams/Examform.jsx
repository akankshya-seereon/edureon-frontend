import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { jsPDF } from "jspdf";
import axios from "axios";
import {
  SEMESTER_OPTIONS,
  BATCH_OPTIONS, 
  YEAR_OPTIONS,
  SUBJECT_OPTIONS, 
  EXAM_TYPE_OPTIONS,
  DURATION_OPTIONS,
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
  
  const config = { withCredentials: true, headers: {} }; 
  if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const EXAM_SHIFT_OPTIONS = [
  { value: "Morning", label: "Morning" },
  { value: "Afternoon", label: "Afternoon" },
  { value: "Evening", label: "Evening" },
];

const QUESTION_TYPE_OPTIONS = [
  { value: "MCQ", label: "Multiple Choice (MCQ)" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "LONG_ANSWER", label: "Long Answer" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_IN_BLANK", label: "Fill in the Blank" },
  { value: "SUBJECTIVE", label: "Subjective / Essay" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Easy", label: "Easy" },
  { value: "Medium", label: "Medium" },
  { value: "Hard", label: "Hard" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ value, onChange, placeholder, type = "text", min, name }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    min={min}
    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  />
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
    {options?.map((o, index) => (
      <option key={`${o.value || o.id}-${index}`} value={o.value || o.id}>
        {o.label || o.name}
      </option>
    ))}
  </select>
);

const ErrMsg = ({ msg }) => msg ? <p className="text-red-500 text-xs mt-1 font-bold">{msg}</p> : null;

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-4 pb-2 border-b border-gray-100">
      {title}
    </h2>
    {children}
  </div>
);

// ─── Question Paper Print Modal (Unchanged) ───────────────────────────────────
const QuestionPaperPrint = ({ form, questionsList, onClose, dynamicSubjects }) => {
  // ... (Keep your exact QuestionPaperPrint component code here)
  return null; // Placeholder for brevity
};

// ─── Initial State ────────────────────────────────────────────────────────────
const EMPTY = {
  subject: "",
  specialization: "", 
  examType: "",
  title: "",
  description: "", 
  semester: "",
  batch: "",
  year: "",
  shift: "", 
  examDate: "",
  startTime: "",
  duration: "",
  totalMarks: "",
  passingMarks: "",
  campus: "", 
  building: "", 
  block: "", 
  floor: "", 
  room: "", 
  instructions: "",
  attachedPdf: null,
  isAssigned: false,
  assignedFaculty: "",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const ExamForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editExam = location.state?.exam || null;
  const isEdit = !!editExam;

  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(isEdit ? { ...EMPTY, ...editExam, attachedPdf: null } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false); 

  // 🚀 New unified dropdown state
  const [dropdownData, setDropdownData] = useState({
    faculties: [], subjects: [], specializations: [], batches: [],
    rooms: [], campuses: [], buildings: []
  });

  const [questionsList, setQuestionsList] = useState([]);
  const [currentQ, setCurrentQ] = useState({
    question: "", marks: "", type: "MCQ", difficulty: "Medium",
    optionA: "", optionB: "", optionC: "", optionD: "",
  });

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const config = getAuthConfig(); 
        // 🚀 Reusing the powerful form-data endpoint from Class Management!
        const res = await axios.get(`${apiBaseUrl}/admin/classes/form-data`, config);
        
        if (res.data?.success) {
          const data = res.data.data;
          setDropdownData({
            faculties: data.faculty?.map(f => ({ value: f.id, label: f.name })) || [],
            subjects: data.subjects?.map(s => ({ value: s.name, label: s.name, spec: s.specialization })) || [],
            specializations: data.specializations?.map(s => ({ value: s.name, label: s.name })) || [],
            batches: data.batches?.map(b => ({ value: b.name, label: b.name })) || [],
            rooms: data.rooms || [],
            campuses: data.campuses || [],
            buildings: data.buildings || [],
          });
        }
      } catch (error) {
        console.error("Failed to load setup data:", error);
      }
    };
    fetchSetupData();
  }, []);

  const set = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  // 🚀 Cascading Room Handlers
  const handleVenueChange = (field, value) => {
    let updates = { [field]: value };
    if (field === 'campus') updates = { ...updates, building: '', block: '', floor: '', room: '' };
    if (field === 'building') updates = { ...updates, block: '', floor: '', room: '' };
    if (field === 'block') updates = { ...updates, floor: '', room: '' };
    if (field === 'floor') updates = { ...updates, room: '' };
    
    setForm(prev => ({ ...prev, ...updates }));
  };

  // 🚀 Cascading Selectors logic
  const filteredSubjects = useMemo(() => {
    if (!form.specialization) return dropdownData.subjects;
    return dropdownData.subjects.filter(s => s.spec === form.specialization);
  }, [form.specialization, dropdownData.subjects]);

  const availableBuildings = useMemo(() => [...new Set(dropdownData.rooms.filter(r => r.campus === form.campus).map(r => r.building).filter(Boolean))], [dropdownData.rooms, form.campus]);
  const availableBlocks = useMemo(() => [...new Set(dropdownData.rooms.filter(r => r.building === form.building).map(r => r.block).filter(Boolean))], [dropdownData.rooms, form.building]);
  const availableFloors = useMemo(() => [...new Set(dropdownData.rooms.filter(r => r.block === form.block).map(r => r.floor).filter(Boolean))], [dropdownData.rooms, form.block]);
  const availableRooms = useMemo(() => dropdownData.rooms.filter(r => r.floor === form.floor && r.block === form.block), [dropdownData.rooms, form.floor, form.block]);

  // ... (Keep handleQChange, addQuestion, removeQuestion, generateAndAttachPDF exactly as they were) ...

  const validate = () => {
    const e = {};
    if (!form.title?.trim()) e.title = "Required";
    if (!form.subject) e.subject = "Required";
    if (!form.examType) e.examType = "Required";
    if (!form.semester) e.semester = "Required";
    if (!form.batch) e.batch = "Required";
    if (!form.year) e.year = "Required";
    if (!form.examDate) e.examDate = "Required";
    if (!form.startTime) e.startTime = "Required";
    if (!form.duration) e.duration = "Required";
    if (!form.totalMarks) e.totalMarks = "Required";
    if (!form.passingMarks) e.passingMarks = "Required"; 
    if (!form.room) e.room = "Final Room is required"; 
    if (form.isAssigned && !form.assignedFaculty) e.assignedFaculty = "Please select a faculty";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    setErrors(e); 
    
    if (Object.keys(e).length > 0) {
      setActiveTab("details");
      return toast.error("Please fill in all required Exam Details");
    }

    if (!isEdit && !form.isAssigned && !form.attachedPdf) {
      setActiveTab("builder");
      return toast.error("You must generate and attach the PDF before scheduling.");
    }

    setSaving(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === "attachedPdf") return;
        if (key === "assignedFaculty" && (!form.isAssigned || !form.assignedFaculty)) return; 
        if (form[key] !== null && form[key] !== undefined && form[key] !== "") {
          formData.append(key, form[key]);
        }
      });
      
      if (form.attachedPdf) formData.append("question_paper", form.attachedPdf);

      const config = getAuthConfig();
      config.headers["Content-Type"] = "multipart/form-data";

      const res = isEdit 
        ? await axios.put(`${apiBaseUrl}/admin/exams/${editExam.id}`, formData, config)
        : await axios.post(`${apiBaseUrl}/admin/exams`, formData, config);

      if (res.data.success) {
        toast.success(isEdit ? "Exam Updated Successfully!" : "Exam Scheduled Successfully!");
        navigate("/admin/exams");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save exam");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 p-6 text-left">
      <div className="flex items-center gap-3 mb-6 max-w-8xl mx-auto">
        <button onClick={() => navigate("/admin/exams")} className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 transition-all shadow-sm">←</button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{isEdit ? "Edit Exam" : "Schedule New Exam"}</h1>
          <p className="text-sm font-semibold text-gray-500">Set exam details, venues, and build question papers</p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto">
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
          <button onClick={() => setActiveTab("details")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "details" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"}`}>
            1. Exam Details
          </button>
          {!isEdit && (
            <button onClick={() => setActiveTab("builder")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "builder" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"}`}>
              2. Question Builder ({questionsList.length})
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 min-h-[500px]">
          {activeTab === "details" && (
            <div className="space-y-4">
              
              {/* ── 1. Exam Identity ── */}
              <Section title="Exam Identity">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  <div>
                    <Label>Specialization</Label>
                    <Select value={form.specialization} onChange={set("specialization")} options={dropdownData.specializations} placeholder="Select Specialization" />
                  </div>
                  <div>
                    <Label required>Subject</Label>
                    <Select value={form.subject} onChange={set("subject")} options={filteredSubjects.length > 0 ? filteredSubjects : SUBJECT_OPTIONS} placeholder="Select Subject" disabled={!form.specialization && dropdownData.specializations.length > 0} />
                    <ErrMsg msg={errors.subject} />
                  </div>
                  <div>
                    <Label required>Exam Type</Label>
                    <Select value={form.examType} onChange={set("examType")} options={EXAM_TYPE_OPTIONS} placeholder="Select Type" />
                    <ErrMsg msg={errors.examType} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <Label required>Exam Title</Label>
                    <Input value={form.title} onChange={set("title")} placeholder="e.g. Mathematics - Mid-Term Exam" />
                    <ErrMsg msg={errors.title} />
                  </div>
                  <div>
                    <Label>Exam Description</Label>
                    <Input value={form.description} onChange={set("description")} placeholder="Brief details about the exam..." />
                  </div>
                </div>
              </Section>

              {/* ── 2. Target & Schedule ── */}
              <Section title="Target & Schedule">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-5">
                  <div><Label required>Semester</Label><Select value={form.semester} onChange={set("semester")} options={SEMESTER_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.semester} /></div>
                  <div><Label required>Batch</Label><Select value={form.batch} onChange={set("batch")} options={dropdownData.batches.length > 0 ? dropdownData.batches : BATCH_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.batch} /></div>
                  <div><Label required>Year</Label><Select value={form.year} onChange={set("year")} options={YEAR_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.year} /></div>
                  <div><Label>Exam Shift</Label><Select value={form.shift} onChange={set("shift")} options={EXAM_SHIFT_OPTIONS} placeholder="Select Shift" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div><Label required>Date</Label><Input type="date" value={form.examDate} onChange={set("examDate")} /><ErrMsg msg={errors.examDate} /></div>
                  <div><Label required>Time</Label><Input type="time" value={form.startTime} onChange={set("startTime")} /><ErrMsg msg={errors.startTime} /></div>
                  <div><Label required>Duration</Label><Select value={form.duration} onChange={set("duration")} options={DURATION_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.duration} /></div>
                </div>
              </Section>

              {/* ── 3. Marks & Hierarchical Venue ── */}
              <Section title="Marks & Venue">
                <div className="grid grid-cols-2 gap-5 mb-6 pb-6 border-b border-gray-100">
                  <div><Label required>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={set("totalMarks")} placeholder="100" /><ErrMsg msg={errors.totalMarks} /></div>
                  <div><Label required>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={set("passingMarks")} placeholder="40" /><ErrMsg msg={errors.passingMarks} /></div>
                </div>
                
                <Label required>Venue Allocation</Label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <Select value={form.campus} onChange={e => handleVenueChange('campus', e.target.value)} options={dropdownData.campuses.map(c => ({value: c, label: c}))} placeholder="1. Campus" />
                  <Select value={form.building} onChange={e => handleVenueChange('building', e.target.value)} options={availableBuildings.map(b => ({value: b, label: b}))} disabled={!form.campus} placeholder="2. Building" />
                  <Select value={form.block} onChange={e => handleVenueChange('block', e.target.value)} options={availableBlocks.map(b => ({value: b, label: b}))} disabled={!form.building} placeholder="3. Block" />
                  <Select value={form.floor} onChange={e => handleVenueChange('floor', e.target.value)} options={availableFloors.map(f => ({value: f, label: f}))} disabled={!form.block} placeholder="4. Floor" />
                  <div>
                    <Select value={form.room} onChange={set("room")} options={availableRooms.map(r => ({value: r.id, label: r.name}))} disabled={!form.floor} placeholder="5. Room" />
                    <ErrMsg msg={errors.room} />
                  </div>
                </div>
              </Section>

              {/* ... (Keep the Faculty Assignment and PDF builder UI exactly as it was) ... */}

            </div>
          )}

          {/* ... (Keep activeTab === "builder" UI exactly as it was) ... */}
        </div>
      </div>
    </div>
  );
};