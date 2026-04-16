import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader2, Users, Briefcase, GraduationCap, 
  Trash2, Mail, BadgeInfo, Edit, Eye, Plus
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl"; 

// ─── AXIOS CONFIGURATION ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const EmployeeDirectory = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Academic');

  // ─── FETCH EMPLOYEES ───
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/employees/list');
      if (res.data.success) {
        setEmployees(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ─── DELETE EMPLOYEE ───
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete ${name}?`)) return;
    
    try {
      const res = await api.delete(`/admin/employees/${id}`);
      if (res.data.success) {
        // Remove from UI without needing a page refresh
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        alert(`${name} has been successfully removed from the system.`);
      }
    } catch (err) {
      console.error("Delete Error:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete employee.";
      alert(`Cannot Delete: ${errorMessage}`);
    }
  };

  // ─── FILTER & SEARCH LOGIC ───
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesTab = emp.staffType === activeTab;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        (emp.firstName || '').toLowerCase().includes(searchLower) ||
        (emp.lastName || '').toLowerCase().includes(searchLower) ||
        (emp.email || '').toLowerCase().includes(searchLower) ||
        (emp.employeeId || '').toLowerCase().includes(searchLower) ||
        (emp.designation || '').toLowerCase().includes(searchLower);
      
      return matchesTab && matchesSearch;
    });
  }, [employees, activeTab, searchQuery]);

  // ─── CALCULATE STATS ───
  const totalCount = employees.length;
  const academicCount = employees.filter(e => e.staffType === 'Academic').length;
  const nonAcademicCount = employees.filter(e => e.staffType === 'Non-Academic').length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Master Directory</h1>
            <p className="text-sm font-medium text-slate-500 italic mt-1">Manage, view, and update all institutional staff members.</p>
          </div>
          <button 
            onClick={() => navigate('/admin/employees/register')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add New Employee
          </button>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Total Staff</p>
              <h3 className="text-3xl font-black text-gray-900">{totalCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><GraduationCap size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Academic Staff</p>
              <h3 className="text-3xl font-black text-gray-900">{academicCount}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Briefcase size={24} /></div>
            <div>
              <p className="text-sm font-bold text-gray-500">Non-Academic Staff</p>
              <h3 className="text-3xl font-black text-gray-900">{nonAcademicCount}</h3>
            </div>
          </div>
        </div>

        {/* ── MAIN TABLE CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50/50 gap-4">
            
            {/* Tabs */}
            <div className="flex gap-2 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              {['Academic', 'Non-Academic'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all outline-none ${
                    activeTab === tab ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Live Search */}
            <div className="relative w-full md:w-80">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID, or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Table Area */}
          <div className="overflow-x-auto min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={30} className="animate-spin text-blue-500" />
                <p className="text-sm font-bold text-gray-400 animate-pulse">Loading staff records...</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Employee Name</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Designation</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Employee ID</th>
                    <th className="px-6 py-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                        
                        {/* Name & Avatar */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-sm flex-shrink-0">
                              {(emp.firstName?.[0] || '')}{(emp.lastName?.[0] || '')}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{emp.firstName} {emp.lastName}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{emp.staffType}</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                            <Mail size={14} className="text-gray-400" />
                            {emp.email || <span className="text-gray-300 italic">No email</span>}
                          </div>
                        </td>

                        {/* Designation */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-[11px] font-black rounded-lg border ${
                            emp.staffType === 'Academic' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                          }`}>
                            {emp.designation || 'Staff'}
                          </span>
                        </td>

                        {/* Employee ID */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-xs font-mono font-bold text-slate-600 rounded-md border border-gray-200">
                            <BadgeInfo size={14} className="text-slate-400" />
                            {emp.employeeId || '—'}
                          </div>
                        </td>

                        {/* 🚀 ACTIONS: View, Edit, Delete */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Profile */}
                            <button 
                              onClick={() => navigate(`/admin/employees/profile/${emp.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors outline-none"
                              title="View Profile"
                            >
                              <Eye size={18} />
                            </button>
                            
                            {/* Edit Employee */}
                            <button 
                              onClick={() => navigate(`/admin/employees/edit/${emp.id}`)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors outline-none"
                              title="Edit Details"
                            >
                              <Edit size={18} />
                            </button>

                            {/* Delete Employee */}
                            <button 
                              onClick={() => handleDelete(emp.id, emp.firstName)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors outline-none"
                              title="Delete Staff"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <Users size={40} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700">No employees found.</h3>
                        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or switch tabs.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}