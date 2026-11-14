import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Activity, Droplets, Thermometer, Moon, Zap, 
  ShieldAlert, Cpu, Sparkles, Orbit, BarChart3, Box
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { useMissionStore } from '../store/useMissionStore';
import RadialHealthGauge from '../components/RadialHealthGauge';
import AstronautBodyScanner3D from '../three/AstronautBodyScanner3D';
import { 
  HeartDiagram3D, SpO2Diagram3D, BloodPressureDiagram3D, 
  BodyTempDiagram3D, SleepDiagram3D, StressDiagram3D, FluidShiftDiagram3D 
} from '../components/BiometricDiagrams3D';
import { detectHealthDrifts } from '../utils/anomaly';
import { soundEngine } from '../utils/audio';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentVitals, vitalsHistory, baseline, activeEvents, missionDay } = useMissionStore();

  const [scannerFocus, setScannerFocus] = useState('heart');
  // Card visualization mode per card: '3d' or 'sparkline' (default '3d')
  const [viewModes, setViewModes] = useState({});

  const toggleCardView = (cardId) => {
    soundEngine.playClick();
    setViewModes(prev => ({
      ...prev,
      [cardId]: prev[cardId] === 'sparkline' ? '3d' : 'sparkline'
    }));
  };

  const drifts = detectHealthDrifts(currentVitals, baseline, vitalsHistory);

  // Sparkline history (last 14 days)
  const sparklineHistory = vitalsHistory.slice(-14).map((v) => ({
    day: v.day,
    hr: v.heartRate,
    spo2: v.spO2,
    sys: v.systolic,
    temp: v.bodyTemp,
    sleep: v.sleepScore,
    stress: v.stressScore,
    hydration: v.hydration,
    shift: v.fluidShiftIndex
  }));

  const metricCards = [
    {
      id: 'hr',
      title: 'Resting Heart Rate',
      value: `${currentVitals.heartRate}`,
      unit: 'BPM',
      icon: Heart,
      iconColor: 'text-rose-400',
      dataKey: 'hr',
      chartColor: '#f43f5e',
      baseline: `${baseline.heartRate} bpm`,
      delta: `${currentVitals.heartRate >= baseline.heartRate ? '+' : ''}${currentVitals.heartRate - baseline.heartRate} vs base`,
      status: currentVitals.heartRate > 95 ? 'critical' : currentVitals.heartRate > 78 ? 'warning' : 'nominal',
      render3D: () => <HeartDiagram3D bpm={currentVitals.heartRate} status={currentVitals.heartRate > 95 ? 'critical' : currentVitals.heartRate > 78 ? 'warning' : 'nominal'} />
    },
    {
      id: 'spo2',
      title: 'Blood Oxygen (SpO2)',
      value: `${currentVitals.spO2}`,
      unit: '%',
      icon: Activity,
      iconColor: 'text-cyan-400',
      dataKey: 'spo2',
      chartColor: '#2e8bff',
      baseline: `${baseline.spO2}%`,
      delta: `${currentVitals.spO2 - baseline.spO2}% vs base`,
      status: currentVitals.spO2 < 95 ? 'critical' : currentVitals.spO2 < 97 ? 'warning' : 'nominal',
      render3D: () => <SpO2Diagram3D spo2={currentVitals.spO2} />
    },
    {
      id: 'bp',
      title: 'Arterial Pressure',
      value: `${currentVitals.systolic}/${currentVitals.diastolic}`,
      unit: 'mmHg',
      icon: Activity,
      iconColor: 'text-mangal-orange',
      dataKey: 'sys',
      chartColor: '#e8894f',
      baseline: `${baseline.systolic}/${baseline.diastolic}`,
      delta: `Sys +${currentVitals.systolic - baseline.systolic}`,
      status: currentVitals.systolic > 140 ? 'critical' : currentVitals.systolic > 125 ? 'warning' : 'nominal',
      render3D: () => <BloodPressureDiagram3D sys={currentVitals.systolic} dia={currentVitals.diastolic} />
    },
    {
      id: 'temp',
      title: 'Core Temperature',
      value: `${currentVitals.bodyTemp}`,
      unit: '°C',
      icon: Thermometer,
      iconColor: 'text-amber-400',
      dataKey: 'temp',
      chartColor: '#f59e0b',
      baseline: `${baseline.bodyTemp}°C`,
      delta: `+${(currentVitals.bodyTemp - baseline.bodyTemp).toFixed(1)}°C`,
      status: currentVitals.bodyTemp > 37.8 ? 'critical' : currentVitals.bodyTemp > 37.2 ? 'warning' : 'nominal',
      render3D: () => <BodyTempDiagram3D temp={currentVitals.bodyTemp} />
    },
    {
      id: 'sleep',
      title: 'Circadian Sleep Quality',
      value: `${currentVitals.sleepScore}`,
      unit: '/100',
      icon: Moon,
      iconColor: 'text-purple-400',
      dataKey: 'sleep',
      chartColor: '#a855f7',
      baseline: '85/100',
      delta: `${currentVitals.sleepScore - 85} pts`,
      status: currentVitals.sleepScore < 50 ? 'critical' : currentVitals.sleepScore < 65 ? 'warning' : 'nominal',
      render3D: () => <SleepDiagram3D score={currentVitals.sleepScore} />
    },
    {
      id: 'stress',
      title: 'Autonomic Stress Index',
      value: `${currentVitals.stressScore}`,
      unit: '/100',
      icon: Zap,
      iconColor: 'text-yellow-400',
      dataKey: 'stress',
      chartColor: '#eab308',
      baseline: '25/100',
      delta: `+${currentVitals.stressScore - 25} pts`,
      status: currentVitals.stressScore > 75 ? 'critical' : currentVitals.stressScore > 60 ? 'warning' : 'nominal',
      render3D: () => <StressDiagram3D stress={currentVitals.stressScore} />
    },
    {
      id: 'fluid',
      title: 'Cephalad Fluid Shift / SANS',
      value: `+${currentVitals.fluidShiftIndex}`,
      unit: 'σ Index',
      icon: Droplets,
      iconColor: 'text-teal-400',
      dataKey: 'shift',
      chartColor: '#10b981',
      baseline: '+1.0σ (1G)',
      delta: `Hydration ${currentVitals.hydration}%`,
      status: currentVitals.fluidShiftIndex > 2.0 ? 'critical' : currentVitals.fluidShiftIndex > 1.6 ? 'warning' : 'nominal',
      render3D: () => <FluidShiftDiagram3D shift={currentVitals.fluidShiftIndex} />
    }
  ];

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-hidden">
      
      {/* Top Hero Section: Radial Health Gauge + 3D Astronaut Scanner + Drift Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        
        {/* Radial Health Gauge Panel (4 cols) */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col items-center justify-between relative overflow-hidden card-3d-hover">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono text-mangal-blue font-bold tracking-widest uppercase">
              AUTONOMOUS HEALTH SCORE
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              Sol {missionDay} Active
            </span>
          </div>

          <RadialHealthGauge
            score={currentVitals.healthScore}
            vitals={currentVitals}
            activeEvents={activeEvents}
          />

          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-800">
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">TOTAL GCR DOSE</span>
              <span className="text-white font-bold">{currentVitals.cumulativeRadiation} mSv</span>
            </div>
            <div className="p-2 rounded bg-space-950 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">BONE LOSS</span>
              <span className="text-amber-400 font-bold">-{currentVitals.boneLossPercent}%</span>
            </div>
          </div>
        </div>

        {/* Interactive 3D Astronaut Body Scanner (5 cols) */}
        <div className="lg:col-span-5 min-w-0">
          <AstronautBodyScanner3D
            vitals={currentVitals}
            onHotspotClick={(hotspot) => setScannerFocus(hotspot)}
          />
        </div>

        {/* Clinical Drift Insights & AI Launch (3 cols) */}
        <div className="lg:col-span-3 glass-panel rounded-2xl p-4 sm:p-5 border border-mangal-copper/30 flex flex-col justify-between space-y-3 card-3d-hover">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-[10px] font-mono text-mangal-orange font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Active Drifts
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                {drifts.length} Detected
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {drifts.slice(0, 2).map((drift) => (
                <div
                  key={drift.id}
                  className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1 ${
                    drift.severity === 'critical'
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="truncate pr-1">{drift.metric}</span>
                    <span className="text-[10px] text-cyan-300 shrink-0">{drift.delta}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2 leading-snug">
                    {drift.clinicalInsight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => { soundEngine.playClick(); navigate('/surgeon'); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-mangal-copper to-mangal-orange hover:from-mangal-orange hover:to-mangal-gold text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(200,105,58,0.4)] transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch AI Flight Surgeon</span>
            </button>

            <button
              onClick={() => { soundEngine.playClick(); navigate('/baseline'); }}
              className="w-full py-2 rounded-xl bg-space-950 hover:bg-space-900 border border-slate-700 text-slate-300 font-mono text-xs text-center block transition-colors"
            >
              Baseline Z-Score Matrix
            </button>
          </div>
        </div>

      </div>

      {/* Biometric Metric Cards with 3D Visual Diagrams & 14-Day Sparklines */}
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 text-xs font-mono">
          <span className="text-mangal-orange font-bold uppercase tracking-wider flex items-center gap-2 font-display">
            <Activity className="w-4 h-4 text-mangal-copper shrink-0" />
            <span>Biometric Streams with 3D Holographic Diagrams</span>
          </span>
          <span className="text-slate-400 text-[10px] bg-space-900 px-2 py-0.5 rounded border border-slate-800">
            Click [3D / Trend] on any card to toggle view
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const isCritical = card.status === 'critical';
            const isWarning = card.status === 'warning';
            const currentMode = viewModes[card.id] || '3d'; // '3d' or 'sparkline'

            return (
              <div
                key={card.id}
                className={`glass-panel rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between card-3d-hover min-w-0 ${
                  isCritical 
                    ? 'border-red-500/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : isWarning 
                    ? 'border-amber-500/40 bg-amber-950/15' 
                    : 'border-slate-800 hover:border-mangal-blue/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                }`}
              >
                {/* Header: Title + Status + Toggle View */}
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-lg bg-space-900 border border-slate-800 shrink-0">
                      <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                    <span className="text-xs font-mono text-slate-200 font-semibold leading-tight truncate">
                      {card.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* View Switcher Button */}
                    <button
                      onClick={() => toggleCardView(card.id)}
                      title={`Switch to ${currentMode === '3d' ? 'Sparkline Trend' : '3D Diagram'}`}
                      className="p-1 rounded bg-space-950 hover:bg-space-900 border border-slate-700 text-slate-400 hover:text-cyan-300 text-[10px]"
                    >
                      {currentMode === '3d' ? <BarChart3 className="w-3 h-3" /> : <Box className="w-3 h-3 text-cyan-400" />}
                    </button>

                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                      isCritical 
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse' 
                        : isWarning 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {card.status}
                    </span>
                  </div>
                </div>

                {/* Primary Metric Number & Delta */}
                <div className="my-1.5 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold font-mono text-white tracking-tight">{card.value}</span>
                    <span className="text-xs font-mono text-slate-400">{card.unit}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate max-w-[110px]">
                    {card.delta}
                  </div>
                </div>

                {/* Card Visual Content: 3D Holographic Diagram OR 14-Day Sparkline */}
                <div className="w-full my-1 min-w-0">
                  {currentMode === '3d' ? (
                    <div className="w-full transform-3d transition-transform duration-300">
                      {card.render3D()}
                    </div>
                  ) : (
                    <div className="h-32 w-full p-2 bg-space-950/80 rounded-xl border border-slate-800">
                      <div className="text-[9px] font-mono text-slate-500 mb-1">14-DAY TELEMETRY STREAM</div>
                      <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sparklineHistory}>
                            <defs>
                              <linearGradient id={`grad_${card.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={card.chartColor} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={card.chartColor} stopOpacity={0.0} />
                              </linearGradient>
                            </defs>
                            <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                            <Area
                              type="monotone"
                              dataKey={card.dataKey}
                              stroke={card.chartColor}
                              strokeWidth={2}
                              fill={`url(#grad_${card.id})`}
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="truncate">Base: {card.baseline}</span>
                  <span className="text-cyan-400/90 shrink-0 font-bold">
                    {currentMode === '3d' ? '3D HUD' : '14-Day'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}