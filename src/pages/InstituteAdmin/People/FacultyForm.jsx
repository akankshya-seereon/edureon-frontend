import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api"; // 👈 USING YOUR NEW API INTERCEPTOR
import {
  Save, Upload, CheckCircle, AlertCircle, Eye, EyeOff,
  Loader, X, RotateCcw, User, Lock, FileText, GraduationCap,
  Landmark, Briefcase, ChevronRight, ChevronLeft, Check,
  Trash2, File, ImageIcon, Shield, ArrowLeft
} from "lucide-react";

// Safe File check — handles bundler/SSR contexts where File may not be the real constructor
const isFile = (val) => {
  if (!val || typeof val !== "object") return false;
  return typeof val.name === "string" && typeof val.size === "number";
};

const LS_DRAFT_KEY   = "faculty_form_draft";

const defaultForm = {
  first_name: "", last_name: "", email: "", phone: "", dob: "", gender: "",
  institute_code: "", password: "", confirmPassword: "",
  aadhar_no: "", aadhar_file: null,
  pan_no:    "", pan_file:    null,
  education: {
    tenth:   { board: "", marks: "", year: "", file: null },
    twelfth: { board: "", marks: "", year: "", file: null },
    bed:     { university: "", marks: "", year: "", file: null },
    ug:      { degree: "", university: "", marks: "", year: "", file: null },
    pg:      { degree: "", university: "", marks: "", year: "", file: null },
    other:   { degree: "", university: "", marks: "", year: "", file: null },
  },
  bank_name: "", account_holder_name: "", account_number: "",
  confirm_account_number: "", branch_name: "", ifsc_code: "",
  department: "", designation: "", experience: "",
};

const STEPS = [
  { id: 0, label: "Personal",     icon: User          },
  { id: 1, label: "Credentials",  icon: Lock          },
  { id: 2, label: "Legal Docs",   icon: Shield        },
  { id: 3, label: "Education",    icon: GraduationCap },
  { id: 4, label: "Bank Info",    icon: Landmark      },
  { id: 5, label: "Professional", icon: Briefcase     },
];

const EDU_LEVELS = [
  { key: "tenth",   label: "10th Grade",        emoji: "📗", hasBoard: true,  hasDegree: false },
  { key: "twelfth", label: "12th Grade",        emoji: "📘", hasBoard: true,  hasDegree: false },
  { key: "bed",     label: "B.Ed",              emoji: "🎓", hasBoard: false, hasDegree: false },
  { key: "ug",      label: "Under Graduate (UG)", emoji: "🎓", hasBoard: false, hasDegree: true  },
  { key: "pg",      label: "Post Graduate (PG)",  emoji: "👨‍🎓", hasBoard: false, hasDegree: true  },
  { key: "other",   label: "Other Certificate",   emoji: "📄", hasBoard: false, hasDegree: true  },
];

const DEPARTMENTS  = ["Computer Science","Physics","Mathematics","Chemistry","Biology","English","History","Economics","Commerce","Arts"];
const DESIGNATIONS = ["Lecturer","Assistant Professor","Associate Professor","Professor","Senior Professor","HOD","Principal"];

