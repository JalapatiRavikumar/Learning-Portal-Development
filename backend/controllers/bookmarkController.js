// ============================================================
// backend/controllers/bookmarkController.js  — Bookmark CRUD
// ============================================================
import Bookmark from '../models/Bookmark.js';
import Video from '../models/Video.js';

// ── GET /api/bookmarks  — Get bookmarks for authenticated user
// Optional ?videoId=xxx filter
export const getBookmarks = async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.videoId) {
      filter.videoId = req.query.videoId;
    }

    const bookmarks = await Bookmark.find(filter)
      .populate('videoId', 'title thumbnail')
      .sort({ timestamp: 1 });

    res.json({ count: bookmarks.length, bookmarks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/bookmarks  — Create a new bookmark ─────────────
export const createBookmark = async (req, res) => {
  try {
    const { videoId, timestamp, title, notes } = req.body;

    if (!videoId || timestamp === undefined || !title) {
      return res.status(400).json({
        message: 'videoId, timestamp, and title are all required.',
      });
    }

    // Verify the video exists
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      videoId,
      timestamp,
      title: title.trim(),
      notes: notes || '',
    });

    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/bookmarks/:id  — Update bookmark title / notes ──
export const updateBookmark = async (req, res) => {
  try {
    const { title, notes } = req.body;

    // Ensure the bookmark belongs to the requesting user
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        ...(title && { title: title.trim() }),
        ...(notes !== undefined && { notes }),
      },
      { new: true, runValidators: true }
    );

    if (!bookmark) {
      return res.status(404).json({
        message: 'Bookmark not found or you do not have permission to modify it.',
      });
    }

    res.json(bookmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/bookmarks/:id  — Delete bookmark ─────────────
export const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Ownership check
    });

    if (!bookmark) {
      return res.status(404).json({
        message: 'Bookmark not found or you do not have permission to delete it.',
      });
    }

    res.json({ message: 'Bookmark deleted successfully.', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
