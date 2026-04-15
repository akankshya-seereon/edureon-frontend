import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BookOpen, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const FacultyDashboard = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Professor");
  const [dashboardData, setDashboardData] = useState({
    stats: { totalClasses: 0, remainingClasses: 0, totalStudents: 0, pendingAttendance: 0 },
    schedule: [],
    notices: [],
    pendingAction: null // e.g., { course: "Algorithms", time: "10:15 AM" }
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // 🎯 1. WE DELETED THE LOCALSTORAGE TOKEN CHECK HERE!

        // 2. Get user name from local storage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          setUserName(userObj.name || "Professor");
        }

        // 3. Fetch Dashboard Data from Backend
        // 🎯 Note: We don't need the "Authorization: Bearer" header here anymore
        // because axios will automatically send the Cookie thanks to `withCredentials: true` in api.js!
        const response = await axios.get("http://localhost:5000/api/faculty/dashboard", {
            withCredentials: true // Ensures the cookie goes with the request
        });

        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error.response?.data || error.message);
        // If it's a 401, your api.js interceptor will handle the logout!
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  // --- RENDER HELPERS ---
  if (loading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium tracking-wide animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // Map dynamic numbers to the UI structure (Keeping your colors and icons)
  const statsList = [
    { 
      title: "Today's Classes", 
      value: dashboardData.stats.totalClasses, 
      subtext: `${dashboardData.stats.remainingClasses} Remaining`, 
      icon: BookOpen, 
      color: "bg-blue-50 text-blue-600" 
    },
    { 
      title: "Total Students", 
      value: dashboardData.stats.totalStudents, 
      subtext: "Across assigned batches", 
      icon: Users, 
      color: "bg-purple-50 text-purple-600" 
    },
    { 
      title: "Pending Attendance", 
      value: dashboardData.stats.pendingAttendance, 
      subtext: dashboardData.stats.pendingAttendance > 0 ? "Action Required" : "All Caught Up", 
      icon: AlertCircle, 
      color: dashboardData.stats.pendingAttendance > 0 ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600" 
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Faculty Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back, {userName}</p>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Today</p>
           <p className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statsList.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.title}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
            </div>
            <div className={`p-4 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Today's Schedule */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={20} className="text-slate-500" /> Today's Schedule
            </h3>
            <button 
              onClick={() => navigate("/faculty/classes")}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {dashboardData.schedule.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-medium">No classes scheduled for today.</p>
              </div>
            ) : (
              dashboardData.schedule.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="min-w-35">
                    <span className="block text-sm font-bold text-slate-800">{item.time.split(" - ")[0]}</span>
                    <span className="block text-xs text-slate-500">to {item.time.split(" - ")[1] || "..."}</span>
                  </div>
                  
                  <div className="flex-1 border-l-0 sm:border-l-2 border-slate-200 pl-0 sm:pl-4">
                    <h4 className="font-bold text-slate-800 text-lg sm:text-base">{item.subject}</h4>
                    <p className="text-sm text-slate-700 flex items-center gap-2">
                      {item.course} 
                      <span className="w-1 h-1 bg-slate-500 rounded-full"></span> 
                      {item.room}
                    </p>
                  </div>

                  <div className="mt-2 sm:mt-0">
                     {item.status === "Completed" ? (
                       <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                         <CheckCircle size={14} /> Done
                       </span>
                     ) : (
                       <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                         <Clock size={14} /> {item.status}
                       </span>
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Quick Actions & Notices */}
        <div className="space-y-6">
          
          {/* Action Card (Only shows if there is a pending action) */}
          {dashboardData.pendingAction && (
            <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Attendance Pending</h3>
                <p className="text-blue-100 text-sm mb-6">
                  You haven't marked attendance for <br/>
                  <span className="font-bold text-white">{dashboardData.pendingAction.course} ({dashboardData.pendingAction.time})</span> yet.
                </p>
                <button 
                  onClick={() => navigate("/faculty/attendance")}
                  className="w-full py-2.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                >
                  Take Attendance Now
                </button>
              </div>
              <Clock size={120} className="absolute -right-6 -bottom-6 text-white opacity-10" />
            </div>
          )}

          {/* Notices Widget */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-800 uppercase mb-4 tracking-wider">Faculty Notice Board</h3>
             <div className="space-y-4">
               {dashboardData.notices.length === 0 ? (
                 <p className="text-sm text-slate-500 italic">No new notices.</p>
               ) : (
                 dashboardData.notices.map((notice, idx) => (
                   <div key={idx} className={`p-3 rounded-lg border ${notice.type === 'alert' ? 'bg-yellow-50 border-yellow-100' : 'bg-slate-50 border-slate-100'}`}>
                     <p className={`text-xs font-bold mb-1 ${notice.type === 'alert' ? 'text-yellow-800' : 'text-slate-700'}`}>
                       {notice.type === 'alert' ? '⚠️ ' : '📅 '} {notice.title}
                     </p>
                     <p className={`text-xs leading-relaxed ${notice.type === 'alert' ? 'text-yellow-700' : 'text-slate-600'}`}>
                       {notice.message}
                     </p>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}; 