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

  // Primary login categories (matches the IDs in the roles array at bottom)
  const [roleType, setRoleType] = useState("institute_admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    instituteCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (roleType !== "super_admin" && !formData.instituteCode) {
        throw new Error("Institute Code is required.");
      }

      // 1. Trigger the Auth Service
      const response = await login(
        formData.email,
        formData.password,
        formData.instituteCode,
        roleType 
      );

      if (response && response.success) {
        // 2. Save the Token immediately
        const token = response.token || response.accessToken;
        if (token) localStorage.setItem("token", token);

        const userData = response.user || response.data || {};
        
        // 🚀 CRITICAL: Normalize the Role
        // We look at 'role' then 'designation', lowercase it, and trim it.
        // This turns "FACULTY" or "Faculty" into "faculty".
        const rawRole = userData.role || userData.designation || roleType;
        const actualRole = String(rawRole).toLowerCase().trim(); 

        console.log("🔍 LOGIN DEBUG:");
        console.log("- Raw Backend Data:", userData);
        console.log("- Determined Role String:", actualRole);

        // 3. Sync state with LocalStorage
        localStorage.setItem("user", JSON.stringify({
          ...userData,
          role: actualRole, 
          instituteCode: formData.instituteCode,
        }));
        localStorage.setItem("role", actualRole);
        
        setIsSuccess(true);

        // 4. DYNAMIC ROUTING DICTIONARY
        const roleRoutes = {
          super_admin:     "/super-admin/dashboard",
          institute_admin: "/admin/dashboard",
          
          // --- Faculty/Academic Dashboards ---
          faculty:         "/faculty/dashboard",
          hod:             "/faculty/dashboard",
          professor:       "/faculty/dashboard",
          lecturer:        "/faculty/dashboard",
          "lab instructor": "/faculty/dashboard",
          
          // --- Non-Academic/Staff Dashboards ---
          principal:       "/admin/principal",
          accountant:      "/staff/dashboard", 
          staff:           "/staff/dashboard",
          dean:            "/staff/dashboard",
          
          // --- Fallbacks ---
          employee:        "/faculty/dashboard",
          student:         "/student/dashboard",
        };

        const targetPath = roleRoutes[actualRole];

        if (targetPath) {
          console.log("🎯 SUCCESS: Redirecting to:", targetPath);
          // Small timeout ensures LocalStorage is fully written before redirect
          setTimeout(() => navigate(targetPath), 500);
        } else {
          console.warn("⚠️ ROLE MISMATCH: Role not found in dictionary:", actualRole);
          // Safety Fallback for Academic Staff
          if (actualRole.includes("faculty") || actualRole.includes("prof")) {
             navigate("/faculty/dashboard");
          } else {
             setError("Login successful, but no dashboard assigned to this role.");
          }
        }
      }

    } catch (err) {
      console.error("❌ Login Submission Error:", err);
      setError(err.response?.data?.message || err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: "super_admin",     label: "Super"   },
    { id: "institute_admin", label: "Admin"   },
    { id: "employee",        label: "Employee"}, 
    { id: "student",         label: "Student" },
  ];

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden text-left">
      {/* LEFT SIDE - BRANDING */}
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

      {/* RIGHT SIDE - LOGIN FORM */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-12 xl:px-20 bg-white text-left">
        <div className="w-full max-w-sm mx-auto space-y-8 text-left">
          
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

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {/* Email Input */}
            <div className="space-y-1 text-left">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest block">Email Address</label>
              <div className="relative group">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  placeholder="name@institute.com" required
                />
              </div>
            </div>

            {/* Institute Code Input (Hidden for Super Admin) */}
            {roleType !== "super_admin" && (
              <div className="space-y-1 text-left">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-widest block">Institute Code</label>
                <div className="relative group">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="text" name="instituteCode" value={formData.instituteCode} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                    placeholder="e.g. SAM751030" required
                  />
                </div>
              </div>
            )}

            {/* Password Input */}
            <div className="space-y-1 text-left">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest block">Password</label>
              <div className="relative group">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
                  placeholder="••••••••" required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors outline-none">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end pt-1 w-full">
                <button type="button" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-transparent border-none p-0 cursor-pointer">
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading || isSuccess}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 outline-none
                ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" />
               : isSuccess ? <><CheckCircle2 size={18} /> Verified</>
               : <>Sign In <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Access Level Selector */}
          <div className="space-y-3 pt-2 text-left">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[13px] uppercase tracking-[0.2em] font-black text-slate-400">
                <span className="bg-white px-2">Select Access Level</span>
              </div>
            </div>

            <div className="p-1 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-4 gap-1">
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
          </div>
        </div>
      </div>
    </div>
  );
};
























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

