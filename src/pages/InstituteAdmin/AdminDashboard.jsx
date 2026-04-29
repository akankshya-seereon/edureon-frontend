import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  DollarSign, 
  Hourglass,
  GraduationCap,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import apiBaseUrl from '../../config/baseurl.js';

// --- Auth Helper ---
const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  if (!token || token === "undefined") {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user?.token || user?.data?.token;
  }
  return { headers: { Authorization: `Bearer ${token}` } };
};

// --- Currency Formatter ---
const formatCurrency = (amount) => {
  const num = Number(amount) || 0; // Safe parsing
  if (num === 0) return "0";
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

// --- Card Component ---
const CustomStatCard = ({ title, value, subtext, icon: Icon, color }) => {
  const bgClass = color === 'purple' ? 'bg-indigo-50 border-indigo-100' : 'bg-orange-50 border-orange-100'; 
  const iconColor = color === 'purple' ? 'text-indigo-600' : 'text-orange-600';

  return (
    <div className={`${bgClass} p-6 rounded-2xl flex flex-col justify-between h-40 border shadow-sm hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start">
        <span className="text-gray-600 font-bold text-sm tracking-wide">{title}</span>
        <Icon className={iconColor} size={22} strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-4xl font-black text-gray-900 tracking-tight">{value}</h3>
        <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-widest">{subtext}</p>
      </div>
    </div>
  );
};

// --- Exam Item Component ---
const ExamItem = ({ exam }) => {
  // Safe date formatter
  const formattedDate = exam.date ? new Date(exam.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'TBA';
  
  return (
    <div className="flex items-center gap-4 bg-gray-50 hover:bg-blue-50/50 transition-colors p-4 rounded-xl border border-gray-100 mb-3">
      <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
        <Calendar size={20} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-sm truncate">{exam.subject}</h4>
        <p className="text-xs font-semibold text-gray-500 truncate">{exam.course}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-bold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded-md">{formattedDate}</p>
        <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{exam.time || 'TBA'}</p>
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const AdminDashboard = () => {
  const [stats, setStats] = useState({
    faculties: 0, pending: 0, students: 0, feesCollected: 0, feesDue: 0, attendance: "0%"
  });
  const [chartData, setChartData] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const config = getAuthHeaders();
        if (!config.headers.Authorization) return; // Prevent 401s if no token

        const res = await axios.get(`${apiBaseUrl}/admin/dashboard/summary`, config);
        
        if (res.data.success) {
          setStats(res.data.stats);
          setChartData(res.data.chartData);
          setExams(res.data.exams);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-500 font-bold mt-4 uppercase tracking-widest text-sm">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-6 text-left">
      <main className="max-w-8xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Institute Overview</h1>
            <p className="text-sm font-semibold text-gray-500 mt-1">Here is what's happening today.</p>
        </div>

        {/* 6 Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <CustomStatCard title="Total Faculties" value={stats.faculties}  subtext="All registered Faculties" icon={Users} color="purple" />
          <CustomStatCard title="Pending Approvals" value={stats.pending} subtext="Currently active" icon={Hourglass} color="beige" />
          <CustomStatCard title="Total Students" value={stats.students} subtext="All registered students" icon={GraduationCap} color="purple" />
          <CustomStatCard title="Fees Collected" value={formatCurrency(stats.feesCollected)} subtext="Total Collected" icon={DollarSign} color="beige" />
          <CustomStatCard title="Fees Due" value={formatCurrency(stats.feesDue)} subtext="Due collection" icon={DollarSign} color="purple" />
          
          {/* 🚀 Shows real attendance percentage now */}
          <CustomStatCard title="Today's Attendance" value={stats.attendance || "0%"} subtext="Present Students" icon={MessageSquare} color="beige" />
        </div>

        {/* Bottom Section: Chart & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Activity Chart */}
          <div className="lg:col-span-2 border border-gray-200 rounded-3xl p-7 shadow-sm bg-white">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Revenue Activity</h3>
            <div className="w-full min-w-0" style={{ height: 320 }}> 
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontWeight: 'bold' }}
                    itemStyle={{ color: '#2563eb' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    isAnimationActive={true} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Exams List */}
          <div className="lg:col-span-1 border border-gray-200 rounded-3xl p-7 shadow-sm bg-white flex flex-col">
            <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-wider">Upcoming Exams</h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {exams.length > 0 ? (
                exams.map((exam, index) => (
                  <ExamItem key={index} exam={exam} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                  <span className="text-5xl mb-3">📭</span>
                  <p className="font-bold text-sm uppercase tracking-widest">No upcoming exams</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;