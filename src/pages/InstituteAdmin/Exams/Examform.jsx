import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
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

const Label = ({ children, required }) => (
  <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wider text-[11px]">
    {children} {required && <span className="text-red-500">*</span>}
  </label>
);

const Input = ({ value, onChange, placeholder, type = "text", min, name, list }) => (
  <input
    type={type}
    name={name}
    list={list}
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

const EMPTY = {
  subject: "",
  specialization: "", 
  examType: "",
  title: "",
  description: "", 
  semester: "",
  batch: "",
  year: "",
  examShift: "", 
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
  attachedPdf: null,
  isAssigned: false,
  assignedFaculty: "",
};

export const ExamForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editExam = location.state?.exam || null;
  const isEdit = !!editExam;

  const [activeTab, setActiveTab] = useState("details");
  const [form, setForm] = useState(isEdit ? { ...EMPTY, ...editExam, attachedPdf: null } : { ...EMPTY });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Unified dropdown state
  const [dropdownData, setDropdownData] = useState({
    faculties: [], subjects: [], departments: [], batches: [],
    rooms: [], campuses: [], buildings: []
  });

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const config = getAuthConfig(); 
        const res = await axios.get(`${apiBaseUrl}/admin/exams/form-data`, config);
        
        if (res.data?.success) {
          const data = res.data.data;
          setDropdownData({
            faculties: data.faculty?.map(f => ({ value: f.id, label: f.name })) || [],
            subjects: data.subjects?.map(s => ({ value: s.name, label: s.name })) || [],
            
            // 🚀 FIXED: The backend returns 'departments', so we map them here
            departments: data.departments?.map(d => ({ value: d.name, label: d.name })) || [],
            
            batches: data.batches?.map(b => ({ value: b.name, label: b.name })) || [],
            
            // 🚀 FIXED: Map venues uniformly so datalists render properly
            campuses: data.campuses?.map(c => ({ value: c.name, label: c.name })) || [],
            buildings: data.buildings?.map(b => ({ value: b.name, label: b.name })) || [],
            rooms: data.rooms || []
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

  const handleVenueChange = (field, value) => {
    let updates = { [field]: value };
    if (field === 'campus') updates = { ...updates, building: '', block: '', floor: '', room: '' };
    if (field === 'building') updates = { ...updates, block: '', floor: '', room: '' };
    if (field === 'block') updates = { ...updates, floor: '', room: '' };
    if (field === 'floor') updates = { ...updates, room: '' };
    
    setForm(prev => ({ ...prev, ...updates }));
  };

  const availableBuildings = useMemo(() => [...new Set(dropdownData.rooms.filter(r => r.campus === form.campus).map(r => r.building).filter(Boolean))], [dropdownData.rooms, form.campus]);
  const availableBlocks = useMemo(() => [...new Set(dropdownData.rooms.filter(r => r.building === form.building).map(r => r.block).filter(Boolean))], [dropdownData.rooms, form.building]);
  const availableFloors = useMemo(() => [...new Set(dropdownData.rooms.filter(r => r.block === form.block).map(r => r.floor).filter(Boolean))], [dropdownData.rooms, form.block]);
  const availableRooms = useMemo(() => dropdownData.rooms.filter(r => r.floor === form.floor && r.block === form.block), [dropdownData.rooms, form.floor, form.block]);

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
      return toast.error("You must attach a PDF or Assign a Faculty before scheduling.");
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
          <p className="text-sm font-semibold text-gray-500">Set exam details, venues, and assignments</p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto">
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
          <button onClick={() => setActiveTab("details")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "details" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"}`}>
            1. Exam Details
          </button>
          {!isEdit && (
            <button onClick={() => setActiveTab("builder")} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === "builder" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-100"}`}>
              2. Assignments & Uploads
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 min-h-[500px]">
          {activeTab === "details" && (
            <div className="space-y-4">
              
              <Section title="Exam Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                  <div>
                    {/* 🚀 FIXED: UI Label and mapping */}
                    <Label>Department</Label>
                    <Select value={form.specialization} onChange={set("specialization")} options={dropdownData.departments} placeholder="Select Department" />
                  </div>
                  <div>
                    <Label required>Subject</Label>
                    <Select value={form.subject} onChange={set("subject")} options={dropdownData.subjects.length > 0 ? dropdownData.subjects : SUBJECT_OPTIONS} placeholder="Select Subject" />
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

              <Section title="Exam Schedule">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-5">
                  <div><Label required>Semester</Label><Select value={form.semester} onChange={set("semester")} options={SEMESTER_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.semester} /></div>
                  <div><Label required>Batch</Label><Select value={form.batch} onChange={set("batch")} options={dropdownData.batches.length > 0 ? dropdownData.batches : BATCH_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.batch} /></div>
                  <div><Label required>Year</Label><Select value={form.year} onChange={set("year")} options={YEAR_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.year} /></div>
                  <div><Label>Exam Shift</Label><Select value={form.examShift} onChange={set("examShift")} options={EXAM_SHIFT_OPTIONS} placeholder="Select Shift" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div><Label required>Date</Label><Input type="date" value={form.examDate} onChange={set("examDate")} /><ErrMsg msg={errors.examDate} /></div>
                  <div><Label required>Time</Label><Input type="time" value={form.startTime} onChange={set("startTime")} /><ErrMsg msg={errors.startTime} /></div>
                  <div><Label required>Duration</Label><Select value={form.duration} onChange={set("duration")} options={DURATION_OPTIONS} placeholder="Select" /><ErrMsg msg={errors.duration} /></div>
                </div>
              </Section>

              <Section title="Marks & Venue">
                <div className="grid grid-cols-2 gap-5 mb-6 pb-6 border-b border-gray-100">
                  <div><Label required>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={set("totalMarks")} placeholder="100" /><ErrMsg msg={errors.totalMarks} /></div>
                  <div><Label required>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={set("passingMarks")} placeholder="40" /><ErrMsg msg={errors.passingMarks} /></div>
                </div>
                
                <Label>Venue Allocation</Label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {/* 🚀 FIXED: Datalists now map cleanly over the .value property */}
                  <datalist id="campus-list">{dropdownData.campuses.map((c, i) => <option key={`c-${i}`} value={c.value} />)}</datalist>
                  <Input list="campus-list" value={form.campus} onChange={e => handleVenueChange('campus', e.target.value)} placeholder="1. Campus" />

                  <datalist id="building-list">{dropdownData.buildings.map((b, i) => <option key={`b-${i}`} value={b.value} />)}</datalist>
                  <Input list="building-list" value={form.building} onChange={e => handleVenueChange('building', e.target.value)} placeholder="2. Building" />

                  <Input value={form.block} onChange={e => handleVenueChange('block', e.target.value)} placeholder="3. Block (Optional)" />
                  <Input value={form.floor} onChange={e => handleVenueChange('floor', e.target.value)} placeholder="4. Floor (Optional)" />

                  <datalist id="room-list">{dropdownData.rooms.map((r, i) => <option key={`r-${i}`} value={r.name} />)}</datalist>
                  <Input list="room-list" value={form.room} onChange={set("room")} placeholder="5. Room No." />
                </div>
              </Section>

              <Section title="Faculty Assignment & Permissions">
                <div className="bg-slate-50 p-5 rounded-xl border border-gray-200 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isAssigned} onChange={set("isAssigned")} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300" />
                    <span className="text-sm font-bold text-gray-700">Delegate Question Paper creation to a specific Faculty?</span>
                  </label>
                  
                  {form.isAssigned && (
                    <div className="mt-4 pl-8 border-l-2 border-blue-200 ml-2">
                      <Label required>Assign To Faculty</Label>
                      <Select value={form.assignedFaculty} onChange={set("assignedFaculty")} options={dropdownData.faculties} placeholder="Select Faculty Member" />
                      <ErrMsg msg={errors.assignedFaculty} />
                      <p className="text-[11px] text-gray-500 mt-2 font-medium">This faculty member will receive a notification to upload or build the question paper.</p>
                    </div>
                  )}
                </div>
              </Section>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                  {saving ? "Saving..." : isEdit ? "Update Exam" : "Schedule Exam"}
                </button>
              </div>

            </div>
          )}

          {activeTab === "builder" && !form.isAssigned && (
            <div className="space-y-6">
              <Section title="Upload Existing Paper">
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <input type="file" accept="application/pdf" id="pdf-upload" className="hidden" onChange={(e) => setForm(p => ({ ...p, attachedPdf: e.target.files[0] }))} />
                  <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                    <span className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">📄</span>
                    <span className="text-sm font-bold text-gray-700">{form.attachedPdf ? form.attachedPdf.name : "Click to upload a PDF Question Paper"}</span>
                    <span className="text-xs font-medium text-gray-500 mt-1">Maximum file size 10MB</span>
                  </label>
                </div>
              </Section>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button onClick={handleSave} disabled={saving || !form.attachedPdf} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
                  {saving ? "Saving..." : "Save & Schedule Exam"}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === "builder" && form.isAssigned && (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-bold">You have delegated this exam to a faculty member. They will upload the paper.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamForm;