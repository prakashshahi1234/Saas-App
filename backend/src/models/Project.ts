import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  tags: string[];
  budget?: number;
  teamMembers: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  duration: number;
  daysRemaining: number;
  updateProgress(progress: number): Promise<IProject>;
}

const projectSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'planning',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot exceed 100'],
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  teamMembers: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project duration in days
projectSchema.virtual('duration').get(function(this: IProject): number {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

// Virtual for days remaining
projectSchema.virtual('daysRemaining').get(function(this: IProject): number {
  if (this.endDate) {
    const today = new Date();
    const diffTime = this.endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  return 0;
});

// Index for better query performance
projectSchema.index({ userId: 1, status: 1 });
projectSchema.index({ userId: 1, startDate: -1 });
projectSchema.index({ status: 1 });

// Pre-save middleware to validate dates
projectSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

const Project = mongoose.model<IProject>('Project', projectSchema);

export default Project; 