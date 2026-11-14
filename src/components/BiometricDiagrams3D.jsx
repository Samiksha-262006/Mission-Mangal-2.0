import React from 'react';

/**
 * High-Tech 3D Biometric & Space Physiological Visual Diagrams
 * Procedural SVG with isometric perspective, glowing gradient meshes,
 * scanning radar beams, and telemetry overlays. Completely offline-capable.
 */

// 1. 3D Heart Hologram
export function HeartDiagram3D({ bpm = 76, status = 'nominal' }) {
  const pulseDuration = `${Math.max(0.4, 60 / bpm)}s`;
  const isCrit = status === 'critical';
  const isWarn = status === 'warning';
  const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#f43f5e';

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <defs>
          <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#be123c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#4c0519" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="cardiacGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#070b19" stopOpacity="0" />
          </radialGradient>
          <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background glow ring */}
        <circle cx="100" cy="60" r="45" fill="url(#cardiacGlow)" />
        <ellipse cx="100" cy="95" rx="50" ry="12" fill="none" stroke="#2e8bff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
        <ellipse cx="100" cy="95" rx="35" ry="8" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />

        {/* ECG Rhythm Wireframe ribbon in background */}
        <path
          d="M 10,65 L 45,65 L 52,50 L 58,80 L 66,35 L 74,75 L 80,65 L 120,65 L 126,52 L 132,78 L 138,40 L 145,72 L 150,65 L 190,65"
          fill="none"
          stroke="#00f2fe"
          strokeWidth="1.2"
          opacity="0.3"
        />

        {/* 3D Heart Isometric Projection */}
        <g transform="translate(100, 56) scale(0.9)" style={{ transformOrigin: 'center' }}>
          {/* Animated Pulsing Heart Chamber */}
          <path
            d="M 0,-24 C -22,-44 -48,-15 -35,14 C -25,36 0,50 0,50 C 0,50 25,36 35,14 C 48,-15 22,-44 0,-24 Z"
            fill="url(#heartGrad)"
            stroke={color}
            strokeWidth="1.8"
            filter="url(#glow3d)"
            className="animate-pulse"
            style={{ animationDuration: pulseDuration }}
          />

          {/* Superior Aortic Arch & Coronary Arteries */}
          <path d="M -8,-24 Q -12,-40 2,-42 Q 16,-40 12,-25" fill="none" stroke="#f43f5e" strokeWidth="4" strokeLinecap="round" />
          <path d="M 6,-42 L 10,-48 M 2,-42 L 2,-48 M -4,-41 L -8,-47" stroke="#fb7185" strokeWidth="2.5" strokeLinecap="round" />

          {/* Vena Cava / Pulmonary Blue Artery */}
          <path d="M -16,-20 Q -24,-35 -14,-38" fill="none" stroke="#2e8bff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

          {/* Coronary Myocardial Arteries 3D Veins */}
          <path d="M -2,-8 Q -10,6 -6,22 Q -4,28 -2,36" fill="none" stroke="#fb7185" strokeWidth="1.2" opacity="0.85" />
          <path d="M 4,-4 Q 14,8 10,24" fill="none" stroke="#fb7185" strokeWidth="1" opacity="0.75" />

          {/* SA Node / Conduction point */}
          <circle cx="-10" cy="-22" r="2.5" fill="#00f2fe" className="animate-ping" style={{ animationDuration: '1s' }} />
        </g>

        {/* Telemetry Labels */}
        <text x="12" y="18" fill="#94a3b8" fontSize="8" fontFamily="monospace">LV STROKE VOL: 68 mL</text>
        <text x="12" y="28" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">CARDIAC OUTPUT: {(bpm * 0.07).toFixed(1)} L/M</text>
        <text x="188" y="18" textAnchor="end" fill="#00f2fe" fontSize="8" fontFamily="monospace">R-R: {Math.round(60000 / bpm)}ms</text>
        <text x="188" y="28" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">0G ADAPTATION</text>
      </svg>
    </div>
  );
}

