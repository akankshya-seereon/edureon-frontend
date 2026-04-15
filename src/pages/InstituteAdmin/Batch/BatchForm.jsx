import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  ChevronRight, ChevronLeft, Check, X, Plus, Trash2,
  Search, Users, BookOpen, Building2,
  ShieldCheck, UserCheck, AlertCircle, Loader, CheckCircle,
  Layers, Hash, Calendar
} from "lucide-react";
import {
  DEPARTMENTS, COURSES_BY_DEPT, ACADEMIC_YEARS
} from "./BatchStorage.jsx";

// ─── Token Helper (Prevents 403 Errors) ───────────────────────────────────────
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user?.token || user?.data?.token;
  }
  return token;
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Academic Info",  icon: Layers     },
  { id: 2, label: "Department",  icon: Building2  },
  { id: 3, label: "Course",      icon: BookOpen   },
  { id: 4, label: "Sections",    icon: Hash       },
  { id: 5, label: "Proctor",     icon: UserCheck  },
  { id: 6, label: "HOD",         icon: ShieldCheck},
  { id: 7, label: "Students",    icon: Users      },
];

// ─── Default form state ───────────────────────────────────────────────────────
const defaultForm = {
  name: "", academic_year: "", start_year: "", end_year: "", max_strength: "",
  department_id: "", department_name: "",
  course: "",
  sections: [{ name: "A", strength: "60" }],
  proctor: null,
  hod: null,
  students: [],
};

const SECTION_NAMES = ["A","B","C","D","E","F","G","H"];

const B6   = "#2563eb";
const B6_05 = "rgba(37,99,235,0.05)";
const B6_08 = "rgba(37,99,235,0.08)";
const B6_10 = "rgba(37,99,235,0.10)";
const B6_12 = "rgba(37,99,235,0.12)";
const B6_15 = "rgba(37,99,235,0.15)";
const B6_20 = "rgba(37,99,235,0.20)";
const B6_30 = "rgba(37,99,235,0.30)";

const inputBase = {
  padding: "10px 14px",
  borderRadius: "12px",
  border: `1px solid ${B6_20}`,
  background: "white",
  fontSize: "14px",
  fontWeight: 500,
  color: B6,
  outline: "none",
  width: "100%",
  transition: "border-color 0.15s",
};

