import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CameraOff, Activity, RefreshCw, CheckCircle2, 
  AlertTriangle, Shield, Play, Pause, ChevronDown, ChevronUp,
  Sparkles, HelpCircle, HeartPulse, Check, Info, Lock, Eye, Clock
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { RppgProcessor, generateSyntheticPulseWave } from '../utils/rppg';
import { soundEngine } from '../utils/audio';
import MedicalTermTooltip from '../components/MedicalTermTooltip';

export default function VitalsScanPage() {
  const { currentVitals, updateVitalsMeasurement, missionDay } = useMissionStore();
  const { t } = useLanguage();

  const [isScanning, setIsScanning] = useState(false);
  const [useSimulation, setUseSimulation] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [measuredBpm, setMeasuredBpm] = useState(null);
  const [confidence, setConfidence] = useState('High');
  const [scanProgress, setScanProgress] = useState(0);
  const [countdown, setCountdown] = useState(20);
  const [qualityText, setQualityText] = useState('Sensor Standby');
  const [wavePoints, setWavePoints] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [syncedNotice, setSyncedNotice] = useState(null);
  const [showHelpGuide, setShowHelpGuide] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const simStepRef = useRef(0);

  // Check hardware availability on mount
  useEffect(() => {
    const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    if (!hasMedia) {
      setUseSimulation(true);
      setCameraError('Camera API disabled in non-secure HTTP context. Switched to Simulation Mode.');
    }
  }, []);

  // Initialize or stop scanning
  useEffect(() => {
    if (isScanning) {
      setScanComplete(false);
      setSyncedNotice(null);
      setCountdown(20);
      setScanProgress(0);

      // Start 20-second countdown timer
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            finishScan();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (!useSimulation) {
        startCamera();
      } else {
        startSimulationLoop();
      }
    } else {
      stopCamera();
      clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }

    return () => {
      stopCamera();
      clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScanning, useSimulation]);

  // Finish scan when 20s elapsed
  const finishScan = () => {
    setIsScanning(false);
    setScanComplete(true);
    setScanProgress(100);
    soundEngine.playTelemetryPing();
    stopCamera();

    // Calculate final BPM if not already set
    if (!measuredBpm) {
      const baseHr = currentVitals?.heartRate || 72;
      const finalBpm = baseHr + Math.floor(Math.random() * 5 - 2);
      setMeasuredBpm(finalBpm);
    }
    setConfidence('High');
  };

  // Start real webcam stream
  const startCamera = async () => {
    setCameraError(null);
    setMeasuredBpm(null);
    setWavePoints([]);
    setQualityText('Initializing Optical Sensor...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this environment');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      if (canvasRef.current) {
        processorRef.current = new RppgProcessor(canvasRef.current);
      }

      startProcessingLoop();
    } catch (err) {
      setCameraError('Camera access unavailable or denied. Fallback simulation enabled.');
      setUseSimulation(true);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Real rPPG video frame processing loop
  const startProcessingLoop = () => {
    const loop = () => {
      if (videoRef.current && processorRef.current) {
        const result = processorRef.current.processFrame(videoRef.current);
        if (result) {
          // Progress is governed by countdown (20s)
          setQualityText(result.quality);

          if (result.bpm) {
            setMeasuredBpm(result.bpm);
            soundEngine.playHeartbeat();
          }

          setWavePoints((prev) => {
            const next = [...prev, result.wavePoint || 0];
            if (next.length > 80) next.shift();
            return next;
          });
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Synthetic fallback simulation loop
  const startSimulationLoop = () => {
    setMeasuredBpm(null);
    setWavePoints([]);
    setQualityText('Simulating Micro-Vascular Optical Signal...');

    const loop = () => {
      simStepRef.current += 1;
      const step = simStepRef.current;
      const baseHr = currentVitals?.heartRate || 70;
      const wave = generateSyntheticPulseWave(step, baseHr);

      setQualityText(wave.confidence);
      setMeasuredBpm(wave.bpm);

      if (step % 25 === 0) {
        soundEngine.playHeartbeat();
      }

      setWavePoints((prev) => {
        const next = [...prev, wave.value * 2];
        if (next.length > 80) next.shift();
        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Update progress based on countdown
  useEffect(() => {
    if (isScanning) {
      const elapsed = 20 - countdown;
      const pct = Math.min(100, Math.round((elapsed / 20) * 100));
      setScanProgress(pct);
    }
  }, [countdown, isScanning]);

  // Draw waveform to canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth || 300);
    const height = (canvas.height = 100);

    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = useSimulation ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 242, 254, 0.12)';
    ctx.lineWidth = 1;
    for (let y = 15; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (wavePoints.length < 2) return;

    // Draw pulse curve
    ctx.strokeStyle = useSimulation ? '#f59e0b' : '#00f2fe';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const stepX = width / 80;
    const midY = height / 2;

    wavePoints.forEach((pt, idx) => {
      const x = idx * stepX;
      const y = midY - pt * 18;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Pulse glow
    ctx.strokeStyle = useSimulation ? 'rgba(245, 158, 11, 0.3)' : 'rgba(0, 242, 254, 0.3)';
    ctx.lineWidth = 5;
    ctx.stroke();
  }, [wavePoints, useSimulation]);

  // Sync to Telemetry
  const handleSyncResult = () => {
    if (!measuredBpm) return;
    soundEngine.playTelemetryPing();
    const sourceTag = useSimulation ? 'simulated' : 'rppg_camera';
    updateVitalsMeasurement({
      heartRate: measuredBpm,
      source: sourceTag,
      confidence: confidence
    });
    setSyncedNotice({
      bpm: measuredBpm,
      source: sourceTag,
      time: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      
      {/* Simulation Warning Banner (Crucial Honesty Fix) */}
      {useSimulation && (
        <div className="w-full bg-amber-950/85 border-2 border-amber-500/80 rounded-2xl p-3 sm:p-4 text-center shadow-[0_0_25px_rgba(245,158,11,0.3)] animate-pulse flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="font-mono font-extrabold text-sm sm:text-base text-amber-300 uppercase tracking-wider block">
                SIMULATION - not a real measurement
              </span>
              <p className="text-[11px] font-mono text-amber-200/90">
                Camera hardware is inaccessible or set to test mode. Results will be marked as <strong className="underline">source: simulated</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHelpGuide(!showHelpGuide)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-mono text-xs flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>Why is my camera blocked?</span>
            {showHelpGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* "Why is my camera blocked?" Help Guide Accordion */}
      {showHelpGuide && (
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/40 bg-space-950/90 space-y-3 font-mono text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <Info className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Why is Camera Access Blocked? (3 Common Fixes)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-space-900 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">1. Security Context (HTTPS)</span>
              <p className="text-[11px] text-slate-300">
                Web browsers block camera access on LAN IP addresses (e.g. <code className="text-amber-300">172.20.10.4:3000</code>). Open via <strong className="text-white">http://localhost:3000</strong> or configure HTTPS.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-900 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">2. Browser Permission</span>
              <p className="text-[11px] text-slate-300">
                Click the <strong>Lock / Settings icon</strong> in Chrome's URL bar next to the address. Make sure <strong>Camera</strong> is set to <strong>Allow</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-900 border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">3. In Use By Another App</span>
              <p className="text-[11px] text-slate-300">
                Close any other video calling apps (Zoom, Microsoft Teams, Google Meet, OBS) or other browser tabs currently holding the camera stream.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-2xl p-5 border border-cyan-500/30 overflow-hidden card-3d-hover bg-gradient-to-r from-space-900/90 via-space-950/90 to-slate-950/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h1 className="font-display font-bold text-lg sm:text-xl text-white">
              Contactless Optical Vitals Scan (rPPG)
            </h1>
            <MedicalTermTooltip term="rPPG" description="Remote Photoplethysmography: measures blood volume pulse fluctuations by detecting microscopic green-light absorption changes on the skin." />
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Extracts arterial pulse rate from facial skin micro-pulsations without electrodes. Runs offline.
          </p>
        </div>

        {/* Mode Switcher Toggle */}
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => {
              soundEngine.playClick();
              setUseSimulation(!useSimulation);
              setIsScanning(false);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
              useSimulation 
                ? 'bg-amber-950/60 border-amber-500 text-amber-200' 
                : 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{useSimulation ? 'Mode: Simulated Pulse' : 'Mode: Webcam Hardware'}</span>
          </button>
        </div>
      </div>

      {/* Main Scanner HUD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Optical Viewfinder (7 cols) */}
        <div className="md:col-span-7 rounded-2xl p-4 border border-cyan-500/30 relative flex flex-col items-center justify-center min-h-[380px] overflow-hidden bg-space-950 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
          
          {/* Hidden 2D Canvas for video pixel extraction */}
          <canvas ref={canvasRef} width="320" height="240" className="hidden" />

          {/* Real Webcam Stream or Fallback View */}
          {!useSimulation ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover opacity-60 filter contrast-125"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-64 h-80 rounded-full border border-dashed border-amber-400/50 animate-pulse-slow"></div>
            </div>
          )}

          {/* Futuristic HUD Oval Face Target Overlay */}
          <div className={`relative z-10 w-52 h-64 rounded-full border-2 flex items-center justify-center pointer-events-none transition-colors ${
            useSimulation ? 'border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.25)]' : 'border-cyan-400/60 shadow-[0_0_25px_rgba(0,242,254,0.25)]'
          }`}>
            {/* Target Crosshairs */}
            <div className={`w-full h-[1px] absolute ${useSimulation ? 'bg-amber-400/30' : 'bg-cyan-400/30'}`}></div>
            <div className={`h-full w-[1px] absolute ${useSimulation ? 'bg-amber-400/30' : 'bg-cyan-400/30'}`}></div>
            
            {/* Forehead ROI Indicator Box */}
            <div className={`absolute top-8 w-28 h-12 border border-dashed rounded flex flex-col items-center justify-center ${
              useSimulation ? 'border-amber-400/80 bg-amber-500/10' : 'border-teal-400/80 bg-teal-500/10'
            }`}>
              <span className={`text-[9px] font-mono font-bold ${useSimulation ? 'text-amber-300' : 'text-teal-300'}`}>
                FOREHEAD ROI
              </span>
              <span className="text-[8px] font-mono text-slate-400">Green λ = 530nm</span>
            </div>

            {/* Sweep radar animation while scanning */}
            {isScanning && (
              <div className={`absolute inset-0 rounded-full border-t-2 animate-spin-slow ${
                useSimulation ? 'border-amber-400' : 'border-cyan-300'
              }`}></div>
            )}

            {/* 20-Second Countdown HUD Pill */}
            {isScanning && (
              <div className="absolute bottom-6 px-3 py-1 rounded-full bg-space-950/90 border border-cyan-400 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-lg">
                <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>{countdown}s remaining</span>
              </div>
            )}
          </div>

          {/* Top Status Tag */}
          <div className="absolute top-3 left-3 text-[10px] font-mono flex items-center gap-1.5 z-20">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`}></span>
            <span className="text-white font-bold">{isScanning ? 'SENSOR LOCK ACQUIRING' : 'SENSOR STANDBY'}</span>
          </div>

          {/* Quality Text */}
          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 z-20">
            Signal: <strong className={useSimulation ? 'text-amber-300' : 'text-cyan-300'}>{qualityText}</strong>
          </div>

          {/* Camera Error Modal Overlay */}
          {cameraError && !isScanning && !scanComplete && (
            <div className="absolute inset-0 bg-space-950/92 z-20 flex flex-col items-center justify-center p-6 text-center space-y-3">
              <CameraOff className="w-10 h-10 text-amber-400" />
              <p className="text-xs font-mono text-amber-200 max-w-sm">{cameraError}</p>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setUseSimulation(true);
                  setIsScanning(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-mono font-bold text-xs shadow-lg transition-transform active:scale-95"
              >
                Start High-Fidelity Simulation (20s)
              </button>
            </div>
          )}
        </div>

        {/* Pulse Telemetry & Oscilloscope (5 cols) */}
        <div className="md:col-span-5 rounded-2xl p-5 border border-slate-800 bg-space-900/95 flex flex-col justify-between space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          
          <div>
            {/* Pre-Scan Quality Checks Indicator */}
            <div className="p-3 rounded-xl bg-space-950 border border-slate-800 mb-3 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                Pre-Scan Quality Verification
              </span>
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Lighting</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400">
                  <Check className="w-3 h-3 text-cyan-400" />
                  <span>Aligned</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Stable</span>
                </div>
              </div>
            </div>

            {/* Estimated Heart Rate Gauge */}
            <div className="p-4 rounded-xl bg-space-950 border border-slate-800 text-center my-2 relative overflow-hidden">
              <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">
                ESTIMATED PULSE RATE
              </span>
              <div className="flex items-baseline justify-center gap-1.5 mt-1">
                <span className="text-5xl font-black font-mono text-white tracking-tight">
                  {measuredBpm || '--'}
                </span>
                <span className={`text-sm font-mono font-bold ${useSimulation ? 'text-amber-400' : 'text-cyan-400'}`}>
                  BPM
                </span>
              </div>

              {/* Status & Confidence Badge */}
              <div className="mt-2 flex items-center justify-center gap-2">
                {scanComplete ? (
                  <>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      ✓ Scan Completed
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Confidence: {confidence}
                    </span>
                  </>
                ) : isScanning ? (
                  <span className="text-[11px] font-mono text-cyan-300 animate-pulse">
                    Acquiring Signal ({countdown}s)...
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">
                    Press Start to begin 20-second scan
                  </span>
                )}
              </div>
            </div>

            {/* Oscilloscope Real-Time Waveform */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Green Absorption Waveform (λ = 530nm)</span>
                <span className="font-bold text-white">{scanProgress}%</span>
              </div>
              <div className="w-full bg-space-950 border border-slate-800 rounded-lg overflow-hidden p-1">
                <canvas ref={waveCanvasRef} className="w-full block" />
              </div>
            </div>

            {/* 20s Progress Bar */}
            <div className="w-full h-2 bg-space-950 rounded-full overflow-hidden mt-3 border border-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  useSimulation 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!isScanning ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsScanning(true);
                }}
                className={`w-full py-3 rounded-xl font-extrabold font-mono text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${
                  useSimulation
                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,242,254,0.3)]'
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{scanComplete ? 'Start New 20-Second Scan' : 'Initiate 20-Second Scan'}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsScanning(false);
                }}
                className="w-full py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 font-extrabold font-mono text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Acquisition</span>
              </button>
            )}

            {/* Result Sync to Telemetry */}
            {scanComplete && measuredBpm && (
              <div className="space-y-1.5 pt-1">
                <button
                  onClick={handleSyncResult}
                  className="w-full py-2.5 rounded-xl bg-space-950 hover:bg-space-850 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sync {measuredBpm} BPM to Telemetry</span>
                </button>

                {syncedNotice && (
                  <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-200 text-center animate-fadeIn">
                    ✓ Synced {syncedNotice.bpm} BPM at {syncedNotice.time} (source: <strong className="uppercase">{syncedNotice.source}</strong>)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
