import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, ChevronDown } from "lucide-react";
import apiBaseUrl from "../../../config/baseurl";

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
        `${apiBaseUrl}/faculty/courses`, 
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
    <div className="p-6 space-y-6 max-w-6xl mx-auto text-left">

      {/* ── Back Button ───────────────────────────────────────────────────── */}
      <button
        onClick={handleCancel}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create Course</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Fill in the details to create a new course</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Course Details ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Course Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">

            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                placeholder="e.g. Advanced Mathematics"
                className={`w-full h-[42px] border rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.courseTitle ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500"
                }`}
              />
              {errors.courseTitle && (
                <p className="text-xs font-bold text-red-500 mt-1.5">{errors.courseTitle}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className={`w-full h-[42px] border rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.subject ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500"
                }`}
              />
              {errors.subject && (
                <p className="text-xs font-bold text-red-500 mt-1.5">{errors.subject}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="e.g. 2025-2026"
                className={`w-full h-[42px] border rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all ${
                  errors.academicYear ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500"
                }`}
              />
              {errors.academicYear && (
                <p className="text-xs font-bold text-red-500 mt-1.5">{errors.academicYear}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Class <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="class"
                  value={form.class}
                  onChange={handleChange}
                  className={`w-full h-[42px] appearance-none border rounded-xl pl-4 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all ${
                    errors.class ? "border-red-400 bg-red-50 focus:border-red-500" : "border-gray-200 bg-gray-50 hover:bg-white focus:bg-white focus:border-blue-500"
                  }`}
                >
                  <option value="" disabled hidden>Select Class</option>
                  {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {errors.class && (
                <p className="text-xs font-bold text-red-500 mt-1.5">{errors.class}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Section</label>
              <div className="relative">
                <select
                  name="section"
                  value={form.section}
                  onChange={handleChange}
                  className="w-full h-[42px] appearance-none border border-gray-200 bg-gray-50 hover:bg-white focus:bg-white rounded-xl pl-4 pr-10 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
                >
                  <option value="" disabled hidden>Select Section</option>
                  {["A", "B", "C", "D"].map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Status</label>
              <div className="relative">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full h-[42px] appearance-none border border-gray-200 bg-gray-50 hover:bg-white focus:bg-white rounded-xl pl-4 pr-10 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                Course Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the course..."
                className="w-full border border-gray-200 bg-gray-50 hover:bg-white focus:bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>

          </div>
        </div>

        {/* ── Modules ───────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Course Modules</h2>
              <p className="text-xs font-medium text-gray-500 mt-1">Organize the curriculum into distinct sections</p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Add Module
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-2xl p-5 space-y-4 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Module {index + 1}
                  </span>
                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(index)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Module"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => handleModuleChange(index, "title", e.target.value)}
                  placeholder="Module Title (e.g. Introduction to Algebra)"
                  className="w-full h-[42px] border border-gray-200 bg-white rounded-xl px-4 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
                <textarea
                  value={module.description}
                  onChange={(e) => handleModuleChange(index, "description", e.target.value)}
                  placeholder="What will students learn in this module?"
                  rows={2}
                  className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-4 pt-2 pb-8">
          <button
            type="button"
            onClick={handleCancel}
            className="border border-gray-300 bg-white text-gray-700 text-sm font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-[0.98]"
          >
            Create Course
          </button>
        </div>

      </form>
    </div>
  );
};