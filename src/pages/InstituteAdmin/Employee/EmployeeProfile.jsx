import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Mail, Phone, BadgeInfo, 
  GraduationCap, Briefcase, Calendar, FileText, Loader2, Clock, Key
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/admin/employees/${id}`);
        if (res.data.success) {
          setEmployee(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch employee details", err);
        alert("Employee not found.");
        navigate('/admin/employees/directory'); 
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={40} className="animate-spin text-blue-600" />
          <p className="text-sm font-bold text-gray-500 animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const isAcademic = employee.staffType === 'Academic';

  // 🚀 DYNAMIC TABS: Changes based on Academic vs Non-Academic
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <BadgeInfo size={16} /> },
    { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
    ...(isAcademic 
      ? [
          { id: 'subjects', label: 'Assigned Subjects', icon: <GraduationCap size={16} /> },
          { id: 'timetable', label: 'Class Timetable', icon: <Calendar size={16} /> }
        ]
      : [
          { id: 'shift', label: 'Shift Schedule', icon: <Clock size={16} /> },
          { id: 'assets', label: 'Assigned Assets', icon: <Key size={16} /> }
        ]
    )
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <div className="max-w-8xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        {/* ── HEADER CARD ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-md flex-shrink-0">
            {(employee.firstName?.[0] || '')}{(employee.lastName?.[0] || '')}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-gray-900">{employee.firstName} {employee.lastName}</h1>
              <span className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-lg border inline-block ${isAcademic ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                {employee.staffType} Staff
              </span>
            </div>
            
            <p className="text-lg font-bold text-gray-500 mb-4">
              {employee.designation} • <span className="font-mono text-gray-400">{employee.employeeId}</span>
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5 text-sm font-semibold text-gray-600">
              <span className="flex items-center gap-2"><Mail size={16} className="text-gray-400"/> {employee.email}</span>
              <span className="flex items-center gap-2"><Phone size={16} className="text-gray-400"/> {employee.phone}</span>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button onClick={() => navigate(`/admin/employees/edit/${employee.id}`)} className="w-full md:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all">
              Edit Profile
            </button>
          </div>
        </div>

        {/* ── DYNAMIC TABS AREA ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-gray-100 hide-scrollbar bg-slate-50/50">
            {tabs.map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-bold whitespace-nowrap border-b-2 transition-all outline-none ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-white' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-6 md:p-8 min-h-[400px]">
            
            {/* 1. PERSONAL INFO TAB */}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div> Demographics
                  </h3>
                  <div className="space-y-5 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Gender</p><p className="text-sm font-semibold text-gray-900">{employee.gender || 'Not specified'}</p></div>
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Date of Birth</p><p className="text-sm font-semibold text-gray-900">{employee.dob?.split('T')[0] || 'Not specified'}</p></div>
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Blood Group</p><p className="text-sm font-semibold text-gray-900">{employee.bloodGroup || 'Not specified'}</p></div>
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Address</p><p className="text-sm font-semibold text-gray-900 leading-relaxed">{employee.address || 'Not specified'}</p></div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div> Employment Details
                  </h3>
                  <div className="space-y-5 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Highest Qualification</p><p className="text-sm font-semibold text-gray-900">{employee.qualification || 'Not specified'}</p></div>
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Joining Date</p><p className="text-sm font-semibold text-gray-900">{employee.joiningDate?.split('T')[0] || 'Not specified'}</p></div>
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">PAN Number</p><p className="text-sm font-mono font-bold text-gray-900 tracking-wider">{employee.panNumber || 'Not specified'}</p></div>
                    <div><p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Aadhaar Number</p><p className="text-sm font-mono font-bold text-gray-900 tracking-wider">{employee.aadhaarNumber || 'Not specified'}</p></div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. DOCUMENTS TAB */}
            {activeTab === 'documents' && (
               <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                 <FileText size={48} className="text-gray-200 mb-4" />
                 <h3 className="text-lg font-bold text-gray-700">Document Vault</h3>
                 <p className="text-sm text-gray-500 mt-1 max-w-md">View and download the PAN, Aadhaar, and degree certificates uploaded during registration.</p>
                 <button className="mt-6 px-6 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg hover:bg-blue-100 transition-colors">
                   View Uploaded Files
                 </button>
               </div>
            )}

            {/* ── ACADEMIC SPECIFIC TABS ── */}
            {activeTab === 'subjects' && isAcademic && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                <GraduationCap size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No Subjects Assigned Yet</h3>
                <p className="text-sm text-gray-500 mt-1">Go to the Syllabus master to assign subjects to this professor.</p>
              </div>
            )}
            
            {activeTab === 'timetable' && isAcademic && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                <Calendar size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Timetable Empty</h3>
                <p className="text-sm text-gray-500 mt-1">Weekly schedule will appear here once classes are assigned.</p>
              </div>
            )}

            {/* ── NON-ACADEMIC SPECIFIC TABS ── */}
            {activeTab === 'shift' && !isAcademic && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                <Clock size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Standard Shift Assigned</h3>
                <p className="text-sm font-black text-blue-600 mt-2 bg-blue-50 px-4 py-2 rounded-lg inline-block">9:00 AM - 5:00 PM (Mon-Fri)</p>
              </div>
            )}

            {activeTab === 'assets' && !isAcademic && (
              <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
                <Key size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-700">No Assets Assigned</h3>
                <p className="text-sm text-gray-500 mt-1">Laptops, keys, or IDs assigned to this staff member will appear here.</p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};