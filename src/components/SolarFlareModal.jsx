import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Shield, ShieldCheck, Clock, MapPin, 
  Radio, CheckCircle2, ChevronRight, X 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';
import SpacecraftModuleMap3D from '../three/SpacecraftModuleMap3D';

export default function SolarFlareModal() {
  const {
    activeEvents,
    solarFlareTimer,
    stormShelterEvacuated,
    setStormShelterEvacuated,
    toggleTriggerEvent,
    currentVitals,
    queuePacket
  } = useMissionStore();

  const [timeLeft, setTimeLeft] = useState(solarFlareTimer || 1080);
  const [selectedModule, setSelectedModule] = useState('mod_04');
  const [dosimeterLogged, setDosimeterLogged] = useState(false);

  useEffect(() => {
    let timer = null;
    if (activeEvents.solarFlare && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeEvents.solarFlare, timeLeft]);

  if (!activeEvents.solarFlare) return null;

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEvacuate = () => {
    soundEngine.playTelemetryPing();
    setStormShelterEvacuated(true);
    queuePacket({
      priority: 'CRITICAL',
      type: 'SPE Evacuation Complete',
      size: '22 KB',
      payload: {
        timestamp: new Date().toISOString(),
        shelter: 'Module 04 - Water Shielded Vault',
        attenuation: '98.5%'
      }
    });
  };

  const handleLogDosimeter = () => {
    soundEngine.playClick();
    setDosimeterLogged(true);
  };

  const handleDismiss = () => {
    soundEngine.playClick();
    toggleTriggerEvent('solarFlare');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto">
      {/* Red Alert Vignette & Screen Shake Effect */}
      <div className="glass-panel-critical max-w-4xl w-full rounded-2xl p-4 sm:p-6 shadow-[0_0_80px_rgba(239,68,68,0.5)] border-2 border-red-500/80 my-auto relative">
        
        {/* Header Alert Banner */}
        <div className="flex items-center justify-between border-b border-red-500/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-lg sm:text-2xl text-red-100 tracking-wider">
                  SOLAR PARTICLE EVENT (SPE) IN PROGRESS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500 text-black animate-pulse">
                  CLASS X-9.4 FLARE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-red-300/80 font-mono">
                Coronal Mass Ejection proton storm inbound. Immediate relocation to Water Storm Shelter required.
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            title="Acknowledge Alert"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-red-950/40"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Telemetry Status Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 font-mono">
          <div className="p-3.5 rounded-xl bg-space-950/80 border border-red-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-red-400 tracking-wider">TIME TO PEAK PROTON FLUX</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-red-400 animate-spin-slow" />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400">T-MINUS</span>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950/80 border border-red-500/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-red-400 tracking-wider">UNSHIELDED DOSE RATE</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-red-400">
                14,250 <span className="text-xs text-red-300">μSv/h</span>
              </div>
            </div>
            <span className="text-[10px] text-red-400/80 animate-pulse">CRITICAL</span>
          </div>

          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
            stormShelterEvacuated 
              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' 
              : 'bg-red-950/60 border-red-500/60 text-red-200'
          }`}>
            <div>
              <span className="text-[10px] tracking-wider">CREW LOCATION STATUS</span>
              <div className="text-lg font-extrabold flex items-center gap-1.5 mt-0.5">
                {stormShelterEvacuated ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>SHELTER SECURED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                    <span>EVACUATION REQUIRED</span>
                  </>
                )}
              </div>
            </div>
            <span className="text-[10px]">{stormShelterEvacuated ? 'SAFE (0.18 mSv/h)' : 'ACTION DUE'}</span>
          </div>
        </div>

        {/* Interactive 3D Spacecraft Module Model */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-cyan-400" />
              3D Spacecraft Module Radiation Attenuation Cutaway
            </span>
            <span className="text-[11px] text-slate-400">Drag to rotate 360°</span>
          </div>

          <SpacecraftModuleMap3D
            isSolarFlare={true}
            isEvacuated={stormShelterEvacuated}
            onSelectModule={(modId) => setSelectedModule(modId)}
          />
        </div>

        {/* Action Controls & Post-Event Logging */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-red-500/30">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Autonomous SPE beacon broadcast to Mars Transport Network.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {!stormShelterEvacuated ? (
              <button
                onClick={handleEvacuate}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold font-mono text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all animate-pulse"
              >
                <Shield className="w-5 h-5" />
                <span>SEAL & ENTER STORM SHELTER</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogDosimeter}
                  disabled={dosimeterLogged}
                  className={`px-4 py-2 rounded-lg font-mono text-xs flex items-center gap-1.5 transition-colors ${
                    dosimeterLogged
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-black font-bold'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{dosimeterLogged ? 'Dosimeter Readout Synced' : 'Log Post-Event Dosimeter'}</span>
                </button>

                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs"
                >
                  Return to HUD
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
