import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit2, Trash2, ChevronDown, ChevronRight, 
  Copy, X, Check, Calendar
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

// ─── 🚀 AXIOS CONFIGURATION ──────────────────────────────────────────────
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
// ─────────────────────────────────────────────────────────────────────────

// 🚀 SMART NUMERIC CODE GENERATOR
const generateCode = (name) => {
  if (!name || !name.trim()) return '';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  let numericCode = Math.abs(hash).toString();
  while (numericCode.length < 5) numericCode += '0';
  return numericCode.substring(0, 5);
};

// --- MOCK DATA FALLBACK ---
const INITIAL_COURSES = [
  {
    id: 1,
    name: 'B.Tech',
    code: '82410',
    level: 'UG',
    duration: '4 Years',
    semSystem: 'Semester',
    semesters: 8,
    building: 'Main Block',
    evaluation: 'CGPA',
    totalIntake: 300,
    currentIntake: 210,
    specializations: [
      { id: 101, name: 'Computer Science Engg', code: '45912', total: 100, intake: 56, active: true },
      { id: 102, name: 'Mechanical Engg', code: '12389', total: 100, intake: 74, active: true },
      { id: 103, name: 'Electrical Engg', code: '99214', total: 100, intake: 80, active: true },
    ],
    batches: [
      { id: 201, name: '2026-2030', startMonth: 'Jul', startYear: '2026', endMonth: 'Jun', endYear: '2030', sections: ['A', 'B'], specs: ['Computer Science Engg', 'Mechanical Engg', 'Electrical Engg'] },
      { id: 202, name: '2025-2029', startMonth: 'Jul', startYear: '2025', endMonth: 'Jun', endYear: '2029', sections: ['A'], specs: ['Computer Science Engg', 'Mechanical Engg', 'Electrical Engg'] },
    ]
  }
];

