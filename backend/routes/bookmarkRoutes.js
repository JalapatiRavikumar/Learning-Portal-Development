// ============================================================
// backend/routes/bookmarkRoutes.js
// ============================================================
import express from 'express';
import {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All bookmark routes require authentication
router.use(protect);

router.get('/',      getBookmarks);   // GET    /api/bookmarks?videoId=xxx
router.post('/',     createBookmark); // POST   /api/bookmarks
router.put('/:id',   updateBookmark); // PUT    /api/bookmarks/:id
router.delete('/:id', deleteBookmark); // DELETE /api/bookmarks/:id

export default router;
