import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { adminService } from "../../../services/adminService";
// import apiBaseUrl from "../../../config/baseurl"; // Uncomment if needed in submission logic

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, title: "Organisation", subtitle: "Basic Details" },
  { id: 1, title: "Partners/Directors", subtitle: "Director Details" },
  { id: 2, title: "Legal Details", subtitle: "Documents" },
  { id: 3, title: "Branch", subtitle: "Locations" },
  { id: 4, title: "Finalize", subtitle: "Modules & Review" },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

// ─── Validators ──────────────────────────────────────────────────────────────

const isValidEmail   = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone   = (v) => /^[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
const isValidPIN     = (v) => /^\d{6}$/.test(v);
const isValidPAN     = (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase());
const isValidAadhaar = (v) => /^\d{12}$/.test(v.replace(/\s/g, ""));
const isValidGSTIN   = (v) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.toUpperCase());
const isValidIFSC    = (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.toUpperCase());

// ─── Sub‑components ──────────────────────────────────────────────────────────

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
      <AlertCircle size={12} /> {msg}
    </p>
  );
}

function RequiredLabel({ children, hint }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} <span className="text-red-500">*</span>
      {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
    </label>
  );
}

function OptionalLabel({ children }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} <span className="text-xs text-gray-400 font-normal">(optional)</span>
    </label>
  );
}

function Input({ type = "text", value, onChange, placeholder, error, className = "", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
        ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"} ${className}`}
      {...rest}
    />
  );
}

