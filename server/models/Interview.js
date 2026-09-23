import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proposedSlots: [{
    type: Date,
    required: true
  }],
  selectedSlot: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['proposed', 'confirmed', 'completed', 'cancelled'],
    default: 'proposed'
  },
  meetingLink: {
    type: String,
    default: 'https://meet.google.com/pf-interview'
  },
  interviewType: {
    type: String,
    enum: ['Technical', 'Behavioral', 'Hiring Manager', 'Final Round'],
    default: 'Technical'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Interview = mongoose.model('Interview', interviewSchema);
export default Interview;
