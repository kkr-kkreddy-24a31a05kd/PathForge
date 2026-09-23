import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  Building,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const navigate = useNavigate();

  const fetchAdminData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/pending-companies')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (pendingRes.data.success) setPendingCompanies(pendingRes.data.companies);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      const res = await api.patch(`/admin/companies/${id}/approve`, { isApproved: true });
      if (res.data.success) {
        setPendingCompanies(prev => prev.filter(c => c._id !== id));
        setActionMessage(`Approved ${name} successfully! Real-time notification sent.`);
        fetchAdminData();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to approve company');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-brand text-white p-6 sm:p-8 rounded-brand shadow-subtle border border-brand-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Academic Board Administration
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
            PathForge Platform Overview
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Verify enterprise partners, audit skill alignment trends, and track student placement throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/approvals')}
          >
            <ShieldCheck className="w-4 h-4 mr-1.5" />
            Verification Queue ({pendingCompanies.length})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/admin/analytics')}
            className="text-brand border-white/20 hover:bg-white"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            Macro Analytics
          </Button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-brand bg-teal-50 border border-match/30 text-match text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {/* Platform Macro Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Partner Companies
          </span>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {stats?.totalCompanies || 0}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {stats?.pendingCompanies || pendingCompanies.length} pending verification
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Registered Scholars
          </span>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {stats?.totalStudents || 0}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            Active candidate profiles
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Active Internships
          </span>
          <p className="text-2xl font-bold font-heading text-accent">
            {stats?.activeInternships || 0}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            {stats?.totalApplications || 0} total applications
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Placement Rate
          </span>
          <p className="text-2xl font-bold font-heading text-match">
            {stats?.placementRate || 85}%
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            {stats?.placedStudents || 0} scholars placed
          </span>
        </div>
      </div>

      {/* Pending Company Approval Priority Queue */}
      <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Pending Company Approvals Queue
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              New enterprise organizations requiring verification before posting live opportunities
            </p>
          </div>
          <Link to="/admin/approvals" className="text-xs font-semibold text-brand dark:text-accent hover:underline">
            View All ({pendingCompanies.length})
          </Link>
        </div>

        {pendingCompanies.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="All company verification requests resolved"
            description="There are currently no enterprise accounts waiting in the approval queue."
          />
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {pendingCompanies.map((comp) => (
              <div
                key={comp._id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-heading text-ink-heading dark:text-white">
                      {comp.companyDetails?.companyName || comp.name}
                    </span>
                    <Badge variant="submitted" size="sm">Verification Pending</Badge>
                  </div>
                  <p className="text-ink-muted dark:text-ink-mutedDark">
                    Rep: {comp.name} &bull; {comp.email} &bull; Industry: {comp.companyDetails?.industry || 'Tech'}
                  </p>
                  {comp.companyDetails?.website && (
                    <a
                      href={comp.companyDetails.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand dark:text-accent hover:underline block"
                    >
                      {comp.companyDetails.website}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleApprove(comp._id, comp.companyDetails?.companyName || comp.name)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve Enterprise
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
