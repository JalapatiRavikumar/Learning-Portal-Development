// ============================================================
// frontend/src/hooks/useBookmarks.js
// Custom hook: bookmark state + REST API calls with fallback
// ============================================================
import { useState, useCallback } from 'react';
import api from '../api/axiosInstance';

// Local-storage fallback seed (used when backend is offline)
const SEED_BOOKMARKS = [
  { id: 'bmark-1', videoId: 'vid-1', userId: 'student-1', timestamp: 122, title: 'Auth Header Setup',     notes: 'Review this for custom express authentication checks.' },
  { id: 'bmark-2', videoId: 'vid-1', userId: 'student-1', timestamp: 345, title: 'JWT Expiry Strategy',   notes: 'Explanation on how refresh tokens issue new access tokens.' },
  { id: 'bmark-3', videoId: 'vid-2', userId: 'student-1', timestamp: 88,  title: 'Explain Query Analyzer', notes: "Use db.collection.explain('executionStats') to examine index hits." },
];

const loadFromStorage = () => {
  try { return JSON.parse(localStorage.getItem('gvcc_bookmarks')) || SEED_BOOKMARKS; }
  catch { return SEED_BOOKMARKS; }
};

export const useBookmarks = (addApiLog) => {
  const [bookmarks, setBookmarks] = useState(loadFromStorage);
  const [loading, setLoading] = useState(false);

  // ── Fetch all bookmarks (with optional videoId filter) ────
  const fetchBookmarks = useCallback(async (videoId = null) => {
    try {
      setLoading(true);
      const params = videoId ? { videoId } : {};
      const { data } = await api.get('/bookmarks', { params });
      // Normalise: backend returns { bookmarks: [...] }
      const normalized = data.bookmarks.map(bm => ({
        id:        bm._id,
        videoId:   bm.videoId?._id || bm.videoId,
        userId:    bm.userId,
        timestamp: bm.timestamp,
        title:     bm.title,
        notes:     bm.notes || '',
      }));
      setBookmarks(normalized);
      localStorage.setItem('gvcc_bookmarks', JSON.stringify(normalized));
      addApiLog?.('GET', '/api/bookmarks', 200, `Fetched ${normalized.length} bookmarks from MongoDB`);
    } catch {
      // Backend offline — use cached localStorage data
      addApiLog?.('GET', '/api/bookmarks', 503, 'Backend offline — using localStorage cache');
    } finally {
      setLoading(false);
    }
  }, [addApiLog]);

  // ── Create bookmark ────────────────────────────────────────
  const addBookmark = useCallback(async ({ videoId, timestamp, title, notes }) => {
    // Optimistic local update first
    const tempId = `temp-${Date.now()}`;
    const temp = { id: tempId, videoId, userId: 'local', timestamp, title, notes };
    setBookmarks(prev => {
      const next = [...prev, temp];
      localStorage.setItem('gvcc_bookmarks', JSON.stringify(next));
      return next;
    });

    try {
      const { data } = await api.post('/bookmarks', { videoId, timestamp, title, notes });
      const saved = { id: data._id, videoId: data.videoId, userId: data.userId, timestamp: data.timestamp, title: data.title, notes: data.notes || '' };
      setBookmarks(prev => {
        const next = prev.map(bm => bm.id === tempId ? saved : bm);
        localStorage.setItem('gvcc_bookmarks', JSON.stringify(next));
        return next;
      });
      addApiLog?.('POST', '/api/bookmarks', 201, `Saved bookmark at ${timestamp}s → "${title}"`);
      return saved;
    } catch {
      addApiLog?.('POST', '/api/bookmarks', 503, 'Backend offline — bookmark saved locally only');
      return temp;
    }
  }, [addApiLog]);

  // ── Update bookmark ────────────────────────────────────────
  const editBookmark = useCallback(async (id, { title, notes }) => {
    // Optimistic update
    setBookmarks(prev => {
      const next = prev.map(bm => bm.id === id ? { ...bm, title, notes } : bm);
      localStorage.setItem('gvcc_bookmarks', JSON.stringify(next));
      return next;
    });

    try {
      await api.put(`/bookmarks/${id}`, { title, notes });
      addApiLog?.('PUT', `/api/bookmarks/${id}`, 200, `Updated bookmark → "${title}"`);
    } catch {
      addApiLog?.('PUT', `/api/bookmarks/${id}`, 503, 'Backend offline — updated locally only');
    }
  }, [addApiLog]);

  // ── Delete bookmark ────────────────────────────────────────
  const removeBookmark = useCallback(async (id) => {
    setBookmarks(prev => {
      const next = prev.filter(bm => bm.id !== id);
      localStorage.setItem('gvcc_bookmarks', JSON.stringify(next));
      return next;
    });

    try {
      await api.delete(`/bookmarks/${id}`);
      addApiLog?.('DELETE', `/api/bookmarks/${id}`, 200, 'Bookmark deleted from MongoDB');
    } catch {
      addApiLog?.('DELETE', `/api/bookmarks/${id}`, 503, 'Backend offline — deleted locally only');
    }
  }, [addApiLog]);

  return { bookmarks, loading, fetchBookmarks, addBookmark, editBookmark, removeBookmark };
};
