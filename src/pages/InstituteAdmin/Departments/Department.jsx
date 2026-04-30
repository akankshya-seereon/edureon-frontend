import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  Trash2, Plus, Loader2, Search,
  Building2, ChevronDown, User, CheckCircle2, X, Edit, Save, XCircle, MapPin, AlertCircle
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

const FALLBACK_BUILDINGS = [
  { id: 'east',  name: 'East Block'  },
  { id: 'west',  name: 'West Block'  },
  { id: 'north', name: 'North Block' },
  { id: 'south', name: 'South Block' },
  { id: 'main',  name: 'Main Block'  },
];

const BLOCKS = ['A', 'B', 'C', 'D', 'E'];
const FLOORS = [
  { value: 'Ground', label: 'Ground Floor' },
  { value: '1',      label: '1st Floor'    },
  { value: '2',      label: '2nd Floor'    },
  { value: '3',      label: '3rd Floor'    },
  { value: '4',      label: '4th Floor'    },
];

// ─── SEARCHABLE HOD DROPDOWN ──────────────────────────────────────────────────
function HodDropdown({ faculty, value, onChange }) {
  const [open, setOpen]     = useState(false);
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
      const full = `${f.firstName} ${f.lastName}`.toLowerCase();
      return full.includes(q) || (f.employeeId || '').toLowerCase().includes(q);
    });
  }, [faculty, search]);

  const selected = (Array.isArray(faculty) ? faculty : []).find(f => f.id == value);
  const label    = selected ? `${selected.firstName} ${selected.lastName || ''}`.trim() : null;

  return (
    <div ref={ref} className="relative w-full overflow-visible">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="form-input flex items-center justify-between gap-2 cursor-pointer hover:border-blue-400 hover:bg-white transition text-left"
        style={{ height: '38px' }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {label ? (
            <>
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white shrink-0 uppercase">
                {selected.firstName?.[0]}{selected.lastName?.[0]}
              </div>
              <span className="truncate text-gray-800 font-bold text-xs">{label}</span>
            </>
          ) : (
            <>
              <User size={13} className="text-gray-400 shrink-0" />
              <span className="text-gray-400 font-medium text-xs italic">Assign HOD (Optional)</span>
            </>
          )}
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden left-0">
          <div className="p-2 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-blue-400"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-red-50 transition text-xs border-b border-gray-50 ${!value ? 'bg-blue-50/50' : ''}`}
            >
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={11} className="text-red-400" />
              </div>
              <span className="italic text-red-400 font-bold flex-1">Leave Unassigned</span>
            </button>
            {filtered.length === 0 && (
              <p className="text-center text-xs text-gray-400 italic py-4">No staff found</p>
            )}
            {filtered.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => { onChange(f.id); setOpen(false); setSearch(''); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 transition border-b border-gray-50 ${value == f.id ? 'bg-blue-50/50' : ''}`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 shrink-0 uppercase">
                  {f.firstName?.[0]}{f.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{f.firstName} {f.lastName}</p>
                  <p className="text-[10px] text-gray-400 truncate">{f.designation || 'Staff'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400">
      <Building2 size={36} className="text-gray-200" />
      <p className="text-sm font-bold text-gray-400">No {tab} departments found</p>
      <p className="text-xs text-gray-300">Add one using the form below.</p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const Department = () => {
  const [departments,  setDepartments]  = useState([]);
  const [faculty,      setFaculty]      = useState([]);
  const [buildings,    setBuildings]    = useState(FALLBACK_BUILDINGS);
  const [activeTab,    setActiveTab]    = useState('Academic');
  const [loading,      setLoading]      = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listSearch,   setListSearch]   = useState('');
  const [toast,        setToast]        = useState(null);
  const [editingId,    setEditingId]    = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [formData, setFormData] = useState({
    name: '', department_code: '', hodId: '', category: '', type: 'Academic', noOfRooms: '',
  });

  const [assignForm, setAssignForm] = useState({
    departmentId: '', building: '', block: '', floor: '', room: '', type: 'Classroom',
  });

  // ── Toast helper ──
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch all initial data ──
  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [deptsRes, empRes, bldgRes] = await Promise.allSettled([
        api.get('/admin/departments'),
        api.get('/admin/employees/list'),
        api.get('/admin/departments/buildings'),
      ]);

      // Departments
      if (deptsRes.status === 'fulfilled') {
        const data = deptsRes.value.data?.data;
        setDepartments(Array.isArray(data) ? data : []);
      } else {
        console.error('Departments fetch failed:', deptsRes.reason?.message);
        showToast('error', 'Could not load departments.');
      }

      // Employees / Faculty
      if (empRes.status === 'fulfilled') {
        const data = empRes.value.data?.data;
        setFaculty(Array.isArray(data) ? data : []);
      } else {
        console.warn('Employees fetch failed:', empRes.reason?.message);
      }

      // Buildings — use real data if available, else keep fallback
      if (bldgRes.status === 'fulfilled') {
        const data = bldgRes.value.data?.data;
        if (Array.isArray(data) && data.length > 0) {
          setBuildings(data);
        }
      } else {
        console.info('ℹ️ Buildings endpoint failed — using fallback buildings.');
      }

    } catch (err) {
      console.error('Critical fetch error:', err);
      showToast('error', 'Something went wrong loading data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // ── Add department ──
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return showToast('error', 'Department name is required.');
    if (!formData.category)    return showToast('error', 'Please select a category.');

    try {
      setIsSubmitting(true);
      const payload = {
        name:            formData.name.trim(),
        department_code: formData.department_code.trim(),
        hodId:           formData.hodId || null,
        category:        formData.category,
        type:            activeTab,
        roomNumber:      formData.noOfRooms || null,
        noOfRooms:       formData.noOfRooms || null,
      };
      const res = await api.post('/admin/departments', payload);
      if (res.data.success) {
        await fetchInitialData();
        setFormData({ name: '', department_code: '', hodId: '', category: '', type: activeTab, noOfRooms: '' });
        showToast('success', 'Department added successfully!');
      } else {
        showToast('error', res.data.message || 'Failed to add department.');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit handlers ──
  const handleEditClick = (dept) => {
    setEditingId(dept.id);
    setEditFormData({
      name:            dept.name || '',
      department_code: dept.department_code || '',
      hodId:           dept.hodId || '',
      category:        dept.category || '',
      noOfRooms:       dept.noOfRooms || dept.roomNumber || '',
      type:            dept.type,
    });
  };

  const handleUpdateDepartment = async (id) => {
    if (!editFormData.name.trim()) return showToast('error', 'Department name is required.');
    try {
      setIsSubmitting(true);
      const payload = {
        ...editFormData,
        hodId:      editFormData.hodId || null,
        roomNumber: editFormData.noOfRooms || null,
      };
      const res = await api.put(`/admin/departments/${id}`, payload);
      if (res.data.success) {
        await fetchInitialData();
        setEditingId(null);
        showToast('success', 'Department updated!');
      } else {
        showToast('error', res.data.message || 'Failed to update.');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) return;
    try {
      const res = await api.delete(`/admin/departments/${id}`);
      if (res.data.success) {
        setDepartments(prev => prev.filter(d => d.id !== id));
        showToast('success', 'Department deleted.');
      } else {
        showToast('error', res.data.message || 'Could not delete.');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete department.');
    }
  };

  // ── Assign room ──
  const handleAssignRoom = async (e) => {
    e.preventDefault();
    if (!assignForm.departmentId) return showToast('error', 'Please select a department.');
    if (!assignForm.room.trim())  return showToast('error', 'Please provide a room number.');

    try {
      setIsSubmitting(true);
      const payload = {
        departmentId: Number(assignForm.departmentId),
        building:     assignForm.building || null,
        block:        assignForm.block    || null,
        floor:        assignForm.floor    || null,
        room:         assignForm.room.trim(),
        type:         assignForm.type     || 'Classroom',
      };
      const res = await api.post('/admin/departments/assign-room', payload);
      if (res.data.success) {
        showToast('success', res.data.message || 'Room assigned successfully!');
        setAssignForm({ departmentId: '', building: '', block: '', floor: '', room: '', type: 'Classroom' });
        fetchInitialData();
      } else {
        showToast('error', res.data.message || 'Failed to assign room.');
      }
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to assign room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived lists ──
  const filteredDepartments = useMemo(() =>
    (Array.isArray(departments) ? departments : []).filter(d =>
      d.type === activeTab &&
      (d.name || '').toLowerCase().includes(listSearch.toLowerCase())
    ),
  [departments, activeTab, listSearch]);

  const eligibleFaculty = useMemo(() =>
    (Array.isArray(faculty) ? faculty : []).filter(f => f.staffType === activeTab),
  [faculty, activeTab]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left overflow-visible relative">
      <style>{`
        .form-input {
          width: 100%;
          padding: .575rem .875rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: .5rem;
          font-size: .8125rem;
          font-weight: 600;
          color: #1e293b;
          outline: none;
          transition: all .15s;
        }
        .form-input:focus {
          border-color: #3b82f6;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }
      `}</style>

      {/* ── Floating Toast ── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-sm font-bold border
            ${toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}
          style={{ zIndex: 9999 }}
        >
          {toast.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto overflow-visible space-y-6">

        {/* ── DEPARTMENTS CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">

          {/* Header */}
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
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setEditingId(null); setListSearch(''); }}
                  className={`px-5 py-1.5 rounded-md text-xs font-bold transition-all
                    ${activeTab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t} ({departments.filter(d => d.type === t).length})
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-visible">
            {/* List header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-tight">{activeTab} List</h3>
              <div className="relative w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter list…"
                  value={listSearch}
                  onChange={e => setListSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-blue-300"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-gray-400 font-bold italic">
                <Loader2 className="animate-spin text-blue-500" size={20} /> Loading…
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-visible bg-white">
                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 rounded-t-xl text-[10px] font-black text-gray-400 uppercase tracking-wider">
                  <div className="col-span-4">Department Name &amp; Code</div>
                  <div className="col-span-3">Head of Department</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-2">Rooms</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-100 overflow-visible">
                  {filteredDepartments.length === 0 && !loading && (
                    <EmptyState tab={activeTab} />
                  )}

                  {filteredDepartments.map(dept => (
                    <div key={dept.id} className="overflow-visible relative">
                      {editingId === dept.id ? (
                        /* ── EDIT ROW ── */
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-4 items-center bg-blue-50/40 overflow-visible">
                          <div className="md:col-span-4 flex gap-2">
                            <input
                              type="text"
                              value={editFormData.name}
                              onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                              className="form-input"
                              placeholder="Dept Name"
                            />
                            <input
                              type="text"
                              value={editFormData.department_code}
                              onChange={e => setEditFormData({ ...editFormData, department_code: e.target.value })}
                              className="form-input w-24"
                              placeholder="Code"
                            />
                          </div>
                          <div className="md:col-span-3 overflow-visible">
                            <HodDropdown
                              faculty={eligibleFaculty}
                              value={editFormData.hodId}
                              onChange={v => setEditFormData({ ...editFormData, hodId: v })}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <select
                              value={editFormData.category}
                              onChange={e => setEditFormData({ ...editFormData, category: e.target.value })}
                              className="form-input"
                              style={{ height: '38px' }}
                            >
                              <option value="">Select…</option>
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <input
                              type="number"
                              min="0"
                              value={editFormData.noOfRooms}
                              onChange={e => setEditFormData({ ...editFormData, noOfRooms: e.target.value })}
                              className="form-input"
                              placeholder="No. Rooms"
                            />
                          </div>
                          <div className="md:col-span-1 flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleUpdateDepartment(dept.id)}
                              disabled={isSubmitting}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition disabled:opacity-50"
                            >
                              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 text-gray-400 hover:bg-gray-200 rounded transition"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── VIEW ROW ── */
                        <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors group">
                          <div className="col-span-4">
                            <p className="text-sm font-bold text-slate-800">{dept.name}</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase">{dept.department_code || 'No Code'}</p>
                          </div>
                          <div className="col-span-3">
                            {dept.hod_name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white uppercase">
                                  {dept.hod_name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <span className="text-xs text-slate-700 font-bold">{dept.hod_name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-xs italic font-medium">Unassigned</span>
                            )}
                          </div>
                          <div className="col-span-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded uppercase tracking-wider">
                              {dept.category || 'General'}
                            </span>
                          </div>
                          
                          {/* ── 🚀 ROOMS COLUMN UPDATED WITH BEAUTIFUL TAGS ── */}
                          <div className="col-span-2 flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {dept.calculated_room_count || 0} Rooms Assigned
                            </span>
                            
                            {dept.assigned_rooms ? (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {/* Split the comma-separated string and map it into badges */}
                                {dept.assigned_rooms.split(',').map((roomNumber, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded animate-fade-in text-[9px] font-black uppercase"
                                  >
                                    {roomNumber.trim()}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 mt-1 italic">
                                No rooms allocated
                              </span>
                            )}
                          </div>
                          
                          <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(dept)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(dept.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* ── ADD FORM ── */}
                <div className="p-5 bg-slate-50 border-t border-gray-200 rounded-b-xl overflow-visible">
                  <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end overflow-visible">
                    <div className="md:col-span-3">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Dept Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={formData.name}
                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Dept Code</label>
                      <input
                        type="text"
                        placeholder="CS-101"
                        value={formData.department_code}
                        onChange={e => setFormData(f => ({ ...f, department_code: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="md:col-span-3 overflow-visible">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Assign HOD</label>
                      <HodDropdown
                        faculty={eligibleFaculty}
                        value={formData.hodId}
                        onChange={v => setFormData(f => ({ ...f, hodId: v }))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Category *</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                        className="form-input"
                        style={{ height: '38px' }}
                        required
                      >
                        <option value="">Select…</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Rooms</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="5"
                        value={formData.noOfRooms}
                        onChange={e => setFormData(f => ({ ...f, noOfRooms: e.target.value }))}
                        className="form-input"
                      />
                    </div>
                    <div className="md:col-span-1" style={{ height: '38px' }}>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-[11px] font-black rounded-lg transition-all shadow-md"
                      >
                        {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                        ADD
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── ASSIGN ROOMS CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-slate-50/50 rounded-t-2xl">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <MapPin size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Assign Rooms</h2>
              <p className="text-xs text-gray-400 font-medium">Allocate specific building rooms to a department.</p>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleAssignRoom} className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
              {/* Department */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Department *</label>
                <select
                  value={assignForm.departmentId}
                  onChange={e => setAssignForm({ ...assignForm, departmentId: e.target.value })}
                  className="form-input"
                  style={{ height: '38px' }}
                  required
                >
                  <option value="">Select Dept</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Building — real data from API or fallback */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Building</label>
                <select
                  value={assignForm.building}
                  onChange={e => setAssignForm({ ...assignForm, building: e.target.value })}
                  className="form-input"
                  style={{ height: '38px' }}
                >
                  <option value="">Select Building</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Block</label>
                <select
                  value={assignForm.block}
                  onChange={e => setAssignForm({ ...assignForm, block: e.target.value })}
                  className="form-input"
                  style={{ height: '38px' }}
                >
                  <option value="">Select Block</option>
                  {BLOCKS.map(b => <option key={b} value={b}>Block {b}</option>)}
                </select>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Floor</label>
                <select
                  value={assignForm.floor}
                  onChange={e => setAssignForm({ ...assignForm, floor: e.target.value })}
                  className="form-input"
                  style={{ height: '38px' }}
                >
                  <option value="">Select Floor</option>
                  {FLOORS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Room Type</label>
                <select
                  value={assignForm.type}
                  onChange={e => setAssignForm({ ...assignForm, type: e.target.value })}
                  className="form-input"
                  style={{ height: '38px' }}
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Lab">Lab</option>
                  <option value="Office">Office</option>
                  <option value="Seminar Hall">Seminar Hall</option>
                  <option value="Conference Room">Conference Room</option>
                  <option value="Storage">Storage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Room number */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase">Room No. *</label>
                <input
                  type="text"
                  placeholder="e.g. 101"
                  value={assignForm.room}
                  onChange={e => setAssignForm({ ...assignForm, room: e.target.value })}
                  className="form-input"
                  style={{ height: '38px' }}
                  required
                />
              </div>

              {/* Submit */}
              <div style={{ height: '38px' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-full flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-[11px] font-black rounded-lg transition-all shadow-md"
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} strokeWidth={3} />}
                  ASSIGN
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};