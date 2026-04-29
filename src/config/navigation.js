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
  Bell,
  GraduationCap,
  Building,
  Briefcase,
  Layers,
  Award,
  BookMarked,
  ScrollText,
  UserCircle,
  HelpCircle,
  Wallet
} from 'lucide-react';

export const navConfigs = {
  // ── SUPER ADMIN ──────────────────────────────────────────────────────────
  super_admin: [
    { label: "Dashboard",       path: "/super-admin/dashboard",  icon: LayoutDashboard },
    { label: "Institutes",      path: "/super-admin/institutes", icon: Building2 },
    { label: "Platform Logs",   path: "/super-admin/attendance", icon: ClipboardList },
  ],

  // ── INSTITUTE ADMIN ──────────────────────────────────────────────────────
  institute_admin: [
    { label: "Dashboard",         path: "/admin/dashboard",         icon: LayoutDashboard },
    { label: "Institute Profile", path: "/admin/institute",         icon: Building },
    { label: "Infrastructure",    path: "/admin/infrastructure",    icon: Layers },
    
    // Academic Setup
    { label: "Academic Programs", path: "/admin/academic-programs", icon: GraduationCap },
    { label: "Departments",       path: "/admin/departments",       icon: Building2 },
    { label: "Syllabus",          path: "/admin/syllabus",          icon: BookMarked },
    { label: "Classes & Batches", path: "/admin/classes",           icon: BookOpen },
    
    // People Management
    { label: "Employee Master",   path: "/admin/employees/directory", icon: Briefcase },
    { label: "Faculty",           path: "/admin/faculty",           icon: UserCheck },
    { label: "Students",          path: "/admin/students",          icon: Users },
    { label: "Attendance",        path: "/admin/attendance",        icon: ClipboardList },
    
    // Finance & Operations
    { label: "Fee Collection",    path: "/admin/fees",              icon: DollarSign },
    { label: "Fee Structure",     path: "/admin/fees/structure",    icon: CreditCard },
    { label: "Expenses",          path: "/admin/expenses",          icon: Wallet },
    
    // Examinations & Certs
    { label: "Exams & Results",   path: "/admin/exams",             icon: ScrollText },
    { label: "Certificates",      path: "/admin/certificates",      icon: Award },
    
    // Comms & Reports
    { label: "Notifications",     path: "/admin/communication",     icon: Bell },
    { label: "Reports",           path: "/admin/reports",           icon: FileText },
    { label: "Settings",          path: "/admin/settings",          icon: Settings },
  ],

  // ── FACULTY ──────────────────────────────────────────────────────────────
  faculty: [
    { label: "Dashboard",     path: "/faculty/dashboard",     icon: LayoutDashboard },
    { label: "My Profile",    path: "/faculty/profile",       icon: UserCircle },
    { label: "Syllabus",      path: "/faculty/syllabus",      icon: BookMarked },
    { label: "My Classes",    path: "/faculty/classes",       icon: Users },
    { label: "Courses",       path: "/faculty/courses",       icon: BookOpen },
    { label: "Assignments",   path: "/faculty/assignments",   icon: FileText },
    { label: "Attendance",    path: "/faculty/attendance",    icon: ClipboardList },
    { label: "Exams",         path: "/faculty/exams",         icon: ScrollText },
    { label: "Leaves",        path: "/faculty/leaves",        icon: Calendar },
    { label: "My Salary",     path: "/faculty/salary",        icon: DollarSign },
    { label: "Notifications", path: "/faculty/notifications", icon: Bell },
  ],

  // ── STUDENT ──────────────────────────────────────────────────────────────
  student: [
    { label: "Dashboard",     path: "/student/dashboard",    icon: LayoutDashboard },
    { label: "My Profile",    path: "/student/profile",      icon: UserCircle },
    { label: "My Courses",    path: "/student/courses",      icon: BookOpen },
    { label: "Assignments",   path: "/student/assignments",  icon: FileText },
    { label: "Attendance",    path: "/student/attendance",   icon: ClipboardList },
    { label: "Exams",         path: "/student/exams",        icon: ScrollText },
    { label: "My Fees",       path: "/student/fees",         icon: CreditCard },
    { label: "Certificates",  path: "/student/certificates", icon: Award },
    { label: "Calendar",      path: "/student/calendar",     icon: Calendar },
    { label: "Notifications", path: "/student/notification", icon: Bell },
    { label: "Help & Support",path: "/student/help",         icon: HelpCircle },
  ],
};