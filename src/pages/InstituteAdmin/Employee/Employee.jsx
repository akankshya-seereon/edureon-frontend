import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Loader2, Briefcase, GraduationCap, UserPlus, 
  Eye, EyeOff, Upload, FileText, X, CheckCircle, AlertCircle, Image, File
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl"; // Base URL for API calls

// ─── AXIOS CONFIGURATION ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const ACADEMIC_DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'HOD', 'Dean', 'Principal', 'Lecturer', 'Lab Instructor'];
const NON_ACADEMIC_DESIGNATIONS = ['Administrative Officer', 'Accountant', 'Clerk', 'Lab Technician', 'Librarian', 'Security Guard', 'IT Support', 'Peon'];
const QUALIFICATIONS = ['PhD', 'M.Tech', 'M.Sc', 'MBA', 'B.Tech', 'B.Sc', 'B.Com', 'Diploma', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const REQUIRED_FIELDS = {
  personal: ['firstName', 'lastName', 'email', 'phone', 'password'],
  professional: ['employeeId', 'designation'],
};

const DEFAULT_STAFF_FORM = {
  staffType: 'Academic', firstName: '', lastName: '', email: '', phone: '',
  gender: '', dob: '', bloodGroup: '', qualification: '', designation: '',
  employeeId: '', joiningDate: '', departmentId: '', address: '', password: '',
  panNumber: '', aadhaarNumber: '',
};

const DEFAULT_DOCS = {
  panCard: null, aadhaarCard: null, profilePhoto: null,
  degreeCertificate: null, experienceLetter: null, otherDocs: [],
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
const FormField = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

function FileDropZone({ label, accept, file, onChange, onRemove, hint, icon: Icon = FileText }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  
  const handleDrop = (e) => { 
    e.preventDefault(); setDrag(false); 
    const f = e.dataTransfer.files[0]; 
    if (f) onChange(f); 
  };
  
  const fmt = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  const isImg = file?.type?.startsWith('image/');

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {!file ? (
        <div onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
          <Upload size={16} className="text-gray-400" />
          <div className="text-center"><p className="text-xs font-bold text-gray-600">Click or drag to upload</p>{hint && <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>}</div>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && onChange(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-left">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
            {isImg ? <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" /> : <FileText size={18} className="text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0"><p className="text-xs font-bold text-gray-800 truncate">{file.name}</p><p className="text-[10px] text-gray-400 mt-0.5">{fmt(file.size)}</p></div>
          <div className="flex items-center gap-1.5 flex-shrink-0"><CheckCircle size={14} className="text-green-500" /><button type="button" onClick={onRemove} className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"><X size={14} /></button></div>
        </div>
      )}
    </div>
  );
}

function MultiFileDropZone({ files, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const add = (fl) => onChange(prev => [...prev, ...Array.from(fl)]);
  const remove = (i) => onChange(prev => prev.filter((_, idx) => idx !== i));
  const fmt = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="flex flex-col gap-2 text-left">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Other Documents</label>
      <div onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={`flex items-center gap-3 px-4 py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
        <Upload size={16} className="text-gray-400 flex-shrink-0" />
        <p className="text-xs font-semibold text-gray-500">Add files (offer letter, NOC, certificates…)</p>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => add(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div className="space-y-1.5 mt-1 text-left">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <File size={13} className="text-blue-400 flex-shrink-0" />
              <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{f.name}</span>
              <span className="text-[10px] text-gray-400 flex-shrink-0">{fmt(f.size)}</span>
              <button type="button" onClick={() => remove(i)} className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><X size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FORM SECTIONS ────────────────────────────────────────────────────────────

function PersonalInfoSection({ formData, setField, showPassword, onTogglePassword }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
      <FormField label="First Name" required><input type="text" placeholder="e.g. Rajesh" value={formData.firstName} onChange={e => setField('firstName', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Last Name" required><input type="text" placeholder="e.g. Kumar" value={formData.lastName} onChange={e => setField('lastName', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Gender"><select value={formData.gender} onChange={e => setField('gender', e.target.value)} className="form-input cursor-pointer text-left"><option value="">Select</option>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></FormField>
      <FormField label="Date of Birth"><input type="date" value={formData.dob} onChange={e => setField('dob', e.target.value)} className="form-input cursor-pointer text-left" /></FormField>
      <FormField label="Blood Group"><select value={formData.bloodGroup} onChange={e => setField('bloodGroup', e.target.value)} className="form-input cursor-pointer text-left"><option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select></FormField>
      <FormField label="Phone" required><input type="tel" placeholder="10-digit mobile" value={formData.phone} onChange={e => setField('phone', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Email Address" required><input type="email" placeholder="staff@college.edu" value={formData.email} onChange={e => setField('email', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Login Password" required>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} placeholder="Set login password" value={formData.password} onChange={e => setField('password', e.target.value)} className="form-input pr-10 text-left" />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
        </div>
      </FormField>
      <FormField label="Residential Address"><input type="text" placeholder="Street, City" value={formData.address} onChange={e => setField('address', e.target.value)} className="form-input text-left" /></FormField>
    </div>
  );
}

function ProfessionalInfoSection({ formData, setField, staffTab, departments }) {
  const designations = staffTab === 'Academic' ? ACADEMIC_DESIGNATIONS : NON_ACADEMIC_DESIGNATIONS;
  
  // 🚀 FIX: Ensure departments is treated as an array to prevent .filter() crashes
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const deptOptions = safeDepartments.filter(d => d.type === staffTab);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
      <FormField label="Employee ID" required><input type="text" placeholder="e.g. EMP-001" value={formData.employeeId} onChange={e => setField('employeeId', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Designation" required><select value={formData.designation} onChange={e => setField('designation', e.target.value)} className="form-input cursor-pointer text-left"><option value="">Select</option>{designations.map(d => <option key={d}>{d}</option>)}</select></FormField>
      <FormField label="Highest Qualification"><select value={formData.qualification} onChange={e => setField('qualification', e.target.value)} className="form-input cursor-pointer text-left"><option value="">Select</option>{QUALIFICATIONS.map(q => <option key={q}>{q}</option>)}</select></FormField>
      <FormField label="Joining Date"><input type="date" value={formData.joiningDate} onChange={e => setField('joiningDate', e.target.value)} className="form-input cursor-pointer text-left" /></FormField>
      <FormField label="Assigned Department">
        <select value={formData.departmentId} onChange={e => setField('departmentId', e.target.value)} className="form-input cursor-pointer text-left">
          <option value="">Select Department</option>{deptOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </FormField>
      <FormField label="Staff Category">
        <div className={`form-input flex items-center gap-2 font-bold text-sm cursor-default text-left ${staffTab === 'Academic' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-purple-700 bg-purple-50 border-purple-200'}`}>
          {staffTab === 'Academic' ? <GraduationCap size={15} /> : <Briefcase size={15} />} {staffTab} Staff
        </div>
      </FormField>
    </div>
  );
}

function DocumentsSection({ formData, setField, docs, setDocField, setDocs }) {
  const panVal = formData.panNumber.toUpperCase();
  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panVal);
  const panTouched = panVal.length > 0;
  
  const aadhaarRaw = formData.aadhaarNumber.replace(/\s/g, '');
  const aadhaarValid = /^\d{12}$/.test(aadhaarRaw);
  const aadhaarTouched = aadhaarRaw.length > 0;

  const handleAadhaarChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
    setField('aadhaarNumber', formatted);
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <div className="flex items-center gap-2 mb-5"><div className="w-1 h-4 bg-blue-600 rounded-full" /><h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Identity Numbers</h4></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">PAN Card Number</label>
            <div className="relative">
              <input type="text" placeholder="ABCDE1234F" value={formData.panNumber} onChange={e => setField('panNumber', e.target.value.toUpperCase().slice(0, 10))} maxLength={10} className={`form-input pr-8 font-mono tracking-widest text-left ${panTouched ? panValid ? 'border-green-400 bg-green-50/30' : 'border-red-300 bg-red-50/20' : ''}`} />
              {panTouched && <div className="absolute right-3 top-1/2 -translate-y-1/2">{panValid ? <CheckCircle size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-400" />}</div>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aadhaar Card Number</label>
            <div className="relative">
              <input type="text" placeholder="XXXX XXXX XXXX" value={formData.aadhaarNumber} onChange={handleAadhaarChange} maxLength={14} className={`form-input pr-8 font-mono tracking-widest text-left ${aadhaarTouched ? aadhaarValid ? 'border-green-400 bg-green-50/30' : 'border-red-300 bg-red-50/20' : ''}`} />
              {aadhaarTouched && <div className="absolute right-3 top-1/2 -translate-y-1/2">{aadhaarValid ? <CheckCircle size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-400" />}</div>}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-5"><div className="w-1 h-4 bg-blue-600 rounded-full" /><h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Identity Documents</h4></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <FileDropZone label="PAN Card — Upload Scan" accept=".pdf,.jpg,.png" hint="PDF/Image, max 5 MB" file={docs.panCard} onChange={f => setDocField('panCard', f)} onRemove={() => setDocField('panCard', null)} />
          <FileDropZone label="Aadhaar Card — Upload Scan" accept=".pdf,.jpg,.png" hint="PDF/Image, max 5 MB" file={docs.aadhaarCard} onChange={f => setDocField('aadhaarCard', f)} onRemove={() => setDocField('aadhaarCard', null)} />
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-5"><div className="w-1 h-4 bg-blue-600 rounded-full" /><h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Supporting Documents</h4></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          <FileDropZone label="Profile Photo" accept=".jpg,.png,.webp" hint="JPG/PNG" file={docs.profilePhoto} onChange={f => setDocField('profilePhoto', f)} onRemove={() => setDocField('profilePhoto', null)} icon={Image} />
          <FileDropZone label="Degree Certificate" accept=".pdf,.jpg,.png" hint="Highest degree" file={docs.degreeCertificate} onChange={f => setDocField('degreeCertificate', f)} onRemove={() => setDocField('degreeCertificate', null)} />
          <FileDropZone label="Experience Letter" accept=".pdf,.jpg,.png" hint="Previous employer" file={docs.experienceLetter} onChange={f => setDocField('experienceLetter', f)} onRemove={() => setDocField('experienceLetter', null)} />
          <div><MultiFileDropZone files={docs.otherDocs} onChange={updater => setDocs(prev => ({ ...prev, otherDocs: typeof updater === 'function' ? updater(prev.otherDocs) : updater }))} /></div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

export default function Employee() {
  const [formData, setFormData] = useState({ ...DEFAULT_STAFF_FORM });
  const [docs, setDocs] = useState({ ...DEFAULT_DOCS, otherDocs: [] });
  const [staffTab, setStaffTab] = useState('Academic');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch departments so this component is independent
  const [departments, setDepartments] = useState([]);
  
  useEffect(() => {
    api.get('/admin/departments')
       .then(res => { 
         if (res.data?.success) {
           // 🚀 FIX: Safely enforce array structure to prevent .filter() crashes
           setDepartments(Array.isArray(res.data.data) ? res.data.data : []); 
         } 
       })
       .catch(err => console.error("Failed to load departments", err));
  }, []);

  const setField    = useCallback((k, v) => setFormData(p => ({ ...p, [k]: v })), []);
  const setDocField = useCallback((k, v) => setDocs(p => ({ ...p, [k]: v })), []);

  const resetForm = useCallback((tab) => {
    setFormData({ ...DEFAULT_STAFF_FORM, staffType: tab });
    setDocs({ ...DEFAULT_DOCS, otherDocs: [] });
    setShowPassword(false);
  }, []);

  const handleTabChange = (tab) => { setStaffTab(tab); resetForm(tab); };

  const validate = () => {
    const allReq = [...REQUIRED_FIELDS.personal, ...REQUIRED_FIELDS.professional];
    const missing = allReq.filter(k => !formData[k]?.trim());
    if (missing.length) {
      alert(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v ?? ''));
      ['panCard', 'aadhaarCard', 'profilePhoto', 'degreeCertificate', 'experienceLetter'].forEach(k => {
        if (docs[k]) payload.append(k, docs[k]);
      });
      docs.otherDocs.forEach(f => payload.append('otherDocs', f));
      
      const res = await api.post('/admin/employees/register', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      if (res.data.success) {
        resetForm(staffTab);
        alert('Employee registered successfully!');
        window.scrollTo(0,0);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to register employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <style>{`.form-input { width: 100%; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.85rem; font-weight: 600; color: #1e293b; outline: none; transition: border-color 0.15s, background 0.15s; text-align: left; } .form-input:focus { border-color: #3b82f6; background: #fff; }`}</style>
      
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 space-y-1 text-left">
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard Employee</h1>
           <p className="text-sm font-medium text-slate-500 italic">Register a new academic or non-academic staff member into the system.</p>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12 text-left">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-8 py-5 bg-white border-b border-gray-100 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
                <UserPlus size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Registration Form</h2>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
              {['Academic', 'Non-Academic'].map(tab => (
                <button key={tab} type="button" onClick={() => handleTabChange(tab)}
                  className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${
                    staffTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab === 'Academic' ? <GraduationCap size={14} className="inline mr-2" /> : <Briefcase size={14} className="inline mr-2" />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Form body */}
          <form onSubmit={handleSubmit}>
            <div className="p-8 space-y-10 text-left">
              
              {/* SECTION 1 */}
              <div className="text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-black">1</div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Personal Information</h3>
                </div>
                <PersonalInfoSection formData={formData} setField={setField} showPassword={showPassword} onTogglePassword={() => setShowPassword(p => !p)} />
              </div>

              <hr className="border-gray-100" />

              {/* SECTION 2 */}
              <div className="text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-black">2</div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Professional Information</h3>
                </div>
                <ProfessionalInfoSection formData={formData} setField={setField} staffTab={staffTab} departments={departments} />
              </div>

              <hr className="border-gray-100" />

              {/* SECTION 3 */}
              <div className="text-left">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-black">3</div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">Documents & ID</h3>
                </div>
                <DocumentsSection formData={formData} setField={setField} docs={docs} setDocField={setDocField} setDocs={setDocs} />
              </div>

            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 bg-gray-50 border-t border-gray-100 gap-4 text-left">
              <p className="text-xs text-gray-400 font-medium">
                * Required fields are marked with a red asterisk.
              </p>
              <button type="submit" disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-black rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-blue-200">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                Register Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}