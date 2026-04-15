import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  PlayCircle, 
  Download,
  CheckCircle2,
  X
} from "lucide-react";

export const ModuleContent = () => {
  const [contentItems, setContentItems] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [viewedContent, setViewedContent] = useState([]);
  const [toast, setToast] = useState(null); // { message, type }

  const mockContentItems = [
    {
      id: 1,
      type: "video",
      title: "Introduction to Derivatives",
      subtitle: "Introduction to Derivatives",
      action: "Play",
      // Replace with your actual video URL
      url: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      id: 2,
      type: "pdf",
      title: "Derivatives rules PDF",
      subtitle: "PDF Document",
      action: "Download",
      // Replace with your actual PDF URL or file path
      url: null, // will generate a sample PDF blob if null
      filename: "Derivatives_Rules.pdf"
    }
  ];

  // Show a toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load module data from localStorage on mount
  useEffect(() => {
    const storedModule = localStorage.getItem("selected_module");
    if (storedModule) {
      try {
        setSelectedModule(JSON.parse(storedModule));
      } catch (error) {
        console.error("Error parsing stored module:", error);
      }
    }
    setContentItems(mockContentItems);
  }, []);

  // Load viewed content from localStorage
  useEffect(() => {
    const storedViewedContent = localStorage.getItem("viewed_content");
    if (storedViewedContent) {
      try {
        setViewedContent(JSON.parse(storedViewedContent));
      } catch (error) {
        console.error("Error parsing viewed content:", error);
      }
    }
  }, []);

  // Load attendance status from localStorage
  useEffect(() => {
    const storedAttendance = localStorage.getItem("attendance_marked");
    if (storedAttendance) {
      try {
        const attendanceData = JSON.parse(storedAttendance);
        const today = new Date().toDateString();
        setAttendanceMarked(attendanceData.date === today);
      } catch (error) {
        console.error("Error parsing attendance data:", error);
      }
    }
  }, []);

  // ✅ FIX: Handle attendance marking — no alert, saves to localStorage properly
  const handleMarkAttendance = () => {
    if (attendanceMarked) return;

    const attendanceData = {
      moduleId: selectedModule?.moduleId,
      date: new Date().toDateString(),
      timestamp: new Date().toISOString(),
      status: "present"
    };
    localStorage.setItem("attendance_marked", JSON.stringify(attendanceData));
    setAttendanceMarked(true);
    showToast("Attendance marked successfully!");
  };

  // ✅ FIX: Handle video play — opens video in new tab
  const handleVideoPlay = (item) => {
    const contentData = {
      itemId: item.id,
      type: "video",
      moduleId: selectedModule?.moduleId,
      timestamp: new Date().toISOString(),
      action: "played"
    };
    const updatedViewedContent = [...viewedContent, contentData];
    setViewedContent(updatedViewedContent);
    localStorage.setItem("viewed_content", JSON.stringify(updatedViewedContent));

    // Open video URL in new tab
    if (item.url) {
      window.open(item.url, "_blank");
    } else {
      showToast("Video URL not configured", "error");
    }
  };

  // ✅ FIX: Handle PDF download — creates real download
  const handlePdfDownload = (item) => {
    const contentData = {
      itemId: item.id,
      type: "pdf",
      moduleId: selectedModule?.moduleId,
      timestamp: new Date().toISOString(),
      action: "downloaded"
    };
    const updatedViewedContent = [...viewedContent, contentData];
    setViewedContent(updatedViewedContent);
    localStorage.setItem("viewed_content", JSON.stringify(updatedViewedContent));

    if (item.url) {
      // If a real URL is provided, download it directly
      const link = document.createElement("a");
      link.href = item.url;
      link.download = item.filename || "document.pdf";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate a sample downloadable PDF blob as fallback
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 18 Tf 100 700 Td (Derivatives Rules) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
trailer << /Size 6 /Root 1 0 R >>
startxref
%%EOF`;

      const blob = new Blob([pdfContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.filename || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    showToast(`${item.filename || "PDF"} downloaded!`);
  };

  // Get content view statistics
  const getContentStats = () => {
    const moduleLogs = viewedContent.filter(v => v.moduleId === selectedModule?.moduleId);
    const videoViews = moduleLogs.filter(v => v.action === "played").length;
    const downloads = moduleLogs.filter(v => v.action === "downloaded").length;
    return { videoViews, downloads };
  };

  const stats = getContentStats();

  return (
    <div className="w-full max-w-8xl mx-auto pb-12 relative">
      
      {/* ✅ Toast Notification */}
      {toast && (
        <div className={`
          fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl font-bold text-sm transition-all
          ${toast.type === "error" 
            ? "bg-red-500 text-white" 
            : "bg-slate-900 text-white"
          }
        `}>
          <CheckCircle2 size={18} />
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. BACK NAVIGATION */}
      <div className="mb-8 mt-4 text-left">
        <Link 
          to="/student/courses/view" 
          className="inline-flex items-center gap-2 text-md font-bold text-slate-800 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={2.5} /> Back to course
        </Link>
      </div>

      {/* 2. HEADER WITH ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-[#1e293b] tracking-tight mb-2">
            Calculus Fundamentals
          </h1>
          <p className="text-slate-400 font-medium text-lg">Introduction to derivatives and integrals</p>
          
          {/* View Statistics */}
          <div className="mt-3 flex gap-6">
            <span className="text-sm font-bold text-slate-500">
              Videos Viewed: <span className="text-slate-800">{stats.videoViews}</span>
            </span>
            <span className="text-sm font-bold text-slate-500">
              Resources Downloaded: <span className="text-slate-800">{stats.downloads}</span>
            </span>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          
          {/* ✅ FIX: Attendance button — fully functional */}
          <button 
            onClick={handleMarkAttendance}
            disabled={attendanceMarked}
            className={`
              px-6 py-3 rounded-lg font-bold text-md transition-all active:scale-95 flex items-center gap-2
              ${attendanceMarked 
                ? "bg-green-500 text-white shadow-lg shadow-green-500/30 cursor-not-allowed" 
                : "bg-[#2563eb] text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 cursor-pointer"
              }
            `}
          >
            {attendanceMarked 
              ? <><CheckCircle2 size={16} /> Attendance Marked</> 
              : "Mark Attendance"
            }
          </button>
          
          {/* ✅ FIX: Replaced grey placeholder with a useful "View Progress" button */}
          <Link
            to="/student/courses/view"
            className="h-[44px] px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg flex items-center transition-all"
          >
            View Progress
          </Link>
        </div>
      </div>

      {/* 3. CONTENT CARD CONTAINER */}
      <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-sm min-h-[500px]">
        
        <div className="space-y-6">
          {contentItems.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-6 border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-sm transition-all bg-white"
            >
              {/* Left Side: Text */}
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-md font-medium text-slate-400">
                  {item.subtitle}
                </p>
              </div>

              {/* ✅ FIX: Right Side — real action handlers */}
              <div>
                {item.type === "video" ? (
                  <button 
                    onClick={() => handleVideoPlay(item)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-md text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <PlayCircle size={18} /> Play
                  </button>
                ) : (
                  <button 
                    onClick={() => handlePdfDownload(item)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-md text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    <Download size={18} /> Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};