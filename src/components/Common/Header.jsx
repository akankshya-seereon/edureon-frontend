import React from 'react';
import { Bell, Search, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

export const Header = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Safe Data Extraction
  const userName = user?.first_name || user?.name || "Guest";
  const userRole = user?.role?.replace(/_/g, " ") || "Institute Admin";

  // 2. Impersonation Logic (God Mode)
  const isImpersonating = !!localStorage.getItem("managed_institute_id");
  const managedName = localStorage.getItem("managed_institute_name") || "Institute";

  const handleExitImpersonation = () => {
    localStorage.removeItem("managed_institute_id");
    localStorage.removeItem("managed_institute_name");
    navigate('/superadmin/dashboard');
  };

  // 3. Dynamic Breadcrumb Logic
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Mapping URL segments to the exact labels in your ERP screenshots
  const breadcrumbMap = {
    'admin': 'SAMET',
    'employees': 'EMPLOYEE MASTER',
    'non-academic': 'NON-ACADEMIC',
    'academic': 'ACADEMIC',
    'infrastructure': 'INFRASTRUCTURE',
    'departments': 'DEPARTMENTS',
    'dashboard': 'DASHBOARD',
    'academic-programs': 'ACADEMIC PROGRAMS'
  };

  return (
    <div className="w-full flex flex-col relative z-50 shrink-0">
      
      {/* 🚩 THE GOD MODE BANNER */}
      {isImpersonating && (
        <div className="bg-rose-600 text-white px-8 py-2 flex items-center justify-between shadow-md relative z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="animate-pulse text-rose-200" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-50">
              God Mode <span className="font-medium text-white px-2 opacity-50">|</span> Managing: {managedName}
            </span>
          </div>
          <button 
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:scale-95 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
          >
            <XCircle size={12} /> Exit Mode
          </button>
        </div>
      )}

      {/* 🏛️ MAIN HEADER ROW */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 w-full">
        
        {/* 🌟 LEFT SIDE: Greeting & Breadcrumbs */}
        <div className="flex items-center gap-8">
          {/* User Info Block */}
          <div className="flex flex-col border-r border-slate-200 pr-8">
            <h1 className="text-lg font-black text-slate-800 leading-tight">
              Hi, {userName}
            </h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">
              {userRole}
            </p>
          </div>

          {/* 🚀 DYNAMIC BREADCRUMBS */}
          <nav className="hidden lg:flex items-center gap-2">
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;
              const label = breadcrumbMap[value.toLowerCase()] || value.replace(/-/g, ' ').toUpperCase();

              return (
                <div key={to} className="flex items-center gap-2">
                  {last ? (
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.15em]">
                      {label}
                    </span>
                  ) : (
                    <>
                      <Link
                        to={to}
                        className="text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-[0.15em] transition-colors"
                      >
                        {label}
                      </Link>
                      <ChevronRight size={10} className="text-slate-300 stroke-[4px]" />
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* 🔍 RIGHT SIDE: Tools & Profile */}
        <div className="flex items-center space-x-6">
          
          {/* Enhanced Search Bar */}
          <div className="hidden xl:flex items-center bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2 w-72 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all group">
            <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search data..." 
              className="bg-transparent border-none focus:outline-none text-xs font-bold ml-2 w-full text-slate-700 placeholder:text-slate-400 uppercase tracking-wider"
            />
          </div>

          {/* Icons Stack */}
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
          
          {/* Mini Profile Section */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 font-black uppercase text-sm border-2 border-white">
              {userName.charAt(0)}
            </div>
          </div>

        </div>
      </header>
    </div>
  );
};