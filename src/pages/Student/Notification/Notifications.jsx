import { useState, useEffect } from 'react';
import { Bell, CheckCircle, X, Mail } from 'lucide-react';

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    thisWeek: 0,
  });
  const [loading, setLoading] = useState(true);

  const mockNotifications = [
    {
      id: 1,
      title: 'Academic Calendar Updated',
      description: 'The academic calendar for the Spring 2026 semester has been updated. Please check the new examination dates and plan accordingly.',
      source: 'Academic Office',
      date: 'Jan 25, 2026',
      category: 'announcement',
      isRead: false,
      icon: '📅',
    },
    {
      id: 2,
      title: 'Fee Payment Reminder',
      description: 'This is a reminder that your semester fee of $2,500 is due on February 5, 2026. Please make the payment to avoid late fees.',
      source: 'Finance Department',
      date: 'Jan 24, 2026',
      category: 'fee',
      isRead: false,
      icon: '💰',
    },
    {
      id: 3,
      title: 'New Assignment Posted',
      description: 'Dr. Smith has posted a new assignment for Advanced Mathematics. The assignment is due on January 30, 2026.',
      source: 'Dr. Smith',
      date: 'Jan 23, 2026',
      category: 'academic',
      isRead: true,
      icon: '📝',
    },
    {
      id: 4,
      title: 'Library Extended Hours',
      description: 'The library will be open for extended hours during the examination period from February 1-15, 2026. Opening hours: 7:00 AM - 11:00 PM.',
      source: 'Library Services',
      date: 'Jan 22, 2026',
      category: 'general',
      isRead: true,
      icon: '📚',
    },
    {
      id: 5,
      title: 'Mid-term Exam Schedule Released',
      description: 'The mid-term examination schedule has been released. Exams will be conducted from February 10-20, 2026. Check the exam portal for details.',
      source: 'Examination Cell',
      date: 'Jan 20, 2026',
      category: 'announcement',
      isRead: true,
      icon: '📋',
    },
    {
      id: 6,
      title: 'Course Registration Open',
      description: 'Course registration for the Fall 2026 semester is now open. Please register for your courses by March 15, 2026.',
      source: 'Registrar Office',
      date: 'Jan 19, 2026',
      category: 'academic',
      isRead: true,
      icon: '📚',
    },
  ];

  useEffect(() => {
    try {
      const storedNotifications = localStorage?.getItem('student_notifications');
      const notifData = storedNotifications ? JSON.parse(storedNotifications) : mockNotifications;
      
      setNotifications(notifData);
      calculateStats(notifData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications(mockNotifications);
      calculateStats(mockNotifications);
      setLoading(false);
    }
  }, []);

  const calculateStats = (notifs) => {
    const unread = notifs.filter(n => !n.isRead).length;
    const read = notifs.filter(n => n.isRead).length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = notifs.filter(n => {
      const notifDate = new Date(n.date);
      return notifDate >= oneWeekAgo;
    }).length;

    setStats({
      total: notifs.length,
      unread,
      read,
      thisWeek,
    });
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
    localStorage?.setItem('student_notifications', JSON.stringify(updated));
    calculateStats(updated);
  };

  const handleMarkAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(updated);
    localStorage?.setItem('student_notifications', JSON.stringify(updated));
    calculateStats(updated);
  };

  const handleDeleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage?.setItem('student_notifications', JSON.stringify(updated));
    calculateStats(updated);
  };

  const handleResetNotifications = () => {
    if (window.confirm('Are you sure? This will reset all notifications to default.')) {
      localStorage.removeItem('student_notifications');
      setNotifications(mockNotifications);
      calculateStats(mockNotifications);
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      announcement: 'bg-blue-100 text-blue-700 border border-blue-300',
      fee: 'bg-red-100 text-red-700 border border-red-300',
      academic: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      general: 'bg-slate-100 text-slate-700 border border-slate-300',
    };
    return badges[category] || badges.general;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-9xl mx-auto">
          <p className="text-lg text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-lg text-slate-600">
              You have {stats.unread} unread {stats.unread === 1 ? 'notification' : 'notifications'}
            </p>
          </div>

          <div className="flex gap-2">
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg border-2 border-slate-200 hover:bg-slate-50 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                Mark All as Read
              </button>
            )}
            <button
              onClick={handleResetNotifications}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-md text-slate-600 font-medium">Total</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-md text-slate-600 font-medium">Unread</p>
                <p className="text-3xl font-bold text-slate-900">{stats.unread}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-md text-slate-600 font-medium">Read</p>
                <p className="text-3xl font-bold text-slate-900">{stats.read}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <p className="text-md text-slate-600 font-medium">This Week</p>
                <p className="text-3xl font-bold text-slate-900">{stats.thisWeek}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  group relative bg-white rounded-lg border-l-4 p-6 transition-all hover:shadow-lg
                  ${!notification.isRead ? 'border-l-blue-500 bg-blue-50' : 'border-l-slate-200'}
                `}
              >
                {!notification.isRead && (
                  <div className="absolute top-6 right-6 w-3 h-3 bg-blue-600 rounded-full"></div>
                )}

                <div className="flex gap-4">
                  <div className="text-3xl mt-1 flex-shrink-0">{notification.icon}</div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{notification.title}</h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        )}
                      </div>

                      <span className={`px-3 py-1 rounded-full text-md font-semibold whitespace-nowrap ml-2 flex-shrink-0 ${getCategoryBadge(notification.category)}`}>
                        {notification.category}
                      </span>
                    </div>

                    <p className="text-slate-700 mb-4 leading-relaxed">{notification.description}</p>

                    <div className="flex items-center justify-between text-md text-slate-500">
                      <div className="flex gap-4">
                        <span className="font-medium text-slate-600">{notification.source}</span>
                        <span>•</span>
                        <span>{notification.date}</span>
                      </div>

                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          title="Delete notification"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 text-center border border-slate-200">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-500 font-medium">No notifications</p>
              <p className="text-slate-400">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}