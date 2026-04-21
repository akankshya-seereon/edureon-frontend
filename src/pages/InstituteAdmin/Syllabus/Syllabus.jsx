import React, { useState, useMemo } from 'react';
import { 
  ChevronDown, Plus, Minus, Trash2, Save, CheckCircle
} from 'lucide-react';

// --- MOCK DATA FOR DROPDOWNS ---
const MOCK_COURSES = ['B.Tech (BTECH)', 'M.Tech (MTECH)', 'MBA (MBA)', 'BCA (BCA)'];
const MOCK_SPECS = ['Computer Science Engg', 'Mechanical Engg', 'Civil Engg', 'Information Tech'];
const MOCK_BATCHES = ['2026-2030', '2025-2029', '2024-2028'];
const MOCK_FACULTY = ['Unassigned', 'Dr. Anjali Sharma', 'Prof. Rajesh Kumar', 'Dr. Priya Singh'];
const MARKING_SYSTEMS = ['CGPA (10 Point)', 'Percentage (100%)', 'Pass/Fail', 'Credit Based'];

export const Syllabus = () => {
  // ─── STATE ──────────────────────────────────────────────────────────────
  const [activeSem, setActiveSem] = useState(1);
  const [semesters, setSemesters] = useState([1, 2, 3, 4]);
  
  const [subjects, setSubjects] = useState({ 
    1: [
      { id: 1, name: 'Engineering Mathematics', code: 'MATH101', faculty: 'Prof. Rajesh Kumar', markingSystem: 'Percentage (100%)', int: '20', uni: '80', lab: '', pres: '', elec: false },
      { id: 2, name: 'Physics', code: 'PHY101', faculty: 'Dr. Anjali Sharma', markingSystem: 'Percentage (100%)', int: '20', uni: '80', lab: '50', pres: '', elec: false },
      { id: 3, name: 'Chemistry', code: 'CHM101', faculty: 'Dr. Priya Singh', markingSystem: 'Percentage (100%)', int: '20', uni: '80', lab: '50', pres: '', elec: false },
      { id: 4, name: 'English', code: 'ENG101', faculty: 'Unassigned', markingSystem: 'Percentage (100%)', int: '20', uni: '80', lab: '', pres: '', elec: false },
      { id: 5, name: 'Basic Electrical Engg', code: 'BEE101', faculty: 'Unassigned', markingSystem: 'Percentage (100%)', int: '20', uni: '80', lab: '', pres: '', elec: false },
      { id: 6, name: 'Programming', code: 'CS101', faculty: 'Unassigned', markingSystem: 'Percentage (100%)', int: '20', uni: '30', lab: '50', pres: '', elec: false },
      { id: 7, name: 'Engineering Graphics', code: 'EG101', faculty: 'Unassigned', markingSystem: 'Pass/Fail', int: '', uni: '', lab: '50', pres: '', elec: false },
      { id: 8, name: 'Seminar', code: 'SEM101', faculty: 'Unassigned', markingSystem: 'Credit Based', int: '', uni: '', lab: '', pres: '50', elec: false },
    ], 
    2: [], 3: [], 4: [] 
  });

  // ─── CALCULATIONS ───────────────────────────────────────────────────────
  const { subTotals, grandTotal } = useMemo(() => {
    const currentSubs = subjects[activeSem] || [];
    
    const totals = currentSubs.reduce((acc, curr) => {
      acc.int += parseInt(curr.int) || 0;
      acc.uni += parseInt(curr.uni) || 0;
      acc.lab += parseInt(curr.lab) || 0;
      acc.pres += parseInt(curr.pres) || 0;
      return acc;
    }, { int: 0, uni: 0, lab: 0, pres: 0 });

    const grand = totals.int + totals.uni + totals.lab + totals.pres;

    return { subTotals: totals, grandTotal: grand };
  }, [subjects, activeSem]);


  // ─── HANDLERS ───────────────────────────────────────────────────────────
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

  // 🚀 FIXED: Guaranteed unique ID so React always renders the new row!
  const handleAddSubjectRow = () => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: [
        ...(prev[activeSem] || []), 
        { 
          id: Date.now() + Math.random(), // Bulletproof unique ID
          name: '', code: '', faculty: 'Unassigned', 
          markingSystem: 'Percentage (100%)', 
          int: '', uni: '', lab: '', pres: '', elec: false 
        }
      ]
    }));
  };

  const handleSubjectChange = (id, field, value) => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: prev[activeSem].map(sub => 
        sub.id === id ? { ...sub, [field]: value } : sub
      )
    }));
  };

  const handleDeleteSubject = (id) => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: prev[activeSem].filter(sub => sub.id !== id)
    }));
  };

  const handleReviewAndSave = () => {
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

    console.log("Saving Final Syllabus Data:", subjects);
    alert(`Syllabus Added & Saved Successfully!\nGrand Total for Sem ${activeSem} is ${grandTotal} marks.`);
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
                <label className="text-xs font-bold text-slate-500">Course</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    {MOCK_COURSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Specialization</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    {MOCK_SPECS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500">Batch</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    {MOCK_BATCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">CGPA</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md border border-green-100">Batch 2026-2030</span>
            </div>
          </div>
        </div>

        {/* ── ALERT: COPY SYLLABUS ── */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-bold text-amber-700 whitespace-nowrap">Copy syllabus from:</span>
            <div className="relative w-full max-w-md">
              <select className="w-full appearance-none bg-white border border-amber-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-800 outline-none focus:border-amber-500 cursor-pointer">
                <option value="">Select source...</option>
                <option>BTECH / Computer Science Engg / 2025-2029</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <button type="button" className="px-5 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all whitespace-nowrap shadow-sm">
            Copy All Semesters
          </button>
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

        {/* ── SEMESTER TABLE (Combined Master Layout) ── */}
        {activeSem && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
              <h2 className="text-lg font-black text-gray-900">2. Configure Subjects & Marks for Sem {activeSem}</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select className="appearance-none bg-amber-50 border border-amber-200 text-amber-700 rounded-lg pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer">
                    <option>In-Progress</option>
                    <option>Finalized</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-700 pointer-events-none" />
                </div>
                {/* 🚀 FIXED: Added type="button" to prevent default form behavior */}
                <button 
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-blue-100"
                >
                  <Plus size={16} strokeWidth={3} /> Add Subject
                </button>
              </div>
            </div>

            {/* Table Area (Wide formatting to support all columns) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-gray-200">
                    <th className="px-6 py-3 text-[12px] font-bold text-slate-500 w-[20%]">Subject Name</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 w-[10%]">Code</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 w-[15%]">Faculty Assign</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 w-[15%]">Marking System</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Int</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Uni</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Lab</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 text-center w-[7%]">Pres</th>
                    <th className="px-3 py-3 text-[12px] font-bold text-slate-500 text-center w-[6%]">Elec</th>
                    <th className="px-4 py-3 w-[6%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* 🚀 FIXED: Empty state now contains a real, clickable button! */}
                  {(subjects[activeSem] || []).length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <p className="text-slate-400 font-bold text-sm mb-4">No subjects added to Semester {activeSem}.</p>
                        <button 
                          type="button"
                          onClick={handleAddSubjectRow}
                          className="px-5 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-sm rounded-lg transition-colors inline-flex items-center gap-2 text-left"
                        >
                          <Plus size={16} strokeWidth={3} /> Add First Subject
                        </button>
                      </td>
                    </tr>
                  ) : (
                    (subjects[activeSem] || []).map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Name */}
                        <td className="px-6 py-2.5">
                          <input 
                            type="text" 
                            placeholder="e.g. Mathematics"
                            value={sub.name}
                            onChange={(e) => handleSubjectChange(sub.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                          />
                        </td>
                        {/* Code */}
                        <td className="px-2 py-2.5">
                          <input 
                            type="text" 
                            placeholder="MATH101"
                            value={sub.code}
                            onChange={(e) => handleSubjectChange(sub.id, 'code', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold uppercase text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                          />
                        </td>
                        {/* Faculty */}
                        <td className="px-2 py-2.5">
                          <select 
                            value={sub.faculty}
                            onChange={(e) => handleSubjectChange(sub.id, 'faculty', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            {MOCK_FACULTY.map(f => <option key={f}>{f}</option>)}
                          </select>
                        </td>
                        {/* Marking System */}
                        <td className="px-2 py-2.5">
                          <select 
                            value={sub.markingSystem}
                            onChange={(e) => handleSubjectChange(sub.id, 'markingSystem', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                          >
                            {MARKING_SYSTEMS.map(m => <option key={m}>{m}</option>)}
                          </select>
                        </td>
                        {/* Internal Marks */}
                        <td className="px-2 py-2.5">
                          <input 
                            type="number" min="0" max="100"
                            value={sub.int}
                            onChange={(e) => handleSubjectChange(sub.id, 'int', e.target.value)}
                            className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        {/* Uni Marks */}
                        <td className="px-2 py-2.5">
                          <input 
                            type="number" min="0" max="100"
                            value={sub.uni}
                            onChange={(e) => handleSubjectChange(sub.id, 'uni', e.target.value)}
                            className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        {/* Lab Marks */}
                        <td className="px-2 py-2.5">
                          <input 
                            type="number" min="0" max="100"
                            value={sub.lab}
                            onChange={(e) => handleSubjectChange(sub.id, 'lab', e.target.value)}
                            className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        {/* Pres Marks */}
                        <td className="px-2 py-2.5">
                          <input 
                            type="number" min="0" max="100"
                            value={sub.pres}
                            onChange={(e) => handleSubjectChange(sub.id, 'pres', e.target.value)}
                            className="w-full px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        </td>
                        {/* Elective Checkbox */}
                        <td className="px-2 py-2.5 text-center">
                          <input 
                            type="checkbox"
                            checked={sub.elec}
                            onChange={(e) => handleSubjectChange(sub.id, 'elec', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-2.5 text-center">
                          <button 
                            type="button"
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                            title="Remove Subject"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                
                {/* ── FOOTER: TOTALS ── */}
                {((subjects[activeSem] || []).length > 0) && (
                  <tfoot className="bg-slate-50/80 border-t border-gray-200">
                    {/* Sub-Total Row (Aligns perfectly with marks columns) */}
                    <tr>
                      {/* Spans across Name, Code, Faculty, and Marking System */}
                      <td colSpan="4" className="px-6 py-4 text-sm font-bold text-gray-800 text-right pr-6">
                        Sub-Total
                      </td>
                      <td className="px-2 py-4 text-sm font-bold text-gray-800 text-center">
                        {subTotals.int > 0 ? subTotals.int : ''}
                      </td>
                      <td className="px-2 py-4 text-sm font-bold text-gray-800 text-center">
                        {subTotals.uni > 0 ? subTotals.uni : ''}
                      </td>
                      <td className="px-2 py-4 text-sm font-bold text-gray-800 text-center">
                        {subTotals.lab > 0 ? subTotals.lab : ''}
                      </td>
                      <td className="px-2 py-4 text-sm font-bold text-gray-800 text-center">
                        {subTotals.pres > 0 ? subTotals.pres : ''}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                    
                    {/* Grand Total Row */}
                    <tr className="border-t border-gray-200 bg-white">
                      <td colSpan="4" className="px-6 py-5 text-base font-black text-blue-800 text-right pr-6">
                        Total Semester Marks
                      </td>
                      <td colSpan="4" className="px-2 py-5 text-lg font-black text-blue-800 text-center tracking-wider">
                        {grandTotal > 0 ? grandTotal : ''}
                      </td>
                      <td colSpan="2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* ── 3. REVIEW & SAVE ACTION BAR ── */}
        <div className="mt-8 flex items-center justify-end border-t border-gray-200 pt-6">
          <div className="flex gap-4">
            <button type="button" className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm">
              Cancel Draft
            </button>
            <button 
              type="button"
              onClick={handleReviewAndSave}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <CheckCircle size={18} /> Review & Add Syllabus
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}