import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";

export const StudentAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // 🎯 FIXED: Removed local storage token, added withCredentials: true
        const res = await axios.get("http://localhost:5000/api/faculty/assignments", {
          withCredentials: true 
        });
        
        if (res.data.success) {
          setAssignments(res.data.data);
        }
      } catch (err) {
        setError("Failed to load assignments. Please try again later.");
        console.error("Fetch Assignments Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-md text-gray-500 mt-1">Manage assignments and evaluate submissions</p>
        </div>
        <button
          onClick={() => navigate("/faculty/assignments/create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-md font-semibold hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 bg-blue-600">
          <h2 className="text-base text-left font-semibold text-white">Assignment List</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 flex justify-center items-center"><Loader2 className="animate-spin text-blue-600" /></div>
          ) : error ? (
            <div className="p-10 text-center text-red-500 flex flex-col items-center gap-2">
               <AlertCircle /> {error}
            </div>
          ) : (
            <table className="w-full text-left text-md">
              <thead>
                <tr className="border-b border-gray-100 text-blue-600 bg-gray-50">
                  <th className="px-5 py-4 font-semibold">Title</th>
                  <th className="px-5 py-4 font-semibold">Course</th>
                  <th className="px-5 py-4 font-semibold">Module</th>
                  <th className="px-5 py-4 font-semibold">Due Date</th>
                  <th className="px-5 py-4 font-semibold">Max Marks</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400">No assignments found.</td></tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900">{a.title}</td>
                      <td className="px-5 py-4 text-gray-700">{a.course_name}</td>
                      <td className="px-5 py-4 text-gray-500 italic">{a.module_name}</td>
                      <td className="px-5 py-4 text-gray-700">{new Date(a.due_date).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-gray-700">{a.max_points}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          a.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};