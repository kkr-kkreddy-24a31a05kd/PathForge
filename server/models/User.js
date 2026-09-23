import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, default: '' },
  year: { type: String, default: '' },
  gpa: { type: String, default: '' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name or company representative name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    default: 'student',
    required: true
  },
  // Company specific fields
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== 'company'; // Students and Admins approved by default; Companies require admin approval
    }
  },
  companyDetails: {
    companyName: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    description: { type: String, trim: true },
    size: { type: String, default: '10-50' }
  },
  // Student specific fields
  studentDetails: {
    skills: {
      type: [String],
      default: []
    },
    resumeLink: { type: String, trim: true, default: '' },
    resumeText: { type: String, default: '' },
    headline: { type: String, default: 'Aspiring Software Professional' },
    bio: { type: String, default: '' },
    phone: { type: String, default: '' },
    education: {
      type: [educationSchema],
      default: []
    }
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
