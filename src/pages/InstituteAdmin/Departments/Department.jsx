import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Trash2, Plus, Briefcase, Loader2, Search,
  GraduationCap, Building2, ChevronDown, User, CheckCircle, X, Edit, Save, XCircle
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
    const q = search.toLowerCase().trim();
    return (Array.isArray(faculty) ? faculty : []).filter(f => {
      const fName = (f.firstName || '').toLowerCase();
      const lName = (f.lastName || '').toLowerCase();
      const design = (f.designation || '').toLowerCase();
      const empId = (f.employeeId || '').toLowerCase();
      return fName.includes(q) || lName.includes(q) || design.includes(q) || empId.includes(q);
    });
  }, [faculty, search]);

  // 🚀 Loose equality check is CRITICAL for database IDs (String vs Number)
  const selected = (Array.isArray(faculty) ? faculty : []).find(f => f.id == value);
  const label = selected ? `${selected.firstName} ${selected.lastName || ''}`.trim() : null;

  return (
    <div ref={ref} className="relative w-full overflow-visible">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="form-input flex items-center justify-between gap-2 cursor-pointer hover:border-blue-400 hover:bg-white transition text-left h-[38px]"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {label ? (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 flex-shrink-0 uppercase">
                {(selected.firstName?.[0] || '')}{(selected.lastName?.[0] || '')}
              </div>
              <span className="truncate text-gray-800 font-bold text-xs">{label}</span>
            </>
          ) : (
            <>
              <User size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-400 font-medium text-xs">Assign HOD...</span>
            </>
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-[9999] mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden left-0">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-blue-400 transition"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[220px]">
            <button type="button" onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-gray-50 transition text-xs border-b border-gray-50 ${!value ? 'bg-blue-50/50' : ''}`}>
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={11} className="text-gray-400" />
              </div>
              <span className="italic text-gray-400 font-medium flex-1">No HOD Assigned</span>
            </button>
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 font-bold italic">No faculty found</div>
            ) : (
              filtered.map(f => (
                <button key={f.id} type="button" onClick={() => { onChange(f.id); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 transition border-b border-gray-50 ${value == f.id ? 'bg-blue-50/50' : ''}`}>
                  <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 flex-shrink-0 uppercase">
                    {(f.firstName?.[0] || '')}{(f.lastName?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{f.firstName} {f.lastName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{f.designation || 'Academic Staff'}</p>
                  </div>
                  {value == f.id && <CheckCircle size={11} className="text-blue-500" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const Department = () => {
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [activeTab, setActiveTab] = useState('Academic');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listSearch, setListSearch] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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

  const handleEditClick = (dept) => {
    setEditingId(dept.id);
    setEditFormData({
      name: dept.name,
      department_code: dept.department_code || '',
      hodId: dept.hodId || '',
      category: dept.category || '',
      roomNumber: dept.roomNumber || '',
      type: dept.type
    });
  };

  const handleUpdateDepartment = async (id) => {
    try {
      setIsSubmitting(true);
      const res = await api.put(`/admin/departments/${id}`, editFormData);
      if (res.data.success) {
        await fetchInitialData();
        setEditingId(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const res = await api.delete(`/admin/departments/${id}`);
      if (res.data.success) setDepartments(prev => prev.filter(d => d.id !== id));
    } catch { 
      alert('Delete failed. Department may be in use.'); 
    }
  };

  const filteredDepartments = useMemo(() => {
    return (Array.isArray(departments) ? departments : []).filter(d =>
      d.type === activeTab &&
      (d.name || '').toLowerCase().includes(listSearch.toLowerCase())
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
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left overflow-visible">
      <style>{`
        .form-input { width: 100%; padding: .575rem .875rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: .5rem; font-size: .8125rem; font-weight: 600; color: #1e293b; outline: none; transition: border-color .15s, background .15s; }
        .form-input:focus { border-color: #3b82f6; background: #fff; }
        .form-input::placeholder { color: #94a3b8; font-weight: 500; }
      `}</style>

      <div className="max-w-7xl mx-auto overflow-visible">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b border-gray-100 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
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

          <div className="p-6 overflow-visible">
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
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 rounded-t-xl">
                  <div className="col-span-4 text-[10px] font-black text-gray-400 uppercase">Department Name & Code</div>
                  <div className="col-span-3 text-[10px] font-black text-gray-400 uppercase">Head of Department</div>
                  <div className="col-span-2 text-[10px] font-black text-gray-400 uppercase">Category</div>
                  <div className="col-span-2 text-[10px] font-black text-gray-400 uppercase">Room</div>
                  <div className="col-span-1 text-right text-[10px] font-black text-gray-400 uppercase">Actions</div>
                </div>

                <div className="divide-y divide-gray-100 overflow-visible">
                  {filteredDepartments.map(dept => (
                    <div key={dept.id} className="overflow-visible relative">
                      {editingId === dept.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 items-center bg-blue-50/30 overflow-visible">
                          <div className="md:col-span-4 flex gap-2">
                            <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="form-input" placeholder="Name" />
                            <input type="text" value={editFormData.department_code} onChange={e => setEditFormData({...editFormData, department_code: e.target.value})} className="form-input w-24" placeholder="Code" />
                          </div>
                          <div className="md:col-span-3 overflow-visible">
                            <HodDropdown faculty={eligibleFaculty} value={editFormData.hodId} onChange={v => setEditFormData({...editFormData, hodId: v})} />
                          </div>
                          <div className="md:col-span-2">
                            <select value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="form-input">
                              <option value="">Select...</option>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <input type="text" value={editFormData.roomNumber} onChange={e => setEditFormData({...editFormData, roomNumber: e.target.value})} className="form-input" placeholder="Room" />
                          </div>
                          <div className="md:col-span-1 flex items-center justify-end gap-1">
                            <button onClick={() => handleUpdateDepartment(dept.id)} className="p-1.5 text-green-600 hover:bg-green-100 rounded transition" title="Save">
                              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded transition" title="Cancel">
                              <XCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                          <div className="col-span-4">
                            <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase">{dept.department_code || 'No Code'}</p>
                          </div>
                          <div className="col-span-3">
                            {dept.hod_name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white uppercase">
                                  {/* Safely splits name to get up to 2 initials (e.g. JS) */}
                                  {dept.hod_name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                                </div>
                                <span className="text-xs text-slate-700 font-bold">{dept.hod_name}</span>
                              </div>
                            ) : <span className="text-gray-400 text-xs italic font-medium">Unassigned</span>}
                          </div>
                          <div className="col-span-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase tracking-wider">{dept.category}</span>
                          </div>
                          <div className="col-span-2 text-xs font-bold text-slate-500">{dept.roomNumber || '—'}</div>
                          <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(dept)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDelete(dept.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredDepartments.length === 0 && <div className="p-12 text-center text-gray-400 text-xs font-bold italic text-left">No departments found in this category.</div>}
                </div>

                {/* Inline Add Form */}
                <div className="p-5 bg-slate-50 border-t border-gray-200 rounded-b-xl overflow-visible">
                  <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end overflow-visible">
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
                    <div className="md:col-span-2 overflow-visible">
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
};