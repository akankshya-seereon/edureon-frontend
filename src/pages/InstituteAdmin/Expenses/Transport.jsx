import React, { useState, useEffect } from "react";
import {
  ChevronDown, CheckCircle, Loader, Trash2, Eye, Copy, X,
  AlertCircle, TrendingUp, Hash, Search, RefreshCw,
  CreditCard, Check, Bus, FileText
} from "lucide-react";
import {
  TRANSPORT_KEY, getRecords, addRecord, deleteRecord, genTxnId
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
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Transport Paid</p>
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
          <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest">Transport Record</p>
          <p className="text-white font-black text-lg mt-0.5">{record.vehicle}</p>
        </div>
        <button onClick={onClose} className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl">
          <X size={18}/>
        </button>
      </div>
      <div className="p-6 space-y-3">
        {[
          { label: "Txn ID",  value: record.txnId },
          { label: "Vehicle", value: record.vehicle },
          { label: "Remarks", value: record.remarks },
          { label: "Amount",  value: `₹${Number(record.amount).toLocaleString()}` },
          { label: "Method",  value: record.method },
          { label: "Status",  value: record.status },
          { label: "Date",    value: record.date },
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

const VEHICLE_TYPES = [
  "School Bus", "College Van", "Mini Bus", "Car/Cab", "Auto Rickshaw",
  "Tempo Traveller", "Truck", "Ambulance", "Other Vehicle",
];

export const Transport = () => {
  const [records, setRecords] = useState([]);
  const [search, setSearch]   = useState("");
  const [toast, setToast]     = useState(null);
  const [viewRec, setViewRec] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  const [form, setForm] = useState({
    vehicle: "", customVehicle: "", amount: "", remarks: "", method: "Online", txnNumber: ""
  });

  const reload = () => setRecords(getRecords(TRANSPORT_KEY));
  useEffect(() => { reload(); }, []);

  const h = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    const veh = form.vehicle === "Other Vehicle" ? form.customVehicle : form.vehicle;
    if (!veh.trim())          e.vehicle = "Enter vehicle details";
    if (!form.remarks.trim()) e.remarks = "Enter reason/remarks";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    const txnId = form.txnNumber.trim() || genTxnId("TRP");
    const vehicleName = form.vehicle === "Other Vehicle" ? form.customVehicle : form.vehicle;
    setTimeout(() => {
      addRecord(TRANSPORT_KEY, {
        id: Date.now(), txnId, vehicle: vehicleName,
        remarks: form.remarks, amount: Number(form.amount),
        method: form.method, status: "Paid",
        date: new Date().toISOString().split("T")[0],
      });
      reload(); setSaving(false);
      setToast(txnId);
      setForm({ vehicle: "", customVehicle: "", amount: "", remarks: "", method: "Online", txnNumber: "" });
      setErrors({});
      setTimeout(() => setToast(null), 5000);
    }, 800);
  };

  const totalSpent = records.reduce((s, r) => s + (r.amount || 0), 0);
  const filtered = records.filter(r =>
    r.vehicle?.toLowerCase().includes(search.toLowerCase()) ||
    r.remarks?.toLowerCase().includes(search.toLowerCase()) ||
    r.txnId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="w-full font-sans text-left pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Transport Expenses</h1>
          <p className="text-slate-500 mt-1.5 text-sm">Manage vehicle and transportation costs</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Spent", value: `₹${(totalSpent / 1000).toFixed(1)}K`, icon: TrendingUp, color: "blue"  },
            { label: "Records",     value: records.length,                          icon: Hash,       color: "blue"  },
            { label: "Vehicles",    value: new Set(records.map(r => r.vehicle)).size, icon: FileText, color: "blue"  },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                style={{ animation: `fadeIn 0.3s ease ${i * 70}ms both` }}>
                <div className="w-9 h-9 rounded-xl border bg-blue-50 text-blue-600 border-blue-100 flex items-center justify-center mb-3">
                  <Icon size={16}/>
                </div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
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
                <div className="p-2 bg-white/20 rounded-xl"><Bus size={18} className="text-white"/></div>
                <div>
                  <h2 className="text-white font-black text-lg">Add Transport</h2>
                  <p className="text-blue-100 text-xs mt-0.5">Log a transport expense</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <SelectField label="Vehicle Type" value={form.vehicle} onChange={h("vehicle")} error={errors.vehicle}
                required options={VEHICLE_TYPES} placeholder="Select vehicle"/>

              {form.vehicle === "Other Vehicle" && (
                <InputField label="Specify Vehicle" value={form.customVehicle} onChange={h("customVehicle")}
                  error={errors.vehicle} required placeholder="Enter vehicle name/number"/>
              )}

              {form.vehicle && form.vehicle !== "Other Vehicle" && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl text-white"><Bus size={14}/></div>
                  <p className="text-sm font-bold text-blue-800">{form.vehicle}</p>
                </div>
              )}

              <InputField label="Amount" value={form.amount} onChange={h("amount")} error={errors.amount}
                required placeholder="0" prefix="₹" type="number"/>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Reason / Remarks <span className="text-red-500">*</span>
                </label>
                <textarea value={form.remarks} onChange={h("remarks")} rows={2}
                  placeholder="Route, purpose, or additional remarks..."
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all resize-none
                    ${errors.remarks ? "border-red-400 bg-red-50" : "border-slate-200 bg-slate-50 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white"}`}/>
                {errors.remarks && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10}/>{errors.remarks}</p>
                )}
              </div>

              <SelectField label="Payment Method" value={form.method} onChange={h("method")}
                options={["Online", "Offline/Cash", "Cheque", "UPI", "Fuel Card"]}/>
              <InputField label="Transaction Number (Optional)" value={form.txnNumber} onChange={h("txnNumber")}
                placeholder="Enter if already paid"/>

              <button onClick={handleSubmit} disabled={saving}
                className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all
                  ${saving ? "bg-blue-400 text-white cursor-wait" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
                {saving
                  ? <><Loader size={15} className="animate-spin"/>Processing...</>
                  : <><CreditCard size={15}/>Submit Payment</>}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search vehicle, remarks, txn..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"/>
              </div>
              <button onClick={reload} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                <RefreshCw size={15}/>
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="py-20 text-center">
                <Bus size={40} className="mx-auto text-slate-200 mb-3"/>
                <p className="text-slate-400 font-bold text-sm">No transport records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>{["Vehicle", "Remarks", "Amount", "Method", "Txn ID", ""].map(h => (
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
                              <Bus size={13}/>
                            </div>
                            <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{r.vehicle}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] truncate">{r.remarks}</td>
                        <td className="px-4 py-3 text-sm font-black text-slate-900 whitespace-nowrap">₹{r.amount?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{r.method}</td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{r.txnId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setViewRec(r)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={13}/></button>
                            <button onClick={() => { deleteRecord(TRANSPORT_KEY, r.id); reload(); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
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

export default Transport;