//   // 🚀 Top-level category (Super, Admin, Academic, Non-Academic, Student)
//   const [roleCategory, setRoleCategory] = useState("academic");
  
//   // 🚀 Specific role within that category
//   const [specificRole, setSpecificRole] = useState("faculty"); 
  
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState("");
  
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//     instituteCode: "",
//   });

//   // Calculate the final role to send to the backend
//   const effectiveRole = (roleCategory === "academic" || roleCategory === "non_academic") 
//     ? specificRole 
//     : roleCategory;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (error) setError("");
//   };

//   // Base Permissions map for roles
//   const subRolePermissions = {
//     institute_admin: { canManageAll: true },
//     principal: {
//       canApproveLeave: true, canManageAnnouncements: true, canViewReports: true, canManageDepartments: true, canViewFinance: true,
//     },
//     dean: {
//       canManageDepartments: true, canViewReports: true, canManageAnnouncements: true,
//     },
//     hod: {
//       canViewFinance: true, canApproveLeave: true, canViewTimetables: true, canManageAnnouncements: true, canManageSubjects: true, canManageDepartments: true,
//     },
//     faculty: { canManageAttendance: true, canManageGrades: true },
//     guest_faculty: { canManageAttendance: true },
//     proctor: { canViewStudentDiscipline: true, canManageAnnouncements: true },
//     accountant: {
//       canViewReports: true, canViewPaymentHistory: true, canManageScholarships: true, canManageAnnouncements: true, canGenerateInvoices: true, canManageFeeCollection: true,
//     },
//   };

//   // Info banners per role
//   const subRoleBanners = {
//     principal:     { icon: "🏫", text: "Principal Access — Oversee all academic and administrative operations." },
//     dean:          { icon: "🏛️", text: "Dean Access — Administrative oversight and department management." },
//     hod:           { icon: "🎓", text: "HOD Access — Department, subjects, timetables, and faculty oversight." },
//     faculty:       { icon: "👨‍🏫", text: "Faculty Access — Manage classes, attendance, grades, and assignments." },
//     guest_faculty: { icon: "👤", text: "Guest Faculty Access — Limited access to assigned classes and grading." },
//     proctor:       { icon: "🛡️", text: "Proctor Access — Monitor student discipline and campus compliance." },
//     accountant:    { icon: "💼", text: "Accountant Access — Fee collection, invoices, payroll, and finance reports." },
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
        
//         // Merge frontend hardcoded permissions with backend dynamic permissions
//         const localPermissions = subRolePermissions[effectiveRole] || {};
//         const backendPermissions = response.permissions || userData.permissions || {};
//         const finalPermissions = { ...localPermissions, ...backendPermissions };

//         localStorage.setItem("user", JSON.stringify({
//           ...userData,
//           role: effectiveRole,
//           instituteCode: formData.instituteCode,
//           ...(Object.keys(finalPermissions).length > 0 && { permissions: finalPermissions }),
//         }));

//         localStorage.setItem("role", effectiveRole);
//       }

//       setIsSuccess(true);

