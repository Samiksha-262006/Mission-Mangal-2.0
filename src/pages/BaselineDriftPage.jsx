import React, { useState } from 'react';
import { 
  Activity, ArrowUpRight, ArrowDownRight, AlertTriangle, 
  CheckCircle2, Compass, Shield, Settings, Sliders, Info, Zap
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { detectHealthDrifts, calculateZScore } from '../utils/anomaly';
import { soundEngine } from '../utils/audio';

// 3D Z-Score Normal Distribution Curve Diagram
function ZScoreNormalCurve3D({ driftsCount = 2 }) {
  return (
    <div className="relative w-full h-28 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 80" className="w-full h-full max-h-24">
        <defs>
          <linearGradient id="curveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#070b19" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="anomalyZone" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* 3D Grid lines */}
        <line x1="20" y1="65" x2="180" y2="65" stroke="#334155" strokeWidth="1" />
        <line x1="100" y1="15" x2="100" y2="65" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
        
        {/* Anomaly Tails (> 1.8 sigma) */}
        <path d="M 154,52 Q 165,60 180,64 L 180,65 L 154,65 Z" fill="url(#anomalyZone)" />
        <path d="M 20,64 Q 35,60 46,52 L 46,65 L 20,65 Z" fill="url(#anomalyZone)" />

        {/* Gaussian Bell Curve */}
        <path
          d="M 20,64 C 45,64 65,58 82,32 C 92,16 108,16 118,32 C 135,58 155,64 180,64"
          fill="none"
          stroke="#00f2fe"
          strokeWidth="2"
        />

        {/* Area fill under curve */}
        <path
          d="M 20,64 C 45,64 65,58 82,32 C 92,16 108,16 118,32 C 135,58 155,64 180,64 L 180,65 L 20,65 Z"
          fill="url(#curveGrad)"
        />

        {/* Marker Points for detected drifts */}
        <circle cx="162" cy="56" r="3.5" fill="#ef4444" className="animate-ping" />
        <circle cx="162" cy="56" r="2.5" fill="#ef4444" stroke="#ffffff" strokeWidth="0.8" />
        
        {/* Baseline Mean Indicator */}
        <text x="100" y="74" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle">MEAN μ (0σ)</text>
        <text x="50" y="74" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">-2σ</text>
        <text x="150" y="74" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle">+2σ CRIT</text>

        {/* Header Telemetry */}
        <text x="15" y="14" fill="#94a3b8" fontSize="7.5" fontFamily="monospace">PERSONAL BASELINE NORMAL DISTRIBUTION</text>
        <text x="185" y="14" textAnchor="end" fill="#00f2fe" fontSize="7.5" fontFamily="monospace" fontWeight="bold">DRIFTS: {driftsCount} ACTIVE</text>
      </svg>
    </div>
  );
}

