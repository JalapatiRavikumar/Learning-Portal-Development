// ============================================================
// backend/routes/videoRoutes.js
// ============================================================
import express from 'express';
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
} from '../controllers/videoController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public — students can browse videos without logging in
router.get('/',    getVideos);
router.get('/:id', getVideoById);

// Admin-only mutations
router.post('/',    protect, restrictTo('admin'), createVideo);
router.put('/:id',  protect, restrictTo('admin'), updateVideo);

export default router;
