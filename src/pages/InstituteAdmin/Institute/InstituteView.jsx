// import { useEffect, useState } from "react";
// import {
//   Building2, Users, FileText, GitBranch,
//   MapPin, Phone, Mail, Landmark, ShieldCheck, Zap,
//   CreditCard, BookOpen, ScrollText, BadgeCheck, Calendar,
// } from "lucide-react";
// import apiBaseUrl from "../../../config/baseurl";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const fmt = (text = "") =>
//   text?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || "";

// const safeParseJSON = (data) => {
//   if (!data) return null;
//   if (typeof data === "object") return data;
//   try { return JSON.parse(data); } catch { return null; }
// };

// const statusStyles = {
//   Active:    "bg-green-100 text-green-700 border border-green-300",
//   Suspended: "bg-red-100 text-red-700 border border-red-300",
//   Trial:     "bg-blue-100 text-blue-700 border border-blue-300",
// };

// // ─── Reusable Components ───────────────────────────────────────────────────────

// const InfoRow = ({ label, value }) => (
//   <div className="flex flex-col py-2 border-b border-gray-50 md:border-none">
//     <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
//     <span className="text-sm text-gray-800 font-medium break-words leading-tight">
//       {value || <span className="text-gray-400 italic font-normal">Not provided</span>}
//     </span>
//   </div>
// );

// const DocRow = ({ label, value, doc }) => {
//   const hasDoc = doc && (typeof doc === "string" ? doc.trim() !== "" : Object.keys(doc).length > 0);
//   return (
//     <div className="flex flex-col py-2 border-b border-gray-50 md:border-none">
//       <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
//       <div className="flex items-center gap-2 flex-wrap">
//         <span className="text-sm text-gray-800 font-medium">
//           {value || <span className="text-gray-400 italic font-normal">Not provided</span>}
//         </span>
//         {hasDoc ? (
//           <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-md">
//             <BadgeCheck size={12} /> Uploaded
//           </span>
//         ) : (
//           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">NO FILE</span>
//         )}
//       </div>
//     </div>
//   );
// };

// const LegalCat = ({ icon: Icon, label }) => (
//   <div className="flex items-center gap-2 pt-6 pb-4 col-span-full">
//     <Icon size={14} className="text-blue-500 shrink-0" />
//     <span className="text-xs font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">{label}</span>
//     <div className="flex-1 h-px bg-gray-200 ml-1" />
//   </div>
// );

// const SectionTitle = ({ title, subtitle }) => (
//   <div className="mb-6 pb-4 border-b border-gray-100">
//     <h2 className="text-lg font-bold text-gray-800">{title}</h2>
//     {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
//   </div>
// );

// // ─── Tab Menu ─────────────────────────────────────────────────────────────────

// const MENU = [
//   { id: "organisation", label: "Organisation",   icon: Building2 },
//   { id: "directors",    label: "Directors",      icon: Users     },
//   { id: "legal",        label: "Legal Documents", icon: FileText  },
//   { id: "branches",     label: "Branches",        icon: GitBranch },
// ];

// const HeaderTabs = ({ activeMenu, setActiveMenu, counts }) => (
//   <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 mt-6 pt-4 pb-1">
//     {MENU.map(({ id, label, icon: Icon }) => {
//       const isActive = activeMenu === id;
//       const count = counts[id];
//       return (
//         <button
//           key={id}
//           onClick={() => setActiveMenu(id)}
//           className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
//             isActive
//               ? "bg-blue-600 text-white shadow-md shadow-blue-200"
//               : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
//           }`}
//         >
//           <Icon size={16} />
//           {label}
//           {count > 0 && (
//             <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${
//               isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
//             }`}>
//               {count}
//             </span>
//           )}
//         </button>
//       );
//     })}
//   </div>
// );

// // ─── Panels ───────────────────────────────────────────────────────────────────

// const OrganisationPanel = ({ org, institute }) => (
//   <div>
//     <SectionTitle title="Organisation Details" subtitle="Registered information and contact details" />
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 bg-gray-50/50 p-6 rounded-xl border border-gray-50">
//       <InfoRow label="Registered Name"   value={fmt(org.name)} />
//       <InfoRow label="Organisation Type" value={org.type} />
//       <InfoRow label="Phone"             value={org.phone} />
//       <InfoRow label="Alternate Phone"   value={org.altPhone} />
//       <InfoRow label="Email"             value={org.email} />
//       <InfoRow label="Secondary Email"   value={org.secondaryEmail} />
//       <InfoRow label="Address Line 1"    value={fmt(org.address1)} />
//       <InfoRow label="Address Line 2"    value={fmt(org.address2)} />
//       <InfoRow label="City"              value={fmt(org.city)} />
//       <InfoRow label="State"             value={fmt(org.state)} />
//       <InfoRow label="PIN Code"          value={org.pin} />
//       <InfoRow label="Head Office"       value={fmt(org.headOffice)} />
//       <InfoRow label="Member Since"      value={institute.createdAt} />
//     </div>
//   </div>
// );

