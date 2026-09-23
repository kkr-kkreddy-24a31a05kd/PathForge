import mongoose from 'mongoose';

const internshipSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide an internship title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a detailed internship description'],
    trim: true
  },
  requiredSkills: {
    type: [String],
    required: [true, 'Please specify at least one required skill'],
    validate: {
      validator: function(skills) {
        return skills && skills.length > 0;
      },
      message: 'Please provide at least one required skill'
    }
  },
  location: {
    type: String,
    required: [true, 'Please provide a location (e.g., Remote, San Francisco, Bangalore)'],
    trim: true
  },
  locationType: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    default: 'Remote'
  },
  stipend: {
    type: Number,
    required: [true, 'Please provide a stipend amount (enter 0 for unpaid)'],
    min: 0
  },
  stipendType: {
    type: String,
    enum: ['month', 'week', 'lump-sum', 'unpaid'],
    default: 'month'
  },
  currency: {
    type: String,
    default: '$'
  },
  duration: {
    type: String,
    default: '3 Months'
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify an application deadline']
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'paused'],
    default: 'open'
  },
  openings: {
    type: Number,
    default: 1
  },
  applicantsCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

internshipSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

const Internship = mongoose.model('Internship', internshipSchema);
export default Internship;
