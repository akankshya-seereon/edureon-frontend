import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  BookOpen,
  ArrowRight,
  Loader2
} from "lucide-react";

export const CourseDetails = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        const storedCourse = JSON.parse(localStorage.getItem("selected_course"));
        const token = localStorage.getItem('token');
        
        if (!storedCourse?.id) return;

        const res = await axios.get(`http://localhost:5000/api/student/courses/${storedCourse.id}/details`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setCourseData(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFullDetails();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Syllabus...</p>
    </div>
  );

  return (
    <div className="w-full max-w-8xl text-left mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* 1. BACK NAVIGATION */}
      <div className="mb-6 mt-2">
        <Link 
          to="/student/courses" 
          className="inline-flex items-center gap-2 text-md font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft size={16} strokeWidth={3} /> Back to my courses
        </Link>
      </div>

      {/* 2. COURSE TITLE */}
      <h1 className="text-4xl font-black text-[#1e293b] tracking-tight mb-8">
        {courseData?.title}
      </h1>

      {/* 3. TABS */}
      <div className="flex gap-4 mb-8">
        {["overview", "modules"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-10 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border
              ${activeTab === tab 
                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200" 
                : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. TAB CONTENT */}
      {activeTab === "overview" ? (
        <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="mb-12">
            <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Course Description</h3>
            <p className="text-lg font-medium text-slate-600 leading-relaxed max-w-4xl">
              {courseData?.description || "No description provided for this subject."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10 border-t border-slate-50">
            <InfoBlock label="Instructor" icon={<User size={20}/>} value={courseData?.instructor} />
            <InfoBlock label="Academic Year" icon={<Calendar size={20}/>} value={courseData?.academic_year} />
            <InfoBlock label="Total Modules" icon={<BookOpen size={20}/>} value={`${courseData?.total_modules} Chapters`} />
          </div>

          <div className="mt-12 pt-10 border-t border-slate-50">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Current Progress</h3>
             <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                  style={{ width: `45%` }} // Logic for real progress can be added later
                ></div>
             </div>
             <p className="text-sm font-black text-slate-800 uppercase tracking-widest">45% Completed</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {courseData?.modules.map((module, index) => (
            <div 
              key={module.id} 
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:border-blue-200 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {index < 9 ? `0${index + 1}` : index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">{module.title}</h3>
                  <p className="text-slate-400 font-medium">{module.description}</p>
                </div>
              </div>

              <Link 
                to={`/student/courses/module/${module.id}`}
                className="p-4 rounded-2xl bg-slate-50 text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all"
              >
                <ArrowRight size={22} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sub-component for clean layout
const InfoBlock = ({ label, icon, value }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</span>
    <div className="flex items-center gap-3 font-bold text-slate-800 text-lg">
      <span className="text-blue-600">{icon}</span> {value || "N/A"}
    </div>
  </div>
);

export default CourseDetails;