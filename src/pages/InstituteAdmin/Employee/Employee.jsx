import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Loader2, Briefcase, GraduationCap, UserPlus,
  Eye, EyeOff, Upload, FileText, X, CheckCircle, AlertCircle, Image, File, Save, Building2, Landmark, ArrowLeft
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl";

// ─── AXIOS CONFIGURATION ──────────────────────────────────────────────────────
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── CONSTANTS & HELPERS ──────────────────────────────────────────────────────
const ACADEMIC_DESIGNATIONS = ['Faculty', 'HOD', 'Professor', 'Lecturer', 'Dean', 'Principal', 'Lab Instructor'];
const NON_ACADEMIC_DESIGNATIONS = ['Administrative Officer', 'Accountant', 'Clerk', 'Lab Technician', 'Librarian', 'Security Guard', 'IT Support', 'Peon'];
const QUALIFICATIONS = ['PhD', 'M.Tech', 'M.Sc', 'MBA', 'B.Tech', 'B.Sc', 'B.Com', 'Diploma', 'Other'];
const GENDERS = ['Male', 'Female', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ─── COUNTRY LIST ────────────────────────────────────────────────────────────
const COUNTRY_LIST = [
  { flag:'🇦🇫', name:'Afghanistan',             code:'+93',  digits:9  },
  { flag:'🇦🇱', name:'Albania',                 code:'+355', digits:9  },
  { flag:'🇩🇿', name:'Algeria',                 code:'+213', digits:9  },
  { flag:'🇦🇩', name:'Andorra',                 code:'+376', digits:6  },
  { flag:'🇦🇴', name:'Angola',                  code:'+244', digits:9  },
  { flag:'🇦🇬', name:'Antigua & Barbuda',       code:'+1268',digits:7  },
  { flag:'🇦🇷', name:'Argentina',               code:'+54',  digits:10 },
  { flag:'🇦🇲', name:'Armenia',                 code:'+374', digits:8  },
  { flag:'🇦🇺', name:'Australia',               code:'+61',  digits:9  },
  { flag:'🇦🇹', name:'Austria',                 code:'+43',  digits:null},
  { flag:'🇦🇿', name:'Azerbaijan',              code:'+994', digits:9  },
  { flag:'🇧🇸', name:'Bahamas',                 code:'+1242',digits:7  },
  { flag:'🇧🇭', name:'Bahrain',                 code:'+973', digits:8  },
  { flag:'🇧🇩', name:'Bangladesh',              code:'+880', digits:10 },
  { flag:'🇧🇧', name:'Barbados',                code:'+1246',digits:7  },
  { flag:'🇧🇾', name:'Belarus',                 code:'+375', digits:9  },
  { flag:'🇧🇪', name:'Belgium',                 code:'+32',  digits:9  },
  { flag:'🇧🇿', name:'Belize',                  code:'+501', digits:7  },
  { flag:'🇧🇯', name:'Benin',                   code:'+229', digits:8  },
  { flag:'🇧🇹', name:'Bhutan',                  code:'+975', digits:8  },
  { flag:'🇧🇴', name:'Bolivia',                 code:'+591', digits:8  },
  { flag:'🇧🇦', name:'Bosnia & Herzegovina',    code:'+387', digits:8  },
  { flag:'🇧🇼', name:'Botswana',                code:'+267', digits:8  },
  { flag:'🇧🇷', name:'Brazil',                  code:'+55',  digits:11 },
  { flag:'🇧🇳', name:'Brunei',                  code:'+673', digits:7  },
  { flag:'🇧🇬', name:'Bulgaria',                code:'+359', digits:9  },
  { flag:'🇧🇫', name:'Burkina Faso',            code:'+226', digits:8  },
  { flag:'🇧🇮', name:'Burundi',                 code:'+257', digits:8  },
  { flag:'🇨🇻', name:'Cabo Verde',              code:'+238', digits:7  },
  { flag:'🇰🇭', name:'Cambodia',                code:'+855', digits:9  },
  { flag:'🇨🇲', name:'Cameroon',                code:'+237', digits:9  },
  { flag:'🇨🇦', name:'Canada',                  code:'+1',   digits:10 },
  { flag:'🇨🇫', name:'Central African Republic',code:'+236', digits:8  },
  { flag:'🇹🇩', name:'Chad',                    code:'+235', digits:8  },
  { flag:'🇨🇱', name:'Chile',                   code:'+56',  digits:9  },
  { flag:'🇨🇳', name:'China',                   code:'+86',  digits:11 },
  { flag:'🇨🇴', name:'Colombia',                code:'+57',  digits:10 },
  { flag:'🇰🇲', name:'Comoros',                 code:'+269', digits:7  },
  { flag:'🇨🇩', name:'Congo (DRC)',             code:'+243', digits:9  },
  { flag:'🇨🇬', name:'Congo (Republic)',        code:'+242', digits:9  },
  { flag:'🇨🇷', name:'Costa Rica',              code:'+506', digits:8  },
  { flag:'🇭🇷', name:'Croatia',                 code:'+385', digits:9  },
  { flag:'🇨🇺', name:'Cuba',                    code:'+53',  digits:8  },
  { flag:'🇨🇾', name:'Cyprus',                  code:'+357', digits:8  },
  { flag:'🇨🇿', name:'Czech Republic',          code:'+420', digits:9  },
  { flag:'🇩🇰', name:'Denmark',                 code:'+45',  digits:8  },
  { flag:'🇩🇯', name:'Djibouti',                code:'+253', digits:8  },
  { flag:'🇩🇴', name:'Dominican Republic',      code:'+1809',digits:7  },
  { flag:'🇪🇨', name:'Ecuador',                 code:'+593', digits:9  },
  { flag:'🇪🇬', name:'Egypt',                   code:'+20',  digits:10 },
  { flag:'🇸🇻', name:'El Salvador',             code:'+503', digits:8  },
  { flag:'🇬🇶', name:'Equatorial Guinea',       code:'+240', digits:9  },
  { flag:'🇪🇷', name:'Eritrea',                 code:'+291', digits:7  },
  { flag:'🇪🇪', name:'Estonia',                 code:'+372', digits:8  },
  { flag:'🇸🇿', name:'Eswatini',                code:'+268', digits:8  },
  { flag:'🇪🇹', name:'Ethiopia',                code:'+251', digits:9  },
  { flag:'🇫🇯', name:'Fiji',                    code:'+679', digits:7  },
  { flag:'🇫🇮', name:'Finland',                 code:'+358', digits:null},
  { flag:'🇫🇷', name:'France',                  code:'+33',  digits:9  },
  { flag:'🇬🇦', name:'Gabon',                   code:'+241', digits:8  },
  { flag:'🇬🇲', name:'Gambia',                  code:'+220', digits:7  },
  { flag:'🇬🇪', name:'Georgia',                 code:'+995', digits:9  },
  { flag:'🇩🇪', name:'Germany',                 code:'+49',  digits:null},
  { flag:'🇬🇭', name:'Ghana',                   code:'+233', digits:9  },
  { flag:'🇬🇷', name:'Greece',                  code:'+30',  digits:10 },
  { flag:'🇬🇩', name:'Grenada',                 code:'+1473',digits:7  },
  { flag:'🇬🇹', name:'Guatemala',               code:'+502', digits:8  },
  { flag:'🇬🇳', name:'Guinea',                  code:'+224', digits:9  },
  { flag:'🇬🇼', name:'Guinea-Bissau',           code:'+245', digits:7  },
  { flag:'🇬🇾', name:'Guyana',                  code:'+592', digits:7  },
  { flag:'🇭🇹', name:'Haiti',                   code:'+509', digits:8  },
  { flag:'🇭🇳', name:'Honduras',                code:'+504', digits:8  },
  { flag:'🇭🇺', name:'Hungary',                 code:'+36',  digits:9  },
  { flag:'🇮🇸', name:'Iceland',                 code:'+354', digits:7  },
  { flag:'🇮🇳', name:'India',                   code:'+91',  digits:10 },
  { flag:'🇮🇩', name:'Indonesia',               code:'+62',  digits:10 },
  { flag:'🇮🇷', name:'Iran',                    code:'+98',  digits:10 },
  { flag:'🇮🇶', name:'Iraq',                    code:'+964', digits:10 },
  { flag:'🇮🇪', name:'Ireland',                 code:'+353', digits:9  },
  { flag:'🇮🇱', name:'Israel',                  code:'+972', digits:9  },
  { flag:'🇮🇹', name:'Italy',                   code:'+39',  digits:10 },
  { flag:'🇯🇲', name:'Jamaica',                 code:'+1876',digits:7  },
  { flag:'🇯🇵', name:'Japan',                   code:'+81',  digits:10 },
  { flag:'🇯🇴', name:'Jordan',                  code:'+962', digits:9  },
  { flag:'🇰🇿', name:'Kazakhstan',              code:'+7',   digits:10 },
  { flag:'🇰🇪', name:'Kenya',                   code:'+254', digits:9  },
  { flag:'🇰🇮', name:'Kiribati',                code:'+686', digits:8  },
  { flag:'🇰🇼', name:'Kuwait',                  code:'+965', digits:8  },
  { flag:'🇰🇬', name:'Kyrgyzstan',              code:'+996', digits:9  },
  { flag:'🇱🇦', name:'Laos',                    code:'+856', digits:9  },
  { flag:'🇱🇻', name:'Latvia',                  code:'+371', digits:8  },
  { flag:'🇱🇧', name:'Lebanon',                 code:'+961', digits:8  },
  { flag:'🇱🇸', name:'Lesotho',                 code:'+266', digits:8  },
  { flag:'🇱🇷', name:'Liberia',                 code:'+231', digits:8  },
  { flag:'🇱🇾', name:'Libya',                   code:'+218', digits:9  },
  { flag:'🇱🇮', name:'Liechtenstein',           code:'+423', digits:7  },
  { flag:'🇱🇹', name:'Lithuania',               code:'+370', digits:8  },
  { flag:'🇱🇺', name:'Luxembourg',              code:'+352', digits:null},
  { flag:'🇲🇬', name:'Madagascar',              code:'+261', digits:9  },
  { flag:'🇲🇼', name:'Malawi',                  code:'+265', digits:9  },
  { flag:'🇲🇾', name:'Malaysia',                code:'+60',  digits:9  },
  { flag:'🇲🇻', name:'Maldives',                code:'+960', digits:7  },
  { flag:'🇲🇱', name:'Mali',                    code:'+223', digits:8  },
  { flag:'🇲🇹', name:'Malta',                   code:'+356', digits:8  },
  { flag:'🇲🇭', name:'Marshall Islands',        code:'+692', digits:7  },
  { flag:'🇲🇷', name:'Mauritania',              code:'+222', digits:8  },
  { flag:'🇲🇺', name:'Mauritius',               code:'+230', digits:8  },
  { flag:'🇲🇽', name:'Mexico',                  code:'+52',  digits:10 },
  { flag:'🇫🇲', name:'Micronesia',              code:'+691', digits:7  },
  { flag:'🇲🇩', name:'Moldova',                 code:'+373', digits:8  },
  { flag:'🇲🇨', name:'Monaco',                  code:'+377', digits:8  },
  { flag:'🇲🇳', name:'Mongolia',                code:'+976', digits:8  },
  { flag:'🇲🇪', name:'Montenegro',              code:'+382', digits:8  },
  { flag:'🇲🇦', name:'Morocco',                 code:'+212', digits:9  },
  { flag:'🇲🇿', name:'Mozambique',              code:'+258', digits:9  },
  { flag:'🇲🇲', name:'Myanmar',                 code:'+95',  digits:9  },
  { flag:'🇳🇦', name:'Namibia',                 code:'+264', digits:9  },
  { flag:'🇳🇷', name:'Nauru',                   code:'+674', digits:7  },
  { flag:'🇳🇵', name:'Nepal',                   code:'+977', digits:10 },
  { flag:'🇳🇱', name:'Netherlands',             code:'+31',  digits:9  },
  { flag:'🇳🇿', name:'New Zealand',             code:'+64',  digits:9  },
  { flag:'🇳🇮', name:'Nicaragua',               code:'+505', digits:8  },
  { flag:'🇳🇪', name:'Niger',                   code:'+227', digits:8  },
  { flag:'🇳🇬', name:'Nigeria',                 code:'+234', digits:10 },
  { flag:'🇲🇰', name:'North Macedonia',         code:'+389', digits:8  },
  { flag:'🇳🇴', name:'Norway',                  code:'+47',  digits:8  },
  { flag:'🇴🇲', name:'Oman',                    code:'+968', digits:8  },
  { flag:'🇵🇰', name:'Pakistan',                code:'+92',  digits:10 },
  { flag:'🇵🇼', name:'Palau',                   code:'+680', digits:7  },
  { flag:'🇵🇦', name:'Panama',                  code:'+507', digits:8  },
  { flag:'🇵🇬', name:'Papua New Guinea',        code:'+675', digits:8  },
  { flag:'🇵🇾', name:'Paraguay',                code:'+595', digits:9  },
  { flag:'🇵🇪', name:'Peru',                    code:'+51',  digits:9  },
  { flag:'🇵🇭', name:'Philippines',             code:'+63',  digits:10 },
  { flag:'🇵🇱', name:'Poland',                  code:'+48',  digits:9  },
  { flag:'🇵🇹', name:'Portugal',                code:'+351', digits:9  },
  { flag:'🇶🇦', name:'Qatar',                   code:'+974', digits:8  },
  { flag:'🇷🇴', name:'Romania',                 code:'+40',  digits:9  },
  { flag:'🇷🇺', name:'Russia',                  code:'+7',   digits:10 },
  { flag:'🇷🇼', name:'Rwanda',                  code:'+250', digits:9  },
  { flag:'🇰🇳', name:'Saint Kitts & Nevis',     code:'+1869',digits:7  },
  { flag:'🇱🇨', name:'Saint Lucia',             code:'+1758',digits:7  },
  { flag:'🇻🇨', name:'Saint Vincent',           code:'+1784',digits:7  },
  { flag:'🇼🇸', name:'Samoa',                   code:'+685', digits:7  },
  { flag:'🇸🇲', name:'San Marino',              code:'+378', digits:null},
  { flag:'🇸🇹', name:'São Tomé & Príncipe',     code:'+239', digits:7  },
  { flag:'🇸🇦', name:'Saudi Arabia',            code:'+966', digits:9  },
  { flag:'🇸🇳', name:'Senegal',                 code:'+221', digits:9  },
  { flag:'🇷🇸', name:'Serbia',                  code:'+381', digits:9  },
  { flag:'🇸🇨', name:'Seychelles',              code:'+248', digits:7  },
  { flag:'🇸🇱', name:'Sierra Leone',            code:'+232', digits:8  },
  { flag:'🇸🇬', name:'Singapore',               code:'+65',  digits:8  },
  { flag:'🇸🇰', name:'Slovakia',                code:'+421', digits:9  },
  { flag:'🇸🇮', name:'Slovenia',                code:'+386', digits:8  },
  { flag:'🇸🇧', name:'Solomon Islands',         code:'+677', digits:7  },
  { flag:'🇸🇴', name:'Somalia',                 code:'+252', digits:8  },
  { flag:'🇿🇦', name:'South Africa',            code:'+27',  digits:9  },
  { flag:'🇸🇸', name:'South Sudan',             code:'+211', digits:9  },
  { flag:'🇪🇸', name:'Spain',                   code:'+34',  digits:9  },
  { flag:'🇱🇰', name:'Sri Lanka',               code:'+94',  digits:9  },
  { flag:'🇸🇩', name:'Sudan',                   code:'+249', digits:9  },
  { flag:'🇸🇷', name:'Suriname',                code:'+597', digits:7  },
  { flag:'🇸🇪', name:'Sweden',                  code:'+46',  digits:null},
  { flag:'🇨🇭', name:'Switzerland',             code:'+41',  digits:9  },
  { flag:'🇸🇾', name:'Syria',                   code:'+963', digits:9  },
  { flag:'🇹🇼', name:'Taiwan',                  code:'+886', digits:9  },
  { flag:'🇹🇯', name:'Tajikistan',              code:'+992', digits:9  },
  { flag:'🇹🇿', name:'Tanzania',                code:'+255', digits:9  },
  { flag:'🇹🇭', name:'Thailand',                code:'+66',  digits:9  },
  { flag:'🇹🇱', name:'Timor-Leste',             code:'+670', digits:8  },
  { flag:'🇹🇬', name:'Togo',                    code:'+228', digits:8  },
  { flag:'🇹🇴', name:'Tonga',                   code:'+676', digits:7  },
  { flag:'🇹🇹', name:'Trinidad & Tobago',       code:'+1868',digits:7  },
  { flag:'🇹🇳', name:'Tunisia',                 code:'+216', digits:8  },
  { flag:'🇹🇷', name:'Turkey',                  code:'+90',  digits:10 },
  { flag:'🇹🇲', name:'Turkmenistan',            code:'+993', digits:8  },
  { flag:'🇹🇻', name:'Tuvalu',                  code:'+688', digits:6  },
  { flag:'🇺🇬', name:'Uganda',                  code:'+256', digits:9  },
  { flag:'🇺🇦', name:'Ukraine',                 code:'+380', digits:9  },
  { flag:'🇦🇪', name:'United Arab Emirates',    code:'+971', digits:9  },
  { flag:'🇬🇧', name:'United Kingdom',          code:'+44',  digits:10 },
  { flag:'🇺🇸', name:'United States',           code:'+1',   digits:10 },
  { flag:'🇺🇾', name:'Uruguay',                 code:'+598', digits:9  },
  { flag:'🇺🇿', name:'Uzbekistan',              code:'+998', digits:9  },
  { flag:'🇻🇺', name:'Vanuatu',                 code:'+678', digits:7  },
  { flag:'🇻🇦', name:'Vatican City',            code:'+379', digits:null},
  { flag:'🇻🇪', name:'Venezuela',               code:'+58',  digits:10 },
  { flag:'🇻🇳', name:'Vietnam',                 code:'+84',  digits:9  },
  { flag:'🇾🇪', name:'Yemen',                   code:'+967', digits:9  },
  { flag:'🇿🇲', name:'Zambia',                  code:'+260', digits:9  },
  { flag:'🇿🇼', name:'Zimbabwe',                code:'+263', digits:9  },
];

const getExpectedDigits = (code) => {
  const match = COUNTRY_LIST.find(c => c.code === code);
  return match ? match.digits : null;
};
const getCountryByCode = (code) => COUNTRY_LIST.find(c => c.code === code) || null;
const formatPhoneForStorage = (code, number) => `${code} ${number}`;
const parseStoredPhone = (stored) => {
  if (!stored || typeof stored !== 'string') return { code: '+91', number: '' };
  const trimmed = stored.trim();
  const match = trimmed.match(/^(\+\d{1,4})\s(.*)$/);
  if (match) return { code: match[1], number: match[2].replace(/\D/g, '') };
  return { code: '+91', number: trimmed.replace(/\D/g, '') };
};

const REQUIRED_PROFESSIONAL = ['employeeId', 'designation', 'instituteCode'];

const generateEmpId = () => `EMP-${Math.floor(100000 + Math.random() * 900000)}`;

const DEFAULT_STAFF_FORM = {
  staffType: 'Academic', firstName: '', lastName: '', email: '',
  phoneCode: '+91', phone: '',
  gender: '', dob: '', bloodGroup: '', qualification: '', qualificationOther: '',
  designation: '', employeeId: '', joiningDate: '', departmentId: '', address: '',
  password: '', panNumber: '', aadhaarNumber: '', instituteCode: '',
  bankName: '', accountName: '', accountNumber: '', ifscCode: '', branchName: ''
};

const DEFAULT_DOCS = {
  panCard: null, aadhaarCard: null, profilePhoto: null,
  degreeCertificate: null, experienceLetter: null, otherDocs: [],
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
const FormField = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
      <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
      {hint && <span className="text-[9px] text-blue-400 normal-case">{hint}</span>}
    </label>
    {children}
  </div>
);

function SelectWithOther({ label, required, hint, value, onChange, onOtherChange, otherValue, options, otherPlaceholder = 'Please specify...' }) {
  const safeValue = value || '';
  const isOther = safeValue === 'Other';
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
        <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
        {hint && <span className="text-[9px] text-blue-400 normal-case">{hint}</span>}
      </label>
      <select value={safeValue} onChange={e => { onChange(e.target.value); if (e.target.value !== 'Other') onOtherChange(''); }} className="form-input cursor-pointer text-left">
        <option value="">Select</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {isOther && (
        <input type="text" placeholder={otherPlaceholder} value={otherValue || ''} onChange={e => onOtherChange(e.target.value)} autoFocus className="form-input text-left border-blue-400 bg-blue-50/30 focus:bg-white mt-1" />
      )}
    </div>
  );
}

