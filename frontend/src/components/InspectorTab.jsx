// ============================================================
// frontend/src/components/InspectorTab.jsx
// Live API log terminal + MongoDB collection viewer
// ============================================================
import React from 'react';
import { Database, RefreshCw, Shield, Bookmark, Video, Clock, User } from 'lucide-react';

const METHOD_COLORS = {
  GET:      'text-emerald-400',
  POST:     'text-indigo-400',
  PUT:      'text-amber-400',
  DELETE:   'text-red-400',
  SHIELD:   'text-violet-400',
  SECURITY: 'text-rose-400',
  SEEK:     'text-sky-400',
  SYSTEM:   'text-slate-400',
};

export default function InspectorTab({
  apiLogs,
  securityLogs,
  securityViolations,
  bookmarks,
  watchHistory,
  videosList,
  onClearLogs,
}) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── API Log Terminal ──────────────────────────── */}
        <div
          className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col"
          style={{ height: '680px' }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-xs font-bold text-slate-300 font-mono">live_api_log.stream</span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">● LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-mono">{apiLogs.length} entries</span>
              <button
                id="clear-api-logs"
                onClick={onClearLogs}
                className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg transition-all"
              >
                <RefreshCw className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1 terminal-texture" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {apiLogs.map((log, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 text-[11px] py-1.5 px-2 rounded-lg ${i === 0 ? 'bg-slate-900/60 border border-slate-800/60' : ''}`}
              >
                <span className="text-slate-600 shrink-0 w-16 text-[10px]">{log.timestamp}</span>
                <span className={`font-extrabold shrink-0 w-16 text-[10px] ${METHOD_COLORS[log.method] || 'text-slate-400'}`}>
                  {log.method}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                  log.status < 300 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {log.status}
                </span>
                <span className="text-slate-400 font-mono text-[10px] shrink-0 max-w-[130px] truncate">{log.path}</span>
                <span className="text-slate-500 text-[10px] flex-1">{log.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────── */}
        <div className="space-y-5">

          {/* MongoDB Collections */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">MongoDB Collections</h3>
            </div>
            {[
              { name: 'videos',        docs: videosList.length,              icon: Video,    color: 'indigo' },
              { name: 'bookmarks',     docs: bookmarks.length,               icon: Bookmark, color: 'violet' },
              { name: 'users',         docs: 1,                              icon: User,     color: 'emerald' },
              { name: 'watch_history', docs: Object.keys(watchHistory).length, icon: Clock,    color: 'amber'  },
            ].map(col => (
              <div key={col.name} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800/60 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-${col.color}-500/10 border border-${col.color}-500/20`}>
                    <col.icon className={`w-3.5 h-3.5 text-${col.color}-400`} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300 font-mono">{col.name}</p>
                    <p className="text-[9px] text-slate-600">collection</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-slate-200">{col.docs}</p>
                  <p className="text-[9px] text-slate-600">documents</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security Events */}
          <div
            className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 flex flex-col"
            style={{ maxHeight: '300px' }}
          >
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Security Events</h3>
              </div>
              <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2 py-0.5 rounded-full">
                {securityViolations} violations
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {securityLogs.length === 0 ? (
                <div className="py-6 text-center">
                  <Shield className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-600">No security events yet.</p>
                </div>
              ) : (
                securityLogs.map((log, i) => (
                  <div key={i} className="p-2.5 bg-rose-500/5 border border-rose-500/15 rounded-xl">
                    <div className="flex justify-between items-start">
                      <p className="text-[10px] font-bold text-rose-400">{log.action}</p>
                      <span className="text-[9px] text-slate-600 font-mono">{log.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{log.detail}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Document Viewer Row ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-bold text-slate-300 font-mono">db.bookmarks.find()</span>
            </div>
            <span className="text-[10px] text-slate-500">{bookmarks.length} docs</span>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-[10px] text-slate-400 leading-6 space-y-1" style={{ maxHeight: '200px', fontFamily: "'JetBrains Mono', monospace" }}>
            {bookmarks.length === 0
              ? <p className="text-slate-600 italic">No bookmarks in collection.</p>
              : bookmarks.map((bm, i) => (
                  <div key={i} className="hover:text-slate-300 transition-colors">
                    {'{ '}
                    <span className="text-violet-400">_id</span>: "<span className="text-amber-400">{bm.id?.slice(-8)}</span>",{' '}
                    <span className="text-violet-400">videoId</span>: "<span className="text-emerald-400">{bm.videoId}</span>",{' '}
                    <span className="text-violet-400">timestamp</span>: <span className="text-sky-400">{bm.timestamp}s</span>,{' '}
                    <span className="text-violet-400">title</span>: "<span className="text-orange-400">{bm.title}</span>"
                    {' }'}
                  </div>
                ))
            }
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300 font-mono">db.watch_history.find()</span>
            </div>
            <span className="text-[10px] text-slate-500">{Object.keys(watchHistory).length} docs</span>
          </div>
          <div className="p-4 overflow-y-auto font-mono text-[10px] text-slate-400 leading-6 space-y-1" style={{ maxHeight: '200px', fontFamily: "'JetBrains Mono', monospace" }}>
            {Object.entries(watchHistory).map(([vidId, rec], i) => (
              <div key={i} className="hover:text-slate-300 transition-colors">
                {'{ '}
                <span className="text-amber-400">videoId</span>: "<span className="text-emerald-400">{vidId}</span>",{' '}
                <span className="text-amber-400">lastTime</span>: <span className="text-sky-400">{rec.lastTime}s</span>,{' '}
                <span className="text-amber-400">progress</span>: <span className="text-violet-400">{rec.percentage}%</span>
                {' }'}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
