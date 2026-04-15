import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

const initialModule = () => ({ title: "", description: "" });

export const CreateCourse = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    courseTitle: "",
    subject: "",
    class: "",
    section: "",
    academicYear: "",
    description: "",
    status: "Draft",
  });

  const [modules, setModules] = useState([initialModule()]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleModuleChange = (index, field, value) => {
    setModules((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const addModule = () => setModules((prev) => [...prev, initialModule()]);

  const removeModule = (index) =>
    setModules((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const newErrors = {};
    if (!form.courseTitle.trim()) newErrors.courseTitle = "Course title is required.";
    if (!form.subject.trim())     newErrors.subject     = "Subject is required.";
    if (!form.class.trim())       newErrors.class       = "Class is required.";
    if (!form.academicYear.trim())newErrors.academicYear= "Academic year is required.";
    return newErrors;
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 🎯 FIXED: Removed localStorage token check and replaced headers with withCredentials: true
      const response = await axios.post(
        "http://localhost:5000/api/faculty/courses", 
        {
          courseTitle: form.courseTitle,
          className: form.class,        // Mapping 'class' to 'className' for backend
          academicYear: form.academicYear,
          status: form.status,
          description: form.description, 
          modules: modules              
        },
        { 
          withCredentials: true // 🎯 This forces the browser to send the HTTP-Only cookie!
        }
      );

      if (response.data.success) {
        console.log("Success:", response.data.message);
        navigate("/faculty/courses");
      }
    } catch (err) {
      console.error("Backend Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save course to database.");
    }
  };

  const handleCancel = () => navigate("/faculty/courses");

  return (
    <div className="p-6 space-y-6 max-w-8xl mx-auto text-left">

      {/* ── Back Button ───────────────────────────────────────────────────── */}
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold text-blue-600">Create Course</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new course</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Course Details ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Course Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                placeholder="e.g. Advanced Mathematics"
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition ${
                  errors.courseTitle ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.courseTitle && (
                <p className="text-sm text-red-500 mt-1">{errors.courseTitle}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition ${
                  errors.subject ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.subject && (
                <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="e.g. 2025-2026"
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition ${
                  errors.academicYear ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.academicYear && (
                <p className="text-sm text-red-500 mt-1">{errors.academicYear}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={form.class}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition bg-gray-50 ${
                  errors.class ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              >
                <option value="">Select Class</option>
                {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.class && (
                <p className="text-sm text-red-500 mt-1">{errors.class}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition bg-gray-50"
              >
                <option value="">Select Section</option>
                {["A", "B", "C", "D"].map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition bg-gray-50"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the course..."
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition resize-none"
              />
            </div>

          </div>
        </div>

        {/* ── Modules ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Course Modules</h2>
              <p className="text-sm text-gray-500 mt-0.5">Add modules for this course</p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          <div className="space-y-3">
            {modules.map((module, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Module {index + 1}
                  </span>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(index)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => handleModuleChange(index, "title", e.target.value)}
                  placeholder="Module title"
                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition"
                />
                <textarea
                  value={module.description}
                  onChange={(e) => handleModuleChange(index, "description", e.target.value)}
                  placeholder="Module description (optional)"
                  rows={2}
                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black transition resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Create Course
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="border border-gray-300 text-gray-700 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};