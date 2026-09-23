import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { Plus, X, GraduationCap, FileText, CheckCircle2 } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.studentDetails?.headline || '');
  const [bio, setBio] = useState(user?.studentDetails?.bio || '');
  const [phone, setPhone] = useState(user?.studentDetails?.phone || '');
  const [resumeLink, setResumeLink] = useState(user?.studentDetails?.resumeLink || '');
  const [resumeText, setResumeText] = useState(user?.studentDetails?.resumeText || '');

  // Skills
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(user?.studentDetails?.skills || []);

  // Education
  const [educationList, setEducationList] = useState(
    user?.studentDetails?.education?.length > 0
      ? user.studentDetails.education
      : [{ institution: '', degree: '', fieldOfStudy: '', year: '', gpa: '' }]
  );

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const addSkill = (e) => {
    e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...educationList];
    updated[index][field] = value;
    setEducationList(updated);
  };

  const addEducationRow = () => {
    setEducationList([
      ...educationList,
      { institution: '', degree: '', fieldOfStudy: '', year: '', gpa: '' }
    ]);
  };

  const removeEducationRow = (index) => {
    setEducationList(educationList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');

    const res = await updateProfile({
      name,
      studentDetails: {
        headline,
        bio,
        phone,
        resumeLink,
        resumeText,
        skills,
        education: educationList.filter(e => e.institution && e.degree)
      }
    });

    setSaving(false);
    if (res.success) {
      setFeedback('Profile successfully updated!');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(res.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
          Academic & Professional Profile
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Your skills and credentials power the platform's automatic match-score calculation when applying for internships.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-4">
          <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <Input
            label="Professional Headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Senior CS Student | Full-Stack & Distributed Systems"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
              Short Bio / Statement of Purpose
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell recruiters about your interests, key coursework, and career ambitions..."
              className="w-full px-3 py-2 text-xs rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Skills Tag Manager */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
              Core Technical Skills ({skills.length})
            </h3>
            <span className="text-[11px] text-ink-muted">Used for match-score percentage overlap</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a new skill (e.g. React, MongoDB, Python, Docker)"
              className="flex-1 px-3 py-2 text-xs rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white focus:outline-none focus:border-brand"
            />
            <Button type="button" variant="primary" size="sm" onClick={addSkill}>
              <Plus className="w-4 h-4 mr-1" /> Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-brand text-xs font-semibold bg-blue-50/70 dark:bg-brand-light/30 text-brand dark:text-blue-300 border border-blue-100 dark:border-brand-light/40"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Education Credentials */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand dark:text-accent" />
              Education & Degrees
            </h3>
            <Button type="button" variant="secondary" size="sm" onClick={addEducationRow}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Education
            </Button>
          </div>

          <div className="space-y-4">
            {educationList.map((edu, index) => (
              <div
                key={index}
                className="p-4 rounded-brand border border-border-light dark:border-border-dark bg-bg-light/50 dark:bg-bg-subtleDark/50 space-y-3 relative"
              >
                {educationList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducationRow(index)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="University / Institution"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                  <Input
                    label="Degree Level"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    placeholder="e.g. B.S., M.S., Ph.D."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Field of Study / Major"
                    value={edu.fieldOfStudy}
                    onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                  <Input
                    label="Graduation Year"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(index, 'year', e.target.value)}
                    placeholder="e.g. 2025"
                  />
                  <Input
                    label="Cumulative GPA"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                    placeholder="e.g. 3.90"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Content */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-4">
          <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            Resume Link & Raw Text
          </h3>

          <Input
            label="Resume PDF / Portfolio URL"
            value={resumeLink}
            onChange={(e) => setResumeLink(e.target.value)}
            placeholder="https://yourportfolio.dev/resume.pdf"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1">
              Parsed Resume Plain Text
            </label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste plain text of your resume to enable instant keyword matching against internship postings..."
              className="w-full px-3 py-2 text-xs font-mono rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {feedback && (
          <div className="p-3 rounded-brand bg-teal-50 text-match text-xs font-semibold border border-match/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {feedback}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" variant="accent" size="lg" loading={saving} className="shadow-md">
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
