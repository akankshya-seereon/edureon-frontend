import { Sidebar } from './Sidebar';

export const FacultyLayout = ({ children }) => {
  const facultyLinks = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: '📊' },
    { label: 'My Classes', path: '/faculty/classes', icon: '📚' },
    { label: 'Attendance', path: '/faculty/attendance', icon: '✅' },
    { label: 'Assignments', path: '/faculty/assignments', icon: '📝' },
    { label: 'Profile', path: '/faculty/profile', icon: '👤' },
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