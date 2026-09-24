import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building,
  ExternalLink,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

const CompanyApprovals = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/pending-companies');
      if (res.data.success) {
        setCompanies(res.data.companies);
      }
    } catch (err) {
      console.error('Failed to load pending companies:', err);
      setError('Failed to load pending companies. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleDecision = async (id, isApproved, name) => {
    setProcessingId(id);
    setActionMessage('');

    try {
      const res = await api.patch(`/admin/companies/${id}/approve`, {
        isApproved,
        rejectionReason: isApproved ? '' : 'Company verification requires updated documentation.'
      });

      if (res.data.success) {
        setCompanies(prev => prev.filter(c => c._id !== id));
        setActionMessage(
          isApproved
            ? `Successfully verified ${name}! The company can now post live internships.`
            : `Updated status for ${name}.`
        );
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process approval action');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-accent" />
          Enterprise Partner Verification Queue
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Review credentials and authorize participating industry organizations before they can post student internships.
        </p>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-brand bg-teal-50 border border-match/30 text-match text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchCompanies}>Retry</Button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading pending verification requests...</div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Verification queue is clear!"
          description="All enterprise partner registrations have been reviewed. New submissions will immediately appear here."
        />
      ) : (
        <div className="space-y-4">
          {companies.map((comp) => {
            const details = comp.companyDetails || {};
            const isProcessing = processingId === comp._id;

            return (
              <div
                key={comp._id}
                className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold font-heading text-ink-heading dark:text-white">
                      {details.companyName || comp.name}
                    </h3>
                    <Badge variant="submitted" size="sm">
                      Pending Verification
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-muted dark:text-ink-mutedDark pt-1">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-accent" />
                      Representative: {comp.name} ({comp.email})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" />
                      Industry: {details.industry || 'Technology'} ({details.size || '10-50'} members)
                    </span>
                    {details.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        HQ: {details.location}
                      </span>
                    )}
                    {details.website && (
                      <a
                        href={details.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand dark:text-accent hover:underline flex items-center gap-1"
                      >
                        {details.website} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {details.description && (
                    <p className="text-xs text-ink-body dark:text-ink-bodyDark italic pt-1 leading-relaxed bg-bg-light/60 dark:bg-bg-subtleDark/50 p-2.5 rounded-brand border border-border-light dark:border-border-dark">
                      "{details.description}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-border-light dark:border-border-dark flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={() => handleDecision(comp._id, false, details.companyName || comp.name)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>

                  <Button
                    variant="accent"
                    size="sm"
                    loading={isProcessing}
                    onClick={() => handleDecision(comp._id, true, details.companyName || comp.name)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve Enterprise Account
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyApprovals;
