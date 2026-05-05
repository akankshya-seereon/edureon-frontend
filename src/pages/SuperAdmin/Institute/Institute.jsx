import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, Users, FileText, GitBranch,
  MapPin, Landmark, ShieldCheck, Zap,
  CreditCard, BookOpen, ScrollText, BadgeCheck, Calendar,
  Eye, Trash2, Plus, ArrowLeft, Search, Settings
} from "lucide-react";
import apiBaseUrl from "../../../config/baseurl";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (text = "") =>
  text?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || "";

const safeParseJSON = (data) => {
  if (!data) return null;
  if (typeof data === "object") return data;
  try { return JSON.parse(data); } catch { return null; }
};

const statusStyles = {
  Active: "bg-green-100 text-green-700",
  Suspended: "bg-red-100 text-red-700",
  Trial: "bg-blue-100 text-blue-700",
};

// ─── Reusable Components ───────────────────────────────────────────────────────

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col py-2 border-b border-gray-50 md:border-none">
    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="text-sm text-gray-800 font-medium break-words leading-tight">
      {value || <span className="text-gray-400 italic font-normal">Not provided</span>}
    </span>
  </div>
);

const DocRow = ({ label, value, doc }) => {
  const hasDoc = doc && (typeof doc === "string" ? doc.trim() !== "" : Object.keys(doc).length > 0);
  return (
    <div className="flex flex-col py-2 border-b border-gray-50 md:border-none">
      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-800 font-medium">
          {value || <span className="text-gray-400 italic font-normal">Not provided</span>}
        </span>
        {hasDoc ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
            <BadgeCheck size={12} /> Uploaded
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">NO FILE</span>
        )}
      </div>
    </div>
  );
};

const LegalCat = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 pt-6 pb-4 col-span-full">
    <Icon size={14} className="text-blue-500 shrink-0" />
    <span className="text-xs font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">{label}</span>
    <div className="flex-1 h-px bg-gray-200 ml-1" />
  </div>
);

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6 pb-4 border-b border-gray-100">
    <h2 className="text-lg font-bold text-gray-800">{title}</h2>
    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

// ─── Tab Menu ─────────────────────────────────────────────────────────────────

const MENU = [
  { id: "organisation", label: "Organisation", icon: Building2 },
  { id: "directors", label: "Directors", icon: Users },
  { id: "legal", label: "Legal Documents", icon: FileText },
  { id: "branches", label: "Branches", icon: GitBranch },
];

