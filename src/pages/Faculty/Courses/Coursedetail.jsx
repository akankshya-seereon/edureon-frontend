import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  GraduationCap,
  Users,
  FileText,
  Tag,
  Clock,
  Edit,
  Hash,
} from "lucide-react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const B6     = "#2563eb";
const B6_05  = "rgba(37,99,235,0.05)";
const B6_08  = "rgba(37,99,235,0.08)";
const B6_10  = "rgba(37,99,235,0.10)";
const B6_12  = "rgba(37,99,235,0.12)";
const B6_15  = "rgba(37,99,235,0.15)";
const B6_20  = "rgba(37,99,235,0.20)";
const B6_40  = "rgba(37,99,235,0.40)";
const B6_50  = "rgba(37,99,235,0.50)";
const B6_60  = "rgba(37,99,235,0.60)";

// ── Status Badge ───────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) =>
  status === "Published" ? (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
      style={{ background: B6, color: "white" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" />
      Published
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full"
      style={{ background: B6_08, color: B6, border: `1px solid ${B6_20}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: B6_40 }} />
      Draft
    </span>
  );

// ── Info Card — all blue ───────────────────────────────────────────────────────
const InfoCard = ({ icon: Icon, label, value, idx = 0 }) => (
  <div
    className="rounded-2xl p-5 flex items-start gap-4"
    style={{
      background: "white",
      border: `1px solid ${B6_12}`,
      boxShadow: `0 2px 12px rgba(37,99,235,0.06)`,
      animation: `fadeUp 0.3s ease ${idx * 70}ms both`,
    }}
  >
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: B6, boxShadow: `0 4px 12px rgba(37,99,235,0.30)` }}
    >
      <Icon size={18} color="white" />
    </div>
    <div>
      <p
        className="text-sm font-black uppercase tracking-widest mb-1"
        style={{ color: B6_50 }}
      >
        {label}
      </p>
      <p className="text-md font-bold" style={{ color: B6 }}>
        {value || "—"}
      </p>
    </div>
  </div>
);

// ── Sample modules fallback ────────────────────────────────────────────────────
const SAMPLE_MODULES = [
  { title: "Introduction & Foundations",  description: "Overview of core concepts and prerequisites." },
  { title: "Core Theory",                 description: "In-depth study of theoretical principles." },
  { title: "Applied Practice",            description: "Hands-on exercises and problem sets." },
];

// ══════════════════════════════════════════════════════════════════════════════
// CourseDetail
// ══════════════════════════════════════════════════════════════════════════════
export const CourseDetail = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const course = state?.course ?? {
    id: 1,
    courseTitle:  "Advanced Mathematics",
    subject:      "Mathematics",
    class:        "Grade 10-A",
    section:      "A",
    academicYear: "2025-2026",
    modules:      6,
    status:       "Published",
    description:
      "A rigorous exploration of advanced mathematical concepts including algebra, geometry, and trigonometry designed for Grade 10 students.",
  };

  const modulesArray = Array.isArray(course.modulesData)
    ? course.modulesData
    : SAMPLE_MODULES.slice(0, typeof course.modules === "number" ? course.modules : 3);

  const moduleCount =
    typeof course.modules === "number" ? course.modules : modulesArray.length;

  return (
    <div
      className="p-6 space-y-6 max-w-8xl mx-auto text-left"
      style={{ fontFamily: "sans-serif" }}
    >
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ── Back ──────────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate("/faculty/courses")}
        className="flex items-center gap-2 text-md font-bold transition-all"
        style={{ color: B6_50, background: "none", border: "none", cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.color = B6}
        onMouseLeave={e => e.currentTarget.style.color = B6_50}
      >
        <ArrowLeft size={16} />
        Back to Courses
      </button>

      {/* ── Hero Header ───────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: `1px solid ${B6_12}`,
          boxShadow: `0 4px 24px rgba(37,99,235,0.08)`,
          animation: "fadeUp 0.35s ease",
        }}
      >
        {/* Blue top band */}
        <div className="bg-blue-600 px-6 pt-6 pb-10 relative">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 70%, white 0%, transparent 50%), radial-gradient(circle at 85% 10%, white 0%, transparent 50%)",
            }}
          />
          <div className="relative flex items-start justify-between gap-4 flex-wrap">
            {/* Left: icon + title */}
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <GraduationCap size={26} color="white" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {course.courseTitle}
                  </h1>
                  <StatusBadge status={course.status} />
                </div>
                {course.subject && (
                  <p className="text-md mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {course.subject}
                  </p>
                )}
              </div>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/faculty/courses/modules", { state: { course } })}
                className="flex items-center gap-1.5 text-md font-bold px-4 py-2 rounded-xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
              >
                <FileText size={15} />
                View Modules
              </button>
              <button
                onClick={() => navigate("/faculty/courses/edit", { state: { course } })}
                className="flex items-center gap-1.5 text-md font-bold px-4 py-2 rounded-xl transition-all"
                style={{
                  background: "white",
                  color: B6,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(37,99,235,0.2)",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#eff6ff"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}
              >
                <Edit size={15} />
                Edit Course
              </button>
            </div>
          </div>
        </div>

        {/* White content panel pulled up over the blue band */}
        <div
          className="mx-4 -mt-4 relative z-10 rounded-2xl"
          style={{
            background: "white",
            boxShadow: `0 4px 24px ${B6_15}, 0 0 0 1px ${B6_10}`,
          }}
        >
          {/* Stats strip — Class · Section · Academic Year · Modules */}
          <div className="grid grid-cols-2 md:grid-cols-4">
            {[
              { label: "Class",         value: course.class,                   icon: Users    },
              { label: "Section",       value: course.section || "All Sections", icon: Hash     },
              { label: "Academic Year", value: course.academicYear,            icon: Calendar },
              { label: "Total Modules", value: `${moduleCount} Modules`,       icon: BookOpen },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="py-4 px-4 flex items-center gap-3"
                  style={{
                    borderRight: i < 3 ? `1px solid ${B6_10}` : "none",
                    borderBottom: i < 2 ? `1px solid ${B6_10}` : "none",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: B6, boxShadow: `0 4px 10px rgba(37,99,235,0.28)` }}
                  >
                    <Icon size={15} color="white" />
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: B6_50 }}
                    >
                      {s.label}
                    </p>
                    <p className="text-md font-black" style={{ color: B6 }}>
                      {s.value || "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        {course.description && (
          <div
            className="px-6 py-5 mt-4"
            style={{ borderTop: `1px solid ${B6_08}` }}
          >
            <p
              className="text-sm font-black uppercase tracking-widest mb-2"
              style={{ color: B6_40 }}
            >
              About this Course
            </p>
            <p className="text-md leading-relaxed font-medium" style={{ color: B6_60 }}>
              {course.description}
            </p>
          </div>
        )}
      </div>

      {/* ── Modules Section ───────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "white",
          border: `1px solid ${B6_12}`,
          boxShadow: `0 2px 16px rgba(37,99,235,0.06)`,
          animation: "fadeUp 0.4s ease 0.1s both",
        }}
      >
        {/* Section header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${B6_10}`, background: B6_05 }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: B6, boxShadow: `0 4px 10px rgba(37,99,235,0.28)` }}
            >
              <BookOpen size={15} color="white" />
            </div>
            <div>
              <h2 className="text-md font-black" style={{ color: B6 }}>
                Course Modules
              </h2>
              <p className="text-sm font-medium" style={{ color: B6_50 }}>
                {moduleCount} {moduleCount === 1 ? "module" : "modules"} in this course
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/faculty/courses/modules", { state: { course } })}
            className="flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl transition-all"
            style={{
              background: B6,
              color: "white",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 4px 12px rgba(37,99,235,0.3)`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1d4ed8"}
            onMouseLeave={e => e.currentTarget.style.background = B6}
          >
            <FileText size={13} />
            Manage Modules
          </button>
        </div>

        {/* Module rows */}
        <div className="p-4 space-y-3">
          {modulesArray.map((mod, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-2xl transition-all"
              style={{
                border: `1px solid ${B6_12}`,
                background: B6_05,
                animation: `fadeUp 0.3s ease ${idx * 60}ms both`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = B6_20;
                e.currentTarget.style.background = B6_08;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = B6_12;
                e.currentTarget.style.background = B6_05;
              }}
            >
              {/* Index bubble */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-md font-black flex-shrink-0"
                style={{
                  background: B6,
                  color: "white",
                  boxShadow: `0 4px 10px rgba(37,99,235,0.28)`,
                }}
              >
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-md font-bold" style={{ color: B6 }}>
                  {mod.title || `Module ${idx + 1}`}
                </p>
                {mod.description && (
                  <p
                    className="text-sm mt-0.5 line-clamp-2 font-medium"
                    style={{ color: B6_50 }}
                  >
                    {mod.description}
                  </p>
                )}
              </div>
              <div
                className="flex items-center gap-1 text-sm font-bold flex-shrink-0"
                style={{ color: B6_40 }}
              >
                <Clock size={13} />
                <span>Module {idx + 1}</span>
              </div>
            </div>
          ))}

          {/* Placeholder rows if count > real data */}
          {moduleCount > modulesArray.length &&
            Array.from({ length: moduleCount - modulesArray.length }).map((_, idx) => (
              <div
                key={`placeholder-${idx}`}
                className="flex items-start gap-4 p-4 rounded-2xl"
                style={{ border: `2px dashed ${B6_15}`, background: "white" }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: B6_08, color: B6_40 }}
                >
                  {modulesArray.length + idx + 1}
                </div>
                <div className="flex-1">
                  <div
                    className="h-3 rounded-lg w-40 mb-2"
                    style={{ background: B6_08 }}
                  />
                  <div
                    className="h-2.5 rounded-lg w-64"
                    style={{ background: B6_05 }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};