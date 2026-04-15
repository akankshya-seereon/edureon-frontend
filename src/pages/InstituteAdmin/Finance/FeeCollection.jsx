import React, { useState, useEffect } from "react";
import {
  Search, Download, TrendingUp, AlertCircle, Plus, X, Check,
  ChevronDown, DollarSign, Send, Hash, Loader, CheckCircle,
  Trash2, CreditCard, Receipt, RefreshCw, Eye, Copy, Bell
} from "lucide-react";

// ─── Storage ──────────────────────────────────────────────────────────────────
const TXN_KEY = "fee_transactions_v3";
const ST_KEY  = "fee_students_v3";

const getTxns    = () => { try { return JSON.parse(localStorage.getItem(TXN_KEY) || "[]"); } catch { return []; } };
const saveTxns   = (d) => localStorage.setItem(TXN_KEY, JSON.stringify(d));
const getStudents= () => { try { return JSON.parse(localStorage.getItem(ST_KEY)  || "[]"); } catch { return []; } };

// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "Computer Science","Mathematics","Physics","Chemistry",
  "Mechanical Engineering","Civil Engineering","Electronics",
  "Business Administration","Arts & Humanities",
];
const COURSES = [
  "B.Tech Computer Science","B.Tech Information Technology",
  "B.Tech Electronics & Communication","B.Tech Mechanical Engineering",
  "B.Tech Civil Engineering","B.Sc Computer Science","B.Sc Mathematics",
  "B.Sc Physics","MBA","BBA","M.Tech","MCA",
];
const FEE_TYPES = [
  "Tuition Fee","Exam Fee","Lab Fee","Library Fee",
  "Sports Fee","Infrastructure Fee","Development Fee","Hostel Fee",
];
const PAYMENT_METHODS = ["Online Transfer","Cash","Cheque","DD","UPI"];

// ─── Seed demo ────────────────────────────────────────────────────────────────
const seedDemo = () => {
  if (getTxns().length > 0) return;
  saveTxns([
    { id: 1, txnId: "TXN-20240001", student: "Amit Sharma",  studentId: 0, dept: "Computer Science",       course: "B.Tech Computer Science", feeType: "Tuition Fee",        amount: 45000, method: "Online Transfer", status: "Paid",    date: "2024-02-01", note: "" },
    { id: 2, txnId: "TXN-20240002", student: "Priya Das",    studentId: 0, dept: "Mathematics",            course: "B.Sc Mathematics",         feeType: "Exam Fee",           amount: 2500,  method: "Cash",           status: "Paid",    date: "2024-02-03", note: "" },
    { id: 3, txnId: "TXN-20240003", student: "Rahul Singh",  studentId: 0, dept: "Computer Science",       course: "B.Tech Computer Science", feeType: "Tuition Fee",        amount: 45000, method: "Cheque",         status: "Pending", date: "2024-02-05", note: "Awaiting clearance" },
    { id: 4, txnId: "TXN-20240004", student: "Sneha Patel",  studentId: 0, dept: "Business Administration",course: "MBA",                      feeType: "Lab Fee",            amount: 8000,  method: "UPI",            status: "Paid",    date: "2024-02-07", note: "" },
    { id: 5, txnId: "TXN-20240005", student: "Karan Verma",  studentId: 0, dept: "Electronics",            course: "B.Tech Electronics & Communication", feeType: "Infrastructure Fee", amount: 12000, method: "Online Transfer", status: "Overdue", date: "2024-01-15", note: "Overdue since Jan" },
  ]);
};

const genTxnId = () => `TXN-${Date.now().toString().slice(-8)}`;

const STATUS_STYLE = {
  Paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  Sent:    "bg-blue-50 text-blue-700 border-blue-200",
};

