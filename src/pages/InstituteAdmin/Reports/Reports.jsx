import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart3, Download, FileText, ChevronDown, Users,
  GraduationCap, BookOpen, Building2, Calendar,
} from "lucide-react";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import * as XLSX from "xlsx";

const STORAGE_KEY = "reportsFilters";

// --- AUTH TOKEN HELPER ---
const getToken = () => {
  let token = localStorage.getItem('token');
  if (!token) {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    token = storedUser?.token || storedUser?.data?.token;
  }
  return token;
};

// ── Shared field components ────────────────────────────────────────────────────
const SelectField = ({ label, icon: Icon, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
      {Icon && <Icon size={11}/>}{label}
    </label>
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none appearance-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
    </div>
  </div>
);

const DateField = ({ label, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
      <Calendar size={11}/>{label}
    </label>
    <input type="date" value={value} onChange={onChange}
      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"/>
  </div>
);

// ── Static options ──
const DEPARTMENTS = ["All Departments", "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "English"];
const COURSES     = ["All Courses", "B.Sc CS", "M.Sc CS", "B.Sc Math", "B.Sc Physics", "B.Com", "B.Ed", "B.Tech CSE - Year 1", "B.Tech CSE - Year 2"];
const STUDENTS    = ["All Students", "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6"];
const FACULTY     = ["All Faculty", "Active Faculty", "Computer Science Dept.", "Mathematics Dept.", "Physics Dept."];

export const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]); // Stores data from backend
  
  const [filters, setFilters] = useState({
    selectedReport: 1,
    dateFrom: "",
    dateTo: "",
    attDept: "All Departments",
    attCourse: "All Courses",
    attStudent: "All Students",
    attFaculty: "All Faculty",
    feesDept: "All Departments",
    feesCourse: "All Courses",
    feesStudent: "All Students",
    course: "All Courses",
    className: "All Classes",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setFilters(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  const set = (field) => (e) => setFilters(p => ({ ...p, [field]: e.target.value }));

  const reports = [
    { id: 1, title: "Attendance Report",   description: "Student attendance summary by course and date.", icon: Users       },
    { id: 2, title: "Fees Collection",     description: "Fees collected within selected period.",         icon: FileText    },
    { id: 3, title: "Student Performance", description: "Academic performance overview.",                 icon: GraduationCap },
    { id: 4, title: "Faculty Report",      description: "Faculty workload and activity report.",          icon: BookOpen    },
  ];

  const selectedTitle = reports.find(r => r.id === filters.selectedReport)?.title;

  // 🚀 FETCH DATA FROM BACKEND
  const generateReport = async () => {
    setLoading(true);
    setReportData([]); // Clear previous data while loading

    try {
      const token = getToken();
      
      const params = new URLSearchParams({
        reportId: filters.selectedReport,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        course: filters.selectedReport === 1 ? filters.attCourse : filters.feesCourse,
        department: filters.selectedReport === 1 ? filters.attDept : filters.feesDept
      });

      const response = await axios.get(`http://localhost:5000/api/admin/reports/generate?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReportData(response.data.data);
        // Alert removed for better UX, the table appearing acts as the visual feedback!
      }
    } catch (err) {
      console.error("Report Generation Error:", err);
      alert("Failed to fetch report. Please check server connection.");
    } finally {
      setLoading(false);
    }
  };

  // 📄 EXPORT PDF (Using live DB data)
  const exportPDF = () => {
    if (reportData.length === 0) {
      alert("Please generate a report with data before exporting.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Institute Data Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Report: ${selectedTitle}`, 14, 30);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 40);

    const tableColumns = Object.keys(reportData[0]).map(key => ({
      header: key.replace(/_/g, ' ').toUpperCase(), 
      dataKey: key
    }));
    
    doc.autoTable({
      startY: 50,
      columns: tableColumns,
      body: reportData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] } 
    });

    doc.save(`${selectedTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
  };

  // 📊 EXPORT EXCEL (Using live DB data)
  const exportExcel = () => {
    if (reportData.length === 0) {
      alert("Please generate a report with data before exporting.");
      return;
    }

    const metadata = [
      { A: `Report: ${selectedTitle}`, B: `Generated: ${new Date().toLocaleString()}` },
      { A: `Date Range: ${filters.dateFrom || 'All time'} to ${filters.dateTo || 'Present'}` },
      {} 
    ];

    const ws = XLSX.utils.json_to_sheet(metadata, { skipHeader: true });
    XLSX.utils.sheet_add_json(ws, reportData, { origin: "A4" }); 

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, `${selectedTitle.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
  };

  // ── Render filters based on selected report ──────────────────────────────
  const renderFilters = () => {
    if (filters.selectedReport === 1) return (
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
          <Users size={11}/> Attendance Filters
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField label="Date From" value={filters.dateFrom} onChange={set("dateFrom")}/>
          <DateField label="Date To"   value={filters.dateTo}   onChange={set("dateTo")}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Department" icon={Building2}    value={filters.attDept}    onChange={set("attDept")}    options={DEPARTMENTS}/>
          <SelectField label="Course"     icon={BookOpen}     value={filters.attCourse}  onChange={set("attCourse")}  options={COURSES}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Students"   icon={GraduationCap} value={filters.attStudent} onChange={set("attStudent")} options={STUDENTS}/>
          <SelectField label="Faculty"    icon={Users}          value={filters.attFaculty} onChange={set("attFaculty")} options={FACULTY}/>
        </div>
      </div>
    );

    if (filters.selectedReport === 2) return (
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
          <FileText size={11}/> Fees Filters
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField label="Date From" value={filters.dateFrom} onChange={set("dateFrom")}/>
          <DateField label="Date To"   value={filters.dateTo}   onChange={set("dateTo")}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Department" icon={Building2}    value={filters.feesDept}    onChange={set("feesDept")}    options={DEPARTMENTS}/>
          <SelectField label="Course"     icon={BookOpen}     value={filters.feesCourse}  onChange={set("feesCourse")}  options={COURSES}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField label="Students"   icon={GraduationCap} value={filters.feesStudent} onChange={set("feesStudent")} options={STUDENTS}/>
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1.5">
          <BarChart3 size={11}/> Report Filters
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField label="Date From" value={filters.dateFrom} onChange={set("dateFrom")}/>
          <DateField label="Date To"   value={filters.dateTo}   onChange={set("dateTo")}/>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-8xl mx-auto pb-12">

      <div className="mb-8 mt-2">
        <h1 className="text-4xl font-black text-slate-800 mb-2">Reports</h1>
        <p className="text-slate-400 text-sm">Generate and export reports for students, faculty, and staff</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reports.map((report) => {
          const isSelected = filters.selectedReport === report.id;
          const Icon = report.icon;
          return (
            <div key={report.id}
              onClick={() => {
                setFilters(p => ({ ...p, selectedReport: report.id }));
                setReportData([]); // Clear previous table data when changing tabs
              }}
              className={`p-5 rounded-xl cursor-pointer border transition-all
                ${isSelected
                  ? "bg-blue-50 border-blue-600 shadow-md shadow-blue-100"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3
                ${isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                <Icon size={18}/>
              </div>
              <h3 className={`font-black text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
                {report.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{report.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <div className="bg-blue-600 px-6 py-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-white"/>
          <span className="text-white font-black text-sm">{selectedTitle} — Filters</span>
        </div>
        <div className="p-6">
          {renderFilters()}
        </div>
      </div>

      {/* 📊 DYNAMIC REPORT PREVIEW TABLE */}
      {reportData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8 animate-in fade-in duration-500">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="font-black text-slate-800 text-lg">Data Preview</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {selectedTitle} Results
              </p>
            </div>
            <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
              {reportData.length} Records Found
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="border-b border-slate-200 bg-slate-50/80 backdrop-blur-md">
                  {Object.keys(reportData[0]).map((key) => (
                    <th key={key} className="py-4 px-6 text-[11px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">
                      {key.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="py-4 px-6 text-sm font-bold text-slate-700 whitespace-nowrap">
                        {val === null || val === "" ? "—" : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔘 ACTION BUTTONS */}
      <div className="flex flex-wrap gap-3">
        <button onClick={generateReport} disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50">
          <BarChart3 size={15}/> {loading ? "Fetching..." : "Generate Report"}
        </button>
        <button onClick={exportPDF}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm shadow-sm transition-all active:scale-[0.98]">
          <Download size={15}/> Export PDF
        </button>
        <button onClick={exportExcel}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-black text-sm shadow-sm transition-all active:scale-[0.98]">
          <FileText size={15}/> Export Excel
        </button>
      </div>

    </div>
  );
};

export default Reports;