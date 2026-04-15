import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import axios from "axios";

export const CreateAssignment = () => {
  const navigate = useNavigate();

  // 🎯 State for Real Database Data
  const [courses, setCourses] = useState([]);
  const [dbModules, setDbModules] = useState([]);
  
  // 🎯 Form State
  const [form, setForm] = useState({
    course: "",     // Stores the numeric ID of the course
    module: "",     // Stores the numeric ID of the module
    title: "",
    instructions: "",
    dueDate: "",
    maxMarks: "",
    attachment: null,
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("No file chosen");
  const [loading, setLoading] = useState(false);

  // 🎯 1. Fetch Real Courses on Page Load
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 🎯 FIXED: Removed local storage token, added withCredentials
        const res = await axios.get("http://localhost:5000/api/faculty/courses", {
          withCredentials: true 
        });
        setCourses(res.data.data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // 🎯 2. Fetch Real Modules when a Course is selected
  useEffect(() => {
    if (!form.course) {
      setDbModules([]);
      return;
    }
    const fetchModules = async () => {
      try {
        // 🎯 FIXED: Removed local storage token, added withCredentials
        const res = await axios.get(`http://localhost:5000/api/faculty/courses/${form.course}/modules`, {
          withCredentials: true 
        });
        
        // Handle different backend response structures safely
        const modulesData = res.data.data || res.data || [];
        setDbModules(Array.isArray(modulesData) ? modulesData : []);
      } catch (err) {
        console.error("Error fetching modules:", err);
        setDbModules([]); // Fallback to empty array on error so UI doesn't crash
      }
    };
    fetchModules();
  }, [form.course]);

  // 🎯 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "course") {
      // If course changes, immediately clear the module selection
      setForm((prev) => ({ ...prev, course: value, module: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    // Clear the error for this specific field as the user types
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // 🎯 4. Handle File Selection
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 10MB size limit validation
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, attachment: "File size must be under 10MB." }));
        return;
      }
      setForm((prev) => ({ ...prev, attachment: file }));
      setFileName(file.name);
      setErrors((prev) => ({ ...prev, attachment: "" }));
    }
  };

  // 🎯 5. Validate Form Before Submit
  const validate = () => {
    const newErrors = {};
    if (!form.course) newErrors.course = "Course is required.";
    if (!form.module) newErrors.module = "Module is required.";
    if (!form.title.trim()) newErrors.title = "Assignment title is required.";
    if (!form.instructions.trim()) newErrors.instructions = "Instructions are required.";
    if (!form.dueDate) newErrors.dueDate = "Due date is required.";
    if (!form.maxMarks) newErrors.maxMarks = "Maximum marks is required.";
    return newErrors;
  };

  // 🎯 6. Submit Data to Backend
  const handleSubmit = async (status) => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // We MUST use FormData to send the file along with the text data
      const formData = new FormData();
      formData.append("courseId", form.course); 
      formData.append("moduleId", form.module); 
      formData.append("title", form.title);
      formData.append("description", form.instructions); // Map to DB column name
      formData.append("dueDate", form.dueDate);
      formData.append("maxPoints", form.maxMarks);       // Map to DB column name
      formData.append("status", status);                 // 'Published' or 'Draft'
      
      if (form.attachment) {
        formData.append("file", form.attachment);
      }

      // 🎯 FIXED: Removed Authorization header, kept multipart/form-data, added withCredentials
      const response = await axios.post("http://localhost:5000/api/faculty/assignments", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true // 🎯 The magic secure cookie sender!
      });

      if (response.data.success) {
        alert("Assignment saved successfully!");
        navigate("/faculty/assignments");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert(error.response?.data?.message || "Failed to save assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-8xl mx-auto text-left">
      
      {/* ── Back Button ───────────────────────────────────────────────────── */}
      <button 
        onClick={() => navigate("/faculty/assignments")} 
        className="flex items-center gap-2 text-md text-gray-600 hover:text-black transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Assignments
      </button>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-left text-blue-600">Create Assignment</h1>
        <p className="text-md text-left text-gray-500 mt-1">Create a new assignment for your students</p>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <h2 className="text-base font-semibold text-gray-800 border-b border-gray-100 pb-2">Assignment Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Course Dropdown */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <select 
              name="course" 
              value={form.course} 
              onChange={handleChange} 
              className={`w-full appearance-none border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${errors.course ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.courseTitle || c.course_name}</option>
              ))}
            </select>
            {errors.course && <p className="text-sm text-red-500 mt-1">{errors.course}</p>}
          </div>

          {/* 🎯 Smart Module Dropdown */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-md font-medium text-gray-700">
                Module <span className="text-red-500">*</span>
              </label>
              
              {/* Dynamic Action: Show an "Add" link if the DB is empty for this course */}
              {form.course && dbModules.length === 0 && (
                <button 
                  type="button"
                  onClick={() => navigate(`/faculty/courses`)} 
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  + Add Module First
                </button>
              )}
            </div>
            
            <select 
              name="module" 
              value={form.module} 
              onChange={handleChange} 
              disabled={!form.course || dbModules.length === 0} 
              className={`w-full appearance-none border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${errors.module ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            >
              {/* Dynamic Placeholder */}
              <option value="">
                {!form.course 
                  ? "First select a course..." 
                  : dbModules.length === 0 
                    ? "⚠️ No modules found for this course" 
                    : "Select module"}
              </option>
              
              {dbModules.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            {errors.module && <p className="text-sm text-red-500 mt-1">{errors.module}</p>}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-md font-medium text-gray-700 mb-1">
            Assignment Title <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            placeholder="e.g., Quadratic Equations Problem Set" 
            className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${errors.title ? "border-red-400 bg-red-50" : "border-gray-200"}`} 
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-md font-medium text-gray-700 mb-1">
            Instructions <span className="text-red-500">*</span>
          </label>
          <textarea 
            name="instructions" 
            value={form.instructions} 
            onChange={handleChange} 
            rows={4} 
            placeholder="Provide detailed instructions..."
            className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 resize-none ${errors.instructions ? "border-red-400 bg-red-50" : "border-gray-200"}`} 
          />
          {errors.instructions && <p className="text-sm text-red-500 mt-1">{errors.instructions}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Due Date */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="dueDate" 
              value={form.dueDate} 
              onChange={handleChange} 
              className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${errors.dueDate ? "border-red-400 bg-red-50" : "border-gray-200"}`} 
            />
            {errors.dueDate && <p className="text-sm text-red-500 mt-1">{errors.dueDate}</p>}
          </div>

          {/* Max Marks */}
          <div>
            <label className="block text-md font-medium text-gray-700 mb-1">
              Maximum Marks <span className="text-red-500">*</span>
            </label>
            <input 
              type="number" 
              name="maxMarks" 
              value={form.maxMarks} 
              onChange={handleChange} 
              min="1"
              placeholder="e.g. 100"
              className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-500 transition bg-gray-50 ${errors.maxMarks ? "border-red-400 bg-red-50" : "border-gray-200"}`} 
            />
            {errors.maxMarks && <p className="text-sm text-red-500 mt-1">{errors.maxMarks}</p>}
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-md font-medium text-gray-700 mb-1">
            Attachment (Optional)
          </label>
          <label className={`flex items-center justify-between border rounded-lg bg-gray-50 px-3 py-2 cursor-pointer hover:bg-gray-100 transition ${errors.attachment ? "border-red-400" : "border-gray-200"}`}>
            <span className="text-gray-500 truncate max-w-[80%]">{fileName}</span>
            <Upload className="w-4 h-4 text-gray-400 shrink-0" />
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFile} 
              accept=".pdf,.doc,.docx,.jpg,.png,.zip"
            />
          </label>
          {errors.attachment && <p className="text-sm text-red-500 mt-1">{errors.attachment}</p>}
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <button 
          disabled={loading} 
          onClick={() => handleSubmit("Draft")} 
          className="flex items-center gap-2 border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          Save Draft
        </button>
        <button 
          disabled={loading} 
          onClick={() => handleSubmit("Published")} 
          className="flex items-center gap-2 bg-blue-600 font-semibold text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-70"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Publish Assignment
        </button>
      </div>
    </div>
  );
};