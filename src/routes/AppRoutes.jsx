import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Landing from "../pages/landing/Landing";
import AdminIndexRedirect from "../pages/admin/AdminIndexRedirect";
import AdminLogin from "../pages/admin/AdminLogin";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminSettings from "../pages/admin/AdminSettings";

import DashboardHome from "../pages/dashboard/DashboardHome";
import StudentHome from "../pages/student/StudentHome";
import TeacherHome from "../pages/teacher/TeacherHome";
import ClassHome from "../pages/class/ClassHome";
import TimeTableHome from "../pages/timetable/TimeTableHome";
import ExamHome from "../pages/exam/ExamHome";
import TeacherDashboard from "../pages/teacherPortal/TeacherDashboard";
import TeacherLayout from "../pages/teacherPortal/TeacherLayout";
import TeacherSection from "../pages/teacherPortal/TeacherSection";
import TeacherStudents from "../pages/teacherPortal/TeacherStudents";
import TeacherAssignments from "../pages/teacherPortal/TeacherAssignments";
import TeacherHomework from "../pages/teacherPortal/TeacherHomework";
import TeacherTests from "../pages/teacherPortal/TeacherTests";
import StudentLogin from "../pages/studentPortal/StudentLogin";
import SuperAdminLayout from "../pages/superAdmin/SuperAdminLayout";
import SuperAdminDashboard from "../pages/superAdmin/SuperAdminDashboard";
import SuperAdminStudents from "../pages/superAdmin/SuperAdminStudents";
import SuperAdminTeachers from "../pages/superAdmin/SuperAdminTeachers";
import SuperAdminAdmins from "../pages/superAdmin/SuperAdminAdmins";
import StudentsDashboard from "../pages/studentPortal/StudentsDashboard";
import StudentLayout from "../pages/studentPortal/StudentLayout";
import StudentTimetable from "../pages/studentPortal/StudentTimetable";
import StudentDetails from "../pages/studentPortal/StudentDetails";
import StudentVideos from "../pages/studentPortal/StudentVideos";
import StudentAssignments from "../pages/studentPortal/StudentAssignments";
import StudentHomework from "../pages/studentPortal/StudentHomework";
import StudentTests from "../pages/studentPortal/StudentTests";

import PrivateRoute from "./PrivateRoute";
import StudentPrivateRoute from "./StudentPrivateRoute";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/teacher/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student" element={<StudentPrivateRoute> <StudentLayout /> </StudentPrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentsDashboard />} />
          <Route path="timetable" element={<StudentTimetable />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="homework" element={<StudentHomework />} />
          <Route path="details" element={<StudentDetails />} />
          <Route path="videos" element={<StudentVideos />} />
          <Route path="tests" element={<Navigate to="/student/exams" replace />} />
          <Route path="exams" element={<StudentTests />} />
        </Route>

        {/* Protected Admin Layout */}
        <Route path="/admin" element={<PrivateRoute allowedRoles={["admin"]}> <AdminLayout /> </PrivateRoute>}>
          <Route index element={<AdminIndexRedirect />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="students" element={<StudentHome />} />
          <Route path="teachers" element={<TeacherHome />} />
          <Route path="classes" element={<ClassHome />} />
          <Route path="timetable" element={<TimeTableHome />} />
          <Route path="exams" element={<ExamHome />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="/superadmin" element={<PrivateRoute allowedRoles={["superadmin"]}> <SuperAdminLayout /> </PrivateRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="students" element={<SuperAdminStudents />} />
          <Route path="teachers" element={<SuperAdminTeachers />} />
          <Route path="admins" element={<SuperAdminAdmins />} />
        </Route>

        <Route path="/teacher" element={<PrivateRoute allowedRoles={["teacher"]}> <TeacherLayout /> </PrivateRoute>}>
          <Route index element={<Navigate to="section" replace />} />
          <Route path="dashboard" element={<Navigate to="/teacher/section" replace />} />
          <Route path="section" element={<TeacherSection />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="assignments" element={<TeacherAssignments />} />
          <Route path="homework" element={<TeacherHomework />} />
          <Route path="tests" element={<TeacherTests />} />
          <Route path="legacy-dashboard" element={<TeacherDashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
