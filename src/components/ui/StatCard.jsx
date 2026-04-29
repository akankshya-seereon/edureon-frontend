import { TrendingUp, TrendingDown } from "lucide-react";

export const StatCard = ({ title, value, icon: Icon, colorClass = "bg-blue-500", trend, trendUp = true }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2 tracking-tight">{value}</h3>
        </div>
        
        {/* Dynamic Icon Container */}
        <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 transition-transform group-hover:scale-110`}>
          {Icon && (
            <Icon 
              size={24} 
              className={`${colorClass.replace('bg-', 'text-')} transition-colors`} 
            />
          )}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
            ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-red-600'}`}>
            {trendUp ? (
              <TrendingUp size={12} className="mr-1 stroke-[3px]" />
            ) : (
              <TrendingDown size={12} className="mr-1 stroke-[3px]" />
            )}
            {trend}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">vs last month</span>
        </div>
      )}
    </div>
  );
};