// const DirectorsPanel = ({ directors }) => {
//   if (!directors || directors.length === 0) return (
//     <div>
//       <SectionTitle title="Directors / Partners" subtitle="People associated with this institute" />
//       <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
//         <Users size={40} className="mx-auto mb-3 text-gray-300" />
//         <p className="text-gray-500 font-medium">No directors added yet.</p>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       <SectionTitle title={`Directors / Partners (${directors.length})`} subtitle="People associated with this institute" />
//       <div className="space-y-8">
//         {directors.map((d, idx) => (
//           <div key={idx} className={idx > 0 ? "pt-8 border-t border-gray-100" : ""}>
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
//                 {d.name?.[0]?.toUpperCase() || (idx + 1)}
//               </div>
//               <div>
//                 <p className="font-bold text-gray-900 text-lg">{d.name ? fmt(d.name) : `Director ${idx + 1}`}</p>
//                 {d.email && <p className="text-sm text-gray-500">{d.email}</p>}
//               </div>
//             </div>

//             <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-50">
//               <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 border-b border-gray-100 pb-3">Personal Details</p>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
//                 <InfoRow label="Email"           value={d.email} />
//                 <InfoRow label="Contact"         value={d.contact} />
//                 <InfoRow label="Mobile"          value={d.mobile} />
//                 <InfoRow label="WhatsApp"        value={d.whatsapp} />
//                 <InfoRow label="Gender"          value={d.gender} />
//                 <InfoRow label="Date of Birth"   value={d.dob} />
//                 <InfoRow label="% of Interest"   value={d.interest ? `${d.interest}%` : null} />
//                 <InfoRow label="Father's Name"   value={fmt(d.father)} />
//                 <InfoRow label="Spouse Name"     value={fmt(d.spouse)} />
//                 <InfoRow label="No. of Children" value={d.children} />
//               </div>

//               {(d.bank?.bankName || d.bank?.accountNumber) && (
//                 <>
//                   <LegalCat icon={CreditCard} label="Bank Details" />
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
//                     <InfoRow label="Bank Name"      value={d.bank?.bankName} />
//                     <InfoRow label="Account Number" value={d.bank?.accountNumber} />
//                     <InfoRow label="IFSC Code"      value={d.bank?.ifscCode} />
//                   </div>
//                 </>
//               )}

//               {(d.currentAddress?.line1 || d.permanentAddress?.line1) && (
//                 <>
//                   <LegalCat icon={MapPin} label="Address Information" />
//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
//                     {d.currentAddress?.line1 && (
//                       <InfoRow label="Current Address"   value={[d.currentAddress.line1, d.currentAddress.line2, fmt(d.currentAddress.city), fmt(d.currentAddress.state), d.currentAddress.pin].filter(Boolean).join(", ")} />
//                     )}
//                     {d.permanentAddress?.line1 && (
//                       <InfoRow label="Permanent Address" value={[d.permanentAddress.line1, d.permanentAddress.line2, fmt(d.permanentAddress.city), fmt(d.permanentAddress.state), d.permanentAddress.pin].filter(Boolean).join(", ")} />
//                     )}
//                   </div>
//                 </>
//               )}

//               {(d.documents?.panNo || d.documents?.aadhaarNo) && (
//                 <>
//                   <LegalCat icon={FileText} label="Identity Documents" />
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
//                     {d.documents?.panNo     && <InfoRow label="PAN Number"     value={d.documents.panNo} />}
//                     {d.documents?.aadhaarNo && <InfoRow label="Aadhaar Number" value={d.documents.aadhaarNo} />}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const LegalPanel = ({ legal }) => (
//   <div>
//     <SectionTitle title="Legal Documents" subtitle="Certificates, NOCs and compliance documents" />
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-50">

//       <LegalCat icon={Landmark}    label="Land & Building" />
//       <DocRow label="Property Deed"                   value={legal?.propertyDeed}         doc={legal?.propertyDeedDoc} />
//       <DocRow label="Building Approval"               value={legal?.buildingApproval}      doc={legal?.buildingApprovalDoc} />
//       <DocRow label="Building Completion Certificate" value={legal?.completionCertificate} doc={legal?.completionCertificateDoc} />

