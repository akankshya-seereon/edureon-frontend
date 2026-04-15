import React, { useState, useEffect } from "react";
import {
  ChevronDown, CheckCircle, Loader, Trash2, Eye, Copy, X,
  AlertCircle, TrendingUp, Hash, Search, RefreshCw,
  CreditCard, Check, Package, FileText
} from "lucide-react";
import {
  ASSETS_KEY, getRecords, addRecord, deleteRecord, genTxnId
} from "./expensestorage";

const SelectField = ({ label, value, onChange, options, error, required, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select value={value} onChange={onChange}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none appearance-none transition-all
          ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}>
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle size={10}/>{error}</p>}
  </div>
);

const InputField = ({ label, value, onChange, error, required, placeholder, prefix, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {prefix && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">{prefix}</span>}
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full ${prefix ? "pl-8" : "px-3.5"} pr-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all
          ${error ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}/>
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5"><AlertCircle size={10}/>{error}</p>}
  </div>
);

const Toast = ({ txnId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(txnId).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]" style={{ animation: "toastIn 0.3s ease" }}>
      <div className="bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
        <div className="p-2 bg-emerald-500 rounded-xl flex-shrink-0"><CheckCircle size={16}/></div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Asset Purchased</p>
          <p className="font-mono font-bold text-sm mt-0.5">{txnId}</p>
        </div>
        <button onClick={copy} className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${copied ? "bg-emerald-500" : "bg-white/10 hover:bg-white/20"}`}>
          {copied ? <Check size={12}/> : <Copy size={12}/>}
        </button>
        <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={15}/></button>
      </div>
    </div>
  );
};

const DetailModal = ({ record, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: "rgba(15,23,42,0.7)", backdropFilter: "blur(8px)" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden"
      style={{ animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
      <div className="bg-blue-600 px-6 py-5 flex justify-between items-center">
        <div>
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Asset Record</p>
          <p className="text-white font-black text-lg mt-0.5">{record.assetName}</p>
        </div>
        <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
          <X size={18}/>
        </button>
      </div>
      <div className="p-6 space-y-3">
        {[
          { label: "Txn ID",   value: record.txnId },
          { label: "Asset",    value: record.assetName },
          { label: "Category", value: record.category },
          { label: "Date",     value: record.assetDate },
          { label: "Reason",   value: record.remarks },
          { label: "Amount",   value: `₹${Number(record.amount).toLocaleString()}` },
          { label: "Method",   value: record.method },
          { label: "Vendor",   value: record.vendor || "—" },
          { label: "Status",   value: record.status },
          { label: "Added On", value: record.date },
        ].map(r => (
          <div key={r.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.label}</span>
            <span className="text-xs font-bold text-slate-700">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ASSET_CATEGORIES = [
  "Computer & IT", "Furniture",   "Lab Equipment",
  "Audio Visual",  "HVAC & Electrical", "Sports Equipment",
  "Library Books", "Vehicle",     "Office Equipment", "Other",
];

export const Assets = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState(null);
  const [viewRec, setViewRec] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    assetName: "", category: "", assetDate: "", amount: "",
    remarks: "", method: "Online", txnNumber: "", vendor: "",
  });

  const reload = () => setRecords(getRecords(ASSETS_KEY));
  useEffect(() => { reload(); }, []);

  const h = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.assetName.trim()) e.assetName = "Enter asset name";
    if (!form.category)         e.category  = "Select category";
    if (!form.assetDate)        e.assetDate = "Select purchase date";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter valid amount";
    if (!form.remarks.trim())   e.remarks   = "Enter reason/remarks";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    const txnId = form.txnNumber.trim() || genTxnId("AST");
    setTimeout(() => {
      addRecord(ASSETS_KEY, {
        id: Date.now(), txnId,
        assetName: form.assetName, category: form.category,
        assetDate: form.assetDate, amount: Number(form.amount),
        remarks: form.remarks, method: form.method,
        vendor: form.vendor, status: "Paid",
        date: new Date().toISOString().split("T")[0],
      });
      reload(); setSaving(false);
      setToast(txnId);
      setForm({ assetName: "", category: "", assetDate: "", amount: "", remarks: "", method: "Online", txnNumber: "", vendor: "" });
      setErrors({});
      setTimeout(() => setToast(null), 5000);
    }, 800);
  };

  const totalSpent = records.reduce((s, r) => s + (r.amount || 0), 0);
  const filtered = records.filter(r =>
    r.assetName?.toLowerCase().includes(search.toLowerCase()) ||
    r.category?.toLowerCase().includes(search.toLowerCase()) ||
    r.txnId?.toLowerCase().includes(search.toLowerCase())
  );

  const categoryCount = {};
  records.forEach(r => { categoryCount[r.category] = (categoryCount[r.category] || 0) + 1; });
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="w-full font-sans text-left pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Assets Management</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Track institutional asset purchases and expenses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Invested", value: `₹${(totalSpent / 1000).toFixed(1)}K`, icon: TrendingUp },
            { label: "Assets Logged",  value: records.length,                          icon: Package   },
            { label: "Categories",     value: Object.keys(categoryCount).length,       icon: Hash      },
            { label: "Top Category",   value: topCategory,                             icon: FileText  },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                style={{ animation: `fadeIn 0.3s ease ${i * 70}ms both` }}>
                <div className="w-9 h-9 rounded-xl border bg-blue-50 text-blue-600 border-blue-100 flex items-center justify-center mb-3">
                  <Icon size={16}/>
                </div>
                <p className={`font-black text-slate-900 ${s.label === "Top Category" ? "text-sm mt-1" : "text-2xl"}`}>{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-blue-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><Package size={18} className="text-white"/></div>
                <div>
                  <h2 className="text-white font-black text-lg">Add Asset</h2>
                  <p className="text-blue-100 text-xs mt-0.5">Record an asset purchase</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <InputField label="Asset Name" value={form.assetName} onChange={h("assetName")} error={errors.assetName}
                required placeholder="e.g. Dell Laptop, Projector, Lab Table"/>
              <SelectField label="Category" value={form.category} onChange={h("category")} error={errors.category}
                required options={ASSET_CATEGORIES} placeholder="Select asset category"/>

              <div className="grid grid-cols-2 gap-3">
                <InputField label="Purchase Date" value={form.assetDate} onChange={h("assetDate")}
                  error={errors.assetDate} required type="date"/>
                <InputField label="Amount" value={form.amount} onChange={h("amount")} error={errors.amount}
                  required placeholder="0" prefix="₹" type="number"/>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Reason / Remarks <span className="text-red-500">*</span>
                </label>
                <textarea value={form.remarks} onChange={h("remarks")} rows={2}
                  placeholder="Purpose or justification for this purchase..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all resize-none
                    ${errors.remarks ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}/>
                {errors.remarks && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.remarks}</p>}
              </div>

              <InputField label="Vendor / Supplier (Optional)" value={form.vendor} onChange={h("vendor")}
                placeholder="Vendor name or company"/>
              <SelectField label="Payment Method" value={form.method} onChange={h("method")}
                options={["Online", "Offline/Cash", "Cheque", "NEFT/RTGS", "PO/Invoice"]}/>
              <InputField label="Transaction / Invoice Number (Optional)" value={form.txnNumber} onChange={h("txnNumber")}
                placeholder="Enter if already paid"/>

              <button onClick={handleSubmit} disabled={saving}
                className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all
                  ${saving ? "bg-blue-400 text-white cursor-wait" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
                {saving
                  ? <><Loader size={15} className="animate-spin"/>Processing...</>
                  : <><CreditCard size={15}/>Submit Asset</>}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search asset, category, txn..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"/>
              </div>
              <button onClick={reload} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <RefreshCw size={15}/>
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <Package size={40} className="mx-auto text-slate-200 mb-3"/>
                <p className="text-slate-400 font-bold text-sm">No asset records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["Asset", "Category", "Date", "Amount", "Txn ID", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors group"
                        style={{ animation: `fadeIn 0.3s ease ${i * 40}ms both` }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                              <Package size={13}/>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800 max-w-[110px] truncate">{r.assetName}</p>
                              {r.vendor && <p className="text-xs text-slate-400 truncate max-w-[110px]">{r.vendor}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg whitespace-nowrap">
                            {r.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{r.assetDate}</td>
                        <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">₹{r.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{r.txnId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewRec(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={13}/></button>
                            <button onClick={() => { deleteRecord(ASSETS_KEY, r.id); reload(); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
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
      </div>

      {toast && <Toast txnId={toast} onClose={() => setToast(null)}/>}
      {viewRec && <DetailModal record={viewRec} onClose={() => setViewRec(null)}/>}
    </>
  );
};

export default Assets;