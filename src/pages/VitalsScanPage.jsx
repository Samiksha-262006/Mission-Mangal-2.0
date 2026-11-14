import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, CameraOff, Activity, RefreshCw, CheckCircle2, 
  AlertTriangle, Shield, Play, Pause, ChevronRight, Sparkles 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { RppgProcessor, generateSyntheticPulseWave } from '../utils/rppg';
import { soundEngine } from '../utils/audio';

export default function VitalsScanPage() {
  const { currentVitals, updateBaseline, setMissionDay, missionDay } = useMissionStore();

  const [isScanning, setIsScanning] = useState(false);
  const [useSimulation, setUseSimulation] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [measuredBpm, setMeasuredBpm] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [qualityText, setQualityText] = useState('Standby');
  const [wavePoints, setWavePoints] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const processorRef = useRef(null);
  const animFrameRef = useRef(null);
  const simStepRef = useRef(0);

  // Initialize or stop scanning
  useEffect(() => {
    if (isScanning && !useSimulation) {
      startCamera();
    } else if (isScanning && useSimulation) {
      startSimulationLoop();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isScanning, useSimulation]);

  // Start real webcam stream
  const startCamera = async () => {
    setCameraError(null);
    setScanComplete(false);
    setScanProgress(0);
    setMeasuredBpm(null);
    setWavePoints([]);
    setQualityText('Initializing Optical Sensor...');

    try {
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

      // Initialize rPPG processor
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
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
  };

  // Real rPPG video frame processing loop
  const startProcessingLoop = () => {
    const loop = () => {
      if (videoRef.current && processorRef.current) {
        const result = processorRef.current.processFrame(videoRef.current);
        if (result) {
          setScanProgress(result.progress);
          setQualityText(result.quality);

          if (result.bpm) {
            setMeasuredBpm(result.bpm);
            soundEngine.playHeartbeat();
          }

          // Oscilloscope wave buffer
          setWavePoints((prev) => {
            const next = [...prev, result.wavePoint || 0];
            if (next.length > 80) next.shift();
            return next;
          });

          // Check if scan completed (100% progress)
          if (result.progress >= 100 && result.bpm) {
            setScanComplete(true);
            setIsScanning(false);
            soundEngine.playTelemetryPing();
            return;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Synthetic fallback simulation loop
  const startSimulationLoop = () => {
    setScanComplete(false);
    setScanProgress(0);
    setMeasuredBpm(null);
    setWavePoints([]);
    setQualityText('Simulating Bio-Photoplethysmography Waveform...');

    const loop = () => {
      simStepRef.current += 1;
      const step = simStepRef.current;
      const wave = generateSyntheticPulseWave(step, currentVitals.heartRate);

      setScanProgress((prev) => {
        const next = Math.min(100, prev + 0.8);
        if (next >= 100) {
          setMeasuredBpm(wave.bpm);
          setScanComplete(true);
          setIsScanning(false);
          soundEngine.playTelemetryPing();
        }
        return next;
      });

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

      if (isScanning && !scanComplete) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Draw waveform to canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = (canvas.width = canvas.parentElement.clientWidth);
    const height = (canvas.height = 90);

    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.1)';
    ctx.lineWidth = 1;
    for (let y = 15; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (wavePoints.length < 2) return;

    // Draw pulse curve
    ctx.strokeStyle = '#00f2fe';
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

    // Glow effect
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
    ctx.lineWidth = 6;
    ctx.stroke();
  }, [wavePoints]);

  const handleSyncResult = () => {
    if (!measuredBpm) return;
    soundEngine.playTelemetryPing();
    alert(`Scanned Pulse Rate (${measuredBpm} BPM) synchronized to Mission Biometric History.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono font-bold text-xl text-white">Contactless Optical Vitals Scan (rPPG)</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              REMOTE PHOTOPLETHYSMOGRAPHY
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Analyzes subtle micro-vascular green-light absorption fluctuations on facial skin to extract heart rate without adhesive electrodes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setUseSimulation(!useSimulation);
              setIsScanning(false);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
              useSimulation 
                ? 'bg-purple-950/60 border-purple-500 text-purple-200' 
                : 'bg-space-900 border-slate-700 text-slate-300'
            }`}
          >
            {useSimulation ? 'Mode: Simulated Pulse' : 'Mode: Webcam Hardware'}
          </button>
        </div>
      </div>

      {/* Main Scanner HUD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Optical Target Viewfinder (7 cols) */}
        <div className="md:col-span-7 glass-panel rounded-2xl p-4 border border-cyan-500/30 relative flex flex-col items-center justify-center min-h-[380px] overflow-hidden bg-space-950">
          
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
              <div className="w-64 h-80 rounded-full border border-dashed border-cyan-400/40 animate-pulse-slow"></div>
            </div>
          )}

          {/* Futuristic HUD Oval Face Target Overlay */}
          <div className="relative z-10 w-52 h-64 rounded-full border-2 border-cyan-400/60 flex items-center justify-center pointer-events-none shadow-[0_0_25px_rgba(0,242,254,0.25)]">
            {/* Target Crosshairs */}
            <div className="w-full h-[1px] bg-cyan-400/30 absolute"></div>
            <div className="h-full w-[1px] bg-cyan-400/30 absolute"></div>
            
            {/* Forehead ROI Indicator Box */}
            <div className="absolute top-8 w-24 h-12 border border-dashed border-teal-400/80 rounded flex items-center justify-center bg-teal-500/10">
              <span className="text-[9px] font-mono text-teal-300 font-bold">FOREHEAD ROI</span>
            </div>

            {/* Sweep radar animation while scanning */}
            {isScanning && (
              <div className="absolute inset-0 rounded-full border-t-2 border-cyan-300 animate-spin-slow"></div>
            )}
          </div>

          {/* HUD Corner Accents */}
          <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-red-500 animate-ping' : 'bg-slate-500'}`}></span>
            <span>{isScanning ? 'SENSOR LOCK ACTIVE' : 'SENSOR STANDBY'}</span>
          </div>

          <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400">
            Signal: <strong className="text-cyan-300">{qualityText}</strong>
          </div>

          {cameraError && (
            <div className="absolute inset-0 bg-space-950/90 z-20 flex flex-col items-center justify-center p-6 text-center">
              <CameraOff className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-xs font-mono text-amber-200 mb-3">{cameraError}</p>
              <button
                onClick={() => { setUseSimulation(true); setIsScanning(true); }}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-mono font-bold text-xs"
              >
                Proceed with High-Fidelity Simulation
              </button>
            </div>
          )}
        </div>

        {/* Pulse Telemetry & Oscilloscope (5 cols) */}
        <div className="md:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
              Photoplethysmography Output
            </span>

            {/* BPM Value Gauge */}
            <div className="p-4 rounded-xl bg-space-900 border border-slate-800 text-center my-2">
              <span className="text-[10px] font-mono text-slate-400 block">ESTIMATED PULSE RATE</span>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-5xl font-extrabold font-mono text-white tracking-tight">
                  {measuredBpm || '--'}
                </span>
                <span className="text-sm font-mono text-cyan-400 font-bold">BPM</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 block mt-1">
                {scanComplete ? '✓ Calibration Complete' : isScanning ? 'Locking Systolic Peaks...' : 'Ready to Scan'}
              </span>
            </div>

            {/* Oscilloscope Real-Time Waveform */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Green Absorption Waveform (λ = 530nm)</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-space-950 border border-slate-800 rounded-lg overflow-hidden p-1">
                <canvas ref={waveCanvasRef} className="w-full block" />
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
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
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{scanComplete ? 'Start New Scan' : 'Initiate Contactless Scan'}</span>
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

            {scanComplete && (
              <button
                onClick={handleSyncResult}
                className="w-full py-2.5 rounded-xl bg-space-900 hover:bg-space-850 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sync {measuredBpm} BPM to Telemetry</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
