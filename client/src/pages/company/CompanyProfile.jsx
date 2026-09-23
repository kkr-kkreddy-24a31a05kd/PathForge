import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Building, CheckCircle2, ShieldCheck, ShieldAlert } from 'lucide-react';

const CompanyProfile = () => {
  const { user, updateProfile, isApprovedCompany } = useAuth();

  const [companyName, setCompanyName] = useState(user?.companyDetails?.companyName || user?.name || '');
  const [website, setWebsite] = useState(user?.companyDetails?.website || '');
  const [industry, setIndustry] = useState(user?.companyDetails?.industry || 'Enterprise Software');
  const [location, setLocation] = useState(user?.companyDetails?.location || 'San Francisco, CA');
  const [description, setDescription] = useState(user?.companyDetails?.description || '');
  const [size, setSize] = useState(user?.companyDetails?.size || '50-100');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    const res = await updateProfile({
      companyDetails: {
        companyName,
        website,
        industry,
        location,
        description,
        size
      }
    });

    setSaving(false);
    if (res.success) {
      setFeedback('Organization profile updated successfully!');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <Building className="w-5 h-5 text-accent" />
          Enterprise Organization Profile
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Manage your enterprise branding, verification details, and industry credentials.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className={`p-4 rounded-brand border text-xs flex items-center justify-between ${
        isApprovedCompany
          ? 'bg-teal-50 dark:bg-match/15 border-match/30 text-match font-semibold'
          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-200'
      }`}>
        <div className="flex items-center gap-2.5">
          {isApprovedCompany ? (
            <>
              <ShieldCheck className="w-5 h-5 text-match" />
              <span>Verified Enterprise Partner: You are approved to post live internships and recruit university scholars.</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-5 h-5 text-accent" />
              <span>Pending Administrative Review: Your enterprise registration is queued for academic director signoff.</span>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-bg-cardDark p-6 sm:p-8 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Company Legal / Operating Name"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <Input
            label="Official Website URL"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://company.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Primary Industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Artificial Intelligence, Cloud"
          />
          <Input
            label="Headquarters Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Boston, MA or Remote"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
            Company Size
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white dark:bg-bg-cardDark text-ink-heading dark:text-white border border-border-light dark:border-border-dark rounded-brand text-sm focus:outline-none focus:border-brand"
          >
            <option value="1-10">1-10 Employees (Seed / Early Startup)</option>
            <option value="10-50">10-50 Employees (Series A / Emerging)</option>
            <option value="50-250">50-250 Employees (Mid-Market Growth)</option>
            <option value="250-1000">250-1000 Employees (Scale-up)</option>
            <option value="1000+">1000+ Employees (Global Enterprise)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
            Mission & Internship Program Overview
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Share your engineering culture, tech stack overview, and what makes your internship cohorts unique..."
            className="w-full px-3.5 py-2.5 bg-white dark:bg-bg-cardDark text-ink-heading dark:text-white border border-border-light dark:border-border-dark rounded-brand text-sm focus:outline-none focus:border-brand"
          />
        </div>

        {feedback && (
          <div className="p-3 rounded-brand bg-teal-50 text-match text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {feedback}
          </div>
        )}

        <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
          <Button type="submit" variant="accent" size="lg" loading={saving} className="shadow-md">
            Save Company Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CompanyProfile;
