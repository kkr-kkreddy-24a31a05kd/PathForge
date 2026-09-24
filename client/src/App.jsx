import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';
import Navbar from './components/layout/Navbar';

// Public Pages (Eagerly loaded for instant first paint)
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BrowseInternships from './pages/student/BrowseInternships';

// Student Pages (Code-split for optimized payload)
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyApplications = lazy(() => import('./pages/student/MyApplications'));
const ResumeChecker = lazy(() => import('./pages/student/ResumeChecker'));
const StudentProfile = lazy(() => import('./pages/student/StudentProfile'));
const StudentInterviews = lazy(() => import('./pages/student/StudentInterviews'));

// Company Pages (Code-split)
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const PostInternship = lazy(() => import('./pages/company/PostInternship'));
const ManageInternships = lazy(() => import('./pages/company/ManageInternships'));
const ApplicantsList = lazy(() => import('./pages/company/ApplicantsList'));
const CompanyInterviews = lazy(() => import('./pages/company/CompanyInterviews'));
const CompanyAnalytics = lazy(() => import('./pages/company/CompanyAnalytics'));
const CompanyProfile = lazy(() => import('./pages/company/CompanyProfile'));

// Admin Pages (Code-split)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const CompanyApprovals = lazy(() => import('./pages/admin/CompanyApprovals'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const PlatformUsers = lazy(() => import('./pages/admin/PlatformUsers'));

// Route Fallback Loader
const RouteFallback = () => (
  <div className="p-12 flex flex-col items-center justify-center min-h-[300px] text-xs text-ink-muted">
    <div className="w-6 h-6 border-2 border-brand border-t-accent rounded-full animate-spin mb-3"></div>
    <span>Loading workspace module...</span>
  </div>
);

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
    <Suspense fallback={<RouteFallback />}>
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
            <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col">
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                <BrowseInternships />
              </main>
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
    </Suspense>
  );
}

export default App;