export default function BaselineDriftPage({ onOpenCalibration }) {
  const { currentVitals, baseline, vitalsHistory, missionDay } = useMissionStore();

  const drifts = detectHealthDrifts(currentVitals, baseline, vitalsHistory);

  // Table row data
  const matrixData = [
    {
      metric: 'Resting Heart Rate',
      unit: 'bpm',
      baseline: baseline.heartRate,
      current: currentVitals.heartRate,
      stdDev: 4.5,
      zScore: calculateZScore(currentVitals.heartRate, baseline.heartRate, 4.5),
      deltaPct: (((currentVitals.heartRate - baseline.heartRate) / baseline.heartRate) * 100).toFixed(1),
      clinicalNote: 'Cardiovascular deconditioning & stroke volume reduction in 0G.'
    },
    {
      metric: 'Systolic Arterial Pressure',
      unit: 'mmHg',
      baseline: baseline.systolic,
      current: currentVitals.systolic,
      stdDev: 5.5,
      zScore: calculateZScore(currentVitals.systolic, baseline.systolic, 5.5),
      deltaPct: (((currentVitals.systolic - baseline.systolic) / baseline.systolic) * 100).toFixed(1),
      clinicalNote: 'Vascular remodeling and altered baroreceptor setpoint.'
    },
    {
      metric: 'Diastolic Arterial Pressure',
      unit: 'mmHg',
      baseline: baseline.diastolic,
      current: currentVitals.diastolic,
      stdDev: 4.0,
      zScore: calculateZScore(currentVitals.diastolic, baseline.diastolic, 4.0),
      deltaPct: (((currentVitals.diastolic - baseline.diastolic) / baseline.diastolic) * 100).toFixed(1),
      clinicalNote: 'Systemic peripheral resistance redistribution.'
    },
    {
      metric: 'Blood Oxygen (SpO2)',
      unit: '%',
      baseline: baseline.spO2,
      current: currentVitals.spO2,
      stdDev: 0.8,
      zScore: calculateZScore(currentVitals.spO2, baseline.spO2, 0.8),
      deltaPct: (((currentVitals.spO2 - baseline.spO2) / baseline.spO2) * 100).toFixed(1),
      clinicalNote: 'Ventilation-perfusion matching in microgravity.'
    },
    {
      metric: 'Core Body Temperature',
      unit: '°C',
      baseline: baseline.bodyTemp,
      current: currentVitals.bodyTemp,
      stdDev: 0.2,
      zScore: calculateZScore(currentVitals.bodyTemp, baseline.bodyTemp, 0.2),
      deltaPct: (((currentVitals.bodyTemp - baseline.bodyTemp) / baseline.bodyTemp) * 100).toFixed(1),
      clinicalNote: 'Elevated core circadian temperature (Spaceflight Fever).'
    },
    {
      metric: 'Cephalad Fluid Shift',
      unit: 'Index',
      baseline: 1.0,
      current: currentVitals.fluidShiftIndex,
      stdDev: 0.35,
      zScore: calculateZScore(currentVitals.fluidShiftIndex, 1.0, 0.35),
      deltaPct: (((currentVitals.fluidShiftIndex - 1.0) / 1.0) * 100).toFixed(1),
      clinicalNote: 'Headward venous pooling; precursor to SANS optic disc edema.'
    },
    {
      metric: 'Bone Mineral Density (BMD)',
      unit: '%',
      baseline: 100,
      current: currentVitals.boneDensity,
      stdDev: 1.2,
      zScore: -Number((currentVitals.boneLossPercent / 1.2).toFixed(2)),
      deltaPct: `-${currentVitals.boneLossPercent}`,
      clinicalNote: 'Calcium excretion through osteoclast dominance in 0G.'
    }
  ];

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Activity className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              Personal Baseline & Health Drift Analytics
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Z-SCORE ANOMALY ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono break-words leading-relaxed">
            Detects subtle microgravity decompensation by comparing individual astronaut baseline rather than generic population averages.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenCalibration) onOpenCalibration();
          }}
          className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-mono text-xs font-bold flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] shrink-0"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Calibrate Baseline</span>
        </button>
      </div>

      {/* 3D Normal Curve Visualization Card */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 card-3d-hover">
        <ZScoreNormalCurve3D driftsCount={drifts.length} />
      </div>

      {/* Active Drift Alerts Stream */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Statistically Significant Health Drifts (|Z| ≥ 1.8σ)
          </span>
          <span className="text-slate-400 text-[10px] bg-space-900 px-2 py-0.5 rounded border border-slate-800">
            {drifts.length} Active Deviations
          </span>
        </div>

        {drifts.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 text-center font-mono text-xs sm:text-sm text-emerald-300 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>All biometrics currently track within expected bounds of astronaut pre-flight calibration.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            {drifts.map((drift) => (
              <div
                key={drift.id}
                className={`glass-panel p-4 rounded-2xl border flex flex-col justify-between card-3d-hover min-w-0 ${
                  drift.severity === 'critical'
                    ? 'border-red-500/50 bg-red-950/25'
                    : 'border-amber-500/40 bg-amber-950/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono font-bold text-sm text-white flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${drift.severity === 'critical' ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`}></span>
                      <span className="truncate">{drift.metric}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-space-950 border border-slate-700 text-cyan-300 shrink-0">
                      Z = {drift.zScore > 0 ? `+${drift.zScore}` : drift.zScore}σ
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-white mb-1.5">
                    {drift.finding}
                  </p>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3 line-clamp-2">
                    {drift.clinicalInsight}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono flex items-start gap-1.5 text-cyan-300/90 bg-space-900/40 p-2 rounded-lg">
                  <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="truncate"><strong>Action:</strong> {drift.countermeasure}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparative Biometrics Matrix Table */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 overflow-hidden card-3d-hover">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="font-mono font-bold text-white text-sm sm:text-base">Biometric Matrix: Baseline vs Current Telemetry</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-space-950 px-2.5 py-0.5 rounded border border-slate-800">
            Sol {missionDay} / 180
          </span>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="pb-2.5 font-semibold">Biometric Metric</th>
                <th className="pb-2.5 font-semibold">Pre-Flight Base</th>
                <th className="pb-2.5 font-semibold">Current (Sol {missionDay})</th>
                <th className="pb-2.5 font-semibold">Delta</th>
                <th className="pb-2.5 font-semibold">Z-Score (σ)</th>
                <th className="pb-2.5 font-semibold hidden lg:table-cell">Physiological Context</th>
                <th className="pb-2.5 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {matrixData.map((row, idx) => {
                const absZ = Math.abs(row.zScore);
                const isCritical = absZ >= 2.5;
                const isWarning = absZ >= 1.8 && absZ < 2.5;

                return (
                  <tr key={idx} className="hover:bg-space-900/40 transition-colors">
                    <td className="py-2.5 font-bold text-white whitespace-nowrap">{row.metric}</td>
                    <td className="py-2.5 text-slate-400 whitespace-nowrap">{row.baseline} {row.unit}</td>
                    <td className="py-2.5 font-bold text-cyan-300 whitespace-nowrap">{row.current} {row.unit}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className={`flex items-center gap-0.5 font-bold ${
                        Number(row.deltaPct) > 0 ? 'text-amber-400' : Number(row.deltaPct) < 0 ? 'text-cyan-400' : 'text-slate-400'
                      }`}>
                        {Number(row.deltaPct) > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {row.deltaPct}%
                      </span>
                    </td>
                    <td className="py-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {row.zScore > 0 ? `+${row.zScore}` : row.zScore}σ
                        </span>
                        <div className="w-12 h-1.5 bg-space-900 rounded-full overflow-hidden border border-slate-700 hidden sm:block">
                          <div
                            className={`h-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'}`}
                            style={{ width: `${Math.min(100, (absZ / 3) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 text-slate-400 hidden lg:table-cell max-w-xs truncate">
                      {row.clinicalNote}
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                        isCritical 
                          ? 'bg-red-500/20 text-red-300 border-red-500/50' 
                          : isWarning 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {isCritical ? 'Critical' : isWarning ? 'Watch' : 'Nominal'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}