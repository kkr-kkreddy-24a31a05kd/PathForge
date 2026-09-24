import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MatchScoreBadge from '../../components/common/MatchScoreBadge';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  GraduationCap,
  FileText,
  Mail,
  ArrowLeft,
  X,
  Plus
} from 'lucide-react';

const ApplicantsList = () => {
  const { internshipId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [internshipTitle, setInternshipTitle] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');
  const [loading, setLoading] = useState(true);

  // Interview Proposal Modal State
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [targetApplicant, setTargetApplicant] = useState(null);
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/pathforge-eval');
  const [interviewType, setInterviewType] = useState('Technical');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [proposing, setProposing] = useState(false);

  // Resume Drawer State
  const [viewResumeModal, setViewResumeModal] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalError, setModalError] = useState('');

  const fetchApplicants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/applications/internship/${internshipId}/applicants`, {
        params: { status: statusFilter, sortBy }
      });
      if (res.data.success) {
        setApplicants(res.data.applicants);
        setInternshipTitle(res.data.internshipTitle);
        setRequiredSkills(res.data.requiredSkills);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
      setError(err.response?.data?.message || 'Failed to load applicant rankings for this role.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [internshipId, statusFilter, sortBy]);

  const handleUpdateStatus = async (appId, newStatus, customNotes = '') => {
    setError('');
    try {
      const res = await api.patch(`/applications/${appId}/status`, {
        status: newStatus,
        notes: customNotes
      });
      if (res.data.success) {
        setApplicants(prev =>
          prev.map(a => (a._id === appId ? { ...a, status: newStatus } : a))
        );
        setSuccessMsg(`Applicant status updated to "${newStatus.replace('_', ' ')}".`);
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update applicant status');
    }
  };

  const handleOpenInterviewModal = (app) => {
    setTargetApplicant(app);
    setModalError('');
    // Set default upcoming dates (tomorrow 2pm, day after 4pm)
    const now = new Date();
    const d1 = new Date(now.getTime() + 24 * 3600 * 1000);
    d1.setHours(14, 0, 0, 0);
    const d2 = new Date(now.getTime() + 48 * 3600 * 1000);
    d2.setHours(16, 0, 0, 0);

    const toLocalISO = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    setSlot1(toLocalISO(d1));
    setSlot2(toLocalISO(d2));
    setSlot3('');
    setInterviewNotes(`Initial 45-minute technical session for ${internshipTitle}`);
    setInterviewModalOpen(true);
  };

  const handleSubmitInterview = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!slot1) {
      setModalError('Please configure at least one interview time slot.');
      return;
    }

    const proposedSlots = [slot1];
    if (slot2) proposedSlots.push(slot2);
    if (slot3) proposedSlots.push(slot3);

    setProposing(true);
    try {
      const res = await api.post('/interviews/propose', {
        applicationId: targetApplicant._id,
        proposedSlots,
        meetingLink,
        interviewType,
        notes: interviewNotes
      });

      if (res.data.success) {
        // Update local status
        setApplicants(prev =>
          prev.map(a => (a._id === targetApplicant._id ? { ...a, status: 'interview_scheduled' } : a))
        );
        setInterviewModalOpen(false);
        setSuccessMsg('Interview proposal dispatched! The candidate has been notified in real time to select their preferred slot.');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to propose interview slots');
    } finally {
      setProposing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/company/postings')}
            className="text-xs font-semibold text-brand dark:text-accent flex items-center gap-1 mb-1 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to All Postings
          </button>
          <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            Applicants: {internshipTitle || 'Internship'}
          </h2>
          <p className="text-xs text-ink-body dark:text-ink-bodyDark">
            Candidates ranked automatically by skill-match score percentage.
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-subtleDark text-ink-heading dark:text-white"
          >
            <option value="matchScore">Rank by Match Score (Highest First)</option>
            <option value="newest">Sort by Application Date</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchApplicants()} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-brand bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Required Role Skills Summary Banner */}
      <div className="p-4 rounded-brand bg-white dark:bg-bg-cardDark border border-border-light dark:border-border-dark shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="font-semibold text-ink-heading dark:text-white">Role Skills Baseline:</span>
          <div className="flex flex-wrap gap-1">
            {requiredSkills.map((s, idx) => (
              <Badge key={idx} variant="skill" size="sm">{s}</Badge>
            ))}
          </div>
        </div>
        <span className="text-match font-bold">
          {applicants.length} Candidate(s) Evaluated
        </span>
      </div>

      {/* Applicants List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Evaluating candidates...</div>
      ) : applicants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No applicants found for this position"
          description="Candidates will appear here as soon as they submit their profile."
        />
      ) : (
        <div className="space-y-4">
          {applicants.map((app, index) => {
            const student = app.student;
            const edu = student?.studentDetails?.education?.[0];

            return (
              <div
                key={app._id}
                className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle transition-all"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  {/* Candidate Left Details */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {/* Rank Badge */}
                    <div className="w-8 h-8 rounded-brand bg-brand text-accent font-heading font-bold text-sm flex items-center justify-center flex-shrink-0">
                      #{index + 1}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                          {student?.name || 'Applicant'}
                        </h3>
                        <Badge variant={app.status} size="sm">
                          {app.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <p className="text-xs text-ink-muted dark:text-ink-mutedDark">
                        {student?.email} &bull; Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>

                      {edu && (
                        <p className="text-xs text-ink-body dark:text-ink-bodyDark flex items-center gap-1.5 pt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-accent" />
                          <span>{edu.degree} in {edu.fieldOfStudy || 'CS'} &bull; {edu.institution} {edu.gpa ? `(GPA: ${edu.gpa})` : ''}</span>
                        </p>
                      )}

                      {/* Skill Match Breakdown */}
                      <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                        {(app.matchedSkills || []).map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-brand bg-teal-50 dark:bg-match/15 text-match border border-match/30 font-semibold">
                            ✓ {s}
                          </span>
                        ))}
                        {(app.missingSkills || []).map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-brand bg-gray-100 dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700">
                            Missing: {s}
                          </span>
                        ))}
                      </div>

                      {app.coverNote && (
                        <p className="text-xs text-ink-body dark:text-ink-bodyDark italic pt-2 line-clamp-2">
                          "{app.coverNote}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Match Score Display */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-brand bg-bg-light dark:bg-bg-subtleDark border border-border-light dark:border-border-dark flex-shrink-0">
                    <span className="text-xs uppercase font-semibold text-ink-muted mb-1">
                      Skill Overlap
                    </span>
                    <MatchScoreBadge score={app.matchScore} size="lg" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-48 shrink-0 justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewResumeModal(app)}
                      className="w-full"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      View Resume
                    </Button>

                    {app.status === 'submitted' && (
                      <>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleUpdateStatus(app._id, 'shortlisted', 'Top technical profile selected for next round.')}
                          className="w-full"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Shortlist Candidate
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdateStatus(app._id, 'rejected', 'Thank you for applying. We are moving forward with other candidates at this time.')}
                          className="w-full text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {app.status === 'shortlisted' && (
                      <>
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleOpenInterviewModal(app)}
                          className="w-full"
                        >
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          Propose Interview
                        </Button>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleUpdateStatus(app._id, 'accepted', 'Offer extended for internship position!')}
                          className="w-full"
                        >
                          Extend Offer
                        </Button>
                      </>
                    )}

                    {app.status === 'interview_scheduled' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdateStatus(app._id, 'accepted', 'Offer extended following interview performance!')}
                        className="w-full"
                      >
                        Extend Offer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Interview Slots Modal (Feature 10) */}
      {interviewModalOpen && targetApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark max-w-lg w-full p-6 shadow-elevated animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="text-lg font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                  Propose Interview Time Slots
                </h3>
                <p className="text-xs text-ink-muted dark:text-ink-mutedDark">
                  Propose multiple times for candidate {targetApplicant.student?.name}
                </p>
              </div>
              <button onClick={() => setInterviewModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInterview} className="py-4 space-y-4 text-xs">
              {modalError && (
                <div className="p-2.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                  {modalError}
                </div>
              )}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
                  Proposed Times (Candidate will select one):
                </label>
                <div>
                  <span className="text-[11px] text-ink-muted block mb-1">Slot Option 1 (Required):</span>
                  <input
                    type="datetime-local"
                    required
                    value={slot1}
                    onChange={(e) => setSlot1(e.target.value)}
                    className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block mb-1">Slot Option 2 (Recommended):</span>
                  <input
                    type="datetime-local"
                    value={slot2}
                    onChange={(e) => setSlot2(e.target.value)}
                    className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-ink-muted block mb-1">Slot Option 3 (Optional):</span>
                  <input
                    type="datetime-local"
                    value={slot3}
                    onChange={(e) => setSlot3(e.target.value)}
                    className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
                  Virtual Meeting Link
                </label>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
                  Interview Round Type
                </label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
                >
                  <option value="Technical">Technical Code & Systems</option>
                  <option value="Behavioral">Behavioral & Culture Fit</option>
                  <option value="Hiring Manager">Hiring Manager Discussion</option>
                  <option value="Final Round">Final Partner Round</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
                  Notes / Agenda for Candidate
                </label>
                <textarea
                  rows={2}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-border-light dark:border-border-dark flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setInterviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" loading={proposing}>
                  Send Interview Proposal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resume Viewer Modal */}
      {viewResumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark max-w-2xl w-full p-6 shadow-elevated max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-border-light dark:border-border-dark">
              <div>
                <h3 className="text-base font-bold font-heading text-ink-heading dark:text-white">
                  Resume: {viewResumeModal.student?.name}
                </h3>
                <p className="text-xs text-ink-muted">Match Score: {viewResumeModal.matchScore}%</p>
              </div>
              <button onClick={() => setViewResumeModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 text-xs font-mono bg-bg-light dark:bg-bg-subtleDark p-4 rounded-brand border border-border-light dark:border-border-dark whitespace-pre-wrap leading-relaxed">
              {viewResumeModal.resumeSnapshot || 'No resume text provided.'}
            </div>

            <div className="pt-3 border-t border-border-light dark:border-border-dark flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setViewResumeModal(null)}>
                Close Viewer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantsList;
