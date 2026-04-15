import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Award, BookOpen, TrendingUp, CheckCircle, Loader } from 'lucide-react';

// 🎯 NEW HELPER: Safely gets the token without sending "undefined"
const getAuthConfig = () => {
  let token = localStorage.getItem("token");
  if (!token || token === "undefined") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      token = userObj?.token;
    } catch (e) {}
  }
  
  const config = { withCredentials: true }; 
  if (token && token !== "undefined" && token !== "null") {
    config.headers = { Authorization: `Bearer ${token}` };
  }
  return config;
};

// Helper to format dates dynamically from MySQL
const formatDate = (dateString) => {
  if (!dateString) return "TBA";
  return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function Exam() {
  const [activeTab, setActiveTab] = useState('exams');
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    passed: 0,
    totalMarks: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);

  // 1. 📡 FETCH REAL DATA ON MOUNT
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const storedTab = localStorage?.getItem('exam_active_tab') || 'exams';
        setActiveTab(storedTab);

        const config = getAuthConfig();

        // 🚀 High-speed parallel fetching!
        // We use .catch on individual requests so if one fails, it doesn't break the whole page
        const [upcomingRes, resultsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/student/exams/upcoming", config).catch(() => ({ data: { exams: [] } })),
          axios.get("http://localhost:5000/api/student/exams/results", config).catch(() => ({ data: { results: [] } }))
        ]);

        const upcoming = upcomingRes.data.exams || upcomingRes.data.data || [];
        const results = resultsRes.data.results || resultsRes.data.data || [];

        setUpcomingExams(upcoming);
        setExamResults(results);
        calculateStats(results);

      } catch (error) {
        console.error('Error loading exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, []);

  // Calculate statistics dynamically based on real data
  const calculateStats = (results) => {
    if (!results || results.length === 0) {
      setStats({ totalSubjects: 0, passed: 0, totalMarks: 0, percentage: 0 });
      return;
    }

    const totalSubjects = results.length;
    const passed = results.filter(r => r.status === 'Pass' || r.status === 'Passed').length;
    // Handle both snake_case (from DB) and camelCase properties
    const totalObtained = results.reduce((sum, r) => sum + (Number(r.marksObtained || r.marks_obtained) || 0), 0);
    const maxMarks = results.reduce((sum, r) => sum + (Number(r.totalMarks || r.total_marks) || 0), 0);
    const percentage = maxMarks > 0 ? ((totalObtained / maxMarks) * 100).toFixed(2) : 0;

    setStats({ totalSubjects, passed, totalMarks: totalObtained, percentage });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage?.setItem('exam_active_tab', tab);
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-emerald-600 border-emerald-300 bg-emerald-50',
      'A': 'text-emerald-600 border-emerald-300 bg-emerald-50',
      'B+': 'text-blue-600 border-blue-300 bg-blue-50',
      'B': 'text-blue-600 border-blue-300 bg-blue-50',
      'C': 'text-amber-600 border-amber-300 bg-amber-50',
    };
    return colors[grade] || 'text-gray-600 border-gray-300 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-32 flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-sm font-bold tracking-widest uppercase text-slate-500 animate-pulse">Loading Exam Records...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">Exams & Results</h1>
          <p className="text-lg text-slate-600">View your exam schedule and track your performance</p>
        </div>

        {/* ===== MODERN TAB SECTION ===== */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
          {/* Tab Navigation Bar */}
          <div className="flex items-center bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
            <button
              onClick={() => handleTabChange('exams')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-lg transition-all duration-300 relative ${
                activeTab === 'exams' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Upcoming Exams
              {activeTab === 'exams' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-full" />
              )}
            </button>

            <div className="h-8 w-px bg-slate-200" />

            <button
              onClick={() => handleTabChange('results')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold text-lg transition-all duration-300 relative ${
                activeTab === 'results' ? 'text-emerald-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-5 h-5" />
              Results & Analytics
              {activeTab === 'results' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-full" />
              )}
            </button>
          </div>

          {/* Tab Content Container */}
          <div className="p-8">
            {/* ===== EXAMS TAB CONTENT ===== */}
            {activeTab === 'exams' && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Upcoming Exams</h2>
                    <p className="text-slate-600 text-sm mt-1">Schedule and details of your upcoming examinations</p>
                  </div>
                </div>

                {upcomingExams.length > 0 ? (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-md font-bold text-slate-900">Exam Name</th>
                            <th className="px-6 py-4 text-left text-md font-bold text-slate-900">Subject</th>
                            <th className="px-6 py-4 text-left text-md font-bold text-slate-900">Type</th>
                            <th className="px-6 py-4 text-left text-md font-bold text-slate-900">Date</th>
                            <th className="px-6 py-4 text-left text-md font-bold text-slate-900">Time</th>
                            <th className="px-6 py-4 text-left text-md font-bold text-slate-900">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingExams.map((exam, index) => (
                            <tr
                              key={exam.id}
                              className={`${
                                index !== upcomingExams.length - 1 ? 'border-b border-slate-200' : ''
                              } hover:bg-slate-50 transition-colors`}
                            >
                              <td className="px-6 py-4 text-left text-slate-900 font-semibold">{exam.name || exam.exam_name}</td>
                              <td className="px-6 py-4 text-left text-slate-700">{exam.subject || exam.subject_name}</td>
                              <td className="px-6 py-4 text-left">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                  {exam.type || "Standard"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-left text-slate-700">{formatDate(exam.date || exam.exam_date)}</td>
                              <td className="px-6 py-4 text-left text-slate-700">{exam.time || `${exam.start_time} - ${exam.end_time}`}</td>
                              <td className="px-6 py-4 text-left">
                                <button
                                  onClick={() => handleTabChange('results')}
                                  className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                                >
                                  View Results →
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-500 font-bold">No upcoming exams scheduled!</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== RESULTS TAB CONTENT ===== */}
            {activeTab === 'results' && (
              <div className="animate-in fade-in duration-300">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium">Total Subjects</span>
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{stats.totalSubjects}</p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium">Passed</span>
                    </div>
                    <p className="text-4xl font-bold text-emerald-900">{stats.passed}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium">Total Marks</span>
                    </div>
                    <p className="text-4xl font-bold text-purple-900">{stats.totalMarks}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-slate-700 font-medium">Percentage</span>
                    </div>
                    <p className="text-4xl font-bold text-amber-900">{stats.percentage}%</p>
                  </div>
                </div>

                {/* Results Table */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Exam Results</h2>
                      <p className="text-slate-600 text-sm mt-1">Your performance across all subjects</p>
                    </div>
                  </div>

                  {examResults.length > 0 ? (
                    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Subject</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Marks Obtained</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Marks</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Percentage</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Grade</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examResults.map((result, index) => {
                              // Ensure we support both camelCase and snake_case from your database
                              const obtained = Number(result.marksObtained || result.marks_obtained);
                              const total = Number(result.totalMarks || result.total_marks);
                              const percentage = result.percentage || ((obtained / total) * 100);

                              return (
                                <tr
                                  key={result.id}
                                  className={`${
                                    index !== examResults.length - 1 ? 'border-b border-slate-200' : ''
                                  } hover:bg-slate-50 transition-colors`}
                                >
                                  <td className="px-6 py-4 text-left font-semibold text-slate-900">{result.subject || result.subject_name}</td>
                                  <td className="px-6 py-4 text-left text-slate-700">{obtained}</td>
                                  <td className="px-6 py-4 text-left text-slate-700">{total}</td>
                                  <td className="px-6 py-4 text-left text-slate-700 font-semibold">{Number(percentage).toFixed(1)}%</td>
                                  <td className="px-6 py-4 text-left">
                                    <span
                                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold ${getGradeColor(
                                        result.grade
                                      )}`}
                                    >
                                      {result.grade || "-"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-left">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${result.status === 'Pass' || result.status === 'Passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                      <span className={`w-2 h-2 rounded-full ${result.status === 'Pass' || result.status === 'Passed' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                                      {result.status || (percentage >= 40 ? "Pass" : "Fail")}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                      <p className="text-slate-500 font-bold">No results published yet!</p>
                    </div>
                  )}
                </div>

                {/* Summary Section */}
                {examResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <p className="text-slate-600 font-medium mb-3">Total Marks Obtained</p>
                      <p className="text-5xl font-bold text-slate-900">{stats.totalMarks}</p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <p className="text-slate-600 font-medium mb-3">Overall Percentage</p>
                      <p className="text-5xl font-bold text-slate-900">{stats.percentage}%</p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                      <p className="text-slate-600 font-medium mb-3">Overall Result</p>
                      <span className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-bold ${stats.percentage >= 40 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        <span className={`w-3 h-3 rounded-full ${stats.percentage >= 40 ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                        {stats.percentage >= 40 ? "Pass" : "Fail"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}