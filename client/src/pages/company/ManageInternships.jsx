import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  Briefcase,
  Users,
  PlusCircle,
  Trash2,
  CheckCircle,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react';

const ManageInternships = () => {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPostings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/internships/company/my-postings');
      if (res.data.success) {
        setPostings(res.data.internships);
      }
    } catch (err) {
      console.error('Failed to load postings:', err);
      setError('Unable to load company postings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
      await api.put(`/internships/${id}`, { status: newStatus });
      setPostings(prev =>
        prev.map(p => (p._id === id ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      alert('Failed to update posting status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this internship posting and its applications?')) {
      return;
    }
    try {
      await api.delete(`/internships/${id}`);
      setPostings(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete internship');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            Manage Published Opportunities
          </h2>
          <p className="text-xs text-ink-body dark:text-ink-bodyDark">
            View active listings, evaluate candidate pipelines, and control cohort availability.
          </p>
        </div>
        <Button variant="accent" size="sm" onClick={() => navigate('/company/post')}>
          <PlusCircle className="w-4 h-4 mr-1.5" /> Post New Role
        </Button>
      </div>

      {error && (
        <div className="p-3.5 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchPostings()} className="underline font-semibold ml-2">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-xs text-ink-muted">Loading your postings...</div>
      ) : postings.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities posted yet"
          description="Create your first internship posting to begin receiving ranked candidate profiles."
          actionLabel="Create Posting"
          onAction={() => navigate('/company/post')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {postings.map((job) => (
            <div
              key={job._id}
              className="bg-white dark:bg-bg-cardDark rounded-brand border border-border-light dark:border-border-dark p-6 shadow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                    {job.title}
                  </h3>
                  <Badge variant={job.status} size="sm">
                    {job.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted dark:text-ink-mutedDark mb-4">
                  <span className="flex items-center gap-1 font-semibold text-ink-heading dark:text-white">
                    <DollarSign className="w-3.5 h-3.5 text-accent" />
                    ${job.stipend} / {job.stipendType}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location} ({job.locationType})
                  </span>
                  <span>&bull;</span>
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(job.requiredSkills || []).map((s, idx) => (
                    <Badge key={idx} variant="skill" size="sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/company/applicants/${job._id}`)}
                >
                  <Users className="w-4 h-4 mr-1.5" />
                  Evaluate Applicants ({job.applicantsCount || 0})
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleStatus(job._id, job.status)}
                  >
                    {job.status === 'open' ? 'Close Role' : 'Re-open'}
                  </Button>
                  <button
                    onClick={() => handleDelete(job._id)}
                    className="p-2 rounded-brand text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete posting"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageInternships;
