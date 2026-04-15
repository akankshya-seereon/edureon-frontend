import axios from "axios";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  BookOpen,
  FileText,
  UploadCloud,
  Link2,
  Video,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { VideoUploadModal } from "./VideoUploadModal";

// ── Helpers ────────────────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  { type: "document", label: "Document",   Icon: FileText    },
  { type: "video",    label: "Video",      Icon: Video       },
  { type: "link",     label: "Link",       Icon: Link2       },
  { type: "upload",   label: "Upload",     Icon: UploadCloud },
];

const initialModule = (index = 0) => ({
  id: Date.now() + index,
  title: "",
  description: "",
  expanded: true,
  contents: [],
});

const SAMPLE_MODULES = [
  {
    id: 1,
    title: "Introduction & Foundations",
    description: "Overview of core concepts and prerequisites students need before diving into the main content.",
    expanded: true,
    contents: [
      { id: 11, type: "document", label: "Course Syllabus" },
      { id: 12, type: "video",    label: "Welcome Video", platform: "Upload" },
    ],
  },
  {
    id: 2,
    title: "Core Theory",
    description: "In-depth exploration of the fundamental theoretical principles.",
    expanded: false,
    contents: [
      { id: 21, type: "document", label: "Lecture Notes"   },
      { id: 22, type: "link",     label: "Reference Guide" },
    ],
  },
  {
    id: 3,
    title: "Applied Practice",
    description: "Hands-on exercises and real-world problem sets.",
    expanded: false,
    contents: [
      { id: 31, type: "upload", label: "Exercise Sheet" },
    ],
  },
];

// ── Content Type Icon ──────────────────────────────────────────────────────────

