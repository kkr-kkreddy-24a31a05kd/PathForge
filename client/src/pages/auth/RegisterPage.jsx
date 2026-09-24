import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { GraduationCap, Building, Plus, X, ArrowRight, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student details
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(['React', 'Node.js', 'JavaScript']);
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');

  // Company details
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Enterprise Software & Cloud');
  const [website, setWebsite] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setError('Please provide your name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (role === 'company' && website.trim() && !website.includes('.')) {
      setError('Please enter a valid website URL.');
      return;
    }

    setLoading(true);

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      password,
      role,
    };

    if (role === 'student') {
      payload.studentDetails = {
        skills,
        education: institution && degree ? [{ institution, degree }] : []
      };
    } else {
      payload.companyDetails = {
        companyName: companyName || name,
        industry,
        website
      };
    }

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-brand bg-brand flex items-center justify-center text-accent font-heading font-bold text-xl shadow-sm">
            <span>P</span>
            <span className="text-white text-xs -ml-0.5">F</span>
          </div>
          <span className="font-heading font-bold text-2xl text-brand dark:text-white tracking-tight">
            Path<span className="text-accent">Forge</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
          Create Your PathForge Account
        </h2>
        <p className="mt-1 text-xs text-ink-body dark:text-ink-bodyDark">
          Choose your role to get started with tailored tools and workflows
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white dark:bg-bg-cardDark py-8 px-6 sm:px-10 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-bg-light dark:bg-bg-subtleDark rounded-brand border border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-brand text-xs font-semibold transition-all ${
                role === 'student'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student / Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('company')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-brand text-xs font-semibold transition-all ${
                role === 'company'
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-body dark:text-ink-bodyDark hover:text-brand dark:hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              Company / Recruiter
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={role === 'company' ? 'Representative Name' : 'Full Name'}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'company' ? 'Sarah Jenkins' : 'Alex Rivera'}
              />
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@institution.edu"
              />
            </div>

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••••••• (minimum 6 characters)"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-ink-muted hover:text-ink-heading dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Student Specific Fields */}
            {role === 'student' && (
              <div className="space-y-4 pt-2 border-t border-border-light dark:border-border-dark">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Initial Profile & Skills
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="University / Institution"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. Stanford University"
                  />
                  <Input
                    label="Degree & Major"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.S. Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
                    Core Technical Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSkill(e);
                        }
                      }}
                      placeholder="Add a skill (e.g., Python, Docker)"
                      className="flex-1 px-3 py-2 text-xs rounded-brand border border-border-light dark:border-border-dark bg-white dark:bg-bg-cardDark text-ink-heading dark:text-white"
                    />
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-brand text-xs font-medium bg-blue-50/60 dark:bg-brand-light/30 text-brand dark:text-blue-300 border border-blue-100 dark:border-brand-light/40"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Company Specific Fields */}
            {role === 'company' && (
              <div className="space-y-4 pt-2 border-t border-border-light dark:border-border-dark">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  Organization Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Cloud Systems"
                  />
                  <Input
                    label="Primary Industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. AI, Fintech, Robotics"
                  />
                </div>
                <Input
                  label="Company Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://company.example.com"
                />
                <div className="p-3 rounded-brand bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                  ℹ️ Note: Company accounts undergo verification by the PathForge administration board before publishing internship listings.
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                variant="accent"
                className="w-full font-semibold"
                loading={loading}
              >
                Create Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted dark:text-ink-mutedDark">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand dark:text-accent hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
