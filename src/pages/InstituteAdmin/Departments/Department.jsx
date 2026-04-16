import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Trash2, Plus, Briefcase, Loader2, Search,
  GraduationCap, Building2, ChevronDown, User, CheckCircle, X, Hash
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

// ─── AXIOS CONFIG ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const CATEGORIES = ['Engineering', 'General', 'Management', 'Finance', 'Staff', 'Medical', 'Security', 'IT Support'];

// ─── SEARCHABLE HOD DROPDOWN ──────────────────────────────────────────────────
function HodDropdown({ faculty, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    // 🚀 FIX: Using firstName/lastName to match your Employee Model
    return (Array.isArray(faculty) ? faculty : []).filter(f =>
      `${f.firstName} ${f.lastName}`.toLowerCase().includes(q) ||
      (f.designation || '').toLowerCase().includes(q)
    );
  }, [faculty, search]);

  const selected = faculty.find(f => String(f.id) === String(value));
  const label = selected ? `${selected.firstName} ${selected.lastName}` : null;

  const handleSelect = (id) => { onChange(id); setOpen(false); setSearch(''); };

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="form-input flex items-center justify-between gap-2 cursor-pointer hover:border-blue-400 hover:bg-white transition text-left"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {label ? (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 flex-shrink-0">
                {label.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <span className="truncate text-gray-800 font-semibold">{label}</span>
            </>
          ) : (
            <>
              <User size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 font-medium">Assign HOD...</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {value && (
            <span
              role="button"
              onClick={e => { e.stopPropagation(); handleSelect(''); }}
              className="p-0.5 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition"
            >
              <X size={11} />
            </span>
          )}
          <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search staff…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:bg-white transition"
              />
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
            <button type="button" onClick={() => handleSelect('')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition text-xs border-b border-gray-50 ${!value ? 'bg-blue-50/50' : ''}`}>
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <User size={11} className="text-gray-400" />
              </div>
              <span className="italic text-gray-400 font-medium flex-1">No HOD Assigned</span>
              {!value && <CheckCircle size={11} className="text-blue-500" />}
            </button>
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">No staff found</div>
            ) : (
              filtered.map(f => {
                const isSelected = String(f.id) === String(value);
                // 🚀 FIX: Using firstName/lastName
                const initials = `${f.firstName?.[0] ?? ''}${f.lastName?.[0] ?? ''}`.toUpperCase();
                return (
                  <button key={f.id} type="button" onClick={() => handleSelect(f.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition border-b border-gray-50 ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-[9px] font-black text-blue-600">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{f.firstName} {f.lastName}</p>
                      {f.designation && <p className="text-[10px] text-gray-400 truncate">{f.designation}</p>}
                    </div>
                    {isSelected && <CheckCircle size={11} className="text-blue-500 flex-shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [activeTab, setActiveTab] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listSearch, setListSearch] = useState('');

  // 🚀 FIX: Added department_code to state
  const [formData, setFormData] = useState({
    name: '', department_code: '', hodId: '', leadRole: '', category: '',
    type: 'Academic', description: '', roomNumber: '',
  });

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [deptRes, facultyRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/employees/list'), 
      ]);
      setDepartments(Array.isArray(deptRes.data?.data) ? deptRes.data.data : []);
      setFaculty(Array.isArray(facultyRes.data?.data) ? facultyRes.data.data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Department name is required.');
    if (!formData.category)    return alert('Category is required.');
    
    try {
      setIsSubmitting(true);
      const res = await api.post('/admin/departments', formData);
      if (res.data.success) {
        await fetchInitialData();
        // Reset form but keep the active tab type
        setFormData({ 
          name: '', department_code: '', hodId: '', leadRole: '', 
          category: '', type: activeTab, description: '', roomNumber: '' 
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirm deletion?')) return;
    try {
      const res = await api.delete(`/admin/departments/${id}`);
      if (res.data.success) setDepartments(prev => prev.filter(d => d.id !== id));
    } catch { 
      alert('Delete failed.'); 
    }
  };

  const filteredDepartments = useMemo(() => {
    return (Array.isArray(departments) ? departments : []).filter(d =>
      d.type === activeTab &&
      d.name.toLowerCase().includes(listSearch.toLowerCase())
    );
  }, [departments, activeTab, listSearch]);

  const eligibleFaculty = useMemo(() => {
    return (Array.isArray(faculty) ? faculty : []).filter(f => f.staffType === activeTab);
  }, [faculty, activeTab]);

  const academicCount    = departments.filter(d => d.type === 'Academic').length;
  const nonAcademicCount = departments.filter(d => d.type === 'Non-Academic').length;

  const handleTabChange = (t) => {
    setActiveTab(t);
    setFormData(f => ({ ...f, type: t, hodId: '', category: '', name: '', department_code: '' }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <style>{`
        .form-input { width: 100%; padding: .575rem .875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: .5rem; font-size: .8125rem; font-weight: 600; color: #1e293b; outline: none; transition: border-color .15s, background .15s; }
        .form-input:focus { border-color: #3b82f6; background: #fff; }
        .form-input::placeholder { color: #94a3b8; font-weight: 500; }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* ── Header ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Departments</h2>
                <p className="text-xs text-gray-400 font-medium">Manage organization structure and staff heads.</p>
              </div>
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['Academic', 'Non-Academic'].map(t => (
                <button key={t} onClick={() => handleTabChange(t)}
                  className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  {t} ({t === 'Academic' ? academicCount : nonAcademicCount})
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4 gap-3">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">{activeTab} List</h3>
              <div className="relative w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Filter list…" value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 outline-none" />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400 font-bold italic">
                <Loader2 className="animate-spin text-blue-500" size={20} /> Loading...
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-visible bg-white">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 rounded-t-xl">
                  <div className="col-span-4 text-[10px] font-black text-gray-400 uppercase">Department Name & Code</div>
                  <div className="col-span-3 text-[10px] font-black text-gray-400 uppercase">Head of Department</div>
                  <div className="col-span-2 text-[10px] font-black text-gray-400 uppercase">Category</div>
                  <div className="col-span-2 text-[10px] font-black text-gray-400 uppercase">Room</div>
                  <div className="col-span-1" />
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-100">
                  {filteredDepartments.map(dept => (
                    <div key={dept.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                      <div className="col-span-4">
                        <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase">{dept.department_code || 'No Code'}</p>
                      </div>
                      <div className="col-span-3">
                        {dept.hod_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white">
                              {dept.hod_name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-xs text-slate-700 font-bold">{dept.hod_name}</span>
                          </div>
                        ) : <span className="text-gray-300 text-xs italic">Unassigned</span>}
                      </div>
                      <div className="col-span-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase tracking-wider">{dept.category}</span>
                      </div>
                      <div className="col-span-2 text-xs font-bold text-slate-500">{dept.roomNumber || '—'}</div>
                      <div className="col-span-1 text-right">
                        <button onClick={() => handleDelete(dept.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredDepartments.length === 0 && <div className="p-12 text-center text-gray-400 text-xs font-bold italic">No departments found in this category.</div>}
                </div>

                {/* ── Inline Add Form ── */}
                <div className="p-5 bg-slate-50 border-t border-gray-200 rounded-b-xl overflow-visible">
                  <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Dept Name</label>
                      <input type="text" placeholder="e.g. Computer Science" value={formData.name}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        className="form-input" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Dept Code</label>
                      <input type="text" placeholder="CS-101" value={formData.department_code}
                        onChange={e => setFormData(f => ({ ...f, department_code: e.target.value }))}
                        className="form-input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Assign HOD</label>
                      <HodDropdown faculty={eligibleFaculty} value={formData.hodId}
                        onChange={v => setFormData(f => ({ ...f, hodId: v }))} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Category</label>
                      <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                        className="form-input" required>
                        <option value="">Select...</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-1.5 flex-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Room</label>
                      <input type="text" placeholder="302" value={formData.roomNumber}
                        onChange={e => setFormData(f => ({ ...f, roomNumber: e.target.value }))}
                        className="form-input" />
                    </div>
                    <div className="md:col-span-1.5 flex justify-end">
                      <button type="submit" disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-black rounded-lg transition-all shadow-md shadow-blue-100">
                        {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        ADD
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}