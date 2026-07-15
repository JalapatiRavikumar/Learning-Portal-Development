// ============================================================
// frontend/src/App.jsx  — Root Application Component
// GVCC Secure Learning Portal | MERN Stack
//
// Architecture:
//   - useBookmarks    → bookmark CRUD + REST API + localStorage fallback
//   - useWatchHistory → progress tracking + REST API sync
//   - useSecurity     → DRM event listeners (blur/tab/PrintScreen)
//   - Header          → sticky nav bar
//   - VideoRoom       → split-screen player + bookmarks
//   - InspectorTab    → live API logs + MongoDB viewer
//   - CodebaseTab     → syntax-highlighted backend file browser
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Clock, Search, ChevronRight, Play } from 'lucide-react';
import api from './api/axiosInstance.js';

// Custom hooks
import { useBookmarks    } from './hooks/useBookmarks.js';
import { useWatchHistory } from './hooks/useWatchHistory.js';
import { useSecurity     } from './hooks/useSecurity.js';

// Components
import Header       from './components/Header.jsx';
import VideoCard    from './components/VideoCard.jsx';
import VideoRoom    from './components/VideoRoom.jsx';
import InspectorTab from './components/InspectorTab.jsx';
import CodebaseTab  from './components/CodebaseTab.jsx';

// ── Fallback seed data (shown when backend is offline) ────────
const FALLBACK_VIDEOS = [
  {
    id: 'vid-1',
    title: 'MERN Stack Architecture',
    category: 'Full Stack Development', duration: 3600,
    videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&w=600&q=80',
    description: 'Learn the complete MERN stack architecture from frontend to backend. Covers how React, Node.js, Express, and MongoDB fit together to form modern full-stack applications.',
    instructor: 'Traversy Media', difficulty: 'Intermediate',
  },
  {
    id: 'vid-2',
    title: 'JWT Authentication Deep-Dive',
    category: 'Backend Security', duration: 2400,
    videoUrl: 'https://www.youtube.com/watch?v=enopDSs3DRw',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    description: 'A deep dive into JSON Web Tokens (JWT). Learn how to implement secure user authentication, token generation, and stateless session management in a Node.js REST API.',
    instructor: 'Traversy Media', difficulty: 'Advanced',
  },
  {
    id: 'vid-3',
    title: 'React Hooks Lifecycle',
    category: 'Frontend UI', duration: 1800,
    videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    description: 'Master the React Hooks lifecycle. Understand how useEffect, useState, and other core hooks manage component state, side effects, and re-renders in functional components.',
    instructor: 'Codevolution', difficulty: 'Intermediate',
  },
  {
    id: 'vid-4',
    title: 'State Synced Video Control Strategies',
    category: 'Frontend UI', duration: 1200,
    videoUrl: 'https://www.youtube.com/watch?v=3gHd5LRO5X8',
    thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80',
    description: 'Learn to build a custom React video player. Covers synchronizing state with HTML5 video properties, managing refs, and building robust playback control interfaces.',
    instructor: 'Web Dev Simplified', difficulty: 'Advanced',
  },
  {
    id: 'vid-5',
    title: 'Advanced Express Middleware',
    category: 'Backend Engineering', duration: 1500,
    videoUrl: 'https://www.youtube.com/watch?v=lY6icfhap2o',
    thumbnail: 'https://images.unsplash.com/photo-1623282033815-40b05d96c903?auto=format&fit=crop&w=600&q=80',
    description: 'Take your Express.js skills to the next level by building advanced custom middleware. Learn how to intercept requests, validate data, and create robust error handling pipelines.',
    instructor: 'Codevolution', difficulty: 'Intermediate',
  },
  {
    id: 'vid-6',
    title: 'Express Rate Limiting',
    category: 'Backend Security', duration: 900,
    videoUrl: 'https://www.youtube.com/watch?v=V3A6L2qM5V4',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    description: 'Protect your APIs from brute force and DDoS attacks by implementing rate limiting in Express. Covers express-rate-limit configuration and best practices for endpoint security.',
    instructor: 'Coder One', difficulty: 'Intermediate',
  }
];

