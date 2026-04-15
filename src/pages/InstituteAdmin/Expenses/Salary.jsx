import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  CreditCard, CheckCircle, Loader, Plus, Trash2, Eye, X,
  Banknote, TrendingUp, Users, Hash, Search, RefreshCw, Printer, FileText
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const getToken = () => {
  // 1. Check if the token is stored directly
  let token = localStorage.getItem('token');
  
  // 2. If not, check if it's nested inside the user object
  if (!token) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    token = user?.token || user?.data?.token;
  }
  
  return token;
};

// ─── Salary Slip Document (Printable) ─────────────────────────────────────────
const SalarySlip = ({ record, onClose }) => {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2 text-slate-800">
            <FileText size={18} className="text-blue-600" />
            <span className="font-black uppercase tracking-tight text-sm">Salary Slip Preview</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95">
              <Printer size={16} /> Print / Save PDF
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        <div id="salary-slip-content" className="p-10 text-slate-800 bg-white">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-blue-700">ACADEMIC INSTITUTION</h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Official Pay Advice</p>
            </div>
            <div className="text-right">
              <div className="bg-slate-100 px-3 py-1 rounded-lg inline-block mb-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Transaction ID</p>
              </div>
              <p className="font-mono font-bold text-sm text-slate-900">{record.txn_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-10 border-y border-slate-100 py-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Employee Information</p>
              <p className="font-black text-xl text-slate-900">{record.faculty_name}</p>
              <p className="text-md font-bold text-slate-600">{record.designation}</p>
              <p className="text-sm text-slate-500">{record.department}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment Details</p>
              <p className="font-black text-xl text-slate-900">{record.month} {new Date(record.payment_date).getFullYear()}</p>
              <p className="text-md font-bold text-slate-600">Paid via {record.method}{record.online_provider ? ` · ${record.online_provider}` : ""}</p>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-tighter mt-1 flex items-center justify-end gap-1">
                <CheckCircle size={12}/> Disbursed
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b-2 border-slate-900">
              <span className="font-black text-xs uppercase tracking-widest">Description</span>
              <span className="font-black text-xs uppercase tracking-widest">Amount</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-700 font-bold">Base Professional Salary</span>
              <span className="font-black text-slate-900">₹{Number(record.amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 text-slate-400 italic">
              <span className="text-sm">Allowances / Incentives</span>
              <span className="text-sm font-bold">₹0.00</span>
            </div>
            <div className="mt-8 pt-6 border-t-2 border-slate-900 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Net Pay (Rounded)</p>
                <p className="text-[11px] text-slate-500 font-medium italic">Amount in words: Rupees {Number(record.amount).toLocaleString('en-IN')} Only</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-blue-700 tracking-tighter">₹{Number(record.amount).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-24 flex justify-between items-center">
            <div className="text-center">
              <div className="w-32 h-px bg-slate-200 mb-2"></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recipient Signature</p>
            </div>
            <div className="text-center">
              <div className="mb-2 opacity-20 grayscale">
                <CheckCircle size={40} className="mx-auto text-blue-600" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Finance Department</p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-50">
            <p className="text-[8px] text-center text-slate-400 leading-relaxed uppercase tracking-[0.2em]">
              This is a digitally generated payroll advice. No physical signature is required. <br/>
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const Salary = () => {
  const [faculty, setFaculty] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [viewRec, setViewRec] = useState(null);
  const [printRec, setPrintRec] = useState(null);
  
  const [form, setForm] = useState({
    facultyId: "", month: "", amount: "",
    method: "Online Payment", onlineProvider: "GPay", txnNumber: "", note: "",
  });

  const config = { headers: { Authorization: `Bearer ${getToken()}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Faculty
      const facRes = await axios.get("http://localhost:5000/api/admin/faculty", config);
      // Filter strictly for 'Active' faculty based on your DB schema
      const activeFac = (facRes.data.faculty || []).filter(f => !f.status || f.status.toLowerCase() === "active");
      setFaculty(activeFac);

      // Fetch Salary Records
      const salRes = await axios.get("http://localhost:5000/api/admin/salary", config);
      setRecords(salRes.data.records || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const selectedFaculty = faculty.find(f => f.id === Number(form.facultyId));

  const handleSubmit = async () => {
    if (!form.facultyId || !form.month || !form.amount) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.method === "Mark as Paid" && !form.txnNumber.trim()) {
      toast.error("Transaction number is required for manual entries");
      return;
    }

    setSaving(true);
    const txnId = form.method === "Mark as Paid" ? form.txnNumber : `SAL-${Date.now()}`;
    
    const payload = {
      faculty_id: form.facultyId,
      faculty_name: selectedFaculty.name, // Strictly using .name from DB
      designation: selectedFaculty.designation,
      department: selectedFaculty.dept,   // Strictly using .dept from DB
      month: form.month,
      amount: form.amount,
      method: form.method,
      online_provider: form.method === "Online Payment" ? form.onlineProvider : null,
      txn_id: txnId,
      note: form.note,
      payment_date: new Date().toISOString().split('T')[0]
    };

    try {
      await axios.post("http://localhost:5000/api/admin/salary", payload, config);
      toast.success("Salary Disbursed Successfully!");
      setForm({ facultyId: "", month: "", amount: "", method: "Online Payment", onlineProvider: "GPay", txnNumber: "", note: "" });
      fetchData(); // Refresh the table
    } catch (err) {
      toast.error("Transaction Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this salary record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/salary/${id}`, config);
      setRecords(records.filter(r => r.id !== id));
      toast.success("Record Deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const totalPaid = records.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  
  const filtered = records.filter(r => 
    (r.faculty_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (r.txn_id || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.month || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fadeIn  { from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)} }
        
        @media print {
          body > *:not(#salary-slip-content) { display: none !important; }
          #salary-slip-content { 
            display: block !important; 
            position: absolute; 
            left: 0; top: 0; width: 100%;
            padding: 40px !important;
          }
          .fixed { display: none !important; }
          #salary-slip-content { visibility: visible !important; }
        }
      `}</style>

      <div className="w-full font-sans text-left pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Salary Management</h1>
          <p className="text-slate-500 mt-1.5 text-md">Process and track faculty salary payments dynamically</p>
        </div>

        {/* STATS HEADER */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Disbursed", value: `₹${(totalPaid/1000).toFixed(1)}K`, icon: TrendingUp, color: "violet" },
            { label: "Records", value: records.length, icon: Hash, color: "blue" },
            { label: "Active Faculty", value: faculty.length, icon: Users, color: "emerald"},
          ].map((s, i) => {
            const Icon = s.icon;
            const cls = { violet:"bg-violet-50 text-violet-600 border-violet-100", blue:"bg-blue-50 text-blue-600 border-blue-100", emerald:"bg-emerald-50 text-emerald-600 border-emerald-100" }[s.color];
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm" style={{ animation:`fadeIn 0.3s ease ${i*70}ms both` }}>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${cls}`}><Icon size={16}/></div>
                <p className="text-2xl font-black text-slate-900">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT SIDE: PAYMENT FORM */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-left">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-white/20 rounded-xl"><Banknote size={18} className="text-white"/></div>
                <div className="text-left">
                  <h2 className="text-white font-black text-lg">Pay Salary</h2>
                  <p className="text-violet-200 text-sm mt-0.5">Process faculty payment via DB</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Faculty *</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500" value={form.facultyId} onChange={e => setForm({...form, facultyId: e.target.value})}>
                  <option value="">Choose faculty member...</option>
                  {/* Strict mapping to f.name from MySQL */}
                  {faculty.map(f => <option key={f.id} value={f.id}>{f.name} — {f.designation}</option>)}
                </select>
              </div>

              {selectedFaculty && (
                <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-md uppercase">
                    {selectedFaculty.name?.[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-black text-slate-800 text-sm">{selectedFaculty.name}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{selectedFaculty.designation}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Month *</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                  <option value="">Select Month</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Salary Amount *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input type="number" className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500" placeholder="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Payment Method</label>
                <select className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                  <option>Online Payment</option>
                  <option>Mark as Paid</option>
                </select>
              </div>

              {form.method === "Online Payment" && (
                <div className="space-y-1.5 text-left animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select Provider</label>
                  <div className="flex gap-2">
                    {[
                      { id: "GPay", label: "GPay", logo: "https://img.icons8.com/color/96/google-pay.png" },
                      { id: "Paytm", label: "Paytm", logo: "https://img.icons8.com/color/96/paytm.png" },
                    ].map(p => (
                      <button key={p.id} type="button" onClick={() => setForm({...form, onlineProvider: p.id})}
                        className={`flex-1 flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-xl border-2 transition-all
                          ${form.onlineProvider === p.id ? "border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-300" : "bg-white border-slate-200 hover:border-slate-300"}`}>
                        <img src={p.logo} alt={p.label} className="h-9 w-9 object-contain" />
                        <span className={`text-[10px] font-black uppercase tracking-wider ${form.onlineProvider === p.id ? "text-blue-600" : "text-slate-400"}`}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {form.method === "Mark as Paid" && (
                <div className="space-y-1.5 text-left animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction Number *</label>
                  <input type="text" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500" placeholder="Enter existing ID" value={form.txnNumber} onChange={e => setForm({...form, txnNumber: e.target.value})} />
                </div>
              )}

              <button onClick={handleSubmit} disabled={saving || loading}
                className={`w-full py-3.5 rounded-xl font-black text-md flex items-center justify-center gap-2 transition-all mt-4
                  ${saving ? "bg-blue-400 text-white cursor-wait" : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
                {saving ? <><Loader size={15} className="animate-spin"/>Processing...</> : <><CreditCard size={15}/>Disburse Salary</>}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: TABLE */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-fit">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faculty, month, txn..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all" />
              </div>
              <button onClick={fetchData} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                <RefreshCw size={15} className={loading ? "animate-spin" : ""}/>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>{["Faculty","Month","Amount","Txn ID","Actions"].map(h=>(
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading && records.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-blue-400 font-bold"><Loader className="animate-spin mx-auto mb-2"/> Loading Database...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No records found</td></tr>
                  ) : filtered.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors group" style={{ animation:`fadeIn 0.3s ease ${i*40}ms both` }}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{r.faculty_name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{r.department}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-600">{r.month}</td>
                      <td className="px-4 py-3 text-sm font-black text-slate-900">₹{parseFloat(r.amount).toLocaleString()}</td>
                      <td className="px-4 py-3"><span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{r.txn_id}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setPrintRec(r)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Print Slip"><Printer size={13}/></button>
                          <button onClick={() => setViewRec(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={13}/></button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {printRec && <SalarySlip record={printRec} onClose={() => setPrintRec(null)}/>}
      
      {viewRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setViewRec(null)}>
           <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-blue-600 p-6 flex justify-between items-center text-white">
                <span className="font-black uppercase tracking-widest text-[10px]">Record Details</span>
                <button onClick={() => setViewRec(null)}><X size={18}/></button>
             </div>
             <div className="p-6 space-y-4">
               {Object.entries({ Name: viewRec.faculty_name, Month: viewRec.month, Amount: `₹${parseFloat(viewRec.amount).toLocaleString()}`, Method: viewRec.method, ID: viewRec.txn_id }).map(([k,v]) => (
                 <div key={k} className="flex justify-between border-b border-slate-50 pb-2">
                   <span className="text-[10px] font-black text-slate-400 uppercase">{k}</span>
                   <span className="font-bold text-slate-800 text-sm">{v}</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}
    </>
  );
};