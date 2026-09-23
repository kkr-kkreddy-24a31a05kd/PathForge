import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MatchScoreBadge from '../../components/common/MatchScoreBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  FileCheck,
  Calendar,
  Clock,
  Building,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/applications/my-applications');
      if (res.data.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError('Failed to retrieve your applications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            My Applications Tracker
          </h2>
          <p className="text-xs text-ink-body dark:text-ink-bodyDark">
            Track your recruitment progress, review evaluation notes, and manage interview invitations.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => navigate('/browse')}>
          Browse More Roles
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchApplications()} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading your applications...</div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No applications submitted yet"
          description="Discover open summer and fall cohorts and apply directly using your verified skill profile."
          actionLabel="Explore Opportunities"
          onAction={() => navigate('/browse')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedId === app._id;
            const isInterview = app.status === 'interview_scheduled';

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-5 shadow-subtle transition-all"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase text-brand dark:text-blue-300">
                        {app.internship?.company?.companyDetails?.companyName || app.internship?.company?.name}
                      </span>
                      <Badge variant={app.status} size="sm">
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark leading-snug">
                      {app.internship?.title || 'Internship Opportunity'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted dark:text-ink-mutedDark pt-1">
                      <span className="flex items-center gap-1 font-semibold text-ink-heading dark:text-white">
                        <DollarSign className="w-3.5 h-3.5 text-accent" />
                        ${app.internship?.stipend} / {app.internship?.stipendType}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {app.internship?.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-border-light dark:border-border-dark">
                    <MatchScoreBadge score={app.matchScore} size="md" />

                    {isInterview && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => navigate('/student/interviews')}
                      >
                        <Calendar className="w-4 h-4 mr-1" />
                        Confirm Slot
                      </Button>
                    )}

                    <button
                      onClick={() => toggleExpand(app._id)}
                      className="p-1.5 rounded-brand hover:bg-gray-100 dark:hover:bg-bg-subtleDark text-ink-muted"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details and Timeline */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-border-light dark:border-border-dark text-xs space-y-4 animate-in fade-in duration-150">
                    {/* Status Feedback Notes if present */}
                    {app.statusNotes && (
                      <div className="p-3 rounded-brand bg-bg-light dark:bg-bg-subtleDark border border-border-light dark:border-border-dark">
                        <p className="font-semibold text-ink-heading dark:text-ink-headingDark uppercase text-[10px] tracking-wider mb-1">
                          Recruiter Note / Feedback:
                        </p>
                        <p className="text-ink-body dark:text-ink-bodyDark italic">
                          "{app.statusNotes}"
                        </p>
                      </div>
                    )}

                    {/* Skill Breakdown */}
                    <div>
                      <p className="font-semibold text-ink-heading dark:text-ink-headingDark uppercase text-[10px] tracking-wider mb-1.5">
                        Matched Skills for Role:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(app.matchedSkills || []).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-brand bg-teal-50 dark:bg-match/15 text-match border border-match/30 font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                        {(app.missingSkills || []).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-brand bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
                            Missing: {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Application Status History Timeline */}
                    <div>
                      <p className="font-semibold text-ink-heading dark:text-ink-headingDark uppercase text-[10px] tracking-wider mb-2">
                        Application Progression Timeline:
                      </p>
                      <div className="space-y-2 border-l-2 border-border-light dark:border-border-dark pl-3 ml-1.5">
                        {(app.statusHistory || []).map((h, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-brand dark:bg-accent border-2 border-white dark:border-bg-cardDark" />
                            <p className="font-semibold text-ink-heading dark:text-ink-headingDark capitalize">
                              {h.status.replace('_', ' ')}
                            </p>
                            <p className="text-[11px] text-ink-muted dark:text-ink-mutedDark">
                              {new Date(h.updatedAt).toLocaleString()} &bull; {h.notes}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
