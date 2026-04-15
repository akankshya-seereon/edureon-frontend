import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Plus, Trash2, BookOpen, Building2, FileText,
  CheckCircle, Save, Upload, X, ChevronDown, ChevronUp,
  GripVertical, BookMarked, Hash, Clock, Paperclip, Loader,
  Download, UploadCloud, FileOutput
} from "lucide-react";

export default function AcademicSetup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupData, setSetupData] = useState({
    course: null,
    department: null,
    syllabus: null
  });

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [syllabi, setSyllabi] = useState([]);

  // 🚀 DYNAMIC FETCH ALL ACADEMIC DATA
  const fetchData = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem('token'); 
      if (!token) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        token = storedUser?.token || storedUser?.data?.token; 
      }
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      const [deptRes, courseRes, sylRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/departments", { headers }).catch(() => ({ data: { departments: [] } })),
        axios.get("http://localhost:5000/api/admin/courses", { headers }).catch(() => ({ data: { courses: [] } })),
        axios.get("http://localhost:5000/api/admin/syllabi", { headers }).catch(() => ({ data: { syllabi: [] } }))
      ]);

      setDepartments(deptRes.data.departments || []);
      setCourses(courseRes.data.courses || []);
      setSyllabi(sylRes.data.syllabi || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStepSubmit = (data) => {
    setSetupData(prev => ({ ...prev, ...data }));
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  // 🚀 DYNAMIC SUBMIT ALL 
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      let token = localStorage.getItem('token'); 
      if (!token) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        token = storedUser?.token || storedUser?.data?.token; 
      }
      const headers = { Authorization: `Bearer ${token}` };

      let finalCourseId = null;

      // 1. Save Course (Step 1)
      if (setupData.course && setupData.course.name) {
        const res = await axios.post("http://localhost:5000/api/admin/courses", setupData.course, { headers });
        finalCourseId = res.data.courseId || res.data.id;
      }

      // 2. Save Department (Step 2)
      if (setupData.department && setupData.department.name) {
        await axios.post("http://localhost:5000/api/admin/departments", setupData.department, { headers });
      }

      // 3. Save Syllabus (Step 3)
      if (setupData.syllabus && setupData.syllabus.name) {
        const syllabusPayload = {
          ...setupData.syllabus,
          courseId: setupData.syllabus.courseId === "pending-new" ? finalCourseId : setupData.syllabus.courseId,
          attachedFile: setupData.syllabus.attachedFileName || null
        };
        await axios.post("http://localhost:5000/api/admin/syllabi", syllabusPayload, { headers });
      }

      alert("✅ Academic Structure Added Successfully!");
      setCurrentStep(1);
      setSetupData({ course: null, department: null, syllabus: null });
      fetchData(); 

    } catch (err) {
      console.error("Submit Error:", err);
      alert("Failed to save Academic Setup. Check backend routes.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 DYNAMIC DELETE
  const handleDelete = async (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        let token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user') || '{}')?.token;
        const headers = { Authorization: `Bearer ${token}` };

        let endpoint = "";
        if (type === 'course') endpoint = `/courses/${id}`;
        if (type === 'dept') endpoint = `/departments/${id}`;
        if (type === 'syllabus') endpoint = `/syllabi/${id}`;

        await axios.delete(`http://localhost:5000/api/admin${endpoint}`, { headers });
        fetchData(); 
      } catch (err) {
        console.error("Delete Error:", err);
        alert(`Failed to delete ${type}.`);
      }
    }
  };

  const pendingCourseId = "pending-new";
  const allCoursesForSyllabus = [
    ...courses,
    ...(setupData.course?.name ? [{ id: pendingCourseId, name: setupData.course.name, code: setupData.course.code }] : [])
  ];

  return (
    <div className="w-full font-sans text-left relative pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Academic Configuration</h1>
        <p className="text-md font-bold text-slate-400 uppercase tracking-widest mt-1">
          Add Course → Department → Syllabus → Submit
        </p>
      </div>

      <StepIndicator currentStep={currentStep} />

      <div className="mb-12">
        {currentStep === 1 && (
          <StepCourse onSubmit={handleStepSubmit} />
        )}
        {currentStep === 2 && (
          <StepDepartment 
            onSubmit={handleStepSubmit} 
            onBack={() => setCurrentStep(1)} 
          />
        )}
        {currentStep === 3 && (
          <StepSyllabus
            onSubmit={handleStepSubmit}
            onBack={() => setCurrentStep(2)}
            courses={allCoursesForSyllabus}
            defaultCourseId={setupData.course?.name ? pendingCourseId : ""}
            pendingCourseId={pendingCourseId}
            newCourseName={setupData.course?.name}
          />
        )}
        {currentStep === 4 && (
          <ReviewAndSubmit
            setupData={setupData}
            onSubmit={handleFinalSubmit}
            onBack={() => setCurrentStep(3)}
            departments={departments}
            courses={allCoursesForSyllabus}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 text-slate-400 font-bold gap-2">
           <Loader className="animate-spin" size={20} /> Loading Academic Data...
        </div>
      ) : (
        <div className="space-y-8">
          <SummaryTable title="Courses" icon={BookOpen} data={courses} onDelete={(id) => handleDelete('course', id)} type="course" departments={departments} />
          <SummaryTable title="Departments" icon={Building2} data={departments} onDelete={(id) => handleDelete('dept', id)} type="dept" />
          <SummaryTable title="Syllabi" icon={FileText} data={syllabi} onDelete={(id) => handleDelete('syllabus', id)} type="syllabus" courses={courses} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STEP INDICATOR
// ============================================================================
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, title: "Course", icon: "📚" },
    { number: 2, title: "Department", icon: "🏢" },
    { number: 3, title: "Syllabus", icon: "📄" },
    { number: 4, title: "Review", icon: "✓" }
  ];

  return (
    <div className="mb-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all ${
              currentStep >= step.number
                ? "bg-[#0F53D5] text-white shadow-lg shadow-blue-200"
                : "bg-slate-100 text-slate-400"
            }`}>
              {step.icon}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-[10px] font-black uppercase tracking-wider ${currentStep >= step.number ? "text-[#0F53D5]" : "text-slate-400"}`}>
                Step {step.number}
              </p>
              <p className={`text-md font-bold ${currentStep >= step.number ? "text-slate-900" : "text-slate-500"}`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-4 rounded-full ${currentStep > step.number ? "bg-[#0F53D5]" : "bg-slate-200"}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// STEP 1: COURSE
// ============================================================================
const StepCourse = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "", code: "", type: "UG", duration: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Course name is required to add";
    if (!formData.code.trim()) newErrors.code = "Course code is required to add";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    
    onSubmit({ course: formData });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><BookOpen size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Step 1: Add Course</h2>
          <p className="text-md text-slate-500 font-bold">Create a new academic course</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Course Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g. B.Tech Computer Science"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all ${errors.name ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.name && <p className="text-md text-red-600 font-bold">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Course Code *</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange}
              placeholder="e.g. BT-CSE"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all ${errors.code ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.code && <p className="text-md text-red-600 font-bold">{errors.code}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Type</label>
            <select name="type" value={formData.type} onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all">
              <option value="UG">Undergraduate (UG)</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="Diploma">Diploma</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Duration</label>
            <input type="text" name="duration" value={formData.duration} onChange={handleChange}
              placeholder="e.g. 4 Years"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={() => onSubmit({ course: null })}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-md uppercase tracking-widest hover:bg-slate-50 transition-colors">
            Skip Step
          </button>
          <button type="submit"
            className="flex-1 py-3 bg-[#0F53D5] text-white rounded-xl font-bold text-md uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Course & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// STEP 2: DEPARTMENT
// ============================================================================
const StepDepartment = ({ onSubmit, onBack }) => {
  const [formData, setFormData] = useState({ name: "", code: "", head: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Department Name is required to add";
    if (!formData.code.trim()) newErrors.code = "Department Code is required to add";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    
    onSubmit({ department: formData });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 text-[#0F53D5] rounded-lg"><Building2 size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Step 2: Add Department</h2>
          <p className="text-md text-slate-500 font-bold">Create a standalone academic department</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Department Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange}
              placeholder="e.g. Computer Science"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] focus:ring-2 focus:ring-blue-200 transition-all ${errors.name ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.name && <p className="text-md text-red-600 font-bold">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Department Code *</label>
            <input type="text" name="code" value={formData.code} onChange={handleChange}
              placeholder="e.g. CSE"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] focus:ring-2 focus:ring-blue-200 transition-all ${errors.code ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.code && <p className="text-md text-red-600 font-bold">{errors.code}</p>}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Head of Department</label>
          <input type="text" name="head" value={formData.head} onChange={handleChange}
            placeholder="e.g. Dr. Sarah John"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-md uppercase tracking-widest hover:bg-slate-50 transition-colors">
            ← Back
          </button>
          <button type="button" onClick={() => onSubmit({ department: null })}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-md uppercase tracking-widest hover:bg-slate-50 transition-colors">
            Skip Step
          </button>
          <button type="submit"
            className="flex-1 py-3 bg-[#0F53D5] text-white rounded-xl font-bold text-md uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Department & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// STEP 3: SYLLABUS (Excel + PDF Export)
// ============================================================================
const EMPTY_SUBJECT = () => ({
  id: Date.now() + Math.random(), name: "", code: "", credits: "", topics: [""], files: [], expanded: true,
});

const StepSyllabus = ({ onSubmit, onBack, courses, defaultCourseId, pendingCourseId, newCourseName }) => {
  const [meta, setMeta] = useState({ name: "", semester: "1", courseId: defaultCourseId || "", attachedFileName: "" });
  const [subjects, setSubjects] = useState([EMPTY_SUBJECT()]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (defaultCourseId) {
      setMeta(prev => ({ ...prev, courseId: defaultCourseId }));
    }
  }, [defaultCourseId]);

  const handleMetaChange = (e) => {
    setMeta({ ...meta, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMeta({ ...meta, attachedFileName: file.name });
    }
  };

  // 🚀 Export to Excel
  const exportToExcel = () => {
    if (subjects.length === 0 || (subjects.length === 1 && !subjects[0].name)) {
      alert("Please add at least one subject before exporting.");
      return;
    }
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Subject Name,Subject Code,Credits,Topics\n";
    subjects.forEach(subj => {
      const topicsList = subj.topics.filter(t => t.trim()).join(" | "); 
      const row = `"${subj.name || ''}","${subj.code || ''}","${subj.credits || ''}","${topicsList}"`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${meta.name || 'Syllabus'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🚀 Export to PDF (Native Window Print Method)
  const exportToPDF = () => {
    if (subjects.length === 0 || (subjects.length === 1 && !subjects[0].name)) {
      alert("Please add at least one subject before exporting to PDF.");
      return;
    }

    const printWindow = window.open('', '_blank');
    let html = `
      <html>
        <head>
          <title>${meta.name || 'Syllabus Document'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
            h1 { color: #0F53D5; text-align: center; margin-bottom: 5px; }
            h3 { color: #64748b; text-align: center; margin-top: 0; margin-bottom: 40px; font-weight: normal; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
            th, td { border: 1px solid #cbd5e1; padding: 12px 16px; text-align: left; }
            th { background-color: #f8fafc; color: #0f172a; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            td { vertical-align: top; }
            .topics-list { margin: 0; padding-left: 16px; }
            .topics-list li { margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <h1>${meta.name || 'Official Syllabus Document'}</h1>
          <h3>Semester ${meta.semester || 'N/A'}</h3>
          <table>
            <thead>
              <tr>
                <th width="25%">Subject Name</th>
                <th width="15%">Code</th>
                <th width="10%">Credits</th>
                <th width="50%">Topics / Chapters</th>
              </tr>
            </thead>
            <tbody>
    `;

    subjects.forEach(subj => {
      const validTopics = subj.topics.filter(t => t.trim());
      const topicsHtml = validTopics.length > 0 
        ? `<ul class="topics-list">${validTopics.map(t => `<li>${t}</li>`).join('')}</ul>` 
        : '<em>No topics listed</em>';

      html += `
        <tr>
          <td><strong>${subj.name || '—'}</strong></td>
          <td>${subj.code || '—'}</td>
          <td>${subj.credits || '—'}</td>
          <td>${topicsHtml}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Slight delay to ensure CSS renders before triggering print dialog
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const updateSubject = (id, field, value) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const addSubject = () => setSubjects(prev => [...prev, EMPTY_SUBJECT()]);
  const removeSubject = (id) => setSubjects(prev => prev.filter(s => s.id !== id));
  const toggleExpand = (id) => setSubjects(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));

  const addTopic = (subjId) => setSubjects(prev => prev.map(s => s.id === subjId ? { ...s, topics: [...s.topics, ""] } : s));
  const updateTopic = (subjId, idx, val) => setSubjects(prev => prev.map(s => {
    if (s.id !== subjId) return s;
    const t = [...s.topics]; t[idx] = val; return { ...s, topics: t };
  }));
  const removeTopic = (subjId, idx) => setSubjects(prev => prev.map(s => {
    if (s.id !== subjId) return s;
    const t = s.topics.filter((_, i) => i !== idx); return { ...s, topics: t.length ? t : [""] };
  }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!meta.name.trim()) newErrors.name = "Syllabus name is required to add";
    if (!meta.courseId) newErrors.courseId = "Course selection is required";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const cleanSubjects = subjects.map(s => ({
      name: s.name, code: s.code, credits: s.credits, topics: s.topics.filter(t => t.trim()), files: s.files,
    }));
    onSubmit({ syllabus: { ...meta, subjects: cleanSubjects } });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 text-blue-600 rounded-lg"><FileText size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Step 3: Add Syllabus</h2>
          <p className="text-md text-slate-500 font-bold">Upload document or build subjects manually</p>
        </div>
      </div>

      {newCourseName && meta.courseId === pendingCourseId && (
        <div className="mb-5 flex items-center gap-2 bg-purple-50 border border-purple-200 text-blue-600 rounded-xl px-4 py-3">
          <span className="text-lg">🔗</span>
          <p className="text-md font-bold">
            Auto-linked to <span className="text-blue-600">"{newCourseName}"</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Syllabus Name *</label>
            <input type="text" name="name" value={meta.name} onChange={handleMetaChange}
              placeholder="e.g. Syllabus 2024-25"
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all ${errors.name ? "border-red-500" : "border-slate-200"}`}
            />
            {errors.name && <p className="text-md text-red-600 font-bold">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Semester</label>
            <input type="number" name="semester" value={meta.semester} onChange={handleMetaChange} min="1" max="8"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Course *</label>
            <select name="courseId" value={meta.courseId} onChange={handleMetaChange}
              className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-md font-bold text-slate-700 outline-none focus:border-[#0F53D5] transition-all ${errors.courseId ? "border-red-500" : "border-slate-200"}`}>
              <option value="">-- Select Course --</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.code}){course.id === pendingCourseId ? " — just added ✨" : ""}
                </option>
              ))}
            </select>
            {errors.courseId && <p className="text-md text-red-600 font-bold">{errors.courseId}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Attach Official Syllabus (Excel/PDF)</label>
            <div className="relative">
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                accept=".pdf,.xls,.xlsx,.csv,.doc,.docx" 
              />
              <div className="w-full bg-purple-50 border border-purple-200 text-purple-700 rounded-xl px-4 py-3 text-md font-bold flex items-center justify-between hover:bg-purple-100 transition-colors">
                <span className="truncate">{meta.attachedFileName || "Choose Document to Upload..."}</span>
                <UploadCloud size={18} />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold">This document will be directly available for Students & Faculty to download.</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider">
              Subjects ({subjects.length})
            </label>
            
            <div className="flex gap-2">
              <button type="button" onClick={exportToPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-red-200 transition-colors">
                <FileOutput size={14} /> PDF
              </button>
              <button type="button" onClick={exportToExcel}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-100 text-emerald-700 text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-200 transition-colors">
                <Download size={14} /> Excel
              </button>
              <button type="button" onClick={addSubject}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-colors">
                <Plus size={14} /> Subject
              </button>
            </div>
          </div>

          <div className="space-y-4 mt-3">
            {subjects.map((subj, idx) => (
              <div key={subj.id} className="border-2 rounded-2xl overflow-hidden transition-all border-slate-200 hover:border-purple-300">
                <div className={`flex items-center gap-3 px-5 py-4 cursor-pointer select-none ${subj.expanded ? "bg-purple-50" : "bg-slate-50"}`}
                  onClick={() => toggleExpand(subj.id)}>
                  <div className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-lg text-[11px] font-black flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-800 truncate">{subj.name || <span className="text-slate-400 font-bold italic">Untitled Subject</span>}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {subjects.length > 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeSubject(subj.id); }}
                        className="p-1.5 hover:bg-red-100 text-red-500 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                    {subj.expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>

                {subj.expanded && (
                  <div className="px-5 py-5 space-y-5 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1 md:col-span-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <BookMarked size={10} /> Subject Name
                        </label>
                        <input type="text" value={subj.name} onChange={(e) => updateSubject(subj.id, "name", e.target.value)}
                          placeholder="e.g. Data Structures"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-md font-bold text-slate-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Hash size={10} /> Subject Code
                        </label>
                        <input type="text" value={subj.code} onChange={(e) => updateSubject(subj.id, "code", e.target.value)}
                          placeholder="e.g. CS301"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-md font-bold text-slate-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Clock size={10} /> Credit Hours
                        </label>
                        <input type="number" value={subj.credits} onChange={(e) => updateSubject(subj.id, "credits", e.target.value)}
                          placeholder="e.g. 4" min="1" max="10"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-md font-bold text-slate-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Topics / Chapters</label>
                        <button type="button" onClick={() => addTopic(subj.id)}
                          className="text-[10px] font-black text-purple-600 hover:text-purple-800 flex items-center gap-1 uppercase tracking-wider">
                          <Plus size={11} /> Add Topic
                        </button>
                      </div>
                      <div className="space-y-2">
                        {subj.topics.map((topic, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-400 w-5 text-right flex-shrink-0">{tIdx + 1}.</span>
                            <input type="text" value={topic} onChange={(e) => updateTopic(subj.id, tIdx, e.target.value)}
                              placeholder={`Topic ${tIdx + 1}...`}
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-md font-bold text-slate-700 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                            />
                            {subj.topics.length > 1 && (
                              <button type="button" onClick={() => removeTopic(subj.id, tIdx)}
                                className="p-1.5 hover:bg-red-50 text-red-400 rounded-lg transition-colors flex-shrink-0">
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onBack}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-md uppercase tracking-widest hover:bg-slate-50 transition-colors">
            ← Back
          </button>
          <button type="button" onClick={() => onSubmit({ syllabus: null })}
            className="px-6 py-3 border-2 border-slate-200 text-slate-500 rounded-xl font-bold text-md uppercase tracking-widest hover:bg-slate-50 transition-colors">
            Skip Step
          </button>
          <button type="submit"
            className="flex-1 py-3 bg-[#0F53D5] text-white rounded-xl font-bold text-md uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Syllabus & Continue
          </button>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// STEP 4: REVIEW & SUBMIT
// ============================================================================
const ReviewAndSubmit = ({ setupData, onSubmit, onBack, departments, courses, isSubmitting }) => {
  const getDepartmentName = (deptId) => departments.find(d => String(d.id) === String(deptId))?.name || "Unknown";
  const getCourseName = (courseId) => courses.find(c => String(c.id) === String(courseId))?.name || "Unknown";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><CheckCircle size={24} /></div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Step 4: Review & Submit</h2>
          <p className="text-md text-slate-500 font-bold">Verify your academic setup before saving to database</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Course */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
          <h3 className="text-lg font-black text-emerald-900 mb-3">📚 Course Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase">Department</p>
              <p className="text-md font-bold text-emerald-900">{setupData.course ? getDepartmentName(setupData.course.deptId) : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase">Name</p>
              <p className="text-md font-bold text-emerald-900">{setupData.course?.name || "Not Added"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase">Code</p>
              <p className="text-md font-bold text-emerald-900">{setupData.course?.code || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase">Type</p>
              <p className="text-md font-bold text-emerald-900">{setupData.course?.type || "—"}</p>
            </div>
          </div>
        </div>

        {/* Department */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <h3 className="text-lg font-black text-blue-900 mb-3">🏢 Department Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase">Name</p>
              <p className="text-md font-bold text-blue-900">{setupData.department?.name || "Not Added"}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase">Code</p>
              <p className="text-md font-bold text-blue-900">{setupData.department?.code || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-black text-blue-600 uppercase">Head</p>
              <p className="text-md font-bold text-blue-900">{setupData.department?.head || "—"}</p>
            </div>
          </div>
        </div>

        {/* Syllabus */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <h3 className="text-lg font-black text-purple-900 mb-4">📄 Syllabus Details</h3>
          <div className="space-y-3 mb-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase">Course</p>
                <p className="text-md font-bold text-purple-900">{setupData.syllabus ? getCourseName(setupData.syllabus.courseId) : "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-600 uppercase">Syllabus Name</p>
                <p className="text-md font-bold text-purple-900">{setupData.syllabus?.name || "Not Added"}</p>
              </div>
              
              {setupData.syllabus?.attachedFileName && (
                <div className="col-span-2 mt-2 bg-white rounded-lg p-3 border border-purple-200 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-md">
                    <Paperclip size={16} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-purple-500 uppercase">Attached Official Document</p>
                    <p className="text-sm font-bold text-slate-700">{setupData.syllabus.attachedFileName}</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {setupData.syllabus?.subjects?.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-purple-700 uppercase tracking-wider">Subject Breakdown</p>
              {setupData.syllabus.subjects.map((subj, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-purple-200 p-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-purple-600 text-white rounded-md text-[10px] font-black flex-shrink-0">{idx+1}</span>
                    <div>
                      <p className="font-black text-slate-800">{subj.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">
                        {[subj.code, subj.credits && `${subj.credits} credits`].filter(Boolean).join(" · ") || "No code/credits set"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-8 mt-8 border-t border-slate-200">
        <button onClick={onBack} disabled={isSubmitting}
          className="flex-1 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-md uppercase tracking-widest hover:bg-slate-50 transition-colors disabled:opacity-50">
          ← Back
        </button>
        <button onClick={onSubmit} disabled={isSubmitting}
          className="flex-1 py-3 bg-[#0F53D5] text-white rounded-xl font-bold text-md uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50">
          {isSubmitting ? <Loader className="animate-spin" size={18} /> : <Save size={18} />} 
          {isSubmitting ? "Saving..." : "Submit All to Database"}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// SUMMARY TABLES
// ============================================================================
const SummaryTable = ({ title, icon: Icon, data, onDelete, type, departments, courses }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <Icon className="text-slate-600" size={20} />
        <h3 className="text-lg font-black text-slate-900">{title}</h3>
        <span className="ml-2 bg-blue-100 text-[#0F53D5] px-3 py-1 rounded-full text-md font-bold">{data.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-slate-500 text-md font-bold">
                  No {title.toLowerCase()} added yet
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  {type === 'course' && (
                    <>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-700">{item.name || item.course_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.code || item.course_code || "—"}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{departments?.find(d => String(d.id) === String(item.deptId || item.department_id))?.name || item.department_name || "—"}</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 text-[#0F53D5] px-2 py-1 rounded text-[11px] font-bold">{item.type || "—"}</span></td>
                      <td className="px-6 py-4 text-slate-600 text-md font-bold">{item.duration || "—"}</td>
                    </>
                  )}
                  {type === 'dept' && (
                    <>
                      <td className="px-6 py-4 font-bold text-slate-700">{item.name || item.department_name}</td>
                      <td className="px-6 py-4"><span className="bg-slate-100 px-3 py-1 rounded text-[11px] font-black text-slate-700">{item.code || item.department_code || "—"}</span></td>
                      <td className="px-6 py-4 text-slate-600 text-md">{item.head || "—"}</td>
                    </>
                  )}
                  {type === 'syllabus' && (
                    <>
                      <td className="px-6 py-4 font-bold text-slate-700">{item.name || item.syllabus_name}</td>
                      <td className="px-6 py-4 text-slate-600">{courses?.find(c => String(c.id) === String(item.courseId || item.course_id))?.name || item.course_name || "—"}</td>
                      <td className="px-6 py-4 text-slate-600">Sem {item.semester || "—"}</td>
                      <td className="px-6 py-4">
                        {item.attached_file ? (
                          <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold">
                            <Paperclip size={12} /> Document Attached
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold">Data Present</span>
                        )}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => onDelete(item.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};