// ============================================================
// frontend/src/components/BookmarkModal.jsx
// ============================================================
import React from 'react';
import { Bookmark, X, Check, Clock } from 'lucide-react';

const formatTime = (s) => {
  if (isNaN(s)) return '00:00';
  const m  = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
};

export default function BookmarkModal({ form, editId, onChange, onSave, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/30 rounded-xl flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {editId ? 'Edit Bookmark' : 'Save New Bookmark'}
              </h3>
              <p className="text-[10px] text-slate-500">
                {editId ? 'Update title and study notes' : `At timestamp: ${formatTime(form.timeStampSeconds)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Bookmark Title *
            </label>
            <input
              id="bookmark-title-input"
              type="text"
              value={form.title}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="e.g. JWT refresh token explained"
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Study Notes
            </label>
            <textarea
              id="bookmark-notes-input"
              value={form.notes}
              onChange={(e) => onChange({ ...form, notes: e.target.value })}
              placeholder="Add notes to remember why this moment is important…"
              rows={4}
              className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-2.5 text-sm border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none transition-all"
            />
          </div>

          {!editId && (
            <div className="flex items-center gap-2.5 p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-xs text-slate-400">
                Saving at{' '}
                <span className="text-indigo-400 font-bold font-mono">
                  {formatTime(form.timeStampSeconds)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 transition-all"
          >
            Cancel
          </button>
          <button
            id="save-bookmark-btn"
            onClick={onSave}
            disabled={!form.title.trim()}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {editId ? 'Save Changes' : 'Save Bookmark'}
          </button>
        </div>

      </div>
    </div>
  );
}