function Select({ value, onChange, children, error, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition
        ${error ? "border-red-400 bg-red-50" : "border-gray-300"} ${className}`}
    >
      {children}
    </select>
  );
}

function DocumentCard({ label, required, numberLabel, numberValue, onNumberChange, numberPlaceholder, onFileChange, error, fileError, numberHint }) {
  return (
    <div className={`border rounded-xl p-4 bg-white transition ${error || fileError ? "border-red-300" : "border-gray-200"}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {label} {required && <span className="text-red-500">*</span>}
        {!required && <span className="ml-1 text-xs text-gray-400 font-normal">(optional)</span>}
      </label>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-500 mb-1">{numberLabel || "Reference / Number"}{numberHint && ` · ${numberHint}`}</p>
          <Input value={numberValue} onChange={onNumberChange} placeholder={numberPlaceholder || "Enter reference number"} error={error} />
          <FieldError msg={error} />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Upload Document{required ? " *" : ""}</p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={onFileChange}
            className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-lg p-1.5 transition
              ${fileError ? "border-red-400 bg-red-50" : "border-gray-300"}`}
          />
          <FieldError msg={fileError} />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InstituteForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasBranch, setHasBranch] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [form, setForm] = useState({
    organisation: {
      name: "", phone: "", altPhone: "", email: "", secondaryEmail: "",
      address1: "", address2: "", city: "", state: "", pin: "",
      headOffice: "", type: "",
    },
    directors: [createEmptyDirector(1)],
    legal: createEmptyLegal(),
    branches: [createEmptyBranch(1)],
  });

  function createEmptyDirector(id) {
    return {
      id, name: "", email: "", secondaryEmail: "", contact: "", mobile: "",
      whatsapp: "", gender: "", dob: "", interest: "", father: "", spouse: "", children: "",
      currentAddress: { line1: "", line2: "", city: "", state: "", pin: "" },
      permanentAddress: { line1: "", line2: "", city: "", state: "", pin: "" },
      sameAddress: false,
      documents: { panNo: "", panDoc: null, aadhaarNo: "", aadhaarDoc: null },
      bank: { bankName: "", accountNumber: "", ifscCode: "" },
    };
  }

  function createEmptyBranch(id) {
    return {
      id, shortName: "", name: "", city: "", state: "", pin: "",
      address1: "", address2: "", gstin: "", contactPerson: "", contactNo: "", email: "",
    };
  }

  function createEmptyLegal() {
    const fields = [
      "propertyDeed","buildingApproval","completionCertificate",
      "fireNOC","policeNOC","municipalityNOC","educationDeptNOC","pollutionNOC",
      "waterConnection","electricityConnection","safetyAudit","drainageSystem",
      "panNo","gstinNo","bankAccount","trustDeed",
      "diseCode","provisionalRecognition","affiliation",
      "childProtectionPolicy","harassmentPolicy","admissionPolicy","feeStructure",
    ];
    const legal = {};
    fields.forEach(f => { legal[f] = ""; legal[`${f}Doc`] = null; });
    return legal;
  }

  // ── Updaters ────────────────────────────────────────────────────────────────

  const updateOrg = (field, value) => {
    setForm(f => ({ ...f, organisation: { ...f.organisation, [field]: value } }));
    setErrors(e => ({ ...e, [`org_${field}`]: "" }));
  };

  const updateDirector = (idx, field, value) => {
    setForm(f => {
      const d = [...f.directors];
      d[idx] = { ...d[idx], [field]: value };
      return { ...f, directors: d };
    });
    setErrors(e => ({ ...e, [`dir${idx}_${field}`]: "" }));
  };

  const updateDirectorNested = (idx, section, field, value) => {
    setForm(f => {
      const d = [...f.directors];
      // Update the specific nested field
      d[idx] = { ...d[idx], [section]: { ...d[idx][section], [field]: value } };
      
      // FIX: Keep permanent address synced if the user modifies current address while checkbox is active
      if (section === "currentAddress" && d[idx].sameAddress) {
        d[idx].permanentAddress = { ...d[idx].currentAddress };
      }
      
      return { ...f, directors: d };
    });
    setErrors(e => ({ ...e, [`dir${idx}_${section}_${field}`]: "" }));
  };

  const toggleSameAddress = (idx, checked) => {
    setForm(f => {
      const d = [...f.directors];
      d[idx] = {
        ...d[idx],
        sameAddress: checked,
        permanentAddress: checked ? { ...d[idx].currentAddress } : d[idx].permanentAddress,
      };
      return { ...f, directors: d };
    });
  };

  const addDirector = () => {
    setForm(f => ({ ...f, directors: [...f.directors, createEmptyDirector(f.directors.length + 1)] }));
  };

  const removeDirector = (idx) => {
    if (form.directors.length > 1) {
      setForm(f => ({ ...f, directors: f.directors.filter((_, i) => i !== idx) }));
      setErrors(e => {
        const cleaned = { ...e };
        Object.keys(cleaned).forEach(k => { if (k.startsWith(`dir${idx}_`)) delete cleaned[k]; });
        return cleaned;
      });
    }
  };

  const updateLegal = (field, value) => {
    setForm(f => ({ ...f, legal: { ...f.legal, [field]: value } }));
    setErrors(e => ({ ...e, [`legal_${field}`]: "" }));
  };

  const addBranch = () => {
    setForm(f => ({ ...f, branches: [...f.branches, createEmptyBranch(f.branches.length + 1)] }));
  };

  const updateBranch = (idx, field, value) => {
    setForm(f => {
      const b = [...f.branches];
      b[idx] = { ...b[idx], [field]: value };
      return { ...f, branches: b };
    });
    setErrors(e => ({ ...e, [`br${idx}_${field}`]: "" }));
  };

  const removeBranch = (idx) => {
    if (form.branches.length > 1) {
      setForm(f => ({ ...f, branches: f.branches.filter((_, i) => i !== idx) }));
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateStep = () => {
    const newErrors = {};

    if (step === 0) {
      const o = form.organisation;
      if (!o.name.trim())               newErrors.org_name       = "Registered name is required";
      if (!o.phone.trim())              newErrors.org_phone      = "Phone number is required";
      else if (!isValidPhone(o.phone))  newErrors.org_phone      = "Enter a valid 10-digit mobile number";
      if (!o.altPhone.trim())           newErrors.org_altPhone   = "Alternate phone is required";
      else if (!isValidPhone(o.altPhone)) newErrors.org_altPhone = "Enter a valid 10-digit mobile number";
      if (!o.email.trim())              newErrors.org_email      = "Email address is required";
      else if (!isValidEmail(o.email))  newErrors.org_email      = "Enter a valid email address";
      if (o.secondaryEmail && !isValidEmail(o.secondaryEmail)) newErrors.org_secondaryEmail = "Enter a valid email address";
      if (!o.address1.trim())           newErrors.org_address1   = "Address line 1 is required";
      if (!o.city.trim())               newErrors.org_city       = "City is required";
      if (!o.state)                     newErrors.org_state      = "State is required";
      if (!o.pin.trim())                newErrors.org_pin        = "PIN code is required";
      else if (!isValidPIN(o.pin))      newErrors.org_pin        = "PIN must be exactly 6 digits";
      if (!o.type)                      newErrors.org_type       = "Organisation type is required";
    }

    if (step === 1) {
      form.directors.forEach((d, i) => {
        if (!d.name.trim())                newErrors[`dir${i}_name`]    = "Director name is required";
        if (!d.email.trim())               newErrors[`dir${i}_email`]   = "Email is required";
        else if (!isValidEmail(d.email))   newErrors[`dir${i}_email`]   = "Enter a valid email";
        if (d.secondaryEmail && !isValidEmail(d.secondaryEmail)) newErrors[`dir${i}_secondaryEmail`] = "Enter a valid email";
        if (!d.contact.trim())             newErrors[`dir${i}_contact`] = "Contact number is required";
        else if (!isValidPhone(d.contact)) newErrors[`dir${i}_contact`] = "Enter a valid 10-digit number";
        if (d.mobile && !isValidPhone(d.mobile))     newErrors[`dir${i}_mobile`]   = "Enter a valid 10-digit number";
        if (d.whatsapp && !isValidPhone(d.whatsapp)) newErrors[`dir${i}_whatsapp`] = "Enter a valid 10-digit number";
        if (!d.gender)                     newErrors[`dir${i}_gender`]  = "Gender is required";
        if (!d.dob)                        newErrors[`dir${i}_dob`]     = "Date of birth is required";
        
        if (!d.currentAddress.line1.trim()) newErrors[`dir${i}_currentAddress_line1`] = "Address is required";
        if (!d.currentAddress.city.trim())  newErrors[`dir${i}_currentAddress_city`]  = "City is required";
        if (!d.currentAddress.state)        newErrors[`dir${i}_currentAddress_state`] = "State is required";
        if (!d.currentAddress.pin.trim())   newErrors[`dir${i}_currentAddress_pin`]   = "PIN is required";
        else if (!isValidPIN(d.currentAddress.pin)) newErrors[`dir${i}_currentAddress_pin`] = "PIN must be 6 digits";
        
        if (!d.sameAddress) {
          if (!d.permanentAddress.line1.trim()) newErrors[`dir${i}_permanentAddress_line1`] = "Address is required";
          if (!d.permanentAddress.city.trim())  newErrors[`dir${i}_permanentAddress_city`]  = "City is required";
          if (!d.permanentAddress.state)        newErrors[`dir${i}_permanentAddress_state`] = "State is required";
          if (!d.permanentAddress.pin.trim())   newErrors[`dir${i}_permanentAddress_pin`]   = "PIN is required";
          else if (!isValidPIN(d.permanentAddress.pin)) newErrors[`dir${i}_permanentAddress_pin`] = "PIN must be 6 digits";
        }
        
        if (!d.documents.panNo.trim())               newErrors[`dir${i}_documents_panNo`]     = "PAN number is required";
        else if (!isValidPAN(d.documents.panNo))     newErrors[`dir${i}_documents_panNo`]     = "Invalid PAN format (e.g. ABCDE1234F)";
        if (!d.documents.panDoc)                     newErrors[`dir${i}_documents_panDoc`]    = "PAN document is required";
        
        if (!d.documents.aadhaarNo.trim())           newErrors[`dir${i}_documents_aadhaarNo`] = "Aadhaar number is required";
        else if (!isValidAadhaar(d.documents.aadhaarNo)) newErrors[`dir${i}_documents_aadhaarNo`] = "Aadhaar must be 12 digits";
        if (!d.documents.aadhaarDoc)                 newErrors[`dir${i}_documents_aadhaarDoc`] = "Aadhaar document is required";
        
        if (!d.bank.bankName.trim())        newErrors[`dir${i}_bank_bankName`]      = "Bank name is required";
        if (!d.bank.accountNumber.trim())   newErrors[`dir${i}_bank_accountNumber`] = "Account number is required";
        if (!d.bank.ifscCode.trim())        newErrors[`dir${i}_bank_ifscCode`]      = "IFSC code is required";
        else if (!isValidIFSC(d.bank.ifscCode)) newErrors[`dir${i}_bank_ifscCode`] = "Invalid IFSC format (e.g. SBIN0001234)";
      });
    }

    if (step === 2) {
      const l = form.legal;
      if (!l.panNo.trim())              newErrors.legal_panNo      = "PAN number is required";
      else if (!isValidPAN(l.panNo))    newErrors.legal_panNo      = "Invalid PAN format";
      if (!l.panNoDoc)                  newErrors.legal_panNoDoc   = "PAN document is required";
      
      if (l.gstinNo && !isValidGSTIN(l.gstinNo)) newErrors.legal_gstinNo = "Invalid GSTIN format";
      
      if (!l.bankAccount.trim())        newErrors.legal_bankAccount    = "Bank account number is required";
      if (!l.bankAccountDoc)            newErrors.legal_bankAccountDoc = "Bank account document is required";
      
      if (!l.trustDeed.trim())          newErrors.legal_trustDeed      = "Trust Deed / Society registration number is required";
      if (!l.trustDeedDoc)              newErrors.legal_trustDeedDoc   = "Trust Deed document is required";
      
      if (!l.fireNOC.trim())            newErrors.legal_fireNOC        = "Fire NOC number is required";
      if (!l.fireNOCDoc)                newErrors.legal_fireNOCDoc     = "Fire NOC document is required";
    }

    if (step === 3 && hasBranch) {
      form.branches.forEach((b, i) => {
        if (!b.name.trim())              newErrors[`br${i}_name`]         = "Branch name is required";
        if (!b.shortName.trim())         newErrors[`br${i}_shortName`]     = "Short name is required";
        else if (b.shortName.length > 2) newErrors[`br${i}_shortName`]     = "Max 2 characters";
        if (!b.address1.trim())          newErrors[`br${i}_address1`]      = "Address is required";
        if (!b.city.trim())              newErrors[`br${i}_city`]          = "City is required";
        if (!b.state)                    newErrors[`br${i}_state`]         = "State is required";
        if (!b.pin.trim())               newErrors[`br${i}_pin`]           = "PIN is required";
        else if (!isValidPIN(b.pin))     newErrors[`br${i}_pin`]           = "PIN must be 6 digits";
        if (!b.contactPerson.trim())     newErrors[`br${i}_contactPerson`] = "Contact person is required";
        if (!b.contactNo.trim())         newErrors[`br${i}_contactNo`]     = "Contact number is required";
        else if (!isValidPhone(b.contactNo)) newErrors[`br${i}_contactNo`] = "Enter a valid 10-digit number";
        if (!b.email.trim())             newErrors[`br${i}_email`]         = "Email is required";
        else if (!isValidEmail(b.email)) newErrors[`br${i}_email`]         = "Enter a valid email";
        if (b.gstin && !isValidGSTIN(b.gstin)) newErrors[`br${i}_gstin`]  = "Invalid GSTIN format";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    setHasAttempted(true);
    if (validateStep()) {
      setStep(s => s + 1);
      setHasAttempted(false);
      setErrors({});
      window.scrollTo(0, 0);
    }
  };

  const goPrev = () => {
    setStep(s => s - 1);
    setHasAttempted(false);
    setErrors({});
    window.scrollTo(0, 0);
  };

  // ── Submit: Save to MySQL Database via Backend API ──────────────────────────

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.organisation.name,
        email: form.organisation.email,
        phone: form.organisation.phone,
        code: form.organisation.name.substring(0, 3).toUpperCase() + (form.organisation.pin || "000"), 
        organisation: form.organisation,
        directors: form.directors,
        legal: form.legal,
        branches: hasBranch ? form.branches : []
      };

      const response = await adminService.createInstitute(payload);

      if (response && response.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate("/super-admin/institutes");
        }, 1500);
      } else {
        throw new Error("Failed to save to database");
      }

    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || "Failed to create institute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Only surface errors after user has attempted to proceed ───────────────
  const displayErrors = hasAttempted ? errors : {};
  const errorCount = Object.keys(displayErrors).length;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-left">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Add Organisation</h1>
          <p className="text-sm text-gray-500">Step {step + 1} of {STEPS.length} · {STEPS[step].title}</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="relative h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-gray-200 text-gray-500"}`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-xs text-center mt-1 font-medium hidden sm:block
                  ${i === step ? "text-blue-600" : i < step ? "text-green-600" : "text-gray-400"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error Summary Banner */}
        {hasAttempted && errorCount > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>Please fix <strong>{errorCount}</strong> error{errorCount > 1 ? "s" : ""} below before continuing.</span>
          </div>
        )}

        {/* Success Banner */}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm">
            <CheckCircle2 size={16} className="flex-shrink-0" />
            <span>Organisation created successfully! Redirecting…</span>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-7 lg:p-9 w-full">

          {/* ───────────────────────── STEP 0 – ORGANISATION ───────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-3 border-b border-gray-100">Basic Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <RequiredLabel>Registered Name</RequiredLabel>
                  <Input value={form.organisation.name} onChange={e => updateOrg("name", e.target.value)}
                    placeholder="e.g. Sunshine Academy Pvt. Ltd." error={displayErrors.org_name} />
                  <FieldError msg={displayErrors.org_name} />
                </div>

                <div>
                  <RequiredLabel hint="10-digit mobile">Phone Number</RequiredLabel>
                  <Input type="tel" value={form.organisation.phone} onChange={e => updateOrg("phone", e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210" maxLength={10} error={displayErrors.org_phone} />
                  <FieldError msg={displayErrors.org_phone} />
                </div>

                <div>
                  <RequiredLabel hint="10-digit mobile">Alternate Phone</RequiredLabel>
                  <Input type="tel" value={form.organisation.altPhone} onChange={e => updateOrg("altPhone", e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210" maxLength={10} error={displayErrors.org_altPhone} />
                  <FieldError msg={displayErrors.org_altPhone} />
                </div>

                <div>
                  <RequiredLabel>Primary Email</RequiredLabel>
                  <Input type="email" value={form.organisation.email} onChange={e => updateOrg("email", e.target.value)}
                    placeholder="info@sunshine.edu.in" error={displayErrors.org_email} />
                  <FieldError msg={displayErrors.org_email} />
                </div>

                <div>
                  <OptionalLabel>Secondary Email</OptionalLabel>
                  <Input type="email" value={form.organisation.secondaryEmail} onChange={e => updateOrg("secondaryEmail", e.target.value)}
                    placeholder="admin@sunshine.edu.in" error={displayErrors.org_secondaryEmail} />
                  <FieldError msg={displayErrors.org_secondaryEmail} />
                </div>

                <div>
                  <RequiredLabel>Organisation Type</RequiredLabel>
                  <Select value={form.organisation.type} onChange={e => updateOrg("type", e.target.value)} error={displayErrors.org_type}>
                    <option value="">Select type…</option>
                    <option>College</option>
                    <option>School</option>
                    <option>Institute</option>
                    <option>University</option>
                  </Select>
                  <FieldError msg={displayErrors.org_type} />
                </div>

                <div className="md:col-span-2">
                  <RequiredLabel>Address Line 1</RequiredLabel>
                  <Input value={form.organisation.address1} onChange={e => updateOrg("address1", e.target.value)}
                    placeholder="Building / Street name" error={displayErrors.org_address1} />
                  <FieldError msg={displayErrors.org_address1} />
                </div>

                <div className="md:col-span-2">
                  <OptionalLabel>Address Line 2</OptionalLabel>
                  <Input value={form.organisation.address2} onChange={e => updateOrg("address2", e.target.value)}
                    placeholder="Area / Landmark" />
                </div>

                <div>
                  <RequiredLabel>City</RequiredLabel>
                  <Input value={form.organisation.city} onChange={e => updateOrg("city", e.target.value)}
                    placeholder="e.g. Bhubaneswar" error={displayErrors.org_city} />
                  <FieldError msg={displayErrors.org_city} />
                </div>

                <div>
                  <RequiredLabel>State</RequiredLabel>
                  <Select value={form.organisation.state} onChange={e => updateOrg("state", e.target.value)} error={displayErrors.org_state}>
                    <option value="">Select state…</option>
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </Select>
                  <FieldError msg={displayErrors.org_state} />
                </div>

                <div>
                  <RequiredLabel hint="6 digits">PIN Code</RequiredLabel>
                  <Input value={form.organisation.pin} onChange={e => updateOrg("pin", e.target.value.replace(/\D/g, ""))}
                    placeholder="751001" maxLength={6} error={displayErrors.org_pin} />
                  <FieldError msg={displayErrors.org_pin} />
                </div>

                <div>
                  <OptionalLabel>Head Office Location</OptionalLabel>
                  <Input value={form.organisation.headOffice} onChange={e => updateOrg("headOffice", e.target.value)}
                    placeholder="e.g. Plot 12, Sector 5, Bhubaneswar" />
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────── STEP 1 – DIRECTORS ──────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-3 border-b border-gray-100">Director / Partner Details</h2>

              {form.directors.map((director, dirIdx) => (
                <div key={dirIdx} className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base text-gray-800">Director {dirIdx + 1}</h3>
                    {form.directors.length > 1 && (
                      <button onClick={() => removeDirector(dirIdx)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm">
                        <Trash2 size={16} /> Remove
                      </button>
                    )}
                  </div>

                  {/* Personal */}
                  <section>
                    <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Personal Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <RequiredLabel>Full Name</RequiredLabel>
                        <Input value={director.name} onChange={e => updateDirector(dirIdx, "name", e.target.value)}
                          placeholder="Director's full name" error={displayErrors[`dir${dirIdx}_name`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_name`]} />
                      </div>
                      <div>
                        <RequiredLabel>Email</RequiredLabel>
                        <Input type="email" value={director.email} onChange={e => updateDirector(dirIdx, "email", e.target.value)}
                          placeholder="director@email.com" error={displayErrors[`dir${dirIdx}_email`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_email`]} />
                      </div>
                      <div>
                        <OptionalLabel>Secondary Email</OptionalLabel>
                        <Input type="email" value={director.secondaryEmail} onChange={e => updateDirector(dirIdx, "secondaryEmail", e.target.value)}
                          placeholder="alt@email.com" error={displayErrors[`dir${dirIdx}_secondaryEmail`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_secondaryEmail`]} />
                      </div>
                      <div>
                        <RequiredLabel hint="10-digit">Contact Number</RequiredLabel>
                        <Input type="tel" value={director.contact} onChange={e => updateDirector(dirIdx, "contact", e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210" maxLength={10} error={displayErrors[`dir${dirIdx}_contact`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_contact`]} />
                      </div>
                      <div>
                        <OptionalLabel>Mobile Number</OptionalLabel>
                        <Input type="tel" value={director.mobile} onChange={e => updateDirector(dirIdx, "mobile", e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210" maxLength={10} error={displayErrors[`dir${dirIdx}_mobile`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_mobile`]} />
                      </div>
                      <div>
                        <OptionalLabel>WhatsApp Number</OptionalLabel>
                        <Input type="tel" value={director.whatsapp} onChange={e => updateDirector(dirIdx, "whatsapp", e.target.value.replace(/\D/g, ""))}
                          placeholder="9876543210" maxLength={10} error={displayErrors[`dir${dirIdx}_whatsapp`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_whatsapp`]} />
                      </div>
                      <div>
                        <RequiredLabel>Gender</RequiredLabel>
                        <Select value={director.gender} onChange={e => updateDirector(dirIdx, "gender", e.target.value)} error={displayErrors[`dir${dirIdx}_gender`]}>
                          <option value="">Select gender…</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </Select>
                        <FieldError msg={displayErrors[`dir${dirIdx}_gender`]} />
                      </div>
                      <div>
                        <RequiredLabel>Date of Birth</RequiredLabel>
                        <Input type="date" value={director.dob} onChange={e => updateDirector(dirIdx, "dob", e.target.value)}
                          error={displayErrors[`dir${dirIdx}_dob`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_dob`]} />
                      </div>
                      <div>
                        <OptionalLabel>% of Interest</OptionalLabel>
                        <Input type="number" value={director.interest} onChange={e => updateDirector(dirIdx, "interest", e.target.value)}
                          placeholder="e.g. 25" min={0} max={100} />
                      </div>
                      <div>
                        <OptionalLabel>Father's Name</OptionalLabel>
                        <Input value={director.father} onChange={e => updateDirector(dirIdx, "father", e.target.value)} placeholder="Father's full name" />
                      </div>
                      <div>
                        <OptionalLabel>Spouse Name</OptionalLabel>
                        <Input value={director.spouse} onChange={e => updateDirector(dirIdx, "spouse", e.target.value)} placeholder="Spouse's full name" />
                      </div>
                      <div>
                        <OptionalLabel>Number of Children</OptionalLabel>
                        <Input type="number" value={director.children} onChange={e => updateDirector(dirIdx, "children", e.target.value)}
                          placeholder="0" min={0} />
                      </div>
                    </div>
                  </section>

                  {/* Current Address */}
                  <section>
                    <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Current Address</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <RequiredLabel>Address Line 1</RequiredLabel>
                        <Input value={director.currentAddress.line1}
                          onChange={e => updateDirectorNested(dirIdx, "currentAddress", "line1", e.target.value)}
                          placeholder="Building / Street" error={displayErrors[`dir${dirIdx}_currentAddress_line1`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_currentAddress_line1`]} />
                      </div>
                      <div className="sm:col-span-2">
                        <OptionalLabel>Address Line 2</OptionalLabel>
                        <Input value={director.currentAddress.line2}
                          onChange={e => updateDirectorNested(dirIdx, "currentAddress", "line2", e.target.value)}
                          placeholder="Area / Landmark" />
                      </div>
                      <div>
                        <RequiredLabel>City</RequiredLabel>
                        <Input value={director.currentAddress.city}
                          onChange={e => updateDirectorNested(dirIdx, "currentAddress", "city", e.target.value)}
                          placeholder="City" error={displayErrors[`dir${dirIdx}_currentAddress_city`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_currentAddress_city`]} />
                      </div>
                      <div>
                        <RequiredLabel>State</RequiredLabel>
                        <Select value={director.currentAddress.state}
                          onChange={e => updateDirectorNested(dirIdx, "currentAddress", "state", e.target.value)}
                          error={displayErrors[`dir${dirIdx}_currentAddress_state`]}>
                          <option value="">Select…</option>
                          {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                        </Select>
                        <FieldError msg={displayErrors[`dir${dirIdx}_currentAddress_state`]} />
                      </div>
                      <div>
                        <RequiredLabel hint="6 digits">PIN Code</RequiredLabel>
                        <Input value={director.currentAddress.pin}
                          onChange={e => updateDirectorNested(dirIdx, "currentAddress", "pin", e.target.value.replace(/\D/g, ""))}
                          placeholder="751001" maxLength={6} error={displayErrors[`dir${dirIdx}_currentAddress_pin`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_currentAddress_pin`]} />
                      </div>
                    </div>
                  </section>

                  {/* Permanent Address */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Permanent Address</h4>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                        <input type="checkbox" checked={director.sameAddress}
                          onChange={e => toggleSameAddress(dirIdx, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        Same as current address
                      </label>
                    </div>
                    {!director.sameAddress && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <RequiredLabel>Address Line 1</RequiredLabel>
                          <Input value={director.permanentAddress.line1}
                            onChange={e => updateDirectorNested(dirIdx, "permanentAddress", "line1", e.target.value)}
                            placeholder="Building / Street" error={displayErrors[`dir${dirIdx}_permanentAddress_line1`]} />
                          <FieldError msg={displayErrors[`dir${dirIdx}_permanentAddress_line1`]} />
                        </div>
                        <div className="sm:col-span-2">
                          <OptionalLabel>Address Line 2</OptionalLabel>
                          <Input value={director.permanentAddress.line2}
                            onChange={e => updateDirectorNested(dirIdx, "permanentAddress", "line2", e.target.value)}
                            placeholder="Area / Landmark" />
                        </div>
                        <div>
                          <RequiredLabel>City</RequiredLabel>
                          <Input value={director.permanentAddress.city}
                            onChange={e => updateDirectorNested(dirIdx, "permanentAddress", "city", e.target.value)}
                            placeholder="City" error={displayErrors[`dir${dirIdx}_permanentAddress_city`]} />
                          <FieldError msg={displayErrors[`dir${dirIdx}_permanentAddress_city`]} />
                        </div>
                        <div>
                          <RequiredLabel>State</RequiredLabel>
                          <Select value={director.permanentAddress.state}
                            onChange={e => updateDirectorNested(dirIdx, "permanentAddress", "state", e.target.value)}
                            error={displayErrors[`dir${dirIdx}_permanentAddress_state`]}>
                            <option value="">Select…</option>
                            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                          </Select>
                          <FieldError msg={displayErrors[`dir${dirIdx}_permanentAddress_state`]} />
                        </div>
                        <div>
                          <RequiredLabel hint="6 digits">PIN Code</RequiredLabel>
                          <Input value={director.permanentAddress.pin}
                            onChange={e => updateDirectorNested(dirIdx, "permanentAddress", "pin", e.target.value.replace(/\D/g, ""))}
                            placeholder="751001" maxLength={6} error={displayErrors[`dir${dirIdx}_permanentAddress_pin`]} />
                          <FieldError msg={displayErrors[`dir${dirIdx}_permanentAddress_pin`]} />
                        </div>
                      </div>
                    )}
                    {director.sameAddress && (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <CheckCircle2 size={14} /> Permanent address copied from current address.
                      </p>
                    )}
                  </section>

                  {/* Documents */}
                  <section>
                    <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Identity Documents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <RequiredLabel hint="e.g. ABCDE1234F">PAN Number</RequiredLabel>
                        <Input value={director.documents.panNo}
                          onChange={e => updateDirectorNested(dirIdx, "documents", "panNo", e.target.value.toUpperCase())}
                          placeholder="ABCDE1234F" maxLength={10} error={displayErrors[`dir${dirIdx}_documents_panNo`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_documents_panNo`]} />
                      </div>
                      <div>
                        <RequiredLabel>Upload PAN Card</RequiredLabel>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => updateDirectorNested(dirIdx, "documents", "panDoc", e.target.files?.[0] || null)}
                          className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-lg p-1.5 transition
                            ${displayErrors[`dir${dirIdx}_documents_panDoc`] ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_documents_panDoc`]} />
                      </div>
                      <div>
                        <RequiredLabel hint="12 digits">Aadhaar Number</RequiredLabel>
                        <Input value={director.documents.aadhaarNo}
                          onChange={e => updateDirectorNested(dirIdx, "documents", "aadhaarNo", e.target.value.replace(/\D/g, ""))}
                          placeholder="123456789012" maxLength={12} error={displayErrors[`dir${dirIdx}_documents_aadhaarNo`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_documents_aadhaarNo`]} />
                      </div>
                      <div>
                        <RequiredLabel>Upload Aadhaar</RequiredLabel>
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => updateDirectorNested(dirIdx, "documents", "aadhaarDoc", e.target.files?.[0] || null)}
                          className={`w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border rounded-lg p-1.5 transition
                            ${displayErrors[`dir${dirIdx}_documents_aadhaarDoc`] ? "border-red-400 bg-red-50" : "border-gray-300"}`} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_documents_aadhaarDoc`]} />
                      </div>
                    </div>
                  </section>

                  {/* Bank */}
                  <section>
                    <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Bank Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <RequiredLabel>Bank Name</RequiredLabel>
                        <Input value={director.bank.bankName}
                          onChange={e => updateDirectorNested(dirIdx, "bank", "bankName", e.target.value)}
                          placeholder="State Bank of India" error={displayErrors[`dir${dirIdx}_bank_bankName`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_bank_bankName`]} />
                      </div>
                      <div>
                        <RequiredLabel>Account Number</RequiredLabel>
                        <Input value={director.bank.accountNumber}
                          onChange={e => updateDirectorNested(dirIdx, "bank", "accountNumber", e.target.value.replace(/\D/g, ""))}
                          placeholder="123456789012" error={displayErrors[`dir${dirIdx}_bank_accountNumber`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_bank_accountNumber`]} />
                      </div>
                      <div>
                        <RequiredLabel hint="e.g. SBIN0001234">IFSC Code</RequiredLabel>
                        <Input value={director.bank.ifscCode}
                          onChange={e => updateDirectorNested(dirIdx, "bank", "ifscCode", e.target.value.toUpperCase())}
                          placeholder="SBIN0001234" maxLength={11} error={displayErrors[`dir${dirIdx}_bank_ifscCode`]} />
                        <FieldError msg={displayErrors[`dir${dirIdx}_bank_ifscCode`]} />
                      </div>
                    </div>
                  </section>
                </div>
              ))}

              <button onClick={addDirector} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 text-sm border-2 border-dashed border-blue-200 rounded-xl px-4 py-3 w-full justify-center hover:bg-blue-50 transition">
                <Plus size={18} /> Add Another Director
              </button>
            </div>
          )}

          {/* ───────────────────────── STEP 2 – LEGAL ──────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-xl font-semibold text-gray-800 pb-3 border-b border-gray-100">Legal Details & Documents</h2>
              <p className="text-xs text-gray-500 -mt-4">Fields marked <span className="text-red-500 font-bold">*</span> are mandatory. All others are optional but recommended.</p>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-gray-400 pl-3">Land & Building Documents</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="Property Deed" numberLabel="Deed Reference / Number" numberValue={form.legal.propertyDeed}
                    onNumberChange={e => updateLegal("propertyDeed", e.target.value)} onFileChange={e => updateLegal("propertyDeedDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Deed reference number" />
                  <DocumentCard label="Building Approval" numberLabel="Approval Number" numberValue={form.legal.buildingApproval}
                    onNumberChange={e => updateLegal("buildingApproval", e.target.value)} onFileChange={e => updateLegal("buildingApprovalDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Approval number" />
                  <DocumentCard label="Building Completion Certificate" numberLabel="Certificate Number" numberValue={form.legal.completionCertificate}
                    onNumberChange={e => updateLegal("completionCertificate", e.target.value)} onFileChange={e => updateLegal("completionCertificateDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Certificate number" />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-gray-400 pl-3">No Objection Certificates (NOCs)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="Fire Department NOC" required numberLabel="NOC Number" numberValue={form.legal.fireNOC}
                    onNumberChange={e => updateLegal("fireNOC", e.target.value)} onFileChange={e => updateLegal("fireNOCDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="NOC number" error={displayErrors.legal_fireNOC} fileError={displayErrors.legal_fireNOCDoc} />
                  <DocumentCard label="Police NOC" numberLabel="NOC Number" numberValue={form.legal.policeNOC}
                    onNumberChange={e => updateLegal("policeNOC", e.target.value)} onFileChange={e => updateLegal("policeNOCDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="NOC number" />
                  <DocumentCard label="Municipality NOC" numberLabel="NOC Number" numberValue={form.legal.municipalityNOC}
                    onNumberChange={e => updateLegal("municipalityNOC", e.target.value)} onFileChange={e => updateLegal("municipalityNOCDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="NOC number" />
                  <DocumentCard label="Education Department NOC" numberLabel="NOC Number" numberValue={form.legal.educationDeptNOC}
                    onNumberChange={e => updateLegal("educationDeptNOC", e.target.value)} onFileChange={e => updateLegal("educationDeptNOCDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="NOC number" />
                  <DocumentCard label="Pollution Control Board NOC" numberLabel="NOC Number" numberValue={form.legal.pollutionNOC}
                    onNumberChange={e => updateLegal("pollutionNOC", e.target.value)} onFileChange={e => updateLegal("pollutionNOCDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="NOC number" />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-gray-400 pl-3">Infrastructure & Safety</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="Water Connection Certificate" numberLabel="Reference Number" numberValue={form.legal.waterConnection}
                    onNumberChange={e => updateLegal("waterConnection", e.target.value)} onFileChange={e => updateLegal("waterConnectionDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Reference number" />
                  <DocumentCard label="Electricity Connection Certificate" numberLabel="Consumer Number" numberValue={form.legal.electricityConnection}
                    onNumberChange={e => updateLegal("electricityConnection", e.target.value)} onFileChange={e => updateLegal("electricityConnectionDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Consumer number" />
                  <DocumentCard label="Safety Audit Report" numberLabel="Audit Reference" numberValue={form.legal.safetyAudit}
                    onNumberChange={e => updateLegal("safetyAudit", e.target.value)} onFileChange={e => updateLegal("safetyAuditDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Audit reference" />
                  <DocumentCard label="Drainage System Certification" numberLabel="Certificate Number" numberValue={form.legal.drainageSystem}
                    onNumberChange={e => updateLegal("drainageSystem", e.target.value)} onFileChange={e => updateLegal("drainageSystemDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Certificate number" />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-gray-400 pl-3">Financial & Administrative</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="PAN Number" required numberLabel="PAN" numberHint="e.g. ABCDE1234F" numberValue={form.legal.panNo}
                    onNumberChange={e => updateLegal("panNo", e.target.value.toUpperCase())} onFileChange={e => updateLegal("panNoDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="ABCDE1234F" error={displayErrors.legal_panNo} fileError={displayErrors.legal_panNoDoc} />
                  
                  {/* FIXED: gstinDoc mapped correctly to gstinNoDoc */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-white">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      GSTIN Number <span className="text-xs text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input value={form.legal.gstinNo} onChange={e => updateLegal("gstinNo", e.target.value.toUpperCase())}
                      placeholder="22ABCDE1234F1Z5" error={displayErrors.legal_gstinNo} />
                    <FieldError msg={displayErrors.legal_gstinNo} />
                    <p className="text-xs text-gray-500 mt-2 mb-1">Upload Document</p>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => updateLegal("gstinNoDoc", e.target.files?.[0] || null)}
                      className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg p-1.5" />
                  </div>

                  <DocumentCard label="Bank Account Certificate" required numberLabel="Account Number" numberValue={form.legal.bankAccount}
                    onNumberChange={e => updateLegal("bankAccount", e.target.value.replace(/\D/g, ""))} onFileChange={e => updateLegal("bankAccountDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Account number" error={displayErrors.legal_bankAccount} fileError={displayErrors.legal_bankAccountDoc} />
                  <DocumentCard label="Trust Deed / Society Registration" required numberLabel="Document Number" numberValue={form.legal.trustDeed}
                    onNumberChange={e => updateLegal("trustDeed", e.target.value)} onFileChange={e => updateLegal("trustDeedDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Document number" error={displayErrors.legal_trustDeed} fileError={displayErrors.legal_trustDeedDoc} />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-blue-500 pl-3">Education Registration & Affiliation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="DISE Code" numberLabel="DISE Code" numberValue={form.legal.diseCode}
                    onNumberChange={e => updateLegal("diseCode", e.target.value)} onFileChange={e => updateLegal("diseCodeDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="DISE code" />
                  <DocumentCard label="Provisional Recognition Certificate" numberLabel="Certificate Number" numberValue={form.legal.provisionalRecognition}
                    onNumberChange={e => updateLegal("provisionalRecognition", e.target.value)} onFileChange={e => updateLegal("provisionalRecognitionDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Certificate number" />
                  <DocumentCard label="Board Affiliation Certificate" numberLabel="Affiliation Number" numberValue={form.legal.affiliation}
                    onNumberChange={e => updateLegal("affiliation", e.target.value)} onFileChange={e => updateLegal("affiliationDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Affiliation number" />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide border-l-4 border-gray-400 pl-3">Mandatory Policies</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="Child Protection Policy" numberLabel="Policy Reference" numberValue={form.legal.childProtectionPolicy}
                    onNumberChange={e => updateLegal("childProtectionPolicy", e.target.value)} onFileChange={e => updateLegal("childProtectionPolicyDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Policy reference" />
                  <DocumentCard label="Harassment Prevention Policy" numberLabel="Policy Reference" numberValue={form.legal.harassmentPolicy}
                    onNumberChange={e => updateLegal("harassmentPolicy", e.target.value)} onFileChange={e => updateLegal("harassmentPolicyDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Policy reference" />
                  <DocumentCard label="Admission Policy" numberLabel="Policy Reference" numberValue={form.legal.admissionPolicy}
                    onNumberChange={e => updateLegal("admissionPolicy", e.target.value)} onFileChange={e => updateLegal("admissionPolicyDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Policy reference" />
                  <DocumentCard label="Fee Structure Document" numberLabel="Document Reference" numberValue={form.legal.feeStructure}
                    onNumberChange={e => updateLegal("feeStructure", e.target.value)} onFileChange={e => updateLegal("feeStructureDoc", e.target.files?.[0] || null)}
                    numberPlaceholder="Document reference" />
                </div>
              </section>
            </div>
          )}

          {/* ───────────────────────── STEP 3 – BRANCH ─────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-3 border-b border-gray-100">Branch Locations</h2>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Is this institute associated with branches?</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" checked={hasBranch} onChange={() => setHasBranch(true)}
                      className="text-blue-600 focus:ring-blue-500" /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" checked={!hasBranch} onChange={() => setHasBranch(false)}
                      className="text-blue-600 focus:ring-blue-500" /> No
                  </label>
                </div>
              </div>

              {hasBranch && (
                <>
                  {form.branches.map((branch, branchIdx) => (
                    <div key={branchIdx} className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-base text-gray-800">Branch {branchIdx + 1}</h3>
                        {form.branches.length > 1 && (
                          <button onClick={() => removeBranch(branchIdx)} className="text-red-400 hover:text-red-600 flex items-center gap-1 text-sm">
                            <Trash2 size={16} /> Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                          <RequiredLabel hint="max 2 chars">Short Name</RequiredLabel>
                          <Input value={branch.shortName} onChange={e => updateBranch(branchIdx, "shortName", e.target.value.toUpperCase())}
                            placeholder="BB" maxLength={2} error={displayErrors[`br${branchIdx}_shortName`]} />
                          <FieldError msg={displayErrors[`br${branchIdx}_shortName`]} />
                        </div>
                        <div className="lg:col-span-2">
                          <RequiredLabel>Branch Name</RequiredLabel>
                          <Input value={branch.name} onChange={e => updateBranch(branchIdx, "name", e.target.value)}
                            placeholder="e.g. Bhubaneswar Branch" error={displayErrors[`br${branchIdx}_name`]} />
                          <FieldError msg={displayErrors[`br${branchIdx}_name`]} />
                        </div>
                        <div>
                          <RequiredLabel>City</RequiredLabel>
                          <Input value={branch.city} onChange={e => updateBranch(branchIdx, "city", e.target.value)}
                            placeholder="City" error={displayErrors[`br${branchIdx}_city`]} />
                          <FieldError msg={displayErrors[`br${branchIdx}_city`]} />
                        </div>
                        <div>
                          <RequiredLabel hint="6 digits">PIN Code</RequiredLabel>
                          <Input value={branch.pin} onChange={e => updateBranch(branchIdx, "pin", e.target.value.replace(/\D/g, ""))}
                            placeholder="751001" maxLength={6} error={displayErrors[`br${branchIdx}_pin`]} />
                          <FieldError msg={displayErrors[`br${branchIdx}_pin`]} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <RequiredLabel>State</RequiredLabel>
                          <Select value={branch.state} onChange={e => updateBranch(branchIdx, "state", e.target.value)} error={displayErrors[`br${branchIdx}_state`]}>
                            <option value="">Select state…</option>
                            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                          </Select>
                          <FieldError msg={displayErrors[`br${branchIdx}_state`]} />
                        </div>
                        <div>
                          <OptionalLabel>Branch GSTIN</OptionalLabel>
                          <Input value={branch.gstin} onChange={e => updateBranch(branchIdx, "gstin", e.target.value.toUpperCase())}
                            placeholder="22ABCDE1234F1Z5" error={displayErrors[`br${branchIdx}_gstin`]} />
                          <FieldError msg={displayErrors[`br${branchIdx}_gstin`]} />
                        </div>
                        <div className="sm:col-span-2">
                          <RequiredLabel>Address Line 1</RequiredLabel>
                          <Input value={branch.address1} onChange={e => updateBranch(branchIdx, "address1", e.target.value)}
                            placeholder="Building / Street" error={displayErrors[`br${branchIdx}_address1`]} />
                          <FieldError msg={displayErrors[`br${branchIdx}_address1`]} />
                        </div>
                        <div className="sm:col-span-2">
                          <OptionalLabel>Address Line 2</OptionalLabel>
                          <Input value={branch.address2} onChange={e => updateBranch(branchIdx, "address2", e.target.value)}
                            placeholder="Area / Landmark" />
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-3">Branch Contact</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <RequiredLabel>Contact Person</RequiredLabel>
                            <Input value={branch.contactPerson} onChange={e => updateBranch(branchIdx, "contactPerson", e.target.value)}
                              placeholder="Full name" error={displayErrors[`br${branchIdx}_contactPerson`]} />
                            <FieldError msg={displayErrors[`br${branchIdx}_contactPerson`]} />
                          </div>
                          <div>
                            <RequiredLabel hint="10-digit">Contact Number</RequiredLabel>
                            <Input type="tel" value={branch.contactNo} onChange={e => updateBranch(branchIdx, "contactNo", e.target.value.replace(/\D/g, ""))}
                              placeholder="9876543210" maxLength={10} error={displayErrors[`br${branchIdx}_contactNo`]} />
                            <FieldError msg={displayErrors[`br${branchIdx}_contactNo`]} />
                          </div>
                          <div>
                            <RequiredLabel>Email</RequiredLabel>
                            <Input type="email" value={branch.email} onChange={e => updateBranch(branchIdx, "email", e.target.value)}
                              placeholder="branch@email.com" error={displayErrors[`br${branchIdx}_email`]} />
                            <FieldError msg={displayErrors[`br${branchIdx}_email`]} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button onClick={addBranch} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 text-sm border-2 border-dashed border-blue-200 rounded-xl px-4 py-3 w-full justify-center hover:bg-blue-50 transition">
                    <Plus size={18} /> Add Another Branch
                  </button>
                </>
              )}

              {!hasBranch && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">No branch information needed. You can proceed to finalize.</p>
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────── STEP 4 – FINALIZE ───────────────────────── */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-3 border-b border-gray-100">Review & Finalize</h2>

              <div className="space-y-3">
                {[
                  {
                    label: "Organisation Details",
                    desc: `${form.organisation.name || "—"} · ${form.organisation.type || "—"} · ${form.organisation.city || "—"}, ${form.organisation.state || "—"}`,
                  },
                  {
                    label: "Directors",
                    desc: `${form.directors.length} director(s): ${form.directors.map(d => d.name || "Unnamed").join(", ")}`,
                  },
                  {
                    label: "Legal Documents",
                    desc: `PAN: ${form.legal.panNo || "—"} · Bank A/C: ${form.legal.bankAccount || "—"}`,
                  },
                  {
                    label: "Branches",
                    desc: hasBranch
                      ? `${form.branches.length} branch(es): ${form.branches.map(b => b.name || "Unnamed").join(", ")}`
                      : "No branch associated",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Next Steps After Creation</h3>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  {["Modules & permissions setup", "Team member assignments", "System configuration", "Go live with your organisation"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl text-sm text-amber-800">
                ⚠ By clicking "Create Organisation", you confirm that all submitted information is accurate and complete.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 gap-3">
          <button
            onClick={goPrev}
            disabled={step === 0 || isSubmitting}
            className="flex items-center gap-2 px-5 py-2.5 border-2 border-gray-300 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {step < 4 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition shadow-sm shadow-blue-200"
            >
              Next Step <ChevronLeft size={18} className="rotate-180" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={isSubmitting || submitSuccess}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-green-200"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : submitSuccess ? (
                <><CheckCircle2 size={18} /> Saved!</>
              ) : (
                <><Upload size={18} /> Create Organisation</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}