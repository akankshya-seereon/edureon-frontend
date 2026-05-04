import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Trash2, Upload } from "lucide-react";
import api from "../../../services/api"; // ✅ Fixed: import api, not apiBaseUrl

const STEPS = [
  { id: 0, title: "Organisation", subtitle: "Basic Details" },
  { id: 1, title: "Partners/Directors", subtitle: "Director Details" },
  { id: 2, title: "Legal Details", subtitle: "Documents" },
  { id: 3, title: "Branch", subtitle: "Locations" },
  { id: 4, title: "Finalize", subtitle: "Modules & Review" },
];

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-left text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function InstituteForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    organisation: {
      name: "", phone: "", altPhone: "", email: "", secondaryEmail: "",
      address1: "", address2: "", city: "", state: "", pin: "",
      headOffice: "", type: "",
    },
    directors: [
      {
        id: 1,
        name: "", email: "", secondaryEmail: "", contact: "", mobile: "",
        whatsapp: "", gender: "", dob: "", interest: "", father: "",
        spouse: "", children: "",
        currentAddress: { line1: "", line2: "", city: "", state: "", pin: "" },
        permanentAddress: { line1: "", line2: "", city: "", state: "", pin: "" },
        // ✅ panDoc and aadhaarDoc will hold actual File objects, not strings
        documents: { panNo: "", panDoc: null, aadhaarNo: "", aadhaarDoc: null },
        bank: { bankName: "", accountNumber: "", ifscCode: "" },
      },
    ],
    legal: {
      propertyDeed: "", propertyDeedDoc: null,
      buildingApproval: "", buildingApprovalDoc: null,
      completionCertificate: "", completionCertificateDoc: null,
      fireNOC: "", fireNOCDoc: null,
      policeNOC: "", policeNOCDoc: null,
      municipalityNOC: "", municipalityNOCDoc: null,
      educationDeptNOC: "", educationDeptNOCDoc: null,
      pollutionNOC: "", pollutionNOCDoc: null,
      waterConnection: "", waterConnectionDoc: null,
      electricityConnection: "", electricityConnectionDoc: null,
      safetyAudit: "", safetyAuditDoc: null,
      drainageSystem: "", drainageSystemDoc: null,
      panNo: "", panDoc: null,
      gstinNo: "", gstinNoDoc: null,
      bankAccount: "", bankAccountDoc: null,
      trustDeed: "", trustDeedDoc: null,
      diseCode: "", diseCodeDoc: null,
      provisionalRecognition: "", provisionalRecognitionDoc: null,
      affiliation: "", affiliationDoc: null,
      childProtectionPolicy: "", childProtectionPolicyDoc: null,
      harassmentPolicy: "", harassmentPolicyDoc: null,
      admissionPolicy: "", admissionPolicyDoc: null,
      feeStructure: "", feeStructureDoc: null,
    },
    branches: [
      {
        id: 1,
        shortName: "", name: "", city: "", state: "", pin: "",
        address1: "", address2: "", gstin: "",
        contactPerson: "", contactNo: "", email: "",
      },
    ],
  });

  // ── Update helpers ───────────────────────────────────────────────────────────

  const updateOrg = (field, value) => {
    setForm({ ...form, organisation: { ...form.organisation, [field]: value } });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const updateDirector = (directorIdx, field, value) => {
    const updatedDirectors = [...form.directors];
    updatedDirectors[directorIdx][field] = value;
    setForm({ ...form, directors: updatedDirectors });
  };

  const updateDirectorNested = (directorIdx, section, field, value) => {
    const updatedDirectors = [...form.directors];
    updatedDirectors[directorIdx][section][field] = value;
    setForm({ ...form, directors: updatedDirectors });
  };

  const addDirector = () => {
    const newDirector = {
      id: form.directors.length + 1,
      name: "", email: "", secondaryEmail: "", contact: "", mobile: "",
      whatsapp: "", gender: "", dob: "", interest: "", father: "",
      spouse: "", children: "",
      currentAddress: { line1: "", line2: "", city: "", state: "", pin: "" },
      permanentAddress: { line1: "", line2: "", city: "", state: "", pin: "" },
      documents: { panNo: "", panDoc: null, aadhaarNo: "", aadhaarDoc: null },
      bank: { bankName: "", accountNumber: "", ifscCode: "" },
    };
    setForm({ ...form, directors: [...form.directors, newDirector] });
  };

  const removeDirector = (idx) => {
    if (form.directors.length > 1)
      setForm({ ...form, directors: form.directors.filter((_, i) => i !== idx) });
  };

  const updateLegal = (field, value) => {
    setForm({ ...form, legal: { ...form.legal, [field]: value } });
  };

  const addBranch = () => {
    const newBranch = {
      id: form.branches.length + 1,
      shortName: "", name: "", city: "", state: "", pin: "",
      address1: "", address2: "", gstin: "",
      contactPerson: "", contactNo: "", email: "",
    };
    setForm({ ...form, branches: [...form.branches, newBranch] });
  };

  const updateBranch = (branchIdx, field, value) => {
    const updatedBranches = [...form.branches];
    updatedBranches[branchIdx][field] = value;
    setForm({ ...form, branches: updatedBranches });
  };

  const removeBranch = (idx) => {
    if (form.branches.length > 1)
      setForm({ ...form, branches: form.branches.filter((_, i) => i !== idx) });
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.organisation.name.trim()) newErrors.name = "Registered Name is required";
      if (!form.organisation.phone.trim()) newErrors.phone = "Phone Number is required";
      if (!form.organisation.altPhone.trim()) newErrors.altPhone = "Alternate Phone is required";
      if (!form.organisation.email.trim()) newErrors.email = "Email is required";
      if (!form.organisation.city.trim()) newErrors.city = "City is required";
      if (!form.organisation.state.trim()) newErrors.state = "State is required";
      if (!form.organisation.pin.trim()) newErrors.pin = "PIN Code is required";
      if (!form.organisation.type) newErrors.type = "Organisation Type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep()) { setStep(step + 1); window.scrollTo(0, 0); }
  };
  const goPrev = () => { setStep(step - 1); window.scrollTo(0, 0); };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const submit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();

      // 1. Organisation & Branches — plain JSON (no files here)
      formData.append("organisation", JSON.stringify(form.organisation));
      formData.append("branches", JSON.stringify(form.branches));

      // 2. Legal — strip File objects out, append them separately
      const legalData = {};
      Object.entries(form.legal).forEach(([key, value]) => {
        if (value instanceof File) {
          // ✅ Append actual File with the field name backend expects: legal_<key>
          formData.append(`legal_${key}`, value);
          legalData[key] = ""; // placeholder; backend will fill with saved path
        } else {
          legalData[key] = value ?? "";
        }
      });
      formData.append("legal", JSON.stringify(legalData));

      // 3. Directors — strip File objects out, append them separately
      const directorsData = form.directors.map((dir) => ({
        ...dir,
        documents: {
          ...dir.documents,
          panDoc: "",     // will be filled by backend after file save
          aadhaarDoc: "", // same
        },
      }));

      form.directors.forEach((dir, idx) => {
        // ✅ dir.documents.panDoc is now a real File object (not a filename string)
        if (dir.documents.panDoc instanceof File) {
          formData.append(`director_${idx}_panDoc`, dir.documents.panDoc);
        }
        if (dir.documents.aadhaarDoc instanceof File) {
          formData.append(`director_${idx}_aadhaarDoc`, dir.documents.aadhaarDoc);
        }
      });

      formData.append("directors", JSON.stringify(directorsData));

      // 4. POST — do NOT set Content-Type manually; browser sets multipart boundary
      const response = await api.post("/admin/institutes", formData);

      if (response.data.success) {
        navigate("/admin/institute");
      } else {
        alert(response.data.message || "Failed to create institute.");
      }
    } catch (error) {
      console.error("Failed to create institute:", error);
      alert(error.response?.data?.message || "Error creating institute. Check console.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (hasError) =>
    `w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm ${hasError ? "border-red-500" : "border-gray-300"}`;

  // ── File input helper — shows selected filename next to input ────────────────
  const FileInput = ({ value, onChange, label }) => (
    <div className="flex items-center gap-2">
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {value instanceof File && (
        <span className="text-xs text-green-600 font-medium whitespace-nowrap">
          ✓ {value.name.length > 15 ? value.name.substring(0, 15) + "…" : value.name}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-8xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">Add Organisation</h1>
            <p className="text-sm text-gray-700">Step {step + 1} of {STEPS.length} : {STEPS[step].title}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-4 gap-1 sm:gap-2">
              {STEPS.map((s, i) => (
                <div key={i} className="flex flex-col items-center flex-1 sm:flex-initial">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-sm ${i < step ? "bg-green-500 text-white" : i === step ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-700"}`}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-center mt-1 sm:mt-2">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Card */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">

            {/* STEP 1 – ORGANISATION */}
            {step === 0 && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-4">Basic Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <Field label="Registered Name" required error={errors.name}>
                    <input type="text" value={form.organisation.name} onChange={(e) => updateOrg("name", e.target.value)} placeholder="Enter registered name" className={inputCls(errors.name)} />
                  </Field>
                  <Field label="Phone Number" required error={errors.phone}>
                    <input type="tel" value={form.organisation.phone} onChange={(e) => updateOrg("phone", e.target.value)} placeholder="Enter phone number" className={inputCls(errors.phone)} />
                  </Field>
                  <Field label="Alternate Phone" required error={errors.altPhone}>
                    <input type="tel" value={form.organisation.altPhone} onChange={(e) => updateOrg("altPhone", e.target.value)} placeholder="Enter alternate phone" className={inputCls(errors.altPhone)} />
                  </Field>
                  <Field label="Email Address" required error={errors.email}>
                    <input type="email" value={form.organisation.email} onChange={(e) => updateOrg("email", e.target.value)} placeholder="Enter email address" className={inputCls(errors.email)} />
                  </Field>
                  <Field label="Secondary Email">
                    <input type="email" value={form.organisation.secondaryEmail} onChange={(e) => updateOrg("secondaryEmail", e.target.value)} placeholder="Enter secondary email" className={inputCls(false)} />
                  </Field>
                  <Field label="City" required error={errors.city}>
                    <input type="text" value={form.organisation.city} onChange={(e) => updateOrg("city", e.target.value)} placeholder="Enter city" className={inputCls(errors.city)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address Line 1">
                      <input type="text" value={form.organisation.address1} onChange={(e) => updateOrg("address1", e.target.value)} placeholder="Enter address line 1" className={inputCls(false)} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Address Line 2">
                      <input type="text" value={form.organisation.address2} onChange={(e) => updateOrg("address2", e.target.value)} placeholder="Enter address line 2" className={inputCls(false)} />
                    </Field>
                  </div>
                  <Field label="State" required error={errors.state}>
                    <input type="text" value={form.organisation.state} onChange={(e) => updateOrg("state", e.target.value)} placeholder="Enter state" className={inputCls(errors.state)} />
                  </Field>
                  <Field label="PIN Code" required error={errors.pin}>
                    <input type="text" value={form.organisation.pin} onChange={(e) => updateOrg("pin", e.target.value)} placeholder="Enter PIN code" className={inputCls(errors.pin)} />
                  </Field>
                  <Field label="Head Office Location">
                    <input type="text" value={form.organisation.headOffice} onChange={(e) => updateOrg("headOffice", e.target.value)} placeholder="Enter head office location" className={inputCls(false)} />
                  </Field>
                  <Field label="Organisation Type" required error={errors.type}>
                    <select value={form.organisation.type} onChange={(e) => updateOrg("type", e.target.value)} className={inputCls(errors.type)}>
                      <option value="">Select organisation type</option>
                      <option value="College">College</option>
                      <option value="School">School</option>
                      <option value="Institute">Institute</option>
                      <option value="University">University</option>
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 2 – DIRECTORS */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Director Details</h2>
                {form.directors.map((director, dirIdx) => (
                  <div key={dirIdx} className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Director {dirIdx + 1}</h3>
                      {form.directors.length > 1 && (
                        <button onClick={() => removeDirector(dirIdx)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
                      )}
                    </div>

                    <div className="space-y-6">
                      {/* Personal Details */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-800 mb-4">Personal Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="Director Name" required>
                            <input type="text" value={director.name} onChange={(e) => updateDirector(dirIdx, "name", e.target.value)} placeholder="Enter director name" className={inputCls(false)} />
                          </Field>
                          <Field label="Email Address">
                            <input type="email" value={director.email} onChange={(e) => updateDirector(dirIdx, "email", e.target.value)} placeholder="Enter email" className={inputCls(false)} />
                          </Field>
                          <Field label="Secondary Email">
                            <input type="email" value={director.secondaryEmail} onChange={(e) => updateDirector(dirIdx, "secondaryEmail", e.target.value)} placeholder="Enter secondary email" className={inputCls(false)} />
                          </Field>
                          <Field label="Contact Number" required>
                            <input type="tel" value={director.contact} onChange={(e) => updateDirector(dirIdx, "contact", e.target.value)} placeholder="Enter contact number" className={inputCls(false)} />
                          </Field>
                          <Field label="Mobile Number">
                            <input type="tel" value={director.mobile} onChange={(e) => updateDirector(dirIdx, "mobile", e.target.value)} placeholder="Enter mobile number" className={inputCls(false)} />
                          </Field>
                          <Field label="WhatsApp Number">
                            <input type="tel" value={director.whatsapp} onChange={(e) => updateDirector(dirIdx, "whatsapp", e.target.value)} placeholder="Enter WhatsApp number" className={inputCls(false)} />
                          </Field>
                          <Field label="Gender">
                            <select value={director.gender} onChange={(e) => updateDirector(dirIdx, "gender", e.target.value)} className={inputCls(false)}>
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </Field>
                          <Field label="Date of Birth">
                            <input type="date" value={director.dob} onChange={(e) => updateDirector(dirIdx, "dob", e.target.value)} className={inputCls(false)} />
                          </Field>
                          <Field label="% of Interest">
                            <input type="number" value={director.interest} onChange={(e) => updateDirector(dirIdx, "interest", e.target.value)} placeholder="Enter % of interest" className={inputCls(false)} />
                          </Field>
                          <Field label="Father's Name">
                            <input type="text" value={director.father} onChange={(e) => updateDirector(dirIdx, "father", e.target.value)} placeholder="Enter father's name" className={inputCls(false)} />
                          </Field>
                          <Field label="Spouse Name">
                            <input type="text" value={director.spouse} onChange={(e) => updateDirector(dirIdx, "spouse", e.target.value)} placeholder="Enter spouse name" className={inputCls(false)} />
                          </Field>
                          <Field label="Number of Children">
                            <input type="number" value={director.children} onChange={(e) => updateDirector(dirIdx, "children", e.target.value)} placeholder="Enter number of children" className={inputCls(false)} />
                          </Field>
                        </div>
                      </div>

                      {/* Current Address */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-4">Current Address</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Field label="Address Line 1">
                              <input type="text" value={director.currentAddress.line1} onChange={(e) => updateDirectorNested(dirIdx, "currentAddress", "line1", e.target.value)} placeholder="Enter address line 1" className={inputCls(false)} />
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Address Line 2">
                              <input type="text" value={director.currentAddress.line2} onChange={(e) => updateDirectorNested(dirIdx, "currentAddress", "line2", e.target.value)} placeholder="Enter address line 2" className={inputCls(false)} />
                            </Field>
                          </div>
                          <Field label="City">
                            <input type="text" value={director.currentAddress.city} onChange={(e) => updateDirectorNested(dirIdx, "currentAddress", "city", e.target.value)} placeholder="Enter city" className={inputCls(false)} />
                          </Field>
                          <Field label="State">
                            <input type="text" value={director.currentAddress.state} onChange={(e) => updateDirectorNested(dirIdx, "currentAddress", "state", e.target.value)} placeholder="Enter state" className={inputCls(false)} />
                          </Field>
                          <Field label="PIN Code">
                            <input type="text" value={director.currentAddress.pin} onChange={(e) => updateDirectorNested(dirIdx, "currentAddress", "pin", e.target.value)} placeholder="Enter PIN" className={inputCls(false)} />
                          </Field>
                        </div>
                      </div>

                      {/* Permanent Address */}
                      <div>
                        <label className="flex items-center mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            className="mr-2"
                            onChange={(e) => {
                              if (e.target.checked) {
                                const updatedDirectors = [...form.directors];
                                updatedDirectors[dirIdx].permanentAddress = { ...updatedDirectors[dirIdx].currentAddress };
                                setForm({ ...form, directors: updatedDirectors });
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">Same as Current Address</span>
                        </label>
                        <h4 className="font-semibold text-sm text-gray-700 mb-4">Permanent Address</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Field label="Address Line 1">
                              <input type="text" value={director.permanentAddress.line1} onChange={(e) => updateDirectorNested(dirIdx, "permanentAddress", "line1", e.target.value)} placeholder="Enter address line 1" className={inputCls(false)} />
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Address Line 2">
                              <input type="text" value={director.permanentAddress.line2} onChange={(e) => updateDirectorNested(dirIdx, "permanentAddress", "line2", e.target.value)} placeholder="Enter address line 2" className={inputCls(false)} />
                            </Field>
                          </div>
                          <Field label="City">
                            <input type="text" value={director.permanentAddress.city} onChange={(e) => updateDirectorNested(dirIdx, "permanentAddress", "city", e.target.value)} placeholder="Enter city" className={inputCls(false)} />
                          </Field>
                          <Field label="State">
                            <input type="text" value={director.permanentAddress.state} onChange={(e) => updateDirectorNested(dirIdx, "permanentAddress", "state", e.target.value)} placeholder="Enter state" className={inputCls(false)} />
                          </Field>
                          <Field label="PIN Code">
                            <input type="text" value={director.permanentAddress.pin} onChange={(e) => updateDirectorNested(dirIdx, "permanentAddress", "pin", e.target.value)} placeholder="Enter PIN" className={inputCls(false)} />
                          </Field>
                        </div>
                      </div>

                      {/* Documents — ✅ FIXED: store File object, not filename string */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-4">Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Field label="PAN Number">
                            <input type="text" placeholder="Enter PAN number" value={director.documents.panNo} onChange={(e) => updateDirectorNested(dirIdx, "documents", "panNo", e.target.value)} className={inputCls(false)} />
                          </Field>
                          <Field label="Upload PAN Document">
                            <FileInput
                              value={director.documents.panDoc}
                              onChange={(e) =>
                                // ✅ Store the actual File object
                                updateDirectorNested(dirIdx, "documents", "panDoc", e.target.files?.[0] || null)
                              }
                            />
                          </Field>
                          <Field label="Aadhaar Number">
                            <input type="text" placeholder="Enter Aadhaar number" value={director.documents.aadhaarNo} onChange={(e) => updateDirectorNested(dirIdx, "documents", "aadhaarNo", e.target.value)} className={inputCls(false)} />
                          </Field>
                          <Field label="Upload Aadhaar Document">
                            <FileInput
                              value={director.documents.aadhaarDoc}
                              onChange={(e) =>
                                // ✅ Store the actual File object
                                updateDirectorNested(dirIdx, "documents", "aadhaarDoc", e.target.files?.[0] || null)
                              }
                            />
                          </Field>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div>
                        <h4 className="font-semibold text-sm text-gray-700 mb-4">Bank Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <Field label="Bank Name">
                            <input type="text" placeholder="Enter bank name" value={director.bank.bankName} onChange={(e) => updateDirectorNested(dirIdx, "bank", "bankName", e.target.value)} className={inputCls(false)} />
                          </Field>
                          <Field label="Account Number">
                            <input type="text" placeholder="Enter account number" value={director.bank.accountNumber} onChange={(e) => updateDirectorNested(dirIdx, "bank", "accountNumber", e.target.value)} className={inputCls(false)} />
                          </Field>
                          <Field label="IFSC Code">
                            <input type="text" placeholder="Enter IFSC code" value={director.bank.ifscCode} onChange={(e) => updateDirectorNested(dirIdx, "bank", "ifscCode", e.target.value)} className={inputCls(false)} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addDirector} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 mt-4 text-sm">
                  <Plus size={20} /> Add Director
                </button>
              </div>
            )}

            {/* STEP 3 – LEGAL DETAILS */}
            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Legal Details & Documents</h2>
                {[
                  {
                    sectionTitle: "Land & Building Documents",
                    fields: [
                      { label: "Property Deed",                     numField: "propertyDeed",          docField: "propertyDeedDoc",          placeholder: "Deed reference/number" },
                      { label: "Building Approval",                  numField: "buildingApproval",       docField: "buildingApprovalDoc",       placeholder: "Approval number" },
                      { label: "Building Completion Certificate",    numField: "completionCertificate",  docField: "completionCertificateDoc",  placeholder: "Certificate number" },
                    ]
                  },
                  {
                    sectionTitle: "No Objection Certificates (NOCs)",
                    fields: [
                      { label: "Fire Department NOC",          numField: "fireNOC",          docField: "fireNOCDoc",          placeholder: "NOC number" },
                      { label: "Police NOC",                   numField: "policeNOC",        docField: "policeNOCDoc",        placeholder: "NOC number" },
                      { label: "Municipality NOC",             numField: "municipalityNOC",  docField: "municipalityNOCDoc",  placeholder: "NOC number" },
                      { label: "Education Department NOC",     numField: "educationDeptNOC", docField: "educationDeptNOCDoc", placeholder: "NOC number" },
                      { label: "Pollution Control Board NOC",  numField: "pollutionNOC",     docField: "pollutionNOCDoc",     placeholder: "NOC number" },
                    ]
                  },
                  {
                    sectionTitle: "Infrastructure & Safety Documents",
                    fields: [
                      { label: "Water Connection Certificate",    numField: "waterConnection",       docField: "waterConnectionDoc",       placeholder: "Reference number" },
                      { label: "Electricity Connection Certificate", numField: "electricityConnection", docField: "electricityConnectionDoc", placeholder: "Consumer number" },
                      { label: "Safety Audit Report",             numField: "safetyAudit",           docField: "safetyAuditDoc",           placeholder: "Audit reference" },
                      { label: "Drainage System Certification",   numField: "drainageSystem",        docField: "drainageSystemDoc",        placeholder: "Certificate number" },
                    ]
                  },
                  {
                    sectionTitle: "Financial & Administrative Documents",
                    fields: [
                      { label: "PAN Number",                      numField: "panNo",       docField: "panDoc",       placeholder: "Enter PAN number" },
                      { label: "GSTIN Number",                    numField: "gstinNo",     docField: "gstinNoDoc",   placeholder: "Enter GSTIN" },
                      { label: "Bank Account Certificate",        numField: "bankAccount", docField: "bankAccountDoc", placeholder: "Account number" },
                      { label: "Trust Deed / Society Registration", numField: "trustDeed",  docField: "trustDeedDoc", placeholder: "Document number" },
                    ]
                  },
                  {
                    sectionTitle: "Education Registration & Affiliation",
                    fields: [
                      { label: "DISE Code",                          numField: "diseCode",               docField: "diseCodeDoc",               placeholder: "Enter DISE code" },
                      { label: "Provisional Recognition Certificate", numField: "provisionalRecognition", docField: "provisionalRecognitionDoc", placeholder: "Certificate number" },
                      { label: "Board Affiliation Certificate",       numField: "affiliation",            docField: "affiliationDoc",            placeholder: "Affiliation number" },
                    ]
                  },
                  {
                    sectionTitle: "Mandatory Policies",
                    fields: [
                      { label: "Child Protection Policy",    numField: "childProtectionPolicy", docField: "childProtectionPolicyDoc", placeholder: "Policy reference" },
                      { label: "Harassment Prevention Policy", numField: "harassmentPolicy",    docField: "harassmentPolicyDoc",      placeholder: "Policy reference" },
                      { label: "Admission Policy",           numField: "admissionPolicy",       docField: "admissionPolicyDoc",       placeholder: "Policy reference" },
                      { label: "Fee Structure Document",     numField: "feeStructure",          docField: "feeStructureDoc",          placeholder: "Document reference" },
                    ]
                  },
                ].map((section) => (
                  <div key={section.sectionTitle} className="space-y-4">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 border-l-4 border-blue-500 pl-3">{section.sectionTitle}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {section.fields.map((f) => (
                        <div key={f.numField} className="border border-gray-200 rounded-lg p-4 space-y-3">
                          <Field label={f.label}>
                            <input
                              type="text"
                              placeholder={f.placeholder}
                              value={form.legal[f.numField]}
                              onChange={(e) => updateLegal(f.numField, e.target.value)}
                              className={inputCls(false)}
                            />
                          </Field>
                          <Field label={`Upload ${f.label}`}>
                            {/* ✅ FIXED: Store actual File object, not filename string */}
                            <FileInput
                              value={form.legal[f.docField]}
                              onChange={(e) => updateLegal(f.docField, e.target.files?.[0] || null)}
                            />
                          </Field>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 4 – BRANCH */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-6">Branch Locations</h2>
                {form.branches.map((branch, branchIdx) => (
                  <div key={branchIdx} className="border-2 border-gray-200 rounded-lg p-4 sm:p-6 bg-blue-50">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800">Branch {branchIdx + 1}</h3>
                      {form.branches.length > 1 && (
                        <button onClick={() => removeBranch(branchIdx)} className="text-red-500 hover:text-red-700"><Trash2 size={20} /></button>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        <Field label="Short Name (2 chars)">
                          <input type="text" maxLength="2" value={branch.shortName} onChange={(e) => updateBranch(branchIdx, "shortName", e.target.value)} placeholder="e.g. MU" className={inputCls(false)} />
                        </Field>
                        <Field label="Branch Name">
                          <input type="text" value={branch.name} onChange={(e) => updateBranch(branchIdx, "name", e.target.value)} placeholder="Enter branch name" className={inputCls(false)} />
                        </Field>
                        <Field label="City">
                          <input type="text" value={branch.city} onChange={(e) => updateBranch(branchIdx, "city", e.target.value)} placeholder="Enter city" className={inputCls(false)} />
                        </Field>
                        <Field label="State">
                          <input type="text" value={branch.state} onChange={(e) => updateBranch(branchIdx, "state", e.target.value)} placeholder="Enter state" className={inputCls(false)} />
                        </Field>
                        <Field label="PIN Code">
                          <input type="text" value={branch.pin} onChange={(e) => updateBranch(branchIdx, "pin", e.target.value)} placeholder="Enter PIN" className={inputCls(false)} />
                        </Field>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <Field label="Address Line 1">
                            <input type="text" value={branch.address1} onChange={(e) => updateBranch(branchIdx, "address1", e.target.value)} placeholder="Enter address line 1" className={inputCls(false)} />
                          </Field>
                        </div>
                        <div className="lg:col-span-3">
                          <Field label="Address Line 2">
                            <input type="text" value={branch.address2} onChange={(e) => updateBranch(branchIdx, "address2", e.target.value)} placeholder="Enter address line 2" className={inputCls(false)} />
                          </Field>
                        </div>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-4 mt-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-4">Institute Contact Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <Field label="Contact Person">
                            <input type="text" value={branch.contactPerson} onChange={(e) => updateBranch(branchIdx, "contactPerson", e.target.value)} placeholder="Enter contact person name" className={inputCls(false)} />
                          </Field>
                          <Field label="Contact Number">
                            <input type="tel" value={branch.contactNo} onChange={(e) => updateBranch(branchIdx, "contactNo", e.target.value)} placeholder="Enter contact number" className={inputCls(false)} />
                          </Field>
                          <Field label="Email Address">
                            <input type="email" value={branch.email} onChange={(e) => updateBranch(branchIdx, "email", e.target.value)} placeholder="Enter email" className={inputCls(false)} />
                          </Field>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addBranch} className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 mt-4 text-sm">
                  <Plus size={20} /> Add Branch
                </button>
              </div>
            )}

            {/* STEP 5 – FINALIZE */}
            {step === 4 && (
              <div className="space-y-6 text-left">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-6">Review & Finalize</h2>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 sm:p-6 space-y-4">
                  {[
                    { title: "Organisation Details", desc: `${form.organisation.name} - ${form.organisation.type} in ${form.organisation.city}, ${form.organisation.state}` },
                    { title: "Directors Added", desc: `${form.directors.length} director(s) added with contact details` },
                    { title: "Legal Documents", desc: "All legal documents and certifications uploaded" },
                    { title: "Branches Configured", desc: `${form.branches.length} branch location(s) configured` },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="text-xl sm:text-2xl text-green-600 flex-shrink-0">✓</span>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-800">{item.title}</h3>
                        <p className="text-sm text-gray-700">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 gap-3 sm:gap-4">
            <button
              onClick={goPrev}
              disabled={step === 0}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
            >
              <ChevronLeft size={20} /> Previous
            </button>

            {step < 4 ? (
              <button
                onClick={goNext}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition w-full sm:w-auto"
              >
                Next <ChevronLeft size={20} className="rotate-180" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition w-full sm:w-auto"
              >
                <Upload size={20} /> {submitting ? "Creating..." : "Create Organisation"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}