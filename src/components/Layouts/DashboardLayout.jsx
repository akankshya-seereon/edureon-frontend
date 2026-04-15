import React from 'react';
import { Outlet } from "react-router-dom";
import { Sidebar } from "../Common/Sidebar"; 
import { useAuth } from "../../hooks/useAuth"; 
import { Search, Bell } from 'lucide-react';

export const DashboardLayout = () => {
  const { user } = useAuth(); // ✅ Get dynamic user data

  // 🎯 FIXED: Create a single "Source of Truth" for the user's name.
  // It checks first_name (from DB) -> name -> fullName -> defaults to "User"
  const displayName = user?.first_name || user?.name || user?.fullName || "User";
  const displayRole = user?.role?.replace(/_/g, " ") || "Welcome";

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <Sidebar />

      {/* 2. MAIN WRAPPER */}
      <div className="flex-1 ml-72 flex flex-col h-full relative min-w-0 transition-all duration-300">
        
        {/* --- FIXED HEADER --- */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-20 shrink-0">
          
          {/* LEFT: Dynamic Greeting */}
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight capitalize">
              Hi, {displayName}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">
              {displayRole}
            </p>
          </div>

          {/* RIGHT: Global Actions */}
          <div className="flex items-center gap-6">
            
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-600"
              />
            </div>

            {/* Notification Bell */}
            <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            {/* Profile Avatar */}
            <div className="w-10 h-10 rounded-full bg-orange-100 overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all">
              <img 
                /* 🎯 FIXED: Now uses the unified displayName variable */
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
                alt="User Avatar" 
              />
            </div>
          </div>
        </header>

        {/* --- SCROLLABLE CONTENT AREA --- */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc] scroll-smooth">
          <Outlet />
        </main>

      </div>
    </div>
  );
};