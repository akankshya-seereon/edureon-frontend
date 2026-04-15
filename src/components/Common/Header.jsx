import React from 'react';
import { Bell, Search, AlertTriangle, XCircle } from "lucide-react"; // 🚀 Added icons
import { useNavigate } from "react-router-dom"; // 🚀 Added navigation

export const Header = ({ user }) => {
  const navigate = useNavigate();

  // Safely extract the data, defaulting to "Guest" if missing
  const userName = user?.first_name || user?.name || "Guest";
  const userRole = user?.role?.replace(/_/g, " ") || "Student";

  // ==========================================
  // 🚀 IMPERSONATION STATE & LOGIC
  // ==========================================
  const isImpersonating = !!localStorage.getItem("managed_institute_id");
  const managedName = localStorage.getItem("managed_institute_name") || "Institute";

  const handleExitImpersonation = () => {
    // 1. Wipe the Ghost Header data
    localStorage.removeItem("managed_institute_id");
    localStorage.removeItem("managed_institute_name");
    
    // 2. Teleport back to Super Admin Hub
    navigate('/superadmin/dashboard'); 
  };
  // ==========================================

  return (
    <div className="w-full flex flex-col relative z-50">
      
      {/* 🚀 THE RED WARNING BANNER (Only shows in God Mode) */}
      {isImpersonating && (
        <div className="bg-rose-600 text-white px-8 py-2.5 flex items-center justify-between shadow-md relative z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="animate-pulse text-rose-200" />
            <span className="text-xs font-black uppercase tracking-widest text-rose-50">
              God Mode <span className="font-medium text-white px-2">|</span> Managing: "{managedName}"
            </span>
          </div>
          <button 
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border border-rose-500/50"
          >
            <XCircle size={14} /> Exit Mode
          </button>
        </div>
      )}

      {/* ORIGINAL HEADER */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 w-full shrink-0">
        
        {/* 🌟 LEFT SIDE: Dynamic Greeting */}
        <div className="text-left">
          <h1 className="text-2xl font-black text-slate-800 capitalize">
            Hi, {userName}
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {userRole}
          </p>
        </div>

        {/* RIGHT SIDE: Search, Notifications, and Profile */}
        <div className="flex items-center space-x-6">
          
          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-transparent border-none focus:outline-none text-sm font-medium ml-2 w-full text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {/* Notification Bell */}
          <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          {/* Profile Section */}
          <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-700 capitalize">{userName}</p>
            </div>
            {/* Dynamic Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 rounded-full flex items-center justify-center border-2 border-white shadow-sm font-black uppercase">
              {userName.charAt(0)}
            </div>
          </div>

        </div>
      </header>
    </div>
  );
};