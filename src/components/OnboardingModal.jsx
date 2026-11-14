import React, { useState } from 'react';
import { User, Activity, Check, X, Shield, Sparkles } from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';

export default function OnboardingModal({ isOpen, onClose }) {
  const { profile, baseline, updateProfile, updateBaseline } = useMissionStore();

  const [formData, setFormData] = useState({
    name: profile.name,
    role: profile.role,
    callsign: profile.callsign || 'Ares-Lead',
    age: profile.age,
    bloodType: profile.bloodType || 'O-Negative',
    heartRate: baseline.heartRate,
    systolic: baseline.systolic,
    diastolic: baseline.diastolic,
    spO2: baseline.spO2,
    bodyTemp: baseline.bodyTemp,
    hydration: baseline.hydration
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) || name === 'name' || name === 'role' || name === 'callsign' || name === 'bloodType'
        ? value 
        : Number(value)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    soundEngine.playTelemetryPing();
    updateProfile({
      name: formData.name,
      role: formData.role,
      callsign: formData.callsign,
      age: formData.age,
      bloodType: formData.bloodType
    });
    updateBaseline({
      heartRate: formData.heartRate,
      systolic: formData.systolic,
      diastolic: formData.diastolic,
      spO2: formData.spO2,
      bodyTemp: formData.bodyTemp,
      hydration: formData.hydration
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-xl w-full rounded-2xl p-6 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,242,254,0.3)] my-auto relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
              <User className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-lg text-white">Astronaut Profile & Baseline Calibration</h3>
              <p className="text-xs text-slate-400 font-mono">Pre-Flight Physiological Benchmark Setup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-space-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          {/* Identity Fields */}
          <div>
            <span className="text-cyan-400 font-bold block mb-2 uppercase tracking-wider text-[11px]">
              Crew Member Identity
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mission Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Callsign</label>
                <input
                  type="text"
                  name="callsign"
                  value={formData.callsign}
                  onChange={handleChange}
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Blood Type</label>
                <input
                  type="text"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Pre-Flight Baseline Calibration */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-cyan-400 font-bold block mb-2 uppercase tracking-wider text-[11px]">
              Pre-Flight 1G Medical Baseline
            </span>
            <p className="text-[11px] text-slate-400 mb-3">
              Biometric drift detection evaluates deviations against these personal benchmarks rather than standard general population averages.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Resting HR (bpm)</label>
                <input
                  type="number"
                  name="heartRate"
                  value={formData.heartRate}
                  onChange={handleChange}
                  min="40"
                  max="120"
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  name="systolic"
                  value={formData.systolic}
                  onChange={handleChange}
                  min="80"
                  max="160"
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  name="diastolic"
                  value={formData.diastolic}
                  onChange={handleChange}
                  min="50"
                  max="110"
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  name="spO2"
                  value={formData.spO2}
                  onChange={handleChange}
                  min="90"
                  max="100"
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Body Temp (°C)</label>
                <input
                  type="number"
                  name="bodyTemp"
                  step="0.1"
                  value={formData.bodyTemp}
                  onChange={handleChange}
                  min="35"
                  max="39"
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hydration Index (%)</label>
                <input
                  type="number"
                  name="hydration"
                  value={formData.hydration}
                  onChange={handleChange}
                  min="40"
                  max="100"
                  className="w-full bg-space-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-space-900 text-slate-300 hover:text-white border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(0,242,254,0.4)]"
            >
              <Check className="w-4 h-4" />
              <span>Save & Calibrate Sentinel</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
