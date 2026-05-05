import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BookOpen, Plus, X, ChevronDown, Users,
  Calendar, Clock, Layers, GraduationCap,
  Edit2, Trash2, AlertCircle, CheckCircle, Hash, MapPin
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

const EMPTY_FORM = {
  className: '',
  course: '',
  specialization: [],
  department: '',
  subject: '',
  facultyAssigned: '',
  academicYear: '',
  batchId: '',
  section: '',
  semester: '',
  maxStudents: '',
  schedule: [{
    day: '', startTime: '', endTime: '',
    campus: '', building: '', block: '', floor: '', roomDepartment: '', room: ''
  }],
  description: '',
};

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all ${type === 'success' ? 'bg-blue-600' : 'bg-red-500'}`}>
    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={15} /></button>
  </div>
);

const Select = ({ label, name, value, onChange, options = [], required, placeholder, valueKey = 'name', labelKey = 'name', customDisplay, disabled = false }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((o, idx) => {
          const val = typeof o === 'string' ? o : o[valueKey];
          const display = typeof o === 'string' ? o : (customDisplay ? customDisplay(o) : o[labelKey]);
          return <option key={idx} value={val}>{display}</option>;
        })}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

const Input = ({ label, name, value, onChange, type = 'text', required, placeholder, icon: Icon, min }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        className={`w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${Icon ? 'pl-9' : ''}`}
      />
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = 'blue' }) => {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    green:  'bg-green-50 text-green-700 border-green-200',
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm mb-4 ${colors[color]}`}>
      <Icon size={16} /> {title}
    </div>
  );
};

