import Interview from '../models/Interview.js';
import Application from '../models/Application.js';
import Internship from '../models/Internship.js';
import { notifyUser } from '../socket/socketHandler.js';

// @desc    Company proposes interview time slots for an application
// @route   POST /api/interviews/propose
// @access  Private (Company or Admin)
export const proposeInterview = async (req, res) => {
  try {
    const { applicationId, proposedSlots, meetingLink, interviewType, notes } = req.body;

    if (!applicationId || !proposedSlots || !Array.isArray(proposedSlots) || proposedSlots.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the application ID and at least one proposed date/time slot.'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('internship')
      .populate('student', 'name email');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (application.internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to schedule interviews for this role.' });
    }

    // Check if an existing interview is already open
    let interview = await Interview.findOne({
      application: applicationId,
      status: { $in: ['proposed', 'confirmed'] }
    });

    if (interview) {
      interview.proposedSlots = proposedSlots.map(d => new Date(d));
      interview.meetingLink = meetingLink || interview.meetingLink;
      interview.interviewType = interviewType || interview.interviewType;
      interview.notes = notes || interview.notes;
      interview.status = 'proposed';
      interview.selectedSlot = null;
      await interview.save();
    } else {
      interview = await Interview.create({
        application: applicationId,
        internship: application.internship._id,
        company: req.user._id,
        student: application.student._id,
        proposedSlots: proposedSlots.map(d => new Date(d)),
        meetingLink: meetingLink || 'https://meet.google.com/pathforge-room',
        interviewType: interviewType || 'Technical',
        notes: notes || '',
        status: 'proposed'
      });
    }

    // Update application status
    application.status = 'interview_scheduled';
    application.statusHistory.push({
      status: 'interview_scheduled',
      updatedAt: new Date(),
      notes: `Company proposed ${proposedSlots.length} interview time slot(s).`
    });
    await application.save();

    // Real-time notification to the student
    await notifyUser({
      userId: application.student._id,
      title: 'Interview Invitation Received! 📅',
      message: `The team for "${application.internship.title}" proposed ${proposedSlots.length} interview time slots. Please select your preferred time.`,
      type: 'interview',
      link: '/student/interviews',
      metadata: { interviewId: interview._id, applicationId: application._id }
    });

    return res.status(201).json({
      success: true,
      message: 'Interview invitation sent to candidate successfully!',
      interview
    });
  } catch (error) {
    console.error('Error proposing interview:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to propose interview.'
    });
  }
};

// @desc    Student confirms an interview time slot
// @route   PATCH /api/interviews/:id/confirm
// @access  Private (Student)
export const confirmInterviewSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedSlot } = req.body;

    if (!selectedSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please choose one of the proposed time slots.'
      });
    }

    const interview = await Interview.findById(id)
      .populate('internship', 'title')
      .populate('company', 'name email companyDetails')
      .populate('student', 'name email');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found.' });
    }

    if (interview.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to confirm this interview.' });
    }

    interview.selectedSlot = new Date(selectedSlot);
    interview.status = 'confirmed';
    await interview.save();

    // Notify company in real-time
    await notifyUser({
      userId: interview.company._id,
      title: 'Interview Confirmed! 🤝',
      message: `${req.user.name} confirmed interview time slot: ${new Date(selectedSlot).toLocaleString()} for "${interview.internship.title}".`,
      type: 'interview',
      link: '/company/interviews',
      metadata: { interviewId: interview._id, slot: selectedSlot }
    });

    return res.status(200).json({
      success: true,
      message: 'Interview confirmed! An invitation has been added to your calendar schedule.',
      interview
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm interview slot.'
    });
  }
};

// @desc    Get upcoming interviews for logged in user (student or company)
// @route   GET /api/interviews/upcoming
// @access  Private
export const getUpcomingInterviews = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'company') {
      query.company = req.user._id;
    }

    const interviews = await Interview.find(query)
      .populate('internship', 'title location stipend')
      .populate('company', 'name email companyDetails')
      .populate('student', 'name email avatar studentDetails')
      .sort({ selectedSlot: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interviews.'
    });
  }
};