//       <LegalCat icon={ShieldCheck} label="No Objection Certificates" />
//       <DocRow label="Fire Department NOC"      value={legal?.fireNOC}          doc={legal?.fireNOCDoc} />
//       <DocRow label="Police NOC"               value={legal?.policeNOC}        doc={legal?.policeNOCDoc} />
//       <DocRow label="Municipality NOC"         value={legal?.municipalityNOC}  doc={legal?.municipalityNOCDoc} />
//       <DocRow label="Education Department NOC" value={legal?.educationDeptNOC} doc={legal?.educationDeptNOCDoc} />
//       <DocRow label="Pollution Control NOC"    value={legal?.pollutionNOC}     doc={legal?.pollutionNOCDoc} />

//       <LegalCat icon={Zap}         label="Infrastructure & Safety" />
//       <DocRow label="Water Connection"       value={legal?.waterConnection}       doc={legal?.waterConnectionDoc} />
//       <DocRow label="Electricity Connection" value={legal?.electricityConnection} doc={legal?.electricityConnectionDoc} />
//       <DocRow label="Safety Audit Report"    value={legal?.safetyAudit}           doc={legal?.safetyAuditDoc} />
//       <DocRow label="Drainage System"        value={legal?.drainageSystem}        doc={legal?.drainageSystemDoc} />

//       <LegalCat icon={CreditCard}  label="Financial & Administrative" />
//       <DocRow label="PAN Number"                value={legal?.panNo}       doc={legal?.panNoDoc} />
//       <DocRow label="GSTIN"                     value={legal?.gstinNo}     doc={legal?.gstinNoDoc} />
//       <DocRow label="Bank Account"              value={legal?.bankAccount} doc={legal?.bankAccountDoc} />
//       <DocRow label="Trust Deed / Society Reg." value={legal?.trustDeed}   doc={legal?.trustDeedDoc} />

//       <LegalCat icon={BookOpen}    label="Education Registration & Affiliation" />
//       <DocRow label="DISE Code"                     value={legal?.diseCode}               doc={legal?.diseCodeDoc} />
//       <DocRow label="Provisional Recognition"       value={legal?.provisionalRecognition} doc={legal?.provisionalRecognitionDoc} />
//       <DocRow label="Board Affiliation Certificate" value={legal?.affiliation}            doc={legal?.affiliationDoc} />

//       <LegalCat icon={ScrollText}  label="Mandatory Policies" />
//       <DocRow label="Child Protection Policy" value={legal?.childProtectionPolicy} doc={legal?.childProtectionPolicyDoc} />
//       <DocRow label="Harassment Prevention"   value={legal?.harassmentPolicy}      doc={legal?.harassmentPolicyDoc} />
//       <DocRow label="Admission Policy"        value={legal?.admissionPolicy}       doc={legal?.admissionPolicyDoc} />
//       <DocRow label="Fee Structure Document"  value={legal?.feeStructure}          doc={legal?.feeStructureDoc} />
//     </div>
//   </div>
// );

// const BranchesPanel = ({ branches }) => {
//   if (!branches || branches.length === 0) return (
//     <div>
//       <SectionTitle title="Branch Locations" subtitle="All registered branch offices" />
//       <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
//         <GitBranch size={40} className="mx-auto mb-3 text-gray-300" />
//         <p className="text-gray-500 font-medium">No branches added yet.</p>
//       </div>
//     </div>
//   );

