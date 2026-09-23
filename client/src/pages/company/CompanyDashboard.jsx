import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  PlusCircle,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

const CompanyDashboard = () => {
  const { user, isApprovedCompany } = useAuth();
  const navigate = useNavigate();
  const [postings, setPostings] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setError('');
        const [postingsRes, interviewsRes] = await Promise.all([
          api.get('/internships/company/my-postings').catch(() => ({ data: { success: true, internships: [] } })),
          api.get('/interviews/upcoming').catch(() => ({ data: { success: true, interviews: [] } }))
        ]);

        if (postingsRes.data.success) setPostings(postingsRes.data.internships);
        if (interviewsRes.data.success) setInterviews(interviewsRes.data.interviews);
      } catch (err) {
        console.error('Failed to load company dashboard:', err);
        setError('Failed to load some company metrics. Please verify network connectivity.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  const totalApplicants = postings.reduce((acc, p) => acc + (p.applicantsCount || 0), 0);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-12 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand border-t-accent rounded-full mb-3" />
        <p className="text-xs text-ink-muted dark:text-ink-mutedDark">Loading organization workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {error && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => window.location.reload()} className="underline font-semibold ml-2">Reload</button>
        </div>
      )}
      {/* Pending Approval Warning Banner */}
      {!isApprovedCompany && (
        <div className="p-5 rounded-brand bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-brand bg-accent text-brand mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold font-heading">
                Company Account Pending Administrative Board Approval
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                Your organization profile is currently undergoing verification by the PathForge university alliance board. You will receive an immediate notification once approved to publish live internships.
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/company/profile')}
          >
            Review Profile Info
          </Button>
        </div>
      )}

      {/* Hero Welcome Bar */}
      <div className="bg-brand text-white p-6 sm:p-8 rounded-brand shadow-subtle border border-brand-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Enterprise Talent Hub
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
            {user?.companyDetails?.companyName || user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            Review top candidates ranked by skill-match scores, coordinate technical interviews, and track university placement metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            disabled={!isApprovedCompany}
            onClick={() => navigate('/company/post')}
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Post New Opportunity
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/company/analytics')}
            className="text-brand border-white/20 hover:bg-white"
          >
            <BarChart3 className="w-4 h-4 mr-1.5" />
            View Recruitment Analytics
          </Button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Active Postings
            </span>
            <Briefcase className="w-4 h-4 text-brand dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {postings.filter(p => p.status === 'open').length}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            {postings.length} total published
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Total Applicants
            </span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {totalApplicants}
          </p>
          <span className="text-[11px] text-match font-medium">
            Ranked automatically by match score
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Interviews Scheduled
            </span>
            <Calendar className="w-4 h-4 text-brand dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {interviews.length}
          </p>
          <Link to="/company/interviews" className="text-[11px] text-brand dark:text-accent hover:underline">
            View calendar schedule &rarr;
          </Link>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Verification Status
            </span>
            <Sparkles className="w-4 h-4 text-match" />
          </div>
          <p className="text-base font-bold font-heading text-match mt-1">
            {isApprovedCompany ? '✓ Verified Partner' : '⏳ In Review'}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            {isApprovedCompany ? 'Full recruitment privileges active' : 'Awaiting admin approval'}
          </span>
        </div>
      </div>

      {/* Postings & Applicants Quick Action Table */}
      <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Active Internship Postings & Applicant Queues
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Select any position to review candidates ranked by percentage skill match.
            </p>
          </div>
          <Button
            variant="accent"
            size="sm"
            disabled={!isApprovedCompany}
            onClick={() => navigate('/company/post')}
          >
            <PlusCircle className="w-4 h-4 mr-1" /> Post New Role
          </Button>
        </div>

        {postings.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No internships posted yet"
            description={
              isApprovedCompany
                ? 'Create your first internship posting to begin receiving ranked student applicants.'
                : 'Once your company account is approved, you will be able to post opportunities here.'
            }
            actionLabel={isApprovedCompany ? 'Create Internship Opportunity' : null}
            onAction={() => navigate('/company/post')}
          />
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {postings.map((job) => (
              <div
                key={job._id}
                className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                      {job.title}
                    </h4>
                    <Badge variant={job.status} size="sm">
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted dark:text-ink-mutedDark">
                    <span>${job.stipend} / {job.stipendType}</span>
                    <span>&bull;</span>
                    <span>{job.location} ({job.locationType})</span>
                    <span>&bull;</span>
                    <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-xs font-semibold text-ink-heading dark:text-white px-2.5 py-1 rounded-brand bg-gray-100 dark:bg-bg-subtleDark">
                    {job.applicantsCount || 0} Candidate(s)
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/company/applicants/${job._id}`)}
                  >
                    View Ranked Applicants
                    <ArrowRight className="w-4 h-4 ml-1" />
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

export default CompanyDashboard;
