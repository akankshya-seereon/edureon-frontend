import { Routes, Route, Navigate } from "react-router-dom";

import { Login } from "../components/Auth/LoginForm"; 
import { ForgotPasswordPage } from "../pages/Auth/ForgotPasswordPage";
import { UnauthorizedPage } from "../pages/Auth/UnauthorizedPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { DashboardLayout } from "../components/Layouts/DashboardLayout";
import ProtectedRoute from "../components/Auth/ProtectedRoute";

// Super Admin
import { SuperAdminDashboard } from "../pages/SuperAdmin/SuperAdminDashboard";
import { InstituteProfile } from "../pages/SuperAdmin/InstituteProfile";
import SuperAdminInstituteList from "../pages/SuperAdmin/Institute/Institute";
import SuperAdminInstituteForm from "../pages/SuperAdmin/Institute/InstituteForm"; // 🚀 Added this import back

// Institute Admin
import AdminDashboard from "../pages/InstituteAdmin/AdminDashboard";
import PrincipalDashboard from "../pages/InstituteAdmin/Principal/PrincipalDashboard"; 

import Institute from "../pages/InstituteAdmin/Institute/Institute";
import InfrastructurePage from "../pages/InstituteAdmin/Infrastructure/InfrastructurePage.jsx";
import InstituteForm from "../pages/InstituteAdmin/Institute/InstituteForm";

// Academic Programs, Departments, Syllabus
import { AcademicProgram } from "../pages/InstituteAdmin/AcademicPrograms/AcademicProgram";
import { Department } from "../pages/InstituteAdmin/Departments/Department";
import { Syllabus } from "../pages/InstituteAdmin/Syllabus/Syllabus"; 
import { ViewSyllabus } from "../pages/InstituteAdmin/Syllabus/ViewSyllabus"; 

// Employee Master
import { Employee } from "../pages/InstituteAdmin/Employee/Employee"; 
import { EmployeeDirectory } from "../pages/InstituteAdmin/Employee/EmployeeDirectory";
import { EmployeeProfile } from "../pages/InstituteAdmin/Employee/EmployeeProfile";

// People & Classes
import { FacultyList } from "../pages/InstituteAdmin/People/FacultyList";
import FacultyForm from "../pages/InstituteAdmin/People/FacultyForm";
import { StudentList } from "../pages/InstituteAdmin/People/StudentList";
import { StudentForm } from "../pages/InstituteAdmin/People/StudentForm";
import { ClassList } from "../pages/InstituteAdmin/Classes/ClassList";

// Batch & Finance
import { BatchList } from "../pages/InstituteAdmin/Batch/BatchList";
import BatchForm from "../pages/InstituteAdmin/Batch/BatchForm";
import BatchBrowser from "../pages/InstituteAdmin/Batch/Batchbrowser.jsx";
import { FeeCollection } from "../pages/InstituteAdmin/Finance/FeeCollection";
import { FeeStructure } from "../pages/InstituteAdmin/Finance/FeeStructure";
import { PublishFees } from "../pages/InstituteAdmin/Finance/PublishFees";
import { ExpensePage } from "../pages/InstituteAdmin/Expenses/ExpensePage";

// Operations & Reports
import { Notifications } from "../pages/InstituteAdmin/Communication/Notifications";
import { Reports } from "../pages/InstituteAdmin/Reports/Reports";
import { Settings } from "../pages/InstituteAdmin/Settings/Settings";
import InstituteAttendance from "../pages/InstituteAdmin/Attendance/InstituteAttendance";
import Certificates from "../pages/InstituteAdmin/Certificates/Certificates";

// Exams
import { Examlist } from "../pages/InstituteAdmin/Exams/Examlist";
import { ExamForm } from "../pages/InstituteAdmin/Exams/Examform";
import { ExamQuestion } from "../pages/InstituteAdmin/Exams/ExamQuestion";
import { Examresult } from "../pages/InstituteAdmin/Exams/Examresult";

