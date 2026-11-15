import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, Activity, CheckCircle2, Flame, Heart, 
  RotateCcw, Calendar, Check, Zap, TrendingUp, Play, 
  Pause, Clock, Award, Shield, AlertTriangle, ArrowRight,
  Sparkles, Moon
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { soundEngine } from '../utils/audio';
import VisualCard from '../components/VisualCard';
import {
  GoogleAxialBiomechanicsDiagram,
  GoogleAerobicCardioCurveDiagram,
  GoogleBoneRemodelingDiagram
} from '../components/BiometricDiagrams3D';

// ─── Hero: Animated Astronaut Workout Simulation (SVG) ──────────────────────
function AstronautExerciseHero({ missionDay }) {
  return (
    <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-slate-950 via-space-950 to-slate-950 border border-cyan-500/30 flex items-center justify-center">
      {/* Background stars & glowing ambient mesh */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <svg className="w-full h-full">
          {[...Array(30)].map((_, i) => (
            <circle
              key={i}
              cx={(i * 53 + 17) % 500}
              cy={(i * 37 + 13) % 250}
              r={(i % 3) * 0.8 + 0.6}
              fill="#00f2fe"
              opacity={0.3 + (i % 4) * 0.2}
            />
          ))}
          <line x1="0" y1="210" x2="600" y2="210" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
        </svg>
      </div>

      {/* Animated Astronaut Figure */}
      <div className="relative z-10 flex flex-col items-center">
        <svg viewBox="0 0 160 200" width="160" height="190" className="overflow-visible">
          <defs>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Bungee suspension lines to harness */}
          <line x1="45" y1="20" x2="65" y2="90" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          <line x1="115" y1="20" x2="95" y2="90" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
          <circle cx="45" cy="20" r="3" fill="#f59e0b" />
          <circle cx="115" cy="20" r="3" fill="#f59e0b" />

          {/* Astronaut Body with Squat Keyframe animation */}
          <g className="animate-squat" style={{ transformOrigin: '80px 180px' }}>
            
            {/* Treadmill / Resistance platform base */}
            <rect x="30" y="175" width="100" height="10" rx="3" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
            <line x1="35" y1="180" x2="125" y2="180" stroke="#06b6d4" strokeWidth="1" strokeDasharray="6 4" />

            {/* Helmet */}
            <circle cx="80" cy="45" r="24" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
            {/* Visor */}
            <ellipse cx="80" cy="45" rx="16" ry="14" fill="#164e63" opacity="0.9" />
            <ellipse cx="78" cy="43" rx="12" ry="10" fill="#06b6d4" opacity="0.4" filter="url(#glow-cyan)" />
            <path d="M72 38 Q78 34 84 38" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

            {/* Torso Suit */}
            <rect x="60" y="70" width="40" height="50" rx="8" fill="url(#suitGrad)" stroke="#06b6d4" strokeWidth="1.8" />
            {/* Chest Harness Pack */}
            <rect x="68" y="76" width="24" height="26" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="80" cy="85" r="4" fill="#10b981" className="animate-pulse" />
            <rect x="73" y="93" width="14" height="3" rx="1" fill="#f59e0b" />

            {/* Left Arm (holding resistance grip) */}
            <path d="M60 76 L42 95 L52 110" fill="none" stroke="#06b6d4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="52" cy="110" r="3.5" fill="#f59e0b" />

            {/* Right Arm (holding resistance grip) */}
            <path d="M100 76 L118 95 L108 110" fill="none" stroke="#06b6d4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="108" cy="110" r="3.5" fill="#f59e0b" />

            {/* Left Leg */}
            <path d="M68 120 L58 145 L64 175" fill="none" stroke="#06b6d4" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="58" y="173" width="14" height="5" rx="2" fill="#38bdf8" />

            {/* Right Leg */}
            <path d="M92 120 L102 145 L96 175" fill="none" stroke="#06b6d4" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="90" y="173" width="14" height="5" rx="2" fill="#38bdf8" />

          </g>
        </svg>

        <style>{`
          @keyframes squatMotion {
            0%, 100% { transform: translateY(0px) scaleY(1); }
            50% { transform: translateY(14px) scaleY(0.92); }
          }
          .animate-squat {
            animation: squatMotion 2.4s ease-in-out infinite;
          }
        `}</style>

        <div className="mt-1 flex items-center gap-2 font-mono text-xs text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Workout Protocol · Sol {missionDay}</span>
          <span className="text-slate-400">· Zero-G Resistance</span>
        </div>
      </div>

      <div className="absolute top-3 left-4 bg-slate-900/80 backdrop-blur rounded-lg px-3 py-1.5 border border-cyan-500/30 text-xs font-mono text-cyan-300">
        ARED &amp; T2 Treadmill System
      </div>
      <div className="absolute top-3 right-4 bg-emerald-950/80 backdrop-blur rounded-lg px-3 py-1.5 border border-emerald-500/40 text-xs font-mono text-emerald-300">
        Status: DUE TODAY
      </div>
    </div>
  );
}

