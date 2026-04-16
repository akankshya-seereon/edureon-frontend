import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Eye, 
  Power, 
  Filter, 
  Download,
  MoreVertical 
} from "lucide-react";

export const InstituteList = () => {
  const navigate = useNavigate();

  // --- MOCK DATA ---
  const [institutes, setInstitutes] = useState([
    { id: 1, name: "Global Tech University", type: "University", city: "San Francisco", state: "CA", plan: "Enterprise", status: "Active", createdDate: "2024-01-15" },
    { id: 2, name: "Sunrise Public School", type: "School", city: "New York", state: "NY", plan: "Basic", status: "Suspended", createdDate: "2024-02-10" },
    { id: 3, name: "Ace Coaching Center", type: "Coaching", city: "Austin", state: "TX", plan: "Standard", status: "Trial", createdDate: "2024-03-05" },
    { id: 4, name: "City College of Arts", type: "College", city: "Chicago", state: "IL", plan: "Standard", status: "Active", createdDate: "2023-11-20" },
    { id: 5, name: "Future Kids Academy", type: "School", city: "Seattle", state: "WA", plan: "Basic", status: "Active", createdDate: "2024-01-02" },
  ]);

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    type: "All",
    status: "All",
    plan: "All",
    search: ""
  });

  // --- HANDLERS ---
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleStatus = (id) => {
    setInstitutes(prev => prev.map(inst => {
      if (inst.id === id) {
        return { ...inst, status: inst.status === "Active" ? "Suspended" : "Active" };
      }
      return inst;
    }));
  };

  // --- FILTERING LOGIC ---
  const filteredData = institutes.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === "All" || item.type === filters.type;
    const matchesStatus = filters.status === "All" || item.status === filters.status;
    const matchesPlan = filters.plan === "All" || item.plan === filters.plan;
    return matchesSearch && matchesType && matchesStatus && matchesPlan;
  });

  // --- HELPER FOR BADGE COLORS ---
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-700 border-green-200";
      case "Suspended": return "bg-red-100 text-red-700 border-red-200";
      case "Trial": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="w-full">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institute Master List</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage all registered institutes</p>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
             <Download size={18} /> Export
           </button>
           <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm">
             + Add Institute
           </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
        
        {/* Search */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-full md:w-64">
          <Search size={18} className="text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search institutes..." 
            className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-700"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Dropdowns */}
        <div className="flex gap-3 flex-wrap">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="College">College</option>
            <option value="School">School</option>
            <option value="Coaching">Coaching</option>
          </select>

          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Trial">Trial</option>
          </select>

          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:border-blue-500 outline-none cursor-pointer"
            onChange={(e) => handleFilterChange("plan", e.target.value)}
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Institute Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{item.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {item.city}, {item.state}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {item.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{item.createdDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Action - Navigates to Profile */}
                        <button 
                          onClick={() => navigate("/super-admin/institutes/view")} 
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Activate/Suspend Action */}
                        <button 
                          onClick={() => toggleStatus(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.status === "Active" 
                              ? "text-red-500 hover:bg-red-50" 
                              : "text-green-600 hover:bg-green-50"
                          }`}
                          title={item.status === "Active" ? "Suspend Institute" : "Activate Institute"}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colspan="7" className="px-6 py-10 text-center text-slate-500">
                    No institutes found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};