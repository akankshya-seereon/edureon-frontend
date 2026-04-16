import React, { useState } from 'react';
import { 
  ChevronDown, Plus, Minus, Copy, BookOpen, 
  Settings, X, FileText, User, Link as LinkIcon, CheckCircle
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

// --- MOCK DATA ---
const MOCK_FACULTY = ['Dr. Anjali Sharma', 'Prof. Rajesh Kumar', 'Dr. Priya Singh', 'Prof. Sunil Varma'];
const MARKING_SYSTEMS = ['CGPA (10 Point)', 'Percentage (100%)', 'Pass/Fail', 'Credit Based'];
const SPECIALIZATION_LINKS = ['Core', 'Elective', 'Open Elective', 'Audit Course', 'Lab/Practical'];

export default function Syllabus() {
  // ─── STATE ──────────────────────────────────────────────────────────────
  const [activeSem, setActiveSem] = useState(1);
  const [semesters, setSemesters] = useState([1, 2, 3, 4]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Store subjects by semester: { 1: [...], 2: [...] }
  const [subjects, setSubjects] = useState({ 1: [], 2: [], 3: [], 4: [] });

  // Subject Form State
  const [subjectForm, setSubjectForm] = useState({
    name: '', code: '', faculty: '', markingSystem: '', specLink: ''
  });

  // ─── HANDLERS ───────────────────────────────────────────────────────────
  const handleAddSemester = () => {
    const nextSem = semesters.length > 0 ? Math.max(...semesters) + 1 : 1;
    setSemesters([...semesters, nextSem]);
    setSubjects(prev => ({ ...prev, [nextSem]: [] }));
    setActiveSem(nextSem);
  };

  const handleRemoveSemester = (semToRemove, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove Semester ${semToRemove}?`)) {
      setSemesters(semesters.filter(s => s !== semToRemove));
      if (activeSem === semToRemove) {
        setActiveSem(semesters[0] || null);
      }
    }
  };

  const handleSaveSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) return alert("Name and Code are required.");
    
    setSubjects(prev => ({
      ...prev,
      [activeSem]: [...(prev[activeSem] || []), { ...subjectForm, id: Date.now() }]
    }));
    
    setIsAddModalOpen(false);
    setSubjectForm({ name: '', code: '', faculty: '', markingSystem: '', specLink: '' });
  };

  const handleDeleteSubject = (id) => {
    setSubjects(prev => ({
      ...prev,
      [activeSem]: prev[activeSem].filter(sub => sub.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Syllabus & Subjects</h1>
        </div>

        {/* ── CARD 1: SELECTION ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800">Select Course / Specialization / Batch</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500">Course</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    <option>MBA (MBA)</option>
                    <option>B.Tech (CSE)</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500">Specialization</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    <option>HR Management</option>
                    <option>Marketing</option>
                    <option>Finance</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500">Batch</label>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500 transition-all cursor-pointer">
                    <option>2026-2028</option>
                    <option>2025-2027</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

            </div>
            
            {/* Badges */}
            <div className="flex gap-3 items-center">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">CGPA</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-md">Batch 2026-2028</span>
            </div>
          </div>
        </div>

        {/* ── ALERT: COPY SYLLABUS ── */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-sm font-bold text-amber-700 whitespace-nowrap">Copy syllabus from:</span>
            <div className="relative w-full max-w-md">
              <select className="w-full appearance-none bg-white border border-amber-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-800 outline-none focus:border-amber-400 transition-all cursor-pointer">
                <option>BTECH/Computer Science Engg/2026-2030</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all whitespace-nowrap flex items-center gap-2">
            Copy All Semesters
          </button>
        </div>

        {/* ── TABS ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {semesters.map(sem => (
            <button 
              key={sem}
              onClick={() => setActiveSem(sem)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                activeSem === sem 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sem {sem}
              <span 
                onClick={(e) => handleRemoveSemester(sem, e)}
                className={`p-0.5 rounded-full flex items-center justify-center transition-colors ${
                  activeSem === sem ? 'bg-white/20 hover:bg-white/40 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                }`}
              >
                <Minus size={12} />
              </span>
            </button>
          ))}
          <button 
            onClick={handleAddSemester}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
            title="Add Semester"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* ── SEMESTER CONTENT ── */}
        {activeSem && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm min-h-[300px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-gray-100 gap-4">
              <h2 className="text-lg font-black text-gray-900">Sem {activeSem}</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 cursor-pointer">
                    <option>Upcoming</option>
                    <option>Ongoing</option>
                    <option>Completed</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-blue-100"
                >
                  <Plus size={16} /> Subject
                </button>
              </div>
            </div>

            {/* Subject List */}
            <div className="p-6">
              {(subjects[activeSem] || []).length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                    <BookOpen size={24} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold text-sm">No subjects added to Semester {activeSem} yet.</p>
                  <p className="text-gray-400 text-xs mt-1">Click the "+ Subject" button to start building your syllabus.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {subjects[activeSem].map((subject, idx) => (
                    <div key={subject.id} className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider rounded border border-blue-100">
                              {subject.code}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider rounded border border-purple-100">
                              {subject.specLink}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-gray-900 leading-tight">{subject.name}</h3>
                        </div>
                        <button onClick={() => handleDeleteSubject(subject.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Faculty</span>
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><User size={12}/> {subject.faculty || 'Unassigned'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Marking</span>
                          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5"><CheckCircle size={12} className="text-green-500"/> {subject.markingSystem}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── ADD SUBJECT MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" /> Add Subject to Sem {activeSem}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveSubject} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Subject Name */}
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subject Name *</label>
                  <input type="text" required placeholder="e.g. Data Structures" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* Subject Code */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Subject Code *</label>
                  <input type="text" required placeholder="e.g. CS-201" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})} 
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-blue-500 focus:bg-white outline-none transition-all" />
                </div>

                {/* Specialization Link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Specialization Track</label>
                  <div className="relative">
                    <select value={subjectForm.specLink} onChange={e => setSubjectForm({...subjectForm, specLink: e.target.value})} required
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-800 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                      <option value="">Select Track...</option>
                      {SPECIALIZATION_LINKS.map(l => <option key={l}>{l}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Faculty Assign */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Assign Faculty</label>
                  <div className="relative">
                    <select value={subjectForm.faculty} onChange={e => setSubjectForm({...subjectForm, faculty: e.target.value})} 
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-800 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                      <option value="">Select Faculty...</option>
                      {MOCK_FACULTY.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Marking System */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Marking System</label>
                  <div className="relative">
                    <select value={subjectForm.markingSystem} onChange={e => setSubjectForm({...subjectForm, markingSystem: e.target.value})} required
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold text-gray-800 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer">
                      <option value="">Select System...</option>
                      {MARKING_SYSTEMS.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-100 flex items-center gap-2">
                  <Plus size={16} /> Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}