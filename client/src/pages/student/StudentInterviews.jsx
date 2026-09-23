import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Building,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const StudentInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [actionMessage, setActionMessage] = useState('');

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/interviews/upcoming');
      if (res.data.success) {
        setInterviews(res.data.interviews);
      }
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const handleConfirmSlot = async (interviewId) => {
    const slot = selectedSlots[interviewId];
    if (!slot) {
      alert('Please choose one of the available time slots.');
      return;
    }

    setConfirmingId(interviewId);
    setActionMessage('');

    try {
      const res = await api.patch(`/interviews/${interviewId}/confirm`, {
        selectedSlot: slot
      });

      if (res.data.success) {
        setActionMessage('Interview successfully confirmed! Time slot locked.');
        fetchInterviews();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm interview slot.');
    } finally {
      setConfirmingId(null);
    }
  };

  const pending = interviews.filter(i => i.status === 'proposed');
  const confirmed = interviews.filter(i => i.status === 'confirmed');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Interview Scheduling & Coordination
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Review time slots proposed by enterprise recruitment teams and confirm your attendance.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-brand bg-teal-50 border border-match/30 text-match text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {/* Pending Invitations Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
          Action Required: Proposed Time Slots ({pending.length})
        </h3>

        {pending.length === 0 ? (
          <div className="p-6 bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark text-xs text-ink-muted text-center">
            No pending interview invitations awaiting slot confirmation.
          </div>
        ) : (
          pending.map((inv) => (
            <div
              key={inv._id}
              className="p-5 rounded-brand border border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20 shadow-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase text-brand dark:text-blue-300">
                    {inv.company?.companyDetails?.companyName || inv.company?.name}
                  </span>
                  <h4 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                    {inv.internship?.title} &bull; {inv.interviewType} Round
                  </h4>
                </div>
                <Badge variant="interview_scheduled" size="sm">Action Required</Badge>
              </div>

              {inv.notes && (
                <p className="text-xs text-ink-body dark:text-ink-bodyDark italic bg-white/70 dark:bg-bg-cardDark p-2.5 rounded-brand">
                  "{inv.notes}"
                </p>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-2">
                  Select Your Preferred Time Slot:
                </p>
                <div className="space-y-2">
                  {(inv.proposedSlots || []).map((slot, idx) => {
                    const isSelected = selectedSlots[inv._id] === slot;
                    return (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-brand border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-brand text-white border-brand font-semibold shadow-sm'
                            : 'bg-white dark:bg-bg-cardDark border-border-light dark:border-border-dark hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`slot-${inv._id}`}
                          value={slot}
                          checked={isSelected}
                          onChange={() => setSelectedSlots({ ...selectedSlots, [inv._id]: slot })}
                          className="text-accent focus:ring-accent"
                        />
                        <span className="text-xs">
                          {new Date(slot).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                          {new Date(slot).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="accent"
                  size="sm"
                  loading={confirmingId === inv._id}
                  onClick={() => handleConfirmSlot(inv._id)}
                >
                  Confirm Selected Time Slot
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmed Upcoming Interviews Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
          Confirmed Upcoming Interviews ({confirmed.length})
        </h3>

        {confirmed.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming interviews confirmed"
            description="When recruiters shortlist your application and an interview is agreed upon, details will appear here."
          />
        ) : (
          confirmed.map((inv) => (
            <div
              key={inv._id}
              className="p-5 rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-cardDark shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-brand dark:text-blue-300">
                    {inv.company?.companyDetails?.companyName || inv.company?.name}
                  </span>
                  <Badge variant="accepted" size="sm">Confirmed</Badge>
                </div>
                <h4 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                  {inv.internship?.title} ({inv.interviewType})
                </h4>
                <p className="text-xs text-ink-muted dark:text-ink-mutedDark flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {new Date(inv.selectedSlot).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at{' '}
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
                    Join Video Call
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentInterviews;
