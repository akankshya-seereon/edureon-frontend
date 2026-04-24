// import React, { useEffect, useState } from "react";
// import { createPortal } from "react-dom";
// import {
//   Search, Eye, Check, X, Plus, Filter, Trash2, Edit, Download,
//   GraduationCap, Calendar, Mail, User, Phone, MapPin,
//   AlertTriangle, School, Building2, FileText, Clock
// } from "lucide-react";

// // 🌟 IMPORT API TO CONNECT TO BACKEND
// import api from "../../../services/api"; 

// export const StudentList = () => {
//   const [activeTab, setActiveTab] = useState("all");
//   const [searchQuery, setSearchQuery] = useState("");
  
//   const [students, setStudents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
  
//   // --- MODAL STATES ---
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [editingStudent, setEditingStudent] = useState(null);
//   const [deleteConfirm, setDeleteConfirm] = useState(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//   // --- 🌟 FETCH DATA FROM BACKEND ---
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const response = await api.get('/admin/students');
//         if (response.data.success) {
//           setStudents(response.data.students);
//         }
//       } catch (error) {
//         console.error("Failed to fetch students from DB:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchStudents();
//   }, []);

//   // --- 🌟 SAVE DATA TO BACKEND ---
//   const handleSaveStudent = async (newStudentData) => {
//     try {
//       if (editingStudent) {
//         // Update existing (Requires a PUT route on your backend)
//         // await api.put(`/admin/students/${editingStudent.id}`, newStudentData);
//         setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...newStudentData } : s));
//         setEditingStudent(null);
//         alert("Student profile updated!");
//       } else {
//         const response = await api.post('/admin/students', newStudentData);
        
//         if (response.data.success) {
//           const prefix = newStudentData.type === "School" ? "SCH" : "STU";
//           const newStudent = {
//             id: response.data.studentCode || `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
//             status: "Active", 
//             documents: { aadhar: null, pan: null, tenth: null, twelfth: null, graduation: null, masters: null },
//             address: {},
//             ...newStudentData
//           };
//           setStudents([...students, newStudent]);
//           alert("Student enrolled successfully! They can now log in.");
//         }
//       }
//       setIsAddModalOpen(false);
//     } catch (error) {
//       console.error("Failed to save student:", error);
//       alert(error.response?.data?.message || "Error saving student to database.");
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       // NOTE: Uncomment when you build the DELETE route
//       // await api.delete(`/admin/students/${id}`);
//       setStudents(students.filter(s => s.id !== id));
//       setDeleteConfirm(null);
//     } catch (error) {
//       console.error("Failed to delete student:", error);
//     }
//   };

//   const filteredStudents = students.filter(item => {
//     if (!item || !item.status || !item.name) return false;
    
//     const matchesStatus = activeTab === "all" || item.status.toLowerCase() === activeTab;
//     const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
//       (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));
//     return matchesStatus && matchesSearch;
//   });

//   return (
//     <div className="w-full font-sans text-left relative">

//       {/* HEADER */}
//       <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div>
//           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Management</h1>
//           <p className="text-md font-bold text-slate-500 uppercase tracking-widest mt-2">Manage all student enrollments and records</p>
//         </div>

//         <button
//           onClick={() => {
//             setEditingStudent(null);
//             setIsAddModalOpen(true);
//           }}
//           className="bg-blue-600 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-md uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-600 transition-all"
//         >
//           <Plus size={18} /> Add Student
//         </button>
//       </div>

//       {/* TABS & FILTERS */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
//         <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">
//           {["all", "pending", "active", "rejected"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-6 py-2 rounded-lg text-md font-bold uppercase tracking-wide transition-all ${
//                 activeTab === tab
//                   ? "bg-blue-600 text-white shadow-md"
//                   : "text-blue-600 hover:bg-slate-50"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         <div className="relative w-full md:w-80">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search by name, ID, email..."
//             className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-md font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
//           />
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200">
//                 <th className="py-5 pl-6 pr-4 text-[13px] font-black uppercase text-blue-600 tracking-widest">Student</th>
//                 <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-400 tracking-widest">Type</th>
//                 <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-400 tracking-widest">Program</th>
//                 <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-400 tracking-widest">Email</th>
//                 <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-400 tracking-widest">Status</th>
//                 <th className="py-5 pr-6 text-[13px] font-black uppercase text-blue-400 tracking-widest text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {isLoading ? (
//                 <tr>
//                   <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
//                     Loading records from database...
//                   </td>
//                 </tr>
//               ) : filteredStudents.length > 0 ? (
//                 filteredStudents.map((item) => (
//                   <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
//                     <td className="py-4 pl-6 pr-4">
//                       <div className="flex items-center gap-3">
//                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-md shrink-0 border ${
//                           item.type === 'School' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
//                         }`}>
//                           {item.name ? item.name[0] : 'S'}
//                         </div>
//                         <div>
//                           <h4 className="text-md font-bold text-slate-700">{item.name}</h4>
//                           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{item.rollNo || item.id}</span>
//                         </div>
//                       </div>
//                     </td>

//                     <td className="py-4 px-4">
//                       <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border inline-flex items-center gap-1 ${
//                         item.type === 'School' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'
//                       }`}>
//                         {item.type === 'School' ? <School size={11} /> : <Building2 size={11} />}
//                         {item.type}
//                       </span>
//                     </td>

//                     <td className="py-4 px-4">
//                       <div className="flex flex-col">
//                         <span className="text-md font-bold text-slate-700">
//                           {item.type === 'School' ? item.standard || '-' : item.course || '-'}
//                         </span>
//                         <span className="text-[12px] text-slate-500">Sec {item.section || '-'}</span>
//                       </div>
//                     </td>

//                     <td className="py-4 px-4">
//                       <a href={`mailto:${item.email}`} className="text-blue-600 text-md font-medium hover:underline">
//                         {item.email}
//                       </a>
//                     </td>

