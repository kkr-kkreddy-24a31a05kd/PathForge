import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  FileText,
  Sparkles,
  Calendar,
  User,
  PlusCircle,
  Briefcase,
  BarChart3,
  ShieldCheck,
  Users,
  LogOut,
  Building,
  CheckCircle2
} from 'lucide-react';

const Sidebar = ({ onCloseMobile }) => {
  const { user, logout, isStudent, isCompany, isAdmin, isApprovedCompany } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentLinks = [
    { label: 'Overview', to: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Browse Internships', to: '/browse', icon: Search },
    { label: 'My Applications', to: '/student/applications', icon: FileText },
    { label: 'Resume Match Checker', to: '/student/resume-checker', icon: Sparkles },
    { label: 'Scheduled Interviews', to: '/student/interviews', icon: Calendar },
    { label: 'My Profile & Skills', to: '/student/profile', icon: User },
  ];

  const companyLinks = [
    { label: 'Dashboard', to: '/company/dashboard', icon: LayoutDashboard },
    { label: 'Post Opportunity', to: '/company/post', icon: PlusCircle },
    { label: 'Manage Postings', to: '/company/postings', icon: Briefcase },
    { label: 'Interview Calendar', to: '/company/interviews', icon: Calendar },
    { label: 'Hiring Analytics', to: '/company/analytics', icon: BarChart3 },
    { label: 'Company Profile', to: '/company/profile', icon: Building },
  ];

  const adminLinks = [
    { label: 'Executive Overview', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Company Approvals', to: '/admin/approvals', icon: ShieldCheck },
    { label: 'Platform Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'User Directory', to: '/admin/users', icon: Users },
  ];

  let links = studentLinks;
  if (isCompany) links = companyLinks;
  if (isAdmin) links = adminLinks;

  const roleLabels = {
    student: 'Student Scholar',
    company: 'Enterprise Partner',
    admin: 'Platform Administrator'
  };

  return (
    <aside className="w-64 h-full bg-brand text-white flex flex-col flex-shrink-0 select-none shadow-xl border-r border-brand-hover">
      {/* Brand Header */}
      <div className="p-5 border-b border-brand-hover flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-brand bg-white/10 flex items-center justify-center text-accent font-heading font-bold text-lg border border-white/10">
            <span>P</span>
            <span className="text-white text-xs -ml-0.5">F</span>
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-white tracking-tight">
              Path<span className="text-accent">Forge</span>
            </span>
            <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-medium -mt-1">
              Industry Bridge
            </span>
          </div>
        </NavLink>
      </div>

      {/* User Badge / Role Indicator */}
      <div className="p-4 mx-3 my-3 rounded-brand bg-brand-light/30 border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 text-accent font-bold flex items-center justify-center text-sm font-heading flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate leading-tight">
              {user?.role === 'company' && user?.companyDetails?.companyName
                ? user.companyDetails.companyName
                : user?.name}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <span>{roleLabels[user?.role] || user?.role}</span>
              {user?.role === 'company' && (
                isApprovedCompany ? (
                  <span title="Verified Enterprise"><CheckCircle2 className="w-3 h-3 text-match inline" /></span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-semibold">(Pending)</span>
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-brand text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-light text-white border-l-4 border-accent font-semibold shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-brand-light/40'
                }`
              }
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-brand-hover">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-brand text-sm font-medium text-gray-300 hover:text-white hover:bg-brand-light/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
