import React, { useState } from 'react';
import { 
  Dumbbell, Activity, CheckCircle2, Flame, Heart, 
  RotateCcw, Calendar, Check, Zap, TrendingUp 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';

export default function ExercisePage() {
  const { 
    currentVitals, 
    completedWorkouts, 
    logWorkout, 
    missionDay 
  } = useMissionStore();

  const [showLogModal, setShowLogModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('ARED Axial Resistance & T2 Interval');
  const [duration, setDuration] = useState(45);
  const [avgHr, setAvgHr] = useState(138);
  const [rpe, setRpe] = useState(7); // Rate of Perceived Exertion (1-10)

  // Calculate tailored daily countermeasure prescription
  const isHighBoneLoss = currentVitals.boneLossPercent > 4.0;
  const isHighFatigue = currentVitals.sleepScore < 60;

  const prescribedResistanceLoad = isHighBoneLoss ? 145 : 125; // kg equivalent load on ARED
  const prescribedCardioDuration = isHighFatigue ? 30 : 45; // minutes
  const prescribedTargetHrZone = '135 - 158 BPM';

  const handleSaveWorkout = (e) => {
    e.preventDefault();
    soundEngine.playTelemetryPing();

    logWorkout({
      type: workoutType,
      duration: Number(duration),
      heartRateAvg: Number(avgHr),
      rpe: Number(rpe),
      calories: Math.round(Number(duration) * 9.2),
      adherence: 100
    });

    setShowLogModal(false);
    alert("Today's workout session recorded in mission biomechanical log.");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono font-bold text-xl text-white">Adaptive Biomechanical Exercise Prescription</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              ARED & T2 TREADMILL INTEGRATION
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Dynamically recalculates daily countermeasure volume based on individual trabecular bone loss (-{currentVitals.boneLossPercent}%) and fatigue telemetry.
          </p>
        </div>

        <button
          onClick={() => {
            soundEngine.playClick();
            setShowLogModal(true);
          }}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] shrink-0"
        >
          <Check className="w-4 h-4" />
          <span>Log Completed Workout</span>
        </button>
      </div>

      {/* Today's Prescribed Prescription Card */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono font-bold text-base text-white">Today's Countermeasure Protocol (Sol {missionDay})</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Prescription Status: DUE TODAY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* Card 1: Resistance ARED */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
            <span className="text-[10px] text-cyan-400 tracking-wider uppercase block">Part A: High-Load Axial Resistance</span>
            <div className="text-xl font-extrabold text-white">ARED Heavy Squat & Deadlift</div>
            <div className="text-xs text-slate-300 space-y-1 pt-1">
              <div>Load: <strong className="text-cyan-300">{prescribedResistanceLoad} kg eq.</strong></div>
              <div>Sets / Reps: <strong>4 sets × 10 reps</strong></div>
              <div>Focus: L1-L5 lumbar axial loading & femoral neck</div>
            </div>
          </div>

          {/* Card 2: Cardiovascular Interval */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
            <span className="text-[10px] text-purple-400 tracking-wider uppercase block">Part B: Aerobic / Plasma Volume</span>
            <div className="text-xl font-extrabold text-white">T2 Treadmill Interval</div>
            <div className="text-xs text-slate-300 space-y-1 pt-1">
              <div>Target Zone: <strong className="text-purple-300">{prescribedTargetHrZone}</strong></div>
              <div>Duration: <strong>{prescribedCardioDuration} minutes</strong></div>
              <div>Harness Loading: <strong>75% body weight bungees</strong></div>
            </div>
          </div>

          {/* Card 3: Physiological Target */}
          <div className="p-4 rounded-xl bg-space-900 border border-slate-800 space-y-2">
            <span className="text-[10px] text-amber-400 tracking-wider uppercase block">Part C: Clinical Countermeasure Goal</span>
            <div className="text-xl font-extrabold text-white">Attenuate BMD Resorption</div>
            <div className="text-xs text-slate-300 space-y-1 pt-1">
              <div>Target Expenditure: <strong>~420 kcal</strong></div>
              <div>Hydration Prep: <strong>500 mL ORS prior</strong></div>
              <div>Recovery: <strong>25g Whey Protein + Vit D3</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Workout History & Mission Adherence */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Completed Exercise Logs ({completedWorkouts.length} Sessions)
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Cumulative Mission Adherence: 96.4%
          </span>
        </div>

        <div className="space-y-2.5">
          {completedWorkouts.map((workout) => (
            <div
              key={workout.id}
              className="p-3.5 rounded-xl bg-space-900 border border-slate-800 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold text-sm">{workout.type}</span>
                  <span className="text-[10px] text-slate-500">• Sol {workout.day}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Duration: {workout.duration} min • Avg HR: {workout.heartRateAvg || 135} bpm • RPE: {workout.rpe || 7}/10
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                  {workout.calories || 380} kcal
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Log Workout Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-cyan-500/40 shadow-2xl relative">
            <h3 className="font-mono font-bold text-white text-base mb-4 border-b border-slate-800 pb-2">
              Log Completed Spaceflight Workout
            </h3>

            <form onSubmit={handleSaveWorkout} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Session Type</label>
                <input
                  type="text"
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="10"
                    max="180"
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Average Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={avgHr}
                    onChange={(e) => setAvgHr(e.target.value)}
                    min="80"
                    max="190"
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Perceived Exertion (RPE 1-10)</label>
                <input
                  type="number"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  min="1"
                  max="10"
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 rounded bg-space-900 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
