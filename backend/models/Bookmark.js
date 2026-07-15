// ============================================================
// backend/models/Bookmark.js  — Mongoose Bookmark Schema
// ============================================================
import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'videoId is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },
    timestamp: {
      type: Number,
      required: [true, 'Timestamp (seconds) is required'],
      min: [0, 'Timestamp must be non-negative'],
    },
    title: {
      type: String,
      required: [true, 'Bookmark title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    notes: {
      type: String,
      default: '',
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
  },
  { timestamps: true }
);

// ── Compound index: fetch all bookmarks for a user + video ───
// This is the most common query pattern in the portal
bookmarkSchema.index({ userId: 1, videoId: 1, timestamp: 1 });

export default mongoose.model('Bookmark', bookmarkSchema);
