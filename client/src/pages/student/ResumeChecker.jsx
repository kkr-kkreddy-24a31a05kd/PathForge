import React, { useState, useEffect } from 'react';
import api from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import MatchScoreBadge from '../../components/common/MatchScoreBadge';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Briefcase,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

const ResumeChecker = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [selectedInternshipId, setSelectedInternshipId] = useState('');
  const [resumeText, setResumeText] = useState(user?.studentDetails?.resumeText || '');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const res = await api.get('/internships');
        if (res.data.success && res.data.internships.length > 0) {
          setInternships(res.data.internships);
          setSelectedInternshipId(res.data.internships[0]._id);
        }
      } catch (err) {
        console.error('Error fetching internships:', err);
      }
    };
    fetchInternships();
  }, []);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!resumeText.trim()) {
      setError('Please paste your resume text to evaluate keyword alignment.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/applications/check-resume-score', {
        resumeText,
        internshipId: selectedInternshipId
      });

      if (res.data.success) {
        setAnalysisResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume match score.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleResume = (type) => {
    if (type === 'fullstack') {
      setResumeText(`ALEX RIVERA
Software Systems Engineering Student
Stanford University | B.S. Computer Science | GPA: 3.89

CORE TECHNICAL SKILLS:
- Languages & Frameworks: React, Node.js, Express, JavaScript, TypeScript, HTML5, CSS3, Tailwind CSS, Python
- Databases & Systems: MongoDB, PostgreSQL, Redis, RESTful APIs, Git, Docker, Linux
- Projects:
  1. Distributed Task Orchestrator (React, Node.js, MongoDB): Developed a real-time team workflow tool serving 10,000 requests/day.
  2. Cloud Metric Visualizer (React, Tailwind CSS, TypeScript): Built interactive dashboards with WebSockets and dynamic charts.`);
    } else {
      setResumeText(`SARAH CHEN
Machine Learning & Data Science Researcher
Carnegie Mellon University | M.S. Intelligent Information Systems | GPA: 3.94

CORE SKILLS:
- AI & Deep Learning: Python, PyTorch, TensorFlow, Machine Learning, Scikit-Learn, Pandas, NumPy, SQL, FastAPI
- Projects:
  1. Multi-modal Transformer Fine-tuning (Python, PyTorch): Optimized transformer architectures for scientific document extraction.`);
    }
  };

  const selectedJob = internships.find(j => j._id === selectedInternshipId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          Resume Keyword Alignment & Match Score Checker
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark mt-1">
          Paste your resume text below and compare keyword density directly against real enterprise requirements to optimize your match score before applying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Form (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-4">
            {/* Target Job Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark mb-1.5">
                Select Target Opportunity
              </label>
              <select
                value={selectedInternshipId}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white focus:outline-none focus:border-brand"
              >
                {internships.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} — {job.company?.companyDetails?.companyName || job.company?.name} ({job.location})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Required Skills Preview */}
            {selectedJob && (
              <div className="p-3 rounded-brand bg-bg-light dark:bg-bg-subtleDark border border-border-light dark:border-border-dark">
                <span className="text-[10px] uppercase font-semibold text-ink-muted dark:text-ink-mutedDark block mb-1">
                  Required Role Skills ({selectedJob.requiredSkills?.length || 0}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedJob.requiredSkills || []).map((s, idx) => (
                    <Badge key={idx} variant="skill" size="sm">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-heading dark:text-ink-headingDark">
                  Paste Resume Content
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadSampleResume('fullstack')}
                    className="text-[11px] text-brand dark:text-accent font-semibold hover:underline"
                  >
                    Sample Full-Stack
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => loadSampleResume('ml')}
                    className="text-[11px] text-brand dark:text-accent font-semibold hover:underline"
                  >
                    Sample ML
                  </button>
                </div>
              </div>

              <textarea
                rows={12}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your education, skills, projects, and work experience text here..."
                className="w-full px-3 py-2 text-xs font-mono rounded-brand border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-subtleDark text-ink-heading dark:text-white focus:outline-none focus:border-brand"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-brand bg-red-50 text-red-700 text-xs">
                {error}
              </div>
            )}

            <Button
              variant="accent"
              className="w-full font-semibold shadow-md"
              loading={loading}
              onClick={handleAnalyze}
            >
              Analyze Resume Keyword Alignment <Sparkles className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Right: Results Analysis Card (1 col) */}
        <div className="lg:col-span-1">
          {analysisResult ? (
            <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle space-y-6 sticky top-20 animate-in fade-in duration-200">
              <div>
                <span className="text-[10px] uppercase font-semibold text-accent block">
                  Analysis Outcome
                </span>
                <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
                  {analysisResult.internshipTitle}
                </h3>
              </div>

              {/* Match Score Display */}
              <MatchScoreBadge
                score={analysisResult.matchScore}
                size="lg"
                matchedCount={analysisResult.matchedSkills?.length}
                totalCount={analysisResult.totalRequired}
              />

              {/* Matched Keywords */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-match mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Matched Keywords ({analysisResult.matchedSkills?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysisResult.matchedSkills?.length === 0 ? (
                    <span className="text-xs text-ink-muted">No keyword overlap detected.</span>
                  ) : (
                    analysisResult.matchedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-brand bg-teal-50 dark:bg-match/15 text-match border border-match/30 font-semibold"
                      >
                        ✓ {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              {analysisResult.missingSkills?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    Missing Required Keywords ({analysisResult.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.missingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-brand bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-3.5 rounded-brand bg-bg-light dark:bg-bg-subtleDark border border-border-light dark:border-border-dark text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-ink-heading dark:text-ink-headingDark">
                  <Lightbulb className="w-3.5 h-3.5 text-accent" />
                  Optimization Recommendation:
                </div>
                <p className="text-ink-body dark:text-ink-bodyDark leading-relaxed">
                  {analysisResult.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-bg-cardDark p-8 rounded-brand border border-border-light dark:border-border-dark text-center text-xs text-ink-muted dark:text-ink-mutedDark space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-accent" />
              <p className="font-semibold text-ink-heading dark:text-ink-headingDark">
                Instant Keyword Match Analysis
              </p>
              <p>
                Click "Analyze Resume Keyword Alignment" to calculate exact keyword density, matched technical terms, and missing credentials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeChecker;