export default function AcademicProgram() { 
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  const defaultCourseState = {
    name: '', code: '', level: 'UG', duration: '4 Years', semSystem: 'Semester', semesters: '8', building: 'Main Block', evaluation: 'CGPA'
  };
  const [courseFormData, setCourseFormData] = useState(defaultCourseState);

  // ─── 🚀 1. FETCH DATA FROM BACKEND ───────────────────────────────────────
  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/programs');
      if (res.data && res.data.success) {
        setCourses(res.data.data);
      } else {
        setCourses(INITIAL_COURSES); 
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setCourses(INITIAL_COURSES); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, []);

  // ─── 🚀 2. COURSE HANDLERS ────────────────────────────────────────────────
  const handleOpenCourseForm = (course = null) => {
    if (course) {
      setEditingCourse(course.id);
      setCourseFormData(course);
    } else {
      setEditingCourse(null);
      setCourseFormData(defaultCourseState);
    }
    setShowCourseForm(true);
  };

  const handleSaveCourse = async () => {
    try {
      if (!courseFormData.name || !courseFormData.code) return alert("Name and Code are required");
      if (editingCourse) {
        await api.put(`/admin/programs/courses/${editingCourse}`, courseFormData);
      } else {
        await api.post('/admin/programs/courses', courseFormData);
      }
      setShowCourseForm(false);
      fetchPrograms(); 
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course.");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this entire course? This cannot be undone.")) {
      try {
        await api.delete(`/admin/programs/courses/${id}`);
        fetchPrograms();
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course.");
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedCourseId(expandedCourseId === id ? null : id);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Academic Programs...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <div className="max-w-8xl mx-auto space-y-4">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800">Courses</h1>
          {!showCourseForm && (
            <button 
              onClick={() => handleOpenCourseForm()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
            >
              <Plus size={16}/> Add Course
            </button>
          )}
        </div>

        {/* ADD / EDIT COURSE FORM */}
        {showCourseForm && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <InputField 
                label="Course Name" required 
                value={courseFormData.name} 
                onChange={e => {
                  const newName = e.target.value;
                  setCourseFormData({ ...courseFormData, name: newName, code: generateCode(newName) });
                }} 
                placeholder="e.g. B.Tech" 
              />
              <InputField 
                label="Code (Auto Numeric)" required 
                value={courseFormData.code} 
                disabled={true} 
                placeholder="Auto-generated" 
              />
              <SelectField label="Level" value={courseFormData.level} onChange={e => setCourseFormData({...courseFormData, level: e.target.value})} options={['UG', 'PG', 'Diploma']} />
              <SelectField label="Duration" value={courseFormData.duration} onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})} options={['1 Year', '2 Years', '3 Years', '4 Years', '5 Years']} />
              <SelectField label="Sem System" value={courseFormData.semSystem} onChange={e => setCourseFormData({...courseFormData, semSystem: e.target.value})} options={['Semester', 'Yearly']} />
              <InputField label="Semesters" value={courseFormData.semesters} onChange={e => setCourseFormData({...courseFormData, semesters: e.target.value})} type="number" />
              <SelectField label="Building" value={courseFormData.building} onChange={e => setCourseFormData({...courseFormData, building: e.target.value})} options={['Main Block', 'Science Block', 'Arts Block']} />
              <SelectField label="Evaluation" value={courseFormData.evaluation} onChange={e => setCourseFormData({...courseFormData, evaluation: e.target.value})} options={['CGPA', 'Percentage', 'Marks']} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-blue-100/50">
              <button onClick={() => setShowCourseForm(false)} className="px-5 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSaveCourse} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 flex items-center gap-2">
                <Check size={16} /> {editingCourse ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {/* COURSE CARDS LIST */}
        <div className="space-y-4">
          {courses.map(course => {
            // 🚀 DYNAMIC INTAKE CALCULATION
            // Checks if specializations exist, then sums them up. Otherwise falls back to default.
            const hasSpecs = course.specializations && course.specializations.length > 0;
            const dynamicTotal = hasSpecs 
              ? course.specializations.reduce((sum, spec) => sum + (Number(spec.total) || 0), 0) 
              : (course.totalIntake || 0);
            const dynamicIntake = hasSpecs 
              ? course.specializations.reduce((sum, spec) => sum + (Number(spec.intake) || 0), 0) 
              : (course.currentIntake || 0);

            const progressPercent = dynamicTotal > 0 ? `${(dynamicIntake / dynamicTotal) * 100}%` : '0%';

            return (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                
                {/* CARD HEADER */}
                <div className="p-5 flex items-start justify-between bg-white hover:bg-gray-50 cursor-pointer transition" onClick={() => toggleExpand(course.id)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-bold text-gray-900">{course.name}</h2>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-black rounded uppercase tracking-wider">{course.code}</span>
                      
                      {/* 🚀 DYNAMIC VALUES RENDERED HERE */}
                      <span className="text-sm font-semibold text-blue-600">{dynamicIntake}/{dynamicTotal}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {course.duration} · {course.building} · {course.evaluation} · {course.specializations?.length || 0} specs · {course.batches?.length || 0} batches
                    </p>
                    
                    {/* 🚀 DYNAMIC PROGRESS BAR */}
                    <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: progressPercent }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-400">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenCourseForm(course); }} className="hover:text-blue-600"><Edit2 size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="hover:text-red-500"><Trash2 size={16} /></button>
                    {expandedCourseId === course.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                </div>

                {/* EXPANDED CONTENT */}
                {expandedCourseId === course.id && (
                  <div className="border-t border-gray-100 bg-white">
                    <SpecializationsSection course={course} fetchPrograms={fetchPrograms} api={api} />
                    <div className="h-px bg-gray-100 w-full" />
                    <BatchesSection 
                      course={course} 
                      fetchPrograms={fetchPrograms} 
                      api={api}
                      courseSpecializations={course.specializations || []}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {courses.length === 0 && !showCourseForm && (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 font-bold">
              No academic programs found. Click "Add Course" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SPECIALIZATIONS SECTION
// ══════════════════════════════════════════════════════════════════════════════
const SpecializationsSection = ({ course, fetchPrograms, api }) => {
  const [newSpec, setNewSpec] = useState({ name: '', code: '', total: '', intake: '' });
  const [editingSpecId, setEditingSpecId] = useState(null);

  const handleSaveSpec = async () => {
    if (!newSpec.name) return;
    try {
      if (editingSpecId) {
        await api.put(`/admin/programs/specializations/${editingSpecId}`, { ...newSpec, active: true });
      } else {
        await api.post(`/admin/programs/specializations`, { ...newSpec, courseId: course.id, active: true });
      }
      setNewSpec({ name: '', code: '', total: '', intake: '' });
      setEditingSpecId(null);
      fetchPrograms();
    } catch (error) {
      console.error(error);
      alert("Failed to save specialization");
    }
  };

  const handleEditSpec = (spec) => {
    setNewSpec({ name: spec.name, code: spec.code || '', total: spec.total, intake: spec.intake });
    setEditingSpecId(spec.id);
  };

  const handleDeleteSpec = async (specId) => {
    if (window.confirm("Delete this specialization?")) {
      try {
        await api.delete(`/admin/programs/specializations/${specId}`);
        fetchPrograms();
      } catch(e) { console.error(e); }
    }
  };

  const handleToggleSpecActive = async (spec) => {
    try {
      await api.put(`/admin/programs/specializations/${spec.id}`, { ...spec, active: !spec.active });
      fetchPrograms();
    } catch(e) { console.error(e); }
  };

  return (
    <div className="p-6">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Specializations</h3>
      
      <div className="w-full">
        {/* 🚀 PERFECTLY ALIGNED TABLE HEADERS */}
        <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-gray-200 text-[11px] font-black text-gray-500 uppercase tracking-wider items-center">
          <div className="col-span-4 text-left">Name</div>
          <div className="col-span-2 text-center">Code</div>
          <div className="col-span-2 text-center">Total</div>
          <div className="col-span-2 text-center">Intake</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {/* 🚀 PERFECTLY ALIGNED TABLE BODY */}
        <div className="space-y-0">
          {course.specializations?.map(spec => (
            <div key={spec.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-3 items-center text-sm font-semibold text-gray-800 border-b border-gray-50">
              <div className="md:col-span-4 text-left truncate pr-2">{spec.name}</div>
              <div className="md:col-span-2 text-center text-gray-600 font-bold">{spec.code || '—'}</div>
              <div className="md:col-span-2 text-center">{spec.total}</div>
              <div className="md:col-span-2 text-center text-blue-600">{spec.intake}</div>
              <div className="md:col-span-2 flex justify-end items-center gap-5">
                <div onClick={() => handleToggleSpecActive(spec)} className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer ${spec.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${spec.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                </div>
                <button onClick={() => handleEditSpec(spec)} className="text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                <button onClick={() => handleDeleteSpec(spec.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {(!course.specializations || course.specializations.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-4 border-b border-gray-50">No specializations added.</p>
          )}
        </div>

        {/* 🚀 PERFECTLY ALIGNED INPUT ROW */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 items-center">
          <div className="md:col-span-4">
            <input 
              type="text" placeholder="New Specialization Name" 
              value={newSpec.name} 
              onChange={e => {
                const newName = e.target.value;
                setNewSpec({ ...newSpec, name: newName, code: generateCode(newName) });
              }} 
              className="h-10 w-full px-3 border border-gray-200 rounded-lg text-sm font-semibold text-left outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all" 
            />
          </div>
          <div className="md:col-span-2">
            <input 
              type="text" placeholder="Auto Code" value={newSpec.code} disabled 
              className="h-10 w-full px-3 border border-gray-200 rounded-lg text-sm font-semibold text-center outline-none bg-gray-50 text-gray-500 cursor-not-allowed" 
            />
          </div>
          <div className="md:col-span-2">
            <input type="number" placeholder="Total" value={newSpec.total} onChange={e => setNewSpec({...newSpec, total: e.target.value})} className="h-10 w-full px-3 border border-gray-200 rounded-lg text-sm font-semibold text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all" />
          </div>
          <div className="md:col-span-2">
            <input type="number" placeholder="Intake" value={newSpec.intake} onChange={e => setNewSpec({...newSpec, intake: e.target.value})} className="h-10 w-full px-3 border border-gray-200 rounded-lg text-sm font-semibold text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white transition-all" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 h-10">
            {editingSpecId && (
              <button onClick={() => { setEditingSpecId(null); setNewSpec({ name: '', code: '', total: '', intake: '' }); }} className="h-10 w-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Cancel Edit">
                <X size={18} />
              </button>
            )}
            <button onClick={handleSaveSpec} className="h-10 w-full bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 transition-all shadow-sm">
              {editingSpecId ? <Check size={16} /> : <Plus size={16} />} {editingSpecId ? 'Save' : 'Add'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BATCHES SECTION
// ══════════════════════════════════════════════════════════════════════════════
const BatchesSection = ({ course, fetchPrograms, api, courseSpecializations }) => {
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editBatchData, setEditBatchData] = useState(null);
  const [newSectionText, setNewSectionText] = useState('');

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

  const availableSpecs = (courseSpecializations && courseSpecializations.length > 0)
    ? courseSpecializations
    : (course.specializations || []);

  const handleAddNewBatch = () => {
    setEditBatchData({ 
      id: 'NEW', name: '', startMonth: 'Jul', startYear: '2026', 
      endMonth: 'Jun', endYear: '2030', sections: ['A'], specs: [] 
    });
    setEditingBatchId('NEW');
  };

  const handleEditBatch = (batch) => {
    setEditBatchData({ ...batch });
    setEditingBatchId(batch.id);
  };

  const handleCopyBatch = async (batch) => {
    try {
      const newBatch = { ...batch, name: `${batch.name} (Copy)`, course_id: course.id };
      await api.post('/admin/programs/batches', newBatch); 
      fetchPrograms();
    } catch(e) { console.error(e); alert("Failed to duplicate batch"); }
  };

  const handleDeleteBatch = async (batchId) => {
    if (window.confirm("Are you sure you want to delete this batch?")) {
      try {
        await api.delete(`/admin/programs/batches/${batchId}`); 
        fetchPrograms();
      } catch(e) { console.error(e); }
    }
  };

  const handleSaveEdit = async () => {
    if (!editBatchData.name) return alert("Batch Name is required.");
    try {
      if (editingBatchId === 'NEW') {
        await api.post(`/admin/programs/batches`, { ...editBatchData, course_id: course.id }); 
      } else {
        await api.put(`/admin/programs/batches/${editingBatchId}`, editBatchData); 
      }
      setEditingBatchId(null);
      setEditBatchData(null);
      fetchPrograms();
    } catch (error) {
      console.error(error);
      alert("Failed to save batch");
    }
  };

  const handleCancelEdit = () => {
    setEditingBatchId(null);
    setEditBatchData(null);
    setNewSectionText('');
  };

  const addSection = () => {
    if (newSectionText.trim() && !editBatchData.sections.includes(newSectionText.toUpperCase())) {
      setEditBatchData({ ...editBatchData, sections: [...editBatchData.sections, newSectionText.toUpperCase()] });
      setNewSectionText('');
    }
  };

  const removeSection = (sec) => {
    setEditBatchData({ ...editBatchData, sections: editBatchData.sections.filter(s => s !== sec) });
  };

  const toggleSpec = (specName) => {
    if (!specName) return;
    const isActive = editBatchData.specs.includes(specName);
    const newSpecs = isActive 
      ? editBatchData.specs.filter(s => s !== specName) 
      : [...editBatchData.specs, specName];
    setEditBatchData({ ...editBatchData, specs: newSpecs });
  };

  return (
    <div className="p-6 bg-gray-50/30">
      {/* 🚀 SHARED GRID LAYOUT FOR BUTTON ALIGNMENT */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6">
        <div className="md:col-span-10">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Batches</h3>
        </div>
        <div className="md:col-span-2 flex justify-end">
          {editingBatchId !== 'NEW' && (
            <button onClick={handleAddNewBatch} className="h-10 w-full bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-700 shadow-sm transition-all">
              <Plus size={16} /> Add Batch
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {editingBatchId === 'NEW' && (
          <BatchEditForm 
            data={editBatchData} setData={setEditBatchData} 
            onSave={handleSaveEdit} onCancel={handleCancelEdit}
            newSectionText={newSectionText} setNewSectionText={setNewSectionText} 
            addSection={addSection} removeSection={removeSection}
            toggleSpec={toggleSpec} 
            courseSpecs={availableSpecs}
            MONTHS={MONTHS} YEARS={YEARS}
          />
        )}

        {(!course.batches || course.batches.length === 0) && editingBatchId !== 'NEW' && (
          <p className="text-sm text-gray-400">No batches added yet.</p>
        )}

        {course.batches?.map(batch => {
          if (editingBatchId === batch.id) {
            return (
              <BatchEditForm 
                key={batch.id} 
                data={editBatchData} setData={setEditBatchData} 
                onSave={handleSaveEdit} onCancel={handleCancelEdit}
                newSectionText={newSectionText} setNewSectionText={setNewSectionText} 
                addSection={addSection} removeSection={removeSection}
                toggleSpec={toggleSpec} 
                courseSpecs={availableSpecs}
                MONTHS={MONTHS} YEARS={YEARS}
              />
            );
          }

          return (
            <div key={batch.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">{batch.name}</span>
                  <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-gray-400"/>
                    {batch.startMonth} {batch.startYear} &nbsp;→&nbsp; {batch.endMonth} {batch.endYear}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditBatch(batch)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit2 size={16} /></button>
                  <button onClick={() => handleCopyBatch(batch)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Duplicate"><Copy size={16} /></button>
                  <button onClick={() => handleDeleteBatch(batch.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase mt-1 w-10">Sec:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {batch.sections?.map(sec => (
                      <span key={sec} className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">{sec}</span>
                    ))}
                    {(!batch.sections || batch.sections.length === 0) && <span className="text-xs font-semibold text-gray-400 italic mt-0.5">None</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase mt-1 w-10">Specs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {batch.specs?.map(spec => (
                      <span key={spec} className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">{spec}</span>
                    ))}
                    {(!batch.specs || batch.specs.length === 0) && <span className="text-xs font-semibold text-gray-400 italic mt-0.5">None</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// BATCH EDIT FORM
// ══════════════════════════════════════════════════════════════════════════════
const BatchEditForm = ({ data, setData, onSave, onCancel, newSectionText, setNewSectionText, addSection, removeSection, toggleSpec, courseSpecs, MONTHS, YEARS }) => {
  const [specToAdd, setSpecToAdd] = useState('');

  // Only show specs not already selected
  const unselectedSpecs = (courseSpecs || []).filter(
    spec => !data.specs.includes(spec.name)
  );

  return (
    <div className="bg-white border-2 border-blue-300 ring-4 ring-blue-50 rounded-xl p-5 shadow-md transition-all">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
        <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider">
          {data.id === 'NEW' ? 'Create New Batch' : 'Edit Batch'}
        </h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <InputField 
          label="Batch Name (e.g. 2026-2030)" 
          value={data.name} 
          onChange={(e) => setData({...data, name: e.target.value})} 
          required 
        />
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[12px] font-bold text-gray-600">Duration <span className="text-red-500">*</span></label>
          <div className="flex items-center gap-1.5">
            <select value={data.startMonth} onChange={(e) => setData({...data, startMonth: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={data.startYear} onChange={(e) => setData({...data, startYear: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <span className="text-gray-400 font-bold px-1">→</span>
            <select value={data.endMonth} onChange={(e) => setData({...data, endMonth: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
              {MONTHS.map(m => <option key={m}>{m}</option>)}
            </select>
            <select value={data.endYear} onChange={(e) => setData({...data, endYear: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* SECTIONS */}
        <div>
          <label className="text-[12px] font-bold text-gray-600 block mb-2">Sections</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {data.sections.map(sec => (
              <span key={sec} className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                {sec} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeSection(sec)}/>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" value={newSectionText} onChange={e => setNewSectionText(e.target.value)} 
              placeholder="New (e.g. C)" 
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-400" 
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
            />
            <button type="button" onClick={addSection} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition">Add</button>
          </div>
        </div>

        {/* SPECIALIZATIONS */}
        <div>
          <label className="text-[12px] font-bold text-gray-600 block mb-2">Included Specializations</label>
          
          {/* Selected chips */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
            {data.specs.length > 0 ? (
              data.specs.map(specName => (
                <span key={specName} className="bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                  {specName} 
                  <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => toggleSpec(specName)}/>
                </span>
              ))
            ) : (
              courseSpecs.length > 0 && (
                <span className="text-xs text-gray-400 italic mt-1">None selected — pick from dropdown below</span>
              )
            )}
          </div>

          {/* Dropdown logic with 3 clear states */}
          {courseSpecs.length === 0 ? (
            <div className="text-xs text-amber-600 font-semibold bg-amber-50 p-2.5 rounded border border-amber-200 text-center">
              ⚠️ No specializations found. Add specializations to this course first.
            </div>
          ) : unselectedSpecs.length === 0 ? (
            <div className="text-xs text-green-700 font-semibold bg-green-50 p-2.5 rounded border border-green-200 text-center">
              ✅ All specializations have been added to this batch.
            </div>
          ) : (
            <div className="flex gap-2">
              <select 
                value={specToAdd} 
                onChange={(e) => setSpecToAdd(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-400"
              >
                <option value="">— Select Specialization —</option>
                {unselectedSpecs.map(spec => (
                  <option key={spec.id} value={spec.name}>{spec.name}</option>
                ))}
              </select>
              <button 
                type="button" 
                onClick={() => {
                  if (specToAdd) {
                    toggleSpec(specToAdd);
                    setSpecToAdd('');
                  }
                }} 
                disabled={!specToAdd}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-bold transition"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
        <button onClick={onSave} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 flex items-center gap-2 transition">
          <Check size={16}/> Save Batch
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// REUSABLE INPUTS
// ══════════════════════════════════════════════════════════════════════════════
const InputField = ({ label, placeholder, required, type="text", value, onChange, disabled=false }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[12px] font-bold text-gray-600">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input 
      type={type} placeholder={placeholder} value={value} onChange={onChange} 
      required={required} disabled={disabled}
      className={`px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none transition-colors ${
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-800 focus:border-blue-500'
      }`} 
    />
  </div>
);

const SelectField = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[12px] font-bold text-gray-600">{label}</label>
    <select 
      value={value} onChange={onChange}
      className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:border-blue-500 outline-none"
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);







// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { 
//   Plus, Edit2, Trash2, ChevronDown, ChevronRight, 
//   Copy, X, Check, Calendar, Search
// } from 'lucide-react';

// // ─── 🚀 AXIOS CONFIGURATION ──────────────────────────────────────────────
// const api = axios.create({
//   baseURL: 'http://localhost:5000/api', // Ensure this matches your backend port
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Automatically attach the auth token if you are using JWT
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token'); 
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
// // ─────────────────────────────────────────────────────────────────────────

// // 🚀 SMART NUMERIC CODE GENERATOR
// const generateCode = (name) => {
//   if (!name || !name.trim()) return '';

//   // Convert the text into a stable numeric value (Hash)
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) {
//     const char = name.charCodeAt(i);
//     hash = ((hash << 5) - hash) + char;
//     hash = hash & hash; // Convert to 32-bit integer
//   }

//   // Make it a positive number string
//   let numericCode = Math.abs(hash).toString();

//   // If the word is super short, pad it with some zeros so it looks like a real code
//   while (numericCode.length < 5) {
//     numericCode += '0';
//   }

//   // Return a clean 5-digit numeric code
//   return numericCode.substring(0, 5);
// };

// // --- MOCK DATA FALLBACK ---
// const INITIAL_COURSES = [
//   {
//     id: 1,
//     name: 'B.Tech',
//     code: '82410',
//     level: 'UG',
//     duration: '4 Years',
//     semSystem: 'Semester',
//     semesters: 8,
//     building: 'Main Block',
//     evaluation: 'CGPA',
//     totalIntake: 300,
//     currentIntake: 210,
//     specializations: [
//       { id: 101, name: 'Computer Science Engg', code: '45912', total: 100, intake: 56, active: true },
//       { id: 102, name: 'Mechanical Engg', code: '12389', total: 100, intake: 74, active: true },
//       { id: 103, name: 'Electrical Engg', code: '99214', total: 100, intake: 80, active: true },
//     ],
//     batches: [
//       { id: 201, name: '2026-2030', startMonth: 'Jul', startYear: '2026', endMonth: 'Jun', endYear: '2030', sections: ['A', 'B'], specs: ['Computer Science Engg', 'Mechanical Engg', 'Electrical Engg'] },
//       { id: 202, name: '2025-2029', startMonth: 'Jul', startYear: '2025', endMonth: 'Jun', endYear: '2029', sections: ['A'], specs: ['Computer Science Engg', 'Mechanical Engg', 'Electrical Engg'] },
//     ]
//   }
// ];

// export default function AcademicProgram() {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
  
//   const [showCourseForm, setShowCourseForm] = useState(false);
//   const [editingCourse, setEditingCourse] = useState(null);
//   const [expandedCourseId, setExpandedCourseId] = useState(null);

//   const defaultCourseState = {
//     name: '', code: '', level: 'UG', duration: '4 Years', semSystem: 'Semester', semesters: '8', building: 'Main Block', evaluation: 'CGPA'
//   };
//   const [courseFormData, setCourseFormData] = useState(defaultCourseState);

//   // ─── 🚀 1. FETCH DATA FROM BACKEND ───────────────────────────────────────
//   const fetchPrograms = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/admin/programs');
//       if (res.data && res.data.success) {
//         setCourses(res.data.data);
//       } else {
//          setCourses(INITIAL_COURSES); 
//       }
//     } catch (error) {
//       console.error("Error fetching programs:", error);
//       setCourses(INITIAL_COURSES); 
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPrograms();
//   }, []);

//   // ─── 🚀 2. COURSE HANDLERS (API INTEGRATED) ──────────────────────────────
//   const handleOpenCourseForm = (course = null) => {
//     if (course) {
//       setEditingCourse(course.id);
//       setCourseFormData(course);
//     } else {
//       setEditingCourse(null);
//       setCourseFormData(defaultCourseState);
//     }
//     setShowCourseForm(true);
//   };

//   const handleSaveCourse = async () => {
//     try {
//       if (!courseFormData.name || !courseFormData.code) return alert("Name and Code are required");

//       if (editingCourse) {
//         await api.put(`/admin/programs/courses/${editingCourse}`, courseFormData);
//       } else {
//         await api.post('/admin/programs/courses', courseFormData);
//       }
      
//       setShowCourseForm(false);
//       fetchPrograms(); 
//     } catch (error) {
//       console.error("Error saving course:", error);
//       alert("Failed to save course.");
//     }
//   };

//   const handleDeleteCourse = async (id) => {
//     if (window.confirm("Are you sure you want to delete this entire course? This cannot be undone.")) {
//       try {
//         await api.delete(`/admin/programs/courses/${id}`);
//         fetchPrograms();
//       } catch (error) {
//         console.error("Error deleting course:", error);
//         alert("Failed to delete course.");
//       }
//     }
//   };

//   const toggleExpand = (id) => {
//     setExpandedCourseId(expandedCourseId === id ? null : id);
//   };

//   if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Academic Programs...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
//       <div className="max-w-8xl mx-auto space-y-4">
        
//         {/* HEADER */}
//         <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//           <h1 className="text-xl font-bold text-gray-800">Courses</h1>
//           {!showCourseForm && (
//             <button 
//               onClick={() => handleOpenCourseForm()}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
//             >
//               <Plus size={16}/> Add Course
//             </button>
//           )}
//         </div>

//         {/* ADD / EDIT COURSE FORM */}
//         {showCourseForm && (
//           <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 shadow-sm">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              
//               <InputField 
//                 label="Course Name" required 
//                 value={courseFormData.name} 
//                 onChange={e => {
//                   const newName = e.target.value;
//                   setCourseFormData({
//                     ...courseFormData, 
//                     name: newName, 
//                     code: generateCode(newName) 
//                   });
//                 }} 
//                 placeholder="e.g. B.Tech" 
//               />
              
//               {/* 🚀 LOCKED CODE FIELD */}
//               <InputField 
//                 label="Code (Auto Numeric)" 
//                 required 
//                 value={courseFormData.code} 
//                 disabled={true} 
//                 placeholder="Auto-generated" 
//               />
              
//               <SelectField label="Level" value={courseFormData.level} onChange={e => setCourseFormData({...courseFormData, level: e.target.value})} options={['UG', 'PG', 'Diploma']} />
//               <SelectField label="Duration" value={courseFormData.duration} onChange={e => setCourseFormData({...courseFormData, duration: e.target.value})} options={['1 Year', '2 Years', '3 Years', '4 Years', '5 Years']} />
              
//               <SelectField label="Sem System" value={courseFormData.semSystem} onChange={e => setCourseFormData({...courseFormData, semSystem: e.target.value})} options={['Semester', 'Yearly']} />
//               <InputField label="Semesters" value={courseFormData.semesters} onChange={e => setCourseFormData({...courseFormData, semesters: e.target.value})} type="number" />
              
//               <SelectField label="Building" value={courseFormData.building} onChange={e => setCourseFormData({...courseFormData, building: e.target.value})} options={['Main Block', 'Science Block', 'Arts Block']} />
//               <SelectField label="Evaluation" value={courseFormData.evaluation} onChange={e => setCourseFormData({...courseFormData, evaluation: e.target.value})} options={['CGPA', 'Percentage', 'Marks']} />
//             </div>
            
//             <div className="flex justify-end gap-3 pt-4 border-t border-blue-100/50">
//               <button onClick={() => setShowCourseForm(false)} className="px-5 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
//                 Cancel
//               </button>
//               <button onClick={handleSaveCourse} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 flex items-center gap-2">
//                 <Check size={16} /> {editingCourse ? 'Update' : 'Add'}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* COURSE CARDS LIST */}
//         <div className="space-y-4">
//           {courses.map(course => (
//             <div key={course.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              
//               {/* CARD HEADER */}
//               <div className="p-5 flex items-start justify-between bg-white hover:bg-gray-50 cursor-pointer transition" onClick={() => toggleExpand(course.id)}>
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-1">
//                     <h2 className="text-lg font-bold text-gray-900">{course.name}</h2>
//                     <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-black rounded uppercase tracking-wider">{course.code}</span>
//                     <span className="text-sm font-semibold text-blue-600">{course.currentIntake}/{course.totalIntake}</span>
//                   </div>
//                   <p className="text-xs text-gray-500 font-medium">
//                     {course.duration} · {course.building} · {course.evaluation} · {course.specializations?.length || 0} specs · {course.batches?.length || 0} batches
//                   </p>
                  
//                   <div className="w-32 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
//                     <div className="h-full bg-blue-500 rounded-full" style={{ width: course.totalIntake > 0 ? `${(course.currentIntake / course.totalIntake) * 100}%` : '0%' }}></div>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-4 text-gray-400">
//                   <button onClick={(e) => { e.stopPropagation(); handleOpenCourseForm(course); }} className="hover:text-blue-600"><Edit2 size={16} /></button>
//                   <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }} className="hover:text-red-500"><Trash2 size={16} /></button>
//                   {expandedCourseId === course.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
//                 </div>
//               </div>

//               {/* EXPANDED CONTENT */}
//               {expandedCourseId === course.id && (
//                 <div className="border-t border-gray-100 bg-white">
//                   <SpecializationsSection course={course} fetchPrograms={fetchPrograms} api={api} />
//                   <div className="h-px bg-gray-100 w-full" />
//                   <BatchesSection course={course} fetchPrograms={fetchPrograms} api={api} allCourses={courses} />
//                 </div>
//               )}
//             </div>
//           ))}
//           {courses.length === 0 && !showCourseForm && (
//             <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 font-bold">
//               No academic programs found. Click "Add Course" to begin.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // SPECIALIZATIONS SECTION (API INTEGRATED)
// // ══════════════════════════════════════════════════════════════════════════════
// const SpecializationsSection = ({ course, fetchPrograms, api }) => {
//   const [newSpec, setNewSpec] = useState({ name: '', code: '', total: '', intake: '' });
//   const [editingSpecId, setEditingSpecId] = useState(null);

//   const handleSaveSpec = async () => {
//     if (!newSpec.name) return;
    
//     try {
//       if (editingSpecId) {
//         await api.put(`/admin/programs/specializations/${editingSpecId}`, { ...newSpec, active: true });
//       } else {
//         await api.post(`/admin/programs/specializations`, { ...newSpec, courseId: course.id, active: true });
//       }
//       setNewSpec({ name: '', code: '', total: '', intake: '' });
//       setEditingSpecId(null);
//       fetchPrograms(); // Refresh UI
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save specialization");
//     }
//   };

//   const handleEditSpec = (spec) => {
//     setNewSpec({ name: spec.name, code: spec.code || '', total: spec.total, intake: spec.intake });
//     setEditingSpecId(spec.id);
//   };

//   const handleDeleteSpec = async (specId) => {
//     if (window.confirm("Delete this specialization?")) {
//       try {
//         await api.delete(`/admin/programs/specializations/${specId}`);
//         fetchPrograms();
//       } catch(e) { console.error(e); }
//     }
//   };

//   const handleToggleSpecActive = async (spec) => {
//     try {
//       await api.put(`/admin/programs/specializations/${spec.id}`, { ...spec, active: !spec.active });
//       fetchPrograms();
//     } catch(e) { console.error(e); }
//   };

//   return (
//     <div className="p-6">
//       <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Specializations</h3>
      
//       <div className="grid grid-cols-12 gap-4 pb-2 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
//         <div className="col-span-4">Name</div>
//         <div className="col-span-2">Code</div>
//         <div className="col-span-2 text-center">Total</div>
//         <div className="col-span-2 text-center">Intake</div>
//         <div className="col-span-2 text-right">Active</div>
//       </div>

//       <div className="space-y-3 py-3">
//         {course.specializations?.map(spec => (
//           <div key={spec.id} className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-gray-800">
//             <div className="col-span-4">{spec.name}</div>
//             <div className="col-span-2 text-gray-500 font-bold">{spec.code || '—'}</div>
//             <div className="col-span-2 text-center">{spec.total}</div>
//             <div className="col-span-2 text-center text-blue-600">{spec.intake}</div>
//             <div className="col-span-2 flex justify-end items-center gap-3">
//               <div onClick={() => handleToggleSpecActive(spec)} className={`w-9 h-5 rounded-full flex items-center px-0.5 cursor-pointer ${spec.active ? 'bg-green-50' : 'bg-gray-300'}`}>
//                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${spec.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
//               </div>
//               <button onClick={() => handleEditSpec(spec)} className="text-blue-400 hover:text-blue-600"><Edit2 size={15}/></button>
//               <button onClick={() => handleDeleteSpec(spec.id)} className="text-red-400 hover:text-red-600"><Trash2 size={15}/></button>
//             </div>
//           </div>
//         ))}
//         {(!course.specializations || course.specializations.length === 0) && (
//           <p className="text-sm text-gray-400 text-center py-2">No specializations added.</p>
//         )}
//       </div>

//       <div className="flex items-center gap-3 mt-4">
        
//         <input 
//           type="text" placeholder="Specialization Name" 
//           value={newSpec.name} 
//           onChange={e => {
//             const newName = e.target.value;
//             setNewSpec({
//               ...newSpec, 
//               name: newName, 
//               code: generateCode(newName)
//             });
//           }} 
//           className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" 
//         />
        
//         <input 
//           type="text" 
//           placeholder="Auto Code" 
//           value={newSpec.code} 
//           disabled 
//           className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-gray-100 text-gray-500 cursor-not-allowed" 
//         />
        
//         <input type="number" placeholder="Tot" value={newSpec.total} onChange={e => setNewSpec({...newSpec, total: e.target.value})} className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-blue-400" />
//         <input type="number" placeholder="Int" value={newSpec.intake} onChange={e => setNewSpec({...newSpec, intake: e.target.value})} className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:border-blue-400" />
        
//         <button onClick={handleSaveSpec} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 hover:bg-blue-700 min-w-[80px]">
//           {editingSpecId ? <Check size={16} /> : <Plus size={16} />} {editingSpecId ? 'Save' : 'Add'}
//         </button>
//         {editingSpecId && (
//           <button onClick={() => { setEditingSpecId(null); setNewSpec({ name: '', code: '', total: '', intake: '' }); }} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-200">
//             <X size={16} />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// // ══════════════════════════════════════════════════════════════════════════════
// // BATCHES SECTION (API INTEGRATED)
// // ══════════════════════════════════════════════════════════════════════════════
// const BatchesSection = ({ course, fetchPrograms, api, allCourses }) => {
//   const [editingBatchId, setEditingBatchId] = useState(null);
//   const [editBatchData, setEditBatchData] = useState(null);
//   const [newSectionText, setNewSectionText] = useState('');

//   const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//   const YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

//   const handleAddNewBatch = () => {
//     setEditBatchData({ 
//       id: 'NEW', name: '', startMonth: 'Jul', startYear: '2026', endMonth: 'Jun', endYear: '2030', sections: ['A'], specs: [], linkedCourseId: course.id 
//     });
//     setEditingBatchId('NEW');
//   };

//   const handleEditBatch = (batch) => {
//     setEditBatchData({ ...batch, linkedCourseId: course.id });
//     setEditingBatchId(batch.id);
//   };

//   const handleCopyBatch = async (batch) => {
//     try {
//       const newBatch = { ...batch, name: `${batch.name} (Copy)`, course_id: course.id };
//       await api.post('/admin/programs/batches', newBatch); 
//       fetchPrograms();
//     } catch(e) { console.error(e); alert("Failed to duplicate batch"); }
//   };

//   const handleDeleteBatch = async (batchId) => {
//     if (window.confirm("Are you sure you want to delete this batch?")) {
//       try {
//         await api.delete(`/admin/programs/batches/${batchId}`); 
//         fetchPrograms();
//       } catch(e) { console.error(e); }
//     }
//   };

//   const handleSaveEdit = async () => {
//     if (!editBatchData.name) return alert("Batch Name is required.");
    
//     try {
//       if (editingBatchId === 'NEW') {
//         await api.post(`/admin/programs/batches`, { ...editBatchData, course_id: editBatchData.linkedCourseId }); 
//       } else {
//         await api.put(`/admin/programs/batches/${editingBatchId}`, editBatchData); 
//       }
//       setEditingBatchId(null);
//       setEditBatchData(null);
//       fetchPrograms();
//     } catch (error) {
//       console.error(error);
//       alert("Failed to save batch");
//     }
//   };

//   const handleCancelEdit = () => {
//     setEditingBatchId(null);
//     setEditBatchData(null);
//     setNewSectionText('');
//   };

//   const addSection = () => {
//     if (newSectionText.trim() && !editBatchData.sections.includes(newSectionText.toUpperCase())) {
//       setEditBatchData({ ...editBatchData, sections: [...editBatchData.sections, newSectionText.toUpperCase()] });
//       setNewSectionText('');
//     }
//   };

//   const removeSection = (sec) => {
//     setEditBatchData({ ...editBatchData, sections: editBatchData.sections.filter(s => s !== sec) });
//   };

//   const toggleSpec = (specName) => {
//     const isActive = editBatchData.specs.includes(specName);
//     const newSpecs = isActive ? editBatchData.specs.filter(s => s !== specName) : [...editBatchData.specs, specName];
//     setEditBatchData({ ...editBatchData, specs: newSpecs });
//   };

//   return (
//     <div className="p-6 bg-gray-50/30">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Batches</h3>
//         {editingBatchId !== 'NEW' && (
//           <button onClick={handleAddNewBatch} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 hover:bg-blue-700 shadow-sm">
//             <Plus size={16} /> Add Batch
//           </button>
//         )}
//       </div>

//       <div className="space-y-4">
//         {editingBatchId === 'NEW' && (
//           <BatchEditForm 
//             data={editBatchData} setData={setEditBatchData} onSave={handleSaveEdit} onCancel={handleCancelEdit}
//             newSectionText={newSectionText} setNewSectionText={setNewSectionText} addSection={addSection} removeSection={removeSection}
//             toggleSpec={toggleSpec} courseSpecs={course.specializations || []} MONTHS={MONTHS} YEARS={YEARS} allCourses={allCourses}
//           />
//         )}

//         {(!course.batches || course.batches.length === 0) && editingBatchId !== 'NEW' && (
//           <p className="text-sm text-gray-400">No batches added yet.</p>
//         )}

//         {course.batches?.map(batch => {
//           if (editingBatchId === batch.id) {
//             return (
//               <BatchEditForm 
//                 key={batch.id} data={editBatchData} setData={setEditBatchData} onSave={handleSaveEdit} onCancel={handleCancelEdit}
//                 newSectionText={newSectionText} setNewSectionText={setNewSectionText} addSection={addSection} removeSection={removeSection}
//                 toggleSpec={toggleSpec} courseSpecs={course.specializations || []} MONTHS={MONTHS} YEARS={YEARS} allCourses={allCourses}
//               />
//             );
//           }

//           return (
//             <div key={batch.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow transition-shadow">
//               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
//                 <div className="flex items-center gap-4">
//                   <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm">{batch.name}</span>
//                   <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
//                     <Calendar size={14} className="text-gray-400"/>
//                     {batch.startMonth} {batch.startYear} &nbsp;→&nbsp; {batch.endMonth} {batch.endYear}
//                   </span>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <button onClick={() => handleEditBatch(batch)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit2 size={16} /></button>
//                   <button onClick={() => handleCopyBatch(batch)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Duplicate"><Copy size={16} /></button>
//                   <button onClick={() => handleDeleteBatch(batch.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-6">
//                 <div className="flex items-start gap-2">
//                   <span className="text-[11px] font-bold text-gray-400 uppercase mt-1 w-10">Sec:</span>
//                   <div className="flex flex-wrap gap-1.5">
//                     {batch.sections?.map(sec => (
//                       <span key={sec} className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">{sec}</span>
//                     ))}
//                     {(!batch.sections || batch.sections.length === 0) && <span className="text-xs font-semibold text-gray-400 italic mt-0.5">None</span>}
//                   </div>
//                 </div>
                
//                 <div className="flex items-start gap-2">
//                   <span className="text-[11px] font-bold text-gray-400 uppercase mt-1 w-10">Specs:</span>
//                   <div className="flex flex-wrap gap-1.5">
//                     {batch.specs?.map(spec => (
//                       <span key={spec} className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded text-xs font-bold shadow-sm">{spec}</span>
//                     ))}
//                     {(!batch.specs || batch.specs.length === 0) && <span className="text-xs font-semibold text-gray-400 italic mt-0.5">None</span>}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// // --- ISOLATED EDIT FORM COMPONENT FOR BATCHES ---
// const BatchEditForm = ({ data, setData, onSave, onCancel, newSectionText, setNewSectionText, addSection, removeSection, toggleSpec, courseSpecs, MONTHS, YEARS, allCourses }) => {
//   const [specToAdd, setSpecToAdd] = useState('');

//   return (
//     <div className="bg-white border-2 border-blue-300 ring-4 ring-blue-50 rounded-xl p-5 shadow-md transition-all">
//       <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
//         <h4 className="font-black text-gray-800 text-sm uppercase tracking-wider">{data.id === 'NEW' ? 'Create New Batch' : 'Edit Batch'}</h4>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <InputField label="Batch Name (e.g. 2026-2030)" value={data.name} onChange={(e) => setData({...data, name: e.target.value})} required />
        
//         {/* 🚀 COURSE LINK DROPDOWN - Showing ALL courses */}
//         <div className="flex flex-col gap-1.5 text-left">
//           <label className="text-[12px] font-bold text-gray-600">Course <span className="text-red-500">*</span></label>
//           <select 
//             value={data.linkedCourseId} 
//             onChange={(e) => setData({...data, linkedCourseId: e.target.value})}
//             className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:border-blue-500 outline-none"
//           >
//             <option value="">Select Course...</option>
//             {allCourses.map(c => (
//               <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div className="flex flex-col gap-1.5 text-left">
//           <label className="text-[12px] font-bold text-gray-600">Duration <span className="text-red-500">*</span></label>
//           <div className="flex items-center gap-1.5">
//             <select value={data.startMonth} onChange={(e) => setData({...data, startMonth: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
//               {MONTHS.map(m => <option key={m}>{m}</option>)}
//             </select>
//             <select value={data.startYear} onChange={(e) => setData({...data, startYear: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
//               {YEARS.map(y => <option key={y}>{y}</option>)}
//             </select>
//             <span className="text-gray-400 font-bold px-1">→</span>
//             <select value={data.endMonth} onChange={(e) => setData({...data, endMonth: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
//               {MONTHS.map(m => <option key={m}>{m}</option>)}
//             </select>
//             <select value={data.endYear} onChange={(e) => setData({...data, endYear: e.target.value})} className="px-2 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none flex-1 focus:border-blue-500">
//               {YEARS.map(y => <option key={y}>{y}</option>)}
//             </select>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div>
//           <label className="text-[12px] font-bold text-gray-600 block mb-2">Sections</label>
//           <div className="flex flex-wrap gap-2 mb-3">
//             {data.sections.map(sec => (
//               <span key={sec} className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
//                 {sec} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => removeSection(sec)}/>
//               </span>
//             ))}
//           </div>
//           <div className="flex gap-2">
//             <input 
//               type="text" value={newSectionText} onChange={e => setNewSectionText(e.target.value)} 
//               placeholder="New (e.g. C)" 
//               className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-400" 
//               onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
//             />
//             <button type="button" onClick={addSection} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-bold transition">Add</button>
//           </div>
//         </div>

//         <div>
//           <label className="text-[12px] font-bold text-gray-600 block mb-2">Included Specializations</label>
//           <div className="flex flex-wrap gap-2 mb-3">
//             {data.specs.map(specName => (
//               <span key={specName} className="bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
//                 {specName} <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => toggleSpec(specName)}/>
//               </span>
//             ))}
//             {data.specs.length === 0 && courseSpecs.length > 0 && (
//               <span className="text-xs text-gray-400 italic mt-1.5">None selected</span>
//             )}
//           </div>

//           {/* 🚀 WRITABLE (SEARCHABLE) DROPDOWN */}
//           <div className="flex gap-2">
//             <input 
//               list="spec-options"
//               value={specToAdd} 
//               onChange={(e) => setSpecToAdd(e.target.value)}
//               placeholder="Type to search/add specialization..."
//               className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:border-blue-400"
//             />
//             <datalist id="spec-options">
//               {courseSpecs
//                 .filter(spec => !data.specs.includes(spec.name))
//                 .map(spec => (
//                   <option key={spec.id} value={spec.name} />
//               ))}
//             </datalist>
//             <button 
//               type="button" 
//               onClick={() => {
//                 if (specToAdd) {
//                   toggleSpec(specToAdd);
//                   setSpecToAdd('');
//                 }
//               }} 
//               disabled={!specToAdd}
//               className="bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition"
//             >
//               Add
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//         <button onClick={onCancel} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition">Cancel</button>
//         <button onClick={onSave} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 flex items-center gap-2 transition">
//           <Check size={16}/> Save Batch
//         </button>
//       </div>
//     </div>
//   );
// };

// // ══════════════════════════════════════════════════════════════════════════════
// // REUSABLE INPUTS
// // ══════════════════════════════════════════════════════════════════════════════
// const InputField = ({ label, placeholder, required, type="text", value, onChange, disabled=false }) => (
//   <div className="flex flex-col gap-1.5 text-left">
//     <label className="text-[12px] font-bold text-gray-600">
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     <input 
//       type={type} 
//       placeholder={placeholder} 
//       value={value} 
//       onChange={onChange} 
//       required={required}
//       disabled={disabled}
//       className={`px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold outline-none transition-colors ${
//         disabled 
//           ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
//           : 'bg-white text-gray-800 focus:border-blue-500'
//       }`} 
//     />
//   </div>
// );

// const SelectField = ({ label, options, value, onChange }) => (
//   <div className="flex flex-col gap-1.5 text-left">
//     <label className="text-[12px] font-bold text-gray-600">{label}</label>
//     <select 
//       value={value} onChange={onChange}
//       className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:border-blue-500 outline-none"
//     >
//       <option value="">Select...</option>
//       {options.map(o => <option key={o} value={o}>{o}</option>)}
//     </select>
//   </div>
// );