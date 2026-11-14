import React, { useState } from 'react';
import { 
  ShieldAlert, Sun, Bone, Heart, Zap, 
  Brain, AlertTriangle, CheckCircle2, ChevronRight, Activity, ShieldCheck
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Tooltip 
} from 'recharts';
import { useMissionStore } from '../store/useMissionStore';
import { calculateHazardRisks } from '../utils/simulator';
import { 
  RadiationShieldDiagram3D, BoneDensityDiagram3D, FluidShiftDiagram3D 
} from '../components/BiometricDiagrams3D';

export default function MultiHazardRiskPage() {
  const { currentVitals, missionDay } = useMissionStore();

  const radarData = calculateHazardRisks(currentVitals);

  // Cumulative radiation thresholds: 250 mSv Mars transit benchmark, 600 mSv NASA career limit
  const radPercent = Math.min(100, (currentVitals.cumulativeRadiation / 250) * 100).toFixed(1);
  const bonePercent = Math.min(100, (currentVitals.boneLossPercent / 8.0) * 100).toFixed(1);
  const musclePercent = Math.min(100, (currentVitals.muscleLossPercent / 10.0) * 100).toFixed(1);

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              Multi-Hazard Deep Space Risk Matrix
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              NASA 5-HAZARD PARADIGM
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono break-words leading-relaxed">
            Autonomous physiological evaluation across Radiation, Microgravity unloading, Hostile environment, Confinement, and Earth distance.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="text-slate-400">Mission Sol:</span>
          <span className="text-cyan-300 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-500/30">
            {missionDay} / 180
          </span>
        </div>
      </div>

      {/* Main Grid: 3D Radar Profile + 5 Hazard Cards with 3D Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col items-center justify-between card-3d-hover">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Composite Hazard Profile
            </span>
            <span className="text-[10px] font-mono text-slate-400">Normalized 0-100</span>
          </div>

          <div className="w-full h-72 sm:h-80 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis 
                  dataKey="hazard" 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} 
                />
                <PolarRadiusAxis 
                  angle={30} 
                  domain={[0, 100]} 
                  tick={{ fill: '#475569', fontSize: 8, fontFamily: 'monospace' }} 
                />
                <Radar
                  name="Risk Level"
                  dataKey="value"
                  stroke="#00f2fe"
                  fill="#00f2fe"
                  fillOpacity={0.35}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070b19',
                    borderColor: '#0e7490',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 text-center">
            Higher polygon area indicates compounded physiological strain on Ares crew.
          </div>
        </div>

        {/* Hazard Detail Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4 min-w-0">
          
          {/* Hazard 1: Space Radiation Exposure with 3D Shield Diagram */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 card-3d-hover">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/40 shrink-0">
                  <Sun className="w-4 h-4 text-red-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-mono font-bold text-sm text-white truncate">1. Space Radiation & SPE Flux</h4>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">Galactic Cosmic Rays (GCR) + Solar Protons</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30 shrink-0">
                {currentVitals.cumulativeRadiation} mSv
              </span>
            </div>

            {/* 3D Shielding Diagram */}
            <RadiationShieldDiagram3D 
              doseRate={currentVitals.radiationDoseRate || 180} 
              cumulative={currentVitals.cumulativeRadiation} 
            />

            {/* Progress Bar vs 250 mSv Transit Benchmark */}
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>Transit Limit Benchmark (250 mSv)</span>
                <span className="text-red-300 font-bold">{radPercent}%</span>
              </div>
              <div className="w-full h-2 bg-space-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    currentVitals.cumulativeRadiation > 150 ? 'bg-red-500' : 'bg-gradient-to-r from-cyan-400 to-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, radPercent)}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Ambient Dose: <strong>{currentVitals.radiationDoseRate} μSv/h</strong></span>
              <span className="text-emerald-400">Water Vault Attenuation: 92%</span>
            </div>
          </div>

          {/* Hazard 2: Bone & Muscle Loss with 3D Trabecular Diagram */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 card-3d-hover">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 shrink-0">
                  <Bone className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-mono font-bold text-sm text-white truncate">2. Skeletal & Muscular Unloading</h4>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">Trabecular Osteopenia & Type I Fiber Atrophy</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 shrink-0">
                -{currentVitals.boneLossPercent}% BMD
              </span>
            </div>

            {/* 3D Bone Diagram */}
            <BoneDensityDiagram3D lossPercent={currentVitals.boneLossPercent} />

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Bone Mineral Density</span>
                  <span className="text-amber-400">-{currentVitals.boneLossPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${bonePercent}%` }} />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-space-950 border border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Muscle Mass Atrophy</span>
                  <span className="text-amber-400">-{currentVitals.muscleLossPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${musclePercent}%` }} />
                </div>
              </div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>Countermeasure: ARED High-Load Deadlift</span>
              <span className="text-emerald-400 font-bold">Prescription: 140kg</span>
            </div>
          </div>

          {/* Hazard 3: Cardiovascular & SANS Fluid Shift with 3D Diagram */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 card-3d-hover">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 shrink-0">
                  <Heart className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-mono font-bold text-sm text-white truncate">3. Cardiovascular Deconditioning & SANS</h4>
                  <span className="text-[10px] font-mono text-slate-400 block truncate">Optic Nerve Sheath Dilation & Stroke Volume</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">
                Shift: +{currentVitals.fluidShiftIndex}σ
              </span>
            </div>

            {/* 3D Fluid Shift Diagram */}
            <FluidShiftDiagram3D shift={currentVitals.fluidShiftIndex} />

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              Cephalad fluid redistribution elevates internal jugular venous pressure and optic nerve sheath diameter (ONSD). Prescribed: Chibis LBNP suit 40 min daily.
            </p>
          </div>

          {/* Hazard 4 & 5 Compact Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Immune Stress */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 card-3d-hover">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400 shrink-0" />
                <h4 className="font-mono font-bold text-xs text-white truncate">4. Immune Dysregulation</h4>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Suppressed natural killer cell cytotoxicity and reactivation risk of latent viruses.
              </p>
              <div className="text-[10px] font-mono text-purple-300 font-bold pt-1 border-t border-slate-800">
                T-Cell Competence: 76% (Moderate)
              </div>
            </div>

            {/* Mental Health & Isolation */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2 card-3d-hover">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-yellow-400 shrink-0" />
                <h4 className="font-mono font-bold text-xs text-white truncate">5. Isolation & Confinement</h4>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                Circadian desynchronization and Earth out-of-view psychological stress index.
              </p>
              <div className="text-[10px] font-mono text-yellow-300 font-bold pt-1 border-t border-slate-800">
                Stress: {currentVitals.stressScore}/100 • Sleep: {currentVitals.sleepScore}/100
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}