// 2. 3D Blood Oxygen (SpO2) Alveolar-Capillary Diffusion Hologram
export function SpO2Diagram3D({ spo2 = 98 }) {
  const isWarn = spo2 < 96;
  const color = isWarn ? '#f59e0b' : '#2e8bff';

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <defs>
          <radialGradient id="alveolusGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Microscopic Capillary Vessel Tube 3D */}
        <path d="M 10,30 C 60,32 140,28 190,32 L 190,92 C 140,88 60,92 10,90 Z" fill="#1e293b" opacity="0.35" />
        <path d="M 10,30 C 60,32 140,28 190,32" stroke="#334155" strokeWidth="1.5" fill="none" />
        <path d="M 10,90 C 60,92 140,88 190,92" stroke="#334155" strokeWidth="1.5" fill="none" />

        {/* 3D Alveolar Sac Bulb in Center */}
        <circle cx="100" cy="38" r="32" fill="url(#alveolusGrad)" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 2" />
        
        {/* Oxygen Molecule (O2) Diffusion Particles drifting into blood */}
        {[
          { cx: 90, cy: 30, r: 2.2 },
          { cx: 110, cy: 34, r: 2.5 },
          { cx: 98, cy: 46, r: 2.0 },
          { cx: 85, cy: 55, r: 2.2 },
          { cx: 105, cy: 62, r: 2.5 },
          { cx: 118, cy: 68, r: 2.0 }
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.cx} cy={pt.cy} r={pt.r} fill="#00f2fe" className="animate-pulse" />
            <circle cx={pt.cx + 2.5} cy={pt.cy} r={pt.r * 0.8} fill="#38bdf8" />
          </g>
        ))}

        {/* Erythrocytes (Red Blood Cells) flowing through capillary */}
        {[
          { x: 35, y: 72, r: 8, oxy: true },
          { x: 75, y: 68, r: 9, oxy: true },
          { x: 120, y: 74, r: 9, oxy: true },
          { x: 165, y: 70, r: 8, oxy: true }
        ].map((rbc, idx) => (
          <g key={idx} transform={`translate(${rbc.x}, ${rbc.y})`}>
            {/* 3D Biconcave Erythrocyte Shape */}
            <ellipse cx="0" cy="0" rx={rbc.r} ry={rbc.r * 0.55} fill="#ef4444" stroke="#f87171" strokeWidth="0.8" />
            <ellipse cx="0" cy="0" rx={rbc.r * 0.45} ry={rbc.r * 0.25} fill="#991b1b" />
          </g>
        ))}

        {/* Diffusion Arrow */}
        <path d="M 100,48 L 100,64" stroke="#00f2fe" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="2 2" />

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">PaO2: 95 mmHg</text>
        <text x="12" y="26" fill="#00f2fe" fontSize="8" fontFamily="monospace" fontWeight="bold">DIFFUSION: ACTIVE (100%)</text>
        <text x="188" y="16" textAnchor="end" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">SpO2: {spo2}%</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">CABIN O2: 21.2 kPa</text>
      </svg>
    </div>
  );
}

// 3. 3D Blood Pressure Vasculature & Pulse Wave Hologram
export function BloodPressureDiagram3D({ sys = 120, dia = 80 }) {
  const isElevated = sys > 130;
  const color = isElevated ? '#e8894f' : '#2e8bff';

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <defs>
          <linearGradient id="arteryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c8693a" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#e8894f" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f2b44c" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 3D Arterial Lumen Cylinder Cutaway */}
        <g transform="translate(100, 60)">
          {/* Outer Vessel Wall (Tunica Adventitia) */}
          <ellipse cx="0" cy="0" rx="46" ry="26" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
          
          {/* Middle Muscular Layer (Tunica Media) */}
          <ellipse cx="0" cy="0" rx="38" ry="20" fill="url(#arteryGrad)" stroke="#c8693a" strokeWidth="2" />
          
          {/* Inner Lumen (Blood Volume) with Pulsatile expansion */}
          <ellipse cx="0" cy="0" rx="26" ry="14" fill="#991b1b" stroke="#f43f5e" strokeWidth="1.5" className="animate-pulse" />
          
          {/* Radial Pressure Vector Arrows */}
          {[-45, 0, 45, 135, 180, 225].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = Math.cos(rad) * 12;
            const y1 = Math.sin(rad) * 7;
            const x2 = Math.cos(rad) * 23;
            const y2 = Math.sin(rad) * 13;
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
            );
          })}
        </g>

        {/* Arterial Waveform Below */}
        <path
          d="M 15,102 Q 35,102 45,78 Q 50,70 56,84 Q 65,88 85,102 L 185,102"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">MAP: {Math.round((2 * dia + sys) / 3)} mmHg</text>
        <text x="12" y="26" fill="#e8894f" fontSize="8" fontFamily="monospace" fontWeight="bold">LUMEN COMPLIANCE: 0.94</text>
        <text x="188" y="16" textAnchor="end" fill="#f2b44c" fontSize="8" fontFamily="monospace" fontWeight="bold">SYS/DIA: {sys}/{dia}</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">PERIPHERAL SVR: 1120</text>
      </svg>
    </div>
  );
}

