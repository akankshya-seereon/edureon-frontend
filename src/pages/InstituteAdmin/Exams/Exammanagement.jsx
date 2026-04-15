import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════ */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #f5f6fa; color: #1a1d23; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #d0d5e0; border-radius: 4px; }
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
    @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
    @keyframes popIn   { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
    @keyframes toastIn { from { opacity:0; transform:translateY(-16px) scale(.96); } to { opacity:1; transform:translateY(0) scale(1); } }
    .fade-up  { animation: fadeUp .3s ease both; }
    .pop-in   { animation: popIn .2s ease both; }
    .toast-in { animation: toastIn .3s cubic-bezier(.34,1.56,.64,1) both; }
    .card-h { transition: box-shadow .2s, transform .2s; }
    .card-h:hover { box-shadow: 0 8px 28px rgba(0,0,0,.1); transform: translateY(-2px); }
    .nav-i { transition: background .15s, color .15s; }
    .btn-a { transition: filter .15s, box-shadow .15s, transform .1s; }
    .btn-a:hover:not(:disabled) { filter: brightness(1.06); box-shadow: 0 4px 16px rgba(26,86,219,.28); transform: translateY(-1px); }
    .btn-a:active:not(:disabled) { transform: translateY(0); }
    .row-h:hover { background: #f8faff !important; }
    .tab-l { transition: color .15s, border-color .15s; }
    select, input, textarea { font-family: 'DM Sans', sans-serif; }
  `}</style>
);

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════════════════════ */
const BLUE = "#1a56db";
const KEYS = { EXAMS:"em_exams_v2", RESULTS:"em_results_v2", QUESTIONS:"em_questions_v2" };

const SEM_OPTS   = [1,2,3,4,5,6,7,8].map(n=>({value:String(n),label:`Semester ${n}`}));
const BATCH_OPTS = ["A","B","C","D"].map(v=>({value:v,label:`Batch ${v}`}));
const YR         = new Date().getFullYear();
const YEAR_OPTS  = Array.from({length:8},(_,i)=>({value:String(YR-i),label:String(YR-i)}));
const SUBJ_OPTS  = ["Mathematics","Physics","Chemistry","Biology","Computer Science","English",
                    "Data Structures","DBMS","Operating Systems","Networks","Software Engineering"]
                   .map(v=>({value:v,label:v}));
const EXAM_TYPE_OPTS = [
  {value:"INTERNAL",label:"Internal"},{value:"MIDTERM",label:"Mid-Term"},
  {value:"FINAL",label:"Final / End-Term"},{value:"EXTERNAL",label:"External"},
  {value:"PRACTICAL",label:"Practical"},{value:"VIVA",label:"Viva / Oral"},
];
const DUR_OPTS = [
  {value:"30",label:"30 min"},{value:"60",label:"1 hr"},{value:"90",label:"1.5 hrs"},
  {value:"120",label:"2 hrs"},{value:"150",label:"2.5 hrs"},{value:"180",label:"3 hrs"},
];
const QTYPE_OPTS = [
  {value:"MCQ",label:"Multiple Choice"},{value:"SHORT",label:"Short Answer"},
  {value:"LONG",label:"Long Answer"},{value:"TRUE_FALSE",label:"True / False"},
  {value:"FILL_BLANK",label:"Fill in Blank"},
];
const DIFF_OPTS = [{value:"EASY",label:"Easy"},{value:"MEDIUM",label:"Medium"},{value:"HARD",label:"Hard"}];
const STATUS_META = {
  UPCOMING:  {label:"Upcoming",  dot:"#3b82f6",bg:"#eff6ff",color:"#1d4ed8"},
  ONGOING:   {label:"Live",      dot:"#22c55e",bg:"#f0fdf4",color:"#15803d"},
  COMPLETED: {label:"Completed", dot:"#94a3b8",bg:"#f1f5f9",color:"#475569"},
};
const DIFF_C = {
  EASY:  {bg:"#f0fdf4",c:"#15803d"},
  MEDIUM:{bg:"#fefce8",c:"#a16207"},
  HARD:  {bg:"#fef2f2",c:"#dc2626"},
};
const STUDENTS = [
  {id:"S001",name:"Aarav Sharma",roll:"101"},{id:"S002",name:"Priya Patel",roll:"102"},
  {id:"S003",name:"Rohit Kumar",roll:"103"},{id:"S004",name:"Sneha Verma",roll:"104"},
  {id:"S005",name:"Arjun Singh",roll:"105"},{id:"S006",name:"Meera Nair",roll:"106"},
  {id:"S007",name:"Karan Mehta",roll:"107"},{id:"S008",name:"Divya Reddy",roll:"108"},
  {id:"S009",name:"Vivek Joshi",roll:"109"},{id:"S010",name:"Ananya Iyer",roll:"110"},
];
const AV_COLS = [
  ["#ede9fe","#7c3aed"],["#dbeafe","#1d4ed8"],["#fce7f3","#be185d"],["#dcfce7","#15803d"],
  ["#fef3c7","#b45309"],["#e0f2fe","#0369a1"],["#f3e8ff","#9333ea"],["#d1fae5","#065f46"],
  ["#ffe4e6","#be123c"],["#ecfeff","#0e7490"],
];
const examStatus = (date,time,dur)=>{
  if(!date||!time) return "UPCOMING";
  const now=new Date(),s=new Date(`${date}T${time}`),e=new Date(s.getTime()+Number(dur)*60000);
  if(now<s) return "UPCOMING"; if(now<=e) return "ONGOING"; return "COMPLETED";
};
const fmtDate = d=>d?new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fmtTime = t=>{if(!t)return"—";const[h,m]=t.split(":"),hr=parseInt(h);return`${hr>12?hr-12:hr||12}:${m} ${hr>=12?"PM":"AM"}`;};
const avatarC  = id=>AV_COLS[parseInt(id.replace(/\D/g,""))%AV_COLS.length];
const initials = name=>name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
const calcGrade=(m,t)=>{const p=(m/t)*100;
  if(p>=90)return{g:"O",c:"#7c3aed"};if(p>=80)return{g:"A+",c:"#2563eb"};
  if(p>=70)return{g:"A",c:"#16a34a"};if(p>=60)return{g:"B+",c:"#0d9488"};
  if(p>=50)return{g:"B",c:"#ca8a04"};if(p>=40)return{g:"C",c:"#ea580c"};
  return{g:"F",c:"#dc2626"};
};

/* ═══════════════════════════════════════════════════════════════════
   STORAGE HOOK
═══════════════════════════════════════════════════════════════════ */
const useStorage=(key,init)=>{
  const[data,setData]=useState(init);
  useEffect(()=>{try{const r=localStorage.getItem(key);if(r)setData(JSON.parse(r));}catch(_){}},[key]);
  const save=useCallback(val=>{const next=typeof val==="function"?val(data):val;setData(next);
    try{localStorage.setItem(key,JSON.stringify(next));}catch(_){} return next;},[key,data]);
  return[data,save];
};

/* ═══════════════════════════════════════════════════════════════════
   UI ATOMS
═══════════════════════════════════════════════════════════════════ */
const ARROW=`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E")`;
const iBase=err=>({width:"100%",border:`1.5px solid ${err?"#fca5a5":"#e2e5ed"}`,borderRadius:9,
  padding:"9px 13px",fontSize:13.5,outline:"none",fontFamily:"inherit",
  background:err?"#fff5f5":"#fff",color:"#111827",transition:"border-color .15s,box-shadow .15s"});
const onF=e=>{e.target.style.borderColor=BLUE;e.target.style.boxShadow="0 0 0 3px rgba(26,86,219,.1)";};
const onB=(e,err)=>{e.target.style.borderColor=err?"#fca5a5":"#e2e5ed";e.target.style.boxShadow="none";};

const Label=({children,req,hint})=>(
  <label style={{fontSize:13,fontWeight:600,color:"#374151",display:"block",marginBottom:5}}>
    {children}{req&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}
    {hint&&<span style={{fontSize:11,color:"#9ca3af",fontWeight:400,marginLeft:6}}>({hint})</span>}
  </label>
);
const ErrMsg=({msg})=>msg?<p style={{fontSize:11,color:"#ef4444",marginTop:3}}>{msg}</p>:null;
const Field=({children,err,style})=><div style={style}>{children}<ErrMsg msg={err}/></div>;

const Input=({value,onChange,placeholder,type="text",min,max,disabled,err,id})=>(
  <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} max={max} disabled={disabled}
    style={{...iBase(err),...(disabled?{background:"#f9fafb",color:"#9ca3af",cursor:"not-allowed"}:{})}}
    onFocus={onF} onBlur={e=>onB(e,err)}/>
);
const Sel=({value,onChange,options,placeholder,disabled,err})=>(
  <select value={value} onChange={onChange} disabled={disabled}
    style={{...iBase(err),cursor:disabled?"not-allowed":"pointer",backgroundImage:ARROW,
      backgroundRepeat:"no-repeat",backgroundPosition:"right 11px center",paddingRight:32,appearance:"none",
      ...(disabled?{background:"#f9fafb",color:"#9ca3af"}:{})}}
    onFocus={onF} onBlur={e=>onB(e,err)}>
    <option value="">{placeholder}</option>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
const FSel=({value,onChange,options,placeholder})=>(
  <select value={value} onChange={onChange}
    style={{border:"1.5px solid #e2e5ed",borderRadius:8,padding:"7px 30px 7px 11px",fontSize:13,
      background:"#fff",color:"#374151",outline:"none",cursor:"pointer",fontFamily:"inherit",
      appearance:"none",backgroundImage:ARROW,backgroundRepeat:"no-repeat",backgroundPosition:"right 9px center"}}>
    <option value="">{placeholder}</option>
    {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);
const Grid=({children,cols=2,gap=14})=>(
  <div style={{display:"grid",gridTemplateColumns:`repeat(${cols},1fr)`,gap,marginBottom:gap}}>{children}</div>
);
const SecBlock=({title,children})=>(
  <div style={{marginBottom:26}}>
    <p style={{fontSize:10.5,fontWeight:700,color:"#b0b8cc",textTransform:"uppercase",letterSpacing:1.1,
               marginBottom:14,paddingBottom:10,borderBottom:"1px solid #f1f3f8"}}>{title}</p>
    {children}
  </div>
);
const Pill=({label,bg,color})=>(
  <span style={{background:bg,color,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{label}</span>
);
const StatCard=({icon,value,label,bg})=>(
  <div style={{background:"#fff",borderRadius:14,border:"1px solid #eaecf3",padding:"18px 20px",
               display:"flex",alignItems:"center",gap:14,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
    <div style={{width:46,height:46,borderRadius:12,background:bg,display:"flex",alignItems:"center",
                 justifyContent:"center",fontSize:20,flexShrink:0}}>{icon}</div>
    <div>
      <p style={{fontSize:26,fontWeight:700,color:"#0f172a",lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{value}</p>
      <p style={{fontSize:12.5,color:"#6b7280",marginTop:3}}>{label}</p>
    </div>
  </div>
);
const Modal=({open,onClose,title,children})=>!open?null:(
  <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(15,23,42,.45)",
    display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,backdropFilter:"blur(3px)"}}>
    <div className="pop-in" onClick={e=>e.stopPropagation()}
      style={{background:"#fff",borderRadius:18,padding:"28px 32px",width:420,maxWidth:"92vw",
              boxShadow:"0 24px 64px rgba(0,0,0,.2)"}}>
      {title&&<h3 style={{fontSize:17,fontWeight:700,color:"#0f172a",marginBottom:8}}>{title}</h3>}
      {children}
    </div>
  </div>
);
const Toast=({toast,onClose})=>!toast?null:(
  <div className="toast-in" style={{position:"fixed",top:22,right:22,zIndex:10000,display:"flex",
    alignItems:"center",gap:10,padding:"13px 18px",borderRadius:12,fontSize:13,fontWeight:500,
    boxShadow:"0 8px 28px rgba(0,0,0,.13)",
    background:toast.type==="success"?"#f0fdf4":"#fef2f2",
    border:`1.5px solid ${toast.type==="success"?"#bbf7d0":"#fecaca"}`,
    color:toast.type==="success"?"#15803d":"#dc2626",maxWidth:320}}>
    <span style={{fontSize:16}}>{toast.type==="success"?"✓":"✕"}</span>
    <span style={{flex:1}}>{toast.msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"inherit",opacity:.5,fontSize:20,lineHeight:1}}>×</button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════════════════════ */
const NAV=[
  {id:"exams",    label:"Exam Management",icon:"🎓"},
  {id:"schedule", label:"Schedule Exam",  icon:"📅"},
  {id:"questions",label:"Question Bank",  icon:"📚"},
  {id:"results",  label:"Results",        icon:"📊"},
];
const Sidebar=({active,onNav})=>(
  <div style={{width:240,minHeight:"100vh",background:"#0f172a",display:"flex",flexDirection:"column",flexShrink:0}}>
    <div style={{padding:"22px 20px 18px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:10,background:BLUE,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎓</div>
        <div>
          <p style={{color:"#fff",fontSize:15,fontWeight:700,lineHeight:1.2}}>EduERP</p>
          <p style={{color:"rgba(255,255,255,.4)",fontSize:10,fontWeight:500,letterSpacing:.5}}>EXAM MODULE</p>
        </div>
      </div>
    </div>
    <nav style={{padding:"14px 10px",flex:1}}>
      <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.25)",letterSpacing:1.2,
                 textTransform:"uppercase",padding:"0 10px",marginBottom:8}}>Navigation</p>
      {NAV.map(item=>{
        const isA=active===item.id;
        return(
          <button key={item.id} className="nav-i" onClick={()=>onNav(item.id)}
            style={{width:"100%",display:"flex",alignItems:"center",gap:11,padding:"10px 12px",
              borderRadius:10,border:"none",cursor:"pointer",textAlign:"left",marginBottom:2,
              background:isA?BLUE:"transparent",color:isA?"#fff":"rgba(255,255,255,.55)",
              fontSize:13.5,fontWeight:isA?600:400}}>
            <span style={{fontSize:16}}>{item.icon}</span>{item.label}
          </button>
        );
      })}
    </nav>
    <div style={{padding:"14px 20px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:32,height:32,borderRadius:8,background:BLUE,display:"flex",alignItems:"center",
                     justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700}}>A</div>
        <div>
          <p style={{color:"#fff",fontSize:12.5,fontWeight:600}}>Admin</p>
          <p style={{color:"rgba(255,255,255,.35)",fontSize:11}}>Institute Admin</p>
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════════════════ */
const TITLES={
  exams:    {title:"Exam Management",sub:"Schedule, manage and track all examinations"},
  schedule: {title:"Schedule Exam",  sub:"Create a new exam entry"},
  questions:{title:"Question Bank",  sub:"Create and manage exam questions"},
  results:  {title:"Exam Results",   sub:"Enter and manage student marks"},
};
const Topbar=({view,extra})=>{
  const info=TITLES[view]||TITLES.exams;
  return(
    <div style={{background:"#fff",borderBottom:"1px solid #eaecf3",padding:"14px 28px",
                 display:"flex",alignItems:"center",justifyContent:"space-between",
                 position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      <div>
        <p style={{fontSize:17,fontWeight:700,color:"#0f172a",lineHeight:1.2}}>{info.title}</p>
        <p style={{fontSize:12,color:"#9ca3af",marginTop:3}}>{info.sub}</p>
      </div>
      {extra}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   EXAM LIST
═══════════════════════════════════════════════════════════════════ */
const ExamList=({exams,onNav,onDelete})=>{
  const[filters,setF]=useState({semester:"",batch:"",year:"",status:""});
  const[delId,setDelId]=useState(null);
  const sf=f=>e=>setF(p=>({...p,[f]:e.target.value}));
  const enriched=exams.map(ex=>({...ex,_s:examStatus(ex.examDate,ex.startTime,ex.duration)}));
  const filtered=enriched.filter(ex=>{
    if(filters.semester&&ex.semester!==filters.semester)return false;
    if(filters.batch&&ex.batch!==filters.batch)return false;
    if(filters.year&&ex.year!==filters.year)return false;
    if(filters.status&&ex._s!==filters.status)return false;
    return true;
  });
  const total=enriched.length,upcoming=enriched.filter(e=>e._s==="UPCOMING").length,
        ongoing=enriched.filter(e=>e._s==="ONGOING").length,completed=enriched.filter(e=>e._s==="COMPLETED").length;
  return(
    <div className="fade-up">
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
        <StatCard icon="📋" value={total}     label="Total Exams" bg="#eff6ff"/>
        <StatCard icon="🗓" value={upcoming}  label="Upcoming"    bg="#f0f9ff"/>
        <StatCard icon="⏳" value={ongoing}   label="Ongoing"     bg="#f0fdf4"/>
        <StatCard icon="✅" value={completed} label="Completed"   bg="#f8fafc"/>
      </div>

      {/* Filter + Action bar */}
      <div style={{background:"#fff",borderRadius:12,border:"1px solid #eaecf3",
                   padding:"13px 18px",marginBottom:18,display:"flex",
                   flexWrap:"wrap",gap:10,alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
        <span style={{fontSize:13,fontWeight:600,color:"#374151"}}>Filter:</span>
        <FSel value={filters.semester} onChange={sf("semester")} options={SEM_OPTS}   placeholder="All Semesters"/>
        <FSel value={filters.batch}    onChange={sf("batch")}    options={BATCH_OPTS} placeholder="All Batches"/>
        <FSel value={filters.year}     onChange={sf("year")}     options={YEAR_OPTS}  placeholder="All Years"/>
        <FSel value={filters.status}   onChange={sf("status")}
          options={[{value:"UPCOMING",label:"Upcoming"},{value:"ONGOING",label:"Live"},{value:"COMPLETED",label:"Completed"}]}
          placeholder="All Status"/>
        {Object.values(filters).some(Boolean)&&(
          <button onClick={()=>setF({semester:"",batch:"",year:"",status:""})}
            style={{fontSize:12,color:"#ef4444",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>
            Clear ×
          </button>
        )}
        {/* ── TABS: Schedule Exam → Question Bank → Results ── */}
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button className="btn-a" onClick={()=>onNav("schedule")}
            style={{padding:"8px 18px",background:BLUE,color:"#fff",border:"none",
                    borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            + Schedule Exam
          </button>
          <button onClick={()=>onNav("questions")}
            style={{padding:"8px 14px",background:"#f8fafc",color:"#374151",
                    border:"1.5px solid #e2e5ed",borderRadius:9,fontSize:13,fontWeight:500,cursor:"pointer"}}>
            📚 Question Bank
          </button>
          <button onClick={()=>onNav("results")}
            style={{padding:"8px 14px",background:"#f8fafc",color:"#374151",
                    border:"1.5px solid #e2e5ed",borderRadius:9,fontSize:13,fontWeight:500,cursor:"pointer"}}>
            📊 Results
          </button>
        </div>
      </div>

      {/* Cards or Empty */}
      {filtered.length===0?(
        <div style={{background:"#fff",borderRadius:14,border:"1px solid #eaecf3",padding:"60px 32px",textAlign:"center"}}>
          <p style={{fontSize:42,marginBottom:14}}>📭</p>
          <p style={{fontSize:15,fontWeight:600,color:"#374151"}}>
            {exams.length===0?"No exams scheduled yet":"No exams match filters"}
          </p>
          <p style={{fontSize:13,color:"#9ca3af",marginTop:4}}>
            {exams.length===0?"Click '+ Schedule Exam' to get started":"Try adjusting the filters"}
          </p>
          {exams.length===0&&(
            <button className="btn-a" onClick={()=>onNav("schedule")}
              style={{marginTop:18,padding:"10px 24px",background:BLUE,color:"#fff",
                      border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>
              + Schedule Exam
            </button>
          )}
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
          {filtered.map((ex,idx)=>{
            const sm=STATUS_META[ex._s];
            return(
              <div key={ex.id} className="card-h"
                style={{background:"#fff",borderRadius:14,border:"1px solid #eaecf3",
                        padding:"20px 22px",animationDelay:`${idx*30}ms`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                  <div style={{flex:1,marginRight:8}}>
                    <p style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>{ex.title}</p>
                    <p style={{fontSize:12,color:"#9ca3af",marginTop:3}}>
                      {ex.subject} · {EXAM_TYPE_OPTS.find(o=>o.value===ex.examType)?.label||ex.examType}
                    </p>
                  </div>
                  <span style={{background:sm.bg,color:sm.color,fontSize:11,fontWeight:600,
                                padding:"4px 11px",borderRadius:20,display:"flex",
                                alignItems:"center",gap:5,whiteSpace:"nowrap",flexShrink:0}}>
                    <span style={{width:6,height:6,borderRadius:3,background:sm.dot,display:"inline-block"}}/>
                    {sm.label}
                  </span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
                  {[{l:"Semester",v:`Sem ${ex.semester}`},{l:"Batch",v:`Batch ${ex.batch}`},{l:"Year",v:ex.year},
                    {l:"Date",v:fmtDate(ex.examDate)},{l:"Time",v:fmtTime(ex.startTime)},
                    {l:"Duration",v:DUR_OPTS.find(d=>d.value===ex.duration)?.label||ex.duration+"m"}
                  ].map(({l,v})=>(
                    <div key={l} style={{background:"#f8fafc",borderRadius:8,padding:"8px 10px"}}>
                      <p style={{fontSize:10,color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:.3}}>{l}</p>
                      <p style={{fontSize:12.5,fontWeight:600,color:"#374151",marginTop:2}}>{v}</p>
                    </div>
                  ))}
                </div>
                <p style={{fontSize:13,color:"#6b7280",marginBottom:14,borderTop:"1px solid #f3f4f6",paddingTop:12}}>
                  Total: <strong style={{color:"#0f172a"}}>{ex.totalMarks}</strong>
                  <span style={{margin:"0 8px",color:"#e5e7eb"}}>|</span>
                  Passing: <strong style={{color:"#0f172a"}}>{ex.passingMarks}</strong>
                </p>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={()=>onNav("results",{examId:ex.id})}
                    style={{flex:1,padding:"7px",background:"#eff6ff",color:"#1d4ed8",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    📊 Results
                  </button>
                  <button onClick={()=>onNav("questions",{semester:ex.semester,batch:ex.batch,year:ex.year})}
                    style={{flex:1,padding:"7px",background:"#f5f3ff",color:"#6d28d9",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    📚 Questions
                  </button>
                  <button onClick={()=>onNav("schedule",{exam:ex})}
                    style={{flex:1,padding:"7px",background:"#f8fafc",color:"#475569",border:"none",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                    ✏️ Edit
                  </button>
                  <button onClick={()=>setDelId(ex.id)}
                    style={{padding:"7px 11px",background:"#fff1f2",color:"#e11d48",border:"none",borderRadius:8,fontSize:13,cursor:"pointer"}}>
                    🗑
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!delId} onClose={()=>setDelId(null)} title="Delete Exam?">
        <p style={{fontSize:13,color:"#6b7280",marginBottom:24}}>This will permanently remove the exam. Cannot be undone.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setDelId(null)} style={{flex:1,padding:"10px",border:"1.5px solid #e2e5ed",borderRadius:9,fontSize:13,cursor:"pointer",background:"#fff",color:"#374151"}}>Cancel</button>
          <button onClick={()=>{onDelete(delId);setDelId(null);}} style={{flex:1,padding:"10px",background:"#ef4444",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",color:"#fff"}}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   SCHEDULE EXAM FORM
═══════════════════════════════════════════════════════════════════ */
const EMPTY_EXAM={title:"",subject:"",examType:"",semester:"",batch:"",year:"",
  examDate:"",startTime:"",duration:"",totalMarks:"",passingMarks:"",venue:"",instructions:""};

const ExamForm=({editExam,onSave,onBack})=>{
  const[form,setForm]=useState(editExam?{...editExam}:{...EMPTY_EXAM});
  const[errors,setErr]=useState({});
  const[saving,setSaving]=useState(false);
  const set=f=>e=>{setForm(p=>({...p,[f]:e.target.value}));if(errors[f])setErr(p=>{const x={...p};delete x[f];return x;});};

  useEffect(()=>{
    if(!editExam&&form.subject&&form.examType&&!form.title){
      const tl=EXAM_TYPE_OPTS.find(o=>o.value===form.examType)?.label||"";
      setForm(p=>({...p,title:`${form.subject} - ${tl}`}));
    }
  },[form.subject,form.examType]);

  const validate=()=>{
    const e={};
    ["title","subject","examType","semester","batch","year","examDate","startTime","duration","totalMarks","passingMarks"]
      .forEach(f=>{if(!form[f])e[f]="Required";});
    if(form.totalMarks&&form.passingMarks&&Number(form.passingMarks)>Number(form.totalMarks))
      e.passingMarks="Cannot exceed total marks";
    return e;
  };

  const handleSave=async()=>{
    const e=validate();setErr(e);
    if(Object.keys(e).length>0)return;
    setSaving(true);await new Promise(r=>setTimeout(r,380));
    onSave(form,editExam?.id);setSaving(false);
  };

  return(
    <div className="fade-up">
      <div style={{background:"#fff",borderRadius:16,border:"1px solid #eaecf3",
                   padding:"28px 32px",maxWidth:760,boxShadow:"0 2px 10px rgba(0,0,0,.05)"}}>
        <SecBlock title="Exam Identity">
          <Grid>
            <Field err={errors.subject}><Label req>Subject</Label><Sel value={form.subject} onChange={set("subject")} options={SUBJ_OPTS} placeholder="Select Subject" err={errors.subject}/></Field>
            <Field err={errors.examType}><Label req>Exam Type</Label><Sel value={form.examType} onChange={set("examType")} options={EXAM_TYPE_OPTS} placeholder="Select Type" err={errors.examType}/></Field>
          </Grid>
          <Field err={errors.title}><Label req>Exam Title</Label><Input value={form.title} onChange={set("title")} placeholder="e.g. Mathematics - Mid-Term Exam" err={errors.title}/></Field>
        </SecBlock>
        <SecBlock title="Target Group">
          <Grid cols={3}>
            <Field err={errors.semester}><Label req>Semester</Label><Sel value={form.semester} onChange={set("semester")} options={SEM_OPTS} placeholder="Select" err={errors.semester}/></Field>
            <Field err={errors.batch}><Label req>Batch</Label><Sel value={form.batch} onChange={set("batch")} options={BATCH_OPTS} placeholder="Select" err={errors.batch}/></Field>
            <Field err={errors.year}><Label req>Year</Label><Sel value={form.year} onChange={set("year")} options={YEAR_OPTS} placeholder="Select" err={errors.year}/></Field>
          </Grid>
        </SecBlock>
        <SecBlock title="Schedule">
          <Grid cols={3}>
            <Field err={errors.examDate}><Label req>Exam Date</Label><Input type="date" value={form.examDate} onChange={set("examDate")} err={errors.examDate}/></Field>
            <Field err={errors.startTime}><Label req>Start Time</Label><Input type="time" value={form.startTime} onChange={set("startTime")} err={errors.startTime}/></Field>
            <Field err={errors.duration}><Label req>Duration</Label><Sel value={form.duration} onChange={set("duration")} options={DUR_OPTS} placeholder="Select" err={errors.duration}/></Field>
          </Grid>
        </SecBlock>
        <SecBlock title="Marks">
          <Grid>
            <Field err={errors.totalMarks}><Label req>Total Marks</Label><Input type="number" value={form.totalMarks} onChange={set("totalMarks")} placeholder="e.g. 100" min="1" err={errors.totalMarks}/></Field>
            <Field err={errors.passingMarks}><Label req>Passing Marks</Label><Input type="number" value={form.passingMarks} onChange={set("passingMarks")} placeholder="e.g. 40" min="1" err={errors.passingMarks}/></Field>
          </Grid>
        </SecBlock>
        <SecBlock title="Additional Details">
          <div style={{marginBottom:14}}><Label hint="optional">Venue / Room</Label><Input value={form.venue} onChange={set("venue")} placeholder="e.g. Hall A, Room 201"/></div>
          <div><Label hint="optional">Instructions for Students</Label>
            <textarea value={form.instructions} onChange={set("instructions")}
              placeholder="e.g. No calculators allowed. Bring your ID card." rows={3}
              style={{...iBase(false),resize:"vertical",lineHeight:1.6}}
              onFocus={onF} onBlur={e=>onB(e,false)}/>
          </div>
        </SecBlock>
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:16,borderTop:"1px solid #f3f4f6"}}>
          <button onClick={onBack} style={{padding:"10px 22px",border:"1.5px solid #e2e5ed",borderRadius:9,fontSize:13,cursor:"pointer",background:"#fff",color:"#6b7280"}}>Cancel</button>
          <button className="btn-a" onClick={handleSave} disabled={saving}
            style={{padding:"10px 28px",background:saving?"#93c5fd":BLUE,color:"#fff",
                    border:"none",borderRadius:9,fontSize:13,fontWeight:600,
                    cursor:saving?"not-allowed":"pointer",minWidth:160}}>
            {saving?"Saving…":editExam?"Update Exam":"Schedule Exam"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   QUESTION BANK  — split layout: form LEFT · live list RIGHT
═══════════════════════════════════════════════════════════════════ */
const INIT_Q={semester:"",batch:"",year:"",subject:"",questionType:"",difficulty:"",
  marks:"",question:"",optionA:"",optionB:"",optionC:"",optionD:"",correctAnswer:"",explanation:""};

const QuestionBank=({questions,onSave,defaultFilters={}})=>{
  const[form,setForm]  =useState({...INIT_Q,...defaultFilters});
  const[errors,setErr] =useState({});
  const[toast,setToast]=useState(null);
  const[delId,setDelId]=useState(null);
  const[listF,setListF]=useState({subject:"",difficulty:"",type:""});
  const[newId,setNewId]=useState(null);          // id of most-recently added card → flash it
  const toastRef=useRef(null);
  const qRef    =useRef(null);
  const listRef =useRef(null);

  const isMCQ=form.questionType==="MCQ",isTF=form.questionType==="TRUE_FALSE";
  const set=f=>e=>{setForm(p=>({...p,[f]:e.target.value}));if(errors[f])setErr(p=>{const x={...p};delete x[f];return x;});};
  const showT=(type,msg)=>{clearTimeout(toastRef.current);setToast({type,msg});toastRef.current=setTimeout(()=>setToast(null),3000);};

  const validate=()=>{
    const e={};
    ["semester","batch","year","subject","questionType","difficulty","marks","question"]
      .forEach(f=>{if(!String(form[f]||"").trim())e[f]="Required";});
    if(isMCQ){["A","B","C","D"].forEach(o=>{if(!form[`option${o}`].trim())e[`option${o}`]="Required";});if(!form.correctAnswer)e.correctAnswer="Required";}
    if(isTF&&!form.correctAnswer)e.correctAnswer="Required";
    return e;
  };

  const handleSubmit=()=>{
    const e=validate();setErr(e);if(Object.keys(e).length>0)return;
    const id=Date.now();
    onSave([{id,...form,createdAt:new Date().toLocaleDateString("en-IN")},...questions]);
    setForm(p=>({...p,marks:"",question:"",optionA:"",optionB:"",optionC:"",optionD:"",correctAnswer:"",explanation:""}));
    setErr({});
    setNewId(id);
    setTimeout(()=>setNewId(null),1600);
    showT("success",`Question #${questions.length+1} saved!`);
    // scroll the right panel to top so new card is visible
    setTimeout(()=>{if(listRef.current)listRef.current.scrollTop=0;},60);
    setTimeout(()=>qRef.current?.focus(),80);
  };

  const filteredQ=questions.filter(q=>{
    if(listF.subject&&q.subject!==listF.subject)return false;
    if(listF.difficulty&&q.difficulty!==listF.difficulty)return false;
    if(listF.type&&q.questionType!==listF.type)return false;
    return true;
  });
  const allSubjects=[...new Set(questions.map(q=>q.subject))];

  return(
    <div className="fade-up" style={{display:"flex",gap:18,alignItems:"flex-start",minHeight:0}}>
      <Toast toast={toast} onClose={()=>setToast(null)}/>

      {/* ══════════════════ LEFT — CREATE FORM ══════════════════ */}
      <div style={{flex:"0 0 480px",minWidth:0,background:"#fff",borderRadius:16,
                   border:"1px solid #eaecf3",padding:"24px 26px",
                   boxShadow:"0 2px 10px rgba(0,0,0,.05)",
                   position:"sticky",top:80,maxHeight:"calc(100vh - 110px)",
                   overflowY:"auto"}}>

        {/* Form header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <p style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>✏️ Create Question</p>
            <p style={{fontSize:12,color:"#9ca3af",marginTop:2}}>Question #{questions.length+1}</p>
          </div>
          <button onClick={()=>{setForm(INIT_Q);setErr({});}}
            style={{fontSize:11,fontWeight:600,color:"#9ca3af",background:"#f8fafc",
                    border:"1.5px solid #e2e5ed",borderRadius:7,padding:"5px 11px",cursor:"pointer"}}>
            🔄 Clear
          </button>
        </div>

        <SecBlock title="📌 Exam Context — stays filled between questions">
          <Grid cols={3} gap={10}>
            <Field err={errors.semester}><Label req>Semester</Label><Sel value={form.semester} onChange={set("semester")} options={SEM_OPTS} placeholder="Select" err={errors.semester}/></Field>
            <Field err={errors.batch}><Label req>Batch</Label><Sel value={form.batch} onChange={set("batch")} options={BATCH_OPTS} placeholder="Select" err={errors.batch}/></Field>
            <Field err={errors.year}><Label req>Year</Label><Sel value={form.year} onChange={set("year")} options={YEAR_OPTS} placeholder="Select" err={errors.year}/></Field>
          </Grid>
          <Grid cols={3} gap={10}>
            <Field err={errors.subject}><Label req>Subject</Label><Input value={form.subject} onChange={set("subject")} placeholder="e.g. Maths" err={errors.subject}/></Field>
            <Field err={errors.questionType}><Label req>Type</Label><Sel value={form.questionType} onChange={set("questionType")} options={QTYPE_OPTS} placeholder="Select" err={errors.questionType}/></Field>
            <Field err={errors.difficulty}><Label req>Difficulty</Label><Sel value={form.difficulty} onChange={set("difficulty")} options={DIFF_OPTS} placeholder="Select" err={errors.difficulty}/></Field>
          </Grid>
        </SecBlock>

        <SecBlock title="📝 This Question — clears after each save">
          <div style={{maxWidth:160,marginBottom:12}}>
            <Field err={errors.marks}><Label req>Marks</Label><Input type="number" value={form.marks} onChange={set("marks")} placeholder="e.g. 5" min="1" err={errors.marks}/></Field>
          </div>
          <Field err={errors.question} style={{marginBottom:12}}>
            <Label req>Question</Label>
            <textarea ref={qRef} value={form.question} onChange={set("question")}
              placeholder="Type your question here…" rows={3}
              style={{...iBase(errors.question),resize:"vertical",lineHeight:1.6}}
              onFocus={onF} onBlur={e=>onB(e,errors.question)}/>
          </Field>

          {isMCQ&&(
            <div style={{background:"#f8faff",border:"1px solid #dbeafe",borderRadius:11,padding:"14px 16px",marginBottom:12}}>
              <p style={{fontSize:10.5,fontWeight:700,color:"#1d4ed8",marginBottom:12,textTransform:"uppercase",letterSpacing:.5}}>MCQ Options</p>
              <Grid gap={10}>{["A","B","C","D"].map(opt=>(
                <Field key={opt} err={errors[`option${opt}`]}><Label req>Option {opt}</Label>
                  <Input value={form[`option${opt}`]} onChange={set(`option${opt}`)} placeholder={`Option ${opt}`} err={errors[`option${opt}`]}/></Field>
              ))}</Grid>
              <Field err={errors.correctAnswer}><Label req>Correct Answer</Label>
                <Sel value={form.correctAnswer} onChange={set("correctAnswer")} options={["A","B","C","D"].map(o=>({value:o,label:`Option ${o}`}))} placeholder="Select correct option" err={errors.correctAnswer}/>
              </Field>
            </div>
          )}
          {isTF&&(
            <Field err={errors.correctAnswer} style={{marginBottom:12}}><Label req>Correct Answer</Label>
              <Sel value={form.correctAnswer} onChange={set("correctAnswer")} options={[{value:"TRUE",label:"True"},{value:"FALSE",label:"False"}]} placeholder="Select" err={errors.correctAnswer}/>
            </Field>
          )}
          <div><Label hint="optional">Explanation</Label>
            <textarea value={form.explanation} onChange={set("explanation")} placeholder="Add explanation or hint…" rows={2}
              style={{...iBase(false),resize:"vertical",lineHeight:1.6}} onFocus={onF} onBlur={e=>onB(e,false)}/>
          </div>
        </SecBlock>

        <button className="btn-a" onClick={handleSubmit}
          style={{width:"100%",padding:"11px",background:BLUE,color:"#fff",border:"none",
                  borderRadius:10,fontSize:13.5,fontWeight:700,cursor:"pointer",letterSpacing:.2}}>
          💾 Save & Add Another
        </button>
      </div>

      {/* ══════════════════ RIGHT — LIVE QUESTIONS LIST ══════════════════ */}
      <div style={{flex:1,minWidth:0}}>
        {/* Right panel header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                     marginBottom:14,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <p style={{fontSize:15,fontWeight:700,color:"#0f172a"}}>📋 All Questions</p>
            <span style={{background:BLUE,color:"#fff",fontSize:11,fontWeight:700,
                          padding:"2px 9px",borderRadius:20}}>{questions.length}</span>
          </div>
          {/* Filters */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            <FSel value={listF.subject}    onChange={e=>setListF(p=>({...p,subject:e.target.value}))}    options={allSubjects.map(s=>({value:s,label:s}))} placeholder="All Subjects"/>
            <FSel value={listF.difficulty} onChange={e=>setListF(p=>({...p,difficulty:e.target.value}))} options={DIFF_OPTS}  placeholder="All Difficulties"/>
            <FSel value={listF.type}       onChange={e=>setListF(p=>({...p,type:e.target.value}))}       options={QTYPE_OPTS} placeholder="All Types"/>
            {Object.values(listF).some(Boolean)&&(
              <button onClick={()=>setListF({subject:"",difficulty:"",type:""})}
                style={{fontSize:11,fontWeight:600,color:"#ef4444",background:"none",border:"none",cursor:"pointer"}}>
                Clear ×
              </button>
            )}
          </div>
        </div>

        {/* Questions or empty state */}
        {questions.length===0?(
          <div style={{background:"#fff",borderRadius:14,border:"2px dashed #e2e5ed",
                       padding:"60px 32px",textAlign:"center"}}>
            <p style={{fontSize:44,marginBottom:14}}>📭</p>
            <p style={{fontSize:15,fontWeight:600,color:"#374151"}}>No questions yet</p>
            <p style={{fontSize:13,color:"#9ca3af",marginTop:6}}>Fill in the form on the left and click <strong>Save & Add Another</strong></p>
          </div>
        ):(
          <div ref={listRef} style={{display:"flex",flexDirection:"column",gap:10,
                                      maxHeight:"calc(100vh - 160px)",overflowY:"auto",
                                      paddingRight:4}}>
            {filteredQ.length===0?(
              <div style={{background:"#fff",borderRadius:12,border:"1px solid #eaecf3",padding:"40px",textAlign:"center"}}>
                <p style={{fontSize:13,color:"#9ca3af"}}>No questions match the current filters.</p>
              </div>
            ):filteredQ.map((q,qi)=>{
              const dc=DIFF_C[q.difficulty]||{};
              const isNew=q.id===newId;
              return(
                <div key={q.id} className="card-h"
                  style={{background:"#fff",borderRadius:12,
                          border:`1.5px solid ${isNew?"#6ee7b7":"#eaecf3"}`,
                          padding:"16px 18px",
                          boxShadow:isNew?"0 0 0 3px rgba(16,185,129,.12)":"none",
                          transition:"border-color .4s,box-shadow .4s"}}>
                  <div style={{display:"flex",gap:12}}>
                    {/* Question number badge */}
                    <div style={{width:32,height:32,borderRadius:8,
                                 background:isNew?"#d1fae5":"#f3f4f6",
                                 display:"flex",alignItems:"center",justifyContent:"center",
                                 fontSize:11,fontWeight:700,
                                 color:isNew?"#065f46":"#6b7280",flexShrink:0,
                                 transition:"background .4s,color .4s"}}>
                      Q{questions.indexOf(q)+1}
                    </div>

                    <div style={{flex:1,minWidth:0}}>
                      {/* Pills row */}
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>
                        <Pill label={`Sem ${q.semester}`} bg="#eff6ff" color="#1d4ed8"/>
                        <Pill label={`Batch ${q.batch}`}  bg="#f5f3ff" color="#6d28d9"/>
                        <Pill label={q.year}              bg="#f0fdf4" color="#15803d"/>
                        <Pill label={QTYPE_OPTS.find(o=>o.value===q.questionType)?.label||q.questionType} bg="#fefce8" color="#a16207"/>
                        <Pill label={q.difficulty[0]+q.difficulty.slice(1).toLowerCase()} bg={dc.bg} color={dc.c}/>
                        <Pill label={`${q.marks} marks`}  bg="#f1f5f9" color="#475569"/>
                      </div>

                      {/* Meta */}
                      <p style={{fontSize:10.5,color:"#b0b8cc",marginBottom:5}}>{q.subject} · Added {q.createdAt}</p>

                      {/* Question text */}
                      <p style={{fontSize:13.5,fontWeight:500,color:"#0f172a",lineHeight:1.55}}>{q.question}</p>

                      {/* MCQ options */}
                      {q.questionType==="MCQ"&&(
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginTop:10}}>
                          {["A","B","C","D"].map(opt=>(
                            <div key={opt} style={{padding:"5px 9px",borderRadius:7,fontSize:12,
                              background:q.correctAnswer===opt?"#f0fdf4":"#fafafa",
                              color:q.correctAnswer===opt?"#15803d":"#4b5563",
                              fontWeight:q.correctAnswer===opt?600:400,
                              border:`1px solid ${q.correctAnswer===opt?"#bbf7d0":"#f3f4f6"}`}}>
                              {q.correctAnswer===opt?"✓ ":""}{opt}. {q[`option${opt}`]}
                            </div>
                          ))}
                        </div>
                      )}
                      {q.questionType==="TRUE_FALSE"&&<p style={{marginTop:7,fontSize:12,color:"#15803d",fontWeight:600}}>✓ Answer: {q.correctAnswer}</p>}
                      {q.explanation&&<p style={{marginTop:7,fontSize:11.5,color:"#9ca3af",fontStyle:"italic"}}>💡 {q.explanation}</p>}
                    </div>

                    {/* Delete */}
                    <button onClick={()=>setDelId(q.id)}
                      style={{color:"#fca5a5",background:"none",border:"none",cursor:"pointer",
                              fontSize:17,flexShrink:0,alignSelf:"flex-start",
                              padding:"2px 4px",borderRadius:6,
                              transition:"color .15s,background .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.color="#ef4444";e.currentTarget.style.background="#fff1f2";}}
                      onMouseLeave={e=>{e.currentTarget.style.color="#fca5a5";e.currentTarget.style.background="none";}}>
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={!!delId} onClose={()=>setDelId(null)} title="Delete Question?">
        <p style={{fontSize:13,color:"#6b7280",marginBottom:24}}>This question will be permanently removed.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setDelId(null)} style={{flex:1,padding:"10px",border:"1.5px solid #e2e5ed",borderRadius:9,fontSize:13,cursor:"pointer",background:"#fff"}}>Cancel</button>
          <button onClick={()=>{onSave(questions.filter(q=>q.id!==delId));setDelId(null);showT("success","Deleted.");}}
            style={{flex:1,padding:"10px",background:"#ef4444",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer",color:"#fff"}}>Delete</button>
        </div>
      </Modal>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   RESULTS VIEW
═══════════════════════════════════════════════════════════════════ */
const ResultsView=({exams,results,onSaveResults,defaultExamId=""})=>{
  const[sel,setSel]=useState(defaultExamId);
  const[marks,setMarks]=useState({});
  const[errors,setErr]=useState({});
  const[toast,setToast]=useState(null);
  const toastRef=useRef(null);
  const showT=(type,msg)=>{clearTimeout(toastRef.current);setToast({type,msg});toastRef.current=setTimeout(()=>setToast(null),3000);};

  useEffect(()=>{if(sel&&results[sel])setMarks(results[sel]);else setMarks({});setErr({});},[sel]);

  const exam=exams.find(e=>String(e.id)===String(sel)),passMark=exam?Number(exam.passingMarks):0;
  const setMark=(sid,val)=>{setMarks(p=>({...p,[sid]:{...p[sid],marks:val,absent:false}}));if(errors[sid])setErr(p=>{const x={...p};delete x[sid];return x;});};
  const toggleAbsent=sid=>{setMarks(p=>({...p,[sid]:{marks:"",absent:!p[sid]?.absent}}));if(errors[sid])setErr(p=>{const x={...p};delete x[sid];return x;});};

  const validate=()=>{const e={};
    STUDENTS.forEach(s=>{if(marks[s.id]?.absent)return;const m=marks[s.id]?.marks;
      if(m===""||m===undefined){e[s.id]="Required";return;}
      if(isNaN(m)||Number(m)<0){e[s.id]="Invalid";return;}
      if(exam&&Number(m)>Number(exam.totalMarks)){e[s.id]=`Max ${exam.totalMarks}`;return;}
    });return e;
  };
  const handleSave=()=>{const e=validate();setErr(e);if(Object.keys(e).length>0){showT("error","Fix errors above.");return;}onSaveResults({...results,[sel]:marks});showT("success","Results saved!");};

  const appeared=STUDENTS.filter(s=>!marks[s.id]?.absent).length,absent=STUDENTS.length-appeared;
  const allVals=STUDENTS.filter(s=>!marks[s.id]?.absent&&marks[s.id]?.marks!==""&&marks[s.id]?.marks!==undefined).map(s=>Number(marks[s.id]?.marks)).filter(m=>!isNaN(m));
  const passed=allVals.filter(m=>m>=passMark).length,failed=appeared-passed;
  const avg=allVals.length?(allVals.reduce((a,b)=>a+b,0)/allVals.length).toFixed(1):null;
  const highest=allVals.length?Math.max(...allVals):null,lowest=allVals.length?Math.min(...allVals):null;
  const passRate=appeared>0?((passed/appeared)*100).toFixed(0):0;

  return(
    <div className="fade-up">
      <Toast toast={toast} onClose={()=>setToast(null)}/>
      {/* Exam selector */}
      <div style={{background:"#fff",borderRadius:14,border:"1px solid #eaecf3",padding:"20px 24px",marginBottom:18,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:14,alignItems:"flex-end"}}>
          <div style={{flex:"1 1 260px"}}>
            <Label req>Select Exam</Label>
            <select value={sel} onChange={e=>{setSel(e.target.value);setErr({});}}
              style={{...iBase(false),cursor:"pointer",appearance:"none",backgroundImage:ARROW,backgroundRepeat:"no-repeat",backgroundPosition:"right 11px center",paddingRight:32}}
              onFocus={onF} onBlur={e=>onB(e,false)}>
              <option value="">— Choose an exam —</option>
              {exams.map(ex=><option key={ex.id} value={ex.id}>{ex.title} | Sem {ex.semester} | Batch {ex.batch}</option>)}
            </select>
          </div>
          {exam&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {[{i:"📅",v:fmtDate(exam.examDate)},{i:"⏱",v:`${exam.duration} min`},{i:"📊",v:`Total: ${exam.totalMarks}`},{i:"✅",v:`Pass: ${exam.passingMarks}`}]
                .map(({i,v})=>(
                  <span key={v} style={{padding:"8px 12px",background:"#f8fafc",border:"1.5px solid #eaecf3",borderRadius:9,fontSize:12,color:"#374151"}}>{i} {v}</span>
                ))}
            </div>
          )}
        </div>
        {exam?.instructions&&<div style={{marginTop:12,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#92400e"}}>📋 <strong>Instructions:</strong> {exam.instructions}</div>}
      </div>

      {!sel&&(
        <div style={{background:"#fff",borderRadius:14,border:"1px dashed #d0d5e0",padding:"60px",textAlign:"center"}}>
          <p style={{fontSize:40,marginBottom:14}}>📝</p>
          <p style={{fontSize:15,fontWeight:600,color:"#374151"}}>{exams.length===0?"No exams found — schedule one first":"Select an exam to enter results"}</p>
        </div>
      )}

      {sel&&exam&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12,marginBottom:16}}>
            {[{l:"Total",v:STUDENTS.length,bg:"#f9fafb",c:"#374151"},{l:"Appeared",v:appeared,bg:"#eff6ff",c:"#1d4ed8"},
              {l:"Absent",v:absent,bg:"#fff7ed",c:"#c2410c"},{l:"Passed",v:passed,bg:"#f0fdf4",c:"#15803d"},
              {l:"Failed",v:failed,bg:"#fef2f2",c:"#dc2626"},{l:"Average",v:avg??"—",bg:"#f5f3ff",c:"#6d28d9"}
            ].map(({l,v,bg,c})=>(
              <div key={l} style={{background:"#fff",borderRadius:11,border:"1px solid #eaecf3",padding:"12px 14px",boxShadow:"0 1px 4px rgba(0,0,0,.03)"}}>
                <p style={{fontSize:22,fontWeight:700,color:c,lineHeight:1,fontFamily:"'DM Mono',monospace"}}>{v}</p>
                <p style={{fontSize:11,color:"#9ca3af",marginTop:3}}>{l}</p>
              </div>
            ))}
          </div>

          {allVals.length>0&&(
            <div style={{background:"#fff",borderRadius:11,border:"1px solid #eaecf3",padding:"12px 18px",marginBottom:16,display:"flex",flexWrap:"wrap",gap:18,boxShadow:"0 1px 4px rgba(0,0,0,.03)"}}>
              {[{i:"🏆",l:"Highest",v:highest,c:"#15803d"},{i:"📉",l:"Lowest",v:lowest,c:"#dc2626"},{i:"📊",l:"Average",v:avg,c:"#1d4ed8"},{i:"📈",l:"Pass Rate",v:`${passRate}%`,c:"#6d28d9"}]
                .map(({i,l,v,c})=><span key={l} style={{fontSize:13,color:"#6b7280"}}>{i} {l}: <strong style={{color:c}}>{v}</strong></span>)}
            </div>
          )}

          <div style={{background:"#fff",borderRadius:14,border:"1px solid #eaecf3",overflow:"hidden",marginBottom:18,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:"#f8fafc",borderBottom:"1px solid #eaecf3"}}>
                    {["#","Student","Roll",`Marks / ${exam.totalMarks}`,"%","Grade","Status","Absent"].map(h=>(
                      <th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#9ca3af",textTransform:"uppercase",letterSpacing:.4,whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map((s,idx)=>{
                    const row=marks[s.id]||{},isAbsent=!!row.absent,mVal=row.marks,num=Number(mVal);
                    const hasMark=!isAbsent&&mVal!==""&&mVal!==undefined&&!isNaN(num);
                    const isPassed=hasMark&&num>=passMark,isFailed=hasMark&&num<passMark;
                    const pct=hasMark?((num/Number(exam.totalMarks))*100).toFixed(1):null;
                    const gr=hasMark?calcGrade(num,Number(exam.totalMarks)):null;
                    const[abg,aic]=avatarC(s.id);
                    return(
                      <tr key={s.id} className="row-h" style={{borderBottom:"1px solid #f8fafc",opacity:isAbsent?.5:1,background:isAbsent?"#fffbf5":"transparent",transition:"background .1s"}}>
                        <td style={{padding:"11px 16px",color:"#9ca3af"}}>{idx+1}</td>
                        <td style={{padding:"11px 16px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <div style={{width:32,height:32,borderRadius:8,background:abg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:aic,flexShrink:0}}>{initials(s.name)}</div>
                            <span style={{fontWeight:600,color:"#0f172a"}}>{s.name}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 16px",color:"#6b7280",fontFamily:"'DM Mono',monospace",fontSize:12}}>{s.roll}</td>
                        <td style={{padding:"11px 16px"}}>
                          <div>
                            <input type="number" value={isAbsent?"":(mVal??"")} onChange={e=>setMark(s.id,e.target.value)}
                              disabled={isAbsent} min="0" max={exam.totalMarks} placeholder={isAbsent?"—":"0"}
                              style={{width:72,border:`1.5px solid ${errors[s.id]?"#fca5a5":"#e2e5ed"}`,borderRadius:8,
                                      padding:"6px 9px",fontSize:13,outline:"none",background:isAbsent?"#f9fafb":"#fff",
                                      color:isAbsent?"#9ca3af":"#111827",cursor:isAbsent?"not-allowed":"text",fontFamily:"'DM Mono',monospace"}}
                              onFocus={onF} onBlur={e=>onB(e,errors[s.id])}/>
                            {errors[s.id]&&<p style={{fontSize:10,color:"#ef4444",marginTop:2}}>{errors[s.id]}</p>}
                          </div>
                        </td>
                        <td style={{padding:"11px 16px",color:"#6b7280",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{pct!==null?`${pct}%`:<span style={{color:"#e5e7eb"}}>—</span>}</td>
                        <td style={{padding:"11px 16px"}}>{gr?<span style={{fontWeight:700,color:gr.c,fontSize:15,fontFamily:"'DM Mono',monospace"}}>{gr.g}</span>:<span style={{color:"#e5e7eb"}}>—</span>}</td>
                        <td style={{padding:"11px 16px"}}>
                          {isAbsent?<span style={{background:"#fff7ed",color:"#c2410c",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20}}>Absent</span>
                           :isPassed?<span style={{background:"#f0fdf4",color:"#15803d",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20}}>Pass</span>
                           :isFailed?<span style={{background:"#fef2f2",color:"#dc2626",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20}}>Fail</span>
                           :<span style={{color:"#e5e7eb"}}>—</span>}
                        </td>
                        <td style={{padding:"11px 16px"}}><input type="checkbox" checked={isAbsent} onChange={()=>toggleAbsent(s.id)} style={{width:16,height:16,cursor:"pointer",accentColor:"#f97316"}}/></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <p style={{fontSize:12,color:"#9ca3af"}}>Results are saved to browser storage</p>
            <button className="btn-a" onClick={handleSave} style={{padding:"11px 30px",background:BLUE,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>💾 Save Results</button>
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════════════ */
export default function App(){
  const[exams,    saveExams]    =useStorage(KEYS.EXAMS,    []);
  const[questions,saveQuestions]=useStorage(KEYS.QUESTIONS,[]);
  const[results,  saveResults]  =useStorage(KEYS.RESULTS,  {});
  const[view,     setView]      =useState("exams");
  const[navData,  setNavData]   =useState({});
  const[toast,    setToast]     =useState(null);
  const toastRef=useRef(null);

  const showT=(type,msg)=>{clearTimeout(toastRef.current);setToast({type,msg});toastRef.current=setTimeout(()=>setToast(null),3000);};
  const navigate=(target,data={})=>{setView(target);setNavData(data);};

  const handleSaveExam=(form,editId)=>{
    if(editId){saveExams(exams.map(e=>e.id===editId?{...e,...form}:e));showT("success","Exam updated!");}
    else{saveExams([{id:Date.now(),...form,createdAt:new Date().toISOString()},...exams]);showT("success","Exam scheduled!");}
    navigate("exams");
  };

  const backBtn=(
    <button onClick={()=>navigate("exams")}
      style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",
              cursor:"pointer",color:BLUE,fontSize:13,fontWeight:600,padding:0}}>
      ← Back to Exams
    </button>
  );

  const renderContent=()=>{
    switch(view){
      case"exams":    return <ExamList exams={exams} onNav={navigate} onDelete={id=>{saveExams(exams.filter(e=>e.id!==id));showT("success","Exam deleted.");}}/>;
      case"schedule": return <ExamForm editExam={navData.exam||null} onSave={handleSaveExam} onBack={()=>navigate("exams")}/>;
      case"questions":return <QuestionBank questions={questions} onSave={saveQuestions} defaultFilters={navData}/>;
      case"results":  return <ResultsView exams={exams} results={results} onSaveResults={saveResults} defaultExamId={navData.examId||""}/>;
      default:        return null;
    }
  };

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#f5f6fa"}}>
      <GlobalStyle/>
      <Toast toast={toast} onClose={()=>setToast(null)}/>
      <Sidebar active={view} onNav={navigate}/>
      <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",overflow:"hidden"}}>
        <Topbar view={view} extra={view!=="exams"?backBtn:null}/>
        <main style={{flex:1,padding:"24px 28px",overflowY:"auto"}}>{renderContent()}</main>
      </div>
    </div>
  );
}