// ─── Bone Strength Loss Diagram (Spine & Hip SVG) ────────────────────────────
function BoneStrengthDiagram({ boneLoss = -1.42 }) {
  const lossNum = Math.abs(boneLoss);
  // Color interpolates from safe green to orange/red
  const color = lossNum > 3.0 ? '#ef4444' : lossNum > 1.5 ? '#f59e0b' : '#10b981';

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
      {/* Anatomical Spine & Pelvis SVG */}
      <div className="shrink-0 flex items-center justify-center p-2 bg-slate-900/80 rounded-xl border border-slate-800">
        <svg viewBox="0 0 90 150" width="75" height="125" fill="none">
          {/* Vertebrae L1 to L5 */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="30"
              y={18 + i * 16}
              width="30"
              height="10"
              rx="3"
              fill={color}
              fillOpacity={0.85 - i * 0.08}
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          ))}
          {/* Sacrum & Pelvic Wings */}
          <path
            d="M20 102 C15 115 18 135 32 140 C40 142 45 125 45 105 C45 125 50 142 58 140 C72 135 75 115 70 102 Z"
            fill={color}
            fillOpacity="0.75"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          {/* Femoral Heads */}
          <circle cx="16" cy="118" r="7" fill={color} fillOpacity="0.8" />
          <circle cx="74" cy="118" r="7" fill={color} fillOpacity="0.8" />
        </svg>
      </div>

      {/* Metrics & Explanation */}
      <div className="space-y-2 flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="text-2xl font-black font-mono" style={{ color }}>
            {boneLoss}%
          </span>
          <span className="text-xs font-mono text-slate-300 font-semibold">
            Bone strength loss this month
          </span>
        </div>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Without gravity, bones lose calcium quickly. Heavy axial squats force your hip and spine bones to rebuild density daily.
        </p>

        {/* Meter Gauge */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>0% (Earth Normal)</span>
            <span>Target: &lt; 2.0%</span>
            <span>4% (High Risk)</span>
          </div>
          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500"
              style={{ width: `${Math.min(100, (lossNum / 4) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Heart-Rate Zones Colored Band ───────────────────────────────────────────
function HeartRateZonesBand({ targetMin = 135, targetMax = 158 }) {
  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-white font-bold flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-rose-400" />
          Heart-Rate Cardio Zones (Beats / Min)
        </span>
        <span className="text-amber-300 font-bold">
          Target: {targetMin} – {targetMax} BPM
        </span>
      </div>

      {/* Horizontal Colored Band */}
      <div className="relative h-9 rounded-xl overflow-hidden flex font-mono text-[10px] text-white font-bold shadow-inner">
        <div className="bg-blue-900/80 flex items-center justify-center text-blue-200 border-r border-slate-900" style={{ width: '20%' }}>
          Rest 60-80
        </div>
        <div className="bg-emerald-900/80 flex items-center justify-center text-emerald-200 border-r border-slate-900" style={{ width: '25%' }}>
          Easy 80-110
        </div>
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] border-r border-slate-900" style={{ width: '28%' }}>
          🎯 Target 135-158
        </div>
        <div className="bg-orange-800/80 flex items-center justify-center text-orange-200 border-r border-slate-900" style={{ width: '15%' }}>
          Hard 158+
        </div>
        <div className="bg-red-900/80 flex items-center justify-center text-red-200" style={{ width: '12%' }}>
          Max
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>Warmup &amp; recovery</span>
        <span className="text-amber-300 font-semibold">Plasma volume preservation zone</span>
        <span>Anaerobic ceiling</span>
      </div>
    </div>
  );
}

// ─── Weekly Calendar Strip ───────────────────────────────────────────────────
function WeeklyCalendarStrip() {
  const weekDays = [
    { day: 'Mon', status: 'done', label: 'Squats' },
    { day: 'Tue', status: 'done', label: 'Treadmill' },
    { day: 'Wed', status: 'done', label: 'ARED' },
    { day: 'Thu', status: 'today', label: 'Full Plan' },
    { day: 'Fri', status: 'upcoming', label: 'Cardio' },
    { day: 'Sat', status: 'upcoming', label: 'ARED' },
    { day: 'Sun', status: 'rest', label: 'Rest Day' }
  ];

  return (
    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-cyan-400" />
          Weekly Workout Schedule (Sol 36 – 42)
        </span>
        <span className="text-emerald-400 font-semibold">3 of 5 Completed (60%)</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center font-mono text-xs">
        {weekDays.map((d, i) => {
          const isDone = d.status === 'done';
          const isToday = d.status === 'today';
          const isRest = d.status === 'rest';

          return (
            <div
              key={i}
              className={`p-2 rounded-xl border flex flex-col items-center justify-between min-h-[72px] transition-all ${
                isToday
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-105'
                  : isDone
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : isRest
                  ? 'bg-slate-900/50 border-slate-800 text-slate-400'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase">{d.day}</span>
              
              <div className="my-1">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isToday ? (
                  <div className="w-5 h-5 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                ) : isRest ? (
                  <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700" />
                )}
              </div>

              <span className={`text-[9px] font-semibold truncate max-w-full ${isToday ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                {isToday ? 'TODAY' : d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Workout Timer Component ─────────────────────────────────────────────────
function WorkoutTimer({ onLogWorkout }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const toggleTimer = () => {
    soundEngine.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundEngine.playClick();
    setIsRunning(false);
    setSeconds(0);
  };

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleFinish = () => {
    soundEngine.playTelemetryPing();
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
      onLogWorkout(Math.max(1, Math.round(seconds / 60)));
    }, 1800);
  };

  return (
    <div className="relative p-5 rounded-2xl bg-gradient-to-r from-space-950 via-slate-900 to-space-950 border border-cyan-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 overflow-hidden">
      
      {/* Confetti Animation Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
          <div className="text-center animate-bounce">
            <span className="text-4xl">🎉</span>
            <div className="text-lg font-mono font-black text-cyan-300 [text-shadow:0_0_15px_#06b6d4]">
              WORKOUT COMPLETED!
            </div>
          </div>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${10 + Math.random() * 80}%`,
                backgroundColor: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#a855f7'][i % 5]
              }}
            />
          ))}
        </div>
      )}

      {/* Timer Display */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Session Stopwatch
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest drop-shadow">
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      {/* Timer Controls & Log Button */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleTimer}
          className={`px-4 py-2.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
            isRunning 
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' 
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? 'Pause' : 'Start Timer'}</span>
        </button>

        <button
          onClick={resetTimer}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Reset Stopwatch"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleFinish}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-mono font-black text-xs flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Log Workout</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main ExercisePage Component ─────────────────────────────────────────────
export default function ExercisePage() {
  const { 
    currentVitals, 
    completedWorkouts, 
    logWorkout, 
    missionDay 
  } = useMissionStore();

  const { t } = useLanguage();

  const [showLogModal, setShowLogModal] = useState(false);
  const [workoutType, setWorkoutType] = useState('Heavy Squats (strength machine) & Treadmill');
  const [duration, setDuration] = useState(45);
  const [avgHr, setAvgHr] = useState(142);
  const [rpe, setRpe] = useState(7);
  const [successToast, setSuccessToast] = useState('');

  const isHighBoneLoss = currentVitals.boneLossPercent > 2.0;
  const isHighFatigue = currentVitals.sleepScore < 60;

  const prescribedLoad = isHighBoneLoss ? 140 : 125;
  const prescribedDuration = isHighFatigue ? 30 : 45;

  const handleSaveWorkout = (e) => {
    if (e) e.preventDefault();
    soundEngine.playTelemetryPing();

    logWorkout({
      type: workoutType,
      duration: Number(duration),
      heartRateAvg: Number(avgHr),
      rpe: Number(rpe),
      calories: Math.round(Number(duration) * 9.3),
      adherence: 100
    });

    setShowLogModal(false);
    setSuccessToast("Today's exercise recorded in health data. Bone and heart protection logged!");
    setTimeout(() => setSuccessToast(''), 4500);
  };

  const handleDirectLog = (minutes) => {
    setDuration(minutes || 45);
    handleSaveWorkout(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-1 sm:px-2 overflow-x-hidden">

      {/* ─── 1. HERO: Animated Astronaut Workout Simulation ─── */}
      <AstronautExerciseHero missionDay={missionDay} />

      {/* Success Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ─── 2. 3 ILLUSTRATED EXERCISE PROTOCOL CARDS ─── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 font-display text-sm"
            style={{ textShadow: '0 0 20px rgba(6,182,212,0.5)' }}>
            <Zap className="w-4 h-4 text-amber-400" />
            Today's Daily Exercise Plan (Sol {missionDay})
          </span>
          <span className="text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-500/40">
            Status: Due Today
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card A: Strength (Heavy Squats) */}
          <VisualCard accent="emerald" className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Part A · Strength
                </span>
                <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  <Dumbbell className="w-5 h-5" />
                </div>
              </div>

              {/* Illustration: Resistance Squat Machine */}
              <div className="h-28 rounded-xl bg-slate-950/80 border border-slate-800 mb-3 flex items-center justify-center p-2">
                <svg viewBox="0 0 120 70" width="120" height="70" fill="none">
                  <line x1="20" y1="58" x2="100" y2="58" stroke="#334155" strokeWidth="2" />
                  <rect x="25" y="25" width="6" height="33" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
                  <rect x="89" y="25" width="6" height="33" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
                  {/* Barbell Bar */}
                  <line x1="15" y1="28" x2="105" y2="28" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                  {/* Weight plates */}
                  <rect x="18" y="20" width="5" height="16" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
                  <rect x="97" y="20" width="5" height="16" rx="2" fill="#047857" stroke="#10b981" strokeWidth="1" />
                  {/* Center load indicator */}
                  <circle cx="60" cy="28" r="4" fill="#34d399" />
                </svg>
              </div>

              <h3 className="font-mono font-black text-base text-white">
                Heavy squats (strength machine)
              </h3>
              <div className="text-xs font-mono text-emerald-300 font-semibold mt-1">
                {prescribedLoad} kg load · 4 sets × 10 reps
              </div>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                Back and hip bones get the workout. Builds leg muscles and stops zero-G bone loss.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Focus: L1-L5 lumbar axial load
            </div>
            {/* Google Biomechanics Axial Load Diagram */}
            <div className="mt-2">
              <GoogleAxialBiomechanicsDiagram />
            </div>
          </VisualCard>

          {/* Card B: Cardio (Treadmill with Bungees) */}
          <VisualCard accent="cyan" className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Part B · Cardio
                </span>
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              {/* Illustration: Treadmill with Bungees */}
              <div className="h-28 rounded-xl bg-slate-950/80 border border-slate-800 mb-3 flex items-center justify-center p-2">
                <svg viewBox="0 0 120 70" width="120" height="70" fill="none">
                  {/* Angled Treadmill Bed */}
                  <polygon points="15,55 105,48 100,56 12,62" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.2" />
                  {/* Rollers */}
                  <circle cx="20" cy="58" r="4" fill="#0891b2" />
                  <circle cx="100" cy="52" r="4" fill="#0891b2" />
                  {/* Handrails & bungee anchor posts */}
                  <path d="M85 50 L85 24 L70 24" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
                  {/* Bungee elastic lines */}
                  <line x1="45" y1="20" x2="52" y2="40" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="2 2" />
                  <line x1="68" y1="20" x2="60" y2="40" stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="2 2" />
                </svg>
              </div>

              <h3 className="font-mono font-black text-base text-white">
                Running on a treadmill (with straps)
              </h3>
              <div className="text-xs font-mono text-cyan-300 font-semibold mt-1">
                Target: 135–158 BPM · {prescribedDuration} minutes
              </div>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                Straps equal to 75% of your weight hold you down so your feet touch the treadmill safely.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Preserves blood plasma volume
            </div>
            {/* Google Aerobic Cardio Curve */}
            <div className="mt-2">
              <GoogleAerobicCardioCurveDiagram />
            </div>
          </VisualCard>

          {/* Card C: Goal (Keep Bones Strong) */}
          <VisualCard accent="amber" className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Part C · Mission Goal
                </span>
                <div className="p-2 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  <Flame className="w-5 h-5" />
                </div>
              </div>

              {/* Illustration: Bone lattice */}
              <div className="h-28 rounded-xl bg-slate-950/80 border border-slate-800 mb-3 flex items-center justify-center p-2">
                <svg viewBox="0 0 120 70" width="120" height="70" fill="none">
                  {/* Bone shaft with honeycomb lattice */}
                  <rect x="25" y="28" width="70" height="14" rx="4" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="25" cy="35" r="9" fill="#78350f" stroke="#f59e0b" strokeWidth="1.2" />
                  <circle cx="95" cy="35" r="9" fill="#78350f" stroke="#f59e0b" strokeWidth="1.2" />
                  {/* Bone cells */}
                  {[35, 50, 65, 80].map((x, i) => (
                    <circle key={i} cx={x} cy="35" r="3" fill="#fbbf24" opacity="0.9" />
                  ))}
                </svg>
              </div>

              <h3 className="font-mono font-black text-base text-white">
                Keep your bones strong
              </h3>
              <div className="text-xs font-mono text-amber-300 font-semibold mt-1">
                Burn ~420 calories · Drink 500 mL water
              </div>
              <p className="text-xs text-slate-300 font-sans mt-2 leading-relaxed">
                Prevents bone density loss in microgravity. After session: drink protein shake with Vitamin D.
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400">
              Counteract microgravity calcium loss
            </div>
            {/* Google Bone Remodeling Cycle Diagram */}
            <div className="mt-2">
              <GoogleBoneRemodelingDiagram />
            </div>
          </VisualCard>

        </div>
      </div>

      {/* ─── 3. BONE STRENGTH DIAGRAM & HEART RATE ZONES ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <VisualCard accent="emerald" className="p-4 space-y-2">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block"
            style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
            Bone Strength Monitoring
          </span>
          <BoneStrengthDiagram boneLoss={-Number(currentVitals.boneLossPercent || 1.42)} />
        </VisualCard>

        <VisualCard accent="amber" className="p-4 space-y-2">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider block"
            style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
            Target Heart Rate Zones
          </span>
          <HeartRateZonesBand targetMin={135} targetMax={158} />
        </VisualCard>
      </div>

      {/* ─── 4. WEEKLY SCHEDULE STRIP ─── */}
      <VisualCard accent="cyan" className="p-4">
        <WeeklyCalendarStrip />
      </VisualCard>

      {/* ─── 5. WORKOUT TIMER & LOGGING ─── */}
      <WorkoutTimer onLogWorkout={handleDirectLog} />

      {/* ─── 6. WORKOUT HISTORY TABLE ─── */}
      <VisualCard accent="slate" className="p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
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
              className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold text-sm">{workout.type}</span>
                  <span className="text-[10px] text-slate-400">• Sol {workout.day}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Duration: {workout.duration} min • Avg HR: {workout.heartRateAvg || 138} bpm • Burned: {workout.calories || 414} kcal
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ✓ Validated Adherence
              </span>
            </div>
          ))}
        </div>
      </VisualCard>

    </div>
  );
}
