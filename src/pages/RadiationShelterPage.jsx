import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ArrowRight, Flame, Timer, Droplets } from 'lucide-react';
import SpacecraftModuleMap3D from '../three/SpacecraftModuleMap3D';
import { RadiationShieldDiagram3D } from '../components/BiometricDiagrams3D';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { soundEngine } from '../utils/audio';

export default function RadiationShelterPage() {
  const { activeEvents, stormShelterEvacuated, setStormShelterEvacuated, currentVitals, missionDay } = useMissionStore();
  const { t } = useLanguage();
  const isSolarFlare = activeEvents.solarFlare;

  const handleEvacuate = () => {
    soundEngine.playTelemetryPing();
    setStormShelterEvacuated(true);
  };

  const handleExitShelter = () => {
    soundEngine.playClick();
    setStormShelterEvacuated(false);
  };

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      {/* Header Banner with 3D Depth Card Pattern */}
      <div className={`relative rounded-2xl p-4 sm:p-5 border shadow-xl overflow-hidden bg-gradient-to-r from-space-900/95 via-space-950/95 to-slate-950/95 card-3d-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isSolarFlare ? 'border-red-500/60 ring-2 ring-red-500/20' : 'border-mangal-blue/40'
      }`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Flame className={`w-5 h-5 shrink-0 ${isSolarFlare ? 'text-red-400 animate-pulse' : 'text-mangal-orange'}`} />
            <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide drop-shadow">
              {t('shelterTitle')}
            </h1>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed break-words">
            {t('shelterDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSolarFlare && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> SOLAR FLARE ACTIVE
            </span>
          )}
          <span className="text-xs font-mono text-cyan-300 bg-space-950 px-3 py-1.5 rounded-lg border border-slate-700">
            {t('solDay')} {missionDay} / 180
          </span>
        </div>
      </div>

      {/* 3D Spacecraft Module Map Component */}
      <div className="min-w-0">
        <SpacecraftModuleMap3D 
          isSolarFlare={isSolarFlare}
          isEvacuated={stormShelterEvacuated}
          onSelectModule={() => {}}
        />
      </div>

      {/* Two Column Layout: Evacuation Controls + 3D Shielding Physics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        
        {/* Left: Evacuation Action Panel (7 cols) with 3D Card Pattern */}
        <div className={`lg:col-span-7 rounded-2xl p-5 border space-y-4 card-3d-hover min-w-0 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl ${
          isSolarFlare ? 'border-red-500/50' : 'border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base text-white tracking-wide flex items-center gap-2 drop-shadow">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Storm Vault Status</span>
              </h2>
              <p className="text-xs text-slate-300 font-sans mt-1">
                Module 04: 45 g/cm² water tanks stop 92% of dangerous solar protons.
              </p>
            </div>

            <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold shrink-0 ${
              stormShelterEvacuated 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            }`}>
              {stormShelterEvacuated ? `✓ ${t('shelterSafe')}` : `⚠ ${t('shelterExposed')}`}
            </div>
          </div>

          {/* Radiation Telemetry Row with Diagrams */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            {/* Radiation Rate Card with Particle Flux Diagram */}
            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 flex flex-col items-center justify-between">
              <span className="text-[9px] text-slate-400 block uppercase">Radiation Rate</span>
              <div className="w-full h-8 my-1 flex items-center justify-center">
                <svg viewBox="0 0 100 30" className="w-full h-full">
                  <path d="M 5,15 Q 25,5 45,20 T 85,10" fill="none" stroke={isSolarFlare && !stormShelterEvacuated ? '#ef4444' : '#06b6d4'} strokeWidth="1.8" />
                  <circle cx="45" cy="20" r="3" fill={isSolarFlare && !stormShelterEvacuated ? '#ef4444' : '#06b6d4'} className="animate-ping" />
                </svg>
              </div>
              <span className={`text-base font-bold block ${isSolarFlare && !stormShelterEvacuated ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                {isSolarFlare 
                  ? (stormShelterEvacuated ? '180 μSv/h' : '14,250 μSv/h') 
                  : '~8 μSv/h'}
              </span>
            </div>

            {/* Total Radiation with Dosimeter Arc Diagram */}
            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 flex flex-col items-center justify-between">
              <span className="text-[9px] text-slate-400 block uppercase">{t('totalRadiation')}</span>
              <div className="w-full h-8 my-1 flex items-center justify-center">
                <svg viewBox="0 0 60 26" className="w-16 h-full">
                  <path d="M 6,24 A 24,24 0 0,1 54,24" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                  <path d="M 6,24 A 24,24 0 0,1 32,8" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="30" cy="24" r="2.5" fill="#ffffff" />
                </svg>
              </div>
              <span className="text-base font-bold text-mangal-gold block">{currentVitals.cumulativeRadiation} mSv</span>
            </div>

            {/* Water Wall with Layered Barrier Diagram */}
            <div className="p-3 rounded-xl bg-space-950/90 border border-slate-800 flex flex-col items-center justify-between">
              <span className="text-[9px] text-slate-400 block uppercase">Water Wall Barrier</span>
              <div className="w-full h-8 my-1 flex items-center justify-center">
                <svg viewBox="0 0 80 26" className="w-20 h-full">
                  <rect x="10" y="4" width="60" height="18" rx="3" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
                  <line x1="25" y1="4" x2="25" y2="22" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="45" y1="4" x2="45" y2="22" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
                  <circle cx="18" cy="13" r="2" fill="#38bdf8" />
                  <circle cx="35" cy="13" r="2" fill="#38bdf8" />
                  <circle cx="55" cy="13" r="2" fill="#38bdf8" />
                </svg>
              </div>
              <span className="text-base font-bold text-emerald-400 block">45 g/cm² H₂O</span>
            </div>
          </div>

          {/* Evacuate Button */}
          <div className="pt-2">
            {!stormShelterEvacuated ? (
              <button
                onClick={handleEvacuate}
                className={`w-full py-3.5 rounded-xl text-white font-mono font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wider transition-all shadow-lg ${
                  isSolarFlare
                    ? 'bg-red-600 hover:bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    : 'bg-gradient-to-r from-mangal-copper to-mangal-orange hover:from-mangal-orange hover:to-mangal-gold'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>{t('shelterEvacuateBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleExitShelter}
                className="w-full py-3 rounded-xl bg-space-900 hover:bg-space-850 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('shelterLeaveBtn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: 3D Shielding Layer Diagram (5 cols) with 3D Card Pattern */}
        <div className="lg:col-span-5 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 card-3d-hover min-w-0 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Shielding Structure
            </span>
            <span className="text-[10px] font-mono text-slate-400">Physical Barrier</span>
          </div>

          <RadiationShieldDiagram3D 
            doseRate={stormShelterEvacuated ? 180 : 14250} 
            cumulative={currentVitals.cumulativeRadiation} 
          />

          <div className="text-[11px] font-sans text-slate-200 space-y-1.5 pt-1 leading-relaxed">
            <p>
              Water contains hydrogen atoms that absorb fast-moving space particles, keeping astronauts safe during storms.
            </p>
            <div className="flex justify-between text-[10px] text-emerald-400 font-mono font-bold pt-1 border-t border-slate-800">
              <span>Particle Reduction: 92.4%</span>
              <span>Crew Vault: Safe</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
