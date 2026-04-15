import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { BookOpen, ChevronRight, Loader2 } from "lucide-react";

export const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get("http://localhost:5000/api/student/courses/enrolled", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleCourseClick = (course) => {
    // Keep this to help the 'Course View' page know which subject was picked
    localStorage.setItem("selected_course", JSON.stringify(course));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <Loader2 size={40} className="animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-xs">Loading Curriculum...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-10xl mx-auto pb-12 animate-in fade-in duration-700">
      
      {/* 1. HEADER */}
      <div className="mb-10 mt-2 text-left">
        <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">My Courses</h1>
        <p className="text-slate-400 font-medium mt-2">View all your enrolled subjects and track your progress.</p>
      </div>

      {/* 2. COURSE GRID */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Top Section: Icon & Title */}
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <BookOpen size={28} strokeWidth={2} />
                </div>
                <div className="text-left">
                  <Link 
                    to="/student/courses/view" 
                    onClick={() => handleCourseClick(course)}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <h3 className="text-xl font-bold text-slate-800 leading-tight">{course.title}</h3>
                  </Link>
                  <p className="text-slate-400 text-xs font-bold flex items-center gap-2 mt-2 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
                    {course.instructor}
                  </p>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                  <span className="text-sm font-black text-slate-800">{course.progress}%</span>
                </div>
                
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all duration-1000 group-hover:bg-blue-600" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-50 relative z-10">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{course.modules} Modules</span>
                
                <Link 
                  to="/student/courses/view" 
                  onClick={() => handleCourseClick(course)}
                  className="text-blue-600 text-sm font-black uppercase tracking-wide flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Enter Class <ChevronRight size={14} strokeWidth={3} />
                </Link>
              </div>

              {/* Invisible Overlay Link */}
              <Link 
                to="/student/courses/view" 
                onClick={() => handleCourseClick(course)}
                className="absolute inset-0 z-0" 
                aria-hidden="true" 
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
          <p className="text-slate-400 font-bold uppercase tracking-widest">No courses found for your program.</p>
        </div>
      )}
    </div>
  );
};