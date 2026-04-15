// import { useState } from "react";
// import { useAuth } from "../../hooks/useAuth";
// import { useNavigate } from "react-router-dom";
// import { 
//   Mail, Lock, Building2, Eye, EyeOff, Loader2, ArrowRight,
//   GraduationCap, CheckCircle2
// } from "lucide-react";

// export const Login = () => {
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const [roleType, setRoleType] = useState("institute_admin");
//   const [adminSubRole, setAdminSubRole] = useState("institute_admin");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState("");
  
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     instituteCode: "",
//   });

//   const effectiveRole = roleType === "institute_admin" ? adminSubRole : roleType;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (error) setError("");
//   };

//   // Permissions map for all admin sub-roles
//   const subRolePermissions = {
//     institute_admin: {},
//     principal: {
//       canApproveLeave: true,
//       canManageAnnouncements: true,
//       canViewReports: true,
//       canManageDepartments: true,
//       canViewFinance: true,
//     },
//     hod: {
//       canViewFinance: true,
//       canApproveLeave: true,
//       canViewTimetables: true,
//       canManageAnnouncements: true,
//       canManageSubjects: true,
//       canManageDepartments: true,
//     },
//     accountant: {
//       canViewReports: true,
//       canViewPaymentHistory: true,
//       canManageScholarships: true,
//       canManageAnnouncements: true,
//       canGenerateInvoices: true,
//       canManageFeeCollection: true,
//     },
//   };

//   // Info banners per sub-role
//   const subRoleBanners = {
//     principal: { icon: "🏫", text: "Principal Access — Leave approvals, announcements, reports, departments & finance." },
//     hod:       { icon: "🎓", text: "HOD Access — Departments, subjects, timetables, leave approvals, finance & announcements." },
//     accountant:{ icon: "💼", text: "Accountant Access — Fee collection, invoices, payment history, scholarships & reports." },
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       if (effectiveRole !== "super_admin" && !formData.instituteCode) {
//         throw new Error("Institute Code is required.");
//       }

//       const response = await login(
//         formData.email,
//         formData.password,
//         formData.instituteCode,
//         effectiveRole
//       );

//       if (response) {
//         if (response.token || response.accessToken) {
//           localStorage.setItem("token", response.token || response.accessToken);
//         }

//         const userData = response.user || response.data || response.admin || {};
//         const permissions = subRolePermissions[effectiveRole] || {};

//         localStorage.setItem("user", JSON.stringify({
//           ...userData,
//           role: effectiveRole,
//           instituteCode: formData.instituteCode,
//           ...(Object.keys(permissions).length > 0 && { permissions }),
//         }));

//         localStorage.setItem("role", effectiveRole);
//       }

//       setIsSuccess(true);

//       const roleRoutes = {
//         super_admin:     "/super-admin/dashboard",
//         institute_admin: "/admin/dashboard",
//         principal:       "/principal/dashboard",
//         hod:             "/hod/dashboard",
//         accountant:      "/accountant/dashboard",
//         faculty:         "/faculty/dashboard",
//         student:         "/student/dashboard",
//       };

//       setTimeout(() => navigate(roleRoutes[effectiveRole] || "/"), 800);

//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Invalid credentials. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const roles = [
//     { id: "super_admin",     label: "Super"   },
//     { id: "institute_admin", label: "Admin"   },
//     { id: "faculty",         label: "Faculty" },
//     { id: "student",         label: "Student" },
//   ];

//   const adminSubRoles = [
//     { value: "institute_admin", label: "Admin",      icon: "🏢" },
//     { value: "principal",       label: "Principal",  icon: "🏫" },
//     { value: "hod",             label: "HOD",        icon: "🎓" },
//     { value: "accountant",      label: "Accountant", icon: "💼" },
//   ];

//   const activeBanner = subRoleBanners[effectiveRole];

//   return (
//     <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">

//       {/* LEFT SIDE */}
//       <div className="hidden lg:flex w-[50%] relative bg-slate-900">
//         <img
//           src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2586&auto=format&fit=crop"
//           alt="College Campus"
//           className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
//         <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 text-white">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
//               <GraduationCap size={24} className="text-white" />
//             </div>
//             <span className="text-xl font-bold tracking-wide">EduERP</span>
//           </div>
//           <div className="max-w-xl mb-12">
//             <h1 className="text-5xl font-bold leading-tight mb-6">
//               Building the <span className="text-blue-400">Future</span> of Education.
//             </h1>
//             <p className="text-lg text-gray-300 leading-relaxed">
//               Streamline administration, empower faculty, and engage students with a single platform.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-12 xl:px-20 bg-white">
//         <div className="w-full max-w-sm mx-auto space-y-8">

//           {/* Mobile logo */}
//           <div className="lg:hidden flex items-center gap-2">
//             <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
//               <GraduationCap size={18} className="text-white" />
//             </div>
//             <span className="text-lg font-bold text-slate-900">EduERP</span>
//           </div>

//           <div>
//             <h2 className="text-5xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
//             <p className="text-slate-500 mt-2 text-lg">Please enter your details to sign in.</p>
//           </div>

//           {/* Dynamic role access banner */}
//           {activeBanner && (
//             <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium animate-in fade-in slide-in-from-top-1">
//               {activeBanner.icon} <span className="font-bold">{activeBanner.text}</span>
//             </div>
//           )}

//           {error && (
//             <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5">

//             {/* Email */}
//             <div className="space-y-1">
//               <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
//               <div className="relative group">
//                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                 <input
//                   type="email" name="email" value={formData.email} onChange={handleChange}
//                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
//                   placeholder="name@institute.com" required
//                 />
//               </div>
//             </div>

//             {/* Institute Code */}
//             {effectiveRole !== "super_admin" && (
//               <div className="space-y-1">
//                 <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Institute Code</label>
//                 <div className="relative group">
//                   <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     type="text" name="instituteCode" value={formData.instituteCode} onChange={handleChange}
//                     className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
//                     placeholder="e.g. KII751030" required
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Password */}
//             <div className="space-y-1">
//               <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Password</label>
//               <div className="relative group">
//                 <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                 <input
//                   type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
//                   className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
//                   placeholder="••••••••" required
//                 />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
//                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
//             </div>

