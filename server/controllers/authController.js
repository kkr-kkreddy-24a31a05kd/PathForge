import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pathforge_jwt_super_secret_dev_key_2026';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user (Student or Company)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, role, companyDetails, studentDetails } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Security check: Only 'student' and 'company' can be registered through public signup
    const userRole = role === 'company' ? 'company' : 'student';

    const userData = {
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
    };

    if (userRole === 'company') {
      userData.companyDetails = {
        companyName: companyDetails?.companyName || name,
        website: companyDetails?.website || '',
        industry: companyDetails?.industry || 'Technology',
        location: companyDetails?.location || '',
        description: companyDetails?.description || '',
        size: companyDetails?.size || '10-50'
      };
      // Companies start unapproved until verified by admin
      userData.isApproved = false;
    } else if (userRole === 'student') {
      userData.studentDetails = {
        skills: studentDetails?.skills || [],
        resumeLink: studentDetails?.resumeLink || '',
        resumeText: studentDetails?.resumeText || '',
        headline: studentDetails?.headline || 'Undergraduate Student',
        bio: studentDetails?.bio || '',
        education: studentDetails?.education || []
      };
      userData.isApproved = true;
    } else if (userRole === 'admin') {
      userData.isApproved = true;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyDetails: user.companyDetails,
        studentDetails: user.studentDetails
      },
      message: userRole === 'company' 
        ? 'Account registered! Your company is pending admin review.'
        : 'Account created successfully!'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyDetails: user.companyDetails,
        studentDetails: user.studentDetails
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.'
    });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyDetails: user.companyDetails,
        studentDetails: user.studentDetails,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    if (user.role === 'student' && req.body.studentDetails) {
      user.studentDetails = {
        ...user.studentDetails.toObject(),
        ...req.body.studentDetails
      };
    }

    if (user.role === 'company' && req.body.companyDetails) {
      user.companyDetails = {
        ...user.companyDetails.toObject(),
        ...req.body.companyDetails
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        companyDetails: user.companyDetails,
        studentDetails: user.studentDetails
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};