//   return (
//     <div>
//       <SectionTitle title={`Branch Locations (${branches.length})`} subtitle="All registered branch offices" />
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {branches.map((b, idx) => (
//           <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
//             <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-100">
//               <p className="font-bold text-gray-900 text-base">{b.name ? fmt(b.name) : `Branch ${idx + 1}`}</p>
//               {b.shortName && (
//                 <span className="text-xs font-black bg-blue-600 text-white px-3 py-1 rounded-lg tracking-wider">
//                   {b.shortName.toUpperCase()}
//                 </span>
//               )}
//             </div>
//             <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
//               <InfoRow label="Contact Person" value={b.contactPerson} />
//               <InfoRow label="Contact No"     value={b.contactNo} />
//               <InfoRow label="Email"          value={b.email} />
//               <InfoRow label="GSTIN"          value={b.gstin} />
//               <div className="sm:col-span-2">
//                 <InfoRow label="Address" value={[b.address1, b.address2, fmt(b.city), fmt(b.state), b.pin].filter(Boolean).join(", ")} />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ══════════════════════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ══════════════════════════════════════════════════════════════════════════════

// export default function Institute() {
//   const [institute, setInstitute] = useState(null);
//   const [activeMenu, setActiveMenu] = useState("organisation");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchInstitute = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
     
// const instituteId = user?.institute_code || user?.instituteCode || user?.code || user?.id;

//         if (!instituteId) {
//           setError("No institute ID found. Please re-login.");
//           setLoading(false);
//           return;
//         }

//         if (!token) {
//           setError("Session expired. Please re-login.");
//           setLoading(false);
//           return;
//         }

//         const res = await fetch(
//           `${apiBaseUrl}/admin/institutes/${instituteId}/full-details`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!res.ok) {
//           // If 401 Unauthorized, we give a clear message
//           if (res.status === 401) throw new Error("Unauthorized. Please re-login.");
//           throw new Error(`Server error: ${res.status}`);
//         }

//         const json = await res.json();

//         if (!json.success) {
//           throw new Error(json.message || "Failed to fetch institute data.");
//         }

//         const data = json.data;
//         const org = safeParseJSON(data.organisation) || {};

//         setInstitute({
//           id:           data.institute_code || data.id,
//           status:       data.status   || "Active",
//           plan:         data.plan     || "Premium",
          
//           // 🚀 SAFE DATE FIX: Ensures we don't map 'null' to an Invalid Date
//           createdAt:    data.created_at 
//                           ? new Date(data.created_at).toLocaleDateString("en-IN")
//                           : "—",

//           organisation: org,
          
//           // 🚀 SAFE MAPPING FIX: Guarantees these are arrays/objects before rendering
//           directors:    Array.isArray(safeParseJSON(data.directors)) ? safeParseJSON(data.directors) : [],
//           legal:        safeParseJSON(data.legal) || {},
//           branches:     Array.isArray(safeParseJSON(data.branches)) ? safeParseJSON(data.branches) : [],

//           totalStudents: data.totalStudents || 0,
//           totalFaculty:  data.totalFaculty  || 0,
//           totalBatches:  data.totalBatches  || 0,
//         });

//       } catch (err) {
//         console.error("Institute fetch error:", err);
//         setError(err.message || "Something went wrong.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchInstitute();
//   }, []);

//   // ── Loading ──
//   if (loading) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-center text-gray-400">
//         <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
//         <p className="text-sm font-medium">Loading institute details...</p>
//       </div>
//     </div>
//   );

//   // ── Error state ──
//   if (error) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-center text-gray-400 max-w-sm">
//         <Building2 size={48} className="mx-auto mb-4 opacity-30" />
//         <p className="text-lg font-semibold text-red-500 mb-2">Failed to load</p>
//         <p className="text-sm text-gray-400">{error}</p>
//       </div>
//     </div>
//   );

//   // ── Empty state ──
//   if (!institute) return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//       <div className="text-center text-gray-400 max-w-sm">
//         <Building2 size={48} className="mx-auto mb-4 opacity-30" />
//         <p className="text-lg font-semibold text-gray-500 mb-2">No institute details found.</p>
//         <p className="text-sm text-gray-400">Please re-login or contact support.</p>
//       </div>
//     </div>
//   );

//   const org       = institute.organisation;
//   const directors = institute.directors;
//   const legal     = institute.legal;
//   const branches  = institute.branches;

//   const counts = {
//     organisation: 0,
//     directors:    directors.length,
//     legal:        0,
//     branches:     branches.length,
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8 text-left">
//       <div className="mx-auto w-full max-w-8xl space-y-6">

//         {/* ── HEADER CARD ── */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//           <div className="p-6 pb-0">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg font-bold text-2xl">
//                   {org.name?.[0]?.toUpperCase() || <Building2 size={26} />}
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-black text-gray-900 leading-tight">
//                     {fmt(org.name) || "—"}
//                   </h1>
//                   <p className="text-sm text-gray-500 mt-1 font-medium">
//                     {org.type || "Institute"} Dashboard &nbsp;·&nbsp;
//                     Code: <span className="text-blue-600 font-bold">{institute.id}</span>
//                   </p>
//                 </div>
//               </div>
//               <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${statusStyles[institute.status] || "bg-gray-100 text-gray-600"}`}>
//                 {institute.status || "Unknown"}
//               </span>
//             </div>

//             <HeaderTabs activeMenu={activeMenu} setActiveMenu={setActiveMenu} counts={counts} />
//           </div>
//         </div>

//         {/* ── QUICK STATS ── */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {[
//             { label: "Directors",     value: directors.length,            icon: Users     },
//             { label: "Branches",      value: branches.length,             icon: GitBranch },
//             { label: "Students",      value: institute.totalStudents || 0, icon: Users     },
//             { label: "Faculty",       value: institute.totalFaculty  || 0, icon: Calendar  },
//           ].map((stat) => (
//             <div key={stat.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
//                 <stat.icon size={18} className="text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-lg font-black text-gray-800 leading-tight">{stat.value}</p>
//                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── MAIN CONTENT PANEL ── */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
//           {activeMenu === "organisation" && <OrganisationPanel org={org} institute={institute} />}
//           {activeMenu === "directors"    && <DirectorsPanel    directors={directors} />}
//           {activeMenu === "legal"        && <LegalPanel        legal={legal} />}
//           {activeMenu === "branches"     && <BranchesPanel     branches={branches} />}
//         </div>

//       </div>
//     </div>
//   );
// }