//             {/* Submit */}
//             <button type="submit" disabled={loading || isSuccess}
//               className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70
//                 ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}>
//               {loading ? <Loader2 className="h-5 w-5 animate-spin" />
//                : isSuccess ? <><CheckCircle2 size={18} /> Verified</>
//                : <>Sign In <ArrowRight size={18} /></>}
//             </button>
//           </form>

//           {/* ── ROLE SELECTOR ── */}
//           <div className="space-y-3 pt-2">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-slate-100" />
//               </div>
//               <div className="relative flex justify-center text-[13px] uppercase tracking-[0.2em] font-black text-slate-400">
//                 <span className="bg-white px-2">Select Access Level</span>
//               </div>
//             </div>

//             {/* Top-level role tabs */}
//             <div className="p-1 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-4 gap-1">
//               {roles.map(({ id, label }) => (
//                 <button
//                   key={id}
//                   type="button"
//                   onClick={() => { setRoleType(id); setError(""); }}
//                   className={`py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200
//                     ${roleType === id
//                       ? "bg-white text-blue-600 shadow-sm border border-slate-100"
//                       : "text-slate-400 hover:text-slate-600"}`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {/* ── Admin sub-roles: 2x2 grid ── */}
//             {roleType === "institute_admin" && (
//               <div className="animate-in fade-in slide-in-from-top-1 duration-200">
//                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2">
//                   <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 text-center">
//                     Login As
//                   </p>
//                   <div className="grid grid-cols-2 gap-2">
//                     {adminSubRoles.map(({ value, label, icon }) => (
//                       <button
//                         key={value}
//                         type="button"
//                         onClick={() => setAdminSubRole(value)}
//                         className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-[11px] font-bold uppercase tracking-wide transition-all duration-150
//                           ${adminSubRole === value
//                             ? "bg-white border-blue-200 text-blue-600 shadow-sm"
//                             : "bg-transparent border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}
//                       >
//                         <span className="text-base">{icon}</span>
//                         {label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// };





