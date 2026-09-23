import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import User from '../models/User.js';
import { calculateMatchScore } from '../utils/matchCalculator.js';
import { notifyUser } from '../socket/socketHandler.js';
import { sendStatusEmail } from '../config/nodemailer.js';

// @desc    Apply for an internship
// @route   POST /api/applications/apply/:internshipId
// @access  Private (Student)
export const applyForInternship = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { coverNote, customResumeText } = req.body;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found.' });
    }

    if (internship.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This internship is no longer accepting applications.' });
    }

    // Verify application deadline has not expired
    if (internship.deadline && new Date(internship.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The application deadline for this internship has passed.'
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      internship: internshipId,
      student: req.user._id
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted an application for this role.' });
    }

    // Calculate match score
    const studentSkills = req.user.studentDetails?.skills || [];
    const resumeText = customResumeText || req.user.studentDetails?.resumeText || '';
    const matchAnalysis = calculateMatchScore(studentSkills, resumeText, internship.requiredSkills);

    const application = await Application.create({
      internship: internship._id,
      student: req.user._id,
      company: internship.company,
      matchScore: matchAnalysis.matchScore,
      matchedSkills: matchAnalysis.matchedSkills,
      missingSkills: matchAnalysis.missingSkills,
      coverNote: coverNote || '',
      resumeSnapshot: resumeText || req.user.studentDetails?.resumeLink || '',
      status: 'submitted',
      statusHistory: [{
        status: 'submitted',
        updatedAt: new Date(),
        notes: 'Application received'
      }]
    });

    // Increment applicantsCount on the internship
    await Internship.findByIdAndUpdate(internshipId, { $inc: { applicantsCount: 1 } });

    // Notify company in real-time
    await notifyUser({
      userId: internship.company,
      title: 'New Candidate Applied',
      message: `${req.user.name} applied for "${internship.title}" with a ${matchAnalysis.matchScore}% skill match.`,
      type: 'application_received',
      link: `/company/applicants/${internship._id}`,
      metadata: { applicationId: application._id, matchScore: matchAnalysis.matchScore }
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application
    });
  } catch (error) {
    console.error('Error applying:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application.'
    });
  }
};

// @desc    Get student's submitted applications
// @route   GET /api/applications/my-applications
// @access  Private (Student)
export const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'internship',
        select: 'title location locationType stipend stipendType duration deadline status requiredSkills',
        populate: {
          path: 'company',
          select: 'name companyDetails avatar email'
        }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applications.'
    });
  }
};

// @desc    Get applicants for a specific internship, ranked by match score
// @route   GET /api/applications/internship/:internshipId/applicants
// @access  Private (Company or Admin)
export const getInternshipApplicants = async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { status, sortBy = 'matchScore' } = req.query;

    const internship = await Internship.findById(internshipId);
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found.' });
    }

    if (internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view these applicants.' });
    }

    const filter = { internship: internshipId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    let sortOptions = { matchScore: -1 };
    if (sortBy === 'newest') sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') sortOptions = { createdAt: 1 };

    const applicants = await Application.find(filter)
      .populate('student', 'name email avatar studentDetails')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: applicants.length,
      internshipTitle: internship.title,
      requiredSkills: internship.requiredSkills,
      applicants
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve applicants.'
    });
  }
};

// @desc    Update application status (shortlist, reject, accept, interview_scheduled)
// @route   PATCH /api/applications/:id/status
// @access  Private (Company or Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['submitted', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided.' });
    }

    const application = await Application.findById(id)
      .populate('internship', 'title company')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    // Verify company ownership
    if (application.internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application.' });
    }

    application.status = status;
    if (notes) application.statusNotes = notes;
    application.statusHistory.push({
      status,
      updatedAt: new Date(),
      notes: notes || `Status updated to ${status}`
    });

    await application.save();

    // 1. Real-time notification via Socket.io
    const statusTitles = {
      shortlisted: 'Application Shortlisted! 🎉',
      interview_scheduled: 'Interview Invitation 📅',
      accepted: 'Congratulations! Application Accepted 🏆',
      rejected: 'Application Status Update',
      submitted: 'Application Status Reset'
    };

    const statusMessages = {
      shortlisted: `Great news! You have been shortlisted for "${application.internship.title}".`,
      interview_scheduled: `You have received an interview invitation for "${application.internship.title}". Check your schedule!`,
      accepted: `Outstanding! Your application for "${application.internship.title}" has been accepted!`,
      rejected: `Your application status for "${application.internship.title}" has been updated.`,
      submitted: `Your application status for "${application.internship.title}" is in review.`
    };

    await notifyUser({
      userId: application.student._id,
      title: statusTitles[status] || 'Application Status Update',
      message: notes || statusMessages[status],
      type: 'status_change',
      link: '/student/applications',
      metadata: { applicationId: application._id, newStatus: status }
    });

    // 2. Email alert via Nodemailer
    const companyProfile = await User.findById(application.internship.company);
    const companyDisplayName = companyProfile?.companyDetails?.companyName || companyProfile?.name || 'Company';

    sendStatusEmail({
      to: application.student.email,
      studentName: application.student.name,
      internshipTitle: application.internship.title,
      companyName: companyDisplayName,
      newStatus: status,
      notes: notes || ''
    }).catch(err => console.error('Background email dispatch failed:', err.message));

    return res.status(200).json({
      success: true,
      message: `Application marked as ${status}.`,
      application
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update application status.'
    });
  }
};

// @desc    Resume score checker (Feature 5): compares raw resume text against internship skills
// @route   POST /api/applications/check-resume-score
// @access  Private / Authenticated
export const checkResumeScore = async (req, res) => {
  try {
    const { resumeText, internshipId, targetSkills } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: 'Please paste your resume text to evaluate.'
      });
    }

    let requiredSkills = [];
    let internshipTitle = 'Target Role';

    if (internshipId) {
      const internship = await Internship.findById(internshipId);
      if (internship) {
        requiredSkills = internship.requiredSkills;
        internshipTitle = internship.title;
      }
    } else if (Array.isArray(targetSkills) && targetSkills.length > 0) {
      requiredSkills = targetSkills;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please select an internship or provide target skills to compare against.'
      });
    }

    const studentSkills = req.user?.studentDetails?.skills || [];
    const analysis = calculateMatchScore(studentSkills, resumeText, requiredSkills);

    return res.status(200).json({
      success: true,
      internshipTitle,
      ...analysis
    });
  } catch (error) {
    console.error('Resume checker error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze resume.'
    });
  }
};
