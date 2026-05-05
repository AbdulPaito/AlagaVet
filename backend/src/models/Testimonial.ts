import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  location: string;
  rating: number;
  message: string;
  avatarUrl?: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

const TestimonialSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
TestimonialSchema.index({ rating: 1 });
TestimonialSchema.index({ isApproved: 1 });
TestimonialSchema.index({ isFeatured: 1 });
TestimonialSchema.index({ createdAt: -1 });

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
