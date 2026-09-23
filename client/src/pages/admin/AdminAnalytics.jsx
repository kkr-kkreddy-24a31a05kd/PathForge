import React, { useEffect, useState } from 'react';
import api from '../../api/axiosClient';
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
  Legend,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Users, Award, ShieldCheck } from 'lucide-react';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/analytics/admin');
      if (res.data.success) {
        setData(res.data.analytics);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError('Unable to aggregate platform analytics. Please check your connection.');
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
        <p className="text-xs text-ink-muted dark:text-ink-mutedDark">Computing platform-wide analytics...</p>
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
  const userDist = data?.userDistribution || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold font-heading text-ink-heading dark:text-ink-headingDark flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-accent" />
          Platform-Wide Placement & Skill Analytics
        </h2>
        <p className="text-xs text-ink-body dark:text-ink-bodyDark">
          Institutional intelligence on university hiring velocity, curriculum skill demand, and candidate funnel progression.
        </p>
      </div>

      {/* Chart 1: Platform Applications Over Time (Line Chart) */}
      <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Total Platform Applications & Placement Trajectory (Line Chart)
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Daily application submissions, shortlists, and accepted offers over the last 30 days
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={applicationsTimeline} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EF" />
              <XAxis dataKey="date" stroke="#8D96A5" fontSize={11} />
              <YAxis stroke="#8D96A5" fontSize={11} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#14213D',
                  borderColor: '#14213D',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="applications"
                name="Applications"
                stroke="#14213D"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#14213D' }}
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
        {/* Chart 2: Top Skills In Demand Across All Roles (Bar Chart) */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Top In-Demand Industry Skills (Bar Chart)
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Frequency of technical requirements in posted opportunities
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#E5E8EF" />
                <XAxis type="number" stroke="#8D96A5" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#8D96A5" fontSize={11} width={85} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14213D',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Internships Requiring Skill" fill="#14213D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Placement Funnel (Funnel/Bar Chart) */}
        <div className="bg-white dark:bg-bg-cardDark p-6 rounded-brand border border-border-light dark:border-border-dark shadow-subtle">
          <div className="mb-4">
            <h3 className="text-base font-bold font-heading text-ink-heading dark:text-ink-headingDark">
              Macro Placement Conversion Funnel (Funnel Chart)
            </h3>
            <p className="text-xs text-ink-body dark:text-ink-bodyDark">
              Platform progression from candidate application to confirmed offer
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EF" />
                <XAxis dataKey="stage" stroke="#8D96A5" fontSize={11} />
                <YAxis stroke="#8D96A5" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#14213D',
                    color: '#fff',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" name="Candidates in Stage" radius={[4, 4, 0, 0]}>
                  {funnel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#14213D'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
