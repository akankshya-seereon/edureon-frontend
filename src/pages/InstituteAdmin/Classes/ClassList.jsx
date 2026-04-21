import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen, Plus, Search, X, ChevronDown, Users,
  Calendar, Clock, Layers, Building2, GraduationCap,
  Edit2, Trash2, Eye, AlertCircle, CheckCircle, Hash
} from 'lucide-react';

// 🚀 IMPORTANT: Adjust this path to match your project structure
import apiBaseUrl from "../../../config/baseurl"; 

// ─── Mock Data for Dropdowns ──────────────────────────────────────────────────
const PROGRAMS = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'MBA', 'BBA'];
const DEPARTMENTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Management'];
const SUBJECTS = ['Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks', 'Machine Learning', 'Web Development', 'Mathematics', 'Physics'];
const FACULTY_LIST = ['Dr. Joya Sharma', 'Prof. Ramesh Kumar', 'Dr. Priya Nair', 'Mr. Anil Mehta', 'Dr. Sunita Rao'];
const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27'];
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ROOMS = ['Room 101', 'Room 102', 'Room 201', 'Lab 1', 'Lab 2', 'Seminar Hall', 'Auditorium'];

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
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={15} /></button>
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({ label, name, value, onChange, options, required, placeholder }) => (
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
        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 text-left"
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
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
    green: 'bg-green-50 text-green-700 border-green-200',
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
const CreateClassModal = ({ onClose, onSave, editData }) => {
  const [form, setForm] = useState(editData || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleScheduleChange = (idx, field, value) => {
    const updated = form.schedule.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setForm(f => ({ ...f, schedule: updated }));
  };

  const addScheduleRow = () => {
    setForm(f => ({ ...f, schedule: [...f.schedule, { day: '', startTime: '', endTime: '', room: '' }] }));
  };

  const removeScheduleRow = (idx) => {
    setForm(f => ({ ...f, schedule: f.schedule.filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e = {};
    if (!form.className.trim()) e.className = 'Class name is required';
    if (!form.program) e.program = 'Program is required';
    if (!form.department) e.department = 'Department is required';
    if (!form.subject) e.subject = 'Subject is required';
    if (!form.facultyAssigned) e.facultyAssigned = 'Faculty is required';
    if (!form.academicYear) e.academicYear = 'Academic year is required';
    if (!form.semester) e.semester = 'Semester is required';
    if (!form.section) e.section = 'Section is required';
    if (!form.maxStudents || isNaN(form.maxStudents) || +form.maxStudents < 1) e.maxStudents = 'Valid student count required';
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

        {/* Modal Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-gray-900">{editData ? 'Edit Class' : 'Create New Class'}</h2>
              <p className="text-xs text-gray-500">Fill in all required fields to {editData ? 'update' : 'create'} a class</p>
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
                <Input
                  label="Class Name"
                  name="className"
                  value={form.className}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Data Structures - Section A"
                  icon={Hash}
                />
                {errors.className && <p className="text-red-500 text-xs mt-1 text-left">{errors.className}</p>}
              </div>
              <div>
                <Select label="Program" name="program" value={form.program} onChange={handleChange} options={PROGRAMS} required />
                {errors.program && <p className="text-red-500 text-xs mt-1 text-left">{errors.program}</p>}
              </div>
              <div>
                <Select label="Department" name="department" value={form.department} onChange={handleChange} options={DEPARTMENTS} required />
                {errors.department && <p className="text-red-500 text-xs mt-1 text-left">{errors.department}</p>}
              </div>
              <div>
                <Select label="Subject" name="subject" value={form.subject} onChange={handleChange} options={SUBJECTS} required />
                {errors.subject && <p className="text-red-500 text-xs mt-1 text-left">{errors.subject}</p>}
              </div>
              <div>
                <Select label="Faculty Assigned" name="facultyAssigned" value={form.facultyAssigned} onChange={handleChange} options={FACULTY_LIST} required />
                {errors.facultyAssigned && <p className="text-red-500 text-xs mt-1 text-left">{errors.facultyAssigned}</p>}
              </div>
            </div>
          </div>

          {/* ── Academic Details ── */}
          <div>
            <SectionHeader icon={GraduationCap} title="Academic Details" color="purple" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Select label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} options={ACADEMIC_YEARS} required />
                {errors.academicYear && <p className="text-red-500 text-xs mt-1 text-left">{errors.academicYear}</p>}
              </div>
              <div>
                <Select label="Semester" name="semester" value={form.semester} onChange={handleChange} options={SEMESTERS} required />
                {errors.semester && <p className="text-red-500 text-xs mt-1 text-left">{errors.semester}</p>}
              </div>
              <div>
                <Select label="Section" name="section" value={form.section} onChange={handleChange} options={SECTIONS} required />
                {errors.section && <p className="text-red-500 text-xs mt-1 text-left">{errors.section}</p>}
              </div>
              <div>
                <Input
                  label="Max Students"
                  name="maxStudents"
                  value={form.maxStudents}
                  onChange={handleChange}
                  type="number"
                  required
                  placeholder="e.g. 60"
                  icon={Users}
                />
                {errors.maxStudents && <p className="text-red-500 text-xs mt-1 text-left">{errors.maxStudents}</p>}
              </div>
            </div>
          </div>

          {/* ── Schedule ── */}
          <div>
            <SectionHeader icon={Clock} title="Class Schedule" color="green" />
            <div className="space-y-3">
              {form.schedule.map((slot, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-gray-50 rounded-xl p-3">
                  <div className="col-span-3 text-left">
                    <Select
                      label="Day"
                      name="day"
                      value={slot.day}
                      onChange={e => handleScheduleChange(idx, 'day', e.target.value)}
                      options={DAYS}
                      placeholder="Day"
                    />
                  </div>
                  <div className="col-span-3 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">Start Time</label>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={e => handleScheduleChange(idx, 'startTime', e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 text-left">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-semibold text-gray-700">End Time</label>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={e => handleScheduleChange(idx, 'endTime', e.target.value)}
                        className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-left">
                    <Select
                      label="Room"
                      name="room"
                      value={slot.room}
                      onChange={e => handleScheduleChange(idx, 'room', e.target.value)}
                      options={ROOMS}
                      placeholder="Room"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end pb-1">
                    {form.schedule.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeScheduleRow(idx)}
                        className="w-9 h-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addScheduleRow}
                className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-800 transition px-1"
              >
                <Plus size={15} />
                Add Another Slot
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
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-200"
            >
              <BookOpen size={15} />
              {editData ? 'Update Class' : 'Create Class'}
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
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition">
          Delete
        </button>
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

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 🚀 Fetch Classes from Database
  const fetchClasses = async () => {
    try {
      setLoading(true);
      // Change '/admin/classes' to '/faculty/classes' if accessing from faculty portal
      const response = await axios.get(`${apiBaseUrl}/admin/classes`, { withCredentials: true });
      if (response.data.success) {
        setClasses(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      showToast('Failed to load classes from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const filtered = classes.filter(c =>
    c.className?.toLowerCase().includes(search.toLowerCase()) ||
    c.subject?.toLowerCase().includes(search.toLowerCase()) ||
    c.facultyAssigned?.toLowerCase().includes(search.toLowerCase())
  );

  // 🚀 Save or Update Class to Database
  const handleSave = async (data) => {
    try {
      if (editData) {
        const response = await axios.put(`${apiBaseUrl}/admin/classes/${data.id}`, data, { withCredentials: true });
        if (response.data.success) {
          showToast('Class updated successfully!');
          fetchClasses(); // Reload data
        }
      } else {
        const response = await axios.post(`${apiBaseUrl}/admin/classes`, data, { withCredentials: true });
        if (response.data.success) {
          showToast('Class created successfully!');
          fetchClasses(); // Reload data
        }
      }
      setShowModal(false);
      setEditData(null);
    } catch (error) {
      console.error("Save error:", error);
      showToast(error.response?.data?.message || 'Failed to save class.', 'error');
    }
  };

  // 🚀 Delete Class from Database
  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${apiBaseUrl}/admin/classes/${deleteTarget.id}`, { withCredentials: true });
      if (response.data.success) {
        showToast('Class deleted successfully.', 'success');
        fetchClasses(); // Reload data
      }
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete error:", error);
      showToast('Failed to delete class.', 'error');
    }
  };

  const openEdit = (cls) => {
    setEditData(cls);
    setShowModal(true);
  };

  const getScheduleSummary = (schedule) => {
    if (!schedule?.length || !schedule[0].day) return '—';
    return schedule
      .filter(s => s.day)
      .map(s => `${s.day.slice(0, 3)} ${s.startTime || ''}${s.startTime && s.endTime ? '–' + s.endTime : ''}`)
      .join(', ') || '—';
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 text-left">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Classes</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and assign all institute classes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Classes', value: classes.length, icon: BookOpen, color: 'bg-blue-600' },
          { label: 'Total Students', value: classes.reduce((a, c) => a + (+c.students || 0), 0), icon: Users, color: 'bg-purple-800' },
          { label: 'Subjects', value: [...new Set(classes.map(c => c.subject).filter(Boolean))].length, icon: Layers, color: 'bg-green-800' },
          { label: 'Faculty', value: [...new Set(classes.map(c => c.facultyAssigned).filter(Boolean))].length, icon: GraduationCap, color: 'bg-orange-800' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Table Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-white" />
            <span className="text-white font-bold text-sm">All Classes</span>
            <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-0.5 rounded-full ml-1">
              {filtered.length} Total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="text"
                placeholder="Search classes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:bg-white/20 w-52 text-left"
              />
            </div>
            <button
              onClick={() => { setEditData(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-white text-blue-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition shadow"
            >
              <Plus size={15} />
              Create Class
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Course Name', 'Class / Section', 'Subject', 'Academic Year', 'Schedule', 'Students', 'Faculty', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <p className="font-bold text-gray-500">Loading classes...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <BookOpen size={48} strokeWidth={1} />
                      <p className="font-bold text-gray-500">No Classes Found</p>
                      <p className="text-sm">
                        {search ? 'No results for your search.' : 'Click "Create Class" to get started.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((cls, idx) => (
                  <tr key={cls.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 text-sm">{cls.className}</p>
                      <p className="text-xs text-gray-400">{cls.program} · {cls.department}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                        <Layers size={11} />
                        {cls.semester} · Sec {cls.section}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 font-medium">{cls.subject}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                        <Calendar size={11} />
                        {cls.academicYear}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 max-w-[160px]">
                      <div className="flex items-start gap-1.5">
                        <Clock size={12} className="text-gray-400 mt-0.5 shrink-0" />
                        <span>{getScheduleSummary(cls.schedule)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                        <Users size={11} />
                        {cls.students || 0} / {cls.maxStudents}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{cls.facultyAssigned}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(cls)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cls)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <CreateClassModal
          onClose={() => { setShowModal(false); setEditData(null); }}
          onSave={handleSave}
          editData={editData}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          cls={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ClassList;