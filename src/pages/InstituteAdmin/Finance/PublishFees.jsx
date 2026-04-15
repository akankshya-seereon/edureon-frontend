import { useState, useEffect } from "react";
import {
  Send, Search, Layers, CheckCircle,
  ChevronDown, Check, BookOpen, 
  RefreshCw, Megaphone, Clock, Hash
} from "lucide-react";

// ─── Storage ──────────────────────────────────────────────────────────────────
const FS_KEY = "fee_structures_v3";
const PUB_KEY = "fee_published_v1";

const getFS   = () => { try { return JSON.parse(localStorage.getItem(FS_KEY)  || "[]"); } catch { return []; } };
const saveFS  = (d) => localStorage.setItem(FS_KEY, JSON.stringify(d));
const getPubs = () => { try { return JSON.parse(localStorage.getItem(PUB_KEY) || "[]"); } catch { return []; } };
const savePubs= (d) => localStorage.setItem(PUB_KEY, JSON.stringify(d));

const CLASSES = [
  "B.Tech CSE - Year 1","B.Tech CSE - Year 2","B.Tech CSE - Year 3","B.Tech CSE - Year 4",
  "B.Tech IT - Year 1", "B.Tech IT - Year 2", "B.Tech IT - Year 3", "B.Tech IT - Year 4",
  "B.Tech ECE - Year 1","B.Tech ECE - Year 2","B.Tech ECE - Year 3","B.Tech ECE - Year 4",
  "B.Tech ME - Year 1", "B.Tech ME - Year 2",
  "B.Sc CS - Year 1",   "B.Sc CS - Year 2",   "B.Sc CS - Year 3",
  "B.Sc Math - Year 1", "B.Sc Math - Year 2",  "B.Sc Math - Year 3",
  "BBA - Year 1","BBA - Year 2","BBA - Year 3",
  "MBA - Year 1","MBA - Year 2",
  "MCA - Year 1","MCA - Year 2",
];

const YEARS = ["2024-25","2025-26","2026-27"];

// ✅ HELPER FOR DYNAMIC STYLES
const getStatusStyles = (color) => {
    const styles = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
    };
    return styles[color] || styles.blue;
};

