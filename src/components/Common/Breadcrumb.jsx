import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Split path: /admin/employees/non-academic -> ["admin", "employees", "non-academic"]
  const pathnames = location.pathname.split('/').filter((x) => x);

  // 🛠️ Label Mapping: Match your URL segments to the exact labels in your image
  const breadcrumbMap = {
    'admin': 'SAMET',
    'employees': 'EMPLOYEE MASTER',
    'non-academic': 'NON-ACADEMIC',
    'academic': 'ACADEMIC',
    'infrastructure': 'INFRASTRUCTURE',
    'departments': 'DEPARTMENTS',
    'dashboard': 'DASHBOARD'
  };

  return (
    <nav className="flex items-center gap-1.5 overflow-hidden">
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const label = breadcrumbMap[value.toLowerCase()] || value.replace(/-/g, ' ').toUpperCase();

        return (
          <div key={to} className="flex items-center gap-1.5 shrink-0">
            {last ? (
              // Current Page (Active)
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                {label}
              </span>
            ) : (
              // Parent Links
              <>
                <Link
                  to={to}
                  className="text-[10px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"
                >
                  {label}
                </Link>
                <ChevronRight size={10} className="text-slate-300 stroke-[4px]" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;