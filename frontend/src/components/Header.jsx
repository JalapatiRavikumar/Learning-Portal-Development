// ============================================================
// frontend/src/components/Header.jsx
// ============================================================
import React from 'react';
import { BookOpen, Video, Database, FileCode, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'portal',    label: 'Student Portal',    Icon: Video    },
  { id: 'inspector', label: 'API & DB Inspector', Icon: Database },
  { id: 'codebase',  label: 'Backend Codebase',  Icon: FileCode },
];

export default function Header({ activeTab, setActiveTab, user }) {
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'GV';

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-4">

        {/* ── Logo ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-lg shadow-indigo-900/40">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-widest text-sm bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400">
                GVCC LEARNING
              </span>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                MERN
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
              Learning Portal Development
            </p>
          </div>
        </div>

        {/* ── Tab Switcher ──────────────────────────────────── */}
        <nav className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-0.5">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </nav>

        {/* ── User Chip ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-2.5 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80 shrink-0">
          <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-extrabold text-xs">
            {initials}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-200 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{user?.role}</p>
          </div>
        </div>

      </div>
    </header>
  );
}
