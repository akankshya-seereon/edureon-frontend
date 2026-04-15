import { LucideIcon } from 'lucide-react';

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  bgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  trend = null,
  trendValue = null,
  subtitle = null 
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-md text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-md font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-white`}>
          <Icon size={24} className={iconColor} />
        </div>
      </div>
    </div>
  );
};