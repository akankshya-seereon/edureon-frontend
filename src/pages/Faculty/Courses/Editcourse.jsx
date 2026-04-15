import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GraduationCap,
  Check,
  Save,
  FileText,
  Video,
  UploadCloud,
  Link2,
  ChevronDown,
  ChevronUp,
  Edit2,
  X,
} from "lucide-react";

// ── Content Types ──────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { type: "document", label: "Document", Icon: FileText    },
  { type: "video",    label: "Video",    Icon: Video       },
  { type: "link",     label: "Link",     Icon: Link2       },
  { type: "upload",   label: "Upload",   Icon: UploadCloud },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const ContentIcon = ({ type }) => {
  const found = CONTENT_TYPES.find((c) => c.type === type);
  const Icon = found?.Icon ?? FileText;
  const colors = {
    document: "bg-blue-50 text-blue-600",
    video:    "bg-purple-50 text-purple-600",
    link:     "bg-yellow-50 text-yellow-600",
    upload:   "bg-green-50 text-green-600",
  };
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[type] ?? "bg-gray-50 text-gray-500"}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

const InlineEdit = ({ value, placeholder, onChange, multiline = false, className = "" }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onChange(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <div
        className={`group flex items-start gap-2 cursor-pointer ${className}`}
        onClick={() => { setDraft(value); setEditing(true); }}
      >
        <span className={value ? "text-gray-900" : "text-gray-400 italic"}>
          {value || placeholder}
        </span>
        <Edit2 className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition mt-0.5 flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {multiline ? (
        <textarea
          autoFocus
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 border border-blue-400 rounded-lg px-2 py-1.5 text-md outline-none resize-none bg-white focus:ring-2 focus:ring-blue-100 ${className}`}
        />
      ) : (
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 border border-blue-400 rounded-lg px-2 py-1.5 text-md outline-none bg-white focus:ring-2 focus:ring-blue-100 ${className}`}
        />
      )}
      <button onClick={commit} className="text-green-600 hover:text-green-700 mt-1">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={cancel} className="text-gray-400 hover:text-gray-600 mt-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Module Card (edit mode) ────────────────────────────────────────────────────

const ModuleCard = ({ module, index, onUpdate, onRemove, canRemove }) => {
  const toggle = () => onUpdate({ ...module, expanded: !module.expanded });
  const updateField = (field, value) => onUpdate({ ...module, [field]: value });

  const addContent = (type) => {
    const label = CONTENT_TYPES.find((c) => c.type === type)?.label ?? "Content";
    onUpdate({
      ...module,
      contents: [...(module.contents || []), { id: Date.now(), type, label }],
    });
  };

  const removeContent = (cid) =>
    onUpdate({ ...module, contents: module.contents.filter((c) => c.id !== cid) });

  const updateContentLabel = (cid, label) =>
    onUpdate({
      ...module,
      contents: module.contents.map((c) => (c.id === cid ? { ...c, label } : c)),
    });

  const contents = module.contents || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition select-none"
        onClick={toggle}
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {module.expanded ? (
            <InlineEdit
              value={module.title}
              placeholder="Module title..."
              onChange={(v) => updateField("title", v)}
              className="text-md font-semibold"
            />
          ) : (
            <p className={`text-md font-semibold truncate ${module.title ? "text-gray-900" : "text-gray-400 italic"}`}>
              {module.title || "Untitled Module"}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-0.5">
            {contents.length} {contents.length === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="text-red-400 hover:text-red-600 transition p-1 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {module.expanded
            ? <ChevronUp   className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </div>

      {/* Body */}
      {module.expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100">
          {/* Description */}
          <div className="pt-4">
            <p className="text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Description</p>
            <InlineEdit
              value={module.description}
              placeholder="Add a module description (optional)..."
              onChange={(v) => updateField("description", v)}
              multiline
              className="text-md text-gray-600"
            />
          </div>

          {/* Contents */}
          {contents.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Content Items</p>
              <div className="space-y-2">
                {contents.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 group"
                  >
                    <ContentIcon type={c.type} />
                    <div className="flex-1 min-w-0">
                      <InlineEdit
                        value={c.label}
                        placeholder="Content title..."
                        onChange={(v) => updateContentLabel(c.id, v)}
                        className="text-md"
                      />
                    </div>
                    <span className="text-sm text-gray-400 capitalize flex-shrink-0">{c.type}</span>
                    <button
                      onClick={() => removeContent(c.id)}
                      className="text-gray-300 hover:text-red-500 transition flex-shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Content */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Add Content</p>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map(({ type, label, Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addContent(type)}
                  className="flex items-center gap-1.5 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Default fallback course ────────────────────────────────────────────────────

const DEFAULT_COURSE = {
  id: 1,
  courseTitle: "Advanced Mathematics",
  subject: "Mathematics",
  class: "Grade 10",
  section: "A",
  academicYear: "2025-2026",
  description: "A rigorous exploration of advanced mathematical concepts.",
  status: "Published",
  modulesData: [
    {
      id: 1,
      title: "Introduction & Foundations",
      description: "Overview of core concepts and prerequisites.",
      expanded: true,
      contents: [
        { id: 11, type: "document", label: "Course Syllabus" },
        { id: 12, type: "video",    label: "Welcome Video"   },
      ],
    },
    {
      id: 2,
      title: "Core Theory",
      description: "In-depth exploration of fundamental theoretical principles.",
      expanded: false,
      contents: [
        { id: 21, type: "document", label: "Lecture Notes"   },
        { id: 22, type: "link",     label: "Reference Guide" },
      ],
    },
  ],
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const EditCourse = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const original = state?.course ?? DEFAULT_COURSE;

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    courseTitle:  original.courseTitle  ?? "",
    subject:      original.subject      ?? "",
    class:        original.class        ?? "",
    section:      original.section      ?? "",
    academicYear: original.academicYear ?? "",
    description:  original.description  ?? "",
    status:       original.status       ?? "Draft",
  });

  const [errors,  setErrors]  = useState({});
  const [saved,   setSaved]   = useState(false);

  // ── Module state ──────────────────────────────────────────────────────────
  const seedModules = Array.isArray(original.modulesData)
    ? original.modulesData
    : typeof original.modules === "number"
      ? Array.from({ length: original.modules }, (_, i) => ({
          id: i + 1,
          title: `Module ${i + 1}`,
          description: "",
          expanded: i === 0,
          contents: [],
        }))
      : [{ id: Date.now(), title: "", description: "", expanded: true, contents: [] }];

  const [modules, setModules] = useState(seedModules);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const updateModule = (id, updated) =>
    setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));

  const removeModule = (id) =>
    setModules((prev) => prev.filter((m) => m.id !== id));

  const addModule = () =>
    setModules((prev) => [
      ...prev,
      { id: Date.now(), title: "", description: "", expanded: true, contents: [] },
    ]);

  const validate = () => {
    const e = {};
    if (!form.courseTitle.trim())  e.courseTitle  = "Course title is required.";
    if (!form.subject.trim())      e.subject      = "Subject is required.";
    if (!form.class.trim())        e.class        = "Class is required.";
    if (!form.academicYear.trim()) e.academicYear = "Academic year is required.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const payload = { ...original, ...form, modulesData: modules, modules: modules.length };
    console.log("Updating course:", payload);

    setSaved(true);
    setTimeout(() => {
      navigate("/faculty/courses/detail", { state: { course: payload } });
    }, 1200);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6 max-w-8xl mx-auto text-left">

      {/* Back */}
      <button
        onClick={() => navigate("/faculty/courses/detail", { state: { course: original } })}
        className="flex items-center gap-2 text-md text-gray-600 hover:text-black transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Course
      </button>

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
            <p className="text-md text-gray-500 mt-0.5">
              Update course details and module content
            </p>
          </div>
        </div> 

        {/* Unsaved changes pill */}
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
          Unsaved changes
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Course Details ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800 text-left">Course Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-md text-left font-medium text-gray-700 mb-1">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="courseTitle"
                value={form.courseTitle}
                onChange={handleChange}
                placeholder="e.g. Advanced Mathematics"
                className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition ${
                  errors.courseTitle ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.courseTitle && (
                <p className="text-md text-red-500 mt-1">{errors.courseTitle}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-left text-md font-medium text-gray-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Mathematics"
                className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition ${
                  errors.subject ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.subject && (
                <p className="text-md text-red-500 mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-left text-md font-medium text-gray-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                placeholder="e.g. 2025-2026"
                className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition ${
                  errors.academicYear ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                }`}
              />
              {errors.academicYear && (
                <p className="text-md text-red-500 mt-1">{errors.academicYear}</p>
              )}
            </div>

            {/* Class */}
            <div>
              <label className="block text-left text-md font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={form.class}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition bg-gray-50 ${
                  errors.class ? "border-red-400 bg-red-50" : "border-gray-200"
                }`}
              >
                <option value="">Select Class</option>
                {["Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {errors.class && (
                <p className="text-md text-red-500 mt-1">{errors.class}</p>
              )}
            </div>

            {/* Section */}
            <div>
              <label className="block text-left text-md font-medium text-gray-700 mb-1">Section</label>
              <select
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition bg-gray-50"
              >
                <option value="">Select Section</option>
                {["A", "B", "C", "D"].map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-md text-left font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition bg-gray-50"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-left text-md font-medium text-gray-700 mb-1">
                Course Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief description of the course..."
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-md outline-none focus:ring-2 focus:ring-blue-300 transition resize-none"
              />
            </div>

          </div>
        </div>

        {/* ── Modules ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Course Modules</h2>
              <p className="text-md text-gray-500 mt-0.5">
                {modules.length} {modules.length === 1 ? "module" : "modules"} · click a module to expand and edit
              </p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-md text-gray-700 hover:bg-gray-50 transition"
            >
              <Plus className="w-4 h-4" />
              Add Module
            </button>
          </div>

          <div className="space-y-3">
            {modules.map((mod, idx) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                index={idx}
                onUpdate={(updated) => updateModule(mod.id, updated)}
                onRemove={() => removeModule(mod.id)}
                canRemove={modules.length > 1}
              />
            ))}
          </div>

          {/* Add module dashed row */}
          <button
            type="button"
            onClick={addModule}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-md text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
          >
            <Plus className="w-4 h-4" />
            Add New Module
          </button>
        </div>

        {/* ── Action Buttons ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            className={`flex items-center gap-2 text-md font-semibold px-6 py-2.5 rounded-lg transition ${
              saved
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? (
              <><Check className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate("/faculty/courses/detail", { state: { course: original } })}
            className="border border-gray-300 text-gray-700 text-md font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};