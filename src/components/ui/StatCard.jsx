import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, color, trend, trendUp = true }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-white`}>
          {/* We interpret the 'color' prop to set text color dynamically if needed */}
          <Icon className={`w-6 h-6 text-slate-700`} style={{ color: "inherit" }} /> 
          {/* Note: In Tailwind v4 or standard setups, dynamic text colors can be tricky. 
              Ideally, pass specific text classes or use inline styles for dynamic colors. 
              For now, we'll let the parent handle the color class logic or keep it simple. 
          */}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trendUp ? (
             <TrendingUp size={16} className="mr-1 text-green-500" />
          ) : (
             <TrendingDown size={16} className="mr-1 text-red-500" />
          )}
          <span className={`font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-slate-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
};