// Faculty
import { FacultyDashboard } from "../pages/Faculty/FacultyDashboard";
import { FacultyProfile } from "../pages/Faculty/Profile/FacultyProfile"; 
import { FacultyClasses } from "../pages/Faculty/Classes/Facultyclasses";
import { ClassDetail } from "../pages/Faculty/Classes/Classdetail";
import { FacultyCourses } from "../pages/Faculty/Courses/Facultycourses";
import { CreateCourse } from "../pages/Faculty/Courses/Createcourse";
import { EditCourse } from "../pages/Faculty/Courses/Editcourse";
import { CourseModules } from "../pages/Faculty/Courses/Coursemodule.jsx";
import { CourseDetail } from "../pages/Faculty/Courses/Coursedetail.jsx";
import { StudentAssignment } from "../pages/Faculty/Assignments/StudentAssignment";
import { CreateAssignment } from "../pages/Faculty/Assignments/CreateAssignment";
import FacultyLeave from "../pages/Faculty/Leaves/FacultyLeave";
import { FacultyNotifications } from "../pages/Faculty/Notifications/Facultynotification";
import Attendance from '../pages/Faculty/Attendance.jsx';
import { FacultyExams } from "../pages/Faculty/FacultyExams";
import { Help as FacultyHelp } from "../pages/Faculty/Help/Help"; 
import FacultySalary from "../pages/Faculty/Salary/Salary";   

// Student
import { StudentDashboard } from "../pages/Student/StudentDashboard";
import { StudentProfile }   from "../pages/Student/Profile/StudentProfile";
import { MyCourses }        from "../pages/Student/Courses/MyCourses";
import { CourseDetails }    from "../pages/Student/Courses/CourseDetails";
import { ModuleContent }    from "../pages/Student/Courses/ModuleContent";
import { StudentAttendance} from "../pages/Student/Attendance/StudentAttendance";
import { Exam }             from "../pages/Student/Exams/Exam";
import { Assignments }      from "../pages/Student/Assignments/Assignment";
import { AssignmentDetails} from "../pages/Student/Assignments/AssignmentDetails.jsx";
import { StudentFees }      from "../pages/Student/Fees/StudentFees";
import { Notification }     from "../pages/Student/Notification/Notifications";
import { Calendar }         from "../pages/Student/Calendar/Calendar";
import { Help as StudentHelp } from "../pages/Student/Help/Help"; 
import { StudentCertificates } from "../pages/Student/Certificates/StudentCertificates";


// TEMPORARY PLACEHOLDER FOR INCOMPLETE ROUTES
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-slate-50 text-slate-400 p-12">
    <h2 className="text-3xl font-black mb-2">{title}</h2>
    <p className="text-md font-bold uppercase tracking-widest">Page Coming Soon</p>
  </div>
);

