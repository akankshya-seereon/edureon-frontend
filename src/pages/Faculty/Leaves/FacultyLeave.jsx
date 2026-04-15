import { useState, useRef } from 'react';
import {
  CalendarDays, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, Plus, X, Upload, ChevronRight, Inbox,
  Stethoscope, User, Users, BookOpen, Plane, HelpCircle,
  Timer, ThumbsUp, ThumbsDown, Eye, Paperclip, Send,
  CalendarClock, ShieldAlert, Info, GraduationCap,
  Briefcase, Award, Building2, UserCheck, ClipboardList,
  TrendingUp, Star, CheckSquare, XSquare, MessageSquare,
  BarChart3, Filter, Search, ChevronDown,
} from 'lucide-react';

// ── Leave type config (Faculty-specific) ──────────────────────────────────────
const LEAVE_TYPES = [
  { id: 'medical',     label: 'Medical Leave',      Icon: Stethoscope, color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-700',       max: 20 },
  { id: 'casual',      label: 'Casual Leave',        Icon: User,        color: 'text-blue-600',   bg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',     max: 10 },
  { id: 'earned',      label: 'Earned / PL',         Icon: Star,        color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-700',   max: 30 },
  { id: 'maternity',   label: 'Maternity Leave',     Icon: Users,       color: 'text-pink-600',   bg: 'bg-pink-50',    border: 'border-pink-200',   badge: 'bg-pink-100 text-pink-700',     max: 180 },
  { id: 'paternity',   label: 'Paternity Leave',     Icon: Users,       color: 'text-violet-600', bg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700', max: 15 },
  { id: 'academic',    label: 'Academic / Research', Icon: BookOpen,    color: 'text-purple-600', bg: 'bg-purple-50',  border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', max: 14 },
  { id: 'conference',  label: 'Conference / FDP',    Icon: Award,       color: 'text-sky-600',    bg: 'bg-sky-50',     border: 'border-sky-200',    badge: 'bg-sky-100 text-sky-700',       max: 10 },
  { id: 'duty',        label: 'On Duty Leave',       Icon: Briefcase,   color: 'text-teal-600',   bg: 'bg-teal-50',    border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-700',     max: 30 },
  { id: 'other',       label: 'Other',               Icon: HelpCircle,  color: 'text-gray-600',   bg: 'bg-gray-50',    border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-700',     max: 5  },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
  'Electrical Engineering',
  'Applied Sciences',
  'Management Studies',
];

const DESIGNATIONS = [
  'Professor', 'Associate Professor', 'Assistant Professor',
  'Senior Lecturer', 'Lecturer', 'Guest Faculty',
  'HOD', 'Dean', 'Lab Instructor',
];

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   Icon: Timer,      color: 'bg-amber-100 text-amber-700 border border-amber-200'    },
  approved:  { label: 'Approved',  Icon: ThumbsUp,   color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  rejected:  { label: 'Rejected',  Icon: ThumbsDown, color: 'bg-red-100 text-red-700 border border-red-200'          },
  cancelled: { label: 'Cancelled', Icon: XCircle,    color: 'bg-gray-100 text-gray-500 border border-gray-200'       },
};

// ── Mock pending student requests (for approval tab) ──────────────────────────
const MOCK_STUDENT_REQUESTS = [
  { id: 's1', name: 'Arjun Mehta',    rollNo: 'CS21B001', dept: 'Computer Science & Engineering', type: 'medical',  fromDate: '2026-03-04', toDate: '2026-03-06', days: 3, reason: 'High fever with doctor prescribed rest for 3 days. Medical certificate attached.', appliedOn: '2026-03-02', attachment: 'Medical_Cert.pdf', status: 'pending', remark: '' },
  { id: 's2', name: 'Priya Sharma',   rollNo: 'EC21B015', dept: 'Electronics & Communication',    type: 'academic', fromDate: '2026-03-08', toDate: '2026-03-09', days: 2, reason: 'Participating in inter-college technical symposium as team lead.', appliedOn: '2026-03-01', attachment: 'Event_Letter.pdf', status: 'pending', remark: '' },
  { id: 's3', name: 'Kiran Patel',    rollNo: 'ME21B032', dept: 'Mechanical Engineering',         type: 'family',   fromDate: '2026-03-05', toDate: '2026-03-05', days: 1, reason: 'Brother\'s wedding ceremony scheduled on this date.', appliedOn: '2026-03-01', attachment: 'Wedding_Card.pdf', status: 'pending', remark: '' },
  { id: 's4', name: 'Sneha Reddy',    rollNo: 'CS21B044', dept: 'Computer Science & Engineering', type: 'personal', fromDate: '2026-03-10', toDate: '2026-03-11', days: 2, reason: 'Personal work at native place for property-related documentation.', appliedOn: '2026-03-02', attachment: null, status: 'pending', remark: '' },
  { id: 's5', name: 'Rahul Nair',     rollNo: 'IT21B007', dept: 'Information Technology',         type: 'medical',  fromDate: '2026-03-03', toDate: '2026-03-04', days: 2, reason: 'Dental surgery and post-op recovery as advised by dentist.', appliedOn: '2026-03-02', attachment: 'Dental_Cert.pdf', status: 'pending', remark: '' },
];

// ── Mock history (faculty's own leaves) ──────────────────────────────────────
const MOCK_HISTORY = [
  { id: 1, type: 'medical',    fromDate: '2026-01-10', toDate: '2026-01-13', days: 4,  reason: 'Viral fever. Doctor prescribed complete rest for 4 days.', status: 'approved',  appliedOn: '2026-01-09', remark: 'Approved. Get well soon.', attachment: 'Medical_Cert.pdf' },
  { id: 2, type: 'conference', fromDate: '2025-12-18', toDate: '2025-12-20', days: 3,  reason: 'Attending IEEE International Conference on Intelligent Systems.', status: 'approved',  appliedOn: '2025-12-10', remark: 'Approved. Submit proceedings.', attachment: 'Conf_Letter.pdf' },
  { id: 3, type: 'earned',     fromDate: '2025-11-24', toDate: '2025-11-28', days: 5,  reason: 'Annual family vacation.', status: 'approved',  appliedOn: '2025-11-15', remark: '', attachment: null },
  { id: 4, type: 'academic',   fromDate: '2025-10-05', toDate: '2025-10-06', days: 2,  reason: 'FDP on Machine Learning at IIT Bombay.', status: 'rejected',  appliedOn: '2025-09-28', remark: 'Class schedule conflict. Please reschedule.', attachment: 'FDP_Letter.pdf' },
  { id: 5, type: 'casual',     fromDate: '2026-02-14', toDate: '2026-02-14', days: 1,  reason: 'Personal errand.', status: 'pending',   appliedOn: '2026-02-12', remark: '', attachment: null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const formatDate = (d) => {
  try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return d; }
};
const calcDays = (from, to) => {
  if (!from || !to) return 0;
  const diff = (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
  return diff >= 0 ? diff + 1 : 0;
};
const typeConfig  = (id) => LEAVE_TYPES.find(t => t.id === id) ?? LEAVE_TYPES[8];
const STUDENT_TYPE = {
  medical:  { label: 'Medical',  bg: 'bg-red-50',    color: 'text-red-700',    Icon: Stethoscope },
  personal: { label: 'Personal', bg: 'bg-blue-50',   color: 'text-blue-700',   Icon: User        },
  family:   { label: 'Family',   bg: 'bg-amber-50',  color: 'text-amber-700',  Icon: Users       },
  academic: { label: 'Academic', bg: 'bg-purple-50', color: 'text-purple-700', Icon: BookOpen    },
  vacation: { label: 'Vacation', bg: 'bg-sky-50',    color: 'text-sky-700',    Icon: Plane       },
  other:    { label: 'Other',    bg: 'bg-gray-50',   color: 'text-gray-700',   Icon: HelpCircle  },
};

// ── Leave Balance Data ────────────────────────────────────────────────────────
const LEAVE_BALANCE = [
  { id: 'medical',    used: 4,  total: 20 },
  { id: 'casual',     used: 3,  total: 10 },
  { id: 'earned',     used: 5,  total: 30 },
  { id: 'academic',   used: 2,  total: 14 },
  { id: 'conference', used: 3,  total: 10 },
  { id: 'duty',       used: 0,  total: 30 },
];

// ── File Upload ───────────────────────────────────────────────────────────────
function FileUpload({ file, onChange, disabled }) {
  const ref = useRef();
  const ALLOWED = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };
  return file ? (
    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-left">
      <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-md font-semibold text-blue-800 truncate">{file.name}</p>
        <p className="text-sm text-blue-400">{(file.size / 1024).toFixed(1)} KB</p>
      </div>
      {!disabled && (
        <button onClick={() => onChange(null)} className="text-blue-400 hover:text-red-500 transition">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  ) : (
    <div
      onDragOver={e => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !disabled && ref.current?.click()}
      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
    >
      <input ref={ref} type="file" accept={ALLOWED.join(',')} className="hidden"
        onChange={e => { if (e.target.files[0]) onChange(e.target.files[0]); e.target.value = ''; }} />
      <Upload className="w-5 h-5 mx-auto mb-1.5 text-gray-400" />
      <p className="text-sm font-semibold text-gray-500">Click or drag to upload</p>
      <p className="text-sm text-gray-400 mt-0.5">PDF, DOC, DOCX, JPG, PNG · Max 5 MB</p>
    </div>
  );
}

// ── Leave Detail Modal (Faculty's own) ───────────────────────────────────────

function LeaveDetailModal({ leave, onClose, onCancel }) {
  const tc = typeConfig(leave.type);
  const sc = STATUS_CONFIG[leave.status];
  const barColor = { medical: 'bg-red-500', casual: 'bg-blue-500', earned: 'bg-amber-500', maternity: 'bg-pink-500', paternity: 'bg-violet-500', academic: 'bg-purple-500', conference: 'bg-sky-500', duty: 'bg-teal-500', other: 'bg-gray-400' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className={`h-1.5 w-full ${barColor[leave.type] ?? 'bg-gray-400'}`} />
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${tc.bg} flex items-center justify-center`}>
                <tc.Icon className={`w-5 h-5 ${tc.color}`} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">{tc.label}</h2>
                <p className="text-sm text-gray-400">Applied on {formatDate(leave.appliedOn)}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 ${sc.color}`}>
            <sc.Icon className="w-4 h-4 shrink-0" />
            <span className="text-md font-bold">{sc.label}</span>
            {leave.remark && <span className="text-sm ml-1 opacity-80">— {leave.remark}</span>}
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[{ label: 'From', value: formatDate(leave.fromDate) }, { label: 'To', value: formatDate(leave.toDate) }, { label: 'Days', value: `${leave.days} day${leave.days !== 1 ? 's' : ''}` }]
              .map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <p className="text-sm text-gray-400 font-medium mb-1">{label}</p>
                  <p className="text-md font-bold text-gray-900">{value}</p>
                </div>
              ))}
          </div>
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Reason</p>
            <p className="text-md text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">{leave.reason}</p>
          </div>
          {leave.attachment && (
            <div className="mb-5 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-blue-700">{leave.attachment}</span>
            </div>
          )}
          {leave.status === 'pending' && (
            <button onClick={() => { onCancel(leave.id); onClose(); }}
              className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-600 text-md font-semibold hover:bg-red-50 transition">
              Cancel This Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Student Request Review Modal ──────────────────────────────────────────────
function StudentReviewModal({ req, onClose, onAction }) {
  const [remark, setRemark] = useState('');
  const tc = STUDENT_TYPE[req.type] ?? STUDENT_TYPE.other;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-bold text-lg text-gray-900">Review Leave Request</h2>
              <p className="text-sm text-gray-400">Student application</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>

          {/* Student info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-md">
                {req.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-bold text-gray-900">{req.name}</p>
                <p className="text-sm text-gray-500">{req.rollNo} · {req.dept.split(' ').slice(0, 2).join(' ')}</p>
              </div>
              <div className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${tc.bg} ${tc.color}`}>
                <tc.Icon className="w-3 h-3" />{tc.label}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'From', value: formatDate(req.fromDate) }, { label: 'To', value: formatDate(req.toDate) }, { label: 'Days', value: `${req.days}d` }]
                .map(({ label, value }) => (
                  <div key={label} className="bg-white rounded-lg p-2 text-center border border-gray-100">
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{value}</p>
                  </div>
                ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Reason</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">{req.reason}</p>
          </div>

          {req.attachment && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <Paperclip className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="text-sm font-semibold text-blue-700">{req.attachment}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Remark <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={2}
              placeholder="Add a note for the student..."
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => { onAction(req.id, 'rejected', remark); onClose(); }}
              className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-600 text-md font-bold hover:bg-red-50 transition flex items-center justify-center gap-2">
              <XSquare className="w-4 h-4" /> Reject
            </button>
            <button onClick={() => { onAction(req.id, 'approved', remark); onClose(); }}
              className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-md font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-200">
              <CheckSquare className="w-4 h-4" /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Apply Form ────────────────────────────────────────────────────────────────
function ApplyTab({ onSubmit }) {
  const EMPTY = { type: '', fromDate: '', toDate: '', reason: '', department: '', designation: '', substituteArrangement: '', alternateContact: '' };
  const [form, setForm]     = useState(EMPTY);
  const [file, setFile]     = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);

  const days = calcDays(form.fromDate, form.toDate);
  const tc   = form.type ? typeConfig(form.type) : null;

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (!form.type)            e.type       = 'Select a leave type.';
    if (!form.department)      e.department = 'Select your department.';
    if (!form.designation)     e.designation = 'Select your designation.';
    if (!form.fromDate)        e.fromDate   = 'Select start date.';
    if (!form.toDate)          e.toDate     = 'Select end date.';
    if (form.fromDate && form.toDate && form.toDate < form.fromDate) e.toDate = 'End date must be after start date.';
    if (tc && days > tc.max)   e.toDate     = `Max ${tc.max} days allowed for ${tc.label}.`;
    if (!form.reason.trim())   e.reason     = 'Please provide a reason.';
    if (form.reason.trim().length < 20) e.reason = 'Reason must be at least 20 characters.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    onSubmit({
      id: Date.now(), type: form.type,
      fromDate: form.fromDate, toDate: form.toDate, days,
      reason: form.reason, status: 'pending',
      appliedOn: today(), remark: '',
      attachment: file ? file.name : null,
      department: form.department, designation: form.designation,
      substituteArrangement: form.substituteArrangement,
      alternateContact: form.alternateContact,
    });
    setLoading(false);
    setDone(true);
    setTimeout(() => { setDone(false); setForm(EMPTY); setFile(null); setErrors({}); }, 3200);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">Leave Request Submitted!</h3>
        <p className="text-md text-gray-500">Your request has been forwarded to the HOD for approval.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Form */}
      <div className="lg:col-span-2 space-y-5">

        {/* Department + Designation */}
        <div className="grid grid-cols-2 gap-4  text-left">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select value={form.department} onChange={e => set('department', e.target.value)}
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-md text-gray-700 outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-400 transition ${errors.department ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Designation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select value={form.designation} onChange={e => set('designation', e.target.value)}
                className={`w-full px-3 py-2.5 border-2 rounded-xl text-md text-gray-700 outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-400 transition ${errors.designation ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`}>
                <option value="">Select Designation</option>
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.designation && <p className="mt-1 text-sm text-red-500">{errors.designation}</p>}
          </div>
        </div>

        {/* Leave Type */}
        <div>
          <label className="block text-sm text-left font-bold text-gray-700 uppercase tracking-wide mb-2">
            Leave Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LEAVE_TYPES.map(({ id, label, Icon, bg, border, color }) => (
              <button key={id} onClick={() => set('type', id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-md font-semibold transition-all
                  ${form.type === id ? `${bg} ${border} ${color}` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate text-sm">{label}</span>
              </button>
            ))}
          </div>
          {errors.type && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.type}</p>}
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4  text-left">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              From Date <span className="text-red-500">*</span>
            </label>
            <input type="date" min={today()} value={form.fromDate}
              onChange={e => { set('fromDate', e.target.value); if (form.toDate && e.target.value > form.toDate) set('toDate', ''); }}
              className={`w-full px-3 py-2.5 border-2 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 bg-white transition ${errors.fromDate ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`} />
            {errors.fromDate && <p className="mt-1 text-sm text-red-500">{errors.fromDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              To Date <span className="text-red-500">*</span>
            </label>
            <input type="date" min={form.fromDate || today()} value={form.toDate} onChange={e => set('toDate', e.target.value)}
              className={`w-full px-3 py-2.5 border-2 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 bg-white transition ${errors.toDate ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`} />
            {errors.toDate && <p className="mt-1 text-sm text-red-500">{errors.toDate}</p>}
          </div>
        </div>

        {/* Days preview */}
        {days > 0 && (
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${tc && days > tc.max ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <CalendarClock className={`w-4 h-4 shrink-0 ${tc && days > tc.max ? 'text-red-500' : 'text-blue-500'}`} />
            <span className={`text-md font-semibold ${tc && days > tc.max ? 'text-red-700' : 'text-blue-700'}`}>
              {days} day{days !== 1 ? 's' : ''} requested
              {tc && ` · Max ${tc.max} days for ${tc.label}`}
            </span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5 text-left">
            Reason for Leave <span className="text-red-500">*</span>
          </label>
          <textarea value={form.reason} onChange={e => set('reason', e.target.value)} rows={4}
            placeholder="Describe the reason for your leave request clearly (min. 20 characters)..."
            className={`w-full px-3 py-2.5 border-2 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 resize-none transition ${errors.reason ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'}`} />
          <div className="flex items-center justify-between mt-1">
            {errors.reason ? <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{errors.reason}</p> : <span />}
            <span className={`text-sm ${form.reason.length < 20 ? 'text-gray-400' : 'text-emerald-500 font-semibold'}`}>{form.reason.length} chars</span>
          </div>
        </div>

        {/* Substitute arrangement */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5 text-left">
            Substitute / Class Arrangement <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="text" value={form.substituteArrangement} onChange={e => set('substituteArrangement', e.target.value)}
            placeholder="e.g. Dr. Anita Roy will cover CSE301 on Mon/Wed..."
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
        </div>

        {/* Alternate contact */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5  text-left">
            Alternate Contact <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="tel" value={form.alternateContact} onChange={e => set('alternateContact', e.target.value)}
            placeholder="+91 XXXXX XXXXX"
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" />
        </div>

        {/* Supporting document */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1.5  text-left">
            Supporting Document <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <p className="text-md text-left text-gray-400 mb-2">Medical certificate, conference invite, official letter, etc.</p>
          <FileUpload file={file} onChange={setFile} />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={loading}
          className={`w-full py-3.5 rounded-xl font-bold text-md text-white flex items-center justify-center gap-2 transition-all
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-md shadow-blue-200'}`}>
          {loading
            ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Submitting...</>
            : <><Send className="w-4 h-4" /> Submit Leave Request</>}
        </button>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Leave Balance */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Leave Balance
          </h3>
          <div className="space-y-3">
            {LEAVE_BALANCE.map(({ id, used, total }) => {
              const tc = typeConfig(id);
              const pct = Math.min((used / total) * 100, 100);
              const remaining = total - used;
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <tc.Icon className={`w-3 h-3 ${tc.color}`} />
                      <span className="text-sm text-gray-600 truncate max-w-[110px]">{tc.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{remaining}/{total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-400 mt-3">Remaining / Total days</p>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
          <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" /> Guidelines
          </h3>
          <ul className="space-y-2 text-sm text-amber-700">
            {[
              'Submit leave at least 3 working days in advance',
              'Medical leave > 3 days requires a certificate',
              'Conference/FDP leave needs official invitation',
              'On Duty leave requires HOD + Principal sign-off',
              'Substitute arrangement is mandatory for > 2 days',
              'Earned leave can be carried forward (max 30 days)',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ChevronRight className="w-3 h-3 mt-0.5 shrink-0" />{tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── My Requests Tab ───────────────────────────────────────────────────────────
function HistoryTab({ history, onCancel }) {
  const [detail, setDetail] = useState(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? history : history.filter(l => l.status === filter);

  return (
    <div>
      {detail && <LeaveDetailModal leave={detail} onClose={() => setDetail(null)} onCancel={onCancel} />}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'cancelled'].map(s => {
          const active = filter === s;
          const cfg = s === 'all'
            ? { label: 'All', color: 'bg-gray-900 text-white', inactive: 'bg-white text-gray-600 border border-gray-200' }
            : { label: STATUS_CONFIG[s].label, color: `${STATUS_CONFIG[s].color}`, inactive: 'bg-white text-gray-500 border border-gray-200' };
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all ${active ? cfg.color : cfg.inactive + ' hover:border-gray-300'}`}>
              {cfg.label}
              <span className="ml-1.5 opacity-60">
                {s === 'all' ? history.length : history.filter(l => l.status === s).length}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-md font-medium text-gray-400">No leave records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(leave => {
            const tc = typeConfig(leave.type);
            const sc = STATUS_CONFIG[leave.status];
            return (
              <div key={leave.id}
                className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-4 hover:shadow-sm transition-all cursor-pointer
                  ${leave.status === 'pending' ? 'border-amber-200' : leave.status === 'approved' ? 'border-emerald-200' : leave.status === 'rejected' ? 'border-red-200' : 'border-gray-200'}`}
                onClick={() => setDetail(leave)}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tc.bg}`}>
                  <tc.Icon className={`w-5 h-5 ${tc.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-md font-bold text-gray-900">{tc.label}</p>
                    {leave.attachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{leave.reason}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {formatDate(leave.fromDate)}{leave.fromDate !== leave.toDate ? ` → ${formatDate(leave.toDate)}` : ''}
                    </span>
                    <span className="text-sm font-semibold text-gray-600">{leave.days} day{leave.days !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${sc.color}`}>
                    <sc.Icon className="w-3 h-3" />{sc.label}
                  </span>
                  <Eye className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Student Approval Tab ──────────────────────────────────────────────────────
function ApprovalTab({ requests, onAction }) {
  const [review, setReview] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('pending');

  const filtered = requests
    .filter(r => filter === 'all' ? true : r.status === filter)
    .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.rollNo.toLowerCase().includes(search.toLowerCase()));

  const pending = requests.filter(r => r.status === 'pending').length;

  return (
    <div>
      {review && <StudentReviewModal req={review} onClose={() => setReview(null)} onAction={onAction} />}

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search student name or roll no..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-md text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 bg-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'approved', 'rejected', 'all'].map(s => {
            const label = s === 'all' ? `All (${requests.length})` : s === 'pending' ? `Pending (${pending})` : s.charAt(0).toUpperCase() + s.slice(1);
            return (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all border ${filter === s
                  ? s === 'pending' ? 'bg-amber-500 text-white border-amber-500'
                    : s === 'approved' ? 'bg-emerald-500 text-white border-emerald-500'
                      : s === 'rejected' ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-800 text-white border-gray-800'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {pending > 0 && filter === 'pending' && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">{pending} student leave request{pending !== 1 ? 's' : ''} awaiting your approval</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p className="text-md font-medium text-gray-400">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => {
            const tc = STUDENT_TYPE[req.type] ?? STUDENT_TYPE.other;
            const sc = STATUS_CONFIG[req.status];
            return (
              <div key={req.id}
                className={`bg-white rounded-2xl border-2 p-4 transition-all hover:shadow-sm
                  ${req.status === 'pending' ? 'border-amber-200' : req.status === 'approved' ? 'border-emerald-200' : req.status === 'rejected' ? 'border-red-200' : 'border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-md shrink-0">
                    {req.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-md font-bold text-gray-900">{req.name}</p>
                      <span className="text-sm text-gray-400">{req.rollNo}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-bold ${tc.bg} ${tc.color}`}>
                        <tc.Icon className="w-2.5 h-2.5" />{tc.label}
                      </span>
                      {req.attachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{req.reason}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(req.fromDate)}{req.fromDate !== req.toDate ? ` → ${formatDate(req.toDate)}` : ''}</span>
                      <span className="font-semibold text-gray-600">{req.days}d</span>
                      <span className="hidden sm:inline">Applied {formatDate(req.appliedOn)}</span>
                    </div>
                  </div>

                  {/* Status / Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'pending' ? (
                      <button onClick={() => setReview(req)}
                        className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm shadow-blue-200">
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${sc.color}`}>
                        <sc.Icon className="w-3 h-3" />{sc.label}
                      </span>
                    )}
                  </div>
                </div>
                {req.remark && req.status !== 'pending' && (
                  <div className="mt-3 ml-15 pl-4 border-l-2 border-gray-100">
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {req.remark}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FacultyLeave() {
  const [activeTab, setActiveTab] = useState('apply');
  const [history, setHistory]     = useState(MOCK_HISTORY);
  const [studentReqs, setStudentReqs] = useState(MOCK_STUDENT_REQUESTS);

  const handleSubmit = (leave) => {
    setHistory(prev => [leave, ...prev]);
    setTimeout(() => setActiveTab('history'), 3400);
  };

  const handleCancel = (id) => {
    setHistory(prev => prev.map(l => l.id === id ? { ...l, status: 'cancelled' } : l));
  };

  const handleStudentAction = (id, status, remark) => {
    setStudentReqs(prev => prev.map(r => r.id === id ? { ...r, status, remark } : r));
  };

  const stats = {
    total:      history.length,
    pending:    history.filter(l => l.status === 'pending').length,
    approved:   history.filter(l => l.status === 'approved').length,
    rejected:   history.filter(l => l.status === 'rejected').length,
    totalDays:  history.filter(l => l.status === 'approved').reduce((s, l) => s + l.days, 0),
  };

  const pendingStudents = studentReqs.filter(r => r.status === 'pending').length;

  const TABS = [
    { id: 'apply',    label: 'Apply for Leave',     Icon: Plus,          badge: 0              },
    { id: 'history',  label: 'My Requests',          Icon: Clock,         badge: stats.pending  },
    { id: 'approval', label: 'Student Approvals',    Icon: UserCheck,     badge: pendingStudents },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">

        {/* Header */}
        <div className="mb-7 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Faculty Leave Management</h1>
            </div>
            <p className="text-md text-gray-500">Apply for leave, track requests & approve student applications</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-md">DR</div>
            <div>
              <p className="text-sm font-bold text-gray-800">Dr. Ramesh Kumar</p>
              <p className="text-sm text-gray-400">Assoc. Prof · CSE</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 text-left">
          {[
            { label: 'Total Requests', value: stats.total,    Icon: FileText,    bg: 'bg-blue-50',    icon: 'bg-blue-600',    text: 'text-blue-900'    },
            { label: 'Pending',        value: stats.pending,  Icon: Timer,       bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-900'   },
            { label: 'Approved',       value: stats.approved, Icon: ThumbsUp,    bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-900' },
            { label: 'Rejected',       value: stats.rejected, Icon: ThumbsDown,  bg: 'bg-red-50',     icon: 'bg-red-600',     text: 'text-red-900'     },
            { label: 'Days Approved',  value: stats.totalDays,Icon: CalendarDays,bg: 'bg-purple-50',  icon: 'bg-purple-600',  text: 'text-purple-900'  },
          ].map(({ label, value, Icon, bg, icon, text }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 border border-white shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 ${icon} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-500 leading-tight">{label}</span>
              </div>
              <p className={`text-2xl font-black ${text}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Tab bar */}
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {TABS.map(({ id, label, Icon, badge }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`relative flex items-center gap-2 px-5 py-4 font-semibold text-md transition-colors whitespace-nowrap
                  ${activeTab === id ? 'text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-800 hover:bg-white/60'}`}>
                <Icon className="w-4 h-4" />
                {label}
                {badge > 0 && (
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-sm font-bold ${id === 'approval' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {badge}
                  </span>
                )}
                {activeTab === id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'apply'    && <ApplyTab    onSubmit={handleSubmit} />}
            {activeTab === 'history'  && <HistoryTab  history={history} onCancel={handleCancel} />}
            {activeTab === 'approval' && <ApprovalTab requests={studentReqs} onAction={handleStudentAction} />}
          </div>
        </div>
      </div>
    </div>
  );
}
 