//                     <td className="py-4 px-4">
//                       <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
//                         item.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
//                         item.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
//                         'bg-red-50 text-red-700 border-red-100'
//                       }`}>
//                         <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
//                           item.status === 'Pending' ? 'bg-yellow-500' :
//                           item.status === 'Active' ? 'bg-emerald-500' :
//                           'bg-red-500'
//                         }`}></span>
//                         {item.status}
//                       </span>
//                     </td>

//                     <td className="py-4 pr-6">
//                       <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
//                         <button
//                           onClick={() => setSelectedStudent(item)}
//                           className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//                           title="View Details"
//                         >
//                           <Eye size={18} />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setEditingStudent(item);
//                             setIsAddModalOpen(true);
//                           }}
//                           className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
//                           title="Edit"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => setDeleteConfirm(item)}
//                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
//                           title="Delete"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="py-12 text-center">
//                     <div className="flex flex-col items-center justify-center text-slate-400">
//                       <Filter size={48} className="text-slate-200 mb-4" />
//                       <p className="text-md font-bold">No students found</p>
//                       <p className="text-md mt-1 font-medium">Try adjusting your search filters or add a new student.</p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* MODALS */}
//       {isAddModalOpen && (
//         <EnhancedStudentForm
//           student={editingStudent}
//           onClose={() => {
//             setIsAddModalOpen(false);
//             setEditingStudent(null);
//           }}
//           onSave={handleSaveStudent}
//         />
//       )}

//       {selectedStudent && (
//         <StudentDetailsModal
//           student={selectedStudent}
//           onClose={() => setSelectedStudent(null)}
//           onEdit={() => {
//             setEditingStudent(selectedStudent);
//             setSelectedStudent(null);
//             setIsAddModalOpen(true);
//           }}
//         />
//       )}

//       {deleteConfirm && (
//         <DeleteConfirmModal
//           student={deleteConfirm}
//           onClose={() => setDeleteConfirm(null)}
//           onConfirm={() => handleDelete(deleteConfirm.id)}
//         />
//       )}
//     </div>
//   );
// };

// // ============================================================================
// // ENHANCED STUDENT FORM
// // ============================================================================
// const EnhancedStudentForm = ({ student, onClose, onSave }) => {
//   const [form, setForm] = useState(student || {
//     type: "University",
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "", 
//     phone: "",
//     dob: "",
//     gender: "",
//     aadhar: "",
//     pan: "",
//     course: "",
//     standard: "",
//     section: "",
//     rollNo: "",
//     year: "2025-26", // 🚀 FIXED: Defaulted to current academic year
//     documents: {
//       aadhar: null, pan: null, tenth: null, twelfth: null, graduation: null, masters: null
//     },
//     address: {
//       street: "", city: "", state: "", pincode: "", country: "India"
//     }
//   });

//   const [activeTab, setActiveTab] = useState("personal");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({
//       ...prev,
//       address: { ...prev.address, [name]: value }
//     }));
//   };

//   const handleDocumentUpload = (e, docType) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
//     if (!validTypes.includes(file.type)) {
//       alert("Only PDF and images allowed");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert("File size must be less than 5MB");
//       return;
//     }

//     setForm(prev => ({
//       ...prev,
//       documents: {
//         ...prev.documents,
//         [docType]: {
//           name: file.name,
//           size: file.size,
//           type: file.type,
//           uploaded: new Date().toLocaleDateString()
//         }
//       }
//     }));
//   };

