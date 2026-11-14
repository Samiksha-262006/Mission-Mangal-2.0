import React, { useState } from 'react';
import { HelpCircle, X, ShieldAlert, CheckCircle2, AlertTriangle, TrendingDown } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function RadialHealthGauge({ score, vitals, activeEvents }) {
  const [showExplanation, setShowExplanation] = useState(false);

  // SVG Radial Gauge dimensions
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc spans 260 degrees (leaving bottom gap)
  const arcLength = circumference * (260 / 360);
  const strokeDashoffset = arcLength - (arcLength * Math.min(100, Math.max(0, score))) / 100;

  // Determine color theme based on score
  let strokeColor = '#00f2fe'; // Cyan / Teal
  let statusText = 'NOMINAL';
  let badgeClass = 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40';

  if (score >= 85) {
    strokeColor = '#10b981'; // Emerald
    statusText = 'OPTIMAL';
    badgeClass = 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40';
  } else if (score >= 70) {
    strokeColor = '#00f2fe'; // Cyan
    statusText = 'ADAPTING';
    badgeClass = 'text-cyan-300 border-cyan-500/40 bg-cyan-950/40';
  } else if (score >= 50) {
    strokeColor = '#f59e0b'; // Amber
    statusText = 'ELEVATED RISK';
    badgeClass = 'text-amber-300 border-amber-500/40 bg-amber-950/40';
  } else {
    strokeColor = '#ef4444'; // Red
    statusText = 'CRITICAL DRIFT';
    badgeClass = 'text-red-300 border-red-500/50 bg-red-950/40 animate-pulse';
  }

  // Decompose score penalties for "Why this score?" modal
  const breakdownItems = [
    {
      category: 'Cardiovascular Deconditioning',
      status: vitals.heartRate > 90 ? 'Warning' : 'Nominal',
      impact: vitals.heartRate > 80 ? `-${Math.round((vitals.heartRate - 80) * 0.8)} pts` : '0 pts',
      detail: `Resting HR is ${vitals.heartRate} bpm (Baseline 58 bpm). SV reduction in 0G.`
    },
    {
      category: 'Cephalad Fluid Shift / SANS',
      status: vitals.fluidShiftIndex > 1.7 ? 'Warning' : 'Nominal',
      impact: vitals.fluidShiftIndex > 1.5 ? `-${Math.round((vitals.fluidShiftIndex - 1.5) * 12)} pts` : '0 pts',
      detail: `Headward fluid displacement index +${vitals.fluidShiftIndex}σ.`
    },
    {
      category: 'Radiation Cumulative Dose',
      status: vitals.cumulativeRadiation > 60 ? 'Warning' : 'Nominal',
      impact: vitals.cumulativeRadiation > 80 ? `-${Math.round((vitals.cumulativeRadiation - 80) * 0.15)} pts` : '0 pts',
      detail: `Total dose ${vitals.cumulativeRadiation} mSv (Mars limit 250 mSv).`
    },
    {
      category: 'Bone Mineral Resorption',
      status: vitals.boneLossPercent > 3.5 ? 'Warning' : 'Nominal',
      impact: vitals.boneLossPercent > 4.0 ? `-${Math.round((vitals.boneLossPercent - 4.0) * 3)} pts` : '0 pts',
      detail: `Estimated bone mineral loss: -${vitals.boneLossPercent}%.`
    },
    {
      category: 'Circadian Architecture & Stress',
      status: vitals.sleepScore < 60 || vitals.stressScore > 65 ? 'Warning' : 'Nominal',
      impact: vitals.sleepScore < 65 ? `-${Math.round((65 - vitals.sleepScore) * 0.3)} pts` : '0 pts',
      detail: `Sleep index ${vitals.sleepScore}/100, Mental stress ${vitals.stressScore}/100.`
    }
  ];

  if (activeEvents?.chestPain) {
    breakdownItems.unshift({
      category: 'ACUTE CARDIAC EVENT (EVENT IN PROGRESS)',
      status: 'Critical',
      impact: '-35 pts',
      detail: 'Acute precordial ischemia simulation triggering severe vital compromise.'
    });
  }
  if (activeEvents?.solarFlare) {
    breakdownItems.unshift({
      category: 'SOLAR PARTICLE STORM (EVENT IN PROGRESS)',
      status: 'Critical',
      impact: '-22 pts',
      detail: 'Intense ionizing proton flux penetrating exterior hulls.'
    });
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Radial Gauge SVG */}
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-[220deg] overflow-visible"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(30, 41, 59, 0.6)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Active Gradient Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${strokeColor}88)`
            }}
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none">
          <span className="text-[11px] font-mono tracking-widest text-slate-400">HEALTH INDEX</span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
              {score}
            </span>
            <span className="text-sm font-mono text-slate-400">/100</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 mt-1 rounded-full border ${badgeClass}`}>
            {statusText}
          </span>
        </div>
      </div>

      {/* "Why this score?" trigger button */}
      <button
        onClick={() => {
          soundEngine.playClick();
          setShowExplanation(true);
        }}
        className="mt-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-all hover:shadow-[0_0_12px_rgba(0,242,254,0.3)]"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Why this score?</span>
      </button>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel border border-cyan-500/40 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_40px_rgba(0,242,254,0.25)] relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono font-bold text-lg text-white">Mission Health Score Breakdown</h3>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-space-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                The composite Mission Health Score synthesizes acute biometrics, cumulative spaceflight deconditioning models, and individual pre-flight baselines. It measures the astronaut’s physiological reserve to safely complete the mission and withstand contingency operations.
              </p>

              <div className="space-y-2.5">
                {breakdownItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs font-mono flex items-start justify-between gap-3 ${
                      item.status === 'Critical'
                        ? 'bg-red-950/40 border-red-500/50 text-red-200'
                        : item.status === 'Warning'
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                        : 'bg-space-900/60 border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        {item.status === 'Critical' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                        ) : item.status === 'Warning' ? (
                          <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        <span>{item.category}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{item.detail}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-bold ${item.impact !== '0 pts' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {item.impact}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Calculated via NASA Bio-Astronautics Baseline Matrix</span>
                <button
                  onClick={() => setShowExplanation(false)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 text-black font-bold font-mono hover:bg-cyan-400 transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