//       // Route mapping based on the exact role
//       const roleRoutes = {
//         super_admin:     "/super-admin/dashboard",
//         institute_admin: "/admin/dashboard",
//         principal:       "/admin/principal",
//         dean:            "/admin/dashboard", // Assuming Dean uses admin dashboard
//         accountant:      "/admin/dashboard", 
//         hod:             "/faculty/dashboard",
//         faculty:         "/faculty/dashboard",
//         guest_faculty:   "/faculty/dashboard",
//         proctor:         "/faculty/dashboard",
//         student:         "/student/dashboard",
//       };

//       setTimeout(() => navigate(roleRoutes[effectiveRole] || "/"), 800);

//     } catch (err) {
//       setError(err.response?.data?.message || err.message || "Invalid credentials. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Top-Level Categories
//   const categories = [
//     { id: "super_admin",     label: "Super" },
//     { id: "institute_admin", label: "Admin" },
//     { id: "academic",        label: "Academic" },
//     { id: "non_academic",    label: "Non-Academic" },
//     { id: "student",         label: "Student" },
//   ];

//   // Academic Sub-Roles
//   const academicRoles = [
//     { value: "principal",     label: "Principal",     icon: "🏫" },
//     { value: "hod",           label: "HOD",           icon: "🎓" },
//     { value: "faculty",       label: "Faculty",       icon: "👨‍🏫" },
//     { value: "guest_faculty", label: "Guest Fac.",    icon: "👤" },
//     { value: "proctor",       label: "Proctor",       icon: "🛡️" },
//   ];

//   // Non-Academic Sub-Roles
//   const nonAcademicRoles = [
//     { value: "dean",          label: "Dean",          icon: "🏛️" },
//     { value: "accountant",    label: "Accountant",    icon: "💼" },
//   ];

//   const activeBanner = subRoleBanners[effectiveRole];

//   return (
//     <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden text-left">

//       {/* LEFT SIDE */}
//       <div className="hidden lg:flex w-[50%] relative bg-slate-900 text-left">
//         <img
//           src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2586&auto=format&fit=crop"
//           alt="College Campus"
//           className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
//         />
//         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
//         <div className="relative z-10 w-full h-full flex flex-col justify-between p-16 text-white text-left">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
//               <GraduationCap size={24} className="text-white" />
//             </div>
//             <span className="text-xl font-bold tracking-wide">EduERP</span>
//           </div>
//           <div className="max-w-xl mb-12 text-left">
//             <h1 className="text-5xl font-bold leading-tight mb-6 text-left">
//               Building the <span className="text-blue-400">Future</span> of Education.
//             </h1>
//             <p className="text-lg text-gray-300 leading-relaxed text-left">
//               Streamline administration, empower faculty, and engage students with a single platform.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* RIGHT SIDE */}
//       <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-12 xl:px-20 bg-white text-left">
//         <div className="w-full max-w-sm mx-auto space-y-8 text-left">

//           {/* Mobile logo */}
//           <div className="lg:hidden flex items-center gap-2 text-left">
//             <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
//               <GraduationCap size={18} className="text-white" />
//             </div>
//             <span className="text-lg font-bold text-slate-900">EduERP</span>
//           </div>

//           <div className="text-left">
//             <h2 className="text-5xl font-bold text-slate-900 tracking-tight text-left">Welcome back</h2>
//             <p className="text-slate-500 mt-2 text-lg text-left">Please enter your details to sign in.</p>
//           </div>

//           {/* Dynamic role access banner */}
//           {activeBanner && (
//             <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium animate-in fade-in slide-in-from-top-1 text-left">
//               {activeBanner.icon} <span className="font-bold">{activeBanner.text}</span>
//             </div>
//           )}

//           {error && (
//             <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-left">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-5 text-left">
//             {/* Email */}
//             <div className="space-y-1 text-left">
//               <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-left block">Email Address</label>
//               <div className="relative group text-left">
//                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                 <input
//                   type="email" name="email" value={formData.email} onChange={handleChange}
//                   className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-left"
//                   placeholder="name@institute.com" required
//                 />
//               </div>
//             </div>

