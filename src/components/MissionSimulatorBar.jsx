import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, FastForward, Sun, HeartPulse, 
  WifiOff, Users, AlertTriangle, RotateCcw, Clock, Compass, Globe 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';
import MissionTrajectory3D from '../three/MissionTrajectory3D';

export default function MissionSimulatorBar() {
  const {
    missionDay,
    setMissionDay,
    isPlaying,
    setIsPlaying,
    playSpeed,
    setPlaySpeed,
    advanceSimulationTick,
    activeEvents,
    toggleTriggerEvent
  } = useMissionStore();

  const [show3DTrajectory, setShow3DTrajectory] = useState(true);

  // Tick simulation loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      const ms = Math.max(80, Math.floor(1000 / playSpeed));
      interval = setInterval(() => {
        advanceSimulationTick();
      }, ms);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playSpeed, advanceSimulationTick]);

  const handleDayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setMissionDay(val);
  };

  const jumpToDay = (day) => {
    soundEngine.playClick();
    setMissionDay(day);
  };

  const handleToggleEvent = (type) => {
    toggleTriggerEvent(type);
  };

  return (
    <div className="w-full glass-panel border border-mangal-blue/20 rounded-xl p-3 sm:p-4 mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-3">
      
      {/* 3D Heliocentric Transfer Arc (Togglable) */}
      {show3DTrajectory && (
        <MissionTrajectory3D missionDay={missionDay} />
      )}

      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Timeline Slider Section */}
        <div className="w-full lg:w-7/12 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-mangal-orange font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
                <Clock className="w-4 h-4 text-mangal-copper" />
                Mission Timeline
              </span>
              <span className="text-slate-400">Earth ➔ Mars Transit (180 Sols)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShow3DTrajectory(!show3DTrajectory)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                  show3DTrajectory ? 'bg-mangal-blue/20 text-cyan-300 border-mangal-blue/40' : 'bg-space-900 text-slate-400 border-slate-700'
                }`}
              >
                {show3DTrajectory ? 'Hide 3D Orbit' : 'View 3D Orbit'}
              </button>

              <div className="flex items-center gap-1 text-slate-300">
                <span>Sol:</span>
                <span className="text-mangal-gold font-bold text-sm bg-space-950 px-2 py-0.5 rounded border border-mangal-copper/40">
                  {missionDay}
                </span>
              </div>
            </div>
          </div>

          {/* Range Slider */}
          <div className="relative py-1">
            <input
              type="range"
              min="1"
              max="180"
              value={missionDay}
              onChange={handleDayChange}
              className="w-full h-2.5 bg-space-900 rounded-lg appearance-none cursor-pointer accent-mangal-copper border border-slate-700 focus:outline-none focus:ring-1 focus:ring-mangal-copper"
            />
            {/* Mission Milestone Markers */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <button onClick={() => jumpToDay(1)} className="hover:text-mangal-orange transition-colors">Day 1: Launch</button>
              <button onClick={() => jumpToDay(45)} className="hover:text-mangal-orange transition-colors hidden sm:inline">Day 45: Deep Cruise</button>
              <button onClick={() => jumpToDay(90)} className="hover:text-mangal-orange transition-colors">Day 90: Midpoint</button>
              <button onClick={() => jumpToDay(140)} className="hover:text-mangal-orange transition-colors hidden sm:inline">Day 140: Decel</button>
              <button onClick={() => jumpToDay(180)} className="hover:text-mangal-orange transition-colors">Day 180: Mars Arrival</button>
            </div>
          </div>
        </div>

        {/* Playback Controls & Trigger Events */}
        <div className="w-full lg:w-5/12 flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
          {/* Play / Pause / Speed */}
          <div className="flex items-center gap-1.5 bg-space-900/90 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsPlaying(!isPlaying);
              }}
              title={isPlaying ? "Pause Simulation" : "Play Simulation"}
              className={`p-2 rounded-md font-mono text-xs flex items-center gap-1 transition-all ${
                isPlaying 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-mangal-copper/20 text-mangal-orange hover:bg-mangal-copper/30 border border-mangal-copper/40'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden sm:inline font-bold">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            {/* Speed Selector */}
            {[1, 5, 15].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  soundEngine.playClick();
                  setPlaySpeed(spd);
                }}
                className={`px-2 py-1.5 rounded text-xs font-mono transition-colors ${
                  playSpeed === spd 
                    ? 'bg-mangal-blue/30 text-white font-bold border border-mangal-blue/50' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}

            <button
              onClick={() => {
                soundEngine.playClick();
                setMissionDay(1);
              }}
              title="Reset to Day 1"
              className="p-1.5 text-slate-400 hover:text-white rounded"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Trigger Event Panel */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Solar Flare */}
            <button
              onClick={() => handleToggleEvent('solarFlare')}
              title="Trigger Solar Particle Event (SPE)"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeEvents.solarFlare 
                  ? 'bg-red-500/30 text-red-200 border border-red-500 ring-2 ring-red-500/40 animate-pulse' 
                  : 'bg-space-900/80 text-slate-300 hover:text-red-300 hover:bg-red-950/30 border border-slate-700'
              }`}
            >
              <Sun className={`w-3.5 h-3.5 ${activeEvents.solarFlare ? 'text-red-400 animate-spin-slow' : 'text-amber-400'}`} />
              <span>Solar Flare</span>
            </button>

            {/* Chest Pain */}
            <button
              onClick={() => handleToggleEvent('chestPain')}
              title="Trigger Cardiac Chest Pain Emergency"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeEvents.chestPain 
                  ? 'bg-red-500/30 text-red-200 border border-red-500 ring-2 ring-red-500/40 animate-pulse' 
                  : 'bg-space-900/80 text-slate-300 hover:text-red-300 hover:bg-red-950/30 border border-slate-700'
              }`}
            >
              <HeartPulse className={`w-3.5 h-3.5 ${activeEvents.chestPain ? 'text-red-400 animate-bounce' : 'text-rose-400'}`} />
              <span>Chest Pain</span>
            </button>

            {/* Comm Blackout */}
            <button
              onClick={() => handleToggleEvent('commBlackout')}
              title="Trigger Communication Link Conjunction Blackout"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeEvents.commBlackout 
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-500 ring-2 ring-amber-500/40' 
                  : 'bg-space-900/80 text-slate-300 hover:text-amber-300 hover:bg-amber-950/30 border border-slate-700'
              }`}
            >
              <WifiOff className={`w-3.5 h-3.5 ${activeEvents.commBlackout ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Blackout</span>
            </button>

            {/* Crew Conflict */}
            <button
              onClick={() => handleToggleEvent('crewConflict')}
              title="Trigger Crew Behavioral Stress Surge"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all ${
                activeEvents.crewConflict 
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500 ring-2 ring-purple-500/40' 
                  : 'bg-space-900/80 text-slate-300 hover:text-purple-300 hover:bg-purple-950/30 border border-slate-700'
              }`}
            >
              <Users className={`w-3.5 h-3.5 ${activeEvents.crewConflict ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>Conflict</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
