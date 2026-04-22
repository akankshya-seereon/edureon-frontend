import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen, Plus, Search, X, ChevronDown, Users,
  Calendar, Clock, Layers, Building2, GraduationCap,
  Edit2, Trash2, Eye, AlertCircle, CheckCircle, Hash
} from 'lucide-react';

// 🚀 IMPORTANT: Adjust this path to match your project structure
import apiBaseUrl from "../../../config/baseurl"; 

const EMPTY_FORM = {
  className: '',
  program: '',
  department: '',
  subject: '',
  facultyAssigned: '',
  academicYear: '',
  semester: '',
  section: '',
  maxStudents: '',
  schedule: [{ day: '', startTime: '', endTime: '', room: '' }],
  description: '',
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold text-left transition-all
    ${type === 'success' ? 'bg-blue-600' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={15} /></button>
  </div>
);

// ─── Upgraded Select (Handles Real DB Objects) ────────────────────────────────
const Select = ({ label, name, value, onChange, options = [], required, placeholder, valueKey = 'name', labelKey = 'name', customDisplay }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-left disabled:bg-gray-50 disabled:text-gray-400"
        disabled={options.length === 0}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((o, idx) => {
          const val = typeof o === 'string' ? o : o[valueKey];
          // Support custom display formatting (like showing Subject Name + Code)
          const display = typeof o === 'string' ? o : (customDisplay ? customDisplay(o) : o[labelKey]);
          return <option key={idx} value={val}>{display}</option>;
        })}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ label, name, value, onChange, type = 'text', required, placeholder, icon: Icon }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left ${Icon ? 'pl-9' : ''}`}
      />
    </div>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green: 'bg-blue-50 text-blue-600 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm mb-4 text-left ${colors[color]}`}>
      <Icon size={16} />
      {title}
    </div>
  );
};