import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  Mail, Lock, Building2, Eye, EyeOff, Loader2, ArrowRight,
  GraduationCap, CheckCircle2
} from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [roleType, setRoleType] = useState("institute_admin");
  const [adminSubRole, setAdminSubRole] = useState("institute_admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    instituteCode: "",
  });

  const effectiveRole = roleType === "institute_admin" ? adminSubRole : roleType;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  // Permissions map for all admin sub-roles
  const subRolePermissions = {
    institute_admin: {},
    principal: {
      canApproveLeave: true,
      canManageAnnouncements: true,
      canViewReports: true,
      canManageDepartments: true,
      canViewFinance: true,
    },
    hod: {
      canViewFinance: true,
      canApproveLeave: true,
      canViewTimetables: true,
      canManageAnnouncements: true,
      canManageSubjects: true,
      canManageDepartments: true,
    },
    accountant: {
      canViewReports: true,
      canViewPaymentHistory: true,
      canManageScholarships: true,
      canManageAnnouncements: true,
      canGenerateInvoices: true,
      canManageFeeCollection: true,
    },
  };

  // Info banners per sub-role
  const subRoleBanners = {
    principal: { icon: "🏫", text: "Principal Access — Leave approvals, announcements, reports, departments & finance." },
    hod:       { icon: "🎓", text: "HOD Access — Departments, subjects, timetables, leave approvals, finance & announcements." },
    accountant:{ icon: "💼", text: "Accountant Access — Fee collection, invoices, payment history, scholarships & reports." },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (effectiveRole !== "super_admin" && !formData.instituteCode) {
        throw new Error("Institute Code is required.");
      }

      const response = await login(
        formData.email,
        formData.password,
        formData.instituteCode,
        effectiveRole
      );

      if (response) {
        if (response.token || response.accessToken) {
          localStorage.setItem("token", response.token || response.accessToken);
        }

        const userData = response.user || response.data || response.admin || {};
        const permissions = subRolePermissions[effectiveRole] || {};

        localStorage.setItem("user", JSON.stringify({
          ...userData,
          role: effectiveRole,
          instituteCode: formData.instituteCode,
          ...(Object.keys(permissions).length > 0 && { permissions }),
        }));

        localStorage.setItem("role", effectiveRole);
      }

      setIsSuccess(true);

      const roleRoutes = {
        super_admin:     "/super-admin/dashboard",
        institute_admin: "/admin/dashboard",
        principal:       "/principal/dashboard",
        hod:             "/hod/dashboard",
        accountant:      "/accountant/dashboard",
        faculty:         "/faculty/dashboard",
        student:         "/student/dashboard",
      };

      setTimeout(() => navigate(roleRoutes[effectiveRole] || "/"), 800);

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "super_admin",     label: "Super"   },
    { id: "institute_admin", label: "Admin"   },
    { id: "faculty",         label: "Faculty" },
    { id: "student",         label: "Student" },
  ];

  const adminSubRoles = [
    { value: "institute_admin", label: "Admin",      icon: "🏢" },
    { value: "principal",       label: "Principal",  icon: "🏫" },
    { value: "hod",             label: "HOD",        icon: "🎓" },
    { value: "accountant",      label: "Accountant", icon: "💼" },
  ];

  const activeBanner = subRoleBanners[effectiveRole];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden text-left">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-[50%] relative bg-slate-900 text-left">
        <img
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2586&auto=format&fit=crop"
          alt="College Campus"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 text-white text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
              <GraduationCap size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">EduERP</span>
          </div>
          <div className="max-w-xl mb-12 text-left">
            <h1 className="text-5xl font-bold leading-tight mb-6 text-left">
              Building the <span className="text-blue-400">Future</span> of Education.
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed text-left">
              Streamline administration, empower faculty, and engage students with a single platform.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-12 xl:px-20 bg-white text-left">
        <div className="w-full max-w-sm mx-auto space-y-8 text-left">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 text-left">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">EduERP</span>
          </div>

          <div className="text-left">
            <h2 className="text-5xl font-bold text-slate-900 tracking-tight text-left">Welcome back</h2>
            <p className="text-slate-500 mt-2 text-lg text-left">Please enter your details to sign in.</p>
          </div>

          {/* Dynamic role access banner */}
          {activeBanner && (
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 text-left">
              {activeBanner.icon} <span className="font-bold">{activeBanner.text}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">

            {/* Email */}
            <div className="space-y-1 text-left">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-left block">Email Address</label>
              <div className="relative group text-left">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-left"
                  placeholder="name@institute.com" required
                />
              </div>
            </div>

            {/* Institute Code */}
            {effectiveRole !== "super_admin" && (
              <div className="space-y-1 text-left">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-left block">Institute Code</label>
                <div className="relative group text-left">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text" name="instituteCode" value={formData.instituteCode} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-left"
                    placeholder="e.g. KII751030" required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1 text-left">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-left block">Password</label>
              <div className="relative group text-left">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-left"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors outline-none">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Added Forgot Password Link */}
          <div className="flex justify-end pt-1 w-full">
  <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors outline-none">
    Forgot password?
  </a>
</div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading || isSuccess}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 outline-none
                ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" />
               : isSuccess ? <><CheckCircle2 size={18} /> Verified</>
               : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* ── ROLE SELECTOR ── */}
          <div className="space-y-3 pt-2 text-left">
            <div className="relative text-left">
              <div className="absolute inset-0 flex items-center text-left">
                <div className="w-full border-t border-slate-100 text-left" />
              </div>
              <div className="relative flex justify-center text-[13px] uppercase tracking-[0.2em] font-black text-slate-400 text-left">
                <span className="bg-white px-2 text-left">Select Access Level</span>
              </div>
            </div>

            {/* Top-level role tabs */}
            <div className="p-1 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-4 gap-1 text-left">
              {roles.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setRoleType(id); setError(""); }}
                  className={`py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 text-center outline-none
                    ${roleType === id
                      ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                      : "text-slate-400 hover:text-slate-600"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Admin sub-roles: 2x2 grid ── */}
            {roleType === "institute_admin" && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200 text-left">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-left">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 text-left pl-1">
                    Login As
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-left">
                    {adminSubRoles.map(({ value, label, icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setAdminSubRole(value)}
                        className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-[11px] font-bold uppercase tracking-wide transition-all duration-150 outline-none
                          ${adminSubRole === value
                            ? "bg-white border-blue-200 text-blue-600 shadow-sm"
                            : "bg-transparent border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}
                      >
                        <span className="text-base">{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};