export const PublishFees = () => {
  const [structures,      setStructures]      = useState([]);
  const [selectedFees,    setSelectedFees]    = useState([]);
  const [selectedClass,   setSelectedClass]   = useState("");
  const [selectedYear,    setSelectedYear]    = useState("");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all"); 
  const [publishing,      setPublishing]      = useState(false);
  const [published,       setPublished]       = useState(false);
  const [pubHistory,      setPubHistory]      = useState([]);
  const [tab,             setTab]             = useState("publish"); 
  const [tick,            setTick]            = useState(0);
  
  const reload = () => setTick(t => t + 1);

  useEffect(() => {
    setStructures(getFS());
    setPubHistory(getPubs());
  }, [tick]);

  const filtered = structures.filter(fee => {
    const matchSearch =
      fee.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.feeTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || fee.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const toggleFee = (id) =>
    setSelectedFees(p => p.includes(id) ? p.filter(f => f !== id) : [...p, id]);

  const toggleAll = () =>
    setSelectedFees(selectedFees.length === filtered.length ? [] : filtered.map(f => f.id));

  const handlePublish = () => {
    if (selectedFees.length === 0 || !selectedClass || !selectedYear) return;
    setPublishing(true);

    setTimeout(() => {
      const updatedFS = getFS().map(f =>
        selectedFees.includes(f.id) ? { ...f, status: "Published" } : f
      );
      saveFS(updatedFS);

      const record = {
        id: Date.now(),
        fees: selectedFees.map(id => {
          const f = structures.find(s => s.id === id);
          return { id, feeTitle: f?.feeTitle, course: f?.course, amount: f?.totalAmount };
        }),
        feeCount: selectedFees.length,
        class: selectedClass,
        year: selectedYear,
        publishedAt: new Date().toISOString(),
      };
      savePubs([record, ...getPubs()]);

      setPublishing(false);
      setPublished(true);
      setSelectedFees([]);
      setSelectedClass("");
      setSelectedYear("");
      reload();
      setTimeout(() => { setPublished(false); setTab("history"); }, 1800);
    }, 900);
  };

  const totalPublished  = structures.filter(s => s.status === "Published").length;
  const totalDraft       = structures.filter(s => s.status === "Draft").length;

  return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div className="w-full font-sans text-left pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Publish Fees</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Assign fee structures to classes and academic years</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reload}
              className="p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <RefreshCw size={16} />
            </button>
            <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {[{ key: "publish", label: "Publish", Icon: Send }, { key: "history", label: "History", Icon: Megaphone }].map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all
                    ${tab === key ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Structures", value: structures.length, color: "blue",  Icon: Layers      },
            { label: "Published",        value: totalPublished,    color: "emerald", Icon: CheckCircle },
            { label: "Draft",            value: totalDraft,        color: "amber",   Icon: Clock       },
            { label: "Publish Records",  value: pubHistory.length, color: "blue",    Icon: Megaphone   },
          ].map(({ label, value, color, Icon }, i) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                style={{ animation: `fadeIn 0.3s ease ${i * 70}ms both` }}>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${getStatusStyles(color)}`}>
                    <Icon size={16} />
                </div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
              </div>
          ))}
        </div>

        {tab === "publish" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-black text-slate-900 text-lg">Select Fee Structures</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedFees.length > 0
                        ? <span className="text-blue-600 font-bold">{selectedFees.length} selected</span>
                        : "Choose structures to publish"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {["all", "Draft", "Published"].map(s => (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all
                          ${filterStatus === s ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                        {s === "all" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by course or fee type..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all" />
                </div>
              </div>

              {filtered.length > 0 && (
                <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-3">
                  <button onClick={toggleAll}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${selectedFees.length === filtered.length && filtered.length > 0
                        ? "bg-blue-600 border-blue-600" : "border-slate-300 hover:border-blue-400"}`}>
                    {selectedFees.length === filtered.length && filtered.length > 0 && <Check size={12} className="text-white" />}
                  </button>
                  <span className="text-sm font-bold text-slate-700">Select All ({filtered.length})</span>
                </div>
              )}

              <div className="divide-y divide-slate-50">
                {structures.length === 0 ? (
                  <div className="py-20 text-center">
                    <Layers size={48} className="mx-auto text-slate-200 mb-3" />
                    <p className="text-sm font-bold text-slate-400">No fee structures found</p>
                    <p className="text-xs text-slate-300 mt-1">Create fee structures in Fee Configuration first</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm font-bold text-slate-400">No matching structures</p>
                    <p className="text-xs text-slate-300 mt-1">Try a different search or filter</p>
                  </div>
                ) : (
                  filtered.map((fee, i) => {
                    const isSelected = selectedFees.includes(fee.id);
                    return (
                      <div key={fee.id} onClick={() => toggleFee(fee.id)}
                        className={`px-6 py-4 cursor-pointer transition-all ${isSelected ? "bg-blue-50" : "hover:bg-slate-50"}`}
                        style={{ animation: `fadeIn 0.3s ease ${i * 40}ms both` }}>
                        <div className="flex items-center gap-4">
                          <button
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${isSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                            {isSelected && <Check size={12} className="text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-slate-900">{fee.course}</p>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border
                                ${fee.status === "Published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"}`}>{fee.status}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                                <BookOpen size={10} /> {fee.feeTitle}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                                <Hash size={10} /> {fee.semesters?.length} sem(s): {fee.semesters?.map(s => `S${s}`).join(", ")}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base font-black text-slate-900">₹{Number(fee.totalAmount).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">₹{Number(fee.amountPerSem).toLocaleString()}/sem</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit sticky top-6">
              <h2 className="font-black text-slate-900 text-lg mb-6">Publish To</h2>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Class / Section <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all">
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none appearance-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all">
                      <option value="">Select Year</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {selectedFees.length > 0 && selectedClass && selectedYear ? (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-3">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Ready to Publish</p>
                    <div className="space-y-2">
                      {[
                        { label: "Fees",  value: `${selectedFees.length} selected`},
                        { label: "Class", value: selectedClass },
                        { label: "Year",  value: selectedYear  },
                        {
                          label: "Total Value",
                          value: `₹${selectedFees.reduce((s, id) => {
                            const f = structures.find(x => x.id === id);
                            return s + (f?.totalAmount || 0);
                          }, 0).toLocaleString()}`
                        },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between text-xs">
                          <span className="text-blue-600 font-semibold">{r.label}</span>
                          <span className="text-blue-900 font-black">{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-xs font-semibold text-amber-700">
                      {selectedFees.length === 0
                        ? "Select at least one fee structure to publish"
                        : !selectedClass
                        ? "Select a class / section"
                        : "Select an academic year"}
                    </p>
                  </div>
                )}

                <button onClick={handlePublish}
                  disabled={selectedFees.length === 0 || !selectedClass || !selectedYear || publishing || published}
                  className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all
                    ${published   ? "bg-emerald-500 text-white"
                    : publishing ? "bg-blue-400 text-white cursor-wait"
                    : selectedFees.length === 0 || !selectedClass || !selectedYear
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 active:scale-[0.98]"}`}>
                  {published   ? <><CheckCircle size={16} /> Published!</>
                  : publishing ? "Publishing..."
                  : <><Send size={16} /> Publish {selectedFees.length > 0 ? `(${selectedFees.length})` : ""} Fees</>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-black text-slate-800">Publish History</h3>
              <p className="text-xs text-slate-400 mt-0.5">{pubHistory.length} publish record{pubHistory.length !== 1 ? "s" : ""}</p>
            </div>

            {pubHistory.length === 0 ? (
              <div className="py-20 text-center">
                <Megaphone size={48} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-400 font-bold">No publish history yet</p>
                <p className="text-slate-300 text-sm mt-1">Published fees will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pubHistory.map((p, i) => (
                  <div key={p.id} className="px-6 py-4 hover:bg-slate-50 transition-colors"
                    style={{ animation: `fadeIn 0.3s ease ${i * 40}ms both` }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={10} /> Published
                          </span>
                          <span className="text-xs font-bold text-slate-500">{p.class}</span>
                          <span className="text-xs font-bold text-slate-400">· {p.year}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(p.fees || []).map(f => (
                            <span key={f.id} className="text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-lg">
                              {f.feeTitle} — ₹{Number(f.amount).toLocaleString()}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-black text-slate-700">{p.feeCount} fee{p.feeCount !== 1 ? "s" : ""}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(p.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PublishFees;