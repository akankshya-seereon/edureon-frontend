import { Outlet } from "react-router-dom";
import { Sidebar } from "../Common/Sidebar"; // I will provide this reusable component below
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  FileBarChart, 
  Settings,
  ShieldCheck 
} from "lucide-react";

export const SuperAdminLayout = () => {
  
  const superAdminLinks = [
    { label: "Dashboard", path: "/super-admin/dashboard", icon: LayoutDashboard },
    { label: "Institutes", path: "/super-admin/institutes", icon: Building2 },
    { label: "User Management", path: "/super-admin/users", icon: Users },
    { label: "System Reports", path: "/super-admin/reports", icon: FileBarChart },
    { label: "Platform Settings", path: "/super-admin/settings", icon: Settings },
  ];

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
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Optional: Top Header (Good for Search or Profile) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <h1 className="text-xl font-bold text-slate-800">Super Admin Portal</h1>
          <div className="text-sm text-slate-500">Welcome, Administrator</div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet /> {/* ✅ Pages render here */}
        </main>
      </div>
    </div>
  );
};