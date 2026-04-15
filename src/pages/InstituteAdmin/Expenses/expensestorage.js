// ═══════════════════════════════════════════════════════════════════════════════
// ExpenseStorage.js  —  Central data layer for all Expense modules
// Used by: Salary.jsx · Maintenance.jsx · Transport.jsx · Assets.jsx
// ═══════════════════════════════════════════════════════════════════════════════

// ─── LocalStorage Keys ────────────────────────────────────────────────────────
export const SALARY_KEY      = "expense_salary";
export const MAINTENANCE_KEY = "expense_maintenance";
export const TRANSPORT_KEY   = "expense_transport";
export const ASSETS_KEY      = "expense_assets";
export const FACULTY_KEY     = "faculty_list";       // shared with FacultyList / FacultyForm

// ─── Month list (used by Salary & Maintenance) ────────────────────────────────
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Status badge styles (used by Salary and any module that renders statuses) ─
export const STATUS_STYLE = {
  Paid:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Pending: "bg-amber-100  text-amber-700  border border-amber-200",
  Failed:  "bg-red-100    text-red-700    border border-red-200",
  Draft:   "bg-slate-100  text-slate-600  border border-slate-200",
};

// ─── Generic CRUD helpers ─────────────────────────────────────────────────────

/**
 * Read all records for a given key.
 * @param {string} key - localStorage key
 * @returns {Array}
 */
export const getRecords = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

/**
 * Append a single record to a key's array.
 * @param {string} key
 * @param {Object} record
 */
export const addRecord = (key, record) => {
  try {
    const existing = getRecords(key);
    existing.push(record);
    localStorage.setItem(key, JSON.stringify(existing));
  } catch (err) {
    console.error(`addRecord(${key}) failed:`, err);
  }
};

/**
 * Delete a record by its `id` field.
 * @param {string} key
 * @param {number|string} id
 */
