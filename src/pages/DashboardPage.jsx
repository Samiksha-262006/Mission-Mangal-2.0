import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Activity, Droplets, Thermometer, Moon, Zap, 
  ShieldAlert, Cpu, Sparkles, Orbit, BarChart3, Box, 
  CheckCircle2, Circle, AlertTriangle, ArrowRight, HeartPulse
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import RadialHealthGauge from '../components/RadialHealthGauge';
import AstronautBodyScanner3D from '../three/AstronautBodyScanner3D';
import MedicalTermTooltip from '../components/MedicalTermTooltip';
import { 
  HeartDiagram3D, SpO2Diagram3D, BloodPressureDiagram3D, 
  BodyTempDiagram3D, SleepDiagram3D, StressDiagram3D, FluidShiftDiagram3D,
  DriftCurveDiagram3D, HydrationDiagram3D, CalorieBurnDiagram3D, 
  SleepStagesDiagram3D, MoodWaveDiagram3D, RadiationDosimeterMiniDiagram, 
  BoneMatrixMiniDiagram
} from '../components/BiometricDiagrams3D';
import { detectHealthDrifts } from '../utils/anomaly';
import { soundEngine } from '../utils/audio';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentVitals, vitalsHistory, baseline, activeEvents, missionDay } = useMissionStore();

  const [scannerFocus, setScannerFocus] = useState('heart');
  // Card visualization mode per card: '3d' or 'sparkline' (default '3d')
  const [viewModes, setViewModes] = useState({});

  // Daily checklist state (persisted per sol day in localStorage)
  const checklistStorageKey = `mangal_checklist_day_${missionDay}`;
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem(checklistStorageKey);
      return saved ? JSON.parse(saved) : { water: false, exercise: false, sleep: true, mood: false };
    } catch {
      return { water: false, exercise: false, sleep: true, mood: false };
    }
  });

  const toggleChecklistItem = (key) => {
    soundEngine.playClick();
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    try {
      localStorage.setItem(checklistStorageKey, JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleCardView = (cardId) => {
    soundEngine.playClick();
    setViewModes(prev => ({
      ...prev,
      [cardId]: prev[cardId] === 'sparkline' ? '3d' : 'sparkline'
    }));
  };

  const drifts = detectHealthDrifts(currentVitals, baseline, vitalsHistory);

  // Compute 1-sentence Today's Summary
  const getTodaySummary = () => {
    if (activeEvents.chestPain || currentVitals.healthScore < 60) {
      return t('summaryCritical');
    }
    if (currentVitals.heartRate > 88 || currentVitals.sleepScore < 65 || currentVitals.fluidShiftIndex > 1.8) {
      return t('summaryWarning');
    }
    return t('summaryNormal');
  };

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
      title: t('metricHeartRate'),
      termKey: null,
      value: `${currentVitals.heartRate}`,
      unit: t('unitBpm'),
      icon: Heart,
      iconColor: 'text-rose-400',
      dataKey: 'hr',
      chartColor: '#f43f5e',
      baseline: `${baseline.heartRate}`,
      delta: `${currentVitals.heartRate >= baseline.heartRate ? '+' : ''}${currentVitals.heartRate - baseline.heartRate}`,
      status: currentVitals.heartRate > 95 ? t('critical') : currentVitals.heartRate > 78 ? t('warning') : t('nominal'),
      statusType: currentVitals.heartRate > 95 ? 'critical' : currentVitals.heartRate > 78 ? 'warning' : 'nominal',
      render3D: () => <HeartDiagram3D bpm={currentVitals.heartRate} status={currentVitals.heartRate > 95 ? 'critical' : currentVitals.heartRate > 78 ? 'warning' : 'nominal'} />
    },
    {
      id: 'spo2',
      title: t('metricSpO2'),
      termKey: 'tooltipSpO2',
      value: `${currentVitals.spO2}`,
      unit: t('unitPercent'),
      icon: Activity,
      iconColor: 'text-cyan-400',
      dataKey: 'spo2',
      chartColor: '#2e8bff',
      baseline: `${baseline.spO2}%`,
      delta: `${currentVitals.spO2 - baseline.spO2}%`,
      status: currentVitals.spO2 < 95 ? t('critical') : currentVitals.spO2 < 97 ? t('warning') : t('nominal'),
      statusType: currentVitals.spO2 < 95 ? 'critical' : currentVitals.spO2 < 97 ? 'warning' : 'nominal',
      render3D: () => <SpO2Diagram3D spo2={currentVitals.spO2} />
    },
    {
      id: 'bp',
      title: t('metricBloodPressure'),
      termKey: 'tooltipBP',
      value: `${currentVitals.systolic}/${currentVitals.diastolic}`,
      unit: t('unitMmHg'),
      icon: Activity,
      iconColor: 'text-mangal-orange',
      dataKey: 'sys',
      chartColor: '#e8894f',
      baseline: `${baseline.systolic}/${baseline.diastolic}`,
      delta: `+${currentVitals.systolic - baseline.systolic}`,
      status: currentVitals.systolic > 140 ? t('critical') : currentVitals.systolic > 125 ? t('warning') : t('nominal'),
      statusType: currentVitals.systolic > 140 ? 'critical' : currentVitals.systolic > 125 ? 'warning' : 'nominal',
      render3D: () => <BloodPressureDiagram3D sys={currentVitals.systolic} dia={currentVitals.diastolic} />
    },
    {
      id: 'temp',
      title: t('metricBodyTemp'),
      termKey: null,
      value: `${currentVitals.bodyTemp}`,
      unit: t('unitCelsius'),
      icon: Thermometer,
      iconColor: 'text-amber-400',
      dataKey: 'temp',
      chartColor: '#f59e0b',
      baseline: `${baseline.bodyTemp}°C`,
      delta: `+${(currentVitals.bodyTemp - baseline.bodyTemp).toFixed(1)}°`,
      status: currentVitals.bodyTemp > 37.8 ? t('critical') : currentVitals.bodyTemp > 37.2 ? t('warning') : t('nominal'),
      statusType: currentVitals.bodyTemp > 37.8 ? 'critical' : currentVitals.bodyTemp > 37.2 ? 'warning' : 'nominal',
      render3D: () => <BodyTempDiagram3D temp={currentVitals.bodyTemp} />
    },
    {
      id: 'sleep',
      title: t('metricSleep'),
      termKey: null,
      value: `${currentVitals.sleepScore}`,
      unit: t('unitScore'),
      icon: Moon,
      iconColor: 'text-purple-400',
      dataKey: 'sleep',
      chartColor: '#a855f7',
      baseline: '85',
      delta: `${currentVitals.sleepScore - 85}`,
      status: currentVitals.sleepScore < 50 ? t('critical') : currentVitals.sleepScore < 65 ? t('warning') : t('nominal'),
      statusType: currentVitals.sleepScore < 50 ? 'critical' : currentVitals.sleepScore < 65 ? 'warning' : 'nominal',
      render3D: () => <SleepDiagram3D score={currentVitals.sleepScore} />
    },
    {
      id: 'stress',
      title: t('metricStress'),
      termKey: null,
      value: `${currentVitals.stressScore}`,
      unit: t('unitScore'),
      icon: Zap,
      iconColor: 'text-yellow-400',
      dataKey: 'stress',
      chartColor: '#eab308',
      baseline: '25',
      delta: `+${currentVitals.stressScore - 25}`,
      status: currentVitals.stressScore > 75 ? t('critical') : currentVitals.stressScore > 60 ? t('warning') : t('nominal'),
      statusType: currentVitals.stressScore > 75 ? 'critical' : currentVitals.stressScore > 60 ? 'warning' : 'nominal',
      render3D: () => <StressDiagram3D stress={currentVitals.stressScore} />
    },
    {
      id: 'fluid',
      title: t('metricFluidShift'),
      termKey: 'tooltipFluidShift',
      value: `+${currentVitals.fluidShiftIndex}`,
      unit: t('unitIndex'),
      icon: Droplets,
      iconColor: 'text-teal-400',
      dataKey: 'shift',
      chartColor: '#10b981',
      baseline: '+1.0',
      delta: `${currentVitals.hydration}% water`,
      status: currentVitals.fluidShiftIndex > 2.0 ? t('critical') : currentVitals.fluidShiftIndex > 1.6 ? t('warning') : t('nominal'),
      statusType: currentVitals.fluidShiftIndex > 2.0 ? 'critical' : currentVitals.fluidShiftIndex > 1.6 ? 'warning' : 'nominal',
      render3D: () => <FluidShiftDiagram3D shift={currentVitals.fluidShiftIndex} />
    }
  ];

  return (
    <div className="space-y-5 min-w-0 max-w-full overflow-hidden">
      
      {/* 1. ELEVATED FEATURE: Today's Summary Banner */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-mangal-blue/40 shadow-xl overflow-hidden bg-gradient-to-r from-space-900/95 via-space-950/95 to-slate-950/95 card-3d-hover">
        <div className="absolute inset-0 bg-hud-scanlines opacity-20 pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-3 min-w-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/40 text-cyan-300 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-sm sm:text-base text-white drop-shadow">
                  {t('summaryTitle')}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {t('solDay')} {missionDay}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed break-words font-medium">
                {getTodaySummary()}
              </p>
            </div>
          </div>

          <button
            onClick={() => { soundEngine.playClick(); navigate('/surgeon'); }}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-inner"
          >
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>{t('launchDoctor')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. ELEVATED FEATURE: Daily Health Checklist */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl overflow-hidden bg-gradient-to-b from-space-900/90 via-space-950/95 to-slate-950/95 card-3d-hover">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="font-display font-bold text-sm text-white drop-shadow">
              {t('checklistTitle')}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {Object.values(checklist).filter(Boolean).length} / 4 {t('checkCompleted')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {[
            { key: 'water', label: t('checkWater'), icon: Droplets, color: 'text-cyan-400', diagram: <HydrationDiagram3D /> },
            { key: 'exercise', label: t('checkExercise'), icon: Activity, color: 'text-amber-400', diagram: <CalorieBurnDiagram3D /> },
            { key: 'sleep', label: t('checkSleep'), icon: Moon, color: 'text-purple-400', diagram: <SleepStagesDiagram3D /> },
            { key: 'mood', label: t('checkMood'), icon: Zap, color: 'text-emerald-400', diagram: <MoodWaveDiagram3D /> }
          ].map((item) => {
            const isDone = checklist[item.key];
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleChecklistItem(item.key)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                  isDone
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-space-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 w-full mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                    <span className={`text-[11px] truncate ${isDone ? 'line-through text-slate-400' : 'font-bold text-white'}`}>
                      {item.label}
                    </span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                </div>

                {/* Google Fit style inline diagram */}
                <div className="w-full my-1 opacity-90">
                  {item.diagram}
                </div>

                <div className="text-[10px] text-slate-400 text-right w-full">
                  {isDone ? 'Completed' : 'Tap to mark done'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Top Section: Health Score + 3D Astronaut Scanner + Health Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">
        
        {/* Health Gauge Panel (4 cols) with 3D Depth Layering */}
        <div className="lg:col-span-4 rounded-2xl p-4 sm:p-5 border border-mangal-blue/30 flex flex-col items-center justify-between relative overflow-hidden card-3d-hover bg-gradient-to-b from-space-900/90 via-space-950/95 to-slate-950/95 shadow-xl">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-[10px] font-mono text-mangal-blue font-bold tracking-widest uppercase">
              {t('healthScoreTitle')}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
              {t('solDay')} {missionDay}
            </span>
          </div>

          <RadialHealthGauge
            score={currentVitals.healthScore}
            vitals={currentVitals}
            activeEvents={activeEvents}
          />

          <div className="w-full grid grid-cols-2 gap-2 text-center text-xs font-mono pt-2 border-t border-slate-800">
            <div className="p-2 rounded bg-space-950 border border-slate-800 flex flex-col items-center justify-between">
              <div className="flex items-center justify-center">
                <span className="text-slate-400 text-[10px]">{t('totalRadiation')}</span>
                <MedicalTermTooltip termKey="tooltipRadiation" label={t('totalRadiation')} />
              </div>
              <RadiationDosimeterMiniDiagram dose={currentVitals.cumulativeRadiation} />
              <span className="text-white font-bold text-xs">{currentVitals.cumulativeRadiation} mSv</span>
            </div>
            <div className="p-2 rounded bg-space-950 border border-slate-800 flex flex-col items-center justify-between">
              <div className="flex items-center justify-center">
                <span className="text-slate-400 text-[10px]">{t('boneLoss')}</span>
                <MedicalTermTooltip termKey="tooltipBMD" label={t('boneLoss')} />
              </div>
              <BoneMatrixMiniDiagram />
              <span className="text-amber-400 font-bold text-xs">-{currentVitals.boneLossPercent}%</span>
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

        {/* Clinical Health Changes & AI Launch (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl p-4 sm:p-5 border border-mangal-copper/30 flex flex-col justify-between space-y-3 card-3d-hover bg-gradient-to-b from-space-900/90 via-space-950/95 to-slate-950/95 shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-mangal-orange" />
                <span className="text-[10px] font-mono text-mangal-orange font-bold uppercase tracking-wider">
                  {t('activeDriftsTitle')}
                </span>
                <MedicalTermTooltip termKey="tooltipZScore" label="Z-Score Drift" />
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300">
                {drifts.length}
              </span>
            </div>

            {/* Google style Gaussian Drift curve diagram */}
            <div className="my-2">
              <DriftCurveDiagram3D />
            </div>

            <div className="space-y-2 mt-2">
              {drifts.length === 0 ? (
                <p className="text-[11px] text-emerald-300 font-mono py-2">
                  {t('allNormalDrifts')}
                </p>
              ) : (
                drifts.slice(0, 2).map((drift) => (
                  <div
                    key={drift.id}
                    className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1 ${
                      drift.severity === 'critical'
                        ? 'bg-red-950/40 border-red-500/50 text-red-200'
                        : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate pr-1 text-white">{drift.metric}</span>
                      <span className="text-[10px] text-cyan-300 shrink-0">{drift.delta}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-2 leading-snug">
                      {drift.clinicalInsight}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => { soundEngine.playClick(); navigate('/surgeon'); }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-mangal-copper to-mangal-orange hover:from-mangal-orange hover:to-mangal-gold text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(200,105,58,0.4)] transition-all"
            >
              <Cpu className="w-4 h-4" />
              <span>{t('launchDoctor')}</span>
            </button>

            <button
              onClick={() => { soundEngine.playClick(); navigate('/baseline'); }}
              className="w-full py-2 rounded-xl bg-space-950 hover:bg-space-900 border border-slate-700 text-slate-300 font-mono text-xs text-center block transition-colors"
            >
              {t('navBaseline')}
            </button>
          </div>
        </div>

      </div>

      {/* 4. 3D Biometric Metric Cards with Dark Gradient Overlay Pattern */}
      <div className="min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 text-xs font-mono">
          <span className="text-mangal-orange font-bold uppercase tracking-wider flex items-center gap-2 font-display">
            <Activity className="w-4 h-4 text-mangal-copper shrink-0" />
            <span className="text-white drop-shadow">Biometric Streams & 3D Visual Cards</span>
          </span>
          <span className="text-slate-400 text-[10px] bg-space-900 px-2 py-0.5 rounded border border-slate-800">
            Tap [3D / Trend] to switch view
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0">
          {metricCards.map((card) => {
            const Icon = card.icon;
            const isCritical = card.statusType === 'critical';
            const isWarning = card.statusType === 'warning';
            const currentMode = viewModes[card.id] || '3d';

            return (
              <div
                key={card.id}
                className={`relative rounded-2xl p-4 border transition-all duration-300 flex flex-col justify-between card-3d-hover min-w-0 overflow-hidden shadow-xl bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 ${
                  isCritical 
                    ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                    : isWarning 
                    ? 'border-amber-500/40' 
                    : 'border-slate-800 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(0,242,254,0.2)]'
                }`}
              >
                {/* 3D Pattern Layer 1 & 2: Background texture & gradient protection */}
                <div className="absolute inset-0 bg-hud-scanlines opacity-10 pointer-events-none"></div>

                {/* Layer 3: High-Contrast Foreground Content */}
                <div className="relative z-10 min-w-0 flex flex-col justify-between h-full">
                  
                  {/* Header: Title + Medical Tooltip + View Switcher + Status */}
                  <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-space-900 border border-slate-800 shrink-0">
                        <Icon className={`w-4 h-4 ${card.iconColor}`} />
                      </div>
                      <span className="text-xs font-mono text-white font-bold leading-tight truncate drop-shadow">
                        {card.title}
                      </span>
                      {card.termKey && (
                        <MedicalTermTooltip termKey={card.termKey} label={card.title} />
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleCardView(card.id)}
                        title={currentMode === '3d' ? t('viewTrend') : t('view3D')}
                        className="p-1 rounded bg-space-950 hover:bg-space-900 border border-slate-700 text-slate-400 hover:text-cyan-300 text-[10px]"
                      >
                        {currentMode === '3d' ? <BarChart3 className="w-3 h-3" /> : <Box className="w-3 h-3 text-cyan-400" />}
                      </button>

                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                        isCritical 
                          ? 'bg-red-500/20 text-red-200 border-red-500/50 animate-pulse' 
                          : isWarning 
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500/40' 
                          : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                  </div>

                  {/* Primary Metric Number & Delta */}
                  <div className="my-1.5 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold font-mono text-white tracking-tight drop-shadow-md">{card.value}</span>
                      <span className="text-xs font-mono text-slate-300 font-medium">{card.unit}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 truncate max-w-[110px]">
                      {card.delta}
                    </div>
                  </div>

                  {/* 3D Visual Diagram OR Sparkline */}
                  <div className="w-full my-1 min-w-0">
                    {currentMode === '3d' ? (
                      <div className="w-full transform-3d transition-transform duration-300">
                        {card.render3D()}
                      </div>
                    ) : (
                      <div className="h-32 w-full p-2 bg-space-950/80 rounded-xl border border-slate-800">
                        <div className="text-[9px] font-mono text-slate-400 mb-1">14-DAY TELEMETRY STREAM</div>
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
                  <div className="pt-2 mt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-300">
                    <span className="truncate">Base: {card.baseline}</span>
                    <span className="text-cyan-400 font-bold shrink-0">
                      {currentMode === '3d' ? t('view3D') : t('viewTrend')}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