//   const handleTypeChange = (type) => {
//     setForm(prev => ({
//       ...prev,
//       type,
//       course: "",
//       standard: ""
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.firstName || !form.email) {
//       alert("Please fill required fields (First Name, Email)");
//       return;
//     }
    
//     if (!student && !form.password) {
//       alert("Please set an Account Password for the new student.");
//       return;
//     }

//     if (form.type === "University" && !form.course) {
//       alert("Please select a course");
//       return;
//     }
//     if (form.type === "School" && !form.standard) {
//       alert("Please select a class");
//       return;
//     }

//     onSave({
//       name: `${form.firstName} ${form.lastName}`.trim(),
//       ...form
//     });
//   };

//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">

//         {/* HEADER */}
//         <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-slate-50">
//           <div>
//             <h3 className="font-black text-slate-800 text-lg">
//               {student ? 'Edit Student' : 'Enroll New Student'}
//             </h3>
//             <p className="text-md font-bold text-slate-500 uppercase tracking-widest mt-1">Complete all required information</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-all">
//             <X size={22} />
//           </button>
//         </div>

//         {/* TAB NAVIGATION */}
//         <div className="bg-slate-50 border-b border-slate-200 px-8 py-4 flex gap-2 overflow-x-auto sticky top-0">
//           {[
//             { id: "personal", label: "Personal", icon: "👤" },
//             { id: "academic", label: "Academic", icon: "🎓" },
//             { id: "address", label: "Address", icon: "📍" },
//             { id: "documents", label: "Documents", icon: "📄" }
//           ].map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${
//                 activeTab === tab.id
//                   ? "bg-white text-blue-600 shadow-sm"
//                   : "text-slate-600 hover:text-slate-800"
//               }`}
//             >
//               {tab.icon} {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* SCROLLABLE CONTENT */}
//         <div className="overflow-y-auto flex-1 p-8">
//           <form onSubmit={handleSubmit} className="space-y-6">

//             {/* PERSONAL TAB */}
//             {activeTab === "personal" && (
//               <div className="space-y-6">
//                 <div className="border-l-4 border-blue-500 pl-6">
//                   <h3 className="text-lg font-bold text-slate-900 mb-5">Personal Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">First Name *</label>
//                       <input
//                         type="text"
//                         name="firstName"
//                         value={form.firstName}
//                         onChange={handleChange}
//                         placeholder="John"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Last Name *</label>
//                       <input
//                         type="text"
//                         name="lastName"
//                         value={form.lastName}
//                         onChange={handleChange}
//                         placeholder="Doe"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Email *</label>
//                       <input
//                         type="email"
//                         name="email"
//                         value={form.email}
//                         onChange={handleChange}
//                         placeholder="john@example.com"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="text-xs font-bold text-blue-600 uppercase mb-2 block">
//                         Account Password {student ? "" : "*"}
//                       </label>
//                       <input
//                         type="password"
//                         name="password"
//                         value={form.password || ""}
//                         onChange={handleChange}
//                         placeholder={student ? "Leave blank to keep current" : "Set default password"}
//                         className="w-full px-4 py-2.5 border border-blue-300 bg-blue-50/30 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                         required={!student}
//                       />
//                       <p className="text-[10px] text-blue-500 font-bold mt-1">
//                         {student ? "Type here to reset password." : "Student uses this to log in."}
//                       </p>
//                     </div>

//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Phone</label>
//                       <input
//                         type="tel"
//                         name="phone"
//                         value={form.phone}
//                         onChange={handleChange}
//                         placeholder="+91 98765 43210"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Date of Birth</label>
//                       <input
//                         type="date"
//                         name="dob"
//                         value={form.dob}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Gender</label>
//                       <select
//                         name="gender"
//                         value={form.gender}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="">Select Gender</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="border-l-4 border-purple-500 pl-6 mt-6">
//                   <h3 className="text-lg font-bold text-slate-900 mb-5">Identity Details</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Aadhar Number</label>
//                       <input
//                         type="text"
//                         name="aadhar"
//                         value={form.aadhar}
//                         onChange={handleChange}
//                         placeholder="XXXX XXXX XXXX"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">PAN Number</label>
//                       <input
//                         type="text"
//                         name="pan"
//                         value={form.pan}
//                         onChange={handleChange}
//                         placeholder="ABCDE1234F"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ACADEMIC TAB */}
//             {activeTab === "academic" && (
//               <div className="border-l-4 border-green-500 pl-6">
//                 <h3 className="text-lg font-bold text-slate-900 mb-5">Academic Information</h3>

//                 <div className="mb-6 flex gap-3">
//                   <button
//                     type="button"
//                     onClick={() => handleTypeChange("School")}
//                     className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
//                       form.type === "School"
//                         ? "bg-orange-100 text-orange-700 border-2 border-orange-300"
//                         : "bg-slate-100 text-slate-600 border-2 border-slate-200"
//                     }`}
//                   >
//                     🏫 School
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleTypeChange("University")}
//                     className={`px-6 py-2 rounded-lg font-bold text-sm transition ${
//                       form.type === "University"
//                         ? "bg-blue-100 text-blue-600 border-2 border-blue-300"
//                         : "bg-slate-100 text-slate-600 border-2 border-slate-200"
//                     }`}
//                   >
//                     🎓 University
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                   {form.type === "University" ? (
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Course *</label>
//                       <select
//                         name="course"
//                         value={form.course}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="">Select Course</option>
//                         <option>B.Tech CS</option>
//                         <option>B.Tech IT</option>
//                         <option>MBA</option>
//                         <option>BBA</option>
//                         <option>B.Sc</option>
//                         <option>M.Tech</option>
//                         <option>M.Sc</option>
//                       </select>
//                     </div>
//                   ) : (
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Class *</label>
//                       <select
//                         name="standard"
//                         value={form.standard}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="">Select Class</option>
//                         {[...Array(12)].map((_, i) => (
//                           <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
//                         ))}
//                       </select>
//                     </div>
//                   )}

//                   <div>
//                     <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Section</label>
//                     <select
//                       name="section"
//                       value={form.section}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Select Section</option>
//                       <option value="A">A</option>
//                       <option value="B">B</option>
//                       <option value="C">C</option>
//                       <option value="D">D</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Roll Number</label>
//                     <input
//                       type="text"
//                       name="rollNo"
//                       value={form.rollNo}
//                       onChange={handleChange}
//                       placeholder="001"
//                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   {/* 🚀 FIXED: Academic Year is now editable and connected to form.year */}
//                   <div>
//                     <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Academic Year</label>
//                     <input
//                       type="text"
//                       name="year"
//                       value={form.year}
//                       onChange={handleChange}
//                       placeholder="e.g. 2025-26"
//                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   <div>
//                     <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Status</label>
//                     <select
//                       name="status"
//                       value={form.status}
//                       onChange={handleChange}
//                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="Pending">Pending</option>
//                       <option value="Active">Active</option>
//                       <option value="Rejected">Rejected</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ADDRESS TAB */}
//             {activeTab === "address" && (
//               <div className="border-l-4 border-orange-500 pl-6">
//                 <h3 className="text-lg font-bold text-slate-900 mb-5">Address Information</h3>
//                 <div className="space-y-5">
//                   <div>
//                     <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Street Address</label>
//                     <input
//                       type="text"
//                       name="street"
//                       value={form.address.street}
//                       onChange={handleAddressChange}
//                       placeholder="123 Main Street"
//                       className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">City</label>
//                       <input
//                         type="text"
//                         name="city"
//                         value={form.address.city}
//                         onChange={handleAddressChange}
//                         placeholder="New Delhi"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">State</label>
//                       <input
//                         type="text"
//                         name="state"
//                         value={form.address.state}
//                         onChange={handleAddressChange}
//                         placeholder="Delhi"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Pincode</label>
//                       <input
//                         type="text"
//                         name="pincode"
//                         value={form.address.pincode}
//                         onChange={handleAddressChange}
//                         placeholder="110001"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>

//                     <div>
//                       <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Country</label>
//                       <input
//                         type="text"
//                         name="country"
//                         value={form.address.country}
//                         onChange={handleAddressChange}
//                         placeholder="India"
//                         className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* DOCUMENTS TAB */}
//             {activeTab === "documents" && (
//               <div className="border-l-4 border-red-500 pl-6">
//                 <h3 className="text-lg font-bold text-slate-900 mb-5">Educational Documents</h3>

//                 <div className="space-y-6">
//                   {[
//                     { key: 'aadhar', label: 'Aadhar Card', icon: '🪪' },
//                     { key: 'pan', label: 'PAN Card', icon: '💳' },
//                     { key: 'tenth', label: '10th Standard Certificate', icon: '📚' },
//                     { key: 'twelfth', label: '12th Standard Certificate', icon: '📚' },
//                     { key: 'graduation', label: 'Graduation Degree', icon: '🎓' },
//                     { key: 'masters', label: "Master's Degree", icon: '👨‍🎓' }
//                   ].map(doc => (
//                     <DocumentUploadField
//                       key={doc.key}
//                       label={doc.label}
//                       icon={doc.icon}
//                       docType={doc.key}
//                       uploaded={form.documents[doc.key]}
//                       onUpload={(e) => handleDocumentUpload(e, doc.key)}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//           </form>
//         </div>

//         {/* FOOTER */}
//         <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex gap-3">
//           <button
//             type="button"
//             onClick={onClose}
//             className="flex-1 py-3 border-2 border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
//           >
//             <FileText size={18} /> {student ? 'Update Student' : 'Enroll Student'}
//           </button>
//         </div>

//       </div>
//     </div>,
//     document.body
//   );
// };

// // ============================================================================
// // DOCUMENT UPLOAD FIELD COMPONENT
// // ============================================================================
// const DocumentUploadField = ({ label, icon, docType, uploaded, onUpload }) => {
//   return (
//     <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
//       <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 block">
//         <span className="text-lg">{icon}</span> {label}
//       </label>

//       <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
//         uploaded
//           ? 'border-emerald-300 bg-emerald-50'
//           : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
//       }`}>
//         <input
//           type="file"
//           accept=".pdf,.jpg,.jpeg,.png"
//           onChange={onUpload}
//           className="hidden"
//           id={`doc-${docType}`}
//         />
//         <label htmlFor={`doc-${docType}`} className="block cursor-pointer">
//           <div className="flex flex-col items-center gap-2">
//             <div className={`p-3 rounded-full ${
//               uploaded
//                 ? 'bg-emerald-100 text-emerald-600'
//                 : 'bg-blue-100 text-blue-600'
//             }`}>
//               {uploaded ? <Check size={24} /> : <Download size={24} />}
//             </div>
//             {uploaded ? (
//               <div>
//                 <p className="text-sm font-bold text-slate-800">✓ {uploaded.name}</p>
//                 <p className="text-xs text-slate-500">Uploaded on {uploaded.uploaded}</p>
//               </div>
//             ) : (
//               <div>
//                 <p className="text-sm font-bold text-slate-700">Click to upload</p>
//                 <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
//               </div>
//             )}
//           </div>
//         </label>
//       </div>
//     </div>
//   );
// };

// // ============================================================================
// // STUDENT DETAILS MODAL - Shows All Information
// // ============================================================================
// const StudentDetailsModal = ({ student, onClose, onEdit }) => {
//   return createPortal(
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">

//         {/* HEADER */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-600 px-8 py-6 flex justify-between items-center sticky top-0">
//           <div>
//             <h2 className="text-2xl font-black text-white">Student Profile</h2>
//             <p className="text-blue-100 text-sm mt-1">Complete information</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full text-white transition">
//             <X size={24} />
//           </button>
//         </div>

//         {/* CONTENT */}
//         <div className="p-8 space-y-8">

//           {/* PROFILE HEADER */}
//           <div className="flex items-center gap-6">
//             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-600 flex items-center justify-center text-3xl font-black text-blue-600 border-4 border-white shadow-lg">
//               {student.name ? student.name[0] : 'S'}
//             </div>
//             <div>
//               <h3 className="text-2xl font-black text-slate-900">{student.name}</h3>
//               <p className="text-slate-600 text-lg mt-1">{student.id}</p>
//               <div className="flex gap-2 mt-3">
//                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                   student.type === 'School' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-600'
//                 }`}>
//                   {student.type === 'School' ? '🏫 School' : '🎓 University'}
//                 </span>
//                 <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                   student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
//                   student.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
//                   'bg-red-100 text-red-700'
//                 }`}>
//                   {student.status}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <hr className="border-slate-200" />

//           {/* PERSONAL INFO */}
//           <div>
//             <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//               <User size={20} className="text-blue-600" /> Personal Information
//             </h4>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.email}</p>
//               </div>
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Phone</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.phone || '-'}</p>
//               </div>
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Date of Birth</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.dob || '-'}</p>
//               </div>
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Gender</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.gender || '-'}</p>
//               </div>
//             </div>
//           </div>