// 4. 3D Body Temperature Core Thermographic Hologram
export function BodyTempDiagram3D({ temp = 37.1 }) {
  const isHigh = temp > 37.5;
  const color = isHigh ? '#ef4444' : '#f59e0b';

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <defs>
          <radialGradient id="coreHeat" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {/* 3D Human Thermographic Silhouette */}
        <g transform="translate(100, 60) scale(0.85)">
          {/* Head */}
          <circle cx="0" cy="-40" r="10" fill="#f59e0b" opacity="0.6" stroke="#fef08a" strokeWidth="0.8" />
          {/* Torso Core Heat Zone */}
          <path d="M -16,-28 C -16,-28 16,-28 16,-28 C 18,-6 14,8 10,18 C 6,24 -6,24 -10,18 C -14,8 -18,-6 -16,-28 Z" fill="url(#coreHeat)" stroke="#ef4444" strokeWidth="1.2" />
          {/* Arms (Cooler Periphery) */}
          <path d="M -16,-26 L -32,-4 L -28,18" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M 16,-26 L 32,-4 L 28,18" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
          {/* Legs */}
          <path d="M -8,22 L -12,50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M 8,22 L 12,50" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.4" />

          {/* Radiative Heat Loss Wavelets */}
          <path d="M -22,-10 Q -28,-14 -22,-18" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.8" />
          <path d="M 22,-10 Q 28,-14 22,-18" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.8" />
        </g>

        {/* Telemetry Scale Bar */}
        <rect x="15" y="98" width="80" height="4" rx="2" fill="url(#coreHeat)" />
        <circle cx={15 + Math.min(80, Math.max(0, (temp - 36.0) * 40))} cy="100" r="4" fill="#ffffff" stroke="#ef4444" strokeWidth="1" />

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">CORE HOMEOSTASIS</text>
        <text x="12" y="26" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">VISCERAL TEMP: {temp}°C</text>
        <text x="188" y="16" textAnchor="end" fill="#38bdf8" fontSize="8" fontFamily="monospace">SKIN TEMP: 33.2°C</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">HEAT DISSIPATION: 0G SLOW</text>
      </svg>
    </div>
  );
}

// 5. 3D Circadian Sleep Hypnogram Wave Hologram
export function SleepDiagram3D({ score = 74 }) {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        {/* Stage Grid Lines */}
        <line x1="20" y1="40" x2="185" y2="40" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="20" y1="62" x2="185" y2="62" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="20" y1="84" x2="185" y2="84" stroke="#334155" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* Stage Axis Labels */}
        <text x="16" y="42" fill="#c084fc" fontSize="7" fontFamily="monospace">REM</text>
        <text x="16" y="64" fill="#94a3b8" fontSize="7" fontFamily="monospace">LIGHT</text>
        <text x="16" y="86" fill="#38bdf8" fontSize="7" fontFamily="monospace">DEEP</text>

        {/* 3D Hypnogram Stage Trajectory with glowing gradient */}
        <path
          d="M 30,40 L 45,62 L 60,84 L 78,84 L 88,40 L 105,62 L 120,84 L 140,84 L 152,40 L 170,62 L 185,40"
          fill="none"
          stroke="#a855f7"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Deep Slow-Wave sleep areas highlighted */}
        <rect x="60" y="78" width="18" height="12" rx="2" fill="#38bdf8" opacity="0.25" />
        <rect x="120" y="78" width="20" height="12" rx="2" fill="#38bdf8" opacity="0.25" />

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold">CIRCADIAN ARCHITECTURE</text>
        <text x="12" y="26" fill="#94a3b8" fontSize="8" fontFamily="monospace">SCORE: {score}/100 • 7.4h</text>
        <text x="188" y="16" textAnchor="end" fill="#38bdf8" fontSize="8" fontFamily="monospace">DEEP SLOW-WAVE: 21%</text>
        <text x="188" y="26" textAnchor="end" fill="#c084fc" fontSize="8" fontFamily="monospace">REM CYCLES: 4</text>
      </svg>
    </div>
  );
}

