// ============================================================
// backend/models/WatchHistory.js  — Mongoose Watch Progress Schema
// ============================================================
import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'videoId is required'],
    },
    // Last playhead position when the user stopped watching
    lastTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    // The furthest point the user has ever reached (for progress bar)
    maxTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Percentage complete 0–100 (derived, but stored for quick display)
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // Mark as fully completed once percentage >= 95
    completed: {
      type: Boolean,
      default: false,
    },
    // How many times has the user started watching this video
    watchCount: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// ── Unique constraint: one record per user-video pair ────────
watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });

export default mongoose.model('WatchHistory', watchHistorySchema);