// ─── Sub-components ───────────────────────────────────────────────────────────
const FormInput = ({ label, name, type = "text", value, onChange, error, placeholder, required, disabled, hint }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1 text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type} name={name} value={value || ""} onChange={onChange}
      placeholder={placeholder} disabled={disabled}
      className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium outline-none transition-all
        ${error
          ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-200 text-red-700"
          : "border-slate-200 bg-white hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800"}
        disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed`}
    />
    {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
  </div>
);

const PasswordInput = ({ label, name, value, onChange, error, show, onToggle, placeholder, required, disabled, hint }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={show ? "text" : "password"} name={name} value={value || ""}
        onChange={onChange} placeholder={placeholder} disabled={disabled}
        className={`w-full px-3.5 py-3 pr-11 rounded-xl border text-sm font-medium outline-none transition-all
          ${error ? "border-red-400 bg-red-50/50 focus:ring-2 focus:ring-red-200" : "border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
          disabled:bg-slate-50 disabled:cursor-not-allowed`}
      />
      <button type="button" onClick={onToggle} disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1">
        {show ? <EyeOff size={15}/> : <Eye size={15}/>}
      </button>
    </div>
    {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
  </div>
);

const SelectInput = ({ label, name, value, onChange, error, required, disabled, options }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select name={name} value={value || ""} onChange={onChange} disabled={disabled}
      className={`w-full px-3.5 py-3 rounded-xl border text-sm font-medium outline-none transition-all appearance-none cursor-pointer
        ${error ? "border-red-400 bg-red-50/50" : "border-slate-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}
        disabled:bg-slate-50 disabled:cursor-not-allowed`}>
      <option value="">Select {label}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
  </div>
);

const FileUpload = ({ label, id, file, storedName, onChange, error, required, disabled, accept = ".pdf,.jpg,.jpeg,.png" }) => {
  const hasFile = !!file;
  const isImage = file?.type?.startsWith("image/");
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative border-2 border-dashed rounded-xl transition-all
        ${hasFile ? "border-emerald-400 bg-emerald-50/50"
          : error  ? "border-red-300 bg-red-50/30"
          : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30"}`}>
        <input type="file" id={id} accept={accept} onChange={onChange} disabled={disabled} className="hidden"/>
        {hasFile ? (
          <div className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              {isImage ? <ImageIcon size={18} className="text-emerald-600"/> : <File size={18} className="text-emerald-600"/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-emerald-700 truncate">{file.name}</p>
              <p className="text-[10px] text-emerald-500">{(file.size / 1024).toFixed(1)} KB · Uploaded</p>
            </div>
            <label htmlFor={id} className="cursor-pointer p-1.5 hover:bg-emerald-100 rounded-lg transition-colors">
              <RotateCcw size={14} className="text-emerald-600"/>
            </label>
          </div>
        ) : (
          <label htmlFor={id} className="flex flex-col items-center gap-2 py-4 px-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Upload size={16} className="text-slate-400"/>
            </div>
            {storedName ? (
              <div className="text-center">
                <p className="text-sm font-bold text-amber-600">⚠ Re-upload required</p>
                <p className="text-[10px] text-amber-500 truncate max-w-[160px]">{storedName}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">Click to upload</p>
                <p className="text-[10px] text-slate-400">PDF · JPG · PNG  (max 5 MB)</p>
              </div>
            )}
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  );
};

const StepIndicator = ({ steps, current, completed }) => (
  <div className="flex items-center justify-center gap-0 w-full overflow-x-auto py-2 px-2">
    {steps.map((step, i) => {
      const Icon  = step.icon;
      const done  = completed.includes(i);
      const active = current === i;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300
              ${done   ? "bg-blue-600 border-transparent text-white"
              : active ? "bg-white border-blue-500 text-blue-600 ring-4 ring-blue-500/20"
              :          "bg-white border-slate-200 text-slate-400"}`}>
              {done ? <Check size={15}/> : <Icon size={15}/>}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block
              ${active ? "text-blue-600" : done ? "text-slate-500" : "text-slate-300"}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 flex-1 mx-1 min-w-4 transition-all duration-500 rounded
              ${done ? "bg-blue-600" : "bg-slate-200"}`}/>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const FacultyForm = () => {
  const navigate  = useNavigate();
  const scrollRef = useRef(null);

  const [step,        setStep]        = useState(0);
  const [completed,   setCompleted]   = useState([]);
  const [form,        setForm]        = useState(defaultForm);
  const [errors,      setErrors]      = useState({});
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [showConfPass,setShowConfPass]= useState(false);
  const [storedFiles, setStoredFiles] = useState({ aadhar_file: null, pan_file: null, education: {} });
  const [successMsg,  setSuccessMsg]  = useState("");

  // Load draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const education = {};
      Object.keys(defaultForm.education).forEach(k => {
        education[k] = { ...defaultForm.education[k], ...(parsed.education?.[k] || {}), file: null };
      });
      setForm(prev => ({ ...prev, ...parsed, aadhar_file: null, pan_file: null, education }));
      const eduNames = {};
      Object.keys(defaultForm.education).forEach(k => { eduNames[k] = parsed.education?.[k]?.file || null; });
      setStoredFiles({ aadhar_file: parsed.aadhar_file || null, pan_file: parsed.pan_file || null, education: eduNames });
    } catch {}
  }, []);

  // Auto-save draft
  useEffect(() => {
    try {
      const draft = {
        ...form,
        aadhar_file: isFile(form.aadhar_file) ? form.aadhar_file.name : null,
        pan_file:    isFile(form.pan_file)    ? form.pan_file.name    : null,
        education: {},
      };
      Object.keys(form.education).forEach(k => {
        const edu = form.education[k];
        draft.education[k] = { ...edu, file: isFile(edu.file) ? edu.file.name : null };
      });
      localStorage.setItem(LS_DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => { const n = { ...p }; delete n[name]; return n; });
  };

  const handleFile = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["application/pdf","image/jpeg","image/png","image/jpg"].includes(file.type)) {
      setErrors(p => ({ ...p, [field]: "Only PDF, JPG, PNG allowed" })); return;
    }
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({ ...p, [field]: "Max 5 MB" })); return; }
    setForm(p => ({ ...p, [field]: file }));
    setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const handleEduChange = (level, field, value) => {
    setForm(p => ({ ...p, education: { ...p.education, [level]: { ...p.education[level], [field]: value } } }));
  };

  const handleEduFile = (e, level) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["application/pdf","image/jpeg","image/png","image/jpg"].includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    setForm(p => ({ ...p, education: { ...p.education, [level]: { ...p.education[level], file } } }));
  };

  const removeEduFile = (level) => {
    setForm(p => ({ ...p, education: { ...p.education, [level]: { ...p.education[level], file: null } } }));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      if (!form.first_name?.trim()) e.first_name = "Required";
      if (!form.last_name?.trim())  e.last_name  = "Required";
      if (!form.email?.trim())      e.email      = "Required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
      if (!form.phone?.trim())      e.phone      = "Required";
    }
    if (s === 1) {
      if (!form.institute_code?.trim()) e.institute_code = "Required";
      if (!form.password)               e.password       = "Required";
      else if (form.password.length < 8) e.password      = "Min 8 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    }
    if (s === 2) {
      if (!form.aadhar_no?.trim()) e.aadhar_no   = "Required";
      if (!form.aadhar_file)       e.aadhar_file = "Upload Aadhar document";
      if (!form.pan_no?.trim())    e.pan_no      = "Required";
      if (!form.pan_file)          e.pan_file    = "Upload PAN document";
    }
    if (s === 3) {
      const hasAny = Object.values(form.education).some(e => e.file);
      if (!hasAny) e.education_general = "Upload at least one certificate";
    }
    if (s === 4) {
      if (!form.bank_name?.trim())           e.bank_name           = "Required";
      if (!form.account_holder_name?.trim()) e.account_holder_name = "Required";
      if (!form.account_number?.trim())      e.account_number      = "Required";
      if (form.account_number !== form.confirm_account_number) e.confirm_account_number = "Account numbers don't match";
      if (!form.ifsc_code?.trim())           e.ifsc_code           = "Required";
    }
    if (s === 5) {
      if (!form.department)          e.department  = "Required";
      if (!form.designation?.trim()) e.designation = "Required";
      if (!form.experience?.trim())  e.experience  = "Required";
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});
    setCompleted(p => [...new Set([...p, step])]);
    setStep(p => p + 1);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    setStep(p => p - 1);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🚀 DYNAMIC SUBMIT TO BACKEND (Cleaned up!) 🚀
  const handleSubmit = async () => {
    if (submitted || loading) return;
    
    setErrors(prev => { const n = { ...prev }; delete n._general; return n; });
    const e = validateStep(5);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    
    setLoading(true);

    try {
      // 1. Clean the education payload to stringify the file names (if you aren't using FormData yet)
      const cleanEducation = {};
      Object.keys(form.education).forEach(k => {
         cleanEducation[k] = { ...form.education[k], file: form.education[k].file?.name || null };
      });

      // 2. Map form data to backend expectations
      const payload = {
        ...form,
        education: cleanEducation,
        aadhar_file: form.aadhar_file?.name || null,
        pan_file: form.pan_file?.name || null,
        name: `${form.first_name} ${form.last_name}`.trim(),
        dept: form.department,
        empId: `FAC${Math.floor(Math.random() * 90000) + 10000}` 
      };

      // 3. Send to Node.js Backend via API Interceptor
      const response = await api.post("/admin/faculty", payload);

      if (response.data.success) {
        localStorage.removeItem(LS_DRAFT_KEY);
        setLoading(false);
        setSubmitted(true);
        setSuccessMsg(`${form.first_name} ${form.last_name} registered successfully!`);
        setTimeout(() => navigate("/admin/faculty"), 1200);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      setLoading(false);
      setErrors({ _general: err.response?.data?.message || "Failed to save to database. Please check connection." });
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(LS_DRAFT_KEY);
    setForm(defaultForm);
    setErrors({});
    setStep(0);
    setCompleted([]);
    setStoredFiles({ aadhar_file: null, pan_file: null, education: {} });
  };

  const validationErrors = Object.keys(errors).filter(k => k !== "_general");
  const errCount = validationErrors.length;
  const hasDraft = !!localStorage.getItem(LS_DRAFT_KEY);

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="First Name" name="first_name" value={form.first_name} onChange={handleChange} error={errors.first_name} placeholder="Anjali" required disabled={loading}/>
            <FormInput label="Last Name"  name="last_name"  value={form.last_name}  onChange={handleChange} error={errors.last_name}  placeholder="Sharma" required disabled={loading}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="anjali@institute.edu" required disabled={loading}/>
            <FormInput label="Phone Number"  name="phone" type="tel"   value={form.phone} onChange={handleChange} error={errors.phone} placeholder="+91 9876543210"       required disabled={loading}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Date of Birth" name="dob" type="date" value={form.dob} onChange={handleChange} disabled={loading}/>
            <SelectInput label="Gender" name="gender" value={form.gender} onChange={handleChange} disabled={loading} options={["Male","Female","Other","Prefer not to say"]}/>
          </div>
        </div>
      );

      case 1: return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex gap-3">
            <Shield size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-blue-800">Login Credentials</p>
              <p className="text-sm text-blue-600 mt-0.5">These will be used by the faculty to access the portal. Share securely.</p>
            </div>
          </div>
          <FormInput label="Institution Code" name="institute_code" value={form.institute_code} onChange={handleChange} error={errors.institute_code} placeholder="INST-2024-001" required disabled={loading} hint="Unique code assigned by the institution"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordInput label="Password" name="password" value={form.password} onChange={handleChange} error={errors.password} show={showPass} onToggle={() => setShowPass(v => !v)} placeholder="Min. 8 characters" required disabled={loading} hint="Use letters, numbers & symbols"/>
            <PasswordInput label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} error={errors.confirmPassword} show={showConfPass} onToggle={() => setShowConfPass(v => !v)} placeholder="Re-enter password" required disabled={loading}/>
          </div>
          {form.password && form.password.length >= 8 && (
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 flex-1">
                {[...Array(4)].map((_, i) => {
                  const strength =
                    (form.password.length >= 12 ? 1 : 0) +
                    (/[A-Z]/.test(form.password) ? 1 : 0) +
                    (/[0-9]/.test(form.password) ? 1 : 0) +
                    (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0);
                  return <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                    i < strength
                      ? strength <= 1 ? "bg-red-500" : strength <= 2 ? "bg-amber-400" : strength <= 3 ? "bg-blue-400" : "bg-emerald-500"
                      : "bg-slate-200"
                  }`}/>;
                })}
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {(() => {
                  const s = (form.password.length >= 12 ? 1 : 0) + (/[A-Z]/.test(form.password) ? 1 : 0) + (/[0-9]/.test(form.password) ? 1 : 0) + (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0);
                  return s <= 1 ? "Weak" : s <= 2 ? "Fair" : s <= 3 ? "Good" : "Strong";
                })()}
              </span>
            </div>
          )}
        </div>
      );

      case 2: return (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-4 py-3 flex items-center gap-2.5">
              <span className="text-base">🪪</span>
              <span className="text-sm font-black text-white">Aadhar Card</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Aadhar Number" name="aadhar_no" value={form.aadhar_no} onChange={handleChange} error={errors.aadhar_no} placeholder="XXXX XXXX XXXX" required disabled={loading} hint="12-digit Aadhar number"/>
              <FileUpload label="Aadhar Document" id="aadhar-file" file={form.aadhar_file} storedName={storedFiles.aadhar_file} onChange={(e) => handleFile(e, "aadhar_file")} error={errors.aadhar_file} required disabled={loading}/>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-blue-600 px-4 py-3 flex items-center gap-2.5">
              <span className="text-base">💳</span>
              <span className="text-sm font-black text-white">PAN Card</span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="PAN Number" name="pan_no" value={form.pan_no} onChange={handleChange} error={errors.pan_no} placeholder="ABCDE1234F" required disabled={loading} hint="10-character PAN number"/>
              <FileUpload label="PAN Document" id="pan-file" file={form.pan_file} storedName={storedFiles.pan_file} onChange={(e) => handleFile(e, "pan_file")} error={errors.pan_file} required disabled={loading}/>
            </div>
          </div>
        </div>
      );

      case 3: return (
        <div className="space-y-4">
          {errors.education_general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={14}/> {errors.education_general}
            </div>
          )}
          <p className="text-sm font-semibold text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            💡 Fill in the details for each qualification you hold. At least one certificate upload is required.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EDU_LEVELS.map(({ key, label, emoji, hasBoard, hasDegree }) => {
              const edu = form.education[key];
              const stored = storedFiles.education?.[key];
              return (
                <div key={key} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{emoji}</span>
                      <span className="text-sm font-black text-white">{label}</span>
                    </div>
                    {edu.file && (
                      <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">✓ Uploaded</span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    {hasDegree && (
                      <input type="text" value={edu.degree || ""} onChange={e => handleEduChange(key, "degree", e.target.value)}
                        placeholder="Degree name (e.g. B.Sc, B.Com)" disabled={loading}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                    )}
                    <input type="text" value={edu.board || edu.university || ""} onChange={e => handleEduChange(key, hasBoard ? "board" : "university", e.target.value)}
                      placeholder={hasBoard ? "Board (e.g. CBSE, ICSE)" : "University / Institute name"} disabled={loading}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={edu.marks || ""} onChange={e => handleEduChange(key, "marks", e.target.value)}
                        placeholder="Marks / CGPA" disabled={loading}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                      <input type="text" value={edu.year || ""} onChange={e => handleEduChange(key, "year", e.target.value)}
                        placeholder="Pass Year" disabled={loading}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"/>
                    </div>
                    {edu.file ? (
                      <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={14} className="text-emerald-600"/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-emerald-700 truncate">{edu.file.name}</p>
                          <p className="text-[10px] text-emerald-500">{(edu.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button type="button" onClick={() => removeEduFile(key)} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors">
                          <Trash2 size={13} className="text-emerald-600"/>
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                        <input type="file" id={`edu-${key}`} accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleEduFile(e, key)} disabled={loading} className="hidden"/>
                        <label htmlFor={`edu-${key}`} className="flex items-center justify-center gap-2 py-3 px-4 cursor-pointer">
                          <Upload size={14} className="text-slate-400"/>
                          <span className="text-sm font-semibold text-slate-500">
                            {stored ? `⚠ Re-upload: ${stored.substring(0, 20)}` : "Upload Certificate"}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );

      case 4: return (
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex gap-3">
            <Landmark size={18} className="text-emerald-600 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-bold text-emerald-800">Bank Account Details</p>
              <p className="text-sm text-emerald-600 mt-0.5">Used for salary disbursement. Ensure all details are accurate.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Bank Name" name="bank_name" value={form.bank_name} onChange={handleChange} error={errors.bank_name} placeholder="State Bank of India" required disabled={loading}/>
            <FormInput label="Account Holder Name" name="account_holder_name" value={form.account_holder_name} onChange={handleChange} error={errors.account_holder_name} placeholder="Full name as per bank records" required disabled={loading}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Account Number" name="account_number" value={form.account_number} onChange={handleChange} error={errors.account_number} placeholder="123456789012" required disabled={loading}/>
            <FormInput label="Confirm Account Number" name="confirm_account_number" value={form.confirm_account_number} onChange={handleChange} error={errors.confirm_account_number} placeholder="Re-enter account number" required disabled={loading}/>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Branch Name" name="branch_name" value={form.branch_name} onChange={handleChange} placeholder="e.g. MG Road Branch" disabled={loading}/>
            <FormInput label="IFSC Code" name="ifsc_code" value={form.ifsc_code} onChange={handleChange} error={errors.ifsc_code} placeholder="SBIN0001234" required disabled={loading} hint="11-character alphanumeric code"/>
          </div>
        </div>
      );

      case 5: return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectInput label="Department" name="department" value={form.department} onChange={handleChange} error={errors.department} required disabled={loading} options={DEPARTMENTS}/>
            <SelectInput label="Designation" name="designation" value={form.designation} onChange={handleChange} error={errors.designation} required disabled={loading} options={DESIGNATIONS}/>
            <FormInput label="Experience (Years)" name="experience" value={form.experience} onChange={handleChange} error={errors.experience} placeholder="e.g. 5" required disabled={loading}/>
          </div>
          {/* Review summary */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-800 px-5 py-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-400"/>
              <span className="text-sm font-black text-white">Registration Summary</span>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Name",       value: `${form.first_name} ${form.last_name}` },
                { label: "Email",      value: form.email },
                { label: "Phone",      value: form.phone },
                { label: "Inst. Code", value: form.institute_code },
                { label: "Aadhar",     value: form.aadhar_no ? "✓ Provided" : "—" },
                { label: "PAN",        value: form.pan_no    ? "✓ Provided" : "—" },
                { label: "Bank",       value: form.bank_name || "—" },
                { label: "Account",    value: form.account_number ? `••••${form.account_number.slice(-4)}` : "—" },
                { label: "Certs",      value: `${Object.values(form.education).filter(e => e.file).length} / 6 uploaded` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate mt-0.5">{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "sans-serif" }}>
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate("/admin/faculty")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition">
          <ArrowLeft size={16}/> Back to Faculty
        </button>
        <div className="h-5 w-px bg-slate-200"/>
        <div>
          <h1 className="text-lg font-black text-slate-800">Faculty Registration</h1>
          <p className="text-xs text-slate-400">Step {step + 1} of {STEPS.length} · {STEPS[step].label}</p>
        </div>
        {hasDraft && (
          <button onClick={clearDraft} type="button"
            className="ml-auto text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-3 py-1.5 text-sm font-bold transition flex items-center gap-1 border border-slate-200">
            <RotateCcw size={13}/> Clear Draft
          </button>
        )}
      </div>

      <div className="max-w-8xl mx-auto px-4 py-6 pb-32" ref={scrollRef}>

        {/* ── Step indicator ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <StepIndicator steps={STEPS} current={step} completed={completed}/>
        </div>

        {/* ── Success message ── */}
        {successMsg && (
          <div className="mb-5 p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0"/>
            <div>
              <p className="font-bold text-emerald-800">{successMsg}</p>
              <p className="text-sm text-emerald-600">Redirecting to faculty list...</p>
            </div>
          </div>
        )}

        {/* ── Validation error banner ── */}
        {errCount > 0 && !successMsg && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0"/>
            <div>
              <p className="text-sm font-bold text-red-700">Please fix {errCount} error{errCount > 1 ? "s" : ""} before continuing</p>
              <p className="text-sm text-red-600 mt-0.5">{validationErrors.map(k => errors[k]).join(" · ")}</p>
            </div>
          </div>
        )}

        {/* ── Save error banner ── */}
        {errors._general && !successMsg && (
          <div className="mb-5 p-3 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-2">
            <AlertCircle size={15} className="text-red-600 mt-0.5 flex-shrink-0"/>
            <div>
              <p className="text-sm font-bold text-red-700">Registration Failed</p>
              <p className="text-sm text-red-600 mt-0.5">{errors._general}</p>
            </div>
          </div>
        )}

        {/* ── Draft notice ── */}
        {hasDraft && errCount === 0 && step === 0 && !successMsg && (
          <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2">
            <span className="text-blue-500">💾</span>
            <p className="text-sm font-semibold text-blue-700">Draft restored — file uploads need to be re-selected</p>
          </div>
        )}

        {/* ── Step content ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-blue-600 px-5 py-3.5 flex items-center gap-2.5">
            {React.createElement(STEPS[step].icon, { size: 15, className: "text-white" })}
            <span className="text-sm font-black text-white">{STEPS[step].label} Details</span>
          </div>
          <div className="p-5 md:p-6">{renderStep()}</div>
        </div>
      </div>

      {/* ── Sticky Footer Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-6 py-4 flex items-center gap-3 z-10">
        <button onClick={goBack} disabled={step === 0 || loading || submitted} type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft size={16}/> Back
        </button>

        <div className="flex-1 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300
              ${i === step ? "w-5 bg-blue-600" : completed.includes(i) ? "w-2.5 bg-blue-300" : "w-2.5 bg-slate-200"}`}/>
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button onClick={goNext} disabled={loading || submitted} type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-60">
            Next <ChevronRight size={16}/>
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || submitted} type="button"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/20 disabled:opacity-60">
            {loading
              ? <><Loader size={15} className="animate-spin"/> Registering...</>
              : submitted
              ? <><CheckCircle size={15}/> Registered!</>
              : <><Save size={15}/> Register Faculty</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default FacultyForm;