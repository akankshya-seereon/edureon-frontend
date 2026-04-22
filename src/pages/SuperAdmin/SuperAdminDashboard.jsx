import { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; 
import {
  Building2, Zap, Users, GraduationCap, Wallet, AlertCircle, Clock,
  Search, ArrowLeft, Eye, DollarSign, UserCheck,
  CalendarCheck, TrendingUp, Star, Phone, Mail, MapPin, X, Loader2,
  BookOpen, ClipboardList, Receipt, LayoutGrid, Briefcase, Banknote, ShieldCheck, CheckSquare
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Badge = ({ label, type }) => {
  const base = "text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wide uppercase";
  const styles = {
    Active: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-100 text-emerald-700",
    Suspended: "bg-rose-100 text-rose-600",
    suspended: "bg-rose-100 text-rose-600",
    Premium: "bg-violet-100 text-violet-700",
    Standard: "bg-blue-100 text-blue-700",
    Basic: "bg-slate-100 text-slate-600",
    Completed: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
  };
  return <span className={`${base} ${styles[label] || styles[type] || styles.Basic}`}>{label || "Unknown"}</span>;
};

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 p-4 rounded-2xl ${color}`}>
    <div className="p-2 bg-white/60 rounded-xl">
      <Icon size={18} className="text-slate-700" />
    </div>
    <div>
      <p className="text-[11px] text-slate-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

const DashboardCard = ({ title, value, subtext, icon: Icon, bgType }) => {
  const styles = { purple: "bg-[#EBEBFF]", beige: "bg-[#FFF2E5]", green: "bg-[#E5Fcf5]", blue: "bg-[#E5F0FF]" };
  return (
    <div className={`${styles[bgType] || styles.purple} p-5 sm:p-6 rounded-2xl flex flex-col justify-between h-40 transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start">
        <h3 className="text-sm sm:text-base font-semibold text-slate-700">{title}</h3>
        <Icon size={22} className="text-slate-700 opacity-80" />
      </div>
      <div className="mt-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</h2>
      </div>
      <div className="mt-1">
        <p className="text-[10px] sm:text-sm text-slate-500 font-medium">{subtext}</p>
      </div>
    </div>
  );
};

