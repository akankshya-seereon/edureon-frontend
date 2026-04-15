import { Sidebar } from './Sidebar';

export const AdminLayout = ({ children }) => {
  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Faculty', path: '/admin/faculty', icon: '👨‍🏫' },
    { label: 'Students', path: '/admin/students', icon: '👨‍🎓' },
    { label: 'Fees', path: '/admin/fees', icon: '💰' },
    { label: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar links={adminLinks} />
      <div className="ml-64 w-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
