// ============================================================
// backend/controllers/userController.js  — Auth & Profile
// ============================================================
import User from '../models/User.js';
import WatchHistory from '../models/WatchHistory.js';
import Video from '../models/Video.js';
import { generateToken } from '../middleware/authMiddleware.js';

// ── POST /api/users/register ──────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, role: role || 'student' });
    const token = generateToken(user._id);

    res.status(201).json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── POST /api/users/login ─────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.json({
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/users/profile ────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json({
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/users/history  — Upsert watch progress record ───
export const upsertWatchHistory = async (req, res) => {
  try {
    const { videoId, lastTime, maxTime, percentage } = req.body;

    if (!videoId) return res.status(400).json({ message: 'videoId is required.' });

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found.' });

    const record = await WatchHistory.findOneAndUpdate(
      { userId: req.user._id, videoId },
      {
        lastTime,
        maxTime,
        percentage,
        completed: percentage >= 95,
        $inc: { watchCount: 0 }, // Don't increment on every sync
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/users/history  — Fetch all watch records for user
export const getWatchHistory = async (req, res) => {
  try {
    const history = await WatchHistory.find({ userId: req.user._id })
      .populate('videoId', 'title thumbnail category duration')
      .sort({ updatedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
