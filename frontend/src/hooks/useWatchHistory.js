// ============================================================
// frontend/src/hooks/useWatchHistory.js
// Custom hook: watch progress tracking + REST API sync
// ============================================================
import { useState, useCallback, useRef } from 'react';
import api from '../api/axiosInstance';

const loadFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('gvcc_watch_history')) || {
      'vid-1': { lastTime: 122, maxTime: 122, percentage: 19 },
      'vid-2': { lastTime: 45,  maxTime: 45,  percentage: 10 },
    };
  } catch { return {}; }
};

export const useWatchHistory = (addApiLog) => {
  const [watchHistory, setWatchHistory] = useState(loadFromStorage);
  // Ref to track the last synced second — prevents duplicate API calls
  const lastSyncedSecond = useRef({});

  // ── Handle video time update ──
  const handleTimeUpdate = useCallback((videoId, currentTime, videoDuration) => {
    const current  = Math.floor(currentTime);
    const duration = Math.floor(videoDuration || 1);

    // Throttle: only update every 3 seconds and if the second changed
    if (current % 3 !== 0 || current === 0) return;
    if (lastSyncedSecond.current[videoId] === current) return;
    lastSyncedSecond.current[videoId] = current;

    const percent = Math.min(100, Math.floor((current / duration) * 100));
    const prev    = watchHistory[videoId] || { lastTime: 0, maxTime: 0, percentage: 0 };

    const updated = {
      lastTime:   current,
      maxTime:    Math.max(prev.maxTime, current),
      percentage: Math.max(prev.percentage, percent),
    };

    // Local state update (immediate, no re-render lag)
    setWatchHistory(hist => {
      const next = { ...hist, [videoId]: updated };
      localStorage.setItem('gvcc_watch_history', JSON.stringify(next));
      return next;
    });

    // API sync (fire-and-forget — don't block on this)
    api.put('/users/history', { videoId, ...updated })
      .then(() => addApiLog?.('PUT', '/api/users/history', 200, `Synced: ${videoId} → ${current}s (${percent}%)`))
      .catch(() => addApiLog?.('PUT', '/api/users/history', 503, 'Backend offline — progress saved locally'));

  }, [watchHistory, addApiLog]);

  // ── Seek to resume point when a video is selected ─────────
  const resumeVideo = useCallback((videoRef, videoId) => {
    const record = watchHistory[videoId];
    if (!record || !videoRef?.current) return;
    const resumeTime = record.lastTime;
    if (resumeTime > 2) {
      if (typeof videoRef.current.seekTo === 'function') {
        videoRef.current.seekTo(resumeTime, 'seconds');
      } else if (typeof videoRef.current.currentTime !== 'undefined') {
        videoRef.current.currentTime = resumeTime;
      }
      addApiLog?.('SEEK', `/api/users/history/${videoId}`, 200, `Auto-seek to ${resumeTime}s (resume point)`);
    }
  }, [watchHistory, addApiLog]);

  // ── Load watch history from backend ───────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/users/history');
      // Transform array → keyed object by videoId for O(1) lookup
      const mapped = {};
      data.forEach(rec => {
        const key = rec.videoId?._id || rec.videoId;
        mapped[key] = { lastTime: rec.lastTime, maxTime: rec.maxTime, percentage: rec.percentage };
      });
      setWatchHistory(mapped);
      localStorage.setItem('gvcc_watch_history', JSON.stringify(mapped));
      addApiLog?.('GET', '/api/users/history', 200, `Loaded ${data.length} watch records from MongoDB`);
    } catch {
      addApiLog?.('GET', '/api/users/history', 503, 'Backend offline — using localStorage watch history');
    }
  }, [addApiLog]);

  return { watchHistory, handleTimeUpdate, resumeVideo, fetchHistory };
};