// ─── UNIFIED PHONE NUMBER INPUT ───────────────────────────────────────────────
function PhoneNumberInput({ phoneCode, phone, onCodeChange, onPhoneChange }) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState('');
  const wrapperRef            = useRef(null);
  const searchRef             = useRef(null);

  const safePhoneCode = phoneCode || '+91';
  const safePhone = phone || '';

  const selected = getCountryByCode(safePhoneCode) || COUNTRY_LIST.find(c => c.name === 'India');

  useEffect(() => {
    const close = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('scroll', close, true); };
  }, []);

  useEffect(() => { if (open) setTimeout(() => searchRef.current?.focus(), 50); }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return COUNTRY_LIST;
    return COUNTRY_LIST.filter(c =>
      c.name.toLowerCase().includes(q) || c.code.includes(q)
    );
  }, [search]);

  const expectedDigits = getExpectedDigits(safePhoneCode);
  const touched  = safePhone.length > 0;
  const isValid  = expectedDigits ? safePhone.length === expectedDigits : safePhone.length >= 7;
  const maxLen   = expectedDigits || 15;

  return (
    <div className="flex flex-col gap-1.5 text-left" ref={wrapperRef}>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
        <span>Mobile Number<span className="text-red-500 ml-0.5">*</span></span>
        {touched && (
          <span className={`text-[9px] normal-case font-bold ${isValid ? 'text-green-500' : 'text-red-400'}`}>
            {isValid ? '✓ Valid' : expectedDigits ? `${safePhone.length}/${expectedDigits} digits` : `${safePhone.length} digits (min 7)`}
          </span>
        )}
      </label>

      <div className={`flex items-stretch rounded-xl border overflow-visible transition-all
        ${open ? 'border-blue-500 ring-2 ring-blue-100' : touched ? isValid ? 'border-green-400' : 'border-red-300' : 'border-gray-200'}
        bg-white`}
        style={{ position: 'relative' }}
      >
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(''); }}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-gray-50 border-r border-gray-200 rounded-l-xl hover:bg-gray-100 transition-colors flex-shrink-0 min-w-[80px] justify-center"
        >
          <span className="text-lg leading-none">{selected?.flag}</span>
          <span className="text-xs font-black text-gray-700 font-mono">{safePhoneCode}</span>
          <svg className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
        </button>

        <input
          type="tel"
          placeholder={expectedDigits ? `${expectedDigits}-digit number` : 'Mobile number'}
          value={safePhone}
          onChange={e => onPhoneChange(e.target.value.replace(/\D/g, '').slice(0, maxLen))}
          maxLength={maxLen}
          className="flex-1 px-3 py-2.5 bg-transparent text-sm font-semibold text-gray-800 outline-none rounded-r-xl font-mono tracking-wider placeholder:font-normal placeholder:tracking-normal"
        />

        {touched && (
          <div className="flex items-center pr-3">
            {isValid ? <CheckCircle size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-400" />}
          </div>
        )}

        {open && (
          <div className="absolute left-0 top-[calc(100%+4px)] w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
            style={{ zIndex: 9999 }}>
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 focus-within:border-blue-400">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z"/></svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search country..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-xs font-semibold text-gray-700 outline-none placeholder:text-gray-400"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <ul className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-xs text-gray-400 text-center">No countries found</li>
              ) : filtered.map((c, i) => (
                <li
                  key={i}
                  onMouseDown={(e) => { e.preventDefault(); onCodeChange(c.code); setOpen(false); setSearch(''); }}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0
                    ${c.code === safePhoneCode ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-gray-700'}`}
                >
                  <span className="text-base leading-none flex-shrink-0">{c.flag}</span>
                  <span className={`flex-1 text-xs font-semibold truncate ${c.code === safePhoneCode ? 'text-white' : 'text-gray-700'}`}>{c.name}</span>
                  <span className={`text-[11px] font-black font-mono flex-shrink-0 ${c.code === safePhoneCode ? 'text-blue-100' : 'text-gray-400'}`}>{c.code}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SAFE ACCOUNT NUMBER INPUT ────────────────────────────────────────────────
// 🚀 FIXED: Added safeValue to prevent Cannot read properties of null (reading 'length')
function AccountNumberInput({ value, onChange }) {
  const safeValue = value || '';
  const touched  = safeValue.length > 0;
  const isValid  = safeValue.length >= 8;

  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
        <span>Account Number</span>
        {touched && (
          <span className={`text-[9px] normal-case font-bold ${isValid ? 'text-green-500' : 'text-orange-400'}`}>
            {isValid ? '✓ Valid' : `Too short`}
          </span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          placeholder="Enter account number"
          value={safeValue}
          onChange={e => onChange(e.target.value.replace(/\D/g, ''))} // Allows only numbers, NO length limit
          className={`form-input !pr-10 font-mono tracking-widest text-left
            ${touched ? isValid ? 'border-green-400 bg-green-50/20' : 'border-orange-300 bg-orange-50/10' : ''}`}
        />
        {touched && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid
              ? <CheckCircle size={15} className="text-green-500" />
              : <AlertCircle size={15} className="text-orange-400" />}
          </div>
        )}
      </div>
    </div>
  );
}

function AutocompleteField({ label, required, value, onChange, options, placeholder, hint }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const wrapperRef = useRef(null);

  // 🚀 FIXED: Ensure safe rendering
  const safeValue = value || '';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val.trim()) {
      const filtered = options.filter(opt => opt.toLowerCase().includes(val.toLowerCase()) && opt.toLowerCase() !== val.toLowerCase());
      setFilteredOptions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={`flex flex-col gap-1.5 text-left relative ${isOpen ? 'z-50' : 'z-10'}`}>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
        <span>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</span>
        {hint && !isOpen && <span className="text-[9px] text-blue-400 normal-case">{hint}</span>}
        {isOpen && <span className="text-[9px] text-blue-400 normal-case font-bold animate-pulse">Select or keep typing...</span>}
      </label>
      <input type="text" value={safeValue} onChange={handleInputChange} onFocus={handleInputChange} placeholder={placeholder} className="form-input text-left" autoComplete="off" />
      {isOpen && (
        <ul className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50">
          {filteredOptions.map((opt, i) => (
            <li key={i} onMouseDown={(e) => { e.preventDefault(); onChange(opt); setIsOpen(false); }} className="px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors border-b border-gray-50 last:border-0">
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── FILE DROP ZONES ──────────────────────────────────────────────────────────
function FileDropZone({ label, accept, file, onChange, onRemove, hint }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const handleDrop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onChange(f); };
  const fmt = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  const isImg = file?.type?.startsWith('image/');
  
  return (
    <div className="flex flex-col gap-1.5 text-left w-full justify-end">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
      {!file ? (
        <div 
          onClick={() => inputRef.current?.click()} 
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} 
          onDragLeave={() => setDrag(false)} 
          onDrop={handleDrop} 
          className={`flex items-center justify-center gap-2 px-4 py-[0.65rem] border-2 border-dashed rounded-xl cursor-pointer transition-all h-[42px] ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
        >
          <Upload size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-xs font-bold text-gray-600 truncate">
            Upload File {hint && <span className="font-medium text-gray-400 ml-1">({hint})</span>}
          </span>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files[0] && onChange(e.target.files[0])} />
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3 py-1 bg-white border border-gray-200 rounded-xl shadow-sm h-[42px]">
          <div className="w-6 h-6 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center">
            {isImg ? <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" /> : <FileText size={12} className="text-blue-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-800 truncate leading-tight">{file.name}</p>
            <p className="text-[9px] text-gray-400 leading-tight">{fmt(file.size)}</p>
          </div>
          <button type="button" onClick={onRemove} className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

function MultiFileDropZone({ files, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const add = (fl) => onChange(prev => [...prev, ...Array.from(fl)]);
  const remove = (i) => onChange(prev => prev.filter((_, idx) => idx !== i));
  const fmt = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;
  
  return (
    <div className="flex flex-col gap-2 text-left">
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Other Documents</label>
      <div onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }} 
        className={`flex items-center gap-3 px-4 py-[0.65rem] border-2 border-dashed rounded-xl cursor-pointer transition-all ${drag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
        <Upload size={14} className="text-gray-400 flex-shrink-0" />
        <span className="text-xs font-semibold text-gray-500 truncate">Add files (offer letter, certificates...)</span>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={e => add(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg">
              <File size={12} className="text-blue-400 flex-shrink-0" />
              <span className="flex-1 text-[11px] font-semibold text-gray-700 truncate">{f.name}</span>
              <span className="text-[9px] text-gray-400 flex-shrink-0">{fmt(f.size)}</span>
              <button type="button" onClick={() => remove(i)} className="p-0.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"><X size={12} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FORM SECTIONS ────────────────────────────────────────────────────────────
function PersonalInfoSection({ formData, setField, showPassword, onTogglePassword, isEditing }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
      <FormField label="First Name" required><input type="text" placeholder="e.g. Rajesh" value={formData.firstName || ''} onChange={e => setField('firstName', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Last Name" required><input type="text" placeholder="e.g. Kumar" value={formData.lastName || ''} onChange={e => setField('lastName', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Gender">
        <select value={formData.gender || ''} onChange={e => setField('gender', e.target.value)} className="form-input cursor-pointer text-left">
          <option value="">Select</option>{GENDERS.map(g => <option key={g}>{g}</option>)}
        </select>
      </FormField>
      <FormField label="Date of Birth"><input type="date" value={formData.dob || ''} onChange={e => setField('dob', e.target.value)} className="form-input cursor-pointer text-left" /></FormField>
      <FormField label="Blood Group">
        <select value={formData.bloodGroup || ''} onChange={e => setField('bloodGroup', e.target.value)} className="form-input cursor-pointer text-left">
          <option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
        </select>
      </FormField>
      
      <PhoneNumberInput phoneCode={formData.phoneCode} phone={formData.phone} onCodeChange={(val) => setField('phoneCode', val)} onPhoneChange={(val) => setField('phone', val)} />
      
      <FormField label="Email Address" required><input type="email" placeholder="staff@college.edu" value={formData.email || ''} onChange={e => setField('email', e.target.value)} className="form-input text-left" autoComplete="username" /></FormField>
      <FormField label={isEditing ? "Update Password" : "Login Password"} required={!isEditing} hint={isEditing ? "(Leave blank to keep current)" : ""}>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} placeholder={isEditing ? "Enter new password..." : "Set login password"} value={formData.password || ''} onChange={e => setField('password', e.target.value)} className="form-input !pr-10 text-left" autoComplete="new-password" />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
        </div>
      </FormField>
      <FormField label="Residential Address"><input type="text" placeholder="Street, City" value={formData.address || ''} onChange={e => setField('address', e.target.value)} className="form-input text-left" /></FormField>
    </div>
  );
}

function ProfessionalInfoSection({ formData, setField, staffTab, departments, dynamicDesignations }) {
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const deptOptions = safeDepartments.filter(d => d.type === staffTab);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
      <FormField label="Employee ID" required hint="Auto-Generated">
        <input type="text" value={formData.employeeId || ''} readOnly className="form-input text-left bg-gray-100 text-gray-500 cursor-not-allowed font-mono tracking-widest" />
      </FormField>

      <AutocompleteField label="Designation" required hint="Type new or select" value={formData.designation} onChange={(val) => setField('designation', val)} options={dynamicDesignations} placeholder="e.g. Professor, Clerk..." />

      <SelectWithOther label="Highest Qualification" value={formData.qualification} onChange={(val) => setField('qualification', val)} otherValue={formData.qualificationOther} onOtherChange={(val) => setField('qualificationOther', val)} options={QUALIFICATIONS} otherPlaceholder="e.g. M.Phil, CA..." />

      <FormField label="Joining Date"><input type="date" value={formData.joiningDate || ''} onChange={e => setField('joiningDate', e.target.value)} className="form-input cursor-pointer text-left" /></FormField>

      <FormField label="Assigned Department">
        <select value={formData.departmentId || ''} onChange={e => setField('departmentId', e.target.value)} className="form-input cursor-pointer text-left">
          <option value="">Select Department</option>
          {deptOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </FormField>

      <FormField label="Staff Category">
        <div className={`form-input flex items-center gap-2 font-bold text-sm cursor-default text-left ${staffTab === 'Academic' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-blue-600 bg-blue-50 border-blue-200'}`}>
          {staffTab === 'Academic' ? <GraduationCap size={15} /> : <Briefcase size={15} />} {staffTab} Staff
        </div>
      </FormField>

      <FormField label="Institute Code" required hint="Auto-Assigned">
        <div className="relative">
          <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={formData.instituteCode || ''} readOnly className="form-input !pl-10 text-left bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 font-mono tracking-widest" />
        </div>
      </FormField>
    </div>
  );
}

function BankDetailsSection({ formData, setField }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
      <FormField label="Bank Name"><input type="text" placeholder="e.g. State Bank of India" value={formData.bankName || ''} onChange={e => setField('bankName', e.target.value)} className="form-input text-left" /></FormField>
      <FormField label="Account Holder Name" hint="As per bank records"><input type="text" placeholder="e.g. Rajesh Kumar" value={formData.accountName || ''} onChange={e => setField('accountName', e.target.value)} className="form-input text-left" /></FormField>
      
      <AccountNumberInput value={formData.accountNumber} onChange={(val) => setField('accountNumber', val)} />
      
      <FormField label="IFSC Code"><input type="text" placeholder="e.g. SBIN0001234" value={formData.ifscCode || ''} onChange={e => setField('ifscCode', e.target.value.toUpperCase().replace(/\s/g, ''))} maxLength={11} className="form-input text-left uppercase font-mono tracking-wider" /></FormField>
      <FormField label="Branch Name"><input type="text" placeholder="e.g. Main Branch" value={formData.branchName || ''} onChange={e => setField('branchName', e.target.value)} className="form-input text-left" /></FormField>
    </div>
  );
}

// ─── FILE DOCUMENTS SECTION ───────────────────────────────────────────────────
function DocumentsSection({ formData, setField, docs, setDocField, setDocs }) {
  const panVal     = (formData.panNumber || '').toUpperCase();
  const panValid   = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panVal);
  const panTouched = panVal.length > 0;

  const aadhaarRaw     = (formData.aadhaarNumber || '').replace(/\s/g, '');
  const aadhaarValid   = /^\d{12}$/.test(aadhaarRaw);
  const aadhaarTouched = aadhaarRaw.length > 0;

  const handleAadhaarChange = (e) => {
    const digits    = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = digits.replace(/(\d{4})(\d{0,4})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(' '));
    setField('aadhaarNumber', formatted);
  };

  return (
    <div className="space-y-8 text-left">
      
      {/* ── Side-by-Side: Identity Details ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-blue-600 rounded-full" />
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Identity Details</h4>
        </div>
        
        <div className="space-y-5">
          {/* PAN ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">PAN Card Number</label>
              <div className="relative">
                <input type="text" placeholder="ABCDE1234F" value={formData.panNumber || ''} onChange={e => setField('panNumber', e.target.value.toUpperCase().slice(0, 10))} maxLength={10} className={`form-input !pr-10 font-mono tracking-widest text-left ${panTouched ? panValid ? 'border-green-400 bg-green-50/30' : 'border-red-300 bg-red-50/20' : ''}`} />
                {panTouched && <div className="absolute right-3 top-1/2 -translate-y-1/2">{panValid ? <CheckCircle size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-400" />}</div>}
              </div>
            </div>
            <FileDropZone label="PAN Card Scan" accept=".pdf,.jpg,.png" hint="Max 5MB" file={docs.panCard} onChange={f => setDocField('panCard', f)} onRemove={() => setDocField('panCard', null)} />
          </div>

          {/* AADHAAR ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Aadhaar Card Number</label>
              <div className="relative">
                <input type="text" placeholder="XXXX XXXX XXXX" value={formData.aadhaarNumber || ''} onChange={handleAadhaarChange} maxLength={14} className={`form-input !pr-10 font-mono tracking-widest text-left ${aadhaarTouched ? aadhaarValid ? 'border-green-400 bg-green-50/30' : 'border-red-300 bg-red-50/20' : ''}`} />
                {aadhaarTouched && <div className="absolute right-3 top-1/2 -translate-y-1/2">{aadhaarValid ? <CheckCircle size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-400" />}</div>}
              </div>
            </div>
            <FileDropZone label="Aadhaar Card Scan" accept=".pdf,.jpg,.png" hint="Max 5MB" file={docs.aadhaarCard} onChange={f => setDocField('aadhaarCard', f)} onRemove={() => setDocField('aadhaarCard', null)} />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* ── Smaller Cards: Supporting Documents ── */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-4 bg-blue-600 rounded-full" />
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Supporting Documents</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <FileDropZone label="Profile Photo" accept=".jpg,.png,.webp" hint="JPG/PNG" file={docs.profilePhoto} onChange={f => setDocField('profilePhoto', f)} onRemove={() => setDocField('profilePhoto', null)} icon={Image} />
          <FileDropZone label="Degree Certificate" accept=".pdf,.jpg,.png" hint="Highest degree" file={docs.degreeCertificate} onChange={f => setDocField('degreeCertificate', f)} onRemove={() => setDocField('degreeCertificate', null)} />
          <FileDropZone label="Experience Letter" accept=".pdf,.jpg,.png" hint="Prev employer" file={docs.experienceLetter} onChange={f => setDocField('experienceLetter', f)} onRemove={() => setDocField('experienceLetter', null)} />
        </div>
        <div className="mt-5">
          <MultiFileDropZone files={docs.otherDocs} onChange={updater => setDocs(prev => ({ ...prev, otherDocs: typeof updater === 'function' ? updater(prev.otherDocs) : updater }))} />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const Employee = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const isEditing   = Boolean(id);

  const userStr              = localStorage.getItem('user');
  const userObj              = userStr ? JSON.parse(userStr) : null;
  const currentInstituteCode = localStorage.getItem('instituteCode') || userObj?.code || userObj?.instituteCode || '';

  const [formData, setFormData]       = useState({
    ...DEFAULT_STAFF_FORM,
    instituteCode: currentInstituteCode,
    employeeId: isEditing ? '' : generateEmpId(),
  });
  const [docs, setDocs]               = useState({ ...DEFAULT_DOCS, otherDocs: [] });
  const [staffTab, setStaffTab]       = useState('Academic');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);
  const [departments, setDepartments] = useState([]);
  const [dbDesignations, setDbDesignations] = useState([]);

  useEffect(() => {
    api.get('/admin/departments').then(res => { if (res.data?.success) setDepartments(res.data.data); }).catch(() => {});
    api.get('/admin/employees/designations').then(res => { if (res.data?.success) setDbDesignations(res.data.data); }).catch(() => {});
  }, []);

  const dynamicDesignations = useMemo(() => {
    const baseList = staffTab === 'Academic' ? ACADEMIC_DESIGNATIONS : NON_ACADEMIC_DESIGNATIONS;
    return [...new Set([...baseList, ...dbDesignations])].sort();
  }, [staffTab, dbDesignations]);

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/admin/employees/${id}`)
      .then(res => {
        if (res.data?.success) {
          const emp = res.data.data;
          const isKnownQual = QUALIFICATIONS.includes(emp.qualification);
          
          // 🚀 GLOBAL NULL SANITIZER: Prevents React component crashes
          const sanitizedData = {};
          Object.keys(emp).forEach(key => {
             sanitizedData[key] = emp[key] === null ? '' : emp[key];
          });

          const { code: pCode, number: pNum } = parseStoredPhone(sanitizedData.phone);

          setFormData({
            ...DEFAULT_STAFF_FORM,
            ...sanitizedData,
            phoneCode: pCode,
            phone: pNum,
            dob: sanitizedData.dob ? sanitizedData.dob.split('T')[0] : '',
            joiningDate: sanitizedData.joiningDate ? sanitizedData.joiningDate.split('T')[0] : '',
            password: '',
            instituteCode: sanitizedData.instituteCode || sanitizedData.institute_code || currentInstituteCode,
            qualification: isKnownQual ? (sanitizedData.qualification || '') : 'Other',
            qualificationOther: isKnownQual ? '' : (sanitizedData.qualification || ''),
          });
          setStaffTab(sanitizedData.staffType || 'Academic');
        }
      })
      .finally(() => setIsLoadingData(false));
  }, [id, isEditing, currentInstituteCode]);

  const setField    = useCallback((k, v) => setFormData(p => ({ ...p, [k]: v })), []);
  const setDocField = useCallback((k, v) => setDocs(p => ({ ...p, [k]: v })), []);

  const handleTabChange = (tab) => {
    if (isEditing) { alert("You cannot change the Staff Category of an existing employee."); return; }
    if (staffTab === tab) return;
    setStaffTab(tab);
    setFormData(prev => ({ ...prev, staffType: tab, designation: '', departmentId: '' }));
  };

  const validate = () => {
    const personalReq = isEditing
      ? ['firstName', 'lastName', 'email', 'phone', 'instituteCode']
      : ['firstName', 'lastName', 'email', 'phone', 'password', 'instituteCode'];
    const allReq = [...personalReq, ...REQUIRED_PROFESSIONAL];

    const missing = allReq.filter(k => !formData[k] || !String(formData[k]).trim());
    if (missing.length) {
      alert(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    const expectedDigits = getExpectedDigits(formData.phoneCode);
    if (expectedDigits && formData.phone.length !== expectedDigits) {
      alert(`Phone number must be exactly ${expectedDigits} digits for ${formData.phoneCode}.`);
      return false;
    }
    if (!expectedDigits && formData.phone.length < 7) {
      alert('Please enter a valid phone number (at least 7 digits).');
      return false;
    }

    if (formData.qualification === 'Other' && !formData.qualificationOther?.trim()) {
      alert('Please specify your qualification in the "Other" field.');
      return false;
    }

    // 🚀 FIXED: The 15-digit bank account validation logic was completely removed!

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setIsSubmitting(true);
      const payload = new FormData();

      const resolvedQualification = formData.qualification === 'Other'
        ? (formData.qualificationOther?.trim() || 'Other')
        : formData.qualification;

      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'qualification')      payload.append(k, resolvedQualification);
        else if (k === 'qualificationOther') return;
        else if (k === 'phoneCode')     return;
        else if (k === 'phone')         payload.append('phone', formatPhoneForStorage(formData.phoneCode, formData.phone));
        else                            payload.append(k, v ?? '');
      });

      ['panCard', 'aadhaarCard', 'profilePhoto', 'degreeCertificate', 'experienceLetter'].forEach(k => {
        if (docs[k]) payload.append(k, docs[k]);
      });
      docs.otherDocs.forEach(f => payload.append('otherDocs', f));

      if (isEditing) {
        await api.put(`/admin/employees/${id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Employee updated successfully!');
        navigate(-1);
      } else {
        await api.post('/admin/employees/register', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
        alert('Employee registered successfully!');
        api.get('/admin/employees/designations').then(res => { if (res.data?.success) setDbDesignations(res.data.data); });
        setFormData({ ...DEFAULT_STAFF_FORM, staffType: staffTab, instituteCode: currentInstituteCode, employeeId: generateEmpId() });
        setDocs({ ...DEFAULT_DOCS, otherDocs: [] });
        setShowPassword(false);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Conflict: Duplicate Data Detected. Check Email or Phone.';
      alert(`Save Failed: ${serverMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 size={40} className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <style>{`
        .form-input {
          width: 100%; padding: 0.75rem 1rem; background: #f8fafc;
          border: 1px solid #e2e8f0; border-radius: 0.75rem;
          font-size: 0.85rem; font-weight: 600; outline: none;
          transition: all 0.15s; text-align: left;
        }
        .form-input:focus { border-color: #3b82f6; background: #fff; }
      `}</style>
      <div className="max-w-8xl mx-auto">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900">{isEditing ? 'Edit Profile' : 'Onboard Employee'}</h1>
            <p className="text-sm font-medium text-slate-500 italic">{isEditing ? 'Update details' : 'Register new staff'}</p>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-200 shadow-sm overflow-hidden mb-12">
          <div className="flex justify-between px-8 py-5 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-100">
                <UserPlus size={18} className="text-white" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Registration Form</h2>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
              {['Academic', 'Non-Academic'].map(tab => (
                <button key={tab} type="button" onClick={() => handleTabChange(tab)}
                  className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${staffTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            <PersonalInfoSection
              formData={formData} setField={setField}
              showPassword={showPassword} onTogglePassword={() => setShowPassword(p => !p)}
              isEditing={isEditing}
            />
            <hr className="border-gray-100" />
            <ProfessionalInfoSection
              formData={formData} setField={setField}
              staffTab={staffTab} departments={departments}
              dynamicDesignations={dynamicDesignations}
            />
            <hr className="border-gray-100" />
            <DocumentsSection
              formData={formData} setField={setField}
              docs={docs} setDocField={setDocField} setDocs={setDocs}
            />
            <hr className="border-gray-100" />
            <BankDetailsSection formData={formData} setField={setField} />

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-gray-500">Cancel</button>
              <button type="submit" disabled={isSubmitting}
                className="px-10 py-3.5 bg-blue-600 text-white font-black rounded-xl shadow-xl shadow-blue-200 flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : (isEditing ? 'Update Profile' : 'Register Employee')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};