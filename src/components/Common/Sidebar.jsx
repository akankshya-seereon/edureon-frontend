import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, User, BookOpen, Clock, FileText,
  GraduationCap, CreditCard, Bell, Calendar, HelpCircle,
  Building2, Users, Settings, LogOut, ShieldCheck, Award,
  ArrowLeftCircle, Warehouse, Calculator, Wallet, Briefcase, PieChart,
  UserCheck, ClipboardList
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isImpersonating, impersonatedInstitute, stopImpersonation } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role || 'student';

  // ─── Nav Link Definitions ──────────────────────────────────────────────────

  const studentLinks = [
    { label: 'Dashboard',       path: '/student/dashboard',    icon: LayoutDashboard },
    { label: 'Profile',         path: '/student/profile',      icon: User },
    { label: 'My Courses',      path: '/student/courses',      icon: BookOpen },
    { label: 'Classes',         path: '/student/classes',      icon: Users },
    { label: 'Attendance',      path: '/student/attendance',   icon: Clock },
    { label: 'Assignments',     path: '/student/assignments',  icon: FileText },
    { label: 'Exams & Results', path: '/student/exams',        icon: GraduationCap },
    { label: 'Certificates',    path: '/student/certificates', icon: Award },
    { label: 'Fees',            path: '/student/fees',         icon: CreditCard },
    { label: 'Notifications',   path: '/student/notification', icon: Bell },
    { label: 'Calendar',        path: '/student/calendar',     icon: Calendar },
    { label: 'Help & Support',  path: '/student/help',         icon: HelpCircle },
  ];

  const facultyLinks = [
    { label: 'Dashboard',       path: '/faculty/dashboard',    icon: LayoutDashboard },
    { label: 'Profile',         path: '/faculty/profile',      icon: User },
    { label: 'My Classes',      path: '/faculty/classes',      icon: BookOpen },
    { label: 'Attendance',      path: '/faculty/attendance',   icon: Clock },
    { label: 'Courses',         path: '/faculty/courses',      icon: FileText },
    { label: 'Assignments',     path: '/faculty/assignments',  icon: GraduationCap },
    { label: 'Exams',           path: '/faculty/exams',        icon: CreditCard },
    { label: 'Certificates',    path: '/faculty/certificates', icon: Award },
    { label: 'Salary',          path: '/faculty/salary',       icon: CreditCard },
    { label: 'Leaves',          path: '/faculty/leaves',       icon: Bell },
    { label: 'Notifications',   path: '/faculty/notifications', icon: Bell },
    { label: 'Help & Support',  path: '/faculty/help',         icon: HelpCircle },
  ];

  const principalLinks = [
    { label: "Dashboard",         path: "/admin/principal",      icon: LayoutDashboard },
    { label: "Attendance",        path: "/admin/attendance",     icon: Clock },
    { label: "Academic Programs", path: "/admin/programs",       icon: BookOpen },
    { label: "Departments",       path: "/admin/departments",    icon: Briefcase },
    { label: "Syllabus",          path: "/admin/syllabus",       icon: ClipboardList },
    { label: "Employee Master",   path: "/admin/employees/directory", icon: UserCheck },
    { label: "Faculty",           path: "/admin/faculty",        icon: Users },
    { label: "Students",          path: "/admin/students",       icon: Users },
    { label: "Classes",           path: "/admin/classes",        icon: BookOpen }, 
    { label: "Academics",         path: "/admin/academics",      icon: Building2 },
    { label: "Infrastructure",    path: "/admin/infrastructure", icon: Warehouse },
    { label: "Exam & Results",    path: "/admin/exams",          icon: GraduationCap },
    { label: "Reports",           path: "/admin/reports",        icon: PieChart },
    { label: "Notifications",     path: "/admin/communication",  icon: Bell },
  ];

  const accountantLinks = [
    { label: "Dashboard",       path: "/admin/dashboard",      icon: LayoutDashboard },
    { label: "Fee Collection",  path: "/admin/fees",           icon: CreditCard },
    { label: "Fee Structure",   path: "/admin/fees/structure", icon: FileText },
    { label: "Expenses",        path: "/admin/expenses",       icon: Calculator },
    { label: "Salary",          path: "/admin/salary",         icon: Wallet },
    { label: "Reports",         path: "/admin/reports",        icon: PieChart },
  ];

  const hodLinks = [
    { label: "Dashboard",       path: "/faculty/dashboard",    icon: LayoutDashboard },
    { label: "Department",      path: "/admin/departments",    icon: Briefcase },
    { label: "Syllabus",        path: "/faculty/syllabus",     icon: ClipboardList },
    { label: "My Classes",      path: "/faculty/classes",      icon: BookOpen },
    { label: "Attendance",      path: "/faculty/attendance",   icon: Clock },
    { label: "Courses",         path: "/faculty/courses",      icon: FileText },
    { label: "Exams",           path: "/faculty/exams",        icon: GraduationCap },
    { label: "Leaves",          path: "/faculty/leaves",       icon: Calendar },
    { label: "Notifications",   path: "/faculty/notifications",icon: Bell },
  ];

  const adminLinks = [
    { label: 'Dashboard',         path: '/admin/dashboard',      icon: LayoutDashboard },
    { label: 'Institute',         path: '/admin/institute',      icon: Building2 },
    { label: 'Infrastructure',    path: '/admin/infrastructure', icon: Warehouse },
    { label: 'Attendance',        path: '/admin/attendance',     icon: Clock },
    { label: 'Academic Programs', path: '/admin/academic-programs',       icon: BookOpen },
    { label: 'Departments',       path: '/admin/departments',    icon: Briefcase },
    { label: 'Syllabus',          path: '/admin/syllabus',       icon: ClipboardList },
    { label: 'Employee Master',   path: '/admin/employees/directory', icon: UserCheck },
    { label: 'Students',          path: '/admin/students',       icon: Users },
    { label: 'Classes',           path: '/admin/classes',        icon: BookOpen }, 
    { label: 'Exam & Results',    path: '/admin/exams',          icon: GraduationCap },
    { label: 'Certificates',      path: '/admin/certificates',   icon: Award },
    { label: 'Expenses',          path: '/admin/expenses',       icon: CreditCard },
    { label: 'Fees Structure',    path: '/admin/fees/structure', icon: CreditCard },
    { label: 'Notifications',     path: '/admin/communication',  icon: Bell },
    { label: 'Reports',           path: '/admin/reports',        icon: FileText },
    { label: 'Settings',          path: '/admin/settings',       icon: Settings },
  ];

  // 🚀 FIXED (Point 7): Super Admin Links now strictly contain ONLY SA routes.
  const superAdminLinks = [
    { label: 'SA Dashboard', path: '/super-admin/dashboard',  icon: ShieldCheck },
    { label: 'Institutes',   path: '/super-admin/institutes', icon: Building2 },
  ];

  // ─── Dynamic Link Resolver ──────────────────────────────────────────────────
  
  const getLinks = () => {
    if (userRole === 'super_admin') {
      // 🚀 FIXED (Point 6 & 7): When impersonating, completely hide the SA routes 
      // and inject the Institute Admin routes along with a special "Back" button!
      if (isImpersonating) {
        return [
          { 
            label: 'Exit Institute View', // The requested "Back" button
            path: '/super-admin/dashboard', 
            icon: ArrowLeftCircle,
            onClick: () => {
              if (stopImpersonation) stopImpersonation();
            }
          },
          { isDivider: true, label: 'Institute Management' },
          ...adminLinks // Show ONLY institute management links
        ];
      }
      // If NOT impersonating, show ONLY Super Admin links (Sidebar is Locked)
      return superAdminLinks;
    }

    // Standard routing for other roles
    if (userRole === 'institute_admin') return adminLinks;
    if (userRole === 'principal') return principalLinks;
    if (userRole === 'accountant') return accountantLinks;
    if (userRole === 'hod') return hodLinks;
    if (userRole === 'student') return studentLinks;
    if (userRole === 'faculty') return facultyLinks;
    return adminLinks;
  };

  const links = getLinks();

  const exactPaths = [
    '/admin/dashboard',
    '/student/dashboard',
    '/super-admin/dashboard',
    '/faculty/dashboard',
    '/admin/infrastructure',
    '/admin/principal'
  ];

  const headerLabel = isImpersonating
    ? impersonatedInstitute?.name || 'EduERP'
    : 'EduERP';

  return (
    <aside className="w-64 bg-[#0F53D5] text-white flex flex-col h-screen fixed left-0 top-0 font-sans z-50 shadow-xl">

      {/* Header */}
      <div className="h-20 flex items-center px-6 mb-1 border-b border-white/10 shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold tracking-wide truncate">{headerLabel}</h1>
          {isImpersonating && (
            <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5">
              Super Admin
            </p>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {links.map((item, idx) => {
          if (item.isDivider) {
            return (
              <div key={`d-${idx}`} className="pt-4 pb-2 px-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">
                  {item.label || 'Institute Management'}
                </p>
                <div className="h-px bg-white/10" />
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.label} // Changed key to label to prevent React key conflicts when swapping menus
              to={item.path}
              end={exactPaths.includes(item.path)}
              onClick={(e) => {
                // Execute custom onClick (like stopImpersonation) if it exists
                if (item.onClick) {
                  item.onClick(e);
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-white text-[#0F53D5] shadow-lg font-bold'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <div className="bg-[#1e60dc] rounded-2xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-400 flex items-center justify-center font-bold text-white shrink-0 uppercase">
            {user?.first_name?.[0] || user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold text-white truncate capitalize">
              {user?.first_name || user?.name || 'User'}
            </p>
            <p className="text-[10px] text-blue-200 uppercase tracking-wider truncate">
              {isImpersonating ? 'Super Admin' : userRole.replace(/_/g, ' ')}
            </p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};