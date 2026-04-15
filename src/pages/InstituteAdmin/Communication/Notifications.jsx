import { useEffect, useState } from "react";
import axios from "axios";
import {
  Send,
  ChevronDown,
  Mail,
  Smartphone,
  MailCheck,
  Clock,
  MessageSquareX,
  User
} from "lucide-react";

// --- AUTH TOKEN HELPER ---
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    token = storedUser?.token || storedUser?.data?.token;
  }
  return token;
};

export const Notifications = () => {
  const [loading, setLoading] = useState(false);

  // Form state
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  // Toggle state
  const [targetRoles, setTargetRoles] = useState(["Students"]);
  const [channels, setChannels] = useState(["SMS"]);

  // Notifications list
  const [notifications, setNotifications] = useState([]);

  /* ----------------------------------
     🚀 DYNAMIC: FETCH NOTIFICATIONS
   ---------------------------------- */
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/admin/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Map data and parse JSON arrays from MySQL
        const formattedData = response.data.notifications.map(n => ({
          ...n,
          targetRoles: typeof n.targetRoles === 'string' ? JSON.parse(n.targetRoles) : (n.targetRoles || []),
          channels: typeof n.channels === 'string' ? JSON.parse(n.channels) : (n.channels || []),
        }));
        setNotifications(formattedData);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ----------------------------------
      Helpers
   ---------------------------------- */
  const toggleRole = (role) => {
    setTargetRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const toggleChannel = (channel) => {
    setChannels((prev) =>
      prev.includes(channel)
        ? prev.filter((c) => c !== channel)
        : [...prev, channel]
    );
  };

  /* ----------------------------------
     🚀 DYNAMIC: SUBMIT HANDLER
   ---------------------------------- */
  const handleSend = async (e) => {
    e.preventDefault();

    if (!title || !message || !course) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      if (!token) return;

      const payload = {
        course,
        title,
        message,
        targetRoles: JSON.stringify(targetRoles),
        channels: JSON.stringify(channels),
        scheduleDate: scheduleDate || null,
        scheduleTime: scheduleTime || null,
        status: scheduleDate || scheduleTime ? "pending" : "delivered",
      };

      await axios.post("http://localhost:5000/api/admin/notifications", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form
      setCourse("");
      setTitle("");
      setMessage("");
      setScheduleDate("");
      setScheduleTime("");
      setTargetRoles(["Students"]);
      setChannels(["SMS"]);

      // Refresh list from DB
      fetchNotifications();
      alert("Notification Broadcasted Successfully!");

    } catch (err) {
      console.error("Save Error:", err);
      alert(err.response?.data?.message || "Failed to broadcast notification.");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------------------
      Stats Calculation
   ---------------------------------- */
  const deliveredCount = notifications.filter(
    (n) => n.status === "delivered"
  ).length;

  const pendingCount = notifications.filter(
    (n) => n.status === "pending"
  ).length;

  const failedCount = notifications.filter(
    (n) => n.status === "failed"
  ).length;

  return (
    <div className="w-full max-w-7xl mx-auto pb-12">
      {/* Title */}
      <div className="mb-10 mt-2">
        <h1 className="text-4xl font-black text-[#1e293b] tracking-tight">
          Notifications
        </h1>
        <p className="text-slate-400 font-medium mt-2">
          Send notifications to students, faculty, and staff
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* FORM */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="h-2 bg-[#2563eb]" />

          <form onSubmit={handleSend} className="p-10 space-y-8 text-left">
            {/* Course */}
            <div>
              <label className="text-md  font-black uppercase tracking-widest text-slate-700">
                Course / Class
              </label>
              <div className="relative mt-2">
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-slate-100 rounded-xl px-5 py-4 font-bold text-md appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                >
                  <option value="">Select Target Audience</option>
                  <option>B.Tech CSE - Year 1</option>
                  <option>B.Tech CSE - Year 2</option>
                  <option>All Faculty</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            {/* Title */}
            <div>
                <label className="text-md font-black uppercase tracking-widest text-slate-700">Title</label>
                <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification Title"
                className="w-full mt-2 bg-slate-100 rounded-xl px-5 py-4 font-bold text-md outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                />
            </div>

            {/* Message */}
            <div>
                <label className="text-md font-black uppercase tracking-widest text-slate-700">Message</label>
                <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                placeholder="Notification Message"
                className="w-full mt-2 bg-slate-100 rounded-xl px-5 py-4 font-bold text-md resize-none outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                />
            </div>

            {/* Target Roles */}
            <div>
              <p className="text-md font-black uppercase tracking-widest mb-3 text-slate-700">
                Target Roles
              </p>
              <div className="flex flex-wrap gap-2">
                {["Students", "Faculty", "Staff", "Institute"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-5 py-2.5 rounded-xl text-md font-bold uppercase tracking-wider transition-all ${
                      targetRoles.includes(role)
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Delivery Channels */}
            <div>
              <p className="text-md font-black uppercase tracking-widest mb-3 text-slate-700">
                Delivery Channels
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleChannel("Email")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-md font-bold uppercase tracking-wider transition-all ${
                    channels.includes("Email")
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <Mail size={16} /> Email
                </button>
                <button
                  type="button"
                  onClick={() => toggleChannel("SMS")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-md font-bold uppercase tracking-wider transition-all ${
                    channels.includes("SMS")
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <Smartphone size={16} /> SMS
                </button>
              </div>
            </div>

            {/* Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="text-md font-black uppercase tracking-widest text-slate-700">Schedule Date</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full mt-2 bg-slate-100 rounded-xl px-5 py-4 font-bold text-md outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-500 uppercase"
                  />
              </div>
              <div>
                  <label className="text-md font-black uppercase tracking-widest text-slate-700">Schedule Time</label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full mt-2 bg-slate-100 rounded-xl px-5 py-4 font-bold text-md outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-500 uppercase"
                  />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button
                disabled={loading}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-xl text-md font-bold uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? "Sending..." : <><Send size={16} strokeWidth={2.5} /> Send Notification</>}
              </button>
            </div>
          </form>
        </div>

        {/* STATS */}
        <div className="space-y-6">
          <StatCard
            label="Delivered"
            count={deliveredCount}
            icon={<MailCheck size={32} strokeWidth={2} />}
            color="blue"
          />
          <StatCard 
            label="Pending" 
            count={pendingCount} 
            icon={<Clock size={32} strokeWidth={2} />} 
            color="orange"
          />
          <StatCard 
            label="Failed" 
            count={failedCount} 
            icon={<MessageSquareX size={32} strokeWidth={2} />} 
            color="red"
          />
        </div>
      </div>

      {/* 📜 NOTIFICATION HISTORY */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-black text-slate-800">Recent Notifications</h3>
        </div>
        
        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold">
              No notifications have been broadcasted yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-800">{n.title}</h4>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mt-1">
                      {n.course}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                    n.status === 'delivered' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    n.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {n.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mt-4 leading-relaxed bg-white border border-slate-100 p-4 rounded-xl">
                  {n.message}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-6 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-slate-300" /> 
                    {n.targetRoles?.join(", ") || "All"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-300" /> 
                    {n.channels?.join(", ") || "N/A"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-300" /> 
                    {new Date(n.created_at).toLocaleString('en-IN', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ----------------------------------
   Stats Card Component
---------------------------------- */
const StatCard = ({ label, count, icon, color }) => {
  const colorStyles = {
      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      orange: "bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white",
      red: "bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-6 group hover:scale-[1.02] transition-all cursor-pointer">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${colorStyles[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter mt-1">{count}</h3>
      </div>
    </div>
  );
};