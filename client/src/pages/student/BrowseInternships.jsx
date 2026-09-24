import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MatchScoreBadge from '../../components/common/MatchScoreBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
  X,
  CheckCircle,
  Building,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const BrowseInternships = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightedId = searchParams.get('highlight');

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [customResumeText, setCustomResumeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [minStipend, setMinStipend] = useState('');

  const { isStudent, user } = useAuth();

  const fetchInternships = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (skillFilter !== 'all') params.skill = skillFilter;
      if (locationFilter !== 'all') params.location = locationFilter;
      if (minStipend) params.minStipend = minStipend;

      const res = await api.get('/internships', { params });
      if (res.data.success) {
        setInternships(res.data.internships);
        if (highlightedId) {
          const found = res.data.internships.find(j => j._id === highlightedId);
          if (found) setSelectedJob(found);
        }
      }
    } catch (error) {
      console.error('Failed to fetch internships:', error);
      setFetchError('Unable to fetch opportunities at this time. Please verify network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [skillFilter, locationFilter, minStipend]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    setSubmitting(true);
    setFeedbackMsg('');

    try {
      const res = await api.post(`/applications/apply/${selectedJob._id}`, {
        coverNote,
        customResumeText: customResumeText || user?.studentDetails?.resumeText || ''
      });

      if (res.data.success) {
        setFeedbackMsg('Application submitted successfully!');
        // Update local status
        setInternships(prev =>
          prev.map(j => (j._id === selectedJob._id ? { ...j, hasApplied: true, applicationStatus: 'submitted' } : j))
        );
        setSelectedJob(prev => ({ ...prev, hasApplied: true, applicationStatus: 'submitted' }));
        setTimeout(() => {
          setApplyModalOpen(false);
          setFeedbackMsg('');
        }, 1500);
      }
    } catch (error) {
      setFeedbackMsg(error.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  // Collect unique skills for filter dropdown
  const allSkills = Array.from(
    new Set(internships.flatMap(j => j.requiredSkills || []))
  ).sort();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search & Filter Header Bar */}
      <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-ink-muted dark:text-ink-mutedDark" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role title, keyword, or technologies..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg-light dark:bg-bg-subtleDark border border-border-light dark:border-border-dark rounded-brand text-sm focus:outline-none focus:border-brand dark:focus:border-blue-400 text-ink-heading dark:text-white"
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search Opportunities
          </Button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border-light dark:border-border-dark text-xs">
          <div className="flex items-center gap-1.5 text-ink-muted dark:text-ink-mutedDark font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* Skill Filter */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="px-3 py-1.5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white"
          >
            <option value="all">All Skills</option>
            {allSkills.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white"
          >
            <option value="all">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="San Francisco">San Francisco</option>
            <option value="Boston">Boston</option>
            <option value="Austin">Austin</option>
          </select>

          {/* Minimum Stipend */}
          <select
            value={minStipend}
            onChange={(e) => setMinStipend(e.target.value)}
            className="px-3 py-1.5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white"
          >
            <option value="">Any Stipend</option>
            <option value="2000">$2,000+ / mo</option>
            <option value="4000">$4,000+ / mo</option>
            <option value="5000">$5,000+ / mo</option>
          </select>

          {(skillFilter !== 'all' || locationFilter !== 'all' || minStipend || searchQuery) && (
            <button
              onClick={() => {
                setSkillFilter('all');
                setLocationFilter('all');
                setMinStipend('');
                setSearchQuery('');
              }}
              className="text-xs text-brand dark:text-accent font-semibold hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{fetchError}</span>
          <button onClick={() => fetchInternships()} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listings List (2 cols on wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted dark:text-ink-mutedDark">
            <span>Showing {internships.length} Opportunity Positions</span>
            {isStudent && <span className="text-match font-bold">✨ Match score calculated live</span>}
          </div>

          {internships.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No matching internships found"
              description="Try adjusting your keyword search or clear filters to discover more open positions."
              actionLabel="Clear Filters"
              onAction={() => {
                setSkillFilter('all');
                setLocationFilter('all');
                setMinStipend('');
                setSearchQuery('');
              }}
            />
          ) : (
            internships.map((job) => {
              const isSelected = selectedJob?._id === job._id;
              return (
                <div
                  key={job._id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-5 rounded-brand border transition-all cursor-pointer bg-white dark:bg-bg-cardDark ${
                    isSelected
                      ? 'border-brand dark:border-accent ring-2 ring-brand/10 dark:ring-accent/20'
                      : 'border-border-light dark:border-border-dark hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase text-brand dark:text-blue-300">
                          {job.company?.companyDetails?.companyName || job.company?.name}
                        </span>
                        <Badge variant="open" size="sm">{job.locationType}</Badge>
                      </div>
                      <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark leading-snug">
                        {job.title}
                      </h3>
                    </div>

                    {isStudent && (
                      <MatchScoreBadge score={job.matchScore || 0} size="sm" />
                    )}
                  </div>

                  <p className="text-xs text-ink-body dark:text-ink-bodyDark line-clamp-2 mt-2">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(job.requiredSkills || []).map((skill, idx) => {
                      const isMatched = isStudent && (user?.studentDetails?.skills || []).some(
                        s => s.toLowerCase().trim() === skill.toLowerCase().trim()
                      );
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-0.5 rounded-brand font-medium border ${
                            isMatched
                              ? 'bg-teal-50 dark:bg-match/15 text-match border-match/30 font-semibold'
                              : 'bg-gray-100 dark:bg-bg-subtleDark text-ink-body dark:text-ink-bodyDark border-border-light dark:border-border-dark'
                          }`}
                        >
                          {skill} {isMatched ? '✓' : ''}
                        </span>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-ink-heading dark:text-white flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-accent" />
                        ${job.stipend} / {job.stipendType}
                      </span>
                      <span className="text-ink-muted dark:text-ink-mutedDark flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.hasApplied ? (
                        <Badge variant={job.applicationStatus || 'submitted'} size="sm">
                          Applied
                        </Badge>
                      ) : (
                        <span className="text-xs font-semibold text-brand dark:text-accent flex items-center">
                          View Details <ChevronRight className="w-4 h-4 ml-0.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Detail Panel (1 col) */}
        <div className="lg:col-span-1">
          {selectedJob ? (
            <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle sticky top-20 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand dark:text-blue-300">
                    {selectedJob.company?.companyDetails?.companyName || selectedJob.company?.name}
                  </span>
                  <Badge variant="open" size="sm">{selectedJob.locationType}</Badge>
                </div>
                <h3 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark leading-snug">
                  {selectedJob.title}
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-mutedDark flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedJob.location} &bull; Deadline: {new Date(selectedJob.deadline).toLocaleDateString()}
                </p>
              </div>

              {/* Match Score Block for Students */}
              {isStudent && (
                <MatchScoreBadge
                  score={selectedJob.matchScore || 0}
                  size="lg"
                  totalCount={selectedJob.requiredSkills?.length}
                  matchedCount={selectedJob.matchedSkills?.length}
                />
              )}

              {/* Role Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
                    Role Description
                  </h4>
                  <p className="text-ink-body dark:text-ink-bodyDark leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-2">
                    Required Skills & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.requiredSkills || []).map((skill, idx) => (
                      <Badge key={idx} variant="skill" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-light dark:border-border-dark grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] uppercase text-ink-muted block font-semibold">Compensation</span>
                    <span className="font-bold text-ink-heading dark:text-white">${selectedJob.stipend} / {selectedJob.stipendType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-ink-muted block font-semibold">Duration</span>
                    <span className="font-bold text-ink-heading dark:text-white">{selectedJob.duration || '3 Months'}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-border-light dark:border-border-dark">
                {isStudent ? (
                  selectedJob.hasApplied ? (
                    <Button variant="secondary" className="w-full" disabled>
                      ✓ Already Applied ({selectedJob.applicationStatus || 'In Review'})
                    </Button>
                  ) : (
                    <Button
                      variant="accent"
                      className="w-full font-semibold shadow-md"
                      onClick={() => setApplyModalOpen(true)}
                    >
                      Apply for this Internship
                    </Button>
                  )
                ) : !user ? (
                  <Button
                    variant="accent"
                    className="w-full font-semibold shadow-md"
                    onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/browse?highlight=${selectedJob._id}`)}`)}
                  >
                    Sign In to Apply
                  </Button>
                ) : (
                  <p className="text-xs text-center text-ink-muted dark:text-ink-mutedDark py-1">
                    Logged in as <strong className="capitalize text-ink-heading dark:text-white">{user.role}</strong>. Applications are reserved for student candidate accounts.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-bg-cardDark p-8 rounded-brand border border-border-light dark:border-border-dark text-center text-xs text-ink-muted dark:text-ink-mutedDark">
              Select an internship from the list to view comprehensive details, skill breakdown, and apply.
            </div>
          )}
        </div>
      </div>

      {/* Application Submission Modal */}
      {applyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark max-w-lg w-full p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="text-lg font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                  Apply for Internship
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-mutedDark">
                  {selectedJob.title} &bull; {selectedJob.company?.companyDetails?.companyName || selectedJob.company?.name}
                </p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 rounded-brand bg-bg-light dark:bg-bg-subtleDark border border-border-light dark:border-border-dark flex items-center justify-between">
                <div>
                  <span className="font-bold text-ink-heading dark:text-ink-headingDark block">
                    Calculated Skill Overlap
                  </span>
                  <span className="text-ink-body dark:text-ink-bodyDark">
                    {selectedJob.matchScore || 0}% match based on your registered skills
                  </span>
                </div>
                <MatchScoreBadge score={selectedJob.matchScore || 0} size="sm" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
                  Candidate Note / Why you're a fit (Optional)
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a brief introduction highlighting your relevant coursework or projects..."
                  className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white text-xs focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
                  Resume Content / Portfolio Snapshot
                </label>
                <textarea
                  rows={3}
                  value={customResumeText}
                  onChange={(e) => setCustomResumeText(e.target.value)}
                  placeholder={user?.studentDetails?.resumeText || 'Paste resume text to include in your submission...'}
                  className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white text-xs focus:outline-none focus:border-brand font-mono"
                />
              </div>

              {feedbackMsg && (
                <div className="p-2.5 rounded-brand bg-teal-50 dark:bg-match/20 text-match text-xs font-semibold">
                  {feedbackMsg}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setApplyModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleApply}
                loading={submitting}
              >
                Confirm & Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseInternships;
