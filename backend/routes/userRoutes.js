// ============================================================
// backend/routes/userRoutes.js
// ============================================================
import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  upsertWatchHistory,
  getWatchHistory,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Auth endpoints (public) ───────────────────────────────────
router.post('/register', registerUser);
router.post('/login',    loginUser);

// ── Protected user endpoints ──────────────────────────────────
router.get('/profile',  protect, getUserProfile);

// Watch history — PUT to upsert progress, GET to fetch all
router.put('/history',  protect, upsertWatchHistory);
router.get('/history',  protect, getWatchHistory);

export default router;