const ContentIcon = ({ type }) => {
  const found = CONTENT_TYPES.find((c) => c.type === type);
  const Icon = found?.Icon ?? FileText;
  const colors = {
    document: "bg-blue-50 text-blue-600",
    video:    "bg-blue-50 text-blue-600",
    link:     "bg-yellow-50 text-yellow-600",
    upload:   "bg-green-50 text-green-600",
  };
  return (
    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[type] ?? "bg-gray-50 text-gray-500"}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

// ── Inline editable field ──────────────────────────────────────────────────────

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

// ── Module Card ────────────────────────────────────────────────────────────────

const ModuleCard = ({ module, index, onUpdate, onRemove, canRemove }) => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const toggle = () => onUpdate({ ...module, expanded: !module.expanded });
  const updateField = (field, value) => onUpdate({ ...module, [field]: value });

  const addContent = (type) => {
    // Video opens modal instead of directly adding
    if (type === "video") {
      setVideoModalOpen(true);
      return;
    }
    const label = CONTENT_TYPES.find((c) => c.type === type)?.label ?? "Content";
    onUpdate({
      ...module,
      contents: [...module.contents, { id: Date.now(), type, label }],
    });
  };

  const handleVideoConfirm = (videoItem) => {
    onUpdate({
      ...module,
      contents: [...module.contents, { id: Date.now(), ...videoItem }],
    });
  };

  const removeContent = (cid) =>
    onUpdate({ ...module, contents: module.contents.filter((c) => c.id !== cid) });

  const updateContentLabel = (cid, label) =>
    onUpdate({
      ...module,
      contents: module.contents.map((c) => (c.id === cid ? { ...c, label } : c)),
    });

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* ── Module Header ──────────────────────────────────────────────────── */}
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
              {module.contents.length} {module.contents.length === 1 ? "item" : "items"}
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
            {module.expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* ── Expanded Body ──────────────────────────────────────────────────── */}
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

            {/* Contents list */}
            {module.contents.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Content Items</p>
                <div className="space-y-2">
                  {module.contents.map((c) => (
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
                        {/* Show platform badge for videos */}
                        {c.type === "video" && c.platform && (
                          <span className="text-sm text-blue-600 font-medium mt-0.5 inline-block">
                            {c.platform === "Upload" ? "📁 Uploaded file" : `🔗 ${c.platform}`}
                          </span>
                        )}
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

            {/* Add Content buttons */}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Add Content</p>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(({ type, label, Icon }) => (
                  <button
                    key={type}
                    onClick={() => addContent(type)}
                    className={`flex items-center gap-1.5 border border-dashed rounded-lg px-3 py-1.5 text-sm transition ${
                      type === "video"
                        ? "border-purple-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50"
                        : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
                    }`}
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

      {/* Video Upload Modal — scoped per module */}
      <VideoUploadModal
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        onConfirm={handleVideoConfirm}
        moduleTitle={module.title || `Module ${index + 1}`}
      />
    </>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export const CourseModules = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const course = state?.course ?? {
    id: 1,
    courseTitle: "Advanced Mathematics",
    class: "Grade 10-A",
    academicYear: "2025-2026",
    status: "Published",
  };

  const [modules, setModules] = useState(
    Array.isArray(state?.course?.modulesData)
      ? state.course.modulesData
      : SAMPLE_MODULES
  );

  const [saved, setSaved] = useState(false);

  const updateModule = (id, updated) =>
    setModules((prev) => prev.map((m) => (m.id === id ? updated : m)));

  const removeModule = (id) =>
    setModules((prev) => prev.filter((m) => m.id !== id));

  const addModule = () =>
    setModules((prev) => [...prev, initialModule(prev.length)]);

  const handleSave = async () => {
    try {
      // 🎯 FIXED: Removed local storage token and added withCredentials: true
      const response = await axios.post(
        `http://localhost:5000/api/faculty/courses/${course.id}/modules`,
        { modules }, 
        { withCredentials: true } // 🎯 Automatically sends the HTTP-Only cookie!
      );

      if (response.data.success) {
        console.log("✅ Data saved to MySQL!");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("❌ Save Failed:", err.response?.data || err.message);
      alert("Could not save to database. Check if backend is running.");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-8xl mx-auto text-left">

      {/* Back */}
      <button
        onClick={() => navigate("/faculty/courses")}
        className="flex items-center gap-2 text-md text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </button>

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{course.courseTitle}</h1>
            <p className="text-md text-gray-500 mt-0.5">
              {course.class} · {course.academicYear}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/faculty/courses/detail", { state: { course } })}
            className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-4 py-2 text-md text-gray-700 hover:bg-gray-50 transition"
          >
            <BookOpen className="w-4 h-4" />
            Course Details
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-md font-semibold transition ${
              saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : <>Save Modules</>}
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-md text-gray-600">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-gray-900">{modules.length}</span> modules
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2 text-md text-gray-600">
          <FileText className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">
            {modules.reduce((acc, m) => acc + m.contents.length, 0)}
          </span>{" "}content items
        </div>
        <div className="flex items-center gap-2 text-md text-gray-600">
          <Video className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-gray-900">
            {modules.reduce((acc, m) => acc + m.contents.filter((c) => c.type === "video").length, 0)}
          </span>{" "}videos
        </div>
        <div className="ml-auto">
          <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
            course.status === "Published"
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-600 border border-gray-300"
          }`}>
            {course.status}
          </span>
        </div>
      </div>

      {/* Module Cards */}
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

      {/* Add Module */}
      <button
        onClick={addModule}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-4 text-md text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
      >
        <Plus className="w-4 h-4" />
        Add New Module
      </button>

      {/* Bottom Actions */}
      <div className="flex items-center gap-3 pb-6">
        <button
          onClick={handleSave}
          className={`text-md font-semibold px-6 py-2.5 rounded-lg transition ${
            saved ? "bg-green-600 text-white" : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saved ? "Saved!" : "Save Modules"}
        </button>
        <button
          onClick={() => navigate("/faculty/courses")}
          className="border border-gray-300 text-gray-700 text-md font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>

    </div>
  );
};