//           {/* ACADEMIC INFO */}
//           <div>
//             <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//               <GraduationCap size={20} className="text-green-600" /> Academic Information
//             </h4>
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Program</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">
//                   {student.type === 'School' ? student.standard : student.course}
//                 </p>
//               </div>
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Section</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.section}</p>
//               </div>
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Roll Number</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.rollNo || '-'}</p>
//               </div>
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <p className="text-xs font-bold text-slate-500 uppercase">Academic Year</p>
//                 <p className="text-md font-bold text-slate-800 mt-1">{student.year}</p>
//               </div>
//             </div>
//           </div>

//           {/* ADDRESS */}
//           {student.address && (
//             <div>
//               <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//                 <MapPin size={20} className="text-red-600" /> Address
//               </h4>
//               <div className="bg-slate-50 p-4 rounded-lg space-y-2">
//                 <p className="text-md font-bold text-slate-800">{student.address.street}</p>
//                 <p className="text-md text-slate-700">
//                   {student.address.city}, {student.address.state} {student.address.pincode}
//                 </p>
//                 <p className="text-md text-slate-700">{student.address.country}</p>
//               </div>
//             </div>
//           )}

//           {/* DOCUMENTS */}
//           {student.documents && (
//             <div>
//               <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
//                 <FileText size={20} className="text-purple-600" /> Documents
//               </h4>
//               <div className="grid grid-cols-2 gap-3">
//                 {Object.entries(student.documents).map(([key, value]) => (
//                   <div key={key} className={`p-3 rounded-lg border-2 ${
//                     value ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
//                   }`}>
//                     <p className="text-xs font-bold text-slate-600 uppercase">
//                       {key.replace(/([A-Z])/g, ' $1').trim()}
//                     </p>
//                     {value ? (
//                       <p className="text-sm font-bold text-emerald-700 mt-1">✓ Uploaded</p>
//                     ) : (
//                       <p className="text-sm font-bold text-slate-500 mt-1">Not Uploaded</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* FOOTER */}
//         <div className="border-t border-slate-200 bg-slate-50 px-8 py-6 flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-3 border-2 border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-100 transition"
//           >
//             Close
//           </button>
//           <button
//             onClick={onEdit}
//             className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
//           >
//             <Edit size={18} /> Edit Student
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };

