// ============================================================
// frontend/src/components/BookmarkPanel.jsx
// Scrollable right-side bookmark list with jump, edit, delete
// ============================================================
import React from 'react';
import { Bookmark, Play, Edit3, Trash2, Plus } from 'lucide-react';

const formatTime = (s) => {
  if (isNaN(s)) return '00:00';
  const h  = Math.floor(s / 3600);
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${m}:${ss}` : `${m}:${ss}`;
};

export default function BookmarkPanel({ bookmarks, onJump, onAdd, onEdit, onDelete }) {
  return (
    <div
      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col"
      style={{ height: '540px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Bookmarks</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold px-2 py-0.5 rounded-full">
            {bookmarks.length} saved
          </span>
          <button
            id="add-bookmark-panel"
            onClick={onAdd}
            className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition-all"
            title="Add bookmark at current time"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
        {bookmarks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400">No bookmarks yet</h4>
              <p className="text-[10px] text-slate-600 leading-relaxed mt-1 max-w-[190px]">
                Pause on anything important and click Bookmark Current Time.
              </p>
            </div>
            <button
              onClick={onAdd}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-xl text-[10px] font-bold transition-all"
            >
              + Add First Bookmark
            </button>
          </div>
        ) : (
          bookmarks
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((bm) => (
              <div
                key={bm.id}
                id={`bookmark-item-${bm.id}`}
                onClick={() => onJump(bm.timestamp)}
                className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/50 hover:border-indigo-500/30 p-3 rounded-xl cursor-pointer transition-all hover:shadow-md flex items-start gap-3"
              >
                {/* Timestamp badge */}
                <div className="bg-indigo-600 text-white font-extrabold text-[9px] font-mono px-2 py-1 rounded-md shrink-0 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" />
                  {formatTime(bm.timestamp)}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <h4 className="text-[11px] font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                    {bm.title}
                  </h4>
                  {bm.notes && (
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">{bm.notes}</p>
                  )}
                </div>

                {/* Controls — visible on hover */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(bm); }}
                    className="p-1 text-slate-500 hover:text-indigo-400 rounded transition-colors"
                    title="Edit bookmark"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(bm.id); }}
                    className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Footer note */}
      <div className="pt-2 border-t border-slate-800/60 shrink-0">
        <p className="text-[9px] text-slate-600 leading-relaxed">
          ⚡ <span className="font-semibold text-slate-500">MERN REST Sync:</span>{' '}
          Bookmarks sync to MongoDB via Express REST API.
        </p>
      </div>
    </div>
  );
}
