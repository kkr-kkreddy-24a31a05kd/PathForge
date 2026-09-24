import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
import { useTheme } from '../../context/ThemeContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, CheckCircle2, Award } from 'lucide-react';

const CompanyAnalytics = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/company');
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load company analytics:', err);
      setError('Unable to aggregate recruitment analytics. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto py-12 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-4 border-brand border-t-accent rounded-full mb-3" />
        <p className="text-xs text-ink-muted dark:text-ink-mutedDark">Computing live recruitment analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="p-4 rounded-brand bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchAnalytics()} className="underline font-semibold ml-2">Retry</button>
        </div>
      </div>
    );
  }

  const applicationsTimeline = data?.applicationsOverTime || [];
  const topSkills = data?.topSkills || [];
  const funnel = data?.placementFunnel || [];

  const chartColors = {
    grid: isDark ? '#24334F' : '#E5E8EF',
    axisText: isDark ? '#94A3B8' : '#8D96A5',
    applicationsLine: isDark ? '#60A5FA' : '#14213D',
    barFill: isDark ? '#3B82F6' : '#14213D',
    tooltipStyle: {
      backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
      borderColor: isDark ? '#24334F' : '#E5E8EF',
      color: isDark ? '#F1F5F9' : '#14213D',
      borderRadius: '6px',
      fontSize: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    },
    legendWrapper: {
      fontSize: '12px',
      paddingTop: '10px',
      color: isDark ? '#F1F5F9' : '#14213D'
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          Enterprise Recruitment Analytics
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Real-time metrics on candidate volume, skill demand distribution, and hiring funnel conversion rates.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Total Applicants
          </span>
          <p className="text-2xl font-bold font-heading text-ink-heading dark:text-ink-headingDark">
            {data?.totalApplicants || 0}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            Across {data?.totalPostings || 0} postings
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Avg Skill Match
          </span>
          <p className="text-2xl font-bold font-heading text-match">
            {data?.avgMatchScore || 82}%
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            Candidate profile alignment
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Interviews Scheduled
          </span>
          <p className="text-2xl font-bold font-heading text-accent">
            {data?.interviewsScheduled || 0}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            Coordinated via PathForge
          </span>
        </div>

        <div className="bg-white dark:bg-bg-cardDark p-5 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-ink-mutedDark block mb-1">
            Offers Extended
          </span>
          <p className="text-2xl font-bold font-heading text-match">
            {data?.offersExtended || 0}
          </p>
          <span className="text-[11px] text-ink-body dark:text-ink-bodyDark">
            Accepted placements
          </span>
        </div>
      </div>

      {/* Chart 1: Applications Over Time (Line Chart) */}
      <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Applications Inflow Timeline (Line Chart)
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Daily applicant submissions and shortlisting velocity over the past 14 days
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={applicationsTimeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="date" stroke={chartColors.axisText} fontSize={11} />
              <YAxis stroke={chartColors.axisText} fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={chartColors.tooltipStyle} />
              <Legend wrapperStyle={chartColors.legendWrapper} />
              <Line
                type="monotone"
                dataKey="applications"
                name="Applications"
                stroke={chartColors.applicationsLine}
                strokeWidth={2.5}
                dot={{ r: 3, fill: chartColors.applicationsLine }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="shortlisted"
                name="Shortlisted"
                stroke="#FCA311"
                strokeWidth={2}
                dot={{ r: 3, fill: '#FCA311' }}
              />
              <Line
                type="monotone"
                dataKey="accepted"
                name="Accepted"
                stroke="#2EC4B6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2EC4B6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Skills Demand & Funnel Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 2: Top Skills In Demand (Bar Chart) */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Top In-Demand Skills (Bar Chart)
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Most requested technical skills across your organization's postings
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke={chartColors.grid} />
                <XAxis type="number" stroke={chartColors.axisText} fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke={chartColors.axisText} fontSize={11} width={80} />
                <Tooltip contentStyle={chartColors.tooltipStyle} />
                <Bar dataKey="count" name="Times Required" fill={chartColors.barFill} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Candidate Placement Funnel (Funnel/Bar Chart) */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Recruitment Conversion Funnel (Funnel Chart)
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Progress from initial submission to final placed candidate
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="stage" stroke={chartColors.axisText} fontSize={11} />
                <YAxis stroke={chartColors.axisText} fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={chartColors.tooltipStyle} />
                <Bar dataKey="count" name="Candidates in Stage" fill="#2EC4B6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyAnalytics;
