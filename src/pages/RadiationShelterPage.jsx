import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, ArrowRight, Flame, Timer, Droplets } from 'lucide-react';
import SpacecraftModuleMap3D from '../three/SpacecraftModuleMap3D';
import { RadiationShieldDiagram3D } from '../components/BiometricDiagrams3D';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';

export default function RadiationShelterPage() {
  const { activeEvents, stormShelterEvacuated, setStormShelterEvacuated, currentVitals, missionDay } = useMissionStore();
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
      {/* Header Banner */}
      <div className={`glass-panel rounded-2xl p-4 sm:p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isSolarFlare ? 'border-red-500/60 bg-red-950/20' : 'border-mangal-blue/30'
      }`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Flame className={`w-5 h-5 shrink-0 ${isSolarFlare ? 'text-red-400 animate-pulse' : 'text-mangal-orange'}`} />
            <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              Radiation Storm Shelter & Spacecraft Module Map
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-mono break-words">
            Interactive 3D spacecraft module dose mapping. Direct guidance to Module 04 Water-Shielded Storm Vault during Solar Particle Events.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSolarFlare && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/30 text-red-200 border border-red-500/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> SPE ACTIVE
            </span>
          )}
          <span className="text-xs font-mono text-cyan-300 bg-space-950 px-3 py-1.5 rounded-lg border border-slate-700">
            Sol {missionDay} / 180
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
        
        {/* Left: Evacuation Action Panel (7 cols) */}
        <div className={`lg:col-span-7 glass-panel rounded-2xl p-5 border space-y-4 card-3d-hover min-w-0 ${
          isSolarFlare ? 'border-red-500/50' : 'border-slate-800'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display font-bold text-base text-white tracking-wide flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Storm Vault Evacuation Status</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Module 04 Vault: 45 g/cm² H₂O barrier attenuates SPE proton flux by ~92%
              </p>
            </div>

            <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold shrink-0 ${
              stormShelterEvacuated 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            }`}>
              {stormShelterEvacuated ? '✓ SHELTERED IN VAULT' : '⚠ EXPOSED TO FLUX'}
            </div>
          </div>

          {/* Radiation Telemetry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block uppercase">Ambient Flux</span>
              <span className={`text-lg font-bold block ${isSolarFlare && !stormShelterEvacuated ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                {isSolarFlare 
                  ? (stormShelterEvacuated ? '180 μSv/h' : '14,250 μSv/h') 
                  : '~8 μSv/h'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block uppercase">Transit Dose</span>
              <span className="text-lg font-bold text-mangal-gold block">{currentVitals.cumulativeRadiation} mSv</span>
            </div>
            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 text-center">
              <span className="text-[9px] text-slate-400 block uppercase">Water Barrier</span>
              <span className="text-lg font-bold text-emerald-400 block">45 g/cm² H₂O</span>
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
                <span>Initiate Crew Evacuation to Module 04</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleExitShelter}
                className="w-full py-3 rounded-xl bg-space-900 hover:bg-space-850 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Crew Safe In Vault • Stand Down Evacuation</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: 3D Shielding Layer Diagram (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3 card-3d-hover min-w-0">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Multi-Layer Shielding Physics
            </span>
            <span className="text-[10px] font-mono text-slate-400">Monte Carlo Sim</span>
          </div>

          <RadiationShieldDiagram3D 
            doseRate={stormShelterEvacuated ? 180 : 14250} 
            cumulative={currentVitals.cumulativeRadiation} 
          />

          <div className="text-[11px] font-mono text-slate-300 space-y-1.5 pt-1">
            <p>
              Hydrogen-rich water ballast surround Module 04 absorbs secondary neutrons and prevents high-Z bremsstrahlung cascade.
            </p>
            <div className="flex justify-between text-[10px] text-emerald-400 font-bold pt-1 border-t border-slate-800">
              <span>Primary Protons Stopped: 92.4%</span>
              <span>Linear Energy Transfer: Low</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}