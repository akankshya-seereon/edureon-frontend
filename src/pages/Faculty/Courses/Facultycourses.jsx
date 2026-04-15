import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, FileText, BookOpen, Plus, Loader2 } from "lucide-react";

export const FacultyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Fetch Data From Backend ───────────────────────────────────────
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // 🎯 FIXED: Removed local storage token and added withCredentials: true
        const response = await axios.get("http://localhost:5000/api/faculty/courses", {
          withCredentials: true 
        });
        
        if (response.data.success) {
          setCourses(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ── Navigation Handlers ──────────────────────────────────────────
  const handleView = (course) => {
    navigate("/faculty/courses/detail", { state: { course } });
  };

  const handleModules = (course) => {
    navigate("/faculty/courses/modules", { state: { course } });
  };

  const handleCreateCourse = () => {
    navigate("/faculty/courses/create");
  };

  // ── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-left">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
          <p className="text-md text-gray-500 mt-1">Create and manage course content</p>
        </div>
        <button
          onClick={handleCreateCourse}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-md font-semibold hover:bg-blue-700 transition active:scale-95 shadow-md"
        >
          <Plus className="w-4 h-4" />
          Create Course
        </button>
      </div>

      {/* ── Table Card ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 bg-blue-600 flex justify-between items-center">
          <h2 className="text-base font-semibold text-white">Course List</h2>
          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md font-bold">
            {courses.length} Total
          </span>
        </div>

        <div className="overflow-x-auto">
          {courses.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-3">
              <BookOpen className="w-12 h-12 text-gray-300" />
              <p className="text-gray-500 font-medium">No courses found. Create your first course to get started!</p>
            </div>
          ) : (
            <table className="w-full text-left text-md">
              <thead>
                <tr className="border-b border-gray-100 text-blue-600 bg-gray-50">
                  <th className="font-semibold px-5 py-4 whitespace-nowrap">Course Title</th>
                  <th className="font-semibold px-5 py-4 whitespace-nowrap">Class</th>
                  <th className="font-semibold px-5 py-4 whitespace-nowrap">Academic Year</th>
                  <th className="font-semibold px-5 py-4 whitespace-nowrap">Modules</th>
                  <th className="font-semibold px-5 py-4 whitespace-nowrap">Status</th>
                  <th className="font-semibold px-5 py-4 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr
                    key={course.id}
                    className={`hover:bg-blue-50 transition-colors ${
                      index !== courses.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-bold text-gray-900 whitespace-nowrap">
                      {course.courseTitle}
                    </td>
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                      {course.class}
                    </td>
                    <td className="px-5 py-4 text-gray-700 whitespace-nowrap">
                      {course.academicYear}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 w-fit text-sm bg-white">
                        <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                        {course.modules || 0} modules
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          course.status === "Published"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(course)}
                          className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleModules(course)}
                          className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
                        >
                          <FileText className="w-4 h-4" />
                          Modules
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};