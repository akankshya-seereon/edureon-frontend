import { DollarSign, CreditCard } from 'lucide-react';

/**
 * ===== REUSABLE STUDENT FEES TAB COMPONENTS =====
 * 
 * Multiple tab style variants for the StudentFees module
 * Copy and use in your StudentFees.jsx file
 */

// ===== STYLE 1: Modern Navbar Tabs (Default) =====
export function StudentFeesTabsDefault({ activeTab, onTabChange }) {
  const tabs = [
    {
      id: 'fees',
      label: 'Fees',
      icon: DollarSign,
      color: 'blue',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard,
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
export function StudentFeesTabsPill({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex gap-3 mb-8">
      <button
        onClick={() => onTabChange('fees')}
        className={`
          px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'fees'
              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
              : 'bg-white text-blue-600 border-2 border-slate-200 hover:border-blue-200'
          }
        `}
      >
        <DollarSign className="w-5 h-5" />
        Fees
      </button>

      <button
        onClick={() => onTabChange('payments')}
        className={`
          px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'payments'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg'
              : 'bg-white text-emerald-600 border-2 border-slate-200 hover:border-emerald-200'
          }
        `}
      >
        <CreditCard className="w-5 h-5" />
        Payments
      </button>
    </div>
  );
}

// ===== STYLE 3: Underline Tabs =====
export function StudentFeesTabsUnderline({ activeTab, onTabChange }) {
  return (
    <div className="border-b-2 border-slate-200 mb-8">
      <div className="flex gap-8">
        <button
          onClick={() => onTabChange('fees')}
          className={`
            flex items-center gap-2 py-4 font-semibold text-lg transition-all duration-300 relative
            ${activeTab === 'fees' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}
          `}
        >
          <DollarSign className="w-5 h-5" />
          Fees
          {activeTab === 'fees' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
          )}
        </button>

        <button
          onClick={() => onTabChange('payments')}
          className={`
            flex items-center gap-2 py-4 font-semibold text-lg transition-all duration-300 relative
            ${activeTab === 'payments' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'}
          `}
        >
          <CreditCard className="w-5 h-5" />
          Payments
          {activeTab === 'payments' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-t-full" />
          )}
        </button>
      </div>
    </div>
  );
}

// ===== STYLE 4: Segmented Control Tabs =====
export function StudentFeesTabsSegmented({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex border-2 border-slate-300 rounded-lg overflow-hidden mb-8">
      <button
        onClick={() => onTabChange('fees')}
        className={`
          px-6 py-3 font-semibold flex items-center gap-2 transition-all duration-300 border-r-2 border-slate-300
          ${
            activeTab === 'fees'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }
        `}
      >
        <DollarSign className="w-5 h-5" />
        Fees
      </button>

      <button
        onClick={() => onTabChange('payments')}
        className={`
          px-6 py-3 font-semibold flex items-center gap-2 transition-all duration-300
          ${
            activeTab === 'payments'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50'
          }
        `}
      >
        <CreditCard className="w-5 h-5" />
        Payments
      </button>
    </div>
  );
}

// ===== STYLE 5: Vertical Sidebar Tabs =====
export function StudentFeesTabsVertical({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'fees', label: 'Fees', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="flex gap-6">
      {/* Tab Navigation */}
      <div className="flex flex-col gap-2 w-48">
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
export function StudentFeesTabsBadge({ activeTab, onTabChange }) {
  return (
    <div className="inline-flex gap-2 mb-8 bg-slate-100 p-1 rounded-full">
      <button
        onClick={() => onTabChange('fees')}
        className={`
          px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'fees'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }
        `}
      >
        <DollarSign className="w-4 h-4" />
        Fees
      </button>

      <button
        onClick={() => onTabChange('payments')}
        className={`
          px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300
          flex items-center gap-2
          ${
            activeTab === 'payments'
              ? 'bg-white text-emerald-600 shadow-md'
              : 'text-slate-600 hover:text-slate-900'
          }
        `}
      >
        <CreditCard className="w-4 h-4" />
        Payments
      </button>
    </div>
  );
}

// ===== STYLE 7: Dark Mode Tabs =====
export function StudentFeesTabsDark({ activeTab, onTabChange }) {
  return (
    <div className="bg-slate-900 rounded-xl mb-8 overflow-hidden">
      <div className="flex items-center p-1">
        <button
          onClick={() => onTabChange('fees')}
          className={`
            flex items-center gap-2 px-6 py-3 font-semibold text-lg transition-all duration-300 rounded-lg
            ${
              activeTab === 'fees'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <DollarSign className="w-5 h-5" />
          Fees
        </button>

        <button
          onClick={() => onTabChange('payments')}
          className={`
            flex items-center gap-2 px-6 py-3 font-semibold text-lg transition-all duration-300 rounded-lg
            ${
              activeTab === 'payments'
                ? 'bg-white text-emerald-600 shadow-lg'
                : 'text-slate-400 hover:text-white'
            }
          `}
        >
          <CreditCard className="w-5 h-5" />
          Payments
        </button>
      </div>
    </div>
  );
}

// ===== Tab Content Wrapper (Optional) =====
export function StudentFeesTabContent({ activeTab, tabId, children }) {
  if (activeTab !== tabId) return null;
  return <div className="animate-in fade-in duration-300">{children}</div>;
}

/**
 * ===== USAGE EXAMPLES =====
 * 
 * 1. Default Navbar Style:
 * <StudentFeesTabsDefault activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 2. Pill Style:
 * <StudentFeesTabsPill activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 3. Underline Style:
 * <StudentFeesTabsUnderline activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 4. Segmented Control:
 * <StudentFeesTabsSegmented activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 5. Vertical Sidebar:
 * <StudentFeesTabsVertical activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 6. Minimal Badge:
 * <StudentFeesTabsBadge activeTab={activeTab} onTabChange={setActiveTab} />
 * 
 * 7. Dark Mode:
 * <StudentFeesTabsDark activeTab={activeTab} onTabChange={setActiveTab} />
 */