const Input = ({ label, name, type="text", value, onChange, error, placeholder, required, disabled, children }) => (
  <div className="space-y-1.5">
    <label style={{ fontSize: "10px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(37,99,235,0.5)" }}>
      {label}{required && <span style={{ color: B6, marginLeft: 2 }}>*</span>}
    </label>
    {children || (
      <input type={type} name={name} value={value||""} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{ ...inputBase, borderColor: error ? B6 : B6_20, opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "text" }}
        onFocus={e => e.target.style.borderColor = B6}
        onBlur={e => e.target.style.borderColor = error ? B6 : B6_20}
      />
    )}
    {error && (
      <p style={{ fontSize: "12px", color: B6, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
        <AlertCircle size={11}/>{error}
      </p>
    )}
  </div>
);

// ─── STEP 1: Batch Info ───────────────────────────────────────────────────────
const StepBatchInfo = ({ form, setForm, errors }) => {
  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  return (
    <div className="space-y-5 text-left">
      <div>
        <h3 style={{ fontSize: "20px", fontWeight: 900, color: B6 }}>Academic Information</h3>
        <p style={{ fontSize: "14px", color: "rgba(37,99,235,0.5)", marginTop: 4 }}>Define the academic name, academic year and strength limits.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 ">
          <Input label="Academic Name" name="name" value={form.name} onChange={h} error={errors.name} placeholder="e.g. Batch 2024-25 CSE" required />
        </div>
        <Input label="Academic Year" name="academic_year" error={errors.academic_year} required>
          <select name="academic_year" value={form.academic_year} onChange={h}
            style={{ ...inputBase, borderColor: errors.academic_year ? B6 : B6_20 }}
            onFocus={e => e.target.style.borderColor = B6}
            onBlur={e => e.target.style.borderColor = errors.academic_year ? B6 : B6_20}>
            <option value="">Select Academic Year</option>
            {ACADEMIC_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </Input>
        <Input label="Max Strength" name="max_strength" type="number" value={form.max_strength} onChange={h} error={errors.max_strength} placeholder="e.g. 120" required />
        <Input label="Start Year" name="start_year" type="number" value={form.start_year} onChange={h} placeholder="2024" />
        <Input label="End Year"   name="end_year"   type="number" value={form.end_year}   onChange={h} placeholder="2028" />
      </div>
    </div>
  );
};

// ─── STEP 2: Department ───────────────────────────────────────────────────────
const StepDepartment = ({ form, setForm, errors }) => (
  <div className="space-y-5">
    <div>
      <h3 style={{ fontSize: "20px", fontWeight: 900, color: B6 }}>Select Department</h3>
      <p style={{ fontSize: "14px", color: "rgba(37,99,235,0.5)", marginTop: 4 }}>Choose the department this batch belongs to.</p>
    </div>
    {errors.department_id && (
      <p style={{ fontSize: 13, color: B6, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
        <AlertCircle size={14}/>Please select a department
      </p>
    )}
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {DEPARTMENTS.map(dept => {
        const isActive = form.department_id === dept.id;
        return (
          <button key={dept.id} type="button"
            onClick={() => setForm(p => ({ ...p, department_id: dept.id, department_name: dept.name, course: "" }))}
            style={{
              padding: 16, borderRadius: 16, textAlign: "left", transition: "all 0.2s",
              background: isActive ? B6 : "white",
              border: `2px solid ${isActive ? B6 : B6_20}`,
              boxShadow: isActive ? "0 8px 24px rgba(37,99,235,0.25)" : "none",
              cursor: "pointer",
            }}>
            <div style={{ fontSize: 24, mb: 8 }}>{dept.icon}</div>
            <p style={{ fontSize: 13, fontWeight: 900, color: isActive ? "white" : B6, lineHeight: 1.3 }}>{dept.name}</p>
            {isActive && <div style={{ mt: 8, display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.8)", fontSize: 12 }}><Check size={11}/>Selected</div>}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── STEP 3: Course ───────────────────────────────────────────────────────────
const StepCourse = ({ form, setForm, errors }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/admin/courses", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        let loadedCourses = [];
        if (response.data.success && response.data.courses) {
          const deptCourses = response.data.courses.filter(c => c.department_id === form.department_id);
          if (deptCourses.length > 0) loadedCourses = deptCourses.map(c => c.name || c.course_name);
        }
        if (loadedCourses.length === 0) loadedCourses = COURSES_BY_DEPT[form.department_id] || [];
        setCourses(loadedCourses);
      } catch (error) {
        setCourses(COURSES_BY_DEPT[form.department_id] || []);
      } finally {
        setLoading(false);
      }
    };
    if (form.department_id) fetchCourses();
  }, [form.department_id]);

  return (
    <div className="space-y-5">
      <div>
        <h3 style={{ fontSize: "20px", fontWeight: 900, color: B6 }}>Select Course</h3>
      </div>
      {loading ? (
         <div style={{ padding: "48px 0", textAlign: "center", color: "rgba(37,99,235,0.4)" }}><Loader size={40} className="animate-spin" style={{ margin: "0 auto 12px", color: B6_20 }}/><p>Loading courses...</p></div>
      ) : courses.length === 0 ? (
        <div style={{ padding: "48px 0", textAlign: "center", color: "rgba(37,99,235,0.4)" }}><BookOpen size={40} style={{ margin: "0 auto 12px", color: B6_20 }}/><p>No courses found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {courses.map((course, i) => {
            const isActive = form.course === course;
            return (
              <button key={course} type="button" onClick={() => setForm(p => ({ ...p, course }))}
                style={{ padding: 16, borderRadius: 16, textAlign: "left", display: "flex", alignItems: "center", gap: 16, background: isActive ? B6 : "white", border: `2px solid ${isActive ? B6 : B6_20}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, background: isActive ? "rgba(255,255,255,0.2)" : B6_08, color: isActive ? "white" : B6 }}>{String.fromCharCode(65 + i)}</div>
                <div><p style={{ fontWeight: 700, fontSize: 14, color: isActive ? "white" : B6 }}>{course}</p></div>
                {isActive && <Check size={16} color="white" style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── STEP 4: Sections ─────────────────────────────────────────────────────────
const StepSections = ({ form, setForm, errors }) => {
  const addSection = () => {
    if (form.sections.length >= 8) return;
    setForm(p => ({ ...p, sections: [...p.sections, { name: SECTION_NAMES[p.sections.length], strength: "60" }] }));
  };
  const removeSection = (idx) => {
    if (form.sections.length <= 1) return;
    setForm(p => ({ ...p, sections: p.sections.filter((_, i) => i !== idx) }));
  };
  const updateSection = (idx, field, val) => {
    setForm(p => ({ ...p, sections: p.sections.map((s, i) => i === idx ? { ...s, [field]: val } : s) }));
  };
  
  return (
    <div className="space-y-5 text-left">
      <div className="flex items-start justify-between">
        <h3 style={{ fontSize: "20px", fontWeight: 900, color: B6 }}>Create Sections</h3>
        <button type="button" onClick={addSection} disabled={form.sections.length >= 8} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:opacity-50"><Plus size={15}/> Add Section</button>
      </div>
      <div className="space-y-3">
        {form.sections.map((section, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 bg-white border border-blue-100 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">{section.name}</div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input label="Section Name" value={section.name} onChange={e => updateSection(idx, "name", e.target.value)} />
              <Input label="Strength" type="number" value={section.strength} onChange={e => updateSection(idx, "strength", e.target.value)} />
            </div>
            <button type="button" onClick={() => removeSection(idx)} disabled={form.sections.length <= 1} className="p-3 bg-red-50 text-red-500 rounded-xl disabled:opacity-30"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── STEP 5 & 6: Assign Person ────────────────────────────────────────────────
const StepAssignPerson = ({ form, setForm, field, title, subtitle, icon: Icon }) => {
  const [search, setSearch] = useState("");
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const selected = form[field];

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/faculty", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (response.data.success) setFaculty(response.data.faculty || []);
      } catch (error) {
        setFaculty([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, []);

  const filtered = faculty.filter(f => {
    // Safely handles either single `name` or split `first_name`/`last_name`
    const fullName = (f.name || `${f.first_name || ""} ${f.last_name || ""}`).toLowerCase();
    const status = (f.status || 'active').toLowerCase();
    return (fullName.includes(search.toLowerCase()) || (f.email||"").toLowerCase().includes(search.toLowerCase())) && ["active","approved"].includes(status);
  });

  return (
    <div className="space-y-5">
      <div><h3 style={{ fontSize: "20px", fontWeight: 900, color: B6 }}>{title}</h3></div>
      {selected ? (
        <div className="p-4 border-2 border-blue-600 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg uppercase">
             {selected.first_name?.[0] || selected.name?.[0]}
          </div>
          <div className="flex-1">
            <p className="font-bold text-blue-600">{selected.first_name || selected.name} {selected.last_name}</p>
            <p className="text-xs text-gray-500">{selected.designation || "Faculty"}</p>
          </div>
          <button type="button" onClick={() => setForm(p => ({ ...p, [field]: null }))} className="text-xs font-bold text-gray-400">Change</button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faculty..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" />
          </div>
          {loading ? <div className="text-center p-8 text-gray-400"><Loader className="animate-spin mx-auto mb-2"/> Loading...</div> : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filtered.map(f => (
                <button key={f.id} type="button" onClick={() => setForm(p => ({ ...p, [field]: f }))} className="w-full p-3 flex items-center gap-4 bg-white border border-gray-100 rounded-xl hover:border-blue-600 text-left">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold uppercase">{f.name?.[0] || f.first_name?.[0]}</div>
                  <div>
                    <p className="font-bold text-blue-600 text-sm">{f.name || `${f.first_name} ${f.last_name}`}</p>
                    <p className="text-xs text-gray-400">{f.email || f.designation}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── STEP 7: Students ─────────────────────────────────────────────────────────
const StepStudents = ({ form, setForm }) => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("existing");
  const [manual, setManual] = useState({ name: "", email: "", roll_no: "" });
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/students", {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (response.data.success) setAllStudents(response.data.students || []);
      } catch (error) {
        setAllStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const available = allStudents.filter(s => {
    const fullName = (s.name || `${s.first_name || ""} ${s.last_name || ""}`).toLowerCase();
    const isAdded = form.students.some(fs => fs.id === s.id);
    return !isAdded && (fullName.includes(search.toLowerCase()) || (s.roll_no||"").toLowerCase().includes(search.toLowerCase()));
  });

  const toggleStudent = (s) => {
    const already = form.students.some(fs => fs.id === s.id);
    setForm(p => ({ ...p, students: already ? p.students.filter(fs => fs.id !== s.id) : [...p.students, s] }));
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-blue-600">Add Students</h3>
        <div className="flex bg-blue-50 p-1 rounded-lg">
          <button type="button" onClick={() => setTab("existing")} className={`px-3 py-1.5 text-xs font-bold rounded-md ${tab === 'existing' ? 'bg-white text-blue-600 shadow' : 'text-gray-400'}`}>From List</button>
          <button type="button" onClick={() => setTab("manual")} className={`px-3 py-1.5 text-xs font-bold rounded-md ${tab === 'manual' ? 'bg-white text-blue-600 shadow' : 'text-gray-400'}`}>Manual</button>
        </div>
      </div>

      {form.students.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex justify-between items-center">
          <span className="text-sm font-bold text-blue-600">{form.students.length} Students Selected</span>
          <button type="button" onClick={() => setForm(p => ({ ...p, students: [] }))} className="text-xs font-bold text-red-500">Clear All</button>
        </div>
      )}

      {tab === "existing" ? (
        <div className="space-y-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" />
          {loading ? <div className="text-center p-8 text-gray-400"><Loader className="animate-spin mx-auto"/></div> : (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {available.map(s => (
                <button key={s.id} type="button" onClick={() => toggleStudent(s)} className="w-full p-3 flex items-center justify-between bg-white border border-gray-100 rounded-xl hover:border-blue-600">
                  <div className="text-left">
                    <p className="font-bold text-blue-600 text-sm">{s.name || `${s.first_name} ${s.last_name}`}</p>
                    <p className="text-xs text-gray-400">{s.roll_no}</p>
                  </div>
                  <Plus size={16} className="text-gray-300"/>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl space-y-4">
           <Input label="Full Name" value={manual.name} onChange={e => setManual({...manual, name: e.target.value})} />
           <button type="button" disabled={!manual.name} onClick={() => {
              setForm(p => ({...p, students: [...p.students, {id: Date.now(), first_name: manual.name}]}));
              setManual({name:'', email:'', roll_no:''});
           }} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50">Add Student</button>
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN BatchForm
// ══════════════════════════════════════════════════════════════════════════════
const BatchForm = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState(defaultForm);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const bodyRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get("edit");

  const scrollTop = () => bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    if (editId) {
      const fetchBatchDetails = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/admin/batches/${editId}`, {
            headers: { Authorization: `Bearer ${getToken()}` }
          });
          
          if (res.data.success) {
            const b = res.data.batch;
            setForm({
              ...defaultForm,
              name: b.name,
              academic_year: b.academic_year,
              start_year: b.start_year,
              end_year: b.end_year,
              max_strength: b.max_strength,
              department_id: b.department_id,
              department_name: DEPARTMENTS.find(d => d.id === b.department_id)?.name || "",
              course: b.course_name,
              sections: b.sections?.length > 0 ? b.sections : [{ name: "A", strength: "60" }],
              proctor: b.proctor_id ? { id: b.proctor_id, first_name: b.proctor_fname, last_name: b.proctor_lname } : null,
              hod: b.hod_id ? { id: b.hod_id, first_name: b.hod_fname, last_name: b.hod_lname } : null,
            });
          }
        } catch (error) {
          console.error("Error fetching details:", error);
        }
      };
      fetchBatchDetails();
    }
  }, [editId]);

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.name?.trim())         e.name          = "Required";
      if (!form.academic_year)        e.academic_year = "Required";
      if (!form.max_strength)         e.max_strength  = "Required";
    }
    if (s === 2 && !form.department_id) e.department_id = "Required";
    if (s === 3 && !form.course)        e.course        = "Required";
    if (s === 4 && form.sections.some(sec => !sec.name.trim())) e.sections = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (!validateStep(step)) return; setStep(s => Math.min(s+1,7)); scrollTop(); };
  const prev = () => { setStep(s => Math.max(s-1,1)); setErrors({}); scrollTop(); };

  const handleSubmit = async () => {
    if (loading || done) return;
    setLoading(true);

    try {
      const payload = {
        name: form.name,
        academic_year: form.academic_year,
        start_year: parseInt(form.start_year) || null,
        end_year: parseInt(form.end_year) || null,
        max_strength: parseInt(form.max_strength) || 0,
        department_id: form.department_id,
        course_name: form.course,
        proctor_id: form.proctor?.id || null,
        hod_id: form.hod?.id || null,
        sections: form.sections,
        studentIds: form.students.map(s => s.id)
      };

      const res = await axios.post("http://localhost:5000/api/admin/batches", payload, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (res.data.success) {
        setDone(true);
        setTimeout(() => navigate("/admin/batch"), 1500);
      }
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Failed to save batch. (403: Ensure you are logged in!)");
      setLoading(false);
    }
  };

  const currentStep = STEPS[step - 1];

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "white" }}>
      <div style={{ background: "white", borderBottom: `1px solid ${B6_12}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate("/admin/batch")} style={{ padding: 8, borderRadius: 12, background: B6_05, color: B6 }}><ChevronLeft size={20}/></button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: B6 }}>{editId ? "Edit Batch" : "Create New Academic Year"}</h1>
          <p style={{ fontSize: 13, color: "rgba(37,99,235,0.5)" }}>Step {step} of {STEPS.length} · {currentStep.label}</p>
        </div>
      </div>

      <div style={{ height: 3, background: B6_10 }}>
        <div style={{ height: "100%", background: B6, transition: "width 0.5s ease", width: `${(step / STEPS.length) * 100}%` }}/>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ background: "white", borderRadius: 24, border: `1px solid ${B6_12}`, overflow: "hidden" }}>
          <div style={{ background: B6, padding: "16px 24px", display: "flex", gap: 12, color: "white", alignItems: "center" }}>
            {React.createElement(currentStep.icon, { size: 20 })}
            <h2 style={{ fontWeight: 900, fontSize: 18 }}>{currentStep.label}</h2>
          </div>

          <div ref={bodyRef} style={{ padding: "32px", minHeight: 400 }}>
            {step === 1 && <StepBatchInfo    form={form} setForm={setForm} errors={errors}/>}
            {step === 2 && <StepDepartment   form={form} setForm={setForm} errors={errors}/>}
            {step === 3 && <StepCourse       form={form} setForm={setForm} errors={errors}/>}
            {step === 4 && <StepSections     form={form} setForm={setForm} errors={errors}/>}
            {step === 5 && <StepAssignPerson form={form} setForm={setForm} field="proctor" title="Assign Proctor" subtitle="Monitors student attendance." icon={UserCheck}/>}
            {step === 6 && <StepAssignPerson form={form} setForm={setForm} field="hod"     title="Assign HOD"     subtitle="Overseas academic progress." icon={ShieldCheck}/>}
            {step === 7 && <StepStudents     form={form} setForm={setForm}/>}
          </div>

          <div style={{ borderTop: `1px solid ${B6_08}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", background: B6_05 }}>
            <button onClick={prev} disabled={step === 1} style={{ padding: "10px 20px", borderRadius: 12, border: `1px solid ${B6_20}`, background: "white", color: B6, fontWeight: 700, opacity: step === 1 ? 0.3 : 1 }}>Back</button>
            <button onClick={step < 7 ? next : handleSubmit} disabled={loading || done} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: B6, color: "white", fontWeight: 700, borderRadius: 12 }}>
              {loading ? "Processing..." : step === 7 ? "Finish" : "Continue"} <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchForm;