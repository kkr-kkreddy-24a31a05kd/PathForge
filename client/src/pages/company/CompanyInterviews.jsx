import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Video,
  User,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

const CompanyInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/upcoming');
      if (res.data.success) {
        setInterviews(res.data.interviews);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const confirmed = interviews.filter(i => i.status === 'confirmed');
  const pending = interviews.filter(i => i.status === 'proposed');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Technical Interview Calendar & Schedule
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Monitor upcoming virtual sessions and candidate confirmations.
        </p>
      </div>

      {/* Confirmed Schedule */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
          Confirmed Candidate Interviews ({confirmed.length})
        </h3>

        {confirmed.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No confirmed interviews yet"
            description="When candidates select one of your proposed time slots, they will appear here with virtual meeting links."
          />
        ) : (
          <div className="space-y-3">
            {confirmed.map((inv) => (
              <div
                key={inv._id}
                className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold font-heading text-ink-heading dark:text-white">
                      {inv.student?.name}
                    </h4>
                    <Badge variant="accepted" size="sm">Confirmed</Badge>
                    <span className="text-xs text-ink-muted">({inv.interviewType})</span>
                  </div>

                  <p className="text-xs text-ink-body dark:text-ink-bodyDark">
                    Role: {inv.internship?.title}
                  </p>

                  <p className="text-xs text-ink-muted dark:text-ink-mutedDark flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    {new Date(inv.selectedSlot).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                    {new Date(inv.selectedSlot).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {inv.meetingLink && (
                    <a
                      href={inv.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-brand bg-brand text-white text-xs font-semibold hover:bg-brand-hover shadow-subtle"
                    >
                      <Video className="w-3.5 h-3.5 text-accent" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Slot Selection */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
          Awaiting Candidate Confirmation ({pending.length})
        </h3>

        {pending.length === 0 ? (
          <div className="p-6 bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark text-xs text-ink-muted text-center">
            No pending interview invitations awaiting slot confirmation.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((inv) => (
              <div
                key={inv._id}
                className="bg-white dark:bg-bg-cardDark p-4 rounded-brand border border-border-light dark:border-border-dark shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink-heading dark:text-white">
                      {inv.student?.name}
                    </span>
                    <Badge variant="interview_scheduled" size="sm">Proposed</Badge>
                  </div>
                  <p className="text-ink-muted mt-0.5">
                    Position: {inv.internship?.title} &bull; {inv.proposedSlots?.length || 0} slots offered
                  </p>
                </div>
                <span className="text-[11px] text-ink-muted">
                  Invitation dispatched &bull; awaiting candidate selection
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyInterviews;
