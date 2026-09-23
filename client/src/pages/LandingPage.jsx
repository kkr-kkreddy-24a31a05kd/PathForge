import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import StatCounter from '../components/common/StatCounter';
import api from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Sparkles,
  Building,
  GraduationCap,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

const LandingPage = () => {
  const [stats, setStats] = useState({
    totalInternships: 48,
    totalCompanies: 24,
    totalStudents: 310,
    placementRate: 88,
  });
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadPlatformData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        if (statsRes.data.success && statsRes.data.stats) {
          setStats(statsRes.data.stats);
        }

        const internshipsRes = await api.get('/internships');
        if (internshipsRes.data.success && internshipsRes.data.internships) {
          setFeaturedInternships(internshipsRes.data.internships.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching landing page data:', error);
      }
    };
    loadPlatformData();
  }, []);

  const handleQuickDemo = async (role) => {
    const creds = {
      student: { email: 'student@pathforge.com', pass: 'password123', redirect: '/student/dashboard' },
      company: { email: 'company@pathforge.com', pass: 'password123', redirect: '/company/dashboard' },
      admin: { email: 'admin@pathforge.com', pass: 'password123', redirect: '/admin/dashboard' }
    };
    const target = creds[role];
    if (target) {
      const res = await login(target.email, target.pass);
      if (res.success) {
        navigate(target.redirect);
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-ink-body dark:text-ink-bodyDark flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border-light dark:border-border-dark bg-white dark:bg-bg-cardDark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Academia-Industry Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-brand bg-brand/5 dark:bg-brand-light/20 text-brand dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-brand/10">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Verified Academia-Industry Placement Platform
            </div>

            {/* Real Bold Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-ink-heading dark:text-ink-headingDark tracking-tight leading-[1.12]">
              Where Academic Rigor Meets High-Impact Industry Careers.
            </h1>

            <p className="mt-6 text-base sm:text-lg text-ink-body dark:text-ink-bodyDark max-w-2xl mx-auto leading-relaxed">
              PathForge bridges university talent and vetted enterprise teams through algorithmic skill-match scoring, verified credentials, and automated interview scheduling.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate('/browse')}
                className="w-full sm:w-auto shadow-md"
              >
                Browse Active Internships
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto"
              >
                Create Scholar Profile
              </Button>
            </div>

            {/* Quick 1-Click Demo Selector */}
            <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark max-w-lg mx-auto">
              <p className="text-xs uppercase tracking-wider font-semibold text-ink-muted dark:text-ink-mutedDark mb-3">
                Experience Demo Accounts (1-Click Login):
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('student')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark hover:border-accent text-ink-heading dark:text-white transition-colors"
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('company')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark hover:border-accent text-ink-heading dark:text-white transition-colors"
                >
                  🏢 Company
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark hover:border-accent text-ink-heading dark:text-white transition-colors"
                >
                  👑 Admin
                </button>
              </div>
            </div>
          </div>

          {/* Live Stat Strip (Single count-up animation on page load) */}
          <div className="mt-14 max-w-5xl mx-auto rounded-brand bg-bg-light dark:bg-bg-subtleDark p-6 sm:p-8 border border-border-light dark:border-border-dark shadow-subtle">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-border-light dark:divide-border-dark">
              <div className="pt-2 md:pt-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-brand dark:text-white">
                  <StatCounter end={stats.totalInternships || 48} />+
                </p>
                <p className="text-xs sm:text-sm font-medium text-ink-body dark:text-ink-bodyDark mt-1">
                  Active Internships
                </p>
              </div>

              <div className="pt-4 md:pt-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-brand dark:text-white">
                  <StatCounter end={stats.totalCompanies || 24} />
                </p>
                <p className="text-xs sm:text-sm font-medium text-ink-body dark:text-ink-bodyDark mt-1">
                  Vetted Enterprise Partners
                </p>
              </div>

              <div className="pt-4 md:pt-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-brand dark:text-white">
                  <StatCounter end={stats.totalStudents || 310} />+
                </p>
                <p className="text-xs sm:text-sm font-medium text-ink-body dark:text-ink-bodyDark mt-1">
                  Enrolled Candidates
                </p>
              </div>

              <div className="pt-4 md:pt-0">
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold font-heading text-match">
                  <StatCounter end={stats.placementRate || 88} suffix="%" />
                </p>
                <p className="text-xs sm:text-sm font-medium text-ink-body dark:text-ink-bodyDark mt-1">
                  Interview Match Rate
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Internships Preview */}
      <section className="py-16 md:py-20 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                Opportunities In Spotlight
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-ink-heading dark:text-ink-headingDark mt-1">
                Featured Technical Internships
              </h2>
            </div>
            <Link
              to="/browse"
              className="text-sm font-semibold text-brand dark:text-accent flex items-center gap-1 hover:underline"
            >
              View all listings <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredInternships.map((job) => (
              <div
                key={job._id}
                className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark flex flex-col justify-between shadow-subtle"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold uppercase text-brand dark:text-blue-300">
                      {job.company?.companyDetails?.companyName || job.company?.name || 'Enterprise Partner'}
                    </span>
                    <Badge variant="open" size="sm">
                      {job.locationType}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-ink-heading dark:text-ink-headingDark mb-2 leading-snug">
                    {job.title}
                  </h3>
                  <p className="text-xs text-ink-body dark:text-ink-bodyDark line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {(job.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="skill" size="sm">
                        {skill}
                      </Badge>
                    ))}
                    {(job.requiredSkills || []).length > 3 && (
                      <span className="text-[10px] text-ink-muted self-center">
                        +{job.requiredSkills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-ink-heading dark:text-white font-semibold">
                    <DollarSign className="w-3.5 h-3.5 text-accent" />
                    <span>${job.stipend} / {job.stipendType}</span>
                  </div>
                  <div className="flex items-center gap-1 text-ink-muted dark:text-ink-mutedDark">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="features" className="py-16 md:py-20 bg-white dark:bg-bg-cardDark border-t border-border-light dark:border-border-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Engineered for Every Stakeholder
            </h2>
            <p className="mt-3 text-sm text-ink-body dark:text-ink-bodyDark">
              PathForge unifies academia and industry into a transparent, data-driven recruitment pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Student Pillar */}
            <div className="p-6 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark">
              <div className="w-10 h-10 rounded-brand bg-brand text-accent flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-ink-heading dark:text-ink-headingDark mb-2">
                For Students & Scholars
              </h3>
              <p className="text-sm text-ink-body dark:text-ink-bodyDark mb-4 leading-relaxed">
                Build verified skill portfolios, calculate live keyword resume alignment before applying, and receive instant interview proposals.
              </p>
              <ul className="text-xs space-y-2 text-ink-body dark:text-ink-bodyDark">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Algorithmic Resume Keyword Checker</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Real-time status alerts via WebSockets</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Direct interview time-slot selection</li>
              </ul>
            </div>

            {/* Company Pillar */}
            <div className="p-6 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark">
              <div className="w-10 h-10 rounded-brand bg-brand text-accent flex items-center justify-center mb-4">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-ink-heading dark:text-ink-headingDark mb-2">
                For Technology Companies
              </h3>
              <p className="text-sm text-ink-body dark:text-ink-bodyDark mb-4 leading-relaxed">
                Post high-impact internships, review applicants ranked automatically by skill match score, and propose multiple interview slots with zero friction.
              </p>
              <ul className="text-xs space-y-2 text-ink-body dark:text-ink-bodyDark">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Match-score ranked candidate pipeline</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Recharts recruitment funnel analytics</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Integrated interview coordination calendar</li>
              </ul>
            </div>

            {/* Admin Pillar */}
            <div className="p-6 rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark">
              <div className="w-10 h-10 rounded-brand bg-brand text-accent flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-ink-heading dark:text-ink-headingDark mb-2">
                For Academic Directors
              </h3>
              <p className="text-sm text-ink-body dark:text-ink-bodyDark mb-4 leading-relaxed">
                Review and verify participating company profiles, monitor institutional placement velocities, and assess in-demand curricular skills.
              </p>
              <ul className="text-xs space-y-2 text-ink-body dark:text-ink-bodyDark">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Enterprise company approval gatekeeper</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Macro-level curriculum skill analytics</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-match" /> Comprehensive placement tracking metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-brand text-gray-400 text-xs border-t border-brand-hover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-sm text-white">PathForge</span>
            <span>&copy; {new Date().getFullYear()} Academia-Industry Platform. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/browse" className="hover:text-white transition-colors">Opportunities</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
