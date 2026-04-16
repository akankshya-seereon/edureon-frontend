import { useState, useEffect } from "react";
import { User, Mail, Phone, GraduationCap, BookOpen, Award, Loader2, Landmark } from "lucide-react";
import axios from "axios";
import apiBaseUrl from "../../../config/baseurl"; // Base URL for API calls

export const FacultyProfile = () => {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeClassesCount, setActiveClassesCount] = useState(0);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    experience: "",
    qualification: "",
    specializations: "", 
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Profile Infohttp://localhost:5000/api
        const profileResponse = await axios.get(`${apiBaseUrl}/faculty/profile/me`, {
          withCredentials: true 
        });

        if (profileResponse.data.success) {
          const data = profileResponse.data.data;
          setFaculty(data);
          
          setForm({
            // 🚀 SYNC: Using 'fullName' which comes from 'f.name AS fullName' in your model
            fullName: data.fullName || "",
            email: data.email || "",
            mobile: data.mobile || "",
            experience: data.experience || 0,
            qualification: data.qualification || "",
            // Handle if specializations is a string or array
            specializations: Array.isArray(data.specializations) 
              ? data.specializations.join(", ") 
              : (data.specializations || ""),
          });
        }

        // 2. Fetch Classes count
        try {
          const classesResponse = await axios.get(`${apiBaseUrl}/faculty/classes/my-classes`, {
            withCredentials: true 
          });
          if (classesResponse.data.success) {
            setActiveClassesCount(classesResponse.data.data?.length || 0);
          }
        } catch (classErr) {
          console.error("Non-blocking: Classes count fetch failed.");
        }

      } catch (err) {
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const specsArray = typeof form.specializations === 'string' 
        ? form.specializations.split(",").map((s) => s.trim()).filter((s) => s !== "")
        : form.specializations;

      const updatePayload = {
        fullName: form.fullName,
        email: form.email,
        mobile: form.mobile,
        experience: form.experience,
        qualification: form.qualification,
        specializations: specsArray,
      };

      const response = await axios.put(
        `${apiBaseUrl}/faculty/profile/update`,
        updatePayload,
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccess("Profile updated successfully!");
        setFaculty({ ...faculty, ...updatePayload }); 
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError("Update failed.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      const response = await axios.put(
        `${apiBaseUrl}/faculty/profile/change-password`,
        { current: passwordForm.current, newPass: passwordForm.newPass },
        { withCredentials: true }
      );
      if (response.data.success) {
        setShowPasswordModal(false);
        setPasswordForm({ current: "", newPass: "", confirm: "" });
        setSuccess("Password changed successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Error changing password.");
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-500 font-medium">Loading Profile...</span>
    </div>
  );
  
  if (!faculty) return <div className="p-6 text-red-500">No data found.</div>;

  return (
    <div className="p-6 space-y-6 max-w-8xl mx-auto">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start text-left justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{faculty.fullName || faculty.name}</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <Landmark size={16} />
            <p className="text-md font-medium">{faculty.institute_name || "Academy Member"}</p>
          </div>
        </div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-md font-medium hover:bg-gray-50 transition"
        >
          Change Password
        </button>
      </div>

      {success && <div className="bg-green-50 text-left border border-green-200 text-green-700 text-md px-4 py-3 rounded-lg">{success}</div>}
      {error && <div className="bg-red-50 text-left border border-red-200 text-red-700 text-md px-4 py-3 rounded-lg">{error}</div>}

      {/* ── Photo + Personal Details Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4">
          <h2 className="text-base font-semibold text-gray-800 self-start">Profile Photo</h2>
          <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
            {photoPreview ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-14 h-14 text-blue-400" />}
          </div>
          <label className="border border-gray-300 rounded-lg px-4 py-2 text-md font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer">
            Upload Photo
            <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handlePhotoUpload} />
          </label>
        </div>

        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-left text-gray-800">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-md font-medium text-left text-gray-700 mb-1">Full Name</label>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="flex-1 bg-transparent outline-none text-md" />
              </div>
            </div>
            <div>
              <label className="block text-md text-left font-medium text-gray-700 mb-1">Email</label>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="email" name="email" value={form.email} onChange={handleChange} className="flex-1 bg-transparent outline-none text-md" />
              </div>
            </div>
            <div>
              <label className="block text-md font-medium text-left text-gray-700 mb-1">Mobile Number</label>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} className="flex-1 bg-transparent outline-none text-md" />
              </div>
            </div>
            <div>
              <label className="block text-md text-left font-medium text-gray-700 mb-1">Experience (Years)</label>
              <input type="number" name="experience" value={form.experience} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-md outline-none" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Professional Details ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <h2 className="text-base text-left font-semibold text-gray-800">Professional Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-md text-left font-medium text-gray-700 mb-1">Qualification</label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" name="qualification" value={form.qualification} onChange={handleChange} className="flex-1 bg-transparent outline-none text-md" />
            </div>
          </div>
          <div>
            <label className="block text-md text-left font-medium text-gray-700 mb-1">Specialization</label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <BookOpen className="w-4 h-4 text-gray-400 shrink-0" />
              <input type="text" name="specializations" value={form.specializations} onChange={handleChange} className="flex-1 bg-transparent outline-none text-md" />
            </div>
          </div>
        </div>
        <div className="flex justify-end"><button onClick={handleUpdate} className="bg-black text-white text-md font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition shadow-md active:scale-95">Update Profile</button></div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={<Award />} value={faculty.experience} label="Years of Experience" color="blue" />
        <StatCard icon={<GraduationCap />} value={Array.isArray(faculty.specializations) ? faculty.specializations.length : 0} label="Specializations" color="green" />
        <StatCard icon={<BookOpen />} value={activeClassesCount} label="Active Classes" color="purple" />
      </div>

      {/* Password Modal Code is same as before */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           {/* Modal Content as in your original code */}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, value, label, color }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-500",
    green: "bg-green-100 text-green-500",
    purple: "bg-purple-100 text-purple-500"
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors[color]}`}>{icon}</div>
      <div><p className="text-2xl font-bold text-gray-900">{value || 0}</p><p className="text-md text-gray-500">{label}</p></div>
    </div>
  );
}

export default FacultyProfile;