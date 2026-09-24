import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosClient';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { Plus, X, Briefcase, ShieldAlert, CheckCircle2 } from 'lucide-react';

const PostInternship = () => {
  const { isApprovedCompany } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Remote');
  const [locationType, setLocationType] = useState('Remote');
  const [stipend, setStipend] = useState('4500');
  const [stipendType, setStipendType] = useState('month');
  const [duration, setDuration] = useState('3 Months');
  const [deadline, setDeadline] = useState('');
  const [openings, setOpenings] = useState('2');

  // Skills
  const [skillInput, setSkillInput] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(['React', 'Node.js', 'MongoDB', 'TypeScript']);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill for match scoring.');
      return;
    }
    if (!deadline) {
      setError('Please set an application deadline.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/internships', {
        title,
        description,
        requiredSkills,
        location,
        locationType,
        stipend: Number(stipend),
        stipendType,
        duration,
        deadline,
        openings: Number(openings)
      });

      if (res.data.success) {
        setSuccess('Internship posted successfully! Redirecting...');
        setTimeout(() => {
          navigate('/company/postings');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post internship.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-accent" />
          Publish New Internship Opportunity
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Specify core technical requirements to activate algorithmic match scoring for all incoming student applications.
        </p>
      </div>

      {!isApprovedCompany && (
        <div className="p-4 rounded-brand bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>
            <strong>Verification Required:</strong> Your company profile is currently pending administrator verification. You can draft postings, but submission requires an approved account.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-bg-cardDark p-6 sm:p-8 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-5">
        {error && (
          <div className="p-3 rounded-brand bg-red-50 text-red-700 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-brand bg-teal-50 text-match text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        <Input
          label="Internship Role Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Distributed Cloud Systems Intern"
        />

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
            Role Overview & Responsibilities <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project pod, mentorship structure, deliverables, and engineering team mission..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-bg-cardDark text-ink-heading dark:text-white border border-border-light dark:border-border-dark rounded-brand text-sm focus:outline-none focus:border-brand"
          />
        </div>

        {/* Required Skills Manager */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
              Required Technical Skills ({requiredSkills.length}) <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-ink-muted">Used for 0-100% candidate match ranking</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(e);
                }
              }}
              placeholder="e.g. React, Docker, Python, PostgreSQL"
              className="flex-1 px-3 py-2 text-xs rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addSkill}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {requiredSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-brand text-xs font-semibold bg-blue-50/70 dark:bg-brand-light/30 text-brand dark:text-blue-300 border border-blue-100 dark:border-brand-light/40"
              >
                {s}
                <button type="button" onClick={() => removeSkill(idx)} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Location & Modality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location City / Region"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. San Francisco, CA or Remote"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
              Workplace Modality
            </label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-bg-cardDark text-ink-heading dark:text-white border border-border-light dark:border-border-dark rounded-brand text-sm focus:outline-none focus:border-brand"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>
          </div>
        </div>

        {/* Compensation & Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Stipend Amount ($)"
            type="number"
            required
            value={stipend}
            onChange={(e) => setStipend(e.target.value)}
            placeholder="4500"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
              Pay Period
            </label>
            <select
              value={stipendType}
              onChange={(e) => setStipendType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-bg-cardDark text-ink-heading dark:text-white border border-border-light dark:border-border-dark rounded-brand text-sm focus:outline-none focus:border-brand"
            >
              <option value="month">Per Month</option>
              <option value="week">Per Week</option>
              <option value="lump-sum">Lump Sum Completion</option>
              <option value="unpaid">Unpaid / Academic Credit</option>
            </select>
          </div>

          <Input
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="3 Months"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Application Deadline"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <Input
            label="Total Available Openings"
            type="number"
            min="1"
            value={openings}
            onChange={(e) => setOpenings(e.target.value)}
            placeholder="2"
          />
        </div>

        <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
          <Button
            type="submit"
            variant="accent"
            size="lg"
            loading={loading}
            disabled={!isApprovedCompany}
            className="shadow-md"
          >
            Publish Opportunity Live
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostInternship;
