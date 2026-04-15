import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  Users, 
  UserCheck, 
  DollarSign, 
  FileText, 
  Settings, 
  ClipboardList, 
  Calendar,
  CreditCard,
  Bell 
} from 'lucide-react';

export const navConfigs = {
  super_admin: [
    { label: "Dashboard", path: "/super-admin/dashboard", icon: LayoutDashboard },
    { label: "Institute", path: "/super-admin/institutes", icon: Building2 },
    { label: "Dashboard",         path: "/admin/dashboard",      icon: LayoutDashboard },
    { label: "Faculty Approvals", path: "/admin/faculty",        icon: UserCheck },
    { label: "Total Students",    path: "/admin/students",       icon: Users },
    { label: "Academic Setup",    path: "/admin/academics",      icon: BookOpen },
    { label: "Fees Structure",    path: "/admin/fees/structure", icon: DollarSign },
    // ✅ CHANGED: "/admin/fees" -> "/admin/fees/publish" to avoid conflict
    { label: "Publish Fees",      path: "/admin/fees/publish",   icon: CreditCard },
    { label: "Notifications",     path: "/admin/communication",  icon: Bell },
    { label: "Reports",           path: "/admin/reports",        icon: FileText },
    { label: "Settings",          path: "/admin/settings",       icon: Settings },
  ],

  institute_admin: [
    { label: "Dashboard",         path: "/admin/dashboard",      icon: LayoutDashboard },
    { label: "Faculty Approvals", path: "/admin/faculty",        icon: UserCheck },
    { label: "Total Students",    path: "/admin/students",       icon: Users },
    { label: "Academic Setup",    path: "/admin/academics",      icon: BookOpen },
    { label: "Fees Structure",    path: "/admin/fees/structure", icon: DollarSign },
    // ✅ CHANGED: "/admin/fees" -> "/admin/fees/publish" to avoid conflict
    { label: "Publish Fees",      path: "/admin/fees/publish",   icon: CreditCard },
    { label: "Notifications",     path: "/admin/communication",  icon: Bell },
    { label: "Reports",           path: "/admin/reports",        icon: FileText },
    { label: "Settings",          path: "/admin/settings",       icon: Settings },
  ],

  faculty: [
    { label: "Dashboard",  path: "/faculty/dashboard", icon: LayoutDashboard },
    { label: "My Classes", path: "/faculty/classes", icon: BookOpen },
    { label: "Attendance", path: "/faculty/attendance", icon: ClipboardList },
    { label: "Exams",      path: "/faculty/exams", icon: Calendar },
  ],

  student: [
    { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { label: "My Fees",   path: "/student/fees", icon: CreditCard },
  ],
};