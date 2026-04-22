import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronDown, Search, BookOpen, Layout, GraduationCap, Calendar, Clock 
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl"; 

export const ViewSyllabus = () => {
  const [dropdowns, setDropdowns] = useState({ courses: [], batches: [], specs: [] });
  const [filters, setFilters] = useState({ course: '', batch: '', specialization: '' });
  const [syllabusData, setSyllabusData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 Helper to format the "created_at" date from the DB
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 1. Fetch Dropdowns on Load
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/admin/syllabus/form-data`, { withCredentials: true });
        if (response.data.success) {
          setDropdowns({
            courses: response.data.data.courses || [],
            batches: response.data.data.batches || [],
            specs: response.data.data.specializations || []
          });
        }
      } catch (error) {
        console.error("Failed to load dropdowns:", error);
      }
    };
    fetchDropdowns();
  }, []);

  // 2. Handle Filter Changes
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // 3. Fetch the Saved Syllabus
  const fetchSyllabus = async () => {
    if (!filters.course || !filters.batch || !filters.specialization) {
      alert("Please select Course, Specialization, and Batch to search.");
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await axios.get(`${apiBaseUrl}/admin/syllabus`, { 
        params: {
          course: filters.course,
          batch: filters.batch,
          specialization: filters.specialization
        },
        withCredentials: true 
      });

      if (response.data.success) {
        setSyllabusData(response.data.data);
        if(response.data.data.length === 0) {
          alert("No syllabus records found for this selection.");
        }
      }
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      alert("Failed to load syllabus data. Check the server console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-left">
      <div className="max-w-[1500px] mx-auto space-y-6">
        
        {/* Header Section */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">View Syllabus</h1>
          <p className="text-slate-500 text-sm font-medium">Review published academic curriculum and marking schemes.</p>
        </div>

        {/* ── SEARCH FILTERS ── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <GraduationCap size={12} /> Course
            </label>
            <div className="relative">
              <select name="course" value={filters.course} onChange={handleFilterChange} className="w-full appearance-none bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">Select Course</option>
                {dropdowns.courses.map((c, i) => {
                  const val = c.name || c.course_name;
                  return <option key={i} value={val}>{val}</option>;
                })}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Layout size={12} /> Specialization
            </label>
            <div className="relative">
              <select name="specialization" value={filters.specialization} onChange={handleFilterChange} className="w-full appearance-none bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">Select Specialization</option>
                {dropdowns.specs.map((s, i) => {
                  const val = s.name || s.specialization_name;
                  return <option key={i} value={val}>{val}</option>;
                })}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <Calendar size={12} /> Batch
            </label>
            <div className="relative">
              <select name="batch" value={filters.batch} onChange={handleFilterChange} className="w-full appearance-none bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer">
                <option value="">Select Batch</option>
                {dropdowns.batches.map((b, i) => {
                  const val = b.name || b.batch_name;
                  return <option key={i} value={val}>{val}</option>;
                })}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button 
            onClick={fetchSyllabus}
            disabled={isLoading}
            className="w-full px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-lg transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <Search size={16} strokeWidth={3} /> {isLoading ? 'Searching...' : 'Find Syllabus'}
          </button>

        </div>

        {/* ── SYLLABUS DISPLAY TABLE ── */}
        {syllabusData.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Active Curriculum</span>
                <h2 className="text-base font-bold text-gray-800">
                  {filters.course} — {filters.specialization} ({filters.batch})
                </h2>
              </div>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm">
                    <Clock size={12} className="text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-500">Last Updated: {formatDate(syllabusData[0].created_at)}</span>
                 </div>
                 <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full uppercase">
                   {syllabusData[0].status}
                 </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[4%]">Sem</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[18%]">Subject Name</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[8%]">Code</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase tracking-wider w-[12%]">Faculty</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase text-center w-[7%]">Internal</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase text-center w-[7%]">University</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase text-center w-[8%]">Laboratory</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase text-center w-[8%]">Presentation</th>
                    <th className="px-4 py-4 text-[11px] font-black text-slate-400 uppercase text-center w-[10%] font-black">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {syllabusData.map((sub, index) => {
                    const rowTotal = (parseInt(sub.int_marks) || 0) + 
                                     (parseInt(sub.uni_marks) || 0) + 
                                     (parseInt(sub.lab_marks) || 0) + 
                                     (parseInt(sub.pres_marks) || 0);

                    return (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-sm font-black text-blue-600">S-{sub.semester}</td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-800">
                           <div className="flex flex-col">
                             {sub.subject_name}
                             {sub.is_elective === 1 && <span className="text-[10px] text-amber-600 font-bold italic mt-0.5">Elective Subject</span>}
                           </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-black text-slate-500 uppercase">
                          <span className="px-2 py-1 bg-slate-100 rounded border border-slate-200">{sub.subject_code}</span>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-slate-600 italic">
                          {sub.faculty_name || 'Not Assigned'}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-center text-slate-700">{sub.int_marks}</td>
                        <td className="px-4 py-4 text-sm font-bold text-center text-slate-700">{sub.uni_marks}</td>
                        <td className="px-4 py-4 text-sm font-bold text-center text-slate-700">{sub.lab_marks}</td>
                        <td className="px-4 py-4 text-sm font-bold text-center text-slate-700">{sub.pres_marks}</td>
                        <td className="px-4 py-4 text-sm font-black text-center text-blue-700 bg-blue-50/30">
                          {rowTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <BookOpen size={40} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Ready to View Curriculum</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
              Please select the course, specialization, and batch filters above to load the saved syllabus data.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default ViewSyllabus;