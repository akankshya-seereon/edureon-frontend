// ─── Storage Keys ────────────────────────────────────────────────────────────
export const EXAM_LIST_KEY     = "exam_list";
export const EXAM_RESULTS_KEY  = "exam_results";
export const EXAM_QUESTION_KEY = "exam_questions";

// ─── Storage Adapter ──────────────────────────────────────────────────────────
// window.storage is only available inside Claude artifact sandbox.
// Falls back to localStorage when running in a normal browser (e.g. Vite dev).
const storage = (typeof window !== "undefined" && window.storage)
  ? window.storage
  : {
      get: async (key) => {
        const value = localStorage.getItem(key);
        return value !== null ? { key, value } : null;
      },
      set: async (key, value) => {
        localStorage.setItem(key, value);
        return { key, value };
      },
      delete: async (key) => {
        localStorage.removeItem(key);
        return { key, deleted: true };
      },
      list: async (prefix = "") => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
        return { keys };
      },
    };

// ─── Storage Helpers ──────────────────────────────────────────────────────────
export const loadFromStorage = async (key, fallback = []) => {
  try {
    const result = await storage.get(key);
    return result ? JSON.parse(result.value) : fallback;
  } catch {
    return fallback;
  }
};

export const saveToStorage = async (key, data) => {
  try {
    await storage.set(key, JSON.stringify(data));
  } catch (e) {
    console.error("Storage error:", e);
  }
};

// ─── Dropdown Options ─────────────────────────────────────────────────────────
export const SEMESTER_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  value: String(n),
  label: `Semester ${n}`,
}));

export const BATCH_OPTIONS = ["A", "B", "C", "D"].map((v) => ({
  value: v,
  label: `Batch ${v}`,
}));

const currentYear = new Date().getFullYear();
export const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = currentYear - i;
  return { value: String(y), label: String(y) };
});

export const SUBJECT_OPTIONS = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "Data Structures",
  "DBMS", "Operating Systems", "Networks", "Software Engineering",
].map((v) => ({ value: v, label: v }));

export const EXAM_TYPE_OPTIONS = [
  { value: "INTERNAL",  label: "Internal" },
  { value: "MIDTERM",   label: "Mid-Term" },
  { value: "FINAL",     label: "Final / End-Term" },
  { value: "EXTERNAL",  label: "External" },
  { value: "PRACTICAL", label: "Practical" },
  { value: "VIVA",      label: "Viva / Oral" },
];

export const DURATION_OPTIONS = [
  { value: "30",  label: "30 min"  },
  { value: "60",  label: "1 hr"    },
  { value: "90",  label: "1.5 hrs" },
  { value: "120", label: "2 hrs"   },
  { value: "150", label: "2.5 hrs" },
  { value: "180", label: "3 hrs"   },
];

export const QUESTION_TYPE_OPTIONS = [
  { value: "MCQ",        label: "Multiple Choice" },
  { value: "SHORT",      label: "Short Answer"    },
  { value: "LONG",       label: "Long Answer"     },
  { value: "TRUE_FALSE", label: "True / False"    },
  { value: "FILL_BLANK", label: "Fill in Blank"   },
];

export const DIFFICULTY_OPTIONS = [
  { value: "EASY",   label: "Easy"   },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD",   label: "Hard"   },
];

// ─── Status Logic ─────────────────────────────────────────────────────────────
export const getExamStatus = (examDate, startTime, durationMinutes) => {
  if (!examDate || !startTime) return "UPCOMING";
  const now   = new Date();
  const start = new Date(`${examDate}T${startTime}`);
  const end   = new Date(start.getTime() + Number(durationMinutes) * 60000);
  if (now < start) return "UPCOMING";
  if (now <= end)  return "ONGOING";
  return "COMPLETED";
};

export const STATUS_META = {
  UPCOMING:  { label: "Upcoming",  bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
  ONGOING:   { label: "Live",      bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  COMPLETED: { label: "Completed", bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
};

// ─── Grade Helper ─────────────────────────────────────────────────────────────
export const getGrade = (marks, total) => {
  const pct = (marks / total) * 100;
  if (pct >= 90) return { grade: "O",  color: "#7c3aed" };
  if (pct >= 80) return { grade: "A+", color: "#2563eb" };
  if (pct >= 70) return { grade: "A",  color: "#16a34a" };
  if (pct >= 60) return { grade: "B+", color: "#0d9488" };
  if (pct >= 50) return { grade: "B",  color: "#ca8a04" };
  if (pct >= 40) return { grade: "C",  color: "#ea580c" };
  return           { grade: "F",  color: "#dc2626" };
};

// ─── Formatters ───────────────────────────────────────────────────────────────
export const formatDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

export const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

// ─── Mock Students ────────────────────────────────────────────────────────────
export const MOCK_STUDENTS = [
  { id: "S001", name: "Aarav Sharma",  rollNo: "101" },
  { id: "S002", name: "Priya Patel",   rollNo: "102" },
  { id: "S003", name: "Rohit Kumar",   rollNo: "103" },
  { id: "S004", name: "Sneha Verma",   rollNo: "104" },
  { id: "S005", name: "Arjun Singh",   rollNo: "105" },
  { id: "S006", name: "Meera Nair",    rollNo: "106" },
  { id: "S007", name: "Karan Mehta",   rollNo: "107" },
  { id: "S008", name: "Divya Reddy",   rollNo: "108" },
  { id: "S009", name: "Vivek Joshi",   rollNo: "109" },
  { id: "S010", name: "Ananya Iyer",   rollNo: "110" },
];

// ─── Avatar Helpers ───────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  ["#ede9fe", "#7c3aed"], ["#dbeafe", "#1d4ed8"], ["#fce7f3", "#be185d"],
  ["#dcfce7", "#15803d"], ["#fef3c7", "#b45309"], ["#e0f2fe", "#0369a1"],
  ["#f3e8ff", "#9333ea"], ["#d1fae5", "#065f46"], ["#ffe4e6", "#be123c"],
  ["#ecfeff", "#0e7490"],
];
export const getAvatarColor = (id) =>
  AVATAR_PALETTE[parseInt(id.replace(/\D/g, "")) % AVATAR_PALETTE.length];

export const getInitials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

// ─── Difficulty Colors ────────────────────────────────────────────────────────
export const DIFF_COLORS = {
  EASY:   { bg: "#f0fdf4", color: "#15803d" },
  MEDIUM: { bg: "#fefce8", color: "#a16207" },
  HARD:   { bg: "#fef2f2", color: "#dc2626" },
};

// ─── Shared CSS (inject once at app root if desired) ──────────────────────────
export const EXAM_GLOBAL_CSS = `
  .exam-fade { animation: examFadeIn .25s ease; }
  @keyframes examFadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
  .exam-card { transition: box-shadow .2s; }
  .exam-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.09); }
  .exam-btn-primary { transition: filter .15s, box-shadow .15s; }
  .exam-btn-primary:hover { filter: brightness(1.07); box-shadow: 0 4px 14px rgba(26,86,219,.3); }
  .exam-row-hover:hover { background: #f8faff !important; }
  .exam-tab { transition: color .15s, border-color .15s; }
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
`;

// ─── Theme constant ───────────────────────────────────────────────────────────
export const BRAND = "#1a56db";