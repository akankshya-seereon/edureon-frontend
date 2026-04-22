import { Eye, Trash2, Plus, CheckCircle, AlertCircle, Loader2, Power, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";

const statusStyles = {
  Active: "bg-emerald-100 text-emerald-700",
  Suspended: "bg-rose-100 text-rose-600",
  Trial: "bg-blue-100 text-blue-700",
};

const formatText = (text = "") =>
  text ? text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";

export default function Institute() {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  /* ================= LOAD LIVE DATA FROM MYSQL ================= */
  const fetchInstitutes = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getInstitutes();
      
      const formattedData = response.data.map(dbInst => ({
        id: dbInst.id,
        status: dbInst.status || "Active", 
        createdAt: dbInst.joined || dbInst.created_at, 
        plan: dbInst.plan || "Premium",
        organisation: {
          name: dbInst.name || "N/A",          
          email: dbInst.email || "N/A",        
          city: dbInst.city || "N/A",          
          state: dbInst.state || "N/A",        
          type: dbInst.type || "Institute",    
        },
        raw: dbInst 
      }));

      setInstitutes(formattedData);
      setFilteredInstitutes(formattedData);
    } catch (error) {
      console.error("Failed to load institutes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  /* ================= FILTER ================= */
  useEffect(() => {
    let filtered = [...institutes];

    if (searchTerm) {
      filtered = filtered.filter((inst) =>
        inst?.organisation?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "All") {
      filtered = filtered.filter((inst) => inst?.organisation?.type === typeFilter);
    }

    if (statusFilter !== "All") {
      filtered = filtered.filter((inst) => inst?.status === statusFilter);
    }

    setFilteredInstitutes(filtered);
  }, [searchTerm, typeFilter, statusFilter, institutes]);

  /* ================= DELETE (API CALL) ================= */
  const deleteInstitute = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this institute?")) {
      try {
        await adminService.deleteInstitute(id); 
        const updated = institutes.filter((inst) => inst?.id !== id);
        setInstitutes(updated); 
      } catch (error) {
        alert("Failed to delete institute.");
        console.error(error);
      }
    }
  };

  /* ================= TOGGLE STATUS (API CALL) ================= */
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newIsActive = currentStatus === "Active" ? false : true;
      
      await adminService.updateInstituteStatus(id, newIsActive); 

      const updated = institutes.map((inst) =>
        inst?.id === id
          ? {
              ...inst,
              status: currentStatus === "Active" ? "Suspended" : "Active",
            }
          : inst
      );
      setInstitutes(updated);
    } catch (error) {
      alert("Failed to change status.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 text-left">
      <div className="mx-auto w-full max-w-[1500px]">

        {/* ================= HEADER ================= */}
        {/* 🚀 FIXED: Perfect horizontal alignment using items-center */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
              Institute Master List
            </h1>
            <p className="text-sm font-medium text-slate-500">
              View and manage all registered institutes
            </p>
          </div>

          <button
            onClick={() => navigate("/super-admin/institutes/create")}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-md shadow-blue-200 transition-all shrink-0 w-full md:w-auto"
          >
            <Plus size={16} strokeWidth={3} /> Add Institute
          </button>
        </div>

        {/* ================= STATS ================= */}
        {/* 🚀 FIXED: Updated to match dashboard KPI card styling */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total" value={institutes.length} />
          <StatCard
            title="Active"
            value={institutes.filter((i) => i.status === "Active").length}
            color="text-emerald-500"
          />
          <StatCard
            title="Suspended"
            value={institutes.filter((i) => i.status === "Suspended").length}
            color="text-rose-500"
          />
          <StatCard
            title="Trial"
            value={institutes.filter((i) => i.status === "Trial").length}
            color="text-blue-500"
          />
        </div>

        {/* ================= MAIN CONTAINER ================= */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* ================= FILTERS ================= */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            
            <div className="flex-1 w-full relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search institutes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:max-w-md pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-700 transition-all"
              />
            </div>

            <div className="flex gap-3 flex-wrap w-full md:w-auto">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="College">College</option>
                <option value="School">School</option>
                <option value="Institute">Institute</option>
                <option value="University">University</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Trial">Trial</option>
              </select>
            </div>
          </div>

          {/* ================= DESKTOP TABLE ================= */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  {/* 🚀 FIXED: Added text-left to force left alignment */}
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Organisation</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Plan</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Created Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {filteredInstitutes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-500 font-medium">
                      No institutes found.
                    </td>
                  </tr>
                )}
                {filteredInstitutes.map((inst) => (
                  <tr key={inst?.id} className="hover:bg-slate-50/50 transition-colors group">
                    
                    {/* 🚀 FIXED: Organisation formatting layout */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                          {inst?.organisation?.name?.charAt(0) || "I"}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                            {formatText(inst?.organisation?.name)}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                            {inst?.organisation?.email || "No email provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {inst?.organisation?.type}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {formatText(inst?.organisation?.city)},{" "}
                      {formatText(inst?.organisation?.state)}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {inst?.plan}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[inst?.status] || statusStyles.Active}`}>
                        {inst?.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {inst?.createdAt ? new Date(inst.createdAt).toLocaleDateString() : "-"}
                    </td>

                    <td className="px-6 py-4">
                      {/* 🚀 FIXED: Clean circular action buttons */}
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/super-admin/institutes/${inst?.id}/view`, {
                              state: { institute: inst.raw || inst },
                            })
                          }
                          className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all"
                          title="View Profile"
                        >
                          <Eye size={14} strokeWidth={2.5} />
                        </button>

                        <button
                          onClick={() => toggleStatus(inst?.id, inst?.status)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            inst.status === "Active" 
                              ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white" 
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                          }`}
                          title="Toggle Status"
                        >
                          <Power size={14} strokeWidth={2.5} />
                        </button>

                        <button
                          onClick={() => deleteInstitute(inst?.id)}
                          className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all"
                          title="Delete Institute"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARD VIEW ================= */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredInstitutes.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-medium">No institutes found.</div>
            )}
            {filteredInstitutes.map((inst) => (
              <div key={inst?.id} className="bg-white p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                        {inst?.organisation?.name?.charAt(0) || "I"}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight">
                          {formatText(inst?.organisation?.name)}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                          {inst?.organisation?.email}
                        </div>
                      </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${statusStyles[inst?.status]}`}>
                    {inst?.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 bg-slate-50 rounded-xl p-3">
                  <div><strong className="text-slate-400 text-xs uppercase tracking-wider block mb-0.5">Type</strong> {inst?.organisation?.type}</div>
                  <div><strong className="text-slate-400 text-xs uppercase tracking-wider block mb-0.5">Plan</strong> {inst?.plan}</div>
                  <div className="col-span-2"><strong className="text-slate-400 text-xs uppercase tracking-wider block mb-0.5">Location</strong> {formatText(inst?.organisation?.city)}, {formatText(inst?.organisation?.state)}</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => navigate(`/super-admin/institutes/${inst?.id}/view`, { state: { institute: inst.raw || inst } })}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-sm font-bold transition"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    onClick={() => toggleStatus(inst?.id, inst?.status)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-bold transition"
                  >
                    <Power size={16} /> Status
                  </button>
                  <button
                    onClick={() => deleteInstitute(inst?.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl text-sm font-bold transition"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE STAT CARD ================= */
function StatCard({ title, value, color = "text-slate-800" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}