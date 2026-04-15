import React from "react";
import { NavLink } from "react-router-dom";
import { Wallet } from "lucide-react";

export const ExpensesSidebarItem = () => (
  <NavLink
    to="/admin/expenses"
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
      ${isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
      }`
    }
  >
    <Wallet size={18} className="flex-shrink-0" />
    <span>Expenses</span>
  </NavLink>
);

export default ExpensesSidebarItem;