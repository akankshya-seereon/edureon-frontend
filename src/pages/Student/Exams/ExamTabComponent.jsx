import { Calendar, Award } from 'lucide-react';

/**
 * ===== REUSABLE EXAM TAB COMPONENTS =====
 * 
 * Multiple tab style variants for the Exam module
 * Copy and use in your Exam.jsx file
 */

// ===== STYLE 1: Modern Navbar Tabs (Default) =====
export function ExamTabsDefault({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'exams',
      label: 'Upcoming Exams',
      icon: Calendar,
      color: 'blue',
    },
    {
      id: 'results',
      label: 'Results & Analytics',
      icon: Award,
      color: 'emerald',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
      {/* Tab Navigation Bar */}
      <div className="flex items-center bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colorClass = isActive
            ? tab.color === 'blue'
              ? 'text-blue-600'
              : 'text-emerald-600'
            : 'text-slate-600 hover:text-slate-900';

          return (
            <div key={tab.id} className="flex items-center">
              <button
                onClick={() => onTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 font-semibold text-lg transition-all duration-300 relative
                  ${colorClass}
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}

                {/* Animated Indicator */}
                {isActive && (
                  <div
                    className={`
                      absolute bottom-0 left-0 right-0 h-1 rounded-t-full
                      ${
                        tab.color === 'blue'
                          ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                          : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                      }
                    `}
                  />
                )}
              </button>

              {/* Divider */}
              {index !== tabs.length - 1 && (
                <div className="h-8 w-px bg-slate-200" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== STYLE 2: Pill Tabs =====
export function ExamTabsPill({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex gap-3 mb-8">
      <button
        onClick={() => onTabChange('exams')}
        className={`
          px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'exams'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
              : 'bg-white text-blue-600 border-2 border-slate-200 hover:border-blue-200'
          }
        `}
      >
        <Calendar className="w-5 h-5" />
        Upcoming Exams
      </button>

      <button
        onClick={() => onTabChange('results')}
        className={`
          px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'results'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg'
              : 'bg-white text-emerald-600 border-2 border-slate-200 hover:border-emerald-200'
          }
        `}
      >
        <Award className="w-5 h-5" />
        Results & Analytics
      </button>
    </div>
  );
}

// ===== STYLE 3: Underline Tabs =====
export function ExamTabsUnderline({ activeTab, onTabChange }) {
  return (
    <div className="border-b-2 border-slate-200 mb-8">
      <div className="flex gap-8">
        <button
          onClick={() => onTabChange('exams')}
          className={`
            flex items-center gap-2 py-4 font-semibold text-lg transition-all duration-300 relative
            ${activeTab === 'exams' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}
          `}
        >
          <Calendar className="w-5 h-5" />
          Upcoming Exams
          {activeTab === 'exams' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('results')}
          className={`
            flex items-center gap-2 py-4 font-semibold text-lg transition-all duration-300 relative
            ${activeTab === 'results' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'}
          `}
        >
          <Award className="w-5 h-5" />
          Results & Analytics
          {activeTab === 'results' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
          )}
        </button>
      </div>
    </div>
  );
}

// ===== STYLE 4: Segmented Control Tabs =====
export function ExamTabsSegmented({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex border-2 border-slate-300 rounded-lg overflow-hidden mb-8">
      <button
        onClick={() => onTabChange('exams')}
        className={`
          px-6 py-3 font-semibold flex items-center gap-2 transition-all duration-300 border-r-2 border-slate-300
          ${
            activeTab === 'exams'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }
        `}
      >
        <Calendar className="w-5 h-5" />
        Exams
      </button>

      <button
        onClick={() => onTabChange('results')}
        className={`
          px-6 py-3 font-semibold flex items-center gap-2 transition-all duration-300
          ${
            activeTab === 'results'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }
        `}
      >
        <Award className="w-5 h-5" />
        Results
      </button>
    </div>
  );
}

// ===== STYLE 5: Vertical Sidebar Tabs =====
export function ExamTabsVertical({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'exams', label: 'Upcoming Exams', icon: Calendar },
    { id: 'results', label: 'Results & Analytics', icon: Award },
  ];

  return (
    <div className="flex gap-6">
      {/* Tab Navigation */}
      <div className="flex flex-col gap-2 w-64">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 rounded-lg text-left font-semibold transition-all duration-300
                border-l-4 flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 border-l-transparent'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ===== STYLE 6: Minimal Badge Tabs =====
export function ExamTabsBadge({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex gap-2 mb-8 bg-slate-100 p-1 rounded-full">
      <button
        onClick={() => onTabChange('exams')}
        className={`
          px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'exams'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }
        `}
      >
        <Calendar className="w-4 h-4" />
        Exams
      </button>

      <button
        onClick={() => onTabChange('results')}
        className={`
          px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'results'
              ? 'bg-white text-emerald-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }
        `}
      >
        <Award className="w-4 h-4" />
        Results
      </button>
    </div>
  );
}

// ===== Tab Content Wrapper (Optional) =====
export function ExamTabContent({ activeTab, tabId, children }) {
  if (activeTab !== tabId) return null;
  return <div className="animate-in fade-in duration-300">{children}</div>;
}

/**
 * ===== USAGE EXAMPLES =====
 * 
 * 1. Default Navbar Style:
 * <ExamTabsDefault activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 2. Pill Style:
 * <ExamTabsPill activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 3. Underline Style:
 * <ExamTabsUnderline activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 4. Segmented Control:
 * <ExamTabsSegmented activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 5. Vertical Sidebar:
 * <ExamTabsVertical activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 6. Minimal Badge:
 * <ExamTabsBadge activeTab={activeTab} onTabChange={setActiveTab} />
 */