// ─── Institute Picker Modal ───────────────────────────────────────────────────
const InstitutePicker = ({ institutes, onSelect, onClose }) => {
  const [query, setQuery] = useState("");

  const filtered = institutes.filter(i =>
    (i.name || i.organisation?.name || "").toLowerCase().includes(query.toLowerCase()) ||
    (i.city || i.organisation?.city || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Select Institute</h3>
            <p className="text-xs text-slate-400 mt-0.5">Choose an institute to view its details</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              autoFocus type="text" placeholder="Search by name or city..." value={query}
              onChange={e => setQuery(e.target.value)}
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            />
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-10">No institutes found</p>
          )}
          {filtered.map(ins => {
            const name = ins.name || ins.organisation?.name || "Unnamed";
            const city = ins.city || ins.organisation?.city || "N/A";
            return (
              <button
                key={ins.id} onClick={() => { onSelect(ins); onClose(); }}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-violet-50/60 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#EBEBFF] flex items-center justify-center shrink-0">
                  <Building2 size={17} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                  <p className="text-xs text-slate-400">{city} · {ins.totalStudents || 0} students</p>
                </div>
                <Badge label={ins.status} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Deep Institute Detail View ───────────────────────────────────────────────
const InstituteDetail = ({ institute: initialInst, onBack }) => {
  const navigate = useNavigate();
  const { startImpersonation } = useAuth(); 

  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  const tabs = [
    { id: "overview",     label: "Overview",     icon: Building2 },
    { id: "info",         label: "Info & Legal", icon: ShieldCheck },
    { id: "students",     label: "Students",     icon: GraduationCap },
    { id: "faculty",      label: "Faculty",      icon: Users },
    { id: "batches",      label: "Batches",      icon: LayoutGrid },
    { id: "exams",        label: "Exams",        icon: ClipboardList },
    { id: "collections",  label: "Collections",  icon: Banknote },
    { id: "placements",   label: "Placements",   icon: Briefcase },
    { id: "expenses",     label: "Expenses",     icon: Receipt },
  ];

  useEffect(() => {
    const fetchDeepDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/superadmin/institutes/${initialInst.id}/full-details`);
        setDetails(res.data.success ? res.data.data : initialInst);
      } catch (err) {
        console.error("Failed to fetch deep details", err);
        setDetails(initialInst);
      } finally {
        setLoading(false);
      }
    };
    fetchDeepDetails();
  }, [initialInst.id]);

  if (loading || !details) {
    return (
      <div className="w-full py-32 flex flex-col items-center justify-center text-slate-400 animate-fadeIn">
        <Loader2 size={36} className="animate-spin text-blue-600 mb-4" />
        <p className="font-semibold text-sm">Fetching complete institute database...</p>
      </div>
    );
  }

  const ins = { ...initialInst, ...details };
  const instName = ins.name || ins.organisation?.name || "Unnamed Institute";
  const instCity = ins.city || ins.organisation?.city || ins.address || "Location unavailable";
  const instEmail = ins.email || ins.organisation?.email || "N/A";
  const instPhone = ins.phone || ins.organisation?.phone || "N/A";

  const handleImpersonate = () => {
    startImpersonation({ id: ins.id, name: instName }, navigate);
  };

  return (
    <div className="w-full animate-fadeIn">
      {/* Back */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to All Institutes
        </button>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#f0edff] to-[#fff8f0] rounded-3xl p-6 mb-6 border border-violet-100">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <Building2 size={26} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{instName}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {instCity}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge label={ins.status || "Active"} />
                <Badge label={ins.plan || "Premium"} />
              </div>

              <button
                onClick={handleImpersonate}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2 w-fit"
              >
                <Eye size={14} /> Manage This Institute
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-500 space-y-1 sm:text-right">
            <p className="flex sm:justify-end items-center gap-1.5"><Mail size={12} /> {instEmail}</p>
            <p className="flex sm:justify-end items-center gap-1.5"><Phone size={12} /> {instPhone}</p>
            <p className="font-mono text-xs font-bold text-blue-600 mt-2 bg-blue-100 inline-block px-2 py-1 rounded-md">
              Code: {ins.institute_code || ins.id}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
          <StatPill icon={GraduationCap} label="Total Students" value={ins.totalStudents?.toLocaleString() || 0} color="bg-white/70" />
          <StatPill icon={Users} label="Total Faculty" value={ins.totalFaculty || 0} color="bg-white/70" />
          <StatPill icon={LayoutGrid} label="Active Batches" value={ins.totalBatches || 0} color="bg-white/70" />
          <StatPill icon={Banknote} label="Collections" value={`₹${ins.totalCollections?.toLocaleString() || ins.revenueCollected?.toLocaleString() || 0}`} color="bg-white/70" />
          <StatPill icon={Briefcase} label="Placements" value={ins.totalPlacements || 0} color="bg-white/70" />
        </div>
      </div>

      {/* Scrollable Tabs */}
      <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl mb-6 overflow-x-auto no-scrollbar border border-slate-100">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.id ? "bg-white text-blue-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* 🚀 FIXED SPACING: Removed min-h-[400px] so the box tightly wraps its content */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        {tab === "overview" && (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Current Plan",       value: ins.plan || "Premium",                                                    icon: TrendingUp },
                { label: "Registration Date",  value: ins.created_at ? new Date(ins.created_at).toLocaleDateString() : new Date().toLocaleDateString(), icon: Clock },
                { label: "Data Storage",       value: "Normal usage",                                                           icon: BookOpen },
                { label: "Database Status",    value: "Healthy",                                                                icon: AlertCircle },
                { label: "Admin Name",         value: ins.admin_name || "N/A",                                                  icon: UserCheck },
                { label: "Total Expenses",     value: `₹${ins.totalExpenses?.toLocaleString() || 0}`,                           icon: Receipt },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
                    <p className="text-lg font-black text-slate-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "info" && (
          <div className="animate-fadeIn space-y-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <UserCheck className="text-blue-600" size={20} /> Management & Directors
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(ins.directors || []).length > 0 ? ins.directors.map((dir, i) => (
                  <div key={i} className="border border-slate-100 bg-slate-50 p-5 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {dir.name ? dir.name.charAt(0) : "D"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{dir.name || "N/A"}</p>
                      <p className="text-xs text-slate-500">{dir.phone || "No phone"}</p>
                      <p className="text-xs text-slate-500">{dir.email || "No email"}</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400 p-4">No director details available.</p>}
              </div>
            </div>
            <hr className="border-slate-100" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={20} /> Legal & Registration
              </h3>
              {ins.legal ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="border border-slate-100 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Registration Number</p>
                    <p className="font-mono text-sm font-semibold text-slate-800 mt-1">{ins.legal.registration_number || "N/A"}</p>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Tax ID (PAN/GST)</p>
                    <p className="font-mono text-sm font-semibold text-slate-800 mt-1">{ins.legal.tax_id || "N/A"}</p>
                  </div>
                  <div className="border border-slate-100 p-4 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Establishment Year</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{ins.legal.established_year || "N/A"}</p>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-400 p-4">No legal details available.</p>}
            </div>
            <hr className="border-slate-100" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="text-blue-600" size={20} /> Campus Branches
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(ins.branches || []).length > 0 ? ins.branches.map((branch, i) => (
                  <div key={i} className="border border-slate-200 p-5 rounded-2xl">
                    <h4 className="font-bold text-slate-800 mb-1">{branch.name || `Branch ${i + 1}`}</h4>
                    <p className="text-sm text-slate-500 flex items-start gap-2 mt-2">
                      <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                      <span>{branch.address || "No address provided"}, {branch.city || ""} - {branch.zip || ""}</span>
                    </p>
                    {branch.phone && (
                      <p className="text-sm text-slate-500 flex items-center gap-2 mt-2">
                        <Phone size={16} className="text-slate-400" /> {branch.phone}
                      </p>
                    )}
                  </div>
                )) : <p className="text-sm text-slate-400 p-4">No branch details available.</p>}
              </div>
            </div>
          </div>
        )}

        {tab === "students" && (
          <div className="animate-fadeIn">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Enrolled Students</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(ins.studentsList || []).length > 0 ? ins.studentsList.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-sm text-slate-700">{s.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-500">{s.roll || s.roll_no || "N/A"}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-slate-600">{s.batch || "N/A"}</td>
                      <td className="py-3 px-4"><Badge label={s.status || "Active"} /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-10 text-center text-slate-400">No students data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {["faculty", "batches", "exams", "collections", "placements", "expenses"].includes(tab) && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-fadeIn">
            <ClipboardList size={40} className="mb-3 opacity-30" />
            <p className="font-semibold text-sm capitalize">{tab} data coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export const SuperAdminDashboard = () => {
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const revenueData = [
    { name: 'Jan', value: 240 }, { name: 'Feb', value: 139 }, { name: 'Mar', value: 980 },
    { name: 'Apr', value: 390 }, { name: 'May', value: 480 }, { name: 'Jun', value: 380 }, { name: 'Jul', value: 430 },
  ];
  const enrollmentData = [
    { name: 'CS', students: 400 }, { name: 'IT', students: 300 }, { name: 'ME', students: 200 },
    { name: 'EE', students: 278 }, { name: 'CE', students: 189 }, { name: 'MBA', students: 239 },
  ];
  const expenseData = [
    { name: 'Salaries', value: 600 }, { name: 'Maintenance', value: 300 }, { name: 'Events', value: 100 },
  ];
  const PIE_COLORS = ['#93c5fd', '#86efac', '#fde047'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, institutesRes] = await Promise.all([
          api.get("/superadmin/dashboard-stats"),
          api.get("/superadmin/institutes"),
        ]);
        if (statsRes.data.success) setStatsData(statsRes.data.data);
        if (institutesRes.data.success) setInstitutes(institutesRes.data.data || []);
      } catch (error) {
        console.error("Error fetching super admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-3">
        <Loader2 size={32} className="animate-spin text-blue-600" />
        <p className="font-semibold text-sm">Loading Dashboard Data...</p>
      </div>
    );
  }

  const cardsConfig = [
    { title: "Total Institutes",  value: statsData?.totalInstitutes || institutes.length || 0,               subtext: "All registered institutes",  icon: Building2, bgType: "purple" },
    { title: "Active Institutes", value: statsData?.activeInstitutes || institutes.filter(i => i.status === 'Active').length || 0, subtext: "Currently active", icon: Zap, bgType: "beige" },
    { title: "Total Students",    value: statsData?.totalStudents?.toLocaleString() || 0,                    subtext: "All enrolled students",       icon: GraduationCap, bgType: "blue" },
    { title: "Total Teachers",    value: statsData?.totalTeachers?.toLocaleString() || 0,                    subtext: "All faculties",              icon: Users,     bgType: "green" },
    { title: "Monthly Revenue",   value: `₹${statsData?.monthlyRevenue?.toLocaleString() || 0}`,             subtext: "This month's revenue",        icon: Wallet,    bgType: "purple" },
    { title: "Monthly Expenses",  value: `₹${statsData?.monthlyExpenses?.toLocaleString() || 0}`,            subtext: "This month's expenses",       icon: Receipt,   bgType: "beige" },
    { title: "Total Revenue",     value: `₹${statsData?.totalRevenue?.toLocaleString() || statsData?.totalCollections?.toLocaleString() || 0}`, subtext: "Overall revenue", icon: Banknote,  bgType: "blue" },
    { title: "Total Courses",     value: statsData?.totalCourses?.toLocaleString() || 0,                     subtext: "Across all institutes",       icon: BookOpen,  bgType: "green" },
    { title: "Total Placements",  value: statsData?.totalPlacements?.toLocaleString() || 0,                  subtext: "Students hired globally",     icon: Briefcase, bgType: "purple" },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease both; }
        .recharts-wrapper { font-family: inherit !important; }
      `}</style>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 text-left">
        {/* 🚀 FIXED: Alignment - Used exact vertical centering on the header container */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">Super Admin Hub</h1>
            <p className="text-sm text-slate-500 mt-1.5 font-medium">Manage and monitor all tenant institutes</p>
          </div>
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-200 shrink-0"
          >
            <Search size={16} /> Select Institute
          </button>
        </div>

        {/* Selected Institute Banner */}
        {/* 🚀 FIXED: Alignment - Banner uses better flex wrap to keep things level */}
        {selectedInstitute && !showPicker && (
          <div className="mb-6 bg-violet-50 border border-violet-200 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3 min-w-0">
              <Building2 size={18} className="text-blue-600 shrink-0" />
              {/* 🚀 FIXED: Text changed to "Viewing Institute" */}
              <span className="text-sm font-semibold text-blue-800 truncate">
                <span className="text-slate-500 font-medium mr-1">Viewing Institute:</span> 
                {selectedInstitute.name || selectedInstitute.organisation?.name || "Unnamed"}
              </span>
              <Badge label={selectedInstitute.status} />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {/* 🚀 FIXED: Text changed to "Change Institute" */}
              <button onClick={() => setShowPicker(true)} className="text-xs text-blue-600 font-bold hover:text-blue-800 hover:underline transition-all">
                Change Institute
              </button>
              <div className="w-px h-4 bg-violet-200"></div>
              <button onClick={() => setSelectedInstitute(null)} className="p-1 rounded-lg hover:bg-violet-100 transition-colors">
                <X size={16} className="text-violet-500 hover:text-rose-500 transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {selectedInstitute ? (
          <InstituteDetail
            institute={selectedInstitute}
            onBack={() => setSelectedInstitute(null)}
          />
        ) : (
          <div className="animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardsConfig.map((stat, idx) => (
                <DashboardCard key={idx} {...stat} />
              ))}
            </div>

            {/* Today's Meetings */}
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-700">Today's Meetings</h3>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-600 transition-colors"
                >
                  + Schedule
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { time: "10:00", dur: "45m", title: "Board Meeting — Q4 Review",    sub: "All Directors, CFO · Conference Room A", status: "In Progress", color: "#22c55e", bg: "#eaffed", border: "#bbf7d0", textColor: "text-emerald-600", badgeBg: "bg-emerald-50 border-emerald-100", pulse: true },
                  { time: "12:00", dur: "30m", title: "Agent Performance Review",     sub: "Admission Head, Agents · MD Cabin",      status: "Upcoming",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", textColor: "text-blue-600",    badgeBg: "bg-blue-50 border-blue-100",     pulse: false },
                  { time: "2:30",  dur: "1hr", title: "New Hostel Wing Planning",     sub: "Architect, Finance · Board Room",        status: "Upcoming",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", textColor: "text-blue-600",    badgeBg: "bg-blue-50 border-blue-100",     pulse: false },
                  { time: "4:00",  dur: "30m", title: "TCS Placement MoU",            sub: "TPO, TCS HR · MD Cabin",                 status: "Upcoming",    color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", textColor: "text-blue-600",    badgeBg: "bg-blue-50 border-blue-100",     pulse: false },
                ].map((m, i) => (
                  <div key={i} style={{ background: m.bg, borderColor: m.border }} className="border rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" style={{ background: m.color }} />
                    <div className="flex items-center gap-6 pl-4">
                      <div>
                        <p className="text-base font-black text-slate-800">{m.time}</p>
                        <p className="text-xs text-slate-500 font-semibold">{m.dur}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{m.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{m.sub}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 font-bold text-xs border px-3 py-1.5 rounded-full ${m.textColor} ${m.badgeBg}`}>
                      <div className={`w-2 h-2 rounded-full ${m.pulse ? 'animate-pulse' : ''}`} style={{ background: m.color }} />
                      {m.status}
                    </div>
                  </div>
                ))}
                {/* Done meeting */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden opacity-75">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-400" />
                  <div className="flex items-center gap-6 pl-4">
                    <div>
                      <p className="text-base font-black text-slate-800">9:00</p>
                      <p className="text-xs text-slate-500 font-semibold">20m</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Daily Standup</p>
                      <p className="text-xs text-slate-500 mt-0.5">Principal, Registrar · MD Cabin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                    <CheckSquare size={14} className="text-emerald-500" /> Done
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="border border-slate-100 rounded-3xl p-6 shadow-sm bg-white w-full min-w-0">
                <h4 className="text-sm font-bold text-slate-500 mb-6 text-left">Revenue Trend (MoM)</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="value" stroke="#93c5fd" strokeWidth={3} dot={{ r: 4, fill: "#93c5fd" }} activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-slate-100 rounded-3xl p-6 shadow-sm bg-white w-full min-w-0">
                <h4 className="text-sm font-bold text-slate-500 mb-6 text-left">Enrollment by Program</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={30}>
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="students" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-slate-100 rounded-3xl p-6 shadow-sm bg-white w-full min-w-0">
                <h4 className="text-sm font-bold text-slate-500 mb-2 text-left">Expense Breakdown</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Pie data={expenseData} innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {expenseData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-slate-100 rounded-3xl p-6 shadow-sm bg-white w-full min-w-0">
                <h4 className="text-sm font-bold text-slate-500 mb-6 text-left">Branch Comparison</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={enrollmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={30}>
                    <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="students" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#f0fdfa] border border-[#ccfbf1] p-5 rounded-3xl">
                <p className="text-xs font-semibold text-slate-500 mb-2">Occupancy</p>
                <p className="text-3xl font-black text-[#0ea5e9]">87%</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Hostel</p>
              </div>
              <div className="bg-[#f0fdf4] border border-[#ccfbf1] p-5 rounded-3xl">
                <p className="text-xs font-semibold text-slate-500 mb-2">Fee Recovery</p>
                <p className="text-3xl font-black text-[#10b981]">87%</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">+5%</p>
              </div>
              <div className="bg-[#f0f9ff] border border-[#e0f2fe] p-5 rounded-3xl">
                <p className="text-xs font-semibold text-slate-500 mb-2">Avg CGPA</p>
                <p className="text-3xl font-black text-[#3b82f6]">7.8</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">All branches</p>
              </div>
              <div className="bg-[#fff1f2] border border-[#ffe4e6] p-5 rounded-3xl">
                <p className="text-xs font-semibold text-slate-500 mb-2">Dropout</p>
                <p className="text-3xl font-black text-[#f43f5e]">2.1%</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">Target &lt;3%</p>
              </div>
            </div>

            {/* Branch Performance Table */}
            <div className="mt-8">
              <h4 className="text-sm font-bold text-slate-500 mb-4 text-left">Branch Performance</h4>
              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="py-4 px-6 font-semibold text-sm">Branch</th>
                      <th className="py-4 px-6 font-semibold text-sm">Students</th>
                      <th className="py-4 px-6 font-semibold text-sm">Collection</th>
                      <th className="py-4 px-6 font-semibold text-sm">Pass %</th>
                      <th className="py-4 px-6 font-semibold text-sm">Placement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[
                      { branch: "CSE", students: "450", col: "91%", pass: "96%", place: "95%" },
                      { branch: "ECE", students: "380", col: "85%", pass: "93%", place: "88%" },
                      { branch: "ME",  students: "320", col: "82%", pass: "89%", place: "82%" },
                      { branch: "MBA", students: "120", col: "92%", pass: "97%", place: "90%" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 text-sm font-medium text-slate-800">{row.branch}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{row.students}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{row.col}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{row.pass}</td>
                        <td className="py-4 px-6 text-sm text-slate-600">{row.place}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Picker Modal */}
        {showPicker && (
          <InstitutePicker
            institutes={institutes}
            onSelect={setSelectedInstitute}
            onClose={() => setShowPicker(false)}
          />
        )}

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Schedule New Meeting</h3>
                <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
              <div className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Meeting Title</label>
                  <input type="text" placeholder="e.g., Q3 Budget Review" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Date</label>
                    <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Time</label>
                    <input type="time" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Participants / Room</label>
                  <input type="text" placeholder="e.g., Board Room A" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button
                  onClick={() => { alert("Meeting Scheduled!"); setShowScheduleModal(false); }}
                  className="w-full bg-blue-600 text-white rounded-xl py-3 font-bold shadow-md hover:bg-blue-700 transition-colors mt-4"
                >
                  Save Meeting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SuperAdminDashboard;