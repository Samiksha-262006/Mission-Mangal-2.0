import React from 'react';
import { Compass, Clock, Orbit } from 'lucide-react';
import MissionSimulatorBar from '../components/MissionSimulatorBar';
import { useMissionStore } from '../store/useMissionStore';

export default function MissionControlPage() {
  const { missionDay } = useMissionStore();

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Compass className="w-5 h-5 text-mangal-orange shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              Mission Control & Trajectory Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-300 font-mono break-words">
            Earth → Mars Hohmann transfer orbit visualization. Use the timeline, play/pause, and trigger contingency events to simulate mission scenarios.
          </p>
        </div>
        <span className="text-xs font-mono text-mangal-gold bg-space-950 px-3 py-1.5 rounded-lg border border-mangal-copper/40 shrink-0">
          Sol {missionDay} / 180
        </span>
      </div>

      {/* Full Mission Simulator Bar with 3D trajectory */}
      <MissionSimulatorBar />
    </div>
  );
}
