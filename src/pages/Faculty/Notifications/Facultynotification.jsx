import { useState, useEffect } from "react";
import axios from "axios";
import { FileText, CalendarDays, UserCheck, Bell, CheckCircle2, Loader } from "lucide-react";

// Helper to determine the icon based on the notification title or type
const getTypeIcon = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("assignment")) return <FileText className="w-5 h-5 text-blue-500" />;
  if (t.includes("exam") || t.includes("schedule") || t.includes("class")) return <CalendarDays className="w-5 h-5 text-purple-500" />;
  if (t.includes("leave")) return <UserCheck className="w-5 h-5 text-green-500" />;
  return <Bell className="w-5 h-5 text-yellow-500" />;
};

// Helper to format MySQL timestamps to a readable string (e.g., "Feb 16, 10:30 AM")
const formatTime = (dateString) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// 🎯 NEW HELPER: Safely gets the token without sending "undefined" causing 401 errors
const getAuthConfig = () => {
  let token = localStorage.getItem("token");
  if (!token || token === "undefined") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      token = userObj?.token;
    } catch (e) {}
  }
  
  const config = { withCredentials: true }; // Ensures cookies are sent!
  
  // Only attach the header if a real token exists
  if (token && token !== "undefined" && token !== "null") {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return config;
};


export const FacultyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // 1. 📡 FETCH NOTIFICATIONS FROM BACKEND
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 🎯 Using the safe auth config here!
        const res = await axios.get("http://localhost:5000/api/faculty/notifications", getAuthConfig());

        if (res.data.success) {
          // Normalize the data (mapping DB columns to standard UI props)
          const fetchedData = res.data.notifications.map(n => ({
            ...n,
            read: n.status === 'read' || n.is_read === 1 || n.is_read === true
          }));
          setNotifications(fetchedData);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // 2. 📡 UPDATE BACKEND WHEN MARKED AS READ
  const markAsRead = async (id) => {
    // Optimistic UI update (feels instant to the user)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    try {
      // 🎯 Using the safe auth config here!
      await axios.put(`http://localhost:5000/api/faculty/notifications/${id}/read`, {}, getAuthConfig());
    } catch (error) {
      console.error("Failed to mark as read in DB", error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      // 🎯 Using the safe auth config here!
      await axios.put(`http://localhost:5000/api/faculty/notifications/read-all`, {}, getAuthConfig());
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const filtered =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : activeTab === "read"
      ? notifications.filter((n) => n.read)
      : notifications;

  const tabs = [
    { key: "all",    label: "All Notifications", count: notifications.length, countStyle: "bg-gray-200 text-gray-700" },
    { key: "unread", label: "Unread",            count: unreadCount,          countStyle: "bg-blue-500 text-white" },
    { key: "read",   label: "Read",              count: null },
  ];

  return (
    <div className="p-6 text-left space-y-6 max-w-8xl mx-auto animate-in fade-in duration-500">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Stay updated with your activities</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="border-2 border-gray-200 text-gray-600 text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all active:scale-95"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1.5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab.key
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${tab.countStyle}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification List ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        {loading ? (
           <div className="py-20 flex flex-col items-center justify-center gap-4">
             <Loader className="w-8 h-8 text-blue-500 animate-spin" />
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Alerts...</p>
           </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
               <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-800 font-black text-lg">All caught up!</p>
            <p className="text-gray-400 text-sm font-medium mt-1">You have no {activeTab === "all" ? "" : activeTab} notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`rounded-[1.5rem] border-2 p-5 transition-all hover:-translate-y-0.5 ${
                  !n.read
                    ? "bg-blue-50/50 border-blue-100 shadow-sm"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Icon + Content */}
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 shrink-0 p-3 rounded-2xl ${!n.read ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                       {getTypeIcon(n.title)}
                    </div>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-3">
                        <p className={`text-base font-black ${!n.read ? 'text-blue-900' : 'text-gray-800'}`}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="bg-blue-500 text-white text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-lg shadow-sm shadow-blue-200">
                            New
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${!n.read ? 'text-blue-800/80 font-medium' : 'text-gray-500'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider pt-1">
                        {formatTime(n.created_at || n.time)}
                      </p>
                    </div>
                  </div>

                  {/* Mark as read */}
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-500 bg-white border border-blue-100 px-4 py-2 rounded-xl hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all whitespace-nowrap shrink-0 active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};