const HeaderTabs = ({ activeMenu, setActiveMenu, counts }) => (
  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 mt-6 pt-4 pb-1">
    {MENU.map(({ id, label, icon: Icon }) => {
      const isActive = activeMenu === id;
      const count = counts[id];
      return (
        <button
          key={id}
          onClick={() => setActiveMenu(id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${isActive
            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
          <Icon size={16} />
          {label}
          {count > 0 && (
            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
              }`}>
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

// ─── Panels ───────────────────────────────────────────────────────────────────

const OrganisationPanel = ({ org, institute }) => (
  <div>
    <SectionTitle title="Organisation Details" subtitle="Registered information and contact details" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 bg-gray-50/50 p-6 rounded-xl border border-gray-50">
      <InfoRow label="Registered Name" value={fmt(org.name)} />
      <InfoRow label="Organisation Type" value={org.type} />
      <InfoRow label="Phone" value={org.phone} />
      <InfoRow label="Alternate Phone" value={org.altPhone} />
      <InfoRow label="Email" value={org.email} />
      <InfoRow label="Secondary Email" value={org.secondaryEmail} />
      <div className="md:col-span-2 lg:col-span-3">
        <InfoRow label="Address Line 1" value={fmt(org.address1)} />
      </div>
      <div className="md:col-span-2 lg:col-span-3">
        <InfoRow label="Address Line 2" value={fmt(org.address2)} />
      </div>
      <InfoRow label="City" value={fmt(org.city)} />
      <InfoRow label="State" value={fmt(org.state)} />
      <InfoRow label="PIN Code" value={org.pin} />
      <InfoRow label="Head Office" value={fmt(org.headOffice)} />
      <InfoRow label="Member Since" value={institute.createdAt} />
    </div>
  </div>
);

const DirectorsPanel = ({ directors }) => {
  if (!directors || directors.length === 0) return (
    <div>
      <SectionTitle title="Directors / Partners" subtitle="People associated with this institute" />
      <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <Users size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">No directors added yet.</p>
      </div>
    </div>
  );
  return (
    <div>
      <SectionTitle title={`Directors / Partners (${directors.length})`} subtitle="People associated with this institute" />
      <div className="space-y-8">
        {directors.map((d, idx) => (
          <div key={idx} className={idx > 0 ? "pt-8 border-t border-gray-100" : ""}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                {d.name?.[0]?.toUpperCase() || (idx + 1)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{d.name ? fmt(d.name) : `Director ${idx + 1}`}</p>
                {d.email && <p className="text-sm text-gray-500">{d.email}</p>}
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Personal Details */}
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-50">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">Personal Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                  <InfoRow label="Email" value={d.email} />
                  <InfoRow label="Secondary Email" value={d.secondaryEmail} />
                  <InfoRow label="Contact" value={d.contact} />
                  <InfoRow label="Mobile" value={d.mobile} />
                  <InfoRow label="WhatsApp" value={d.whatsapp} />
                  <InfoRow label="Gender" value={d.gender} />
                  <InfoRow label="Date of Birth" value={d.dob} />
                  <InfoRow label="% of Interest" value={d.interest ? `${d.interest}%` : null} />
                  <InfoRow label="Father's Name" value={fmt(d.father)} />
                  <InfoRow label="Spouse Name" value={fmt(d.spouse)} />
                  <InfoRow label="No. of Children" value={d.children} />
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-50">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">Address Information</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Current Address</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {[d.currentAddress?.line1, d.currentAddress?.line2, fmt(d.currentAddress?.city), fmt(d.currentAddress?.state), d.currentAddress?.pin].filter(Boolean).join(", ") || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Permanent Address</h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {d.sameAddress ? "Same as Current Address" : ([d.permanentAddress?.line1, d.permanentAddress?.line2, fmt(d.permanentAddress?.city), fmt(d.permanentAddress?.state), d.permanentAddress?.pin].filter(Boolean).join(", ") || "Not provided")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Identity & Bank Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">Identity Documents</p>
                  <div className="grid grid-cols-1 gap-y-5">
                    <DocRow label="PAN Number" value={d.documents?.panNo} doc={d.documents?.panDoc} />
                    <DocRow label="Aadhaar Number" value={d.documents?.aadhaarNo} doc={d.documents?.aadhaarDoc} />
                  </div>
                </div>
                
                <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">Bank Details</p>
                  <div className="grid grid-cols-1 gap-y-5">
                    <InfoRow label="Bank Name" value={d.bank?.bankName} />
                    <InfoRow label="Account Number" value={d.bank?.accountNumber} />
                    <InfoRow label="IFSC Code" value={d.bank?.ifscCode} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LegalPanel = ({ legal }) => (
  <div>
    <SectionTitle title="Legal Documents" subtitle="Certificates, NOCs and compliance documents" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-50">
      
      <LegalCat icon={Landmark} label="Land & Building" />
      <DocRow label="Property Deed" value={legal?.propertyDeed} doc={legal?.propertyDeedDoc} />
      <DocRow label="Building Approval" value={legal?.buildingApproval} doc={legal?.buildingApprovalDoc} />
      <DocRow label="Completion Certificate" value={legal?.completionCertificate} doc={legal?.completionCertificateDoc} />
      
      <LegalCat icon={ShieldCheck} label="No Objection Certificates (NOCs)" />
      <DocRow label="Fire Department NOC" value={legal?.fireNOC} doc={legal?.fireNOCDoc} />
      <DocRow label="Police NOC" value={legal?.policeNOC} doc={legal?.policeNOCDoc} />
      <DocRow label="Municipality NOC" value={legal?.municipalityNOC} doc={legal?.municipalityNOCDoc} />
      <DocRow label="Education Dept NOC" value={legal?.educationDeptNOC} doc={legal?.educationDeptNOCDoc} />
      <DocRow label="Pollution Control NOC" value={legal?.pollutionNOC} doc={legal?.pollutionNOCDoc} />
      
      <LegalCat icon={Zap} label="Infrastructure & Safety" />
      <DocRow label="Water Connection" value={legal?.waterConnection} doc={legal?.waterConnectionDoc} />
      <DocRow label="Electricity Connection" value={legal?.electricityConnection} doc={legal?.electricityConnectionDoc} />
      <DocRow label="Safety Audit Report" value={legal?.safetyAudit} doc={legal?.safetyAuditDoc} />
      <DocRow label="Drainage System" value={legal?.drainageSystem} doc={legal?.drainageSystemDoc} />

      <LegalCat icon={CreditCard} label="Financial & Administrative" />
      <DocRow label="PAN Number" value={legal?.panNo} doc={legal?.panDoc} />
      <DocRow label="GSTIN Number" value={legal?.gstinNo} doc={legal?.gstinDoc} />
      <DocRow label="Bank Account" value={legal?.bankAccount} doc={legal?.bankAccountDoc} />
      <DocRow label="Trust Deed / Society Reg" value={legal?.trustDeed} doc={legal?.trustDeedDoc} />

      <LegalCat icon={BookOpen} label="Education Registration & Affiliation" />
      <DocRow label="DISE Code" value={legal?.diseCode} doc={legal?.disecodeDoc} />
      <DocRow label="Provisional Recognition" value={legal?.provisionalRecognition} doc={legal?.provisionalRecognitionDoc} />
      <DocRow label="Board Affiliation" value={legal?.affiliation} doc={legal?.affiliationDoc} />

      <LegalCat icon={ScrollText} label="Mandatory Policies" />
      <DocRow label="Child Protection Policy" value={legal?.childProtectionPolicy} doc={legal?.childProtectionPolicyDoc} />
      <DocRow label="Harassment Prevention" value={legal?.harassmentPolicy} doc={legal?.harassmentPolicyDoc} />
      <DocRow label="Admission Policy" value={legal?.admissionPolicy} doc={legal?.admissionPolicyDoc} />
      <DocRow label="Fee Structure" value={legal?.feeStructure} doc={legal?.feeStructureDoc} />

    </div>
  </div>
);

const BranchesPanel = ({ branches }) => {
  if (!branches || branches.length === 0) return (
    <div>
      <SectionTitle title="Branch Locations" subtitle="All registered branch offices" />
      <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <GitBranch size={40} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 font-medium">No branches added yet.</p>
      </div>
    </div>
  );
  return (
    <div>
      <SectionTitle title={`Branch Locations (${branches.length})`} subtitle="All registered branch offices" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((b, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-100">
              <p className="font-bold text-gray-900 text-base">{b.name ? fmt(b.name) : `Branch ${idx + 1}`}</p>
              {b.shortName && (
                <span className="text-xs font-black bg-blue-600 text-white px-3 py-1 rounded-lg tracking-wider">
                  {b.shortName.toUpperCase()}
                </span>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              <InfoRow label="Contact Person" value={b.contactPerson} />
              <InfoRow label="Contact No" value={b.contactNo} />
              <InfoRow label="Email" value={b.email} />
              <InfoRow label="Branch GSTIN" value={b.gstin} />
              <div className="sm:col-span-2">
                <InfoRow label="Branch Address" value={[b.address1, b.address2, fmt(b.city), fmt(b.state), b.pin].filter(Boolean).join(", ")} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════

export default function Institute() {
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(null);
  
  // States for SuperAdmin flows
  const [viewMode, setViewMode] = useState("list"); // Default to list for Super Admin
  const [institutesList, setInstitutesList] = useState([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [activeMenu, setActiveMenu] = useState("organisation");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterPlan, setFilterPlan] = useState("");

  const fetchAllInstitutes = async (token) => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/superadmin/institutes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch institutes list.");
      const json = await res.json();
      setInstitutesList(json.data || []);
      setViewMode("list");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleInstitute = async (id, token, asSuperAdmin) => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = asSuperAdmin 
        ? `${apiBaseUrl}/superadmin/institutes/${id}` 
        : `${apiBaseUrl}/admin/institutes/${id}/full-details`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized. Please re-login.");
        if (res.status === 404) throw new Error(`Institute not found (${id}).`);
        throw new Error(`Server error: ${res.status}`);
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to fetch institute data.");

      const data = json.data;
      
      const org = safeParseJSON(data.organisation) || { name: data.name, email: data.email, phone: data.phone, type: data.type, city: data.city, state: data.state };

      setInstitute({
        id: data.institute_code || data.id,
        status: data.status || "Active",
        plan: data.plan || "Premium",
        createdAt: data.created_at ? new Date(data.created_at).toLocaleDateString("en-IN") : (data.joined || "—"),
        organisation: org,
        directors: Array.isArray(safeParseJSON(data.directors)) ? safeParseJSON(data.directors) : [],
        legal: safeParseJSON(data.legal) || {},
        branches: Array.isArray(safeParseJSON(data.branches)) ? safeParseJSON(data.branches) : [],
        totalStudents: data.students || data.totalStudents || 0,
        totalFaculty: data.teachers || data.totalFaculty || 0,
        totalBatches: data.totalBatches || 0,
      });
      setViewMode("details");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token) {
        setError("Session expired. Please re-login.");
        setLoading(false);
        return;
      }

      if (user.role === "superadmin" || user.role === "super_admin") {
        setIsSuperAdmin(true);
        await fetchAllInstitutes(token);
      } else {
        const instituteId = user?.code || user?.institute_code || user?.instituteCode || user?.id;
        if (!instituteId) {
          setError("Could not find your assigned institute. Please re-login.");
          setLoading(false);
          return;
        }
        await fetchSingleInstitute(instituteId, token, false);
      }
    };
    init();
  }, []);

  const handleDeleteInstitute = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely remove ${name || "this institute"}? This action is permanent.`)) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBaseUrl}/superadmin/institutes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Failed to delete institute");
      setInstitutesList(prev => prev.filter(inst => inst.id !== id && inst.institute_code !== id));
      alert("Institute successfully removed.");
    } catch (err) {
      alert("Error removing institute: " + err.message);
    }
  };

  const { filteredInstitutes, stats } = useMemo(() => {
    let total = 0, active = 0, suspended = 0, trial = 0;
    
    institutesList.forEach(inst => {
      const status = inst.status || "Active";
      total++;
      if (status === "Active") active++;
      else if (status === "Suspended") suspended++;
      else if (status === "Trial") trial++;
    });

    const filtered = institutesList.filter(inst => {
      const plan = inst.plan || "Premium";
      
      const searchLower = searchTerm.toLowerCase();
      const orgName = (inst.name || "").toLowerCase();
      const orgEmail = (inst.email || "").toLowerCase();

      const matchesSearch = orgName.includes(searchLower) || orgEmail.includes(searchLower);
      const matchesType = filterType ? inst.type === filterType : true;
      const matchesState = filterState ? inst.state === filterState : true;
      const matchesPlan = filterPlan ? plan === filterPlan : true;

      return matchesSearch && matchesType && matchesState && matchesPlan;
    });

    return { filteredInstitutes: filtered, stats: { total, active, suspended, trial } };
  }, [institutesList, searchTerm, filterType, filterState, filterPlan]);

  // ─── LOADING & ERROR STATES ───────────────────────────────────────────
  if (loading && !institute && institutesList.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading institute data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <Building2 size={48} className="mx-auto mb-4 opacity-30 text-gray-400" />
        <p className="text-lg font-semibold text-red-500 mb-2">Failed to load</p>
        <p className="text-sm text-gray-500 bg-gray-100 rounded-lg p-3 text-left break-words">{error}</p>
        {isSuperAdmin && (
          <button onClick={() => { setError(null); setViewMode("list"); }} className="mt-4 text-blue-600 font-medium hover:underline">
            Return to Dashboard
          </button>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  // VIEW: SUPER ADMIN LIST (Table of all institutes)
  // ══════════════════════════════════════════════════════════════════════
  if (isSuperAdmin && viewMode === "list") {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 text-left">
        <div className="mx-auto w-full max-w-[1400px] space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Institute Master List</h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">View and manage all registered institutes</p>
            </div>
            <button 
              onClick={() => navigate("/super-admin/institutes/create")} 
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-md shadow-blue-200"
            >
              <Plus size={18} /> Add Institute
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">TOTAL</p>
              <p className="text-2xl font-black text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">ACTIVE</p>
              <p className="text-2xl font-black text-green-600">{stats.active}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">SUSPENDED</p>
              <p className="text-2xl font-black text-red-600">{stats.suspended}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">TRIAL</p>
              <p className="text-2xl font-black text-blue-600">{stats.trial}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-64 shrink-0">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search institutes..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <div className="flex w-full md:w-auto gap-3 items-center">
              <span className="text-sm font-bold text-gray-400 uppercase tracking-wider hidden lg:block">Filters</span>
              <select className="border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="">All Types</option>
                <option value="University">University</option>
                <option value="College">College</option>
                <option value="School">School</option>
              </select>
              <select className="border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={filterState} onChange={(e) => setFilterState(e.target.value)}>
                <option value="">All States</option>
                <option value="Odisha">Odisha</option>
                <option value="Maharashtra">Maharashtra</option>
              </select>
              <select className="border border-gray-200 text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
                <option value="">All Plans</option>
                <option value="Premium">Premium</option>
                <option value="Basic">Basic</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Organisation", "Type", "Location", "Plan", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="px-6 py-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInstitutes.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-400">No institutes found matching criteria.</td></tr>
                  ) : filteredInstitutes.map((inst) => {
                    return (
                      <tr key={inst.id} className="hover:bg-blue-50/20 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200">
                              {inst.name?.[0]?.toUpperCase() || <Building2 size={16} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{fmt(inst.name) || "Unnamed Institute"}</p>
                              <p className="text-[11px] text-gray-500 font-medium">{inst.email || "No email provided"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{inst.type || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{[fmt(inst.city), fmt(inst.state)].filter(Boolean).join(", ") || "—"}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{inst.plan || "Premium"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${statusStyles[inst.status || "Active"] || "bg-gray-100 text-gray-600"}`}>
                            {inst.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inst.joined || "—"}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => fetchSingleInstitute(inst.id, localStorage.getItem("token"), isSuperAdmin)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition" title="View Details">
                              <Eye size={15} />
                            </button>
                            <button onClick={() => handleDeleteInstitute(inst.id, inst.name)} className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition" title="Delete Institute">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // VIEW: DETAILS DASHBOARD (Single Institute View)
  // ══════════════════════════════════════════════════════════════════════
  if (!institute) return null;

  const org = institute.organisation;
  const directors = institute.directors;
  const legal = institute.legal;
  const branches = institute.branches;

  const counts = {
    organisation: 0,
    directors: directors.length,
    legal: 0,
    branches: branches.length,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 text-left relative">
      <div className="mx-auto w-full max-w-[1400px]">
        
        {isSuperAdmin && (
          <button 
            onClick={() => setViewMode("list")}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition shadow-sm w-max"
          >
            <ArrowLeft size={16} /> Back to Master List
          </button>
        )}

        <div className="space-y-6">
          {/* ── HEADER ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg font-bold text-2xl">
                    {org.name?.[0]?.toUpperCase() || <Building2 size={26} />}
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 leading-tight">
                      {fmt(org.name) || "—"}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">
                      {org.type || "Institute"} Dashboard &nbsp;·&nbsp;
                      Code: <span className="text-blue-600 font-bold">{institute.id}</span>
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${statusStyles[institute.status] || "bg-gray-100 text-gray-600"}`}>
                  {institute.status || "Unknown"}
                </span>
              </div>
              <HeaderTabs activeMenu={activeMenu} setActiveMenu={setActiveMenu} counts={counts} />
            </div>
          </div>

          {/* ── STATS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Directors", value: directors.length, icon: Users },
              { label: "Branches", value: branches.length, icon: GitBranch },
              { label: "Students", value: institute.totalStudents || 0, icon: Users },
              { label: "Faculty", value: institute.totalFaculty || 0, icon: Calendar },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <stat.icon size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-800 leading-tight">{stat.value}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── CONTENT ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {activeMenu === "organisation" && <OrganisationPanel org={org} institute={institute} />}
            {activeMenu === "directors" && <DirectorsPanel directors={directors} />}
            {activeMenu === "legal" && <LegalPanel legal={legal} />}
            {activeMenu === "branches" && <BranchesPanel branches={branches} />}
          </div>
        </div>
      </div>
    </div>
  );
}