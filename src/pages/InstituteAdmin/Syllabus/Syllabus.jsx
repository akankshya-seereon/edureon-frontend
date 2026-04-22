import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  ChevronDown, Plus, Minus, Trash2, Save, CheckCircle, AlertCircle
} from 'lucide-react';

// 🚀 IMPORTANT: Adjust this path to match your project
import apiBaseUrl from "../../../config/baseurl"; 

const MARKING_SYSTEMS = ['CGPA (10 Point)', 'Percentage (100%)', 'Pass/Fail', 'Credit Based'];

export const Syllabus = () => {
  // ─── STATE: DROPDOWNS (Live from DB) ────────────────────────────────────
  const [dropdowns, setDropdowns] = useState({
    courses: [],
    specs: [],
    batches: [],
    faculty: []
  });

  // ─── STATE: TOP LEVEL SELECTIONS ────────────────────────────────────────
  const [headerInfo, setHeaderInfo] = useState({
    course: '',
    specialization: '',
    batch: '',
    status: 'In-Progress'
  });

  // ─── STATE: SYLLABUS DATA ───────────────────────────────────────────────
  const initialSubjectState = { 
    id: Date.now(), 
    name: '', 
    code: '', 
    faculty: '', 
    markingSystem: 'Percentage (100%)', 
    internal: '', 
    university: '', 
    laboratory: '', 
    presentation: '', 
    elective: false 
  };

  const [activeSem, setActiveSem] = useState(1);
  const [semesters, setSemesters] = useState([1]);
  const [subjects, setSubjects] = useState({ 1: [{ ...initialSubjectState }] });
  
  const [isSaving, setIsSaving] = useState(false);

  // 🚀 AUTO-GENERATED MASTER SYLLABUS CODE
  const masterSyllabusCode = useMemo(() => {
    if (headerInfo.course && headerInfo.batch) {
      const coursePart = headerInfo.course.toUpperCase().replace(/\s+/g, '');
      const batchPart = headerInfo.batch.replace(/\s+/g, '').replace('-', '');
      return `${coursePart}-${batchPart}-SEMESTER${activeSem}`;
    }
    return '';
  }, [headerInfo, activeSem]);

  // ─── FETCH DROPDOWN DATA ON LOAD ────────────────────────────────────────
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/admin/syllabus/form-data`, { withCredentials: true });
        
        if (response.data.success) {
          setDropdowns({
            courses: response.data.data.courses || [],
            specs: response.data.data.specializations || [],
            batches: response.data.data.batches || [],
            faculty: response.data.data.faculty || []
          });
        }
      } catch (error) {
        console.error("Failed to load dropdowns:", error);
      }
    };
    fetchFormData();
  }, []);

  // ─── CALCULATIONS ───────────────────────────────────────────────────────
  const { subTotals, grandTotal } = useMemo(() => {
    const currentSubs = subjects[activeSem] || [];
    const totals = currentSubs.reduce((acc, curr) => {
      acc.internal += parseInt(curr.internal) || 0;
      acc.university += parseInt(curr.university) || 0;
      acc.laboratory += parseInt(curr.laboratory) || 0;
      acc.presentation += parseInt(curr.presentation) || 0;
      return acc;
    }, { internal: 0, university: 0, laboratory: 0, presentation: 0 });

    const grand = totals.internal + totals.university + totals.laboratory + totals.presentation;
    return { subTotals: totals, grandTotal: grand };
  }, [subjects, activeSem]);

  // ─── HANDLERS ───────────────────────────────────────────────────────────
  const handleHeaderChange = (e) => {
    setHeaderInfo({ ...headerInfo, [e.target.name]: e.target.value });
  };

  const handleAddSemester = () => {
    const nextSem = semesters.length > 0 ? Math.max(...semesters) + 1 : 1;
    setSemesters([...semesters, nextSem]);
    setSubjects(prev => ({ ...prev, [nextSem]: [] }));
    setActiveSem(nextSem);
  };

  const handleRemoveSemester = (semToRemove, e) => {
    e.stopPropagation();
    if (window.confirm(`Remove Semester ${semToRemove} and all its subjects?`)) {
      setSemesters(semesters.filter(s => s !== semToRemove));
      setSubjects(prev => {
        const newSubs = { ...prev };
        delete newSubs[semToRemove];
        return newSubs;
      });
      if (activeSem === semToRemove) {
        setActiveSem(semesters[0] || null);
      }
    }
  };

  const handleAddSubjectRow = () => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: [
        ...(prev[activeSem] || []), 
        { ...initialSubjectState, id: Date.now() + Math.random() }
      ]
    }));
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: prev[activeSem].map(sub => {
        if (sub.id === id) {
          let updatedSub = { ...sub, [field]: value };

          // 🛠️ AUTO-GENERATE CODE LOGIC
          if (field === 'name' && !sub.code && value.trim().length > 2) {
            const initials = value.trim().split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 3);
            const randomNum = Math.floor(100 + Math.random() * 900); 
            updatedSub.code = `${initials}${randomNum}`;
          }

          return updatedSub;
        }
        return sub;
      })
    }));
  };

  const handleDeleteSubject = (id) => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: prev[activeSem].filter(sub => sub.id !== id)
    }));
  };

  const handleReviewAndSave = async () => {
    if (!headerInfo.course || !headerInfo.specialization || !headerInfo.batch) {
      alert("Please select a Course, Specialization, and Batch at the top.");
      return;
    }

    let isValid = true;
    Object.values(subjects).forEach(semSubs => {
      semSubs.forEach(sub => {
        if (!sub.name.trim() || !sub.code.trim()) isValid = false;
      });
    });

    if (!isValid) {
      alert("Please ensure all subjects have at least a Name and a Code before saving.");
      return;
    }

    const payload = {
      ...headerInfo,
      masterSyllabusCode,
      semestersData: subjects, 
      totalSemesters: semesters.length
    };

    try {
      setIsSaving(true);
      const response = await axios.post(`${apiBaseUrl}/admin/syllabus`, payload, { withCredentials: true });
      
      if (response.data.success) {
        alert("Syllabus Saved Successfully!");
        
        // 🚀 BYPASS THE 404 ERROR: Reset the state cleanly to build a new syllabus
        setHeaderInfo({ course: '', specialization: '', batch: '', status: 'In-Progress' });
        setActiveSem(1);
        setSemesters([1]);
        setSubjects({ 1: [{ ...initialSubjectState, id: Date.now() }] });
      }
    } catch (error) {
      console.error("Save Error:", error);
      alert(error.response?.data?.message || "Failed to save syllabus to database.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Build Syllabus</h1>
        </div>

        {/* ── CARD 1: SELECTION ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-gray-800">1. Select Course / Specialization / Batch</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Course *</label>
                <div className="relative">
                  <select name="course" value={headerInfo.course} onChange={handleHeaderChange} className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    <option value="">Select Course</option>
                    {dropdowns.courses.map((c, i) => {
                      const displayValue = c.course_name || c.name || c.title || c;
                      return <option key={i} value={displayValue}>{displayValue}</option>
                    })}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Specialization *</label>
                <div className="relative">
                  <select name="specialization" value={headerInfo.specialization} onChange={handleHeaderChange} className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    <option value="">Select Specialization</option>
                    {dropdowns.specs.map((s, i) => {
                      const displayValue = s.specialization_name || s.name || s.title || s;
                      return <option key={i} value={displayValue}>{displayValue}</option>
                    })}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Batch *</label>
                <div className="relative">
                  <select name="batch" value={headerInfo.batch} onChange={handleHeaderChange} className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    <option value="">Select Batch</option>
                    {dropdowns.batches.map((b, i) => {
                      const displayValue = b.batch_name || b.name || b.year || b;
                      return <option key={i} value={displayValue}>{displayValue}</option>
                    })}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            {(headerInfo.course && headerInfo.batch) && (
              <div className="flex flex-wrap gap-2 items-center mt-2">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-100">
                  Target: {headerInfo.course} ({headerInfo.batch})
                </span>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                  Syllabus Code: {masterSyllabusCode}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {semesters.map(sem => (
            <button 
              key={sem}
              type="button"
              onClick={() => setActiveSem(sem)}
              className={`flex items-center gap-3 px-5 py-2 rounded-lg text-sm font-bold transition-all border ${
                activeSem === sem 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              Sem {sem}
              <span 
                onClick={(e) => handleRemoveSemester(sem, e)}
                className={`flex items-center justify-center transition-colors ${
                  activeSem === sem ? 'text-blue-200 hover:text-white' : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Minus size={14} strokeWidth={3} />
              </span>
            </button>
          ))}
          <button 
            type="button"
            onClick={handleAddSemester}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all text-sm font-bold"
          >
            <Plus size={16} strokeWidth={3} /> Add Semester
          </button>
        </div>

        {/* ── SEMESTER TABLE ── */}
        {activeSem && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
              <h2 className="text-lg font-black text-gray-900">2. Configure Subjects & Marks for Sem {activeSem}</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select name="status" value={headerInfo.status} onChange={handleHeaderChange} className="appearance-none bg-amber-50 border border-amber-200 text-amber-700 rounded-lg pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer">
                    <option value="In-Progress">In-Progress</option>
                    <option value="Finalized">Finalized</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 pointer-events-none" />
                </div>
                <button 
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-blue-100"
                >
                  <Plus size={16} strokeWidth={3} /> Add Subject
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-200">
                    <th className="px-6 py-3 text-[12px] font-bold text-slate-500 w-[20%]">Subject Name *</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 w-[10%]">Code *</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 w-[15%]">Faculty Assign</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 w-[15%]">Marking System</th>
                    <th className="px-1 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Internal</th>
                    <th className="px-1 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">University</th>
                    <th className="px-1 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Laboratory</th>
                    <th className="px-1 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Presentation</th>
                    <th className="px-1 py-3 text-[12px] font-bold text-slate-500 text-center w-[6%]">Elective</th>
                    <th className="px-4 py-3 w-[6%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(subjects[activeSem] || []).length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <p className="text-slate-400 font-bold text-sm mb-4">No subjects added to Semester {activeSem}.</p>
                        <button 
                          type="button" onClick={handleAddSubjectRow}
                          className="px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-lg transition-colors inline-flex items-center gap-2"
                        >
                          <Plus size={16} strokeWidth={3} /> Add First Subject
                        </button>
                      </td>
                    </tr>
                  ) : (
                    (subjects[activeSem] || []).map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-2.5">
                          <input type="text" placeholder="e.g. Mathematics" value={sub.name} onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </td>
                        <td className="px-2 py-2.5">
                          <input type="text" placeholder="AUTO-GEN" value={sub.code} onChange={(e) => handleSubjectChange(sub.id, 'code', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
                        </td>
                        <td className="px-2 py-2.5">
                          <select value={sub.faculty} onChange={(e) => handleSubjectChange(sub.id, 'faculty', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 outline-none cursor-pointer">
                            <option value="">Unassigned</option>
                            {dropdowns.faculty.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2.5">
                          <select value={sub.markingSystem} onChange={(e) => handleSubjectChange(sub.id, 'markingSystem', e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 outline-none cursor-pointer">
                            {MARKING_SYSTEMS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </td>
                        <td className="px-1 py-2.5">
                          <input type="number" min="0" value={sub.internal} onChange={(e) => handleSubjectChange(sub.id, 'internal', e.target.value)} className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </td>
                        <td className="px-1 py-2.5">
                          <input type="number" min="0" value={sub.university} onChange={(e) => handleSubjectChange(sub.id, 'university', e.target.value)} className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </td>
                        <td className="px-1 py-2.5">
                          <input type="number" min="0" value={sub.laboratory} onChange={(e) => handleSubjectChange(sub.id, 'laboratory', e.target.value)} className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </td>
                        <td className="px-1 py-2.5">
                          <input type="number" min="0" value={sub.presentation} onChange={(e) => handleSubjectChange(sub.id, 'presentation', e.target.value)} className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-center focus:border-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </td>
                        <td className="px-1 py-2.5 text-center">
                          <input type="checkbox" checked={sub.elective} onChange={(e) => handleSubjectChange(sub.id, 'elective', e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button type="button" onClick={() => handleDeleteSubject(sub.id)} className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                
                {((subjects[activeSem] || []).length > 0) && (
                  <tfoot className="bg-slate-50/80 border-t border-gray-200">
                    <tr className="border-b border-gray-100">
                      <td colSpan="4" className="px-6 py-4 text-xs font-black text-slate-500 text-right uppercase tracking-wider">
                        Semester Sub-Total
                      </td>
                      <td className="px-1 py-4 text-sm font-bold text-gray-800 text-center">{subTotals.internal > 0 ? subTotals.internal : '-'}</td>
                      <td className="px-1 py-4 text-sm font-bold text-gray-800 text-center">{subTotals.university > 0 ? subTotals.university : '-'}</td>
                      <td className="px-1 py-4 text-sm font-bold text-gray-800 text-center">{subTotals.laboratory > 0 ? subTotals.laboratory : '-'}</td>
                      <td className="px-1 py-4 text-sm font-bold text-gray-800 text-center">{subTotals.presentation > 0 ? subTotals.presentation : '-'}</td>
                      <td colSpan="2"></td>
                    </tr>
                    <tr className="bg-white">
                      <td colSpan="4" className="px-6 py-6 text-sm font-black text-blue-900 text-right uppercase tracking-tighter">
                        Total Semester Marks (All Categories)
                      </td>
                      <td colSpan="4" className="px-1 py-6 text-xl font-black text-blue-600 text-center">
                        <span className="bg-blue-50 px-6 py-2 rounded-lg border border-blue-100">
                          {grandTotal > 0 ? grandTotal : '0'}
                        </span>
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-gray-200 pt-6">
          <div className="flex gap-4">
            <button type="button" onClick={() => window.location.reload()} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all">
              Cancel Draft
            </button>
            <button 
              type="button"
              onClick={handleReviewAndSave}
              disabled={isSaving}
              className={`px-8 py-3 text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 
                ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <CheckCircle size={18} /> {isSaving ? 'Saving...' : 'Review & Add Syllabus'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
} 

export default Syllabus;