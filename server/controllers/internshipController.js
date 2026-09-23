import Internship from '../models/Internship.js';
import Application from '../models/Application.js';
import { calculateMatchScore } from '../utils/matchCalculator.js';

// @desc    Get all active internships with search & filtering
// @route   GET /api/internships
// @access  Public / Authenticated
export const getInternships = async (req, res) => {
  try {
    const { skill, location, minStipend, maxStipend, search, status = 'open' } = req.query;

    const query = {};
    if (status !== 'all') {
      query.status = status;
    }

    if (location && location !== 'all') {
      query.location = { $regex: location, $options: 'i' };
    }

    if (skill && skill !== 'all') {
      query.requiredSkills = { $elemMatch: { $regex: skill, $options: 'i' } };
    }

    if (minStipend || maxStipend) {
      query.stipend = {};
      if (minStipend) query.stipend.$gte = Number(minStipend);
      if (maxStipend) query.stipend.$lte = Number(maxStipend);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { requiredSkills: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    const internships = await Internship.find(query)
      .populate('company', 'name email companyDetails avatar')
      .sort({ createdAt: -1 });

    // If a student user is querying, attach matchScore and application status to each listing
    let enrichedInternships = internships.map(item => item.toObject());

    if (req.user && req.user.role === 'student') {
      const studentSkills = req.user.studentDetails?.skills || [];
      const resumeText = req.user.studentDetails?.resumeText || '';

      // Check existing applications by this student
      const userApplications = await Application.find({
        student: req.user._id,
        internship: { $in: internships.map(i => i._id) }
      }).select('internship status matchScore');

      const appMap = new Map();
      userApplications.forEach(app => {
        appMap.set(app.internship.toString(), {
          hasApplied: true,
          applicationStatus: app.status,
          appliedMatchScore: app.matchScore
        });
      });

      enrichedInternships = enrichedInternships.map(internship => {
        const matchInfo = calculateMatchScore(studentSkills, resumeText, internship.requiredSkills);
        const existingApp = appMap.get(internship._id.toString());

        return {
          ...internship,
          matchScore: existingApp ? existingApp.appliedMatchScore : matchInfo.matchScore,
          matchedSkills: matchInfo.matchedSkills,
          missingSkills: matchInfo.missingSkills,
          hasApplied: !!existingApp,
          applicationStatus: existingApp ? existingApp.applicationStatus : null
        };
      });
    }

    return res.status(200).json({
      success: true,
      count: enrichedInternships.length,
      internships: enrichedInternships
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve internships.'
    });
  }
};

// @desc    Get single internship by ID
// @route   GET /api/internships/:id
// @access  Public / Authenticated
export const getInternshipById = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .populate('company', 'name email companyDetails avatar');

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship opportunity not found.'
      });
    }

    let result = internship.toObject();

    if (req.user && req.user.role === 'student') {
      const studentSkills = req.user.studentDetails?.skills || [];
      const resumeText = req.user.studentDetails?.resumeText || '';
      const matchInfo = calculateMatchScore(studentSkills, resumeText, internship.requiredSkills);

      const existingApp = await Application.findOne({
        student: req.user._id,
        internship: internship._id
      });

      result.matchScore = existingApp ? existingApp.matchScore : matchInfo.matchScore;
      result.matchedSkills = matchInfo.matchedSkills;
      result.missingSkills = matchInfo.missingSkills;
      result.recommendation = matchInfo.recommendation;
      result.hasApplied = !!existingApp;
      result.applicationStatus = existingApp ? existingApp.status : null;
      result.applicationId = existingApp ? existingApp._id : null;
    }

    return res.status(200).json({
      success: true,
      internship: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve internship.'
    });
  }
};

// @desc    Create a new internship opportunity
// @route   POST /api/internships
// @access  Private (Company only, isApproved === true)
export const createInternship = async (req, res) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      location,
      locationType,
      stipend,
      stipendType,
      currency,
      duration,
      deadline,
      openings
    } = req.body;

    if (!title || !description || !requiredSkills || !location || stipend === undefined || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory fields: title, description, requiredSkills, location, stipend, and deadline.'
      });
    }

    // Ensure requiredSkills is an array of strings
    const skillsArray = Array.isArray(requiredSkills) 
      ? requiredSkills.map(s => s.trim()).filter(Boolean)
      : requiredSkills.split(',').map(s => s.trim()).filter(Boolean);

    if (skillsArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one required skill.'
      });
    }

    let normalizedLocationType = 'Remote';
    if (locationType) {
      const lt = locationType.toLowerCase();
      if (lt === 'hybrid') normalizedLocationType = 'Hybrid';
      else if (lt === 'on-site' || lt === 'onsite') normalizedLocationType = 'On-site';
      else normalizedLocationType = 'Remote';
    }

    let normalizedStipendType = 'month';
    if (stipendType) {
      const st = stipendType.toLowerCase();
      if (st === 'monthly' || st === 'month') normalizedStipendType = 'month';
      else if (st === 'weekly' || st === 'week') normalizedStipendType = 'week';
      else if (st === 'lump-sum' || st === 'fixed') normalizedStipendType = 'lump-sum';
      else if (st === 'unpaid') normalizedStipendType = 'unpaid';
    }

    const internship = await Internship.create({
      company: req.user._id,
      title,
      description,
      requiredSkills: skillsArray,
      location,
      locationType: normalizedLocationType,
      stipend: Number(stipend),
      stipendType: normalizedStipendType,
      currency: currency || '$',
      duration: duration || '3 Months',
      deadline: new Date(deadline),
      openings: openings ? Number(openings) : 1
    });

    return res.status(201).json({
      success: true,
      message: 'Internship posted successfully!',
      internship
    });
  } catch (error) {
    console.error('Error creating internship:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to post internship.'
    });
  }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Company owner or Admin)
export const updateInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Check ownership
    if (internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this internship.'
      });
    }

    const updated = await Internship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      success: true,
      message: 'Internship updated successfully',
      internship: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update internship'
    });
  }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Company owner or Admin)
export const deleteInternship = async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    if (internship.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this internship.'
      });
    }

    await Internship.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ internship: req.params.id });

    return res.status(200).json({
      success: true,
      message: 'Internship and associated applications removed.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete internship'
    });
  }
};

// @desc    Get all internships posted by current company
// @route   GET /api/internships/company/my-postings
// @access  Private (Company)
export const getCompanyPostings = async (req, res) => {
  try {
    const postings = await Internship.find({ company: req.user._id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: postings.length,
      internships: postings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve company postings'
    });
  }
};
