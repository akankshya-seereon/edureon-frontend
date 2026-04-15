import { useState, useEffect } from "react";
import { User, Lock, Building, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

export const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  
  // --- Form States ---
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  
  // --- UI States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Helper to get token (adjust this based on how you store your auth token)
  const token = localStorage.getItem("token"); 

  // --- Fetch Initial Profile Data ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/settings/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setProfile({
            name: response.data.profile.name || "",
            email: response.data.profile.email || "",
            phone: response.data.profile.phone || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        showMessage("error", "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // --- Temporary Message Handler ---
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // --- Save Profile Handler ---
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await axios.put("http://localhost:5000/api/admin/settings/profile", profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        showMessage("success", "Profile updated successfully!");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // --- Update Password Handler ---
  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showMessage("error", "New passwords do not match!");
    }
    if (passwords.newPassword.length < 6) {
      return showMessage("error", "Password must be at least 6 characters.");
    }

    setSaving(true);
    try {
      const response = await axios.put("http://localhost:5000/api/admin/settings/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showMessage("success", "Password updated successfully!");
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" }); // Clear form
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        
        {/* Status Message Toast */}
        {message.text && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {message.text}
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("profile")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === "profile" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <User size={18} /> My Profile
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === "security" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Lock size={18} /> Security
          </button>
          <button 
            onClick={() => setActiveTab("institute")}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === "institute" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <Building size={18} /> Institute Rules
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          
          {/* PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-slate-800">Profile Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Admin Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Official Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" 
                    disabled // Emails usually shouldn't be changed without a verification process
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Phone Number</label>
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 transition-all"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* SECURITY SETTINGS */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-xl font-bold text-slate-800">Security & Password</h2>
              <div className="max-w-md space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Current Password</label>
                  <input 
                    type="password" 
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">New Password</label>
                  <input 
                    type="password" 
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <button 
                  onClick={handleUpdatePassword}
                  disabled={saving || !passwords.currentPassword || !passwords.newPassword}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70 transition-all"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};