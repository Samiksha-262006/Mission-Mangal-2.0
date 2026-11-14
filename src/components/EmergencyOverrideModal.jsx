import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Check, Lock } from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function EmergencyOverrideModal({ isOpen, onClose }) {
  const { activateEmergencyOverride, emergencyOverride, deactivateEmergencyOverride } = useAuthStore();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a substantive clinical justification (minimum 10 characters).');
      return;
    }

    try {
      soundEngine.playCriticalAlarm();
      await activateEmergencyOverride(reason.trim());
      setReason('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async () => {
    soundEngine.playClick();
    await deactivateEmergencyOverride();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel-critical max-w-md w-full rounded-2xl p-6 border-2 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-500/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            <h3 className="font-display font-bold text-lg text-white">Emergency Medical Override (Break-Glass)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {emergencyOverride.active ? (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500 text-red-200">
              <span className="font-bold block mb-1">BREAK-GLASS ACCESS CURRENTLY ACTIVE</span>
              <p className="text-[11px] text-slate-300">
                Reason: "{emergencyOverride.reason}"
              </p>
              <span className="text-[10px] text-slate-400 block mt-1">
                Authorized at: {emergencyOverride.timestamp}
              </span>
            </div>

            <p className="text-slate-300 font-sans leading-relaxed">
              If the acute medical emergency has resolved, conclude break-glass access to restore astronaut consent restrictions.
            </p>

            <button
              onClick={handleDeactivate}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs"
            >
              Conclude Emergency Override
            </button>
          </div>
        ) : (
          <form onSubmit={handleActivate} className="space-y-4 font-mono text-xs">
            <p className="text-slate-300 font-sans leading-relaxed text-xs">
              This protocol grants temporary access to restricted astronaut telemetry (mental health & journals) in life-threatening contingencies where the astronaut cannot grant verbal or written consent.
            </p>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-[11px] leading-snug">
              <strong>AUDIT NOTICE:</strong> This action will be immutably recorded in the IndexedDB audit ledger and prominently flagged on the astronaut's HUD terminal.
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-bold">
                Clinical Justification / Emergency Context:
              </label>
              <textarea
                value={reason}
                onChange={(e) => { setReason(e.target.value); setError(''); }}
                placeholder="E.g., Astronaut unconscious following acute SPE radiation exposure; requires baseline cognitive and EEG history..."
                rows="3"
                className="w-full bg-space-950 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-red-400 text-xs font-mono"
                required
              />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-space-900 border border-slate-700 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Execute Break-Glass</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