const CreateClassModal = ({ onClose, onSave, editData, dropdownData }) => {
  const [form, setForm] = useState(editData || EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);

  const {
    courses, specializations, departments, subjects,
    faculty, academicYears, batches, sections, semesters, days,
    infrastructure, rooms
  } = dropdownData;

  useEffect(() => {
    setAvailableSpecializations(form.course ? specializations : []);
  }, [form.course, specializations]);

  useEffect(() => {
    if (form.course) {
      setAvailableDepartments(departments);
      setAvailableSubjects(subjects);
    } else {
      setAvailableDepartments([]);
      setAvailableSubjects([]);
    }
  }, [form.course, departments, subjects]);

  useEffect(() => {
    setAvailableFaculty(form.subject ? faculty : []);
  }, [form.subject, faculty]);

  useEffect(() => {
    setAvailableSemesters(form.batchId ? semesters : []);
  }, [form.batchId, semesters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    if (name === 'course') updates = { ...updates, specialization: [], department: '', subject: '', facultyAssigned: '' };
    if (name === 'subject') updates = { ...updates, facultyAssigned: '' };
    if (name === 'batchId') updates = { ...updates, semester: '' };
    setForm(f => ({ ...f, ...updates }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleScheduleChange = (idx, field, value) => {
    setForm(f => {
      const newSchedule = [...f.schedule];
      let slotUpdates = { [field]: value };

      // Clear downstream fields when a higher level is changed
      if (field === 'campus') slotUpdates = { ...slotUpdates, building: '', block: '', floor: '', room: '' };
      else if (field === 'building') slotUpdates = { ...slotUpdates, block: '', floor: '', room: '' };
      else if (field === 'block') slotUpdates = { ...slotUpdates, floor: '', room: '' };
      else if (field === 'floor') slotUpdates = { ...slotUpdates, room: '' };

      newSchedule[idx] = { ...newSchedule[idx], ...slotUpdates };
      return { ...f, schedule: newSchedule };
    });
  };

  const addScheduleRow = () => setForm(f => ({
    ...f,
    schedule: [...f.schedule, { day: '', startTime: '', endTime: '', campus: '', building: '', block: '', floor: '', roomDepartment: '', room: '' }],
  }));

  const removeScheduleRow = (idx) => setForm(f => ({
    ...f, schedule: f.schedule.filter((_, i) => i !== idx),
  }));

  const validate = () => {
    const e = {};
    if (!form.className.trim()) e.className = 'Class name is required';
    if (!form.course) e.course = 'Course is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(form);
  };

  const batchLabel = (b) => b.name || `${b.start_year || ''}–${b.end_year || ''}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{editData ? 'Edit Class' : 'Create New Class'}</h2>
              <p className="text-xs text-gray-500">Fill in details to establish the class</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-7 flex-1">
          <form id="classForm" onSubmit={handleSubmit} className="space-y-8">
            <div>
              <SectionHeader icon={BookOpen} title="Basic Information" color="blue" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input label="Class Name" name="className" value={form.className} onChange={handleChange} required placeholder="e.g. Data Structures - Section A" icon={Hash} />
                  {errors.className && <p className="text-red-500 text-xs mt-1">{errors.className}</p>}
                </div>
                <div>
                  <Select label="Course" name="course" value={form.course} onChange={handleChange} options={courses} required placeholder="Select Course" />
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Specialization <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                  <div className="flex flex-wrap gap-2 min-h-[24px]">
                    {(Array.isArray(form.specialization) ? form.specialization : []).map(s => (
                      <span key={s} className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5">
                        {s}
                        <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => {
                          const next = form.specialization.filter(x => x !== s);
                          setForm(f => ({ ...f, specialization: next }));
                        }} />
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <select
                      disabled={!form.course}
                      value=""
                      onChange={(e) => {
                        if (e.target.value && !form.specialization.includes(e.target.value)) {
                          setForm(f => ({ ...f, specialization: [...f.specialization, e.target.value] }));
                        }
                      }}
                      className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!form.course ? 'Select Course First' : availableSpecializations.length === 0 ? 'No specializations available' : '— Add Specialization —'}
                      </option>
                      {availableSpecializations.filter(s => !form.specialization.includes(s.name)).map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div><Select label="Department" name="department" value={form.department} onChange={handleChange} options={availableDepartments} placeholder="Select Department" /></div>
                <div><Select label="Subject" name="subject" value={form.subject} onChange={handleChange} options={availableSubjects} placeholder="Select Subject" /></div>
                <div className="md:col-span-2"><Select label="Faculty Assigned" name="facultyAssigned" value={form.facultyAssigned} onChange={handleChange} options={availableFaculty} placeholder="Select Faculty" /></div>
              </div>
            </div>

            <div>
              <SectionHeader icon={GraduationCap} title="Academic Details" color="purple" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select label="Academic Year" name="academicYear" value={form.academicYear} onChange={handleChange} options={academicYears} placeholder="Select Year" />
                <Select label="Batch" name="batchId" value={form.batchId} onChange={handleChange} options={batches} valueKey="id" customDisplay={batchLabel} placeholder="Select Batch" />
                <Select label="Section" name="section" value={form.section} onChange={handleChange} options={sections} placeholder="Select Section" />
                <Select label="Semester" name="semester" value={form.semester} onChange={handleChange} options={availableSemesters} placeholder="Select Semester" />
                <Input label="Max Students (Optional)" name="maxStudents" value={form.maxStudents} onChange={handleChange} type="number" min="1" placeholder="e.g. 60" icon={Users} />
              </div>
            </div>

            <div>
              <SectionHeader icon={Clock} title="Class Schedule & Room Allocation" color="green" />
              <div className="space-y-4">
                {form.schedule.map((slot, idx) => {
                  
                  // 🚀 ULTRA-RESILIENT HIERARCHY LOGIC
                  const infra = infrastructure || [];

                  // Pull every piece of data globally as a fallback
                  const allBuildings = infra.flatMap(c => c.buildings || []);
                  const allBlocks = allBuildings.flatMap(b => b.blocks || []);
                  const allFloors = allBlocks.flatMap(b => b.floors || []);

                  // 1. Campus
                  const campusOpts = [...new Set(infra.map(c => c.name).filter(Boolean))];
                  const selectedCampusObj = infra.find(c => c.name === slot.campus);

                  // 2. Building
                  const availableBuildings = selectedCampusObj ? (selectedCampusObj.buildings || []) : allBuildings;
                  const buildingOpts = [...new Set(availableBuildings.map(b => b.name).filter(Boolean))];
                  const selectedBuildingObj = availableBuildings.find(b => b.name === slot.building);

                  // 3. Block
                  const availableBlocks = selectedBuildingObj ? (selectedBuildingObj.blocks || []) : allBlocks;
                  const blockOpts = [...new Set(availableBlocks.map(b => b.name).filter(Boolean))];
                  const selectedBlockObj = availableBlocks.find(b => b.name === slot.block);

                  // 4. Floor
                  const availableFloors = selectedBlockObj ? (selectedBlockObj.floors || []) : allFloors;
                  const floorOpts = [...new Set(availableFloors.map(f => f.name).filter(Boolean))];
                  const selectedFloorObj = availableFloors.find(f => f.name === slot.floor);

                  // 5. Room (always accessible)
                  const roomOpts = selectedFloorObj?.rooms?.length ? selectedFloorObj.rooms : (rooms || []);

                  return (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 relative">
                      {form.schedule.length > 1 && (
                        <button type="button" onClick={() => removeScheduleRow(idx)} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center">
                          <X size={14} />
                        </button>
                      )}
                      <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Clock size={14} className="text-gray-400" /> Slot {idx + 1} Timing</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Select label="Day" value={slot.day} onChange={e => handleScheduleChange(idx, 'day', e.target.value)} options={days} placeholder="Select Day" />
                        <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-gray-700">Start Time</label><input type="time" value={slot.startTime || ''} onChange={e => handleScheduleChange(idx, 'startTime', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                        <div className="flex flex-col gap-1.5"><label className="text-sm font-semibold text-gray-700">End Time</label><input type="time" value={slot.endTime || ''} onChange={e => handleScheduleChange(idx, 'endTime', e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> Room Selection</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          
                          <Select 
                            label="Campus" 
                            value={slot.campus} 
                            onChange={e => handleScheduleChange(idx, 'campus', e.target.value)} 
                            options={campusOpts} 
                            placeholder="Select Campus" 
                          />
                          
                          <Select 
                            label="Building" 
                            value={slot.building} 
                            onChange={e => handleScheduleChange(idx, 'building', e.target.value)} 
                            options={buildingOpts} 
                            disabled={!slot.campus || buildingOpts.length === 0} 
                            placeholder={!slot.campus ? "Select Campus First" : buildingOpts.length === 0 ? "No Buildings Available" : "Select Building"} 
                          />
                          
                          <Select 
                            label="Block" 
                            value={slot.block} 
                            onChange={e => handleScheduleChange(idx, 'block', e.target.value)} 
                            options={blockOpts} 
                            disabled={!slot.building || blockOpts.length === 0} 
                            placeholder={!slot.building ? "Select Building First" : blockOpts.length === 0 ? "No Blocks Available" : "Select Block"} 
                          />
                          
                          <Select 
                            label="Floor" 
                            value={slot.floor} 
                            onChange={e => handleScheduleChange(idx, 'floor', e.target.value)} 
                            options={floorOpts} 
                            disabled={!slot.block || floorOpts.length === 0} 
                            placeholder={!slot.block ? "Select Block First" : floorOpts.length === 0 ? "No Floors Available" : "Select Floor"} 
                          />
                          
                          <Select 
                            label="Room Department" 
                            value={slot.roomDepartment} 
                            onChange={e => handleScheduleChange(idx, 'roomDepartment', e.target.value)} 
                            options={departments} 
                            placeholder="Select Dept Zone" 
                          />
                          
                          <Select 
                            label="Room Number" 
                            value={slot.room} 
                            onChange={e => handleScheduleChange(idx, 'room', e.target.value)} 
                            options={roomOpts} 
                            placeholder="Select Final Room" 
                          />
                          
                        </div>
                      </div>
                    </div>
                  );
                })}
                <button type="button" onClick={addScheduleRow} className="flex items-center gap-2 text-blue-600 text-sm font-bold px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition">
                  <Plus size={15} /> Add Another Schedule Slot
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100 bg-gray-50 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-white transition">Cancel</button>
          <button type="submit" form="classForm" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md shadow-blue-200">
            <BookOpen size={15} /> {editData ? 'Update Class' : 'Create Class'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ cls, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-500" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Class?</h3>
      <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-700">"{cls.className}"</span>? This cannot be undone.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
      </div>
    </div>
  </div>
);

export const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const [dropdownData, setDropdownData] = useState({
    courses: [], specializations: [], departments: [], subjects: [],
    faculty: [], academicYears: [], batches: [], sections: [],
    semesters: [], days: [], rooms: [], infrastructure: []
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBaseUrl}/admin/classes`, { withCredentials: true });
      if (res.data.success) setClasses(res.data.data || []);
    } catch (error) {
      showToast('Failed to load classes.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 🚀 THIS IS THE FIX: ONLY fetch from form-data to prevent data overwrite
  const fetchDropdownData = async () => {
    try {
      const formRes = await axios.get(`${apiBaseUrl}/admin/classes/form-data`, { withCredentials: true });

      if (formRes.data && formRes.data.success) {
        setDropdownData(prev => ({
          ...prev,
          ...formRes.data.data
        }));
      }
    } catch (err) {
      console.error('Dropdown fetch error:', err);
      showToast('Failed to load dropdown data.', 'error');
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
      const selectedFaculty = dropdownData.faculty.find(f => f.name === data.facultyAssigned);
      const payload = {
        ...data,
        specialization: Array.isArray(data.specialization) ? data.specialization.join(', ') : data.specialization,
        program: data.course,
        departmentId: data.department,
        facultyId: selectedFaculty?.id || null,
      };

      if (editData) {
        const res = await axios.put(`${apiBaseUrl}/admin/classes/${data.id}`, payload, { withCredentials: true });
        if (res.data.success) { showToast('Class updated!'); fetchClasses(); }
      } else {
        const res = await axios.post(`${apiBaseUrl}/admin/classes`, payload, { withCredentials: true });
        if (res.data.success) { showToast('Class created!'); fetchClasses(); }
      }
      setShowModal(false);
      setEditData(null);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to save class.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`${apiBaseUrl}/admin/classes/${deleteTarget.id}`, { withCredentials: true });
      if (res.data.success) { showToast('Class deleted.'); fetchClasses(); }
      setDeleteTarget(null);
    } catch (error) {
      showToast('Failed to delete class.', 'error');
    }
  };

  const openEdit = (cls) => {
    setEditData({
      ...cls,
      schedule: cls.schedule?.length > 0 ? cls.schedule : [{ day: '', startTime: '', endTime: '', campus: '', building: '', block: '', floor: '', roomDepartment: '', room: '' }],
      specialization: Array.isArray(cls.specialization) ? cls.specialization : (cls.specialization ? cls.specialization.split(', ') : []),
    });
    setShowModal(true);
  };

  const getScheduleSummary = (schedule) => {
    if (!schedule?.length || !schedule[0].day) return '—';
    return schedule.filter(s => s.day).map(s =>
      `${s.day.slice(0, 3)}${s.startTime ? ' ' + s.startTime : ''}${s.endTime ? '–' + s.endTime : ''}`
    ).join(', ') || '—';
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
          <button onClick={() => { setEditData(null); setShowModal(true); }} className="flex items-center gap-2 bg-white text-blue-600 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition shadow">
            <Plus size={15} /> Create Class
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                {['Course & Name', 'Class / Section', 'Subject', 'Academic Year', 'Schedule', 'Students', 'Faculty', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-xs font-bold text-blue-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-500 font-bold">Loading classes...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center text-gray-400">No classes found. Create one to get started.</td></tr>
              ) : filtered.map((cls, idx) => {
                const specDisplay = Array.isArray(cls.specialization) ? cls.specialization.join(', ') : (cls.specialization || cls.department || '—');
                
                return (
                  <tr key={cls.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 text-sm">{cls.className}</p>
                      <p className="text-xs text-gray-400">{cls.course} {specDisplay ? `· ${specDisplay}` : ''}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full"><Layers size={11} />{cls.semester || '—'} · Sec {cls.section || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700 font-medium">{cls.subject || '—'}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full"><Calendar size={11} />{cls.academicYear || '—'}</span>
                    </td>
                    
                    {/* 🚀 Beautifully Stacked Venue Details */}
                    <td className="px-5 py-4 text-xs text-gray-600">
                      <div className="flex flex-col gap-1.5 min-w-[160px]">
                        {cls.schedule && cls.schedule[0]?.day ? (
                          cls.schedule.map((s, i) => {
                            const time = `${s.day.slice(0, 3)} ${s.startTime || ''}${s.endTime ? '–' + s.endTime : ''}`;
                            const venue = [s.building, s.block, s.floor, s.room].filter(Boolean).join(', ');
                            return (
                              <div key={i} className="flex flex-col bg-gray-50 p-2 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                                  <Clock size={12} className="text-blue-500" /> {time}
                                </div>
                                {venue && (
                                  <div className="flex items-start gap-1.5 text-[11px] text-gray-500 mt-1">
                                    <MapPin size={11} className="text-gray-400 shrink-0 mt-[2px]" />
                                    <span className="leading-tight">{venue}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-gray-400 font-medium">—</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full"><Users size={11} />{cls.students || 0} / {cls.maxStudents || '—'}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">{cls.facultyAssigned || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(cls)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(cls)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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