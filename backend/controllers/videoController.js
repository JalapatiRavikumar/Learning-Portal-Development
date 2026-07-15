// ============================================================
// backend/controllers/videoController.js  — Video CRUD
// ============================================================
import Video from '../models/Video.js';

// ── GET /api/videos  — List all active videos ────────────────
export const getVideos = async (req, res) => {
  try {
    const { search, category, difficulty } = req.query;

    // Build dynamic query filter
    const filter = { isActive: true };

    if (category)   filter.category   = new RegExp(category, 'i');
    if (difficulty) filter.difficulty = difficulty;

    if (search) {
      filter.$text = { $search: search };
    }

    const videos = await Video.find(filter)
      .select('-__v')
      .sort({ order: 1, createdAt: 1 });

    res.json({ count: videos.length, videos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/videos/:id  — Single video detail ───────────────
export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select('-__v');

    if (!video || !video.isActive) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    // Increment view count on each fetch
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/videos  — Create video (admin only) ────────────
export const createVideo = async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/videos/:id  — Update video (admin only) ─────────
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!video) return res.status(404).json({ message: 'Video not found.' });
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
