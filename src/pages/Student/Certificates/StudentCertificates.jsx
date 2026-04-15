import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, Eye, Loader2, FileOutput } from 'lucide-react';

export const StudentCertificates = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyDocuments = async () => {
      try {
        let token = localStorage.getItem('token') || JSON.parse(localStorage.getItem('user') || '{}')?.token;
        const res = await axios.get('http://localhost:5000/api/student/certificates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setDocuments(res.data.data || []);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyDocuments();
  }, []);

  return (
    <div className="p-6 md:p-8 w-full font-sans text-left min-h-screen bg-slate-50/50">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Award className="text-[#0F53D5]" size={32} />
          My Certificates & Marksheets
        </h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
          View and download your official academic documents
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#0F53D5]">
          <Loader2 className="animate-spin" size={40} />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center flex flex-col items-center justify-center text-slate-400">
          <FileOutput size={64} className="mb-4 text-slate-200" />
          <p className="font-black text-xl text-slate-700">No Documents Available Yet</p>
          <p className="text-sm font-bold mt-2">Your institute has not published any marksheets or certificates for you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow group relative">
              
              {/* Document Banner/Icon */}
              <div className="h-24 bg-gradient-to-br from-blue-50 to-[#0F53D5]/10 flex items-center justify-center border-b border-slate-100">
                <Award size={40} className="text-[#0F53D5] opacity-80 group-hover:scale-110 transition-transform" />
              </div>

              {/* Document Details */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                    {doc.document_type}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Sem {doc.semester}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">
                  Semester {doc.semester} {doc.document_type}
                </h3>
                <p className="text-xs font-bold text-slate-500 mb-6">
                  {doc.course_name} • Batch {doc.batch}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <a 
                    href={`http://localhost:5000${doc.file_url}`} 
                    target="_blank" rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    <Eye size={16} /> View
                  </a>
                  <a 
                    href={`http://localhost:5000${doc.file_url}`} 
                    download={`Marksheet_Semester_${doc.semester}.pdf`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#0F53D5] hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md shadow-blue-200"
                  >
                    <Download size={16} /> Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}