export const deleteRecord = (key, id) => {
  try {
    const updated = getRecords(key).filter((r) => r.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error(`deleteRecord(${key}, ${id}) failed:`, err);
  }
};

/**
 * Update a record in place (matched by `id`).
 * @param {string} key
 * @param {number|string} id
 * @param {Object} changes  - partial fields to merge
 */
export const updateRecord = (key, id, changes) => {
  try {
    const updated = getRecords(key).map((r) =>
      r.id === id ? { ...r, ...changes } : r
    );
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (err) {
    console.error(`updateRecord(${key}, ${id}) failed:`, err);
  }
};

// ─── Transaction ID generator ─────────────────────────────────────────────────
/**
 * Generate a unique transaction ID.
 * Format: <PREFIX>-<YYYYMMDD>-<4 random hex chars>
 * Examples: SAL-20240315-A3F2 · MNT-20240315-B9C1 · TRP-20240315-D4E7 · AST-20240315-1AB3
 *
 * @param {"SAL"|"MNT"|"TRP"|"AST"} prefix
 * @returns {string}
 */
export const genTxnId = (prefix = "TXN") => {
  const now  = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
  return `${prefix}-${date}-${rand}`;
};

// ─── Faculty helpers (used by Salary.jsx) ─────────────────────────────────────

/**
 * Read all faculty from the shared faculty_list key.
 * Returns the same data structure written by FacultyForm.jsx / FacultyList.jsx.
 * @returns {Array}
 */
export const getFaculty = () => {
  try {
    return JSON.parse(localStorage.getItem(FACULTY_KEY) || "[]");
  } catch {
    return [];
  }
};

/**
 * Save/overwrite the full faculty list.
 * @param {Array} list
 */
export const saveFaculty = (list) => {
  try {
    localStorage.setItem(FACULTY_KEY, JSON.stringify(list));
  } catch (err) {
    console.error("saveFaculty failed:", err);
  }
};

/**
 * Seed demo faculty data if the faculty list is empty.
 * Mirrors the seed data used in FacultyList.jsx so the salary module
 * has faculty to select even before any real registrations.
 */
export const ensureFaculty = () => {
  if (getFaculty().length > 0) return;           // already has data — do nothing

  saveFaculty([
    {
      id: 1, first_name: "Anjali", last_name: "Sharma",
      email: "anjali.sharma@example.com", phone: "+91 9876543210",
      institute_code: "INST-2024-001", department: "Computer Science",
      designation: "Senior Professor", experience: "8",
      bank_name: "State Bank of India", account_number: "123456789012",
      account_holder_name: "Anjali Sharma", confirm_account_number: "123456789012",
      ifsc_code: "SBIN0001234", branch_name: "MG Road Branch",
      dob: "1985-03-12", gender: "Female",
      aadhar_no: "1234 5678 9012", pan_no: "ABCDE1234F",
      education: {
        tenth:   { board: "CBSE",  marks: "92%", year: "2001", file: "tenth_cert.pdf"   },
        twelfth: { board: "CBSE",  marks: "88%", year: "2003", file: "twelfth_cert.pdf" },
        bed:     { university: "DU", marks: "85%", year: "2007", file: "bed_cert.pdf"   },
        ug:      { degree: "B.Sc CS", university: "DU", marks: "79%", year: "2006", file: "ug_cert.pdf" },
        pg:      { degree: "M.Sc CS", university: "IIT", marks: "88%", year: "2008", file: "pg_cert.pdf" },
        other:   { degree: "", university: "", marks: "", year: "", file: null },
      },
      status: "active", created_at: new Date("2024-01-15").toISOString(),
    },
    {
      id: 2, first_name: "Rohan", last_name: "Verma",
      email: "rohan.verma@example.com", phone: "+91 9123456780",
      institute_code: "INST-2024-002", department: "Mathematics",
      designation: "Assistant Professor", experience: "3",
      bank_name: "HDFC Bank", account_number: "987654321098",
      account_holder_name: "Rohan Verma", confirm_account_number: "987654321098",
      ifsc_code: "HDFC0001234", branch_name: "Connaught Place",
      dob: "1991-07-22", gender: "Male",
      aadhar_no: "9876 5432 1098", pan_no: "ZYXWV9876G",
      education: {
        tenth:   { board: "ICSE", marks: "87%", year: "2007", file: "tenth.pdf" },
        twelfth: { board: "ICSE", marks: "83%", year: "2009", file: "12th.pdf"  },
        bed:     { university: "", marks: "", year: "", file: null },
        ug:      { degree: "B.Sc Math", university: "BHU", marks: "76%", year: "2012", file: "ug.pdf" },
        pg:      { degree: "", university: "", marks: "", year: "", file: null },
        other:   { degree: "", university: "", marks: "", year: "", file: null },
      },
      status: "active", created_at: new Date("2024-03-10").toISOString(),
    },
    {
      id: 3, first_name: "Priya", last_name: "Nair",
      email: "priya.nair@example.com", phone: "+91 9988776655",
      institute_code: "INST-2024-003", department: "Physics",
      designation: "Professor", experience: "12",
      bank_name: "ICICI Bank", account_number: "112233445566",
      account_holder_name: "Priya Nair", confirm_account_number: "112233445566",
      ifsc_code: "ICIC0001234", branch_name: "Fort Branch",
      dob: "1979-11-05", gender: "Female",
      aadhar_no: "1122 3344 5566", pan_no: "PQRST5678H",
      education: {
        tenth:   { board: "State Board", marks: "94%", year: "1995", file: "10th.pdf" },
        twelfth: { board: "State Board", marks: "91%", year: "1997", file: "12th.pdf" },
        bed:     { university: "Calicut University", marks: "89%", year: "2001", file: "bed.pdf" },
        ug:      { degree: "B.Sc Physics", university: "Calicut University", marks: "82%", year: "2000", file: "ug.pdf" },
        pg:      { degree: "M.Sc Physics", university: "IIT Madras",         marks: "91%", year: "2002", file: "pg.pdf" },
        other:   { degree: "Ph.D", university: "IIT Madras", marks: "—",     year: "2007", file: "phd.pdf" },
      },
      status: "active", created_at: new Date("2023-11-20").toISOString(),
    },
  ]);
};

// ─── Expense summary helpers (optional — useful for a dashboard) ───────────────

/**
 * Get the grand total spent across ALL expense categories.
 * @returns {{ salary: number, maintenance: number, transport: number, assets: number, total: number }}
 */
export const getExpenseSummary = () => {
  const sum = (key) => getRecords(key).reduce((s, r) => s + (r.amount || 0), 0);
  const salary      = sum(SALARY_KEY);
  const maintenance = sum(MAINTENANCE_KEY);
  const transport   = sum(TRANSPORT_KEY);
  const assets      = sum(ASSETS_KEY);
  return { salary, maintenance, transport, assets, total: salary + maintenance + transport + assets };
};

/**
 * Get all expense records from every category, merged and sorted newest-first.
 * Each record has a `_type` field: "salary" | "maintenance" | "transport" | "assets"
 * @returns {Array}
 */
export const getAllExpenses = () => {
  const tag = (key, type) => getRecords(key).map((r) => ({ ...r, _type: type }));
  return [
    ...tag(SALARY_KEY,      "salary"),
    ...tag(MAINTENANCE_KEY, "maintenance"),
    ...tag(TRANSPORT_KEY,   "transport"),
    ...tag(ASSETS_KEY,      "assets"),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
};