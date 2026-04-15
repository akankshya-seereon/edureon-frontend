import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

// --- AUTH TOKEN HELPER ---
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    token = storedUser?.token || storedUser?.data?.token;
  }
  return token;
};

export const StudentProfile = () => {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    fullName: "",
    studentId: "", 
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    aadhar: "",
    pan: "",
    course: "",
    section: "",
    address: "",
    photo: "",
  });

  /* ================= FETCH FROM DATABASE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getToken();
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/student/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          const d = res.data.data;
          
          // Logic: We use || "" to prevent null values from reaching the inputs
          setProfile({
            fullName: `${d.first_name || ""} ${d.last_name || ""}`.trim() || "Student Name",
            studentId: d.roll_no || d.student_code || "",
            email: d.email || "",
            mobile: d.phone || "",
            dob: d.dob ? new Date(d.dob).toISOString().split('T')[0] : "",
            gender: d.gender || "",
            aadhar: d.aadhar || "",
            pan: d.pan || "",
            course: d.course || d.standard_name || "",
            section: d.section || "",
            // Improved Address Handling
            address: d.address && typeof d.address === 'object' 
              ? `${d.address.street || ""}, ${d.address.city || ""}, ${d.address.state || ""}`.replace(/^, |, $/g, '')
              : (typeof d.address === 'string' ? d.address : ""),
            photo: d.profile_photo || d.photo || ""
          });
        }
      } catch (err) {
        console.error("Profile load error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ================= HANDLE PHOTO UPLOAD ================= */
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Fallback to empty string if value accidentally becomes null/undefined
    setProfile((prev) => ({ ...prev, [name]: value || "" }));
  };

  const handleUpdate = async () => {
    try {
      const token = getToken();
      const res = await axios.put("http://localhost:5000/api/student/profile/update", profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if(res.data.success) alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update profile details.");
    }
  };

  if (loading) {
    return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Loading Profile...</div>;
  }

  const initials = profile.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase() || "ST";

  return (
    <div className="w-full max-w-10xl mx-auto pb-12 animate-in fade-in duration-500">

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-white rounded-2xl p-8 shadow border mb-8">
        <h3 className="text-lg text-left font-bold mb-6">Quick Actions</h3>

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-600 border">
            {profile.photo ? (
              <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : ( <span className="opacity-50">{initials}</span> )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-6 py-2.5 border rounded-lg text-md font-bold hover:bg-gray-100 transition-colors"
          >
            <Upload size={16} />
            Upload photo
          </button>

          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhotoUpload} />
        </div>
      </div>

      {/* ================= PERSONAL DETAILS ================= */}
      <div className="bg-white rounded-2xl p-8 shadow border mb-8">
        <h3 className="text-lg text-left font-bold mb-8">Personal Details</h3>

        <div className="grid text-left grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Input label="Full Name" name="fullName" value={profile.fullName} onChange={handleChange} />
          <Input label="Student ID / Roll No" value={profile.studentId} readOnly />
          <Input label="Email Address" name="email" value={profile.email} onChange={handleChange} />
          <Input label="Mobile Number" name="mobile" value={profile.mobile} onChange={handleChange} />
          <Input label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} />
          <Input label="Gender" name="gender" value={profile.gender} onChange={handleChange} />
        </div>

        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          Update details
        </button>
      </div>

      {/* ================= IDENTITY DETAILS ================= */}
      <div className="bg-white rounded-2xl p-8 shadow border mb-8">
        <h3 className="text-lg text-left font-bold mb-8">Identity Details</h3>
        <div className="grid text-left grid-cols-1 md:grid-cols-2 gap-8">
          <Input label="Aadhar Number" name="aadhar" value={profile.aadhar} readOnly />
          <Input label="PAN Number" name="pan" value={profile.pan} readOnly />
        </div>
      </div>

      {/* ================= ACADEMICS DETAILS ================= */}
      <div className="bg-white rounded-2xl p-8 shadow border mb-8">
        <h3 className="text-lg text-left font-bold mb-8">Academics Details</h3>
        <div className="grid text-left grid-cols-1 md:grid-cols-2 gap-8">
          <Input label="Course / Program" value={profile.course} readOnly />
          <Input label="Class / Section" value={profile.section} readOnly />
        </div>
      </div>

      {/* ================= ADDRESS DETAILS ================= */}
      <div className="bg-white rounded-2xl p-8 shadow border">
        <h3 className="text-lg text-left font-bold mb-8">Address Details</h3>
        <div className="grid text-left grid-cols-1 gap-8">
          <Input label="Current Residential Address" name="address" value={profile.address} onChange={handleChange} />
        </div>
      </div>

    </div>
  );
};

/* ================= REUSABLE INPUT ================= */
const Input = ({ label, value, ...props }) => (
  <div className="space-y-2">
    <label className="text-md font-bold ml-1 text-slate-700">{label}</label>
    <input
      {...props}
      // Safety: Ensure value is never null
      value={value || ""} 
      className={`w-full bg-gray-100 rounded-xl px-4 py-4 font-bold text-md outline-none text-slate-600 focus:ring-4 focus:ring-blue-500/10 transition-all ${props.readOnly ? 'opacity-70 cursor-not-allowed border-dashed border-gray-300' : 'hover:bg-gray-200 focus:bg-white border-transparent'}`}
    />
  </div>
);