export const AppRouter = () => (
  <Routes>

    {/* ── PUBLIC ─────────────────────────────────────────────────────────── */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />

    {/* ── SUPER ADMIN ─────────────────────────────────────────────────────── */}
    <Route
      path="/super-admin"
      element={
        <ProtectedRoute allowedRoles={["super_admin"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard"          element={<SuperAdminDashboard />} />
      <Route path="institutes"         element={<SuperAdminInstituteList />} />
      <Route path="institutes/:id/view"   element={<InstituteProfile />} />
      
      {/* 🚀 CRITICAL FIX: Add both Create and Edit routes here! */}
      <Route path="institutes/create"  element={<SuperAdminInstituteForm />} />
      <Route path="institutes/edit/:id" element={<SuperAdminInstituteForm />} />
      
      <Route path="attendance"         element={<InstituteAttendance role="super_admin" />} />
    </Route>

    {/* ── INSTITUTE ADMIN ─────────────────────────────────────────────────── */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={["institute_admin", "super_admin", "principal", "accountant", "hod"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"        element={<AdminDashboard />} />
      <Route path="principal"        element={<PrincipalDashboard />} />

      <Route path="institute"        element={<Institute />} />
      <Route path="institute/:id/view" element={<InstituteProfile />} />
      <Route path="institute/form"   element={<InstituteForm />} />
      <Route path="infrastructure"   element={<InfrastructurePage />} />
      
      {/* 🚀 Changed to 'academic-programs' to sync with Breadcrumb and Sidebar */}
      <Route path="academic-programs" element={<AcademicProgram />} />
      <Route path="departments"      element={<Department />} />
      <Route path="syllabus"         element={<Syllabus />} /> 
      <Route path="view-syllabus"    element={<ViewSyllabus />} /> 
      
      {/* Employee Master */}
      <Route path="employees/directory"   element={<EmployeeDirectory />} />
      <Route path="employees/register"    element={<Employee />} />
      <Route path="employees/edit/:id"    element={<Employee />} />
      <Route path="employees/profile/:id" element={<EmployeeProfile />} />

      <Route path="faculty"          element={<FacultyList />} />
      <Route path="faculty/create"   element={<FacultyForm />} />
      <Route path="students"         element={<StudentList />} />
      <Route path="students/create"  element={<StudentForm />} />
      <Route path="classes"          element={<ClassList />} />

      {/* Batch */}
      <Route path="batch"            element={<BatchBrowser />} />
      <Route path="batch/list"       element={<BatchList />} />
      <Route path="batch/create"     element={<BatchForm />} />

      {/* Finance & Ops */}
      <Route path="fees"             element={<FeeCollection />} />
      <Route path="fees/structure"   element={<FeeStructure />} />
      <Route path="fees/publish"     element={<PublishFees />} />
      <Route path="expenses"         element={<ExpensePage />} />
      <Route path="communication"    element={<Notifications />} />
      <Route path="reports"          element={<Reports />} />
      <Route path="settings"         element={<Settings />} />
      <Route path="attendance"       element={<InstituteAttendance role="institute_admin" />} />
      <Route path="certificates"     element={<Certificates />} />

      {/* Exams */}
      <Route path="exams"            element={<Examlist />} />
      <Route path="exams/create"     element={<ExamForm />} />
      <Route path="exams/questions"  element={<ExamQuestion />} />
      <Route path="exams/results"    element={<Examresult />} />
    </Route>

    {/* ── FACULTY / HOD ───────────────────────────────────────────────────── */}
    <Route
      path="/faculty"
      element={
        <ProtectedRoute allowedRoles={["faculty", "hod", "professor", "lecturer", "lab instructor"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"            element={<FacultyDashboard />} />
      <Route path="profile"              element={<FacultyProfile />} />
      <Route path="syllabus"             element={<Syllabus />} /> 
      <Route path="classes"              element={<FacultyClasses />} />
      <Route path="classes/detail"       element={<ClassDetail />} />
      <Route path="courses"              element={<FacultyCourses />} />
      <Route path="courses/create"       element={<CreateCourse />} />
      <Route path="courses/edit"         element={<EditCourse />} />
      <Route path="courses/modules"      element={<CourseModules />} />
      <Route path="courses/detail"       element={<CourseDetail />} />
      <Route path="assignments"          element={<StudentAssignment />} />
      <Route path="assignments/create"   element={<CreateAssignment />} />
      <Route path="leaves"               element={<FacultyLeave />} />
      <Route path="notifications"        element={<FacultyNotifications />} />
      <Route path="attendance"           element={<Attendance />} />
      <Route path="exams"                element={<FacultyExams />} />
      <Route path="help"                 element={<FacultyHelp />} />
      <Route path="salary"               element={<FacultySalary />} /> 
      <Route path="certificates"         element={<Placeholder title="Faculty Certificates" />} />
    </Route>

    {/* ── STUDENT ─────────────────────────────────────────────────────────── */}
    <Route
      path="/student"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard"               element={<StudentDashboard />} />
      <Route path="profile"                 element={<StudentProfile />} />
      <Route path="courses"                 element={<MyCourses />} />
      <Route path="courses/view"            element={<CourseDetails />} />
      <Route path="courses/module"          element={<ModuleContent />} />
      <Route path="assignments"             element={<Assignments />} />
      <Route path="assignments/:id"         element={<AssignmentDetails />} />
      <Route path="attendance"              element={<StudentAttendance />} />
      <Route path="exams"                   element={<Exam />} />
      <Route path="fees"                    element={<StudentFees />} />
      <Route path="notification"            element={<Notification />} />
      
      {/* 🚀 Changed to strictly lowercase 'calendar' */}
      <Route path="calendar"                element={<Calendar />} />
      <Route path="help"                    element={<StudentHelp />} />
      <Route path="certificates"            element={<StudentCertificates />} />
      <Route path="classes"                 element={<Placeholder title="My Classes" />} />
    </Route>

    {/* ── 404 ─────────────────────────────────────────────────────────────── */}
    <Route path="*" element={<NotFoundPage />} />

  </Routes>
);