//             {/* Institute Code */}
//             {effectiveRole !== "super_admin" && (
//               <div className="space-y-1 text-left">
//                 <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-left block">Institute Code</label>
//                 <div className="relative group text-left">
//                   <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                   <input
//                     type="text" name="instituteCode" value={formData.instituteCode} onChange={handleChange}
//                     className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-left"
//                     placeholder="e.g. KII751030" required
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Password */}
//             <div className="space-y-1 text-left">
//               <label className="text-sm font-bold text-slate-700 uppercase tracking-widest text-left block">Password</label>
//               <div className="relative group text-left">
//                 <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
//                 <input
//                   type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
//                   className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-left"
//                   placeholder="••••••••" required
//                 />
//                 <button type="button" onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors outline-none">
//                   {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                 </button>
//               </div>
              
//               <div className="flex justify-end pt-1 w-full">
//                 <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors outline-none">
//                   Forgot password?
//                 </a>
//               </div>
//             </div>

//             {/* Submit */}
//             <button type="submit" disabled={loading || isSuccess}
//               className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 outline-none
//                 ${isSuccess ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'}`}>
//               {loading ? <Loader2 className="h-5 w-5 animate-spin" />
//                : isSuccess ? <><CheckCircle2 size={18} /> Verified</>
//                : <>Sign In <ArrowRight size={18} /></>}
//             </button>
//           </form>

//           {/* ── ROLE SELECTOR ── */}
//           <div className="space-y-3 pt-2 text-left">
//             <div className="relative text-left">
//               <div className="absolute inset-0 flex items-center text-left">
//                 <div className="w-full border-t border-slate-100 text-left" />
//               </div>
//               <div className="relative flex justify-center text-[13px] uppercase tracking-[0.2em] font-black text-slate-400 text-left">
//                 <span className="bg-white px-2 text-left">Select Access Level</span>
//               </div>
//             </div>

//             {/* Top-level category tabs */}
//             <div className="p-1 bg-slate-50 border border-slate-100 rounded-xl flex flex-wrap justify-center gap-1 text-left">
//               {categories.map(({ id, label }) => (
//                 <button
//                   key={id}
//                   type="button"
//                   onClick={() => { 
//                     setRoleCategory(id); 
//                     setError(""); 
//                     // Auto-select first sub-role to prevent broken state
//                     if (id === "academic") setSpecificRole("faculty");
//                     if (id === "non_academic") setSpecificRole("accountant");
//                   }}
//                   className={`flex-1 min-w-[70px] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 text-center outline-none
//                     ${roleCategory === id
//                       ? "bg-white text-blue-600 shadow-sm border border-slate-100"
//                       : "text-slate-400 hover:text-slate-600"}`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {/* ── Sub-roles Grid (Academic) ── */}
//             {roleCategory === "academic" && (
//               <div className="animate-in fade-in slide-in-from-top-1 duration-200 text-left">
//                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-left">
//                   <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 text-left pl-1">
//                     Academic Roles
//                   </p>
//                   <div className="grid grid-cols-3 gap-2 text-left">
//                     {academicRoles.map(({ value, label, icon }) => (
//                       <button
//                         key={value}
//                         type="button"
//                         onClick={() => setSpecificRole(value)}
//                         className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all duration-150 outline-none
//                           ${specificRole === value
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

//             {/* ── Sub-roles Grid (Non-Academic) ── */}
//             {roleCategory === "non_academic" && (
//               <div className="animate-in fade-in slide-in-from-top-1 duration-200 text-left">
//                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-2 text-left">
//                   <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 text-left pl-1">
//                     Administrative Roles
//                   </p>
//                   <div className="grid grid-cols-2 gap-2 text-left">
//                     {nonAcademicRoles.map(({ value, label, icon }) => (
//                       <button
//                         key={value}
//                         type="button"
//                         onClick={() => setSpecificRole(value)}
//                         className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-[11px] font-bold uppercase tracking-wide transition-all duration-150 outline-none
//                           ${specificRole === value
//                             ? "bg-white border-blue-200 text-blue-600 shadow-sm"
//                             : "bg-transparent border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300"}`}
//                       >
//                         <span className="text-lg">{icon}</span>
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