// // ============================================================================
// // DELETE CONFIRMATION MODAL
// // ============================================================================
// const DeleteConfirmModal = ({ student, onClose, onConfirm }) => {
//   return createPortal(
//     <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//       <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border border-slate-100">
//         <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
//           <AlertTriangle size={32} className="text-red-600" />
//         </div>
//         <h3 className="text-xl font-black text-slate-900 mb-2">Delete Student?</h3>
//         <p className="text-slate-600 mb-6">
//           Are you sure you want to permanently delete <strong>{student.name}</strong>? This action cannot be undone.
//         </p>
//         <div className="flex gap-3">
//           <button
//             onClick={onClose}
//             className="flex-1 py-3 border-2 border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition"
//           >
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };

// export default StudentList;


















import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Search, Eye, Check, X, Plus, Filter, Trash2, Edit, Download,
  GraduationCap, User, Phone, MapPin,
  AlertTriangle, School, Building2, FileText, ChevronRight, ChevronLeft
} from "lucide-react";

import api from "../../../services/api";

// ============================================================================
// STUDENT LIST
// ============================================================================
export const StudentList = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/admin/students");
        if (response.data.success) {
          setStudents(response.data.students);
        }
      } catch (error) {
        console.error("Failed to fetch students from DB:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSaveStudent = async (newStudentData) => {
    try {
      if (editingStudent) {
        // await api.put(`/admin/students/${editingStudent.id}`, newStudentData);
        setStudents(students.map((s) =>
          s.id === editingStudent.id ? { ...s, ...newStudentData } : s
        ));
        setEditingStudent(null);
        alert("Student profile updated!");
      } else {
        const response = await api.post("/admin/students", newStudentData);
        if (response.data.success) {
          const prefix = newStudentData.type === "School" ? "SCH" : "STU";
          const newStudent = {
            id: response.data.studentCode || `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`,
            status: "Active",
            documents: { aadhar: null, marksheet: null, tc: null },
            address: {},
            ...newStudentData,
          };
          setStudents([...students, newStudent]);
          alert("Student enrolled successfully! They can now log in.");
        }
      }
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to save student:", error);
      alert(error.response?.data?.message || "Error saving student to database.");
    }
  };

  const handleDelete = async (id) => {
    try {
      // await api.delete(`/admin/students/${id}`);
      setStudents(students.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  const filteredStudents = students.filter((item) => {
    if (!item || !item.status || !item.name) return false;
    const matchesStatus = activeTab === "all" || item.status.toLowerCase() === activeTab;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.id && item.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="w-full font-sans text-left relative">

      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Management</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">
            Manage all student enrollments and records
          </p>
        </div>
        <button
          onClick={() => { setEditingStudent(null); setIsAddModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* TABS & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-end">
        <div className="bg-white p-1 rounded-xl border border-slate-200 inline-flex shadow-sm">
          {["all", "pending", "active", "rejected"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-blue-600 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, email..."
            className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-5 pl-6 pr-4 text-[13px] font-black uppercase text-blue-500 tracking-widest">Student</th>
                <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-500 tracking-widest">Type</th>
                <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-500 tracking-widest">Program</th>
                <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-500 tracking-widest">Email</th>
                <th className="py-5 px-4 text-[13px] font-black uppercase text-blue-500 tracking-widest">Status</th>
                <th className="py-5 pr-6 text-[13px] font-black uppercase text-blue-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500 font-bold">
                    Loading records from database...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                          item.type === "School"
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>
                          {item.name ? item.name[0].toUpperCase() : "S"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-700">{item.name}</h4>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {item.rollNo || item.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border inline-flex items-center gap-1 ${
                        item.type === "School"
                          ? "bg-orange-50 text-orange-700 border-orange-100"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {item.type === "School" ? <School size={11} /> : <Building2 size={11} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">
                          {item.type === "School" ? item.standard || "-" : item.course || "-"}
                        </span>
                        <span className="text-[12px] text-slate-500">Sec {item.section || "-"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <a href={`mailto:${item.email}`} className="text-blue-600 text-sm font-medium hover:underline">
                        {item.email}
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        item.status === "Pending" ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                        item.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          item.status === "Pending" ? "bg-yellow-500" :
                          item.status === "Active" ? "bg-emerald-500" :
                          "bg-red-500"
                        }`}></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedStudent(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => { setEditingStudent(item); setIsAddModalOpen(true); }}
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(item)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Filter size={48} className="text-slate-200 mb-4" />
                      <p className="text-sm font-bold">No students found</p>
                      <p className="text-sm mt-1 font-medium">Try adjusting your search filters or add a new student.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      {isAddModalOpen && (
        <EnhancedStudentForm
          student={editingStudent}
          onClose={() => { setIsAddModalOpen(false); setEditingStudent(null); }}
          onSave={handleSaveStudent}
        />
      )}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onEdit={() => {
            setEditingStudent(selectedStudent);
            setSelectedStudent(null);
            setIsAddModalOpen(true);
          }}
        />
      )}
      {deleteConfirm && (
        <DeleteConfirmModal
          student={deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
        />
      )}
    </div>
  );
};

// ============================================================================
// STEP CONFIG
// ============================================================================
const STEPS = [
  { id: "personal",  label: "Personal",  sectionTitle: "Personal Info"     },
  { id: "academic",  label: "Academic",  sectionTitle: "Academic Info"      },
  { id: "address",   label: "Contact",   sectionTitle: "Contact Details"    },
  { id: "documents", label: "Documents", sectionTitle: "Educational Documents" },
];

// ============================================================================
// ENHANCED STUDENT FORM — Step-by-step with Next / Back / Enroll Student
// ============================================================================
const EnhancedStudentForm = ({ student, onClose, onSave }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const [form, setForm] = useState(
    student || {
      type: "University",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      dob: "",
      gender: "",
      bloodGroup: "",
      nationality: "",
      aadhar: "",
      pan: "",
      religion: "",
      category: "",
      motherTongue: "",
      course: "",
      standard: "",
      section: "",
      rollNo: "",
      admissionNo: "",
      admissionDate: "",
      year: "2025-26",
      stream: "",
      previousSchool: "",
      previousClass: "",
      previousPercentage: "",
      feeCategory: "",
      status: "Active",
      documents: {
        aadhar: null,
        marksheet: null,
        tc: null,
      },
      address: {
        addressLine1: "",
        addressLine2: "",
        city: "",
        district: "",
        state: "",
        country: "India",
        pin: "",
        landmark: "",
        location: "",
        parentPhone1: "",
        parentPhone2: "",
      },
    }
  );

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const handleDocumentUpload = (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) { alert("Only PDF and images allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    setForm((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docType]: { name: file.name, size: file.size, type: file.type, uploaded: new Date().toLocaleDateString() },
      },
    }));
  };

  const handleTypeChange = (type) => {
    setForm((prev) => ({ ...prev, type, course: "", standard: "" }));
  };

  // Per-step validation before advancing
  const validateStep = () => {
    if (currentStep.id === "personal") {
      if (!form.firstName.trim() || !form.email.trim()) {
        alert("First Name and Email are required.");
        return false;
      }
      if (!student && !form.password.trim()) {
        alert("Please set an Account Password for the new student.");
        return false;
      }
    }
    if (currentStep.id === "academic") {
      if (form.type === "University" && !form.course) {
        alert("Please select a Course.");
        return false;
      }
      if (form.type === "School" && !form.standard) {
        alert("Please select a Class.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const handleBack = () => setStepIndex((i) => Math.max(i - 1, 0));

  const handleSubmit = () => {
    onSave({ name: `${form.firstName} ${form.lastName}`.trim(), ...form });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* MODAL HEADER */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-slate-50">
          <div>
            <h3 className="font-black text-slate-800 text-lg">
              {student ? "Edit Student" : "Enroll New Student"}
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Step {stepIndex + 1} of {STEPS.length} — {currentStep.sectionTitle}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-all">
            <X size={22} />
          </button>
        </div>

        {/* STEP TABS (read-only progress indicator) */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-3 flex gap-1 overflow-x-auto">
          {STEPS.map((step, idx) => {
            const isDone = idx < stepIndex;
            const isActive = idx === stepIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition select-none ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm border border-blue-100"
                    : isDone
                    ? "text-emerald-600"
                    : "text-slate-400"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border ${
                  isActive ? "bg-blue-600 text-white border-blue-600" :
                  isDone ? "bg-emerald-500 text-white border-emerald-500" :
                  "border-slate-300 text-slate-400"
                }`}>
                  {isDone ? <Check size={10} /> : idx + 1}
                </span>
                {step.label}
              </div>
            );
          })}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 px-8 py-7">

          {/* ─── STEP 1: PERSONAL INFO ─── */}
          {currentStep.id === "personal" && (
            <div className="space-y-8">
              <section>
                <div className="border-l-4 border-blue-500 pl-5 mb-5">
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Personal Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="First Name *">
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="e.g. Priya" className={inputCls} required />
                  </Field>
                  <Field label="Last Name *">
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="e.g. Sharma" className={inputCls} />
                  </Field>
                  <Field label={`Account Password${student ? "" : " *"}`} labelClass="text-blue-600">
                    <input type="password" name="password" value={form.password || ""} onChange={handleChange}
                      placeholder={student ? "Leave blank to keep current" : "Set login password"}
                      className={`${inputCls} border-blue-200 bg-blue-50/30`} required={!student} />
                    <p className="text-[10px] text-blue-400 font-bold mt-1">
                      {student ? "Type here to reset the password." : "Student will use this to log in."}
                    </p>
                  </Field>
                  <Field label="Email Address *">
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="student@email.com" className={inputCls} required />
                  </Field>
                  <Field label="Mobile Number">
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                  </Field>
                  <Field label="Date of Birth">
                    <input type="date" name="dob" value={form.dob} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Gender">
                    <select name="gender" value={form.gender} onChange={handleChange} className={inputCls}>
                      <option value="">Select</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </Field>
                  <Field label="Blood Group">
                    <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className={inputCls}>
                      <option value="">Select</option>
                      {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </Field>
                  <Field label="Nationality">
                    <input type="text" name="nationality" value={form.nationality} onChange={handleChange} placeholder="e.g. Indian" className={inputCls} />
                  </Field>
                  <Field label="Religion">
                    <input type="text" name="religion" value={form.religion} onChange={handleChange} placeholder="e.g. Hindu" className={inputCls} />
                  </Field>
                  <Field label="Category">
                    <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                      <option value="">Select</option>
                      {["General","OBC","SC","ST","EWS"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Mother Tongue">
                    <input type="text" name="motherTongue" value={form.motherTongue} onChange={handleChange} placeholder="e.g. Odia" className={inputCls} />
                  </Field>
                </div>
              </section>

              <section>
                <div className="border-l-4 border-purple-500 pl-5 mb-5">
                  <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Identity Details</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Aadhar Number">
                    <input type="text" name="aadhar" value={form.aadhar} onChange={handleChange} placeholder="XXXX XXXX XXXX" className={inputCls} />
                  </Field>
                  <Field label="PAN Number">
                    <input type="text" name="pan" value={form.pan} onChange={handleChange} placeholder="ABCDE1234F" className={inputCls} />
                  </Field>
                </div>
              </section>
            </div>
          )}

          {/* ─── STEP 2: ACADEMIC INFO ─── */}
          {currentStep.id === "academic" && (
            <div>
              <div className="border-l-4 border-green-500 pl-5 mb-5">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Academic Information</h4>
              </div>

              {/* TYPE TOGGLE */}
              <div className="flex gap-3 mb-7">
                {["School", "University"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`px-6 py-2 rounded-lg font-bold text-sm transition border-2 ${
                      form.type === t
                        ? t === "School"
                          ? "bg-orange-100 text-orange-700 border-orange-300"
                          : "bg-blue-100 text-blue-600 border-blue-300"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {t === "School" ? "🏫" : "🎓"} {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Student ID">
                  <input type="text" placeholder="Auto-generated" disabled className={`${inputCls} opacity-50 bg-slate-100`} />
                </Field>
                <Field label="Admission Number *">
                  <input type="text" name="admissionNo" value={form.admissionNo} onChange={handleChange} placeholder="e.g. ADM-2026-001" className={inputCls} />
                </Field>

                {form.type === "University" ? (
                  <Field label="Course *">
                    <select name="course" value={form.course} onChange={handleChange} className={inputCls}>
                      <option value="">Select Course</option>
                      {["B.Tech CS","B.Tech IT","MBA","BBA","B.Sc","M.Tech","M.Sc"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                ) : (
                  <Field label="Class *">
                    <select name="standard" value={form.standard} onChange={handleChange} className={inputCls}>
                      <option value="">Select Class</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={`Class ${i + 1}`}>Class {i + 1}</option>
                      ))}
                    </select>
                  </Field>
                )}

                <Field label="Section">
                  <select name="section" value={form.section} onChange={handleChange} className={inputCls}>
                    <option value="">Select</option>
                    {["A","B","C","D"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Roll Number">
                  <input type="text" name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="e.g. 42" className={inputCls} />
                </Field>
                <Field label="Admission Date">
                  <input type="date" name="admissionDate" value={form.admissionDate} onChange={handleChange} className={inputCls} />
                </Field>
                <Field label="Academic Year *">
                  <select name="year" value={form.year} onChange={handleChange} className={inputCls}>
                    <option value="">Select</option>
                    {["2024-25","2025-26","2026-27"].map(y => <option key={y}>{y}</option>)}
                  </select>
                </Field>
                <Field label="Stream / Subject Group">
                  <input type="text" name="stream" value={form.stream} onChange={handleChange} placeholder="e.g. Science, Commerce" className={inputCls} />
                </Field>
                <Field label="Previous School">
                  <input type="text" name="previousSchool" value={form.previousSchool} onChange={handleChange} placeholder="School name" className={inputCls} />
                </Field>
                <Field label="Previous Class Passed">
                  <input type="text" name="previousClass" value={form.previousClass} onChange={handleChange} placeholder="e.g. Class IX" className={inputCls} />
                </Field>
                <Field label="Percentage / CGPA">
                  <input type="text" name="previousPercentage" value={form.previousPercentage} onChange={handleChange} placeholder="e.g. 85%" className={inputCls} />
                </Field>
                <Field label="Fee Category">
                  <select name="feeCategory" value={form.feeCategory} onChange={handleChange} className={inputCls}>
                    <option value="">Select</option>
                    {["General","Scholarship","Staff Ward"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ─── STEP 3: CONTACT DETAILS ─── */}
          {currentStep.id === "address" && (
            <div>
              <div className="border-l-4 border-orange-500 pl-5 mb-5">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Contact Details</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Address Line 1 *" className="md:col-span-2">
                  <input type="text" name="addressLine1" value={form.address.addressLine1} onChange={handleAddressChange} placeholder="House / Flat No., Building, Street" className={inputCls} />
                </Field>
                <Field label="Address Line 2" className="md:col-span-2">
                  <input type="text" name="addressLine2" value={form.address.addressLine2} onChange={handleAddressChange} placeholder="Locality, Area" className={inputCls} />
                </Field>
                <Field label="City *">
                  <input type="text" name="city" value={form.address.city} onChange={handleAddressChange} placeholder="e.g. Bhubaneswar" className={inputCls} />
                </Field>
                <Field label="District">
                  <input type="text" name="district" value={form.address.district} onChange={handleAddressChange} placeholder="e.g. Khordha" className={inputCls} />
                </Field>
                <Field label="State *">
                  <input type="text" name="state" value={form.address.state} onChange={handleAddressChange} placeholder="e.g. Odisha" className={inputCls} />
                </Field>
                <Field label="Country">
                  <input type="text" name="country" value={form.address.country} onChange={handleAddressChange} placeholder="India" className={inputCls} />
                </Field>
                <Field label="PIN Code *">
                  <input type="text" name="pin" value={form.address.pin} onChange={handleAddressChange} placeholder="6-digit PIN" className={inputCls} />
                </Field>
                <Field label="Landmark">
                  <input type="text" name="landmark" value={form.address.landmark} onChange={handleAddressChange} placeholder="Near ___" className={inputCls} />
                </Field>
                <Field label="Location / GPS" className="md:col-span-2">
                  <input type="text" name="location" value={form.address.location} onChange={handleAddressChange} placeholder="Paste Google Maps link or coordinates" className={inputCls} />
                </Field>
                <Field label="Parent / Guardian Number 1 *">
                  <input type="tel" name="parentPhone1" value={form.address.parentPhone1} onChange={handleAddressChange} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                </Field>
                <Field label="Parent / Guardian Number 2">
                  <input type="tel" name="parentPhone2" value={form.address.parentPhone2} onChange={handleAddressChange} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* ─── STEP 4: DOCUMENTS ─── */}
          {currentStep.id === "documents" && (
            <div>
              <div className="border-l-4 border-red-500 pl-5 mb-5">
                <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Educational Documents</h4>
              </div>
              <div className="space-y-4">
                {[
                  { key: "aadhar",    label: "Aadhar Card",               icon: "🪪" },
                  { key: "marksheet", label: "Mark Sheet / Report Card",   icon: "📚" },
                  { key: "tc",        label: "Transfer / Migration Certificate", icon: "📋" },
                ].map((doc) => (
                  <DocumentUploadField
                    key={doc.key}
                    label={doc.label}
                    icon={doc.icon}
                    docType={doc.key}
                    uploaded={form.documents[doc.key]}
                    onUpload={(e) => handleDocumentUpload(e, doc.key)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER — Next / Back / Enroll Student */}
        <div className="border-t border-slate-200 bg-slate-50 px-8 py-5 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 border border-slate-300 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-5 border border-slate-300 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}

            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-1.5"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition flex items-center gap-2"
              >
                <Check size={16} /> {student ? "Update Student" : "Enroll Student"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// SMALL HELPERS
// ============================================================================
const inputCls =
  "w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white";

const Field = ({ label, labelClass = "", className = "", children }) => (
  <div className={className}>
    <label className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 block ${labelClass || "text-slate-500"}`}>
      {label}
    </label>
    {children}
  </div>
);

// ============================================================================
// DOCUMENT UPLOAD FIELD
// ============================================================================
const DocumentUploadField = ({ label, icon, docType, uploaded, onUpload }) => (
  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
    <label className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2 block">
      <span>{icon}</span> {label}
    </label>
    <div className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition ${
      uploaded ? "border-emerald-300 bg-emerald-50" : "border-slate-300 hover:border-blue-400 hover:bg-blue-50"
    }`}>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onUpload} className="hidden" id={`doc-${docType}`} />
      <label htmlFor={`doc-${docType}`} className="block cursor-pointer">
        <div className="flex flex-col items-center gap-2">
          <div className={`p-3 rounded-full ${uploaded ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"}`}>
            {uploaded ? <Check size={22} /> : <Download size={22} />}
          </div>
          {uploaded ? (
            <div>
              <p className="text-sm font-bold text-slate-800">✓ {uploaded.name}</p>
              <p className="text-xs text-slate-500">Uploaded on {uploaded.uploaded}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-bold text-slate-700">Click to upload</p>
              <p className="text-xs text-slate-500">PDF, JPG, PNG · Max 5 MB</p>
            </div>
          )}
        </div>
      </label>
    </div>
  </div>
);

// ============================================================================
// STUDENT DETAILS MODAL
// ============================================================================
const StudentDetailsModal = ({ student, onClose, onEdit }) =>
  createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-white">Student Profile</h2>
            <p className="text-blue-100 text-sm mt-1">Complete information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full text-white transition">
            <X size={22} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* PROFILE HEADER */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-black text-blue-700 border-4 border-white shadow-lg">
              {student.name ? student.name[0].toUpperCase() : "S"}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">{student.name}</h3>
              <p className="text-slate-500 text-sm mt-1">{student.id}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.type === "School" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {student.type === "School" ? "🏫 School" : "🎓 University"}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  student.status === "Active" ? "bg-emerald-100 text-emerald-700" :
                  student.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {student.status}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* PERSONAL */}
          <section>
            <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Personal Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Email", student.email],
                ["Phone", student.phone || "-"],
                ["Date of Birth", student.dob || "-"],
                ["Gender", student.gender || "-"],
                ["Blood Group", student.bloodGroup || "-"],
                ["Aadhar", student.aadhar || "-"],
              ].map(([k, v]) => (
                <InfoCard key={k} label={k} value={v} />
              ))}
            </div>
          </section>

          {/* ACADEMIC */}
          <section>
            <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap size={18} className="text-green-600" /> Academic Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Program", student.type === "School" ? student.standard : student.course],
                ["Section", student.section || "-"],
                ["Roll Number", student.rollNo || "-"],
                ["Academic Year", student.year || "-"],
              ].map(([k, v]) => (
                <InfoCard key={k} label={k} value={v} />
              ))}
            </div>
          </section>

          {/* ADDRESS */}
          {student.address && (
            <section>
              <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-red-500" /> Contact Details
              </h4>
              <div className="bg-slate-50 p-4 rounded-lg space-y-1 text-sm text-slate-700">
                {student.address.addressLine1 && <p>{student.address.addressLine1}</p>}
                {student.address.addressLine2 && <p>{student.address.addressLine2}</p>}
                <p>
                  {[student.address.city, student.address.district, student.address.state].filter(Boolean).join(", ")}
                  {student.address.pin ? ` - ${student.address.pin}` : ""}
                </p>
                {student.address.country && <p>{student.address.country}</p>}
                {student.address.parentPhone1 && (
                  <p className="font-bold text-slate-800 pt-1">
                    Parent: {student.address.parentPhone1}
                    {student.address.parentPhone2 ? `, ${student.address.parentPhone2}` : ""}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* DOCUMENTS */}
          {student.documents && (
            <section>
              <h4 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-purple-600" /> Documents
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(student.documents).map(([key, value]) => (
                  <div key={key} className={`p-3 rounded-lg border-2 ${
                    value ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                  }`}>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${value ? "text-emerald-700" : "text-slate-400"}`}>
                      {value ? "✓ Uploaded" : "Not uploaded"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-8 py-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-100 transition">
            Close
          </button>
          <button onClick={onEdit} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-2">
            <Edit size={16} /> Edit Student
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

const InfoCard = ({ label, value }) => (
  <div className="bg-slate-50 p-3.5 rounded-lg">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
  </div>
);

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================
const DeleteConfirmModal = ({ student, onClose, onConfirm }) =>
  createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={32} className="text-red-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Delete Student?</h3>
        <p className="text-slate-500 text-sm mb-6">
          Are you sure you want to permanently delete <strong className="text-slate-800">{student.name}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-300 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm transition">
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

export default StudentList;