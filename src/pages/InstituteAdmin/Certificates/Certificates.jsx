import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, CheckCircle, Download, Trash2, Search, 
  Loader2, FileOutput, Users, Send
} from 'lucide-react';
import apiBaseUrl from "../../../config/baseurl"; 

// 🎯 HELPER: Safely grabs the token 
const getAuthConfig = () => {
  let token = localStorage.getItem("token");
  if (!token || token === "undefined") {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      token = userObj?.token || userObj?.data?.token;
    } catch (e) {}
  }
  return { headers: { Authorization: token ? `Bearer ${token}` : "" } };
};

// 🎯 HELPER: Derives the backend root URL for serving static files (PDFs)
const getStaticBaseUrl = () => {
  return apiBaseUrl.replace(/\/api\/?$/, ''); 
};

export default function Certificates() {
  const [activeTab, setActiveTab] = useState('generate'); 
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [filters, setFilters] = useState({ courseId: '', year: '', batch: '', semester: '1' });
  
  // Dynamic Data State
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]); 
  const [documents, setDocuments] = useState([]); 
  const [selectedDocs, setSelectedDocs] = useState([]); 

  const currentYear = new Date().getFullYear();
  const admissionYears = Array.from({ length: 10 }, (_, i) => currentYear - 4 + i);

  // ==========================================
  // 🚀 FIXED: USE THE RELIABLE FORM-DATA ENDPOINT
  // ==========================================
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const config = getAuthConfig();
        
        // 🚀 Pointing to our highly reliable Syllabus Form Data endpoint 
        // which returns exactly the courses and batches from your DB!
        const res = await axios.get(`${apiBaseUrl}/admin/syllabus/form-data`, config);

        if (res.data?.success) {
            setCourses(res.data.data.courses || []);
            setBatches(res.data.data.batches || []);
        }
      } catch (error) {
        console.error("Failed to fetch initial dropdown data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // ==========================================
  // TAB 1: FETCH REAL STUDENTS & GENERATE
  // ==========================================
  const fetchStudentsToGenerate = async () => {
    if (!filters.courseId || !filters.semester || (!filters.batch && !filters.year)) {
      return alert("Please select a Course, Semester, and at least a Year or Batch.");
    }
    
    setLoading(true);
    try {
      let queryUrl = `${apiBaseUrl}/admin/students?courseId=${filters.courseId}`;
      if (filters.batch) queryUrl += `&batch=${filters.batch}`;
      if (filters.year) queryUrl += `&year=${filters.year}`;

      const res = await axios.get(queryUrl, getAuthConfig());

      const fetchedStudents = res.data.students || res.data.data || [];

      const mappedStudents = fetchedStudents.map(s => ({
        id: s.id,
        name: s.name || s.full_name || `${s.first_name} ${s.last_name}`,
        rollNo: s.roll_no || s.enrollment_no || s.id,
        status: "Pending Generation"
      }));

      setStudents(mappedStudents);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      alert("Failed to fetch students from the database.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (student) => {
    setProcessing(true);
    try {
      const payload = {
        studentId: student.id,
        studentName: student.name,
        courseId: filters.courseId,
        courseName: courses.find(c => String(c.id) === String(filters.courseId))?.name || 'Selected Course',
        batch: filters.batch || filters.year, 
        semester: filters.semester,
        instituteName: "EduERP Excellence Academy", 
        marks: [
          { subject: "Sample Subject 1", obtained: 85, max: 100, grade: "A" },
          { subject: "Sample Subject 2", obtained: 92, max: 100, grade: "A+" }
        ]
      };

      await axios.post(`${apiBaseUrl}/admin/certificates/generate`, payload, getAuthConfig());
      alert(`✅ Draft Marksheet generated for ${student.name}`);
      
      setStudents(prev => prev.filter(s => s.id !== student.id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to generate marksheet.");
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // TAB 2: PUBLISH LOGIC
  // ==========================================
  const fetchDraftDocuments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiBaseUrl}/admin/certificates?status=Draft`, getAuthConfig());
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'publish') {
      fetchDraftDocuments();
      setSelectedDocs([]);
    }
  }, [activeTab]);

  const toggleDocSelection = (id) => {
    setSelectedDocs(prev => prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]);
  };

  const handlePublishSelected = async () => {
    if (selectedDocs.length === 0) return;
    setProcessing(true);
    try {
      await axios.put(`${apiBaseUrl}/admin/certificates/publish`, { documentIds: selectedDocs }, getAuthConfig());
      alert(`✅ Successfully published ${selectedDocs.length} documents!`);
      fetchDraftDocuments();
      setSelectedDocs([]);
    } catch (err) {
      alert("Failed to publish documents.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm("Are you sure you want to delete this draft?")) return;
    try {
      await axios.delete(`${apiBaseUrl}/admin/certificates/${id}`, getAuthConfig());
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert("Failed to delete draft.");
    }
  };

  return (
    <div className="p-6 md:p-8 w-full font-sans text-left min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Certificate Management</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
          Generate, Review, and Publish Student Marksheets
        </p>
      </div>

      {/* Custom Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('generate')}
          className={`pb-3 px-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'generate' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          1. Generate Drafts
        </button>
        <button 
          onClick={() => setActiveTab('publish')}
          className={`pb-3 px-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === 'publish' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          2. Review & Publish
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: GENERATE UI                         */}
      {/* ========================================== */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Filters Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Course</label>
              <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                value={filters.courseId} onChange={e => setFilters({...filters, courseId: e.target.value})}>
                <option value="">Select Course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name || c.course_name}</option>)}
              </select>
            </div>

            <div className="w-[120px]">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Year</label>
              <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})}>
                <option value="">Year...</option>
                {admissionYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Batch</label>
              <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                value={filters.batch} onChange={e => setFilters({...filters, batch: e.target.value})}>
                <option value="">Select Batch...</option>
                {batches.map(b => (
                  <option key={b.id || b.batch_name || b.name} value={b.batch_name || b.name}>
                    {b.batch_name || b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-[100px]">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block">Semester</label>
              <input type="number" min="1" max="8" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500"
                value={filters.semester} onChange={e => setFilters({...filters, semester: e.target.value})} />
            </div>
            
            <button onClick={fetchStudentsToGenerate} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              <Search size={16} /> Fetch
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-black text-slate-700 flex items-center gap-2"><Users size={18}/> Students Pending Generation</h3>
            </div>
            
            {loading ? (
              <div className="p-12 flex justify-center text-slate-400"><Loader2 className="animate-spin" size={32} /></div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-bold">Select filters and click Fetch to see students.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr><th className="p-4 pl-6">Roll No</th><th className="p-4">Student Name</th><th className="p-4">Status</th><th className="p-4 text-right pr-6">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map(student => (
                    <tr key={student.id} className="hover:bg-slate-50/50">
                      <td className="p-4 pl-6 font-bold text-slate-600">{student.rollNo}</td>
                      <td className="p-4 font-black text-slate-800">{student.name}</td>
                      <td className="p-4"><span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">{student.status}</span></td>
                      <td className="p-4 pr-6 text-right">
                        <button 
                          onClick={() => handleGenerate(student)}
                          disabled={processing}
                          className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          Generate PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: PUBLISH UI                          */}
      {/* ========================================== */}
      {activeTab === 'publish' && (
        <div className="space-y-6">
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-800">Draft Documents</h2>
              <p className="text-xs font-bold text-slate-500 mt-1">Review PDFs before sending them to student portals.</p>
            </div>
            <button 
              onClick={handlePublishSelected}
              disabled={selectedDocs.length === 0 || processing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-emerald-200"
            >
              {processing ? <Loader2 size={16} className="animate-spin"/> : <Send size={16} />}
              Publish Selected ({selectedDocs.length})
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center text-slate-400"><Loader2 className="animate-spin" size={32} /></div>
            ) : documents.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center text-slate-400">
                <FileOutput size={48} className="mb-4 text-slate-200" />
                <p className="font-bold text-lg text-slate-600">No Drafts Found</p>
                <p className="text-sm font-medium mt-1">Go to the Generate tab to create marksheets.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="p-4 pl-6 w-12">
                      <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        onChange={(e) => setSelectedDocs(e.target.checked ? documents.map(d => d.id) : [])}
                        checked={selectedDocs.length === documents.length && documents.length > 0}
                      />
                    </th>
                    <th className="p-4">Document Type</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Details</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map(doc => (
                    <tr key={doc.id} className={`hover:bg-slate-50/50 transition-colors ${selectedDocs.includes(doc.id) ? 'bg-emerald-50/30' : ''}`}>
                      <td className="p-4 pl-6">
                        <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={selectedDocs.includes(doc.id)}
                          onChange={() => toggleDocSelection(doc.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-blue-500" />
                          <span className="font-black text-slate-700">{doc.document_type}</span>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800">{doc.student_name || `Student ID: ${doc.student_id}`}</td>
                      <td className="p-4">
                        <p className="text-xs font-bold text-slate-600">{doc.course_name || `Course ID: ${doc.course_id}`}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">Batch: {doc.batch} • Sem: {doc.semester}</p>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={`${getStaticBaseUrl()}${doc.file_url}`} 
                            target="_blank" rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview PDF"
                          >
                            <Search size={16} />
                          </a>
                          <button 
                            onClick={() => handleDeleteDraft(doc.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 size={16} />
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
      )}

    </div>
  );
}