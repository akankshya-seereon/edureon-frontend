import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../hooks/useAuth';

export const SuperAdminDashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, loading } = useFetch('/super-admin/dashboard');

  // 🎯 FIXED: Safe name extraction
  const adminName = user?.first_name || user?.name || user?.fullName || 'Super Admin';

  const metrics = [
    {
      title: 'Total Institutes',
      value: dashboardData?.institutes?.total || '156',
      subtitle: '2 registered today',
      color: 'bg-purple-100',
      icon: '🏢',
    },
    {
      title: 'Active Institutes',
      value: dashboardData?.institutes?.active || '138',
      subtitle: 'Currently operating',
      color: 'bg-yellow-100',
      icon: '✨',
    },
    {
      title: 'Suspended Institutes',
      value: dashboardData?.institutes?.suspended || '12',
      subtitle: '7.7% suspended',
      color: 'bg-red-100',
      icon: '⚠️',
    },
    {
      title: 'Total Teachers',
      value: dashboardData?.users?.teachers || '2,450',
      subtitle: 'Across all institutes',
      color: 'bg-blue-100',
      icon: '👨‍🏫',
    },
    {
      title: 'Total Students',
      value: dashboardData?.users?.students || '48,530',
      subtitle: 'Active enrollments',
      color: 'bg-cyan-100',
      icon: '👨‍🎓',
    },
    {
      title: 'Monthly Revenue',
      value: '₹102,000',
      subtitle: 'Subscription revenue',
      color: 'bg-purple-100',
      icon: '💰',
    },
    {
      title: 'Expiring Subscriptions',
      value: '8',
      subtitle: 'Due in next 30 days',
      color: 'bg-yellow-100',
      icon: '⏰',
    },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* 🎯 FIXED: Removed duplicate search/bell to respect global header layout */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 capitalize">Hi, {adminName}</h2>
        <p className="text-sm text-gray-500 mt-1">Welcome to EduERP Global Command Center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`${metric.color} rounded-2xl p-6 shadow-sm border border-transparent hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">{metric.title}</p>
                <h3 className="text-3xl font-black text-gray-800 mb-1">{metric.value}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">{metric.subtitle}</p>
              </div>
              <div className="text-3xl opacity-40 grayscale">{metric.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Recent Updates */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Institute Updates</h3>
          <div className="space-y-0 divide-y divide-gray-100">
            {[
              { icon: '🏢', title: 'New Institute Registered', subtitle: "St. Xavier's College", time: '2 hours ago' },
              { icon: '📊', title: 'Subscription Renewed', subtitle: 'Premium Plan - DPS School', time: '5 hours ago' },
              { icon: '⚠️', title: 'Subscription Expired', subtitle: 'Delhi Public Institute', time: '1 day ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 hover:bg-slate-50 px-3 rounded-xl transition-colors cursor-pointer">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl bg-slate-100 p-2 rounded-lg">{activity.icon}</div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-gray-800">{activity.title}</p>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{activity.subtitle}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap ml-4">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">System Health</h3>
          <div className="space-y-6">
            {[
              { label: 'API Uptime', value: '99.9%', percentage: 99.9, color: 'bg-green-500' },
              { label: 'Database Load', value: '45%', percentage: 45, color: 'bg-blue-500' },
              { label: 'Storage Used', value: '62%', percentage: 62, color: 'bg-amber-500' },
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                  <span className="text-sm font-black text-gray-800">{stat.value}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${stat.color} h-2.5 rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};