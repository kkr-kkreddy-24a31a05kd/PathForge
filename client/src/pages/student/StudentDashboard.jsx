import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MatchScoreBadge from '../../components/common/MatchScoreBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  Briefcase,
  FileCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  MapPin,
  DollarSign,
  CheckCircle2,
  Clock
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError('');
        const [appsRes, jobsRes, interviewsRes] = await Promise.all([
          api.get('/applications/my-applications'),
          api.get('/internships'),
          api.get('/interviews/upcoming')
        ]);

        if (appsRes.data.success) setApplications(appsRes.data.applications);
        if (jobsRes.data.success) {
          // Sort by match score descending for top recommendations
          const sorted = [...jobsRes.data.internships].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          setRecommendedJobs(sorted.slice(0, 3));
        }
        if (interviewsRes.data.success) setInterviews(interviewsRes.data.interviews);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
        setError('Unable to load some dashboard metrics. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingInterviews = interviews.filter(i => i.status === 'proposed');
  const confirmedInterviews = interviews.filter(i => i.status === 'confirmed');

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-12 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand border-t-accent rounded-full mb-3" />
        <p className="text-xs text-ink-muted dark:text-ink-mutedDark">Loading your candidate workspace...</p>
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
      {/* Welcome Banner */}
      <div className="bg-brand text-white p-6 sm:p-8 rounded-brand shadow-subtle border border-brand-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Academic Candidate Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mt-1">
            Welcome back, {user?.name?.split(' ')[0] || 'Scholar'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-xl">
            {user?.studentDetails?.headline || 'Explore skill-matched internships, analyze resume keywords, and track interview invitations.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/student/resume-checker')}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Check Resume Match
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/browse')}
            className="text-brand border-white/20 hover:bg-white"
          >
            Browse Internships
          </Button>
        </div>
      </div>

      {/* Action Required: Pending Interview Invitation Alert */}
      {pendingInterviews.length > 0 && (
        <div className="p-4 rounded-brand bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-brand bg-accent text-brand font-bold">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-ink-heading dark:text-ink-headingDark font-heading">
                Interview Invitation Waiting For Confirmation!
              </h4>
              <p className="text-xs text-ink-body dark:text-ink-bodyDark">
                {pendingInterviews[0].company?.companyDetails?.companyName || 'A recruiter'} has proposed time slots for "{pendingInterviews[0].internship?.title}".
              </p>
            </div>
          </div>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/student/interviews')}
          >
            Select Preferred Time Slot
          </Button>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Active Applications
            </span>
            <FileCheck className="w-4 h-4 text-brand dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {applications.length}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            {applications.filter(a => a.status === 'shortlisted').length} currently shortlisted
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Upcoming Interviews
            </span>
            <Calendar className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {confirmedInterviews.length + pendingInterviews.length}
          </p>
          <span className="text-[11px] text-match font-medium">
            {confirmedInterviews.length} confirmed schedule(s)
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Declared Skills
            </span>
            <Sparkles className="w-4 h-4 text-match" />
          </div>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {user?.studentDetails?.skills?.length || 0}
          </p>
          <Link to="/student/profile" className="text-[11px] text-brand dark:text-accent hover:underline">
            Manage skills & profile &rarr;
          </Link>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark">
              Average Match
            </span>
            <CheckCircle2 className="w-4 h-4 text-match" />
          </div>
          <p className="text-2xl font-bold font-heading text-match">
            {applications.length > 0
              ? `${Math.round(applications.reduce((acc, a) => acc + (a.matchScore || 0), 0) / applications.length)}%`
              : '85%'}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            Skill alignment score
          </span>
        </div>
      </div>

      {/* Grid: Recommended Internships & Recent Applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommended For You */}
        <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                  Top Recommended Internships
                </h3>
                <p className="text-xs text-ink-body dark:text-ink-bodyDark">
                  Ranked by highest skill overlap with your profile
                </p>
              </div>
              <Link to="/browse" className="text-xs font-semibold text-brand dark:text-accent hover:underline">
                View All
              </Link>
            </div>

            {recommendedJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No internships found"
                description="Check back soon as top enterprise partners post new summer and fall cohorts."
              />
            ) : (
              <div className="space-y-4">
                {recommendedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 rounded-brand border border-border-light dark:border-border-dark bg-bg-light/40 dark:bg-bg-subtleDark/40 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                          {job.title}
                        </h4>
                        <p className="text-xs text-ink-muted dark:text-ink-mutedDark">
                          {job.company?.companyDetails?.companyName || job.company?.name} &bull; {job.location}
                        </p>
                      </div>
                      <MatchScoreBadge score={job.matchScore || 85} size="sm" />
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {(job.requiredSkills || []).slice(0, 3).map((s, idx) => (
                        <Badge key={idx} variant="skill" size="sm">
                          {s}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-heading dark:text-white">
                        ${job.stipend} / {job.stipendType}
                      </span>
                      <Button
                        variant={job.hasApplied ? 'secondary' : 'accent'}
                        size="sm"
                        disabled={job.hasApplied}
                        onClick={() => navigate(`/browse?highlight=${job._id}`)}
                      >
                        {job.hasApplied ? 'Applied' : 'Review & Apply'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications Status */}
        <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                  My Recent Applications
                </h3>
                <p className="text-xs text-ink-body dark:text-ink-bodyDark">
                  Live recruitment status pipeline
                </p>
              </div>
              <Link to="/student/applications" className="text-xs font-semibold text-brand dark:text-accent hover:underline">
                View Tracker
              </Link>
            </div>

            {applications.length === 0 ? (
              <EmptyState
                icon={FileCheck}
                title="No active applications yet"
                description="Explore verified opportunities and submit your profile with custom match scores."
                actionLabel="Explore Internships"
                onAction={() => navigate('/browse')}
              />
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app._id}
                    className="p-3.5 rounded-brand border border-border-light dark:border-border-dark flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold font-heading text-ink-heading dark:text-ink-headingDark truncate">
                        {app.internship?.title || 'Internship Opportunity'}
                      </p>
                      <p className="text-xs text-ink-muted dark:text-ink-mutedDark truncate">
                        {app.internship?.company?.companyDetails?.companyName || app.internship?.company?.name || 'Enterprise'} &bull; Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <MatchScoreBadge score={app.matchScore} size="sm" />
                      <Badge variant={app.status} size="sm">
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
