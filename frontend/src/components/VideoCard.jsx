// ============================================================
// frontend/src/components/VideoCard.jsx
// ============================================================
import React from 'react';
import { Play, Shield, Bookmark, ChevronRight } from 'lucide-react';

const formatTime = (s) => {
  if (isNaN(s)) return '00:00';
  const h  = Math.floor(s / 3600);
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${ss}` : `${m}:${ss}`;
};

export default function VideoCard({ video, record, bookmarkCount, onSelect }) {
  return (
    <div
      id={`video-card-${video.id}`}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/30 flex flex-col"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-slate-950 shrink-0">
        <img
          src={video.thumbnail}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="flex items-center gap-1 text-[9px] bg-red-500/15 text-red-400 border border-red-500/25 font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
            <Shield className="w-2.5 h-2.5" /> DRM Secured
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${
            video.difficulty === 'Advanced'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
              : 'bg-sky-500/15 text-sky-400 border border-sky-500/25'
          }`}>
            {video.difficulty}
          </span>
        </div>

        {/* Duration */}
        <span className="absolute bottom-3 right-3 text-[11px] bg-slate-950/90 font-bold text-slate-200 px-2 py-1 rounded-lg border border-slate-800">
          {formatTime(video.duration)}
        </span>

        {/* Hover play overlay */}
        <div
          onClick={() => onSelect(video)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/50 cursor-pointer"
        >
          <div className="p-4 bg-indigo-600 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{video.category}</span>
            <span className="text-[10px] text-slate-500">{video.instructor}</span>
          </div>
          <h3
            onClick={() => onSelect(video)}
            className="text-sm font-extrabold text-white leading-snug hover:text-indigo-300 cursor-pointer transition-colors"
          >
            {video.title}
          </h3>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{video.description}</p>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800/60 space-y-3">
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3 h-3 text-indigo-400" />
              {bookmarkCount} Bookmarks
            </span>
            <span>{record ? `${record.percentage}% Complete` : 'Not Started'}</span>
          </div>

          {record && (
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${record.percentage}%` }}
              />
            </div>
          )}

          <button
            id={`play-${video.id}`}
            onClick={() => onSelect(video)}
            className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all flex items-center justify-center gap-2"
          >
            {record?.percentage > 0 ? 'Resume Session' : 'Start Learning'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
