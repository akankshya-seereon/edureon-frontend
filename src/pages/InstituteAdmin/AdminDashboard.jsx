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

// --- Auth Helper ---
const getAuthHeaders = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user?.token || user?.data?.token;
  }
  return { headers: { Authorization: `Bearer ${token}` } };
};

// --- Currency Formatter (Turns 1500000 into "15.0L") ---
const formatCurrency = (amount) => {
  if (!amount) return "0";
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toString();
};

// --- Card Component ---
const CustomStatCard = ({ title, value, subtext, icon: Icon, color }) => {
  const bgClass = color === 'purple' ? 'bg-[#ECECF9]' : 'bg-[#FFF4E5]'; 

  return (
    <div className={`${bgClass} p-6 rounded-xl flex flex-col justify-between h-40`}>
      <div className="flex justify-between items-start">
        <span className="text-gray-700 font-medium">{title}</span>
        <Icon className="text-gray-700" size={20} />
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-md text-gray-500 mt-1">{subtext}</p>
      </div>
    </div>
  );
};

// --- Exam Item Component ---
const ExamItem = ({ exam }) => (
  <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl mb-3">
    <div className="bg-green-100 p-3 rounded-full text-green-600">
      <Calendar size={20} />
    </div>
    <div>
      <h4 className="font-bold text-gray-800">{exam.subject}</h4>
      <p className="text-md text-gray-500">{exam.course}</p>
      <p className="text-md text-gray-500">{exam.date} • {exam.time}</p>
    </div>
  </div>
);

// --- MAIN PAGE COMPONENT ---
const AdminDashboard = () => {
  // 1. Setup State for Real Data
  const [stats, setStats] = useState({
    faculties: 0, pending: 0, students: 0, feesCollected: 0, feesDue: 0, attendance: "0%"
  });
  const [chartData, setChartData] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch Data from Backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/dashboard/summary", getAuthHeaders());
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
    return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-gray-500 font-bold text-lg">Loading Dashboard...</p></div>;
  }

  return (
    <div className="bg-white min-h-screen font-sans">
      <main>
        
        {/* 6 Stats Cards Grid */}
        <div className="grid grid-cols-1 text-lg md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <CustomStatCard title="Total Faculties" value={stats.faculties}  subtext="All registered Faculties" icon={Users} color="purple" />
          <CustomStatCard title="Pending Approvals" value={stats.pending} subtext="Currently active" icon={Hourglass} color="beige" />
          <CustomStatCard title="Total Students" value={stats.students} subtext="All registered students" icon={GraduationCap} color="purple" />
          <CustomStatCard title="Fees Collected" value={formatCurrency(stats.feesCollected)} subtext="Total Collected" icon={DollarSign} color="beige" />
          <CustomStatCard title="Fees Due" value={formatCurrency(stats.feesDue)} subtext="Due collection" icon={DollarSign} color="purple" />
          <CustomStatCard title="Today's Attendance" value={stats.attendance} subtext="Attendance" icon={MessageSquare} color="beige" />
        </div>

        {/* Bottom Section: Chart & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Chart */}
<div className="lg:col-span-2 border border-gray-100 rounded-2xl p-6 shadow-sm bg-white">
  <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
  
  {/* 🎯 FIXED WRAPPER: Explicit height prevents the -1 measurement warning */}
  <div className="w-full min-w-0" style={{ height: 300 }}> 
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af'}} />
        <Tooltip />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#2563eb" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorValue)" 
          isAnimationActive={true} // Re-enable animation now that the container is stable
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
</div>

          {/* Upcoming Exams List */}
          <div className="lg:col-span-1 border border-gray-100 rounded-2xl p-6 shadow-sm bg-white">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Exams</h3>
            <div className="flex flex-col h-72 overflow-y-auto pr-2">
              {exams.length > 0 ? (
                exams.map((exam, index) => (
                  <ExamItem key={index} exam={exam} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <p className="font-medium text-md">No upcoming exams</p>
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