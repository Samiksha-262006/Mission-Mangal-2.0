import React, { useState } from 'react';
import { 
  Users, AlertTriangle, ShieldCheck, CheckCircle2, 
  Clock, Moon, Sun, ArrowRight, UserCheck, AlertOctagon, Zap, Check 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';
import defaultCrew from '../data/crew.json';
import AstronautBust3D from '../three/AstronautBust3D';

export default function CrewViewPage() {
  const { crew, assignCrewTask, missionDay } = useMissionStore();

  // Safe fallback to defaultCrew if store is ever empty
  const activeCrew = (crew && Array.isArray(crew) && crew.length > 0) ? crew : defaultCrew;

  const [selectedCrewId, setSelectedCrewId] = useState(activeCrew[0]?.id || 'crew_1');
  const [selectedTask, setSelectedTask] = useState('EVA Exterior Solar Array Repair');
  const [taskRisk, setTaskRisk] = useState('Critical');
  const [schedulingWarning, setSchedulingWarning] = useState(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);

  const availableTasks = [
    { name: 'EVA Exterior Solar Array Repair', risk: 'Critical', requiredSleep: 6.0, maxFatigue: 50 },
    { name: 'Manual Docking Thruster Burn', risk: 'Critical', requiredSleep: 6.5, maxFatigue: 45 },
    { name: 'Nuclear Thermal Propulsion Diagnostic', risk: 'Critical', requiredSleep: 6.0, maxFatigue: 50 },
    { name: 'Life Support LiOH Scrubber Swap', risk: 'Medium', requiredSleep: 5.0, maxFatigue: 65 },
    { name: 'Hydroponics Biological Sampling', risk: 'Low', requiredSleep: 4.0, maxFatigue: 80 },
    { name: 'Deep Space Optical Navigation Log', risk: 'Medium', requiredSleep: 5.0, maxFatigue: 65 }
  ];

  const handleTaskSelection = (taskObj) => {
    setSelectedTask(taskObj.name);
    setTaskRisk(taskObj.risk);
    setSchedulingWarning(null);
    setAssignmentSuccess(null);
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    setAssignmentSuccess(null);

    const astronaut = activeCrew.find((c) => c.id === selectedCrewId);
    if (!astronaut) return;

    // Fatigue validation algorithm
    const taskObj = availableTasks.find((t) => t.name === selectedTask) || { risk: taskRisk, maxFatigue: 55, requiredSleep: 5.5 };

    if (taskObj.risk === 'Critical' && ((astronaut.fatigueLevel || 0) > taskObj.maxFatigue || (astronaut.sleepHours || 0) < taskObj.requiredSleep)) {
      soundEngine.playWarningChime();
      setSchedulingWarning({
        crewName: astronaut.name,
        role: astronaut.role,
        fatigue: astronaut.fatigueLevel,
        sleep: astronaut.sleepHours,
        task: selectedTask,
        recommendation: `Cmdr. Sarah Chen (Fatigue 28%) or Dr. Rostova (Fatigue 42%) are biologically cleared for this critical operation.`
      });
      return;
    }

    // Success assign
    soundEngine.playTelemetryPing();
    assignCrewTask(selectedCrewId, selectedTask, taskRisk);
    setSchedulingWarning(null);
    setAssignmentSuccess(`Task "${selectedTask}" assigned to ${astronaut.name}. Biometric safety checks passed.`);
  };

  const handleForceOverride = () => {
    soundEngine.playTelemetryPing();
    const astronaut = activeCrew.find((c) => c.id === selectedCrewId);
    assignCrewTask(selectedCrewId, selectedTask, taskRisk);
    setSchedulingWarning(null);
    setAssignmentSuccess(`COMMANDER OVERRIDE: "${selectedTask}" assigned to ${astronaut?.name || 'Astronaut'} with active fatigue warning.`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Users className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide">
              Crew Telemetry & Fatigue-Aware Scheduler
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/40">
              4-ASTRONAUT MISSION ROSTER
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono break-words">
            Monitors real-time fatigue indexes and prevents high-risk mission operations from being allocated to sleep-deprived personnel.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-300 bg-space-950 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0">
          Sol {missionDay} of 180
        </span>
      </div>

      {/* 4 Astronaut Cards Grid with 3D Helmet Busts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeCrew.map((member) => {
          const isFatigued = (member.fatigueLevel || 0) >= 65;
          const isSelected = member.id === selectedCrewId;
          const statusColor = (member.healthScore || 0) >= 80 
            ? (isFatigued ? '#f59e0b' : '#10b981') 
            : '#ef4444';

          return (
            <div
              key={member.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCrewId(member.id);
                setAssignmentSuccess(null);
              }}
              className={`glass-panel rounded-xl p-4 border transition-all cursor-pointer flex flex-col justify-between group min-w-0 ${
                isSelected 
                  ? 'border-cyan-400 ring-2 ring-cyan-400/40 bg-space-900/90 shadow-[0_0_25px_rgba(0,242,254,0.25)]' 
                  : isFatigued 
                  ? 'border-amber-500/40 bg-amber-950/15 hover:border-amber-400' 
                  : 'border-slate-800 hover:border-slate-600'
              }`}
            >
              <div>
                {/* Header: 3D Bust + Name */}
                <div className="flex items-center gap-3 mb-2 min-w-0">
                  <AstronautBust3D
                    avatarText={member.avatar || 'AS'}
                    statusColor={statusColor}
                    healthScore={member.healthScore || 85}
                    fatigueLevel={member.fatigueLevel || 30}
                    isSelected={isSelected}
                  />

                  <div className="min-w-0 flex-1">
                    <h4 className="font-mono font-bold text-sm text-white truncate">{member.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">{member.role}</span>
                    <span className="text-[9px] font-mono text-mangal-blue block">{member.nationality}</span>
                  </div>
                </div>

                {/* Score & Fatigue */}
                <div className="grid grid-cols-2 gap-2 my-2.5 font-mono text-xs">
                  <div className="p-2 rounded bg-space-950 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">HEALTH SCORE</span>
                    <span className={`text-base font-bold ${(member.healthScore || 0) >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {member.healthScore || 0}%
                    </span>
                  </div>

                  <div className="p-2 rounded bg-space-950 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block">FATIGUE INDEX</span>
                    <span className={`text-base font-bold ${isFatigued ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                      {member.fatigueLevel || 0}%
                    </span>
                  </div>
                </div>

                {/* Sleep & Radiation Meta */}
                <div className="space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-purple-400" />
                      Sleep Duration:
                    </span>
                    <span className={`font-bold ${(member.sleepHours || 0) < 5 ? 'text-red-400' : 'text-white'}`}>
                      {member.sleepHours || 0} hrs
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      Radiation Dose:
                    </span>
                    <span className="text-white font-bold">{member.radiationDose || 0} mSv</span>
                  </div>
                </div>
              </div>

              {/* Current Task Badge */}
              <div className="pt-2.5 mt-3 border-t border-slate-800 min-w-0">
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Current Task:</span>
                <div className="flex items-center justify-between gap-1 text-[11px] font-mono min-w-0">
                  <span className="text-slate-200 truncate flex-1">{member.currentTask || 'Routine Maintenance'}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                    member.taskRisk === 'Critical' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40' 
                      : 'bg-space-950 text-slate-400 border border-slate-700'
                  }`}>
                    {member.taskRisk || 'Low'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fatigue-Aware Task Scheduler Section */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-base text-white tracking-wide">
              Fatigue-Aware Task Assignment Engine
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-space-950 px-2 py-0.5 rounded border border-slate-800">
            Autonomous Safety Interlock Active
          </span>
        </div>

        {assignmentSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 font-mono text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{assignmentSuccess}</span>
          </div>
        )}

        <form onSubmit={handleAssignTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 font-mono text-xs">
          {/* Crew Member Dropdown (4 cols) */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-slate-400 block mb-1">Assignee Crew Member:</label>
            <select
              value={selectedCrewId}
              onChange={(e) => {
                setSelectedCrewId(e.target.value);
                setAssignmentSuccess(null);
              }}
              className="w-full bg-space-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400 text-xs font-mono"
            >
              {activeCrew.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role}) — Fatigue: {m.fatigueLevel}%
                </option>
              ))}
            </select>
          </div>

          {/* Task Select (5 cols) */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-slate-400 block mb-1">Mission Operation / Task:</label>
            <select
              value={selectedTask}
              onChange={(e) => {
                const found = availableTasks.find((t) => t.name === e.target.value);
                if (found) handleTaskSelection(found);
              }}
              className="w-full bg-space-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-400 text-xs font-mono"
            >
              {availableTasks.map((t, idx) => (
                <option key={idx} value={t.name}>
                  [{t.risk.toUpperCase()}] {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button (3 cols) */}
          <div className="md:col-span-3 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-mono text-xs flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(0,242,254,0.3)]"
            >
              <Check className="w-4 h-4" />
              <span>Validate & Assign</span>
            </button>
          </div>
        </form>

        {/* Fatigue Interlock Warning Box */}
        {schedulingWarning && (
          <div className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500 font-mono text-xs space-y-2 animate-pulse">
            <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0" />
              <span>SAFETY INTERLOCK TRIGGERED: FATIGUE THRESHOLD EXCEEDED</span>
            </div>

            <p className="text-slate-200 font-sans leading-relaxed">
              <strong>{schedulingWarning.crewName}</strong> has an active fatigue index of <strong>{schedulingWarning.fatigue}%</strong> and logged only <strong>{schedulingWarning.sleep} hours</strong> of sleep. Assigning the safety-critical task <em>"{schedulingWarning.task}"</em> carries an elevated probability of attentional lapse or motor coordination failure during microgravity operations.
            </p>

            <p className="text-cyan-300 text-[11px]">
              <strong>Recommendation:</strong> {schedulingWarning.recommendation}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-500/30">
              <button
                type="button"
                onClick={() => setSchedulingWarning(null)}
                className="px-3 py-1.5 rounded bg-space-900 border border-slate-700 text-slate-300 text-xs"
              >
                Reassign Task
              </button>
              <button
                type="button"
                onClick={handleForceOverride}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Commander Override
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
