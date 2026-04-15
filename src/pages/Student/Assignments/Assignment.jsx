import React, { useEffect, useState } from "react";
import axios from "axios";
import { ClipboardList, Calendar, CheckCircle2, Clock, ChevronRight, Loader } from "lucide-react";

// 🎯 NEW HELPER: Safely gets the token without sending "undefined" causing 401 errors
const getAuthConfig = () => {
  let token = localStorage.getItem("token");
  if (!token || token === "undefined") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      token = userObj?.token;
    } catch (e) {}
  }
  
  const config = { withCredentials: true }; // Ensures cookies are sent!
  
  // Only attach the header if a real token exists
  if (token && token !== "undefined" && token !== "null") {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return config;
};

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // 🎯 Using the safe auth config here to prevent 401 errors!
        const res = await axios.get("http://localhost:5000/api/student/assignments/my-assignments", getAuthConfig());
        
        // Checking for either res.data.data or res.data.assignments based on your controller
        if (res.data.success) {
          setAssignments(res.data.data || res.data.assignments || []);
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center gap-4">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Coursework...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-10xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="mb-10 text-left">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assignments</h1>
        <p className="text-slate-500 font-bold mt-2">Manage and submit your coursework</p>
      </div>

      <div className="grid gap-6">
        {assignments.length > 0 ? (
          assignments.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="flex items-start gap-6 flex-1 text-left">
                <div className={`p-4 rounded-2xl ${item.status === 'Submitted' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                  <ClipboardList size={24} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">
                    {item.subject_name || "General"}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 mt-1">{item.title}</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1 line-clamp-1">{item.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 w-full md:w-auto">
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> Due Date
                  </p>
                  <p className="font-bold text-slate-700">
                    {item.due_date ? new Date(item.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "No due date"}
                  </p>
                </div>

                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${
                  item.status === 'Submitted' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                  : 'bg-orange-50 border-orange-100 text-orange-600'
                }`}>
                  {item.status === 'Submitted' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                  <span className="text-xs font-black uppercase tracking-widest">{item.status || "Pending"}</span>
                </div>

                <button className="bg-slate-900 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 bg-slate-50 rounded-[2rem]">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-black text-lg">No Assignments Yet!</p>
            <p className="text-slate-400 text-sm mt-1">Enjoy your free time, your teachers haven't assigned anything.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;