// 6. 3D Autonomic Stress & ANS Gyroscope Hologram
export function StressDiagram3D({ stress = 35 }) {
  const isHigh = stress > 65;
  const color = isHigh ? '#ef4444' : '#eab308';

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <g transform="translate(100, 60)">
          {/* Outer Gyro Ring */}
          <circle cx="0" cy="0" r="38" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <ellipse cx="0" cy="0" rx="36" ry="18" fill="none" stroke="#475569" strokeWidth="1" transform="rotate(-25)" />
          
          {/* Sympathetic vs Parasympathetic Balance Axis */}
          <line x1="-32" y1="0" x2="32" y2="0" stroke="#64748b" strokeWidth="1.5" />
          
          {/* Central Neural Synapse Core */}
          <circle cx="0" cy="0" r="8" fill={color} className="animate-pulse" opacity="0.85" />
          <circle cx="0" cy="0" r="14" fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" />

          {/* Action Potential Sparks */}
          {[-60, 30, 150].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <circle key={i} cx={Math.cos(rad) * 24} cy={Math.sin(rad) * 24} r="2" fill="#00f2fe" className="animate-ping" />
            );
          })}
        </g>

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">AUTONOMIC TONE</text>
        <text x="12" y="26" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">STRESS LOAD: {stress}/100</text>
        <text x="188" y="16" textAnchor="end" fill="#00f2fe" fontSize="8" fontFamily="monospace">VAGAL INDEX: 78</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">HRV RMSSD: 46ms</text>
      </svg>
    </div>
  );
}

// 7. 3D Cephalad Fluid Shift & SANS Hologram
export function FluidShiftDiagram3D({ shift = 1.4 }) {
  const isElevated = shift > 1.8;
  const color = isElevated ? '#ef4444' : '#10b981';

  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <defs>
          <linearGradient id="fluidShiftGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Head & Cranium Projection */}
        <g transform="translate(100, 62) scale(0.9)">
          {/* Cranial Vault with Cephalic Venous Pooling */}
          <path d="M -18,-15 C -24,-35 0,-42 16,-38 C 24,-30 22,-15 16,-5 C 10,2 -12,2 -18,-15 Z" fill="url(#fluidShiftGrad)" stroke="#38bdf8" strokeWidth="1.2" />

          {/* Eye Globe & Optic Nerve Sheath (SANS) */}
          <circle cx="16" cy="-22" r="5" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="17.5" cy="-22" r="2.2" fill="#0284c7" />
          {/* Optic Nerve Sheath posterior to eye */}
          <path d="M 12,-22 L -2,-20" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />

          {/* Internal Jugular Vein Headward Flow Arrows */}
          <path d="M -6,25 L -8,0" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" />
          <path d="M 6,25 L 8,0" stroke="#00f2fe" strokeWidth="2" strokeDasharray="3 2" />

          {/* Microgravity Upward Arrows */}
          <path d="M -25,18 L -25,-10" stroke="#38bdf8" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="2 2" />
          <path d="M 28,18 L 28,-10" stroke="#38bdf8" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="2 2" />
        </g>

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">CEPHALAD REDISTRIBUTION</text>
        <text x="12" y="26" fill={color} fontSize="8" fontFamily="monospace" fontWeight="bold">SHIFT: +{shift}σ INDEX</text>
        <text x="188" y="16" textAnchor="end" fill="#38bdf8" fontSize="8" fontFamily="monospace">ONSD: 5.6 mm</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">ICP: ~14 mmHg</text>
      </svg>
    </div>
  );
}

