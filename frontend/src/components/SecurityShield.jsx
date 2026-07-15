// ============================================================
// frontend/src/components/SecurityShield.jsx
// DRM overlay activated on blur / tab switch / PrintScreen
// ============================================================
import React from 'react';
import { Lock, Check } from 'lucide-react';

export default function SecurityShield({ shieldReason, onDismiss }) {
  return (
    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center text-center p-6 transition-all duration-300">
      <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 mb-4 border border-red-500/40 animate-pulse">
        <Lock className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-bold text-white">DRM Capture Protection Shield</h3>
      
      <p className="text-sm text-slate-300 max-w-md mt-2 leading-relaxed">
        A screenshot attempt or window focus change was detected. The video stream has been paused and blurred to preserve copyright and lecture integrity.
      </p>
      
      <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-mono text-slate-400 mt-4">
        Event: <span className="text-red-400 font-bold">{shieldReason}</span>
      </div>
      
      {/* CORRECTED ACTION BUTTON */}
      <button 
        id="dismiss-shield"
        onClick={onDismiss}
        className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-900/40 transition-all flex items-center space-x-2 cursor-pointer"
      >
        <Check className="w-4 h-4" />
        <span>Acknowledge & Resume Watching</span>
      </button>
    </div>
  );
}
