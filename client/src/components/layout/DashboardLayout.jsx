import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  AlertCircle,
  Check,
  ExternalLink,
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const { user, isCompany, isApprovedCompany } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, activeToast, dismissToast } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  useEffect(() => {
    if (!notifDropdownOpen) return;

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notifDropdownOpen]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/student/dashboard')) return 'Student Workspace';
    if (path.includes('/browse')) return 'Explore Opportunities';
    if (path.includes('/student/applications')) return 'My Applications Tracker';
    if (path.includes('/student/resume-checker')) return 'Resume Match Score Analyzer';
    if (path.includes('/student/interviews')) return 'Interview Calendar';
    if (path.includes('/student/profile')) return 'Academic & Professional Profile';
    if (path.includes('/company/dashboard')) return 'Enterprise Dashboard';
    if (path.includes('/company/post')) return 'Post New Opportunity';
    if (path.includes('/company/postings')) return 'Manage Internship Postings';
    if (path.includes('/company/applicants')) return 'Applicant Evaluation & Ranking';
    if (path.includes('/company/interviews')) return 'Interview Schedule';
    if (path.includes('/company/analytics')) return 'Recruitment Analytics';
    if (path.includes('/company/profile')) return 'Company Organization Profile';
    if (path.includes('/admin/dashboard')) return 'Executive Administration';
    if (path.includes('/admin/approvals')) return 'Enterprise Verification Queue';
    if (path.includes('/admin/analytics')) return 'System Analytics & Funnels';
    if (path.includes('/admin/users')) return 'User & Entity Directory';
    return 'PathForge Workspace';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark text-ink-body dark:text-ink-bodyDark">
      {/* Real-time Notification Banner Toast (Feature 6) */}
      {activeToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-brand text-white p-4 rounded-brand shadow-elevated border-l-4 border-accent animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="p-1 rounded-brand bg-accent/20 text-accent mt-0.5">
                <Bell className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-sm font-semibold font-heading text-white">{activeToast.title}</h4>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{activeToast.message}</p>
                {activeToast.link && (
                  <button
                    onClick={() => {
                      navigate(activeToast.link);
                      dismissToast();
                    }}
                    className="mt-2 text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    View Details <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <button
              onClick={dismissToast}
              className="text-gray-400 hover:text-white p-1 rounded-brand"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Left Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        id="mobile-sidebar-drawer"
        aria-label="Navigation sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-bg-cardDark border-b border-border-light dark:border-border-dark flex items-center justify-between px-4 sm:px-6 lg:px-8 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-brand text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark"
              aria-label="Open sidebar"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-sidebar-drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Unapproved Company Notice Badge */}
            {isCompany && !isApprovedCompany && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-brand bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Pending Verification</span>
              </div>
            )}

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                aria-label="Notifications"
                aria-expanded={notifDropdownOpen}
                className="relative p-2 rounded-brand text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-brand text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-bg-cardDark border border-border-light dark:border-border-dark rounded-brand shadow-elevated z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="p-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold font-heading text-ink-heading dark:text-ink-headingDark">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-brand bg-accent/20 text-accent">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-brand dark:text-blue-400 hover:underline font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border-light dark:divide-border-dark">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-ink-muted dark:text-ink-mutedDark">
                        No notifications yet. You will be alerted in real time when your status changes.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item._id}
                          className={`p-3 text-xs transition-colors hover:bg-gray-50 dark:hover:bg-bg-subtleDark flex items-start justify-between gap-2 ${
                            !item.read ? 'bg-amber-50/40 dark:bg-accent/5' : ''
                          }`}
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              if (!item.read) markAsRead(item._id);
                              if (item.link) {
                                navigate(item.link);
                                setNotifDropdownOpen(false);
                              }
                            }}
                          >
                            <p className="font-semibold text-ink-heading dark:text-ink-headingDark">
                              {item.title}
                            </p>
                            <p className="text-ink-body dark:text-ink-bodyDark mt-0.5 leading-relaxed">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-ink-muted dark:text-ink-mutedDark mt-1 block">
                              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {!item.read && (
                            <button
                              onClick={() => markAsRead(item._id)}
                              className="p-1 rounded-brand text-ink-muted hover:text-brand dark:hover:text-white"
                              title="Mark read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 rounded-brand text-ink-body dark:text-ink-bodyDark hover:bg-gray-100 dark:hover:bg-bg-subtleDark transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-bg-light dark:bg-bg-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