const formatTime = (s) => {
  if (isNaN(s)) return '00:00';
  const h  = Math.floor(s / 3600);
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${ss}` : `${m}:${ss}`;
};

export default function App() {
  // ── Core state ───────────────────────────────────────────────
  const [activeTab,  setActiveTab]  = useState('portal');  // 'portal' | 'inspector' | 'codebase'
  const [portalView, setPortalView] = useState('dashboard'); // 'dashboard' | 'video-room'
  const [user] = useState({ id: 'student-1', name: 'Alex Mercer', email: 'alex.mercer@gvcc.edu', role: 'Premium Student' });

  // ── Videos (fetched from API or fallback) ────────────────────
  const [videosList,     setVideosList]     = useState(FALLBACK_VIDEOS);
  const [selectedVideo,  setSelectedVideo]  = useState(FALLBACK_VIDEOS[0]);
  const [searchQuery,    setSearchQuery]    = useState('');

  // ── API log state ─────────────────────────────────────────────
  const [apiLogs, setApiLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), method: 'SYSTEM', path: 'Initialization', status: 200, detail: 'GVCC MERN Portal initialised. Connecting to MongoDB via Express API…' },
  ]);
  const [securityLogs, setSecurityLogs] = useState([]);

  // ── Bookmark modal state ─────────────────────────────────────
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkForm,      setBookmarkForm]      = useState({ title: '', notes: '', timeStampSeconds: 0 });
  const [editBookmarkId,    setEditBookmarkId]    = useState(null);

  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ── Logger helpers ────────────────────────────────────────────
  const addApiLog = useCallback((method, path, status, detail) => {
    setApiLogs(prev => [
      { timestamp: new Date().toLocaleTimeString(), method, path, status, detail },
      ...prev,
    ].slice(0, 60));
  }, []);

  const addSecurityLog = useCallback((action, detail) => {
    setSecurityLogs(prev => [
      { time: new Date().toLocaleTimeString(), action, detail },
      ...prev,
    ].slice(0, 20));
  }, []);

  // ── Custom hooks ──────────────────────────────────────────────
  const {
    bookmarks,
    fetchBookmarks,
    addBookmark,
    editBookmark,
    removeBookmark,
  } = useBookmarks(addApiLog);

  const {
    watchHistory,
    handleTimeUpdate,
    resumeVideo,
    fetchHistory,
  } = useWatchHistory(addApiLog);

  const {
    isWatermarkEnabled,
    setIsWatermarkEnabled,
    securityViolations,
    isScreenShieldActive,
    shieldReason,
    dismissShield,
  } = useSecurity({ videoRef, addApiLog, addSecurityLog, setIsPlaying });

  // ── Load videos from backend on mount ────────────────────────
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const { data } = await api.get('/videos');
        const vids = data.videos.map(v => ({ ...v, id: v._id }));
        if (vids.length > 0) {
          setVideosList(vids);
          setSelectedVideo(vids[0]);
          addApiLog('GET', '/api/videos', 200, `Loaded ${vids.length} videos from MongoDB`);
        }
      } catch {
        addApiLog('GET', '/api/videos', 503, 'Backend offline — using fallback seed videos');
      }
    };

    loadVideos();
    fetchHistory();
  }, []);

  // ── Select a video → navigate to video-room ──────────────────
  const handleSelectVideo = useCallback((video) => {
    setSelectedVideo(video);
    setPortalView('video-room');
    addApiLog('GET', `/api/videos/${video.id}`, 200, `Loaded: ${video.title}`);

    setTimeout(() => resumeVideo(videoRef, video.id), 200);
  }, [addApiLog, resumeVideo]);

  // ── Video time update (proxied through useWatchHistory) ──────
  const onTimeUpdate = useCallback((playedSeconds) => {
    handleTimeUpdate(selectedVideo.id, playedSeconds, selectedVideo.duration);
  }, [handleTimeUpdate, selectedVideo]);

  // ── Jump to bookmark timestamp ────────────────────────────────
  const handleJumpToBookmark = useCallback((seconds) => {
    if (videoRef.current) {
      if (typeof videoRef.current.seekTo === 'function') {
        videoRef.current.seekTo(seconds, 'seconds');
      } else if (typeof videoRef.current.currentTime !== 'undefined') {
        videoRef.current.currentTime = seconds;
      }
      setIsPlaying(true);
      addApiLog('GET', `/api/bookmarks/jump/${seconds}s`, 200, `Seeked to ${formatTime(seconds)}`);
    }
  }, [addApiLog]);

  // ── Open bookmark modal (new) ────────────────────────────────
  const openNewBookmarkModal = useCallback(() => {
    if (!videoRef.current) return;
    
    let t = 0;
    try {
      if (typeof videoRef.current.getCurrentTime === 'function') {
        t = Math.floor(videoRef.current.getCurrentTime() || 0);
      } else if (typeof videoRef.current.currentTime !== 'undefined') {
        t = Math.floor(videoRef.current.currentTime || 0);
      }
    } catch (err) {
      console.warn("Could not get current time:", err);
    }
    
    setBookmarkForm({ title: `Bookmark at ${formatTime(t)}`, notes: '', timeStampSeconds: t });
    setEditBookmarkId(null);
    setShowBookmarkModal(true);
  }, []);

  // ── Open bookmark modal (edit) ────────────────────────────────
  const openEditBookmarkModal = useCallback((bm) => {
    setBookmarkForm({ title: bm.title, notes: bm.notes || '', timeStampSeconds: bm.timestamp });
    setEditBookmarkId(bm.id);
    setShowBookmarkModal(true);
  }, []);

  // ── Save bookmark (create or update) ─────────────────────────
  const handleSaveBookmark = useCallback(async () => {
    if (editBookmarkId) {
      await editBookmark(editBookmarkId, { title: bookmarkForm.title, notes: bookmarkForm.notes });
    } else {
      await addBookmark({
        videoId:   selectedVideo.id,
        timestamp: bookmarkForm.timeStampSeconds,
        title:     bookmarkForm.title,
        notes:     bookmarkForm.notes,
      });
    }
    setShowBookmarkModal(false);
  }, [editBookmarkId, bookmarkForm, selectedVideo.id, addBookmark, editBookmark]);

  // ── Delete bookmark ───────────────────────────────────────────
  const handleDeleteBookmark = useCallback(async (id) => {
    await removeBookmark(id);
  }, [removeBookmark]);

  // ── Filter videos by search ───────────────────────────────────
  const filteredVideos = videosList.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (v.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      <main className="flex-1 overflow-y-auto">

        {/* ══════════════════════════════════════════════
            TAB 1: STUDENT PORTAL
           ══════════════════════════════════════════════ */}
        {activeTab === 'portal' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* ── DASHBOARD VIEW ───────────────────────── */}
            {portalView === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">

                {/* Hero + Search */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border border-slate-800 p-8 sm:p-10 shadow-2xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.12),transparent_55%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(139,92,246,0.07),transparent_45%)]" />
                  <div className="relative z-10 max-w-2xl space-y-5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 rounded-full">
                      <Sparkles className="w-3 h-3" /> Welcome back, Student
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      Elevate Your Software Engineering{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 text-glow">
                        Mastery
                      </span>
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                      Enter safe learning mode. Lectures are DRM-protected with dynamic watermarking,
                      window-blur guards, and clipboard suppression. Your bookmarks and progress sync
                      to MongoDB via the Express REST API in real time.
                    </p>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {[
                        { label: 'Active Courses',  value: videosList.length,              color: 'text-indigo-400' },
                        { label: 'Bookmarks Saved', value: bookmarks.length,               color: 'text-violet-400' },
                        { label: 'Security Events', value: securityViolations,             color: 'text-rose-400'   },
                        { label: 'Videos in Progress', value: Object.keys(watchHistory).length, color: 'text-amber-400' },
                      ].map(s => (
                        <div key={s.label} className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-xl">
                          <span className={`text-lg font-extrabold ${s.color}`}>{s.value}</span>
                          <span className="text-[10px] text-slate-500 font-medium">{s.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="pt-1 flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          id="course-search"
                          type="text"
                          placeholder="Search courses, instructors, topics…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                        />
                      </div>
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Continue Watching */}
                {Object.entries(watchHistory).some(([, r]) => r.percentage < 95) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-indigo-400" />
                      <h2 className="text-base font-bold text-white tracking-wide">Continue Watching</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(watchHistory)
                        .filter(([, rec]) => rec.percentage < 95)
                        .map(([vidId, rec]) => {
                          const v = videosList.find(x => x.id === vidId);
                          if (!v) return null;
                          return (
                            <div
                              key={vidId}
                              id={`continue-${vidId}`}
                              onClick={() => handleSelectVideo(v)}
                              className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/30 p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5"
                            >
                              <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0">
                                <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center">
                                  <div className="bg-indigo-600 rounded-full p-1.5">
                                    <Play className="w-4 h-4 text-white fill-current" />
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{v.category}</span>
                                <h3 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{v.title}</h3>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  Stopped at {formatTime(rec.lastTime)} · {rec.percentage}% complete
                                </p>
                                <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${rec.percentage}%` }}
                                  />
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 group-hover:translate-x-1 transition-transform" />
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Video Grid */}
                <div className="space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-xl font-bold text-white">Available Lectures</h2>
                      <p className="text-xs text-slate-500 mt-0.5">DRM-protected workspace classes for MERN curriculum</p>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                      {filteredVideos.length} Courses
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredVideos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        record={watchHistory[video.id]}
                        bookmarkCount={bookmarks.filter(bm => bm.videoId === video.id).length}
                        onSelect={handleSelectVideo}
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── VIDEO ROOM VIEW ───────────────────────── */}
            {portalView === 'video-room' && (
              <VideoRoom
                videoRef={videoRef}
                selectedVideo={selectedVideo}
                bookmarks={bookmarks}
                securityViolations={securityViolations}
                isWatermarkEnabled={isWatermarkEnabled}
                setIsWatermarkEnabled={setIsWatermarkEnabled}
                isScreenShieldActive={isScreenShieldActive}
                shieldReason={shieldReason}
                onDismissShield={dismissShield}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                onTimeUpdate={onTimeUpdate}
                onBack={() => {
                  setPortalView('dashboard');
                  addApiLog('GET', '/api/videos', 200, 'Returned to dashboard.');
                }}
                user={user}
                showBookmarkModal={showBookmarkModal}
                bookmarkForm={bookmarkForm}
                editBookmarkId={editBookmarkId}
                onOpenNewBookmark={openNewBookmarkModal}
                onOpenEditBookmark={openEditBookmarkModal}
                onBookmarkFormChange={setBookmarkForm}
                onSaveBookmark={handleSaveBookmark}
                onCloseBookmarkModal={() => setShowBookmarkModal(false)}
                onDeleteBookmark={handleDeleteBookmark}
                onJumpToBookmark={handleJumpToBookmark}
              />
            )}

          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 2: API & DB INSPECTOR
           ══════════════════════════════════════════════ */}
        {activeTab === 'inspector' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <InspectorTab
              apiLogs={apiLogs}
              securityLogs={securityLogs}
              securityViolations={securityViolations}
              bookmarks={bookmarks}
              watchHistory={watchHistory}
              videosList={videosList}
              onClearLogs={() => setApiLogs([
                { timestamp: new Date().toLocaleTimeString(), method: 'SYSTEM', path: 'Cleansed', status: 200, detail: 'Inspector log output cleared.' },
              ])}
            />
          </div>
        )}

        {/* ══════════════════════════════════════════════
            TAB 3: BACKEND CODEBASE
           ══════════════════════════════════════════════ */}
        {activeTab === 'codebase' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <CodebaseTab />
          </div>
        )}

      </main>
    </div>
  );
}
