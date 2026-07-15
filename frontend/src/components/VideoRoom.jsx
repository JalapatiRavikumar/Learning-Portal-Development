// ============================================================
// frontend/src/components/VideoRoom.jsx
// Split-screen: video player (8 cols) + bookmark panel (4 cols)
// ============================================================
import React, { useRef, useEffect } from 'react';
import { Shield, AlertTriangle, Bookmark, Check } from 'lucide-react';
import SecurityShield from './SecurityShield.jsx';
import BookmarkPanel  from './BookmarkPanel.jsx';
import BookmarkModal  from './BookmarkModal.jsx';
import ReactPlayer    from 'react-player';

const formatTime = (s) => {
  if (isNaN(s)) return '00:00';
  const h  = Math.floor(s / 3600);
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${ss}` : `${m}:${ss}`;
};

export default function VideoRoom({
  videoRef,
  selectedVideo,
  bookmarks,
  securityViolations,
  isWatermarkEnabled,
  setIsWatermarkEnabled,
  isScreenShieldActive,
  shieldReason,
  onDismissShield,
  isPlaying,
  setIsPlaying,
  onTimeUpdate,
  onBack,
  user,
  // Bookmark modal props
  showBookmarkModal,
  bookmarkForm,
  editBookmarkId,
  onOpenNewBookmark,
  onOpenEditBookmark,
  onBookmarkFormChange,
  onSaveBookmark,
  onCloseBookmarkModal,
  onDeleteBookmark,
  onJumpToBookmark,
}) {
  const videoBookmarks = bookmarks.filter(bm => bm.videoId === selectedVideo.id);

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* ── Top Bar ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <button
          id="back-to-dashboard"
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 text-xs font-bold transition-all w-fit"
        >
          ← Back to Workspace
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 live-dot" />
            Security Watchdog Active
          </span>
          <span className="text-[11px] bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg px-2.5 py-1 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Violations: {securityViolations}
          </span>
        </div>
      </div>

      {/* ── 8 + 4 Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* LEFT: Video player + info */}
        <div className="lg:col-span-8 space-y-4">

          {/* Video frame */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl secure-video-container">

            {/* Floating watermark */}
            {isWatermarkEnabled && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                <div className="absolute floating-watermark-animation bg-slate-950/75 border border-slate-700/50 text-slate-400/60 text-[9px] font-mono px-2.5 py-1.5 rounded-lg whitespace-nowrap backdrop-blur-[1px] shadow-xl">
                  🔒 PROTECTED // {user?.email} // IP: 192.168.12.102
                </div>
              </div>
            )}

            {/* DRM Shield overlay */}
            {isScreenShieldActive && (
              <SecurityShield shieldReason={shieldReason} onDismiss={onDismissShield} />
            )}

            <ReactPlayer
              ref={videoRef}
              url={selectedVideo.videoUrl}
              controls
              playing={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onProgress={({ playedSeconds }) => onTimeUpdate(playedSeconds)}
              width="100%"
              height="100%"
              playsInline
            />
          </div>

          {/* Video info card */}
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                  {selectedVideo.category}
                </span>
                <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  {selectedVideo.title}
                </h1>
                <p className="text-[11px] text-slate-500">
                  by{' '}
                  <span className="font-semibold text-slate-400">{selectedVideo.instructor}</span>
                  {' · '}
                  <span className={`font-semibold ${selectedVideo.difficulty === 'Advanced' ? 'text-amber-400' : 'text-sky-400'}`}>
                    {selectedVideo.difficulty}
                  </span>
                </p>
              </div>
              <button
                id="add-bookmark"
                onClick={onOpenNewBookmark}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/30 hover:-translate-y-0.5 shrink-0"
              >
                <Bookmark className="w-3.5 h-3.5" /> Bookmark Current Time
              </button>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/60">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                About This Module
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedVideo.description}</p>
            </div>

            {/* Watermark toggle */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800/60 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-xs font-bold text-slate-200">Dynamic Anti-Photo Watermarking</p>
                  <p className="text-[10px] text-slate-500">Hologram overlay shifts continuously across all frames</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="watermark-toggle"
                  type="checkbox"
                  checked={isWatermarkEnabled}
                  onChange={(e) => setIsWatermarkEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-100 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600 relative" />
              </label>
            </div>
          </div>
        </div>

        {/* RIGHT: Bookmark panel */}
        <div className="lg:col-span-4">
          <BookmarkPanel
            bookmarks={videoBookmarks}
            onJump={onJumpToBookmark}
            onAdd={onOpenNewBookmark}
            onEdit={(bm) => onOpenEditBookmark(bm)}
            onDelete={onDeleteBookmark}
          />
        </div>

      </div>

      {/* Bookmark modal */}
      {showBookmarkModal && (
        <BookmarkModal
          form={bookmarkForm}
          editId={editBookmarkId}
          onChange={onBookmarkFormChange}
          onSave={onSaveBookmark}
          onClose={onCloseBookmarkModal}
        />
      )}

    </div>
  );
}
