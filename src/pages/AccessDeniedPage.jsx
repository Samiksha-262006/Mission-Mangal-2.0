import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function AccessDeniedPage({ requiredRole }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();

  return (
    <div className="max-w-lg mx-auto my-12 glass-panel rounded-2xl p-6 sm:p-8 border border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center space-y-5">
      <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500/80 mx-auto flex items-center justify-center text-red-400">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="font-display font-extrabold text-2xl text-white tracking-wider">
          ACCESS CLEARANCE RESTRICTED
        </h2>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40">
          LEVEL CLEARANCE VIOLATION
        </span>
      </div>

      <p className="text-xs text-slate-300 font-sans leading-relaxed">
        Your active role (<strong>{currentUser?.role || 'Guest'}</strong>) does not have authorization to access this subsystem. The NASA Space Apps security protocol requires specific role clearance or astronaut consent.
      </p>

      {requiredRole && (
        <div className="p-3 rounded-xl bg-space-950 border border-slate-800 text-[11px] font-mono text-cyan-300">
          Required Role: <strong>{requiredRole}</strong>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
        <button
          onClick={() => {
            soundEngine.playClick();
            navigate('/');
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            logout();
          }}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-space-900 border border-slate-700 text-slate-300 hover:text-white"
        >
          Switch Account
        </button>
      </div>
    </div>
  );
}
