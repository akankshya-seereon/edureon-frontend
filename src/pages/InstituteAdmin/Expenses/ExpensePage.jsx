import React, { useState } from "react";
import { Banknote, Wrench, Bus, Package } from "lucide-react";
import { Salary }      from "./Salary";
import { Maintenance } from "./Maintainance";
import { Transport }   from "./Transport";
import { Assets }      from "./Assets";

const TABS = [
  { key: "salary",      label: "Salary",      icon: Banknote },
  { key: "maintenance", label: "Maintenance", icon: Wrench   },
  { key: "transport",   label: "Transport",   icon: Bus      },
  { key: "assets",      label: "Assets",      icon: Package  },
];

export const ExpensePage = () => {
  const [active, setActive] = useState("salary");

  const renderTab = () => {
    switch (active) {
      case "salary":      return <Salary />;
      case "maintenance": return <Maintenance />;
      case "transport":   return <Transport />;
      case "assets":      return <Assets />;
      default:            return null;
    }
  };

  return (
    <div className="w-full font-sans">
      <div className="mb-4 bg-white border border-slate-200 rounded-xl p-1 flex gap-1 shadow-sm">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-black uppercase tracking-wide transition-all
              ${active === key
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}`}
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </button>
        ))}
      </div>
      <div key={active}>{renderTab()}</div>
    </div>
  );
};

export default ExpensePage;