// 8. 3D Radiation Shielding Cutaway Diagram
export function RadiationShieldDiagram3D({ doseRate = 180, cumulative = 42 }) {
  return (
    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 130" className="w-full h-full max-h-32">
        {/* Layer 1: Outer Whipple Bumper (Aluminum) */}
        <rect x="25" y="30" width="10" height="70" rx="2" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" />
        <text x="30" y="112" fill="#94a3b8" fontSize="6.5" fontFamily="monospace" textAnchor="middle">AL-2219</text>

        {/* Layer 2: Borated Polyethylene */}
        <rect x="45" y="30" width="14" height="70" rx="2" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="0.8" />
        <text x="52" y="112" fill="#60a5fa" fontSize="6.5" fontFamily="monospace" textAnchor="middle">POLY-B</text>

        {/* Layer 3: Water Ballast Vault Barrier (45 g/cm2 H2O) */}
        <rect x="70" y="25" width="28" height="80" rx="3" fill="#0369a1" stroke="#38bdf8" strokeWidth="1.2" />
        <text x="84" y="115" fill="#38bdf8" fontSize="7" fontFamily="monospace" textAnchor="middle" fontWeight="bold">H2O VAULT</text>

        {/* Layer 4: Crew Safe Interior Habitacle */}
        <rect x="110" y="20" width="75" height="90" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="147" y="55" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CREW HAVEN</text>
        <text x="147" y="68" fill="#a7f3d0" fontSize="7" fontFamily="monospace" textAnchor="middle">ATTENUATION: 92%</text>

        {/* Incoming Cosmic Ray / SPE Protons Deflected/Stopped */}
        <path d="M 5,42 L 25,42" stroke="#ef4444" strokeWidth="2" />
        <path d="M 5,60 L 45,60" stroke="#ef4444" strokeWidth="2" />
        <path d="M 5,78 L 78,78" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="78" cy="78" r="3" fill="#ef4444" className="animate-ping" />

        {/* Telemetry Labels */}
        <text x="12" y="15" fill="#94a3b8" fontSize="8" fontFamily="monospace">ATTENUATION MODEL</text>
        <text x="188" y="15" textAnchor="end" fill="#10b981" fontSize="8" fontFamily="monospace" fontWeight="bold">SHELTER DOSE: {doseRate} μSv/h</text>
      </svg>
    </div>
  );
}

// 9. 3D Trabecular Bone Mineral Lattice Diagram
export function BoneDensityDiagram3D({ lossPercent = 3.2 }) {
  return (
    <div className="relative w-full h-36 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 130" className="w-full h-full max-h-32">
        {/* Bone Matrix Lattice 3D Cutaway */}
        <g transform="translate(60, 65)">
          {/* 1G Normal Trabecular Structure */}
          <circle cx="-25" cy="0" r="26" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
          <text x="-25" y="-30" fill="#f59e0b" fontSize="7" fontFamily="monospace" textAnchor="middle">1G MATRIX</text>
          {/* Dense mineral struts */}
          <path d="M -40,-10 L -10,12 M -38,14 L -12,-15 M -25,-22 L -25,22 M -44,0 L -6,0" stroke="#fbbf24" strokeWidth="2" />
        </g>

        <g transform="translate(140, 65)">
          {/* 0G Resorption Lattice with Gaps */}
          <circle cx="0" cy="0" r="26" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
          <text x="0" y="-30" fill="#ef4444" fontSize="7" fontFamily="monospace" textAnchor="middle">0G RESORPTION</text>
          {/* Thinned weakened struts */}
          <path d="M -15,-8 L -2,10 M -12,12 L -6,-10" stroke="#f87171" strokeWidth="1" strokeDasharray="3 2" />
          {/* Calcium ion release marker */}
          <circle cx="8" cy="-5" r="2" fill="#f87171" className="animate-ping" />
        </g>

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">TRABECULAR LOSS RATE</text>
        <text x="12" y="26" fill="#f59e0b" fontSize="8" fontFamily="monospace" fontWeight="bold">LOSS: -{lossPercent}% BMD</text>
        <text x="188" y="16" textAnchor="end" fill="#38bdf8" fontSize="8" fontFamily="monospace">ARED AXIAL: 140kg</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">CALCIUM: RENAL EXC</text>
      </svg>
    </div>
  );
}
