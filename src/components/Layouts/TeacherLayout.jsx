import { Sidebar } from './Sidebar';

export const FacultyLayout = ({ children }) => {
  const facultyLinks = [
    { label: "Dashboard",       path: "/faculty/dashboard",     icon: LayoutDashboard },
    { label: "Profile",         path: "/faculty/profile",       icon: User },
    { label: "My Classes",      path: "/faculty/myclasses",       icon: BookOpen },
    { label: "Attendance",      path: "/faculty/attendance",    icon: Clock },
    { label: "Courses",     path: "/faculty/courses",   icon: FileText },
    { label: "Assignments", path: "/faculty/assignments",         icon: GraduationCap },
    { label: "Exams",            path: "/faculty/exams",          icon: CreditCard },
    { label: "Leaves",   path: "/faculty/leaves", icon: Bell },
    { label: "Notifications",        path: "/faculty/notifcations",      icon: Notification },
    { label: "Help & Support",  path: "/student/support",       icon: HelpCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={facultyLinks} />
      <div className="ml-64 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};