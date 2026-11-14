import React, { useState } from 'react';
import { Lock, Delete, ArrowRight, LogOut, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function PinUnlockModal() {
  const { isLocked, currentUser, unlockWithPin, logout } = useAuthStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      soundEngine.playBeep(880 + pin.length * 110, 0.04);
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        // Attempt unlock
        setTimeout(async () => {
          const success = await unlockWithPin(nextPin);
          if (success) {
            soundEngine.playTelemetryPing();
            setPin('');
          } else {
            soundEngine.playWarningChime();
            setError(true);
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    soundEngine.playClick();
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    soundEngine.playClick();
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/95 backdrop-blur-xl">
      <div className="glass-panel max-w-sm w-full rounded-2xl p-6 border-2 border-mangal-blue/50 shadow-[0_0_60px_rgba(46,139,255,0.4)] text-center space-y-5">
        
        {/* User Identity Banner */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-mangal-copper/20 border border-mangal-copper/60 mx-auto flex items-center justify-center text-mangal-copper mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-white">Terminal Auto-Locked</h3>
          <p className="text-xs font-mono text-cyan-300">
            {currentUser?.name || 'Astronaut'} ({currentUser?.callsign || 'Ares-Lead'})
          </p>
          <p className="text-[10px] font-mono text-slate-400">
            Glove-Friendly Quick-Unlock PIN Pad
          </p>
        </div>

        {/* 4 PIN Circles */}
        <div className="flex justify-center gap-3 my-3">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  error
                    ? 'border-red-500 bg-red-500/40 animate-bounce'
                    : isFilled
                    ? 'border-cyan-400 bg-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.6)]'
                    : 'border-slate-700 bg-space-900'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-xs font-mono text-red-400 font-bold animate-pulse">
            PIN Incorrect. Default PIN: 1234
          </p>
        )}

        {/* Numeric Glove-Friendly PIN Pad (Large Touch Targets 64px) */}
        <div className="grid grid-cols-3 gap-2.5 font-display font-extrabold text-xl text-white">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num.toString())}
              className="h-14 rounded-xl bg-space-900/90 hover:bg-space-800 border border-slate-700 hover:border-mangal-blue active:scale-95 transition-all flex items-center justify-center shadow-md glove-touch-btn"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-14 rounded-xl bg-space-900/50 hover:bg-space-850 border border-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center glove-touch-btn"
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-xl bg-space-900/90 hover:bg-space-800 border border-slate-700 hover:border-mangal-blue active:scale-95 transition-all flex items-center justify-center shadow-md glove-touch-btn"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 rounded-xl bg-space-900/50 hover:bg-space-850 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center glove-touch-btn"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Logout / Switch User */}
        <div className="pt-2 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => {
              soundEngine.playClick();
              logout();
            }}
            className="text-xs font-mono text-slate-400 hover:text-red-400 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Crew Member / Full Login</span>
          </button>
        </div>

      </div>
    </div>
  );
}
