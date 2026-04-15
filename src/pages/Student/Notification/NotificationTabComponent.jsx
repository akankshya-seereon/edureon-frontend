import { Bell, Mail, AlertCircle, BookOpen } from 'lucide-react';

export function NotificationTabsDefault({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All', icon: Bell, color: 'blue' },
    { id: 'unread', label: 'Unread', icon: Mail, color: 'orange' },
    { id: 'announcement', label: 'Announcements', icon: AlertCircle, color: 'slate' },
    { id: 'academic', label: 'Academic', icon: BookOpen, color: 'emerald' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      <div className="flex items-center bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 overflow-x-auto">
        {filters.map((filter, index) => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          const colorClass = isActive
            ? filter.color === 'blue'
              ? 'text-blue-600'
              : filter.color === 'orange'
              ? 'text-orange-600'
              : filter.color === 'emerald'
              ? 'text-emerald-600'
              : 'text-slate-600'
            : 'text-slate-600 hover:text-slate-900';

          return (
            <div key={filter.id} className="flex items-center">
              <button
                onClick={() => onFilterChange(filter.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-semibold text-lg transition-all duration-300 relative whitespace-nowrap
                  ${colorClass}
                `}
              >
                <Icon className="w-5 h-5" />
                {filter.label}

                {isActive && (
                  <div className={`
                    absolute bottom-0 left-0 right-0 h-1 rounded-t-full
                    ${filter.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      filter.color === 'orange' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                      filter.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                      'bg-gradient-to-r from-slate-400 to-slate-600'}
                  `} />
                )}
              </button>

              {index !== filters.length - 1 && (
                <div className="h-8 w-px bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NotificationTabsPill({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'announcement', label: 'Announcements', icon: AlertCircle },
    { id: 'academic', label: 'Academic', icon: BookOpen },
  ];

  return (
    <div className="inline-flex gap-3 mb-8 flex-wrap">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
              flex items-center gap-2
              ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300'
              }
            `}
          >
            <Icon className="w-5 h-5" />
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationTabsUnderline({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'unread', label: 'Unread', icon: Mail },
    { id: 'announcement', label: 'Announcements', icon: AlertCircle },
    { id: 'academic', label: 'Academic', icon: BookOpen },
  ];

  return (
    <div className="border-b-2 border-slate-200 mb-8">
      <div className="flex gap-8 overflow-x-auto">
        {filters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                flex items-center gap-2 py-4 font-semibold text-lg transition-all duration-300 relative whitespace-nowrap
                ${activeFilter === filter.id ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}
              `}
            >
              <Icon className="w-5 h-5" />
              {filter.label}
              {activeFilter === filter.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function NotificationTabsBadge({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'announcement', label: 'Announcements' },
    { id: 'academic', label: 'Academic' },
  ];

  return (
    <div className="inline-flex gap-2 mb-8 bg-slate-100 p-1 rounded-full flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-5 py-2 rounded-full font-semibold text-md transition-all duration-300
            ${
              activeFilter === filter.id
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function NotificationFilterDropdown({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All Notifications' },
    { id: 'unread', label: 'Unread Only' },
    { id: 'announcement', label: 'Announcements' },
    { id: 'academic', label: 'Academic' },
    { id: 'fee', label: 'Fees' },
    { id: 'general', label: 'General' },
  ];

  return (
    <div className="mb-8">
      <select
        value={activeFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="w-full md:w-64 px-4 py-3 rounded-lg border-2 border-slate-200 bg-white font-semibold text-slate-900 hover:border-slate-300 transition-all"
      >
        {filters.map((filter) => (
          <option key={filter.id} value={filter.id}>
            {filter.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function NotificationFilterSegmented({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'announcement', label: 'Announcements' },
  ];

  return (
    <div className="inline-flex border-2 border-slate-300 rounded-lg overflow-hidden mb-8">
      {filters.map((filter, index) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-6 py-3 font-semibold transition-all duration-300 ${index !== filters.length - 1 ? 'border-r-2 border-slate-300' : ''}
            ${
              activeFilter === filter.id
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}