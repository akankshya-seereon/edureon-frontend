import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "../Common/Sidebar"; 
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileBarChart, 
  Settings,
  ShieldCheck,
  LogOut 
} from "lucide-react";

export const SuperAdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🚀 Look for the ghost header ID to see if we are currently impersonating
  const managedInstituteId = localStorage.getItem('managed_institute_id');

  const superAdminLinks = [
    { label: "Dashboard", path: "/super-admin/dashboard", icon: LayoutDashboard },
    { label: "Institutes", path: "/super-admin/institutes", icon: Building2 },
    { label: "User Management", path: "/super-admin/users", icon: Users },
    { label: "System Reports", path: "/super-admin/reports", icon: FileBarChart },
    { label: "Platform Settings", path: "/super-admin/settings", icon: Settings },
  ];

  // 🚀 CRITICAL FIX: The global exit button
  const handleExitInstituteView = () => {
    localStorage.removeItem('managed_institute_id');
    localStorage.removeItem('managed_institute_name');
    
    // Force a hard reload to clear any lingering context in other tabs
    window.location.href = '/super-admin/dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* 2. Reusable Sidebar Component */}
      <Sidebar 
        links={superAdminLinks} 
        role="Super Admin" 
        roleIcon={ShieldCheck} 
      />

      {/* 3. Main Content Area */}
      {/* 'flex-1' allows this to take remaining width, 'flex-col' stacks header & content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Super Admin Portal</h1>
          
          <div className="flex items-center gap-4">
            {/* 🚀 Show the "Exit View" button globally if we are impersonating! */}
            {managedInstituteId && (
              <button 
                onClick={handleExitInstituteView}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors shadow-sm"
              >
                <LogOut size={16} /> Exit Institute View
              </button>
            )}
            <div className="text-sm text-slate-500 font-medium">Welcome, Administrator</div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet /> {/* ✅ Pages render here */}
        </main>
      </div>
    </div>
  );
};