// ─── Create Class Modal ───────────────────────────────────────────────────────
const CreateClassModal = ({ onClose, onSave, editData, dropdownData }) => {
  const [form, setForm] = useState(editData || EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // 🚀 Pulling real data passed from the main component
  const { programs, departments, subjects, faculty, academicYears, semesters, sections, days, rooms } = dropdownData;

  // 🚀 DYNAMIC SUBJECT FILTERING
  // When 'program' changes, filter subjects. (Requires backend to return 'course_name' alongside subjects)
  useEffect(() => {
    if (form.program && subjects?.length > 0) {
      if (subjects[0].course_name) {
        // If backend provides course_name, filter perfectly
        setAvailableSubjects(subjects.filter(s => s.course_name === form.program));
      } else {
        // Fallback: show all subjects if backend isn't updated with course_name yet
        setAvailableSubjects(subjects);
      }
    } else {
      setAvailableSubjects([]); // Clear if no program selected
    }
  }, [form.program, subjects]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // If Program changes, clear the Subject field so they have to pick a new valid one
    if (name === 'program') {
      setForm(f => ({ ...f, [name]: value, subject: '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleScheduleChange = (idx, field, value) => {
    const updated = form.schedule.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setForm(f => ({ ...f, schedule: updated }));
  };

  const addScheduleRow = () => setForm(f => ({ ...f, schedule: [...f.schedule, { day: '', startTime: '', endTime: '', room: '' }] }));
  const removeScheduleRow = (idx) => setForm(f => ({ ...f, schedule: f.schedule.filter((_, i) => i !== idx) }));

  const validate = () => {
    const e = {};
    if (!form.className.trim()) e.className = 'Class name is required';
    if (!form.department) e.department = 'Department is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4 text-left">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl text-left">

        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{editData ? 'Edit Class' : 'Create New Class'}</h2>
              <p className="text-xs text-gray-500">Using live data from your database</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-6 text-left">
          {/* ── Basic Info ── */}
          <div>
            <SectionHeader icon={BookOpen} title="Basic Information" color="blue" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input label="Class Name" name="className" value={form.className} onChange={handleChange} required placeholder="e.g. Data Structures - Section A" icon={Hash} />
                {errors.className && <p className="text-red-500 text-xs mt-1 text-left">{errors.className}</p>}
              </div>
              
              {/* 🚀 FIXED: Keys updated to "name" to match the backend query */}
              <div>
                <Select label="Program" name="program" value={form.program} onChange={handleChange} options={programs} valueKey="name" labelKey="name" placeholder="Select Program" />
              </div>
              <div>
                <Select label="Department" name="department" value={form.department} onChange={handleChange} options={departments} valueKey="name" labelKey="name" required placeholder="Select Department" />
                {errors.department && <p className="text-red-500 text-xs mt-1 text-left">{errors.department}</p>}
              </div>
              <div>
                <Select 
                  label="Subject" 
                  name="subject" 
                  value={form.subject} 
                  onChange={handleChange} 
                  options={availableSubjects} 
                  valueKey="name" 
                  customDisplay={(sub) => sub.code ? `${sub.name} (${sub.code})` : sub.name} // 🚀 Formats display as "Data Structure (D868)"
                  placeholder={form.program ? "Select Subject" : "Select a Program first"} 
                />
              </div>
              <div>
                <Select label="Faculty Assigned" name="facultyAssigned" value={form.facultyAssigned} onChange={handleChange} options={faculty} valueKey="name" labelKey="name" placeholder="Select Faculty" />
              </div>
            </div>
          </div>

          {/* ── Academic Details ── */}
          <div>
            <SectionHeader icon={GraduationCap} title="Academic Details" color="purple" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} options={academicYears} />
              </div>
              <div>
                <Select label="Semester" name="semester" value={form.semester} onChange={handleChange} options={semesters} />
              </div>
              <div>
                <Select label="Section" name="section" value={form.section} onChange={handleChange} options={sections} />
              </div>
              <div>
                <Input label="Max Students" name="maxStudents" value={form.maxStudents} onChange={handleChange} type="number" placeholder="e.g. 60" icon={Users} />
              </div>
            </div>
          </div>

          {/* ── Schedule ── */}
          <div>
            <SectionHeader icon={Clock} title="Class Schedule" color="blue" />
            <div className="space-y-3">
              {form.schedule.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-gray-50 rounded-xl p-3">
                  <div className="col-span-3 text-left">
                    <Select label="Day" name="day" value={slot.day} onChange={e => handleScheduleChange(idx, 'day', e.target.value)} options={days} placeholder="Day" />
                  </div>
                  <div className="col-span-3 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Start Time</label>
                      <input type="time" value={slot.startTime} onChange={e => handleScheduleChange(idx, 'startTime', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left" />
                    </div>
                  </div>
                  <div className="col-span-3 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">End Time</label>
                      <input type="time" value={slot.endTime} onChange={e => handleScheduleChange(idx, 'endTime', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left" />
                    </div>
                  </div>
                  <div className="col-span-2 text-left">
                    {/* 🚀 FIXED: Keys updated to "name" for rooms */}
                    <Select label="Room" name="room" value={slot.room} onChange={e => handleScheduleChange(idx, 'room', e.target.value)} options={rooms} valueKey="name" labelKey="name" placeholder="Room" />
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    {form.schedule.length > 1 && (
                      <button type="button" onClick={() => removeScheduleRow(idx)} className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addScheduleRow} className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-800 transition px-1">
                <Plus size={15} /> Add Another Slot
              </button>
            </div>
          </div>

          {/* ── Description ── */}
          <div className="text-left">
            <SectionHeader icon={Layers} title="Additional Info" color="orange" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description about this class..."
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-left"
              />
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-200">
              <BookOpen size={15} /> {editData ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ cls, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 text-left">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Class?</h3>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to delete <span className="font-semibold text-gray-700">"{cls.className}"</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">Delete</button>
      </div>
    </div>
  </div>
);

// ─── Main ClassList Page ──────────────────────────────────────────────────────
export const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // 🚀 Real Database Dropdown State
  const [dropdownData, setDropdownData] = useState({
    programs: [],    // Will be filled from DB
    departments: [], // Will be filled from DB
    subjects: [],    // Will be filled from DB
    faculty: [],     // Will be filled from DB
    rooms: [],       // Will be filled from DB
    academicYears: ['2024-25', '2025-26', '2026-27'],
    semesters: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'],
    sections: ['A', 'B', 'C', 'D', 'E'],
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiBaseUrl}/admin/classes`, { withCredentials: true });
      if (response.data.success) setClasses(response.data.data || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      showToast('Failed to load classes from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/classes/form-data`, { withCredentials: true });
      if (response.data.success) {
        setDropdownData(prev => ({
          ...prev, 
          ...response.data.data 
        }));
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchDropdownData(); 
  }, []);

  const filtered = classes.filter(c =>
    c.className?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase()) ||
    c.facultyAssigned?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data) => {
    try {
      const payload = { ...data, departmentId: data.department };
      if (editData) {
        const response = await axios.put(`${apiBaseUrl}/admin/classes/${data.id}`, payload, { withCredentials: true });
        if (response.data.success) { showToast('Class updated successfully!'); fetchClasses(); }
      } else {
        const response = await axios.post(`${apiBaseUrl}/admin/classes`, payload, { withCredentials: true });
        if (response.data.success) { showToast('Class created successfully!'); fetchClasses(); }
      }
      setShowModal(false);
      setEditData(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save class.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${apiBaseUrl}/admin/classes/${deleteTarget.id}`, { withCredentials: true });
      if (response.data.success) { showToast('Class deleted successfully.', 'success'); fetchClasses(); }
      setDeleteTarget(null);
    } catch (error) {
      showToast('Failed to delete class.', 'error');
    }
  };

  const openEdit = (cls) => {
    setEditData(cls);
    setShowModal(true);
  };

  const getScheduleSummary = (schedule) => {
    if (!schedule?.length || !schedule[0].day) return '—';
    return schedule.filter(s => s.day).map(s => `${s.day.slice(0, 3)} ${s.startTime || ''}${s.startTime && s.endTime ? '–' + s.endTime : ''}`).join(', ') || '—';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-left">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Classes</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and assign all institute classes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-white" />
            <span className="text-white font-bold text-sm">All Classes</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditData(null); setShowModal(true); }} className="flex items-center gap-2 bg-white text-blue-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition shadow">
              <Plus size={15} /> Create Class
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Course Name', 'Class / Section', 'Subject', 'Academic Year', 'Schedule', 'Students', 'Faculty', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center"><p className="font-bold text-gray-500">Loading classes...</p></td></tr>
              ) : filtered.map((cls, idx) => (
                  <tr key={cls.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4"><p className="font-bold text-gray-900 text-sm">{cls.className}</p><p className="text-xs text-gray-400">{cls.program} · {cls.department}</p></td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full"><Layers size={11} />{cls.semester} · Sec {cls.section}</span></td>
                    <td className="px-5 py-4 text-sm text-gray-700 font-medium">{cls.subject}</td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full"><Calendar size={11} />{cls.academicYear}</span></td>
                    <td className="px-5 py-4 text-xs text-gray-600"><div className="flex items-start gap-1.5"><Clock size={12} className="text-gray-400 mt-0.5 shrink-0" /><span>{getScheduleSummary(cls.schedule)}</span></div></td>
                    <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full"><Users size={11} />{cls.students || 0} / {cls.maxStudents}</span></td>
                    <td className="px-5 py-4 text-sm text-gray-700">{cls.facultyAssigned}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(cls)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(cls)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <CreateClassModal onClose={() => { setShowModal(false); setEditData(null); }} onSave={handleSave} editData={editData} dropdownData={dropdownData} />}
      {deleteTarget && <DeleteModal cls={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}; 

export default ClassList;