import { BookOpen, FileText, DollarSign, Calendar, BarChart3, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const StudentDashboard = () => {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Attendance',
      value: '92%',
      subtitle: 'Overall attendance',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      icon: BarChart3,
    },
    {
      title: 'Pending Assignments',
      value: '4',
      subtitle: 'To submit',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      icon: FileText,
    },
    {
      title: 'Fees Due',
      value: '₹8,500',
      subtitle: 'Pending payment',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      icon: DollarSign,
    },
    {
      title: 'Upcoming Exams',
      value: '3',
      subtitle: 'Next 30 days',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      icon: Calendar,
    },
    {
      title: 'Enrolled Courses',
      value: '6',
      subtitle: 'This semester',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-700',
      icon: BookOpen,
    },
    {
      title: 'Notifications',
      value: '5',
      subtitle: 'Unread',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      icon: Bell,
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-md text-gray-500">Your academic dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`${card.bgColor} rounded-2xl p-6 shadow-sm hover:shadow-lg transition`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-md font-medium mb-2">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor} mb-2`}>{card.value}</p>
                  <p className="text-md text-gray-500">{card.subtitle}</p>
                </div>
                <Icon className={`${card.textColor} w-6 h-6`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-gray-800 transition">
              📝 Submit Assignment
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg font-medium text-gray-800 transition">
              💰 Pay Fees
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium text-gray-800 transition">
              📚 View Courses
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Announcements</h3>
          <div className="space-y-3">
            <div className="pb-3 border-b border-gray-200">
              <p className="font-semibold text-md text-gray-800">Semester Exam Schedule Released</p>
              <p className="text-md text-gray-500">2 hours ago</p>
            </div>
            <div className="pb-3 border-b border-gray-200">
              <p className="font-semibold text-md text-gray-800">Holiday Notice - 26 Jan</p>
              <p className="text-md text-gray-500">1 day ago</p>
            </div>
            <div>
              <p className="font-semibold text-md text-gray-800">Assignment Extension Granted</p>
              <p className="text-md text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};