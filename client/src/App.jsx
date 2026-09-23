import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BrowseInternships from './pages/student/BrowseInternships';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyApplications from './pages/student/MyApplications';
import ResumeChecker from './pages/student/ResumeChecker';
import StudentProfile from './pages/student/StudentProfile';
import StudentInterviews from './pages/student/StudentInterviews';

// Company Pages
import CompanyDashboard from './pages/company/CompanyDashboard';
import PostInternship from './pages/company/PostInternship';
import ManageInternships from './pages/company/ManageInternships';
import ApplicantsList from './pages/company/ApplicantsList';
import CompanyInterviews from './pages/company/CompanyInterviews';
import CompanyAnalytics from './pages/company/CompanyAnalytics';
import CompanyProfile from './pages/company/CompanyProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyApprovals from './pages/admin/CompanyApprovals';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import PlatformUsers from './pages/admin/PlatformUsers';

// Route Guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark text-xs text-ink-muted">
        Loading workspace session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's primary dashboard
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'company') return <Navigate to="/company/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Browse can be viewed both publicly and inside dashboard */}
      <Route
        path="/browse"
        element={
          isAuthenticated ? (
            <DashboardLayout />
          ) : (
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
              <BrowseInternships />
            </div>
          )
        }
      >
        {isAuthenticated && <Route index element={<BrowseInternships />} />}
      </Route>

      {/* Student Protected Routes (Wrapped in Left Sidebar DashboardLayout) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="resume-checker" element={<ResumeChecker />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="interviews" element={<StudentInterviews />} />
      </Route>

      {/* Company Protected Routes */}
      <Route
        path="/company"
        element={
          <ProtectedRoute allowedRoles={['company', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CompanyDashboard />} />
        <Route path="post" element={<PostInternship />} />
        <Route path="postings" element={<ManageInternships />} />
        <Route path="applicants/:internshipId" element={<ApplicantsList />} />
        <Route path="interviews" element={<CompanyInterviews />} />
        <Route path="analytics" element={<CompanyAnalytics />} />
        <Route path="profile" element={<CompanyProfile />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="approvals" element={<CompanyApprovals />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="users" element={<PlatformUsers />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
