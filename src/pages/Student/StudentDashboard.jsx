import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  CheckCircle, 
  AlertCircle, 
  Banknote, 
  ScanFace,
  FileText,
  CreditCard,
  BookOpen,
  Clock,
  UserCircle
} from "lucide-react";

// --- AUTH TOKEN HELPER ---
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    token = storedUser?.token || storedUser?.data?.token;
  }
  return token;
};

export const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    profile: {
      name: "",
      course: "",
      section: "",
      rollNo: ""
    },
    stats: {
      attendance: 0,
      pendingAssignments: 0,
      completedAssignments: 0,
      feeDue: 0,
      feeDueDate: ""
    },
    todayClasses: [],
    pendingAssignmentsList: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // Fetch data from your real backend API
        const response = await axios.get("http://localhost:5000/api/student/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="animate-spin mb-4"><Clock size={40} /></div>
        <p className="font-bold text-lg uppercase tracking-widest">Loading Dashboard...</p>
      </div>
    );
  }

  const { profile, stats, todayClasses, pendingAssignmentsList } = dashboardData;

  return (
    <div className="w-full max-w-10xl mx-auto pb-12">
      
      {/* 🌟 1. DYNAMIC HEADER SECTION */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
               Student Portal
             </span>
             <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">
               {profile.course} • Section {profile.section}
             </span>
           </div>
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">
             Hi, {profile.name.split(' ')[0]}! 👋
           </h1>
           <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-sm">
             Roll Number: <span className="text-blue-600">{profile.rollNo}</span>
           </p>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-4">
           <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
             <p className="text-sm font-bold text-emerald-600">Active Enrollment</p>
           </div>
           <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
             <CheckCircle size={20} />
           </div>
        </div>
      </div>

      {/* 2. STATS CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Attendance Card */}
        <div className="bg-[#EBEBFF] rounded-[1.5rem] p-6 relative min-h-[160px] flex flex-col justify-between group hover:shadow-xl hover:shadow-indigo-100 transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-800">Attendance</h3>
            <ScanFace size={24} className="text-slate-700" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight mb-3">{stats.attendance}%</div>
            <div className="w-full h-2.5 bg-white rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${stats.attendance}%` }}></div>
            </div>
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-[#FFF2E5] rounded-[1.5rem] p-6 relative min-h-[160px] flex flex-col justify-between group hover:shadow-xl hover:shadow-orange-100 transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-800">Pending</h3>
            <AlertCircle size={24} className="text-slate-700" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">
              {stats.pendingAssignments < 10 ? `0${stats.pendingAssignments}` : stats.pendingAssignments}
            </div>
            <p className="text-md font-bold text-slate-500 uppercase tracking-widest">Tasks Left</p>
          </div>
        </div>

        {/* Completed Assignments */}
        <div className="bg-[#E5F9FF] rounded-[1.5rem] p-6 relative min-h-[160px] flex flex-col justify-between group hover:shadow-xl hover:shadow-blue-100 transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-800">Completed</h3>
            <CheckCircle size={24} className="text-slate-700" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">
              {stats.completedAssignments < 10 ? `0${stats.completedAssignments}` : stats.completedAssignments}
            </div>
            <p className="text-md font-bold text-slate-500 uppercase tracking-widest">Tasks Done</p>
          </div>
        </div>

        {/* Fee Due */}
        <div className="bg-[#F0FFE5] rounded-[1.5rem] p-6 relative min-h-[160px] flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-100 transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-800">Fee Balance</h3>
            <Banknote size={24} className="text-slate-700" strokeWidth={1.5} />
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-slate-900 tracking-tight">₹{stats.feeDue}</div>
            {stats.feeDue > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md mb-2">
                Due {stats.feeDueDate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
           <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
           Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <QuickActionBtn icon={<ScanFace size={24} />} label="Mark Attendance" color="group-hover:text-blue-600" />
          <QuickActionBtn icon={<FileText size={24} />} label="Assignments" color="group-hover:text-purple-600" />
          <QuickActionBtn icon={<CreditCard size={24} />} label="Pay Fees" color="group-hover:text-emerald-600" />
          <QuickActionBtn icon={<BookOpen size={24} />} label="My Course" color="group-hover:text-orange-600" />
        </div>
      </div>

      {/* 4. BOTTOM LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Today's Classes */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={20} className="text-blue-500" /> Today's Classes
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date().toDateString()}</span>
          </div>
          
          <div className="space-y-4">
            {todayClasses.length > 0 ? (
              todayClasses.map((cls, index) => (
                <div key={index} className={`p-5 border border-slate-100 rounded-2xl flex justify-between items-center transition-all ${cls.status === 'Ongoing' ? 'bg-blue-50/50 border-blue-100 ring-1 ring-blue-100' : 'hover:bg-slate-50'}`}>
                   <div>
                      <h4 className="font-bold text-slate-800 text-lg">{cls.subject}</h4>
                      <p className="text-md text-slate-500 mt-1 flex items-center gap-2 font-medium">
                        {cls.time} <span className="text-slate-300">•</span> {cls.room}
                      </p>
                   </div>
                   <span className={`text-xs uppercase tracking-widest font-black px-4 py-1.5 rounded-full ${
                     cls.status === 'Ongoing' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'
                   }`}>
                     {cls.status}
                   </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Assignments List */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText size={20} className="text-purple-500" /> Pending Assignments
            </h3>
            <button className="text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {pendingAssignmentsList.length > 0 ? (
              pendingAssignmentsList.map((assignment, index) => (
                <div key={index} className="p-5 border border-slate-100 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-all group">
                   <div>
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{assignment.title}</h4>
                      <p className={`text-sm font-bold mt-1 flex items-center gap-1.5 uppercase tracking-wide ${
                        assignment.isUrgent ? 'text-red-500' : 'text-slate-400'
                      }`}>
                        {assignment.isUrgent && <AlertCircle size={14} />} Deadline: {assignment.deadline}
                      </p>
                   </div>
                   <button className="bg-slate-900 text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-95">
                     Submit
                   </button>
                </div>
              ))
            ) : (
              <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">You're all caught up! ✨</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const QuickActionBtn = ({ icon, label, color }) => (
  <button className="bg-white border border-slate-200 rounded-[1.5rem] py-8 flex flex-col items-center gap-3 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-300 transition-all active:scale-95 group">
    <div className={`text-slate-400 ${color} transition-all duration-300 group-hover:scale-110`}>
      {icon}
    </div>
    <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
      {label}
    </span>
  </button>
);