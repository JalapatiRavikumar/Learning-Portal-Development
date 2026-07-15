// ============================================================
// backend/models/Video.js  — Mongoose Video Schema
// ============================================================
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration (seconds) is required'],
      min: [0, 'Duration must be positive'],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    thumbnail: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    instructor: {
      type: String,
      default: 'GVCC Faculty',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ── Full-text search index on title, description, category ───
videoSchema.index({ title: 'text', description: 'text', category: 'text' });

// ── Compound index: active videos ordered by sequence ────────
videoSchema.index({ isActive: 1, order: 1 });

export default mongoose.model('Video', videoSchema);
