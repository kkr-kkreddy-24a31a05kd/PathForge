import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['submitted', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected'],
    default: 'submitted'
  },
  coverNote: {
    type: String,
    trim: true,
    default: ''
  },
  resumeSnapshot: {
    type: String,
    default: ''
  },
  statusNotes: {
    type: String,
    default: ''
  },
  statusHistory: [{
    status: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

// Ensure a student cannot apply twice to the same internship
applicationSchema.index({ internship: 1, student: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
