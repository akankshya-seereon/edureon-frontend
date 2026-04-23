import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Users, Loader2, AlertCircle, BookOpen, Clock } from "lucide-react";
import api from "../../../services/api";

export const FacultyClasses = () => {
  const navigate = useNavigate();
  
  // --- STATE ---
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // Calls the backend through our interceptor
        const response = await api.get("/faculty/classes/my-classes"); 
        
        const classData = response.data.data || [];
        setClasses(classData);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setError(err.response?.data?.message || "Failed to load classes.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // --- HANDLERS ---
  const handleView = (cls) => {
    navigate("/faculty/classes/detail", { state: { cls } });
  };

  // 🚀 FIXED: Helper function to safely format the schedule array into a string
  const formatSchedule = (schedule) => {
    if (!Array.isArray(schedule) || schedule.length === 0 || !schedule[0]?.day) {
      return <span className="text-gray-400 italic">No schedule assigned</span>;
    }
    
    return (
      <div className="flex flex-col gap-1">
        {schedule.filter(s => s.day).map((slot, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <Clock size={12} className="text-gray-400 shrink-0" />
            <span>
              <span className="font-semibold text-gray-700">{slot.day.slice(0, 3)}</span> {slot.startTime || ''}{slot.startTime && slot.endTime ? ` - ${slot.endTime}` : ''}
              {slot.room && <span className="ml-1 text-gray-400">({slot.room})</span>}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl text-left font-bold text-gray-900">My Classes</h1>
        <p className="text-md text-left text-gray-500 mt-1">
          View and manage all your assigned classes
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-blue-600 flex justify-between items-center">
          <h2 className="text-base text-left font-semibold text-white">Assigned Classes</h2>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
            {classes.length} Total
          </span>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-blue-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-500">Loading your schedule...</p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-200 hover:bg-red-100 transition"
            >
              Try Again
            </button>
          </div>
        ) : (
          /* DATA TABLE */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-left border-gray-100 text-blue-600 bg-slate-50">
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Class Name</th>
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Section</th>
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Subject</th>
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Academic Year</th>
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Schedule</th>
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Students</th>
                  <th className="text-left font-semibold px-5 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.length > 0 ? (
                  classes.map((cls, index) => (
                    <tr
                      key={cls.id || index}
                      className={`border-b border-gray-50 hover:bg-blue-50/50 transition-colors ${
                        index === classes.length - 1 ? "border-b-0" : ""
                      }`}
                    >
                      <td className="px-5 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {/* 🚀 FIXED: using className directly as defined in your backend model */}
                        {cls.className}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="inline-block border border-gray-300 rounded-md px-2.5 py-0.5 text-xs font-bold text-gray-700 bg-white uppercase">
                          {cls.section || 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{cls.subject}</td>
                      <td className="px-5 py-4 text-gray-700 whitespace-nowrap">{cls.academicYear}</td>
                      <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                        {/* 🚀 FIXED: Passing the array to our new helper function */}
                        {formatSchedule(cls.schedule)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <Users className="w-4 h-4 text-blue-500" />
                          {cls.students || 0}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleView(cls)}
                          className="flex items-center gap-1.5 border border-blue-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* EMPTY STATE */
                  <tr>
                    <td colSpan="7" className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <BookOpen className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-lg font-bold text-slate-600">No Classes Assigned</p>
                        <p className="text-sm text-slate-400 mt-1">Check back later or contact the administrator.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyClasses;