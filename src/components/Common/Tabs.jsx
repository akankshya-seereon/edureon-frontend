import { useState } from 'react';

export const Tabs = ({ tabs = [] }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === idx
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

