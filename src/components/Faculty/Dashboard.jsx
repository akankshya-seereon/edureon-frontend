import { Clock, BookOpen, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const FacultyDashboard = () => {
  const { user } = useAuth();

  const cards = [
    {
      title: 'My Classes',
      value: '4',
      subtitle: 'Active classes',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      icon: BookOpen,
    },
    {
      title: 'Total Students',
      value: '156',
      subtitle: 'Under teaching',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      icon: Users,
    },
    {
      title: 'Pending Assignments',
      value: '12',
      subtitle: 'To evaluate',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
      icon: AlertCircle,
    },
    {
      title: 'Today\'s Classes',
      value: '3',
      subtitle: 'Scheduled today',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      icon: Calendar,
    },
    {
      title: 'Attendance Rate',
      value: '94%',
      subtitle: 'This month',
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-700',
      icon: CheckCircle,
    },
    {
      title: 'Leaves Remaining',
      value: '8',
      subtitle: 'This academic year',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-700',
      icon: Clock,
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-8 bg-gray-50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]}!</h2>
        <p className="text-sm text-gray-500">Here's your teaching overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`${card.bgColor} rounded-2xl p-6 shadow-sm hover:shadow-lg transition`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-2">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor} mb-2`}>{card.value}</p>
                  <p className="text-xs text-gray-500">{card.subtitle}</p>
                </div>
                <Icon className={`${card.textColor} w-6 h-6`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Timetable */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Classes</h3>
        <div className="space-y-3">
          {['9:00 AM - 10:00 AM', '10:30 AM - 11:30 AM', '1:00 PM - 2:00 PM'].map((time, idx) => (
            <div key={idx} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <Clock className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Class {idx + 1}</p>
                <p className="text-sm text-gray-500">{time}</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Mark Attendance
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
