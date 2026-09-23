import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// @desc    Get aggregated analytics for Admin dashboard
// @route   GET /api/analytics/admin
// @access  Private (Admin)
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Applications over time (grouped by month/day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const applications = await Application.find({ createdAt: { $gte: thirtyDaysAgo } })
      .select('createdAt status');

    const timelineMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timelineMap[key] = { date: key, applications: 0, shortlisted: 0, accepted: 0 };
    }

    applications.forEach(app => {
      const key = new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (timelineMap[key]) {
        timelineMap[key].applications += 1;
        if (app.status === 'shortlisted') timelineMap[key].shortlisted += 1;
        if (app.status === 'accepted') timelineMap[key].accepted += 1;
      }
    });

    const applicationsOverTime = Object.values(timelineMap);

    // 2. Top in-demand skills across all posted internships
    const internships = await Internship.find({}).select('requiredSkills');
    const skillCounts = {};
    internships.forEach(item => {
      (item.requiredSkills || []).forEach(skill => {
        const canonical = skill.trim();
        skillCounts[canonical] = (skillCounts[canonical] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 3. Placement Funnel
    const [submittedCount, shortlistedCount, interviewCount, acceptedCount, rejectedCount] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ status: { $in: ['shortlisted', 'interview_scheduled', 'accepted'] } }),
      Application.countDocuments({ status: { $in: ['interview_scheduled', 'accepted'] } }),
      Application.countDocuments({ status: 'accepted' }),
      Application.countDocuments({ status: 'rejected' })
    ]);

    const placementFunnel = [
      { stage: 'Applied', count: submittedCount, fill: '#14213D' },
      { stage: 'Shortlisted', count: shortlistedCount, fill: '#3E5C76' },
      { stage: 'Interviews', count: interviewCount, fill: '#FCA311' },
      { stage: 'Placed / Offers', count: acceptedCount, fill: '#2EC4B6' }
    ];

    // 4. Role distribution
    const [studentsTotal, companiesTotal] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'company' })
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        applicationsOverTime,
        topSkills,
        placementFunnel,
        funnelStats: {
          submitted: submittedCount,
          shortlisted: shortlistedCount,
          interviews: interviewCount,
          accepted: acceptedCount,
          rejected: rejectedCount
        },
        userDistribution: [
          { name: 'Students', value: studentsTotal, fill: '#14213D' },
          { name: 'Companies', value: companiesTotal, fill: '#FCA311' }
        ]
      }
    });
  } catch (error) {
    console.error('Error computing admin analytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute admin analytics.' });
  }
};

// @desc    Get aggregated analytics for Company dashboard
// @route   GET /api/analytics/company
// @access  Private (Company)
export const getCompanyAnalytics = async (req, res) => {
  try {
    const companyId = req.user._id;

    // Company's internships
    const companyInternships = await Internship.find({ company: companyId }).select('_id title requiredSkills');
    const internshipIds = companyInternships.map(i => i._id);

    // Applications over time for this company
    const applications = await Application.find({ internship: { $in: internshipIds } })
      .select('createdAt status matchScore');

    const timelineMap = {};
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timelineMap[key] = { date: key, applications: 0, shortlisted: 0, accepted: 0 };
    }

    let totalScoreSum = 0;
    applications.forEach(app => {
      const key = new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (timelineMap[key]) {
        timelineMap[key].applications += 1;
        if (app.status === 'shortlisted' || app.status === 'interview_scheduled') timelineMap[key].shortlisted += 1;
        if (app.status === 'accepted') timelineMap[key].accepted += 1;
      }
      totalScoreSum += (app.matchScore || 0);
    });

    const applicationsOverTime = Object.values(timelineMap);
    const avgMatchScore = applications.length > 0 ? Math.round(totalScoreSum / applications.length) : 0;

    // Top in-demand skills in company's postings
    const skillCounts = {};
    companyInternships.forEach(item => {
      (item.requiredSkills || []).forEach(skill => {
        const canonical = skill.trim();
        skillCounts[canonical] = (skillCounts[canonical] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Company specific funnel
    const submittedCount = applications.length;
    const shortlistedCount = applications.filter(a => ['shortlisted', 'interview_scheduled', 'accepted'].includes(a.status)).length;
    const interviewCount = applications.filter(a => ['interview_scheduled', 'accepted'].includes(a.status)).length;
    const acceptedCount = applications.filter(a => a.status === 'accepted').length;

    const placementFunnel = [
      { stage: 'Applied', count: submittedCount, fill: '#14213D' },
      { stage: 'Shortlisted', count: shortlistedCount, fill: '#3E5C76' },
      { stage: 'Interviews', count: interviewCount, fill: '#FCA311' },
      { stage: 'Hired', count: acceptedCount, fill: '#2EC4B6' }
    ];

    return res.status(200).json({
      success: true,
      analytics: {
        applicationsOverTime,
        topSkills,
        placementFunnel,
        avgMatchScore,
        totalPostings: companyInternships.length,
        totalApplicants: submittedCount,
        interviewsScheduled: interviewCount,
        offersExtended: acceptedCount
      }
    });
  } catch (error) {
    console.error('Error computing company analytics:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute company analytics.' });
  }
};