// ─── Create Payment Modal ──────────────────────────────────────────────────────
const CreatePaymentModal = ({ onClose, onCreated }) => {
  const students = getStudents();
  const [step,        setStep]        = useState(1);
  const [saving,      setSaving]      = useState(false);
  const [createdTxn,  setCreatedTxn]  = useState(null);
  const [copied,      setCopied]      = useState(false);
  const [form, setForm] = useState({
    dept:"", course:"", studentId:"", studentName:"",
    feeType:"", amount:"", method:"Online Transfer", dueDate:"", note:"",
  });
  const [errors, setErrors] = useState({});

  const h = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const filteredStudents = students.filter(s =>
    (!form.dept   || s.department === form.dept) &&
    (!form.course || s.course     === form.course)
  );

  const handleStudentSelect = e => {
    const sid = Number(e.target.value);
    const st  = students.find(s => s.id === sid);
    setForm(p => ({ ...p, studentId: sid, studentName: st?.name || "", dept: st?.department || p.dept, course: st?.course || p.course }));
  };

  const validate = () => {
    const e = {};
    if (!form.dept)        e.dept = "Required";
    if (!form.course)      e.course = "Required";
    if (!form.studentName.trim()) e.studentName = "Required";
    if (!form.feeType)     e.feeType = "Required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter valid amount";
    if (!form.method)      e.method = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    const txnId = genTxnId();
    const txn = {
      id: Date.now(), txnId,
      student: form.studentName, studentId: form.studentId,
      dept: form.dept, course: form.course, feeType: form.feeType,
      amount: Number(form.amount), method: form.method,
      status: "Sent", date: new Date().toISOString().split("T")[0],
      dueDate: form.dueDate, note: form.note,
    };
    setTimeout(() => {
      saveTxns([...getTxns(), txn]);
      setSaving(false); setCreatedTxn(txn); setStep(2); onCreated?.();
    }, 800);
  };

  const copyTxnId = () => {
    navigator.clipboard.writeText(createdTxn.txnId).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const SF = ({ label, name, options, value, onChange, error, required, placeholder }) => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <select name={name} value={value} onChange={onChange}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none appearance-none transition-all
            ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}>
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>

        {step === 1 ? (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><CreditCard size={18} className="text-white" /></div>
                <div>
                  <h2 className="text-white font-black text-lg">Create Fee Payment</h2>
                  <p className="text-blue-200 text-xs mt-0.5">Record a student payment</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <SF label="Department" name="dept" value={form.dept}
                  onChange={e => setForm(p => ({ ...p, dept: e.target.value, studentId: "", studentName: "" }))}
                  options={DEPARTMENTS} error={errors.dept} required />
                <SF label="Course" name="course" value={form.course}
                  onChange={e => setForm(p => ({ ...p, course: e.target.value, studentId: "", studentName: "" }))}
                  options={COURSES} error={errors.course} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Student <span className="text-red-500">*</span>
                </label>
                {filteredStudents.length > 0 ? (
                  <div className="relative">
                    <select value={form.studentId} onChange={handleStudentSelect}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none appearance-none transition-all
                        ${errors.studentName ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}>
                      <option value="">Select Student</option>
                      {filteredStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                ) : (
                  <input name="studentName" value={form.studentName} onChange={h}
                    placeholder="Enter student name manually"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all
                      ${errors.studentName ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`} />
                )}
                {errors.studentName && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={10} />{errors.studentName}</p>}
                {filteredStudents.length === 0 && (
                  <p className="text-xs text-amber-600 font-semibold">No registered students for this dept/course. Enter manually.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SF label="Fee Type" name="feeType" value={form.feeType} onChange={h} options={FEE_TYPES} error={errors.feeType} required />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Amount <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">₹</span>
                    <input name="amount" type="number" value={form.amount} onChange={h} placeholder="0"
                      className={`w-full pl-7 pr-3.5 py-2.5 rounded-xl border text-sm font-semibold outline-none transition-all
                        ${errors.amount ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`} />
                  </div>
                  {errors.amount && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={10} />{errors.amount}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SF label="Payment Method" name="method" value={form.method} onChange={h} options={PAYMENT_METHODS} error={errors.method} required />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</label>
                  <input name="dueDate" type="date" value={form.dueDate} onChange={h}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Note (Optional)</label>
                <textarea name="note" value={form.note} onChange={h} rows={2} placeholder="Any additional info..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all resize-none" />
              </div>

              {form.studentName && form.amount && form.feeType && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-2">Payment Preview</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-800">{form.studentName}</p>
                      <p className="text-xs text-slate-500">{form.feeType} · {form.method}</p>
                    </div>
                    <p className="text-xl font-black text-blue-700">₹{Number(form.amount).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex gap-3 bg-slate-50/50">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70">
                {saving ? <><Loader size={15} className="animate-spin" /> Processing...</> : <><Send size={15} /> Record Payment</>}
              </button>
            </div>
          </>
        ) : (
          <div className="p-10 text-center" style={{ animation: "fadeIn 0.4s ease" }}>
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Payment Recorded!</h2>
            <p className="text-slate-500 mt-2 text-sm">Fee entry created for <span className="font-bold text-slate-700">{createdTxn?.student}</span></p>
            <div className="mt-6 p-4 bg-slate-900 rounded-2xl flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transaction ID</p>
                <p className="text-lg font-black text-white font-mono mt-0.5">{createdTxn?.txnId}</p>
              </div>
              <button onClick={copyTxnId}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                  ${copied ? "bg-emerald-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}>
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              {[
                { label: "Amount",   value: `₹${createdTxn?.amount?.toLocaleString()}` },
                { label: "Fee Type", value: createdTxn?.feeType },
                { label: "Method",   value: createdTxn?.method  },
                { label: "Status",   value: createdTxn?.status  },
              ].map(r => (
                <div key={r.label} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Transaction Detail Modal ──────────────────────────────────────────────────
const TxnDetailModal = ({ txn, onClose, onStatusChange }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(txn.txnId).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
        <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transaction</p>
            <p className="text-white font-black text-lg font-mono mt-0.5">{txn.txnId}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-3">
          {[
            { label: "Student",  value: txn.student  },
            { label: "Course",   value: txn.course   },
            { label: "Dept",     value: txn.dept     },
            { label: "Fee Type", value: txn.feeType  },
            { label: "Amount",   value: `₹${txn.amount?.toLocaleString()}` },
            { label: "Method",   value: txn.method   },
            { label: "Date",     value: txn.date     },
            { label: "Due Date", value: txn.dueDate || "—" },
            { label: "Note",     value: txn.note    || "—" },
          ].map(r => (
            <div key={r.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{r.label}</span>
              <span className="text-xs font-bold text-slate-700">{r.value}</span>
            </div>
          ))}
          <div className="pt-2 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark Status</p>
            <div className="flex gap-2">
              {["Paid", "Pending", "Overdue"].map(s => (
                <button key={s} onClick={() => { onStatusChange(txn.id, s); onClose(); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all
                    ${txn.status === s ? STATUS_STYLE[s] + " border-current" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={copy}
            className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all
              ${copied ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Transaction ID</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export const FeeCollection = () => {
  const [txns,         setTxns]         = useState([]);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreate,   setShowCreate]   = useState(false);
  const [viewTxn,      setViewTxn]      = useState(null);
  const [tick,         setTick]         = useState(0);
  const reload = () => setTick(t => t + 1);

  useEffect(() => { seedDemo(); setTxns(getTxns()); }, [tick]);

  const changeStatus = (id, status) => { saveTxns(getTxns().map(t => t.id === id ? { ...t, status } : t)); reload(); };
  const deleteTxn    = (id) => { saveTxns(getTxns().filter(t => t.id !== id)); reload(); };

  const filtered = txns.filter(t => {
    const matchSearch =
      t.student?.toLowerCase().includes(search.toLowerCase()) ||
      t.txnId?.toLowerCase().includes(search.toLowerCase())   ||
      t.feeType?.toLowerCase().includes(search.toLowerCase()) ||
      t.dept?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPaid    = txns.filter(t => t.status === "Paid").reduce((s, t)    => s + (t.amount || 0), 0);
  const totalPending = txns.filter(t => t.status === "Pending").reduce((s, t) => s + (t.amount || 0), 0);
  const totalOverdue = txns.filter(t => t.status === "Overdue").reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="w-full font-sans text-left pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fee Collection</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Manage student payments and track transactions</p>
          </div>
          <div className="flex gap-2">
            <button onClick={reload}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw size={16} />
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
              <Plus size={16} /> Create Payment
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Transactions", value: txns.length,                          color: "blue",    Icon: Receipt      },
            { label: "Collected",          value: `₹${(totalPaid/1000).toFixed(1)}K`,   color: "emerald", Icon: TrendingUp   },
            { label: "Pending",            value: `₹${(totalPending/1000).toFixed(1)}K`,color: "amber",   Icon: AlertCircle  },
            { label: "Overdue",            value: `₹${(totalOverdue/1000).toFixed(1)}K`,color: "red",     Icon: AlertCircle  },
          ].map(({ label, value, color, Icon }, i) => {
            const cls = {
              blue:    "bg-blue-50 text-blue-600 border-blue-100",
              emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
              amber:   "bg-amber-50 text-amber-600 border-amber-100",
              red:     "bg-red-50 text-red-600 border-red-100",
            }[color];
            return (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                style={{ animation: `fadeIn 0.3s ease ${i * 70}ms both` }}>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${cls}`}><Icon size={16} /></div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search student, transaction ID, fee type..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm" />
          </div>
          <div className="flex gap-2">
            {["all", "Paid", "Pending", "Overdue", "Sent"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border transition-all
                  ${filterStatus === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-black text-slate-700">
              {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
              {filterStatus !== "all" && <span className="text-slate-400 font-normal"> · {filterStatus}</span>}
            </p>
            <button className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
              <Download size={13} /> Export
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Receipt size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-bold">No transactions found</p>
              <p className="text-slate-300 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Txn ID","Student","Department","Fee Type","Amount","Method","Date","Status",""].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((txn, i) => (
                    <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors group"
                      style={{ animation: `fadeIn 0.3s ease ${i * 40}ms both` }}>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{txn.txnId}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-xs uppercase flex-shrink-0">
                            {txn.student?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{txn.student}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[120px]">{txn.course}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600 whitespace-nowrap">{txn.dept}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">{txn.feeType}</span>
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">₹{txn.amount?.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{txn.method}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{txn.date}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${STATUS_STYLE[txn.status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                          {txn.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setViewTxn(txn)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => deleteTxn(txn.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreatePaymentModal onClose={() => setShowCreate(false)} onCreated={reload} />}
      {viewTxn    && <TxnDetailModal txn={viewTxn} onClose={() => setViewTxn(null)} onStatusChange={changeStatus} />}
    </>
  );
};

export default FeeCollection;