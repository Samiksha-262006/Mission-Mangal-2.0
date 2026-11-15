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

// 10. 3D Immune System Lymphocyte & Cytokine Diagram
export function ImmuneSystemDiagram3D({ efficiency = 76 }) {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        <defs>
          <radialGradient id="lymphocyteGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#7e22ce" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        {/* Cell membrane aura */}
        <circle cx="100" cy="58" r="36" fill="url(#lymphocyteGrad)" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="5 3" />
        <circle cx="100" cy="58" r="22" fill="#581c87" opacity="0.6" stroke="#c084fc" strokeWidth="1" />
        {/* Cell Nucleus */}
        <circle cx="96" cy="56" r="12" fill="#9333ea" opacity="0.8" />
        
        {/* Surface Receptors (Y-shaped antibodies) */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x = 100 + Math.cos(rad) * 36;
          const y = 58 + Math.sin(rad) * 36;
          const x2 = 100 + Math.cos(rad) * 44;
          const y2 = 58 + Math.sin(rad) * 44;
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x2} y2={y2} stroke="#c084fc" strokeWidth="1.5" />
              <circle cx={x2} cy={y2} r="2" fill="#e9d5ff" />
            </g>
          );
        })}

        {/* Floating Cytokines */}
        <circle cx="45" cy="40" r="3" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '2s' }} />
        <circle cx="155" cy="75" r="2.5" fill="#34d399" className="animate-ping" style={{ animationDuration: '2.5s' }} />

        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">T-CELL ACTIVATION</text>
        <text x="12" y="26" fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold">IMMUNE EFFICIENCY: {efficiency}%</text>
        <text x="188" y="16" textAnchor="end" fill="#38bdf8" fontSize="8" fontFamily="monospace">CYTOKINE PROFILE</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">LATENT VIRUS: SUPPRESSED</text>
      </svg>
    </div>
  );
}

// 11. 3D Deep Space Isolation & Circadian Telemetry Diagram
export function DeepSpaceIsolationDiagram3D({ stress = 42, sleep = 85 }) {
  return (
    <div className="relative w-full h-32 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/70 border border-slate-800/80 p-2">
      <svg viewBox="0 0 200 120" className="w-full h-full max-h-28">
        {/* Orbital link path between Earth and Mars */}
        <circle cx="35" cy="60" r="14" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" />
        <text x="35" y="63" textAnchor="middle" fontSize="6.5" fill="#93c5fd" fontFamily="monospace" fontWeight="bold">EARTH</text>
        
        <circle cx="165" cy="60" r="11" fill="#7c2d12" stroke="#ea580c" strokeWidth="1.5" />
        <text x="165" y="63" textAnchor="middle" fontSize="6.5" fill="#fdba74" fontFamily="monospace" fontWeight="bold">MARS</text>

        {/* Animated Radio wave carrier */}
        <path d="M 49,60 C 80,40 120,40 154,60" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.8" />
        <circle cx="100" cy="46" r="3" fill="#eab308" className="animate-ping" style={{ animationDuration: '1.8s' }} />

        {/* Circadian daylight rhythm bar below */}
        <rect x="50" y="85" width="100" height="8" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <rect x="50" y="85" width="65" height="8" rx="4" fill="url(#circadianGrad)" />
        <defs>
          <linearGradient id="circadianGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        <text x="100" y="105" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="monospace">24.6h MARTIAN SOL SYNCHRONIZED</text>
        
        {/* Telemetry Labels */}
        <text x="12" y="16" fill="#94a3b8" fontSize="8" fontFamily="monospace">COMMS ROUNDTRIP</text>
        <text x="12" y="26" fill="#eab308" fontSize="8" fontFamily="monospace" fontWeight="bold">DELAY: 18.6 MIN</text>
        <text x="188" y="16" textAnchor="end" fill="#38bdf8" fontSize="8" fontFamily="monospace">STRESS SCORE: {stress}</text>
        <text x="188" y="26" textAnchor="end" fill="#94a3b8" fontSize="8" fontFamily="monospace">SLEEP INDEX: {sleep}</text>
      </svg>
    </div>
  );
}

// 12. 3D Gaussian Health Drift Curve Diagram
export function DriftCurveDiagram3D({ metricName = 'Physiological Drift', zScore = 1.8 }) {
  return (
    <div className="relative w-full h-24 flex items-center justify-center overflow-hidden rounded-xl bg-space-950/80 border border-slate-800 p-1">
      <svg viewBox="0 0 200 90" className="w-full h-full">
        {/* Gaussian Baseline Bell Curve */}
        <path
          d="M 10,75 C 50,75 75,70 100,20 C 125,70 150,75 190,75"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />
        {/* Shaded Normal ±1σ Zone */}
        <path
          d="M 70,75 C 85,73 92,40 100,20 C 108,40 115,73 130,75 Z"
          fill="#10b981"
          fillOpacity="0.15"
        />
        {/* Baseline Center Axis */}
        <line x1="100" y1="15" x2="100" y2="78" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" />
        <text x="100" y="85" textAnchor="middle" fontSize="7" fill="#10b981" fontFamily="monospace">NORMAL BASELINE (0σ)</text>

        {/* Current Drift Point Marker */}
        <circle cx="138" cy="58" r="4.5" fill="#f59e0b" className="animate-pulse" />
        <line x1="138" y1="25" x2="138" y2="75" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
        <text x="138" y="20" textAnchor="middle" fontSize="7" fill="#f59e0b" fontFamily="monospace" fontWeight="bold">+1.8σ DRIFT</text>
      </svg>
    </div>
  );
}

// 13. Cellular Hydration Diagram (For Daily Checklist)
export function HydrationDiagram3D() {
  return (
    <div className="w-full h-12 flex items-center justify-center">
      <svg viewBox="0 0 100 45" className="w-full h-full">
        <path d="M 50,5 C 40,20 25,28 25,35 C 25,41 36,44 50,44 C 64,44 75,41 75,35 C 75,28 60,20 50,5 Z" fill="#0284c7" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M 45,18 C 42,24 35,28 35,34" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.75" />
        <circle cx="50" cy="32" r="3" fill="#38bdf8" className="animate-ping" />
      </svg>
    </div>
  );
}

// 14. Calorie & Exercise Energy Wave (For Daily Checklist)
export function CalorieBurnDiagram3D() {
  return (
    <div className="w-full h-12 flex items-center justify-center">
      <svg viewBox="0 0 100 45" className="w-full h-full">
        <path d="M 10,32 Q 25,5 40,28 T 70,12 T 90,30" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <path d="M 10,32 Q 25,5 40,28 T 70,12 T 90,30 L 90,40 L 10,40 Z" fill="#f59e0b" fillOpacity="0.15" />
        <circle cx="70" cy="12" r="3" fill="#fbbf24" className="animate-pulse" />
      </svg>
    </div>
  );
}

// 15. Hypnogram Sleep Stage Diagram (For Daily Checklist)
export function SleepStagesDiagram3D() {
  return (
    <div className="w-full h-12 flex items-center justify-center">
      <svg viewBox="0 0 100 45" className="w-full h-full">
        {/* Stages: Awake, REM, Light, Deep */}
        <polyline points="10,12 25,12 28,26 42,26 46,38 65,38 70,20 85,20 90,12" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="55" cy="38" r="2.5" fill="#c084fc" />
      </svg>
    </div>
  );
}

// 16. Mood & Autonomic Balance Wave (For Daily Checklist)
export function MoodWaveDiagram3D() {
  return (
    <div className="w-full h-12 flex items-center justify-center">
      <svg viewBox="0 0 100 45" className="w-full h-full">
        <path d="M 10,24 C 25,10 35,38 50,24 C 65,10 75,38 90,24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
        <circle cx="50" cy="24" r="3" fill="#34d399" className="animate-pulse" />
      </svg>
    </div>
  );
}

// 17. Mini Dosimeter Diagram
export function RadiationDosimeterMiniDiagram({ dose = 42 }) {
  return (
    <svg viewBox="0 0 60 32" width="56" height="30" className="inline-block shrink-0">
      <path d="M 6,28 A 24,24 0 0,1 54,28" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 6,28 A 24,24 0 0,1 36,8" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="30" cy="28" r="3" fill="#ffffff" />
    </svg>
  );
}

// 18. Mini Bone Matrix Diagram
export function BoneMatrixMiniDiagram() {
  return (
    <svg viewBox="0 0 60 32" width="56" height="30" className="inline-block shrink-0">
      <rect x="8" y="6" width="44" height="20" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1" />
      <line x1="18" y1="6" x2="18" y2="26" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2" />
      <line x1="30" y1="6" x2="30" y2="26" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 1" />
      <line x1="42" y1="6" x2="42" y2="26" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE HEALTH / GOOGLE FIT STYLE MEDICAL & BIOMETRIC DIAGRAMS
// Clean, high-contrast, informative vector SVGs matching Google Health / Fit UI
// ─────────────────────────────────────────────────────────────────────────────

// 19. Google Fit Cardiac Rhythm Diagram
export function GoogleCardiacRhythmDiagram({ bpm = 76, delta = 0, status = 'nominal', height = 64 }) {
  const isCrit = status === 'critical' || bpm > 100 || bpm < 50;
  const isWarn = status === 'warning' || bpm > 90;
  const color = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#10b981';
  const zone = bpm > 140 ? 'Peak' : bpm > 115 ? 'Cardio' : bpm > 90 ? 'Fat Burn' : 'Resting';
  const zoneColor = bpm > 140 ? '#ef4444' : bpm > 115 ? '#f59e0b' : bpm > 90 ? '#06b6d4' : '#10b981';

  return (
    <div className="w-full relative flex flex-col justify-center rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden" style={{ minHeight: height }}>
      {/* Google Fit cardio zone badge */}
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="flex items-center gap-1.5 font-bold" style={{ color: zoneColor }}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: zoneColor }} />
          {zone} Zone · {bpm} BPM
        </span>
        <span className="text-slate-400">
          {delta > 0 ? `+${delta} from baseline` : delta < 0 ? `${delta} from baseline` : 'At personal baseline'}
        </span>
      </div>

      {/* SVG Google ECG Rhythm waveform */}
      <svg viewBox="0 0 240 44" className="w-full h-11" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`ecgGrad-${bpm}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={`ecgFill-${bpm}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Subtle Google Health Grid */}
        <line x1="0" y1="11" x2="240" y2="11" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        <line x1="0" y1="22" x2="240" y2="22" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
        <line x1="0" y1="33" x2="240" y2="33" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

        {/* Shaded Area under ECG wave */}
        <path
          d="M 0,22 L 20,22 Q 25,20 28,22 L 34,22 L 37,26 L 40,6 L 43,36 L 47,20 L 52,22 L 72,22 Q 77,20 80,22 L 86,22 L 89,26 L 92,6 L 95,36 L 99,20 L 104,22 L 124,22 Q 129,20 132,22 L 138,22 L 141,26 L 144,6 L 147,36 L 151,20 L 156,22 L 176,22 Q 181,20 184,22 L 190,22 L 193,26 L 196,6 L 199,36 L 203,20 L 208,22 L 240,22 L 240,44 L 0,44 Z"
          fill={`url(#ecgFill-${bpm})`}
        />

        {/* Crisp ECG Line */}
        <path
          d="M 0,22 L 20,22 Q 25,20 28,22 L 34,22 L 37,26 L 40,6 L 43,36 L 47,20 L 52,22 L 72,22 Q 77,20 80,22 L 86,22 L 89,26 L 92,6 L 95,36 L 99,20 L 104,22 L 124,22 Q 129,20 132,22 L 138,22 L 141,26 L 144,6 L 147,36 L 151,20 L 156,22 L 176,22 Q 181,20 184,22 L 190,22 L 193,26 L 196,6 L 199,36 L 203,20 L 208,22 L 240,22"
          fill="none"
          stroke={`url(#ecgGrad-${bpm})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse R-peak indicator dot */}
        <circle cx="144" cy="6" r="3" fill="#ffffff" stroke={color} strokeWidth="1.5" className="animate-ping" />
        <circle cx="144" cy="6" r="2" fill={color} />
      </svg>
    </div>
  );
}

// 20. Google Health Arterial Pressure Diagram
export function GoogleArterialPressureDiagram({ sys = 120, dia = 80, baseSys = 116, height = 64 }) {
  // Classification: Normal (<120/80), Elevated (120-129/<80), Stage 1 (130-139/80-89), Stage 2 (>=140/>=90)
  const isStage2 = sys >= 140 || dia >= 90;
  const isStage1 = (sys >= 130 && sys < 140) || (dia >= 80 && dia < 90);
  const isElevated = sys >= 120 && sys < 130 && dia < 80;
  const statusLabel = isStage2 ? 'Stage 2 Alert' : isStage1 ? 'Stage 1 Elevated' : isElevated ? 'Elevated' : 'Optimal Normal';
  const statusColor = isStage2 ? '#ef4444' : isStage1 ? '#f59e0b' : isElevated ? '#fbbf24' : '#10b981';

  // Normalize systolic (range 90 - 180) and diastolic (range 50 - 120) to percentage
  const sysPct = Math.min(Math.max((sys - 90) / 90, 0), 1);
  const diaPct = Math.min(Math.max((dia - 50) / 70, 0), 1);

  return (
    <div className="w-full relative flex flex-col justify-center rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden" style={{ minHeight: height }}>
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="font-bold flex items-center gap-1.5" style={{ color: statusColor }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
          {statusLabel}
        </span>
        <span className="text-slate-400">Target &lt; 120/80 mmHg</span>
      </div>

      {/* Dual Google Health arterial bars */}
      <div className="space-y-1.5 my-1">
        {/* Systolic Bar */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[8px] font-mono text-slate-300">
            <span>Systolic ({sys} mmHg)</span>
            <span className="text-slate-400">Ref: {baseSys}</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex relative">
            {/* Color threshold zones: Green -> Amber -> Red */}
            <div className="w-[33%] h-full bg-emerald-500/20 border-r border-slate-800" />
            <div className="w-[22%] h-full bg-amber-500/20 border-r border-slate-800" />
            <div className="w-[45%] h-full bg-red-500/20" />
            {/* Active Marker */}
            <div
              className="absolute top-0 bottom-0 rounded-full transition-all duration-500 shadow-sm"
              style={{
                left: `${Math.max(sysPct * 100 - 4, 0)}%`,
                width: '8px',
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}`
              }}
            />
          </div>
        </div>

        {/* Diastolic Bar */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[8px] font-mono text-slate-300">
            <span>Diastolic ({dia} mmHg)</span>
            <span className="text-slate-400">Ref: 78</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex relative">
            <div className="w-[42%] h-full bg-emerald-500/20 border-r border-slate-800" />
            <div className="w-[28%] h-full bg-amber-500/20 border-r border-slate-800" />
            <div className="w-[30%] h-full bg-red-500/20" />
            <div
              className="absolute top-0 bottom-0 rounded-full transition-all duration-500 shadow-sm"
              style={{
                left: `${Math.max(diaPct * 100 - 4, 0)}%`,
                width: '8px',
                backgroundColor: statusColor,
                boxShadow: `0 0 8px ${statusColor}`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 21. Google Health Oxygen Capillary Diffusion Diagram
export function GoogleOxygenCapillaryDiagram({ spo2 = 98, height = 64 }) {
  const isLow = spo2 < 95;
  const color = isLow ? '#f59e0b' : '#06b6d4';

  return (
    <div className="w-full relative flex flex-col justify-center rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden" style={{ minHeight: height }}>
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="font-bold flex items-center gap-1.5" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {spo2 >= 95 ? 'Normal Saturation' : 'Hypoxic Warning'}
        </span>
        <span className="text-slate-400">Safe: 95%–100%</span>
      </div>

      {/* Microvascular Alveolar Diffusion Wave */}
      <svg viewBox="0 0 200 36" className="w-full h-9">
        <defs>
          <linearGradient id="o2Grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Capillary lumen tube */}
        <rect x="10" y="8" width="180" height="20" rx="10" fill="#082f49" fillOpacity="0.4" stroke="#0369a1" strokeWidth="1" strokeDasharray="3 2" />

        {/* Red Blood Cells with O2 bond */}
        {[30, 65, 100, 135, 170].map((cx, i) => (
          <g key={i}>
            <ellipse cx={cx} cy="18" rx="10" ry="6" fill="#be123c" stroke="#f43f5e" strokeWidth="1" />
            <circle cx={cx - 3} cy="17" r="2" fill="#38bdf8" />
            <circle cx={cx + 3} cy="17" r="2" fill="#38bdf8" />
          </g>
        ))}

        {/* Free Floating Oxygen Molecules */}
        <circle cx="50" cy="11" r="1.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '2s' }} />
        <circle cx="120" cy="25" r="1.5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '2.5s' }} />
      </svg>
    </div>
  );
}

// 22. Google Health Radiation Dosimeter Diagram
export function GoogleRadiationDosimeterDiagram({ dose = 96.8, max = 250, height = 64 }) {
  const pct = Math.min(dose / max, 1);
  const color = dose > 200 ? '#ef4444' : dose > 100 ? '#f59e0b' : '#10b981';
  const status = dose > 200 ? 'Danger Zone' : dose > 100 ? 'Elevated Transit' : 'Nominal Transit';

  return (
    <div className="w-full relative flex flex-col justify-center rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden" style={{ minHeight: height }}>
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="font-bold flex items-center gap-1.5" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {status}
        </span>
        <span className="text-slate-400">Max: {max} mSv</span>
      </div>

      {/* Semicircular Radiation Arc Gauge */}
      <div className="flex items-center justify-center my-0.5">
        <svg viewBox="0 0 160 56" className="w-36 h-12">
          {/* Background Arc Sectors */}
          <path d="M 20,50 A 60,60 0 0,1 140,50" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinecap="round" />
          {/* Safe Green Zone (0 - 100 mSv: 40%) */}
          <path d="M 20,50 A 60,60 0 0,1 68,14" fill="none" stroke="#10b981" strokeWidth="8" strokeOpacity="0.4" />
          {/* Caution Amber Zone (100 - 200 mSv: 40%) */}
          <path d="M 68,14 A 60,60 0 0,1 120,24" fill="none" stroke="#f59e0b" strokeWidth="8" strokeOpacity="0.4" />
          {/* Critical Red Zone (200 - 250 mSv: 20%) */}
          <path d="M 120,24 A 60,60 0 0,1 140,50" fill="none" stroke="#ef4444" strokeWidth="8" strokeOpacity="0.4" />

          {/* Active Dose Fill */}
          <path
            d="M 20,50 A 60,60 0 0,1 140,50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 188} 200`}
          />

          {/* Needle Center & Readout */}
          <circle cx="80" cy="50" r="4" fill="#ffffff" />
          <text x="80" y="44" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold" fontFamily="monospace">
            {dose} mSv
          </text>
        </svg>
      </div>
    </div>
  );
}

// 23. Google Fit Mental Coherence & Brainwave Diagram
export function GoogleMentalCoherenceDiagram({ score = 78, isLocked = false, height = 72 }) {
  const color = score >= 75 ? '#a855f7' : score >= 50 ? '#06b6d4' : '#ef4444';

  return (
    <div className="w-full relative flex flex-col justify-center rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden" style={{ minHeight: height }}>
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="font-bold flex items-center gap-1.5" style={{ color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          {isLocked ? 'Encrypted Biometric EEG' : `Circadian Coherence: ${score}%`}
        </span>
        <span className="text-slate-400">{isLocked ? 'Protected Log' : 'Alpha/Theta Waves'}</span>
      </div>

      <div className={`relative ${isLocked ? 'filter blur-[3px] select-none opacity-40' : ''}`}>
        <svg viewBox="0 0 220 36" className="w-full h-9">
          <defs>
            <linearGradient id="mindGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M 5,18 Q 20,4 35,18 T 65,18 T 95,18 T 125,18 T 155,18 T 185,18 T 215,18"
            fill="none"
            stroke="url(#mindGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 5,18 Q 15,26 25,18 T 45,18 T 65,18 T 85,18 T 105,18 T 125,18 T 145,18 T 165,18 T 185,18 T 205,18"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="2 2"
            opacity="0.6"
          />
        </svg>
      </div>

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
          <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/40">
            🔒 Private Session Data
          </span>
        </div>
      )}
    </div>
  );
}

// 24. Google Medical Pharmacology & Mechanism-of-Action Diagram
export function GooglePharmacologyDiagram({ category = 'Cardiovascular', medName = 'Aspirin' }) {
  const isAspirin = medName.toLowerCase().includes('aspirin');
  const isNitro = medName.toLowerCase().includes('nitroglycerin');
  const isOxygen = medName.toLowerCase().includes('oxygen');
  const isIbuprofen = medName.toLowerCase().includes('ibuprofen');
  const isORS = medName.toLowerCase().includes('rehydration') || medName.toLowerCase().includes('ors');
  const isPromethazine = medName.toLowerCase().includes('promethazine');

  return (
    <div className="w-full relative rounded-xl bg-slate-950/90 border border-slate-800/80 p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-cyan-400 font-bold uppercase">Clinical Target Mechanism</span>
        <span className="text-slate-400 font-mono">Bioavailability &gt; 92%</span>
      </div>

      <div className="h-14 flex items-center justify-center">
        {isAspirin && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            {/* Antiplatelet: Cyclooxygenase block */}
            <rect x="15" y="10" width="70" height="28" rx="6" fill="#0f172a" stroke="#06b6d4" strokeWidth="1" />
            <text x="50" y="27" textAnchor="middle" fontSize="8" fill="#38bdf8" fontWeight="bold">COX-1 INHIBIT</text>
            <path d="M 85,24 L 115,24" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
            <polygon points="112,21 118,24 112,27" fill="#f43f5e" />
            <rect x="115" y="10" width="70" height="28" rx="6" fill="#4c0519" stroke="#ef4444" strokeWidth="1" />
            <text x="150" y="27" textAnchor="middle" fontSize="8" fill="#fca5a5" fontWeight="bold">CLOT BLOCKED</text>
          </svg>
        )}

        {isNitro && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            {/* Vasodilator: Vascular smooth muscle widening */}
            <path d="M 20,14 Q 100,6 180,14" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
            <path d="M 20,34 Q 100,42 180,34" fill="none" stroke="#0ea5e9" strokeWidth="2.5" />
            <text x="100" y="26" textAnchor="middle" fontSize="9" fill="#38bdf8" fontWeight="bold">CORONARY VASODILATION (NO⁺)</text>
            <circle cx="60" cy="24" r="3" fill="#22c55e" className="animate-ping" />
            <circle cx="140" cy="24" r="3" fill="#22c55e" className="animate-ping" />
          </svg>
        )}

        {isOxygen && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            {/* Alveolar Partial Pressure O2 Transfer */}
            <circle cx="50" cy="24" r="16" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
            <text x="50" y="27" textAnchor="middle" fontSize="8" fill="#a7f3d0">ALVEOLUS</text>
            <path d="M 70,24 L 120,24" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="145" cy="24" r="14" fill="#1e3a5f" stroke="#0284c7" strokeWidth="1.5" />
            <text x="145" y="27" textAnchor="middle" fontSize="8" fill="#7dd3fc">CAPILLARY</text>
          </svg>
        )}

        {isIbuprofen && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            {/* COX-2 Prostaglandin Curve */}
            <path d="M 20,36 C 60,36 70,12 110,12 C 140,12 150,32 180,32" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <text x="100" y="38" textAnchor="middle" fontSize="8" fill="#fbbf24">PROSTAGLANDIN SYNTHESIS ↓ 88%</text>
          </svg>
        )}

        {isORS && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            {/* SGLT-1 Sodium-Glucose Cotransport */}
            <rect x="25" y="12" width="150" height="24" rx="12" fill="#0c4a6e" stroke="#0284c7" strokeWidth="1.2" />
            <text x="100" y="27" textAnchor="middle" fontSize="8" fill="#38bdf8" fontWeight="bold">SGLT-1 Na⁺ / GLUCOSE OSMOSIS</text>
            <circle cx="45" cy="24" r="3" fill="#ffffff" />
            <circle cx="155" cy="24" r="3" fill="#ffffff" />
          </svg>
        )}

        {isPromethazine && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            {/* Vestibular H1 Stabilization */}
            <ellipse cx="60" cy="24" rx="20" ry="12" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
            <text x="60" y="27" textAnchor="middle" fontSize="7" fill="#e9d5ff">OTOLITH</text>
            <path d="M 85,24 L 115,24" stroke="#c084fc" strokeWidth="2" />
            <rect x="115" y="12" width="65" height="24" rx="4" fill="#0f172a" stroke="#a855f7" strokeWidth="1" />
            <text x="147" y="27" textAnchor="middle" fontSize="8" fill="#e9d5ff">H1 BLOCKED</text>
          </svg>
        )}

        {!isAspirin && !isNitro && !isOxygen && !isIbuprofen && !isORS && !isPromethazine && (
          <svg viewBox="0 0 200 48" className="w-full h-full">
            <path d="M 20,38 C 50,38 70,10 110,10 C 150,10 160,34 185,34" fill="none" stroke="#10b981" strokeWidth="2" />
            <text x="100" y="32" textAnchor="middle" fontSize="8" fill="#6ee7b7">BIOACTIVE METABOLIC RESPONSE</text>
          </svg>
        )}
      </div>
    </div>
  );
}

// 25. Google Biomechanics Axial Load Diagram (For ARED Squat)
export function GoogleAxialBiomechanicsDiagram() {
  return (
    <div className="w-full relative rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-cyan-400 font-bold">Axial Force Vector (125 kg eq.)</span>
        <span className="text-emerald-400">Lumbar Compression: 2.4 kN</span>
      </div>
      <svg viewBox="0 0 200 40" className="w-full h-10">
        {/* Spine line with lumbar vertebras */}
        <line x1="20" y1="20" x2="180" y2="20" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
        {[40, 70, 100, 130, 160].map((x, i) => (
          <g key={i}>
            <rect x={x - 6} y="13" width="12" height="14" rx="2" fill="#1e293b" stroke="#00f2fe" strokeWidth="1.2" />
            <line x1={x} y1="4" x2={x} y2="12" stroke="#f43f5e" strokeWidth="1.5" />
            <polygon points={`${x-2},10 ${x},13 ${x+2},10`} fill="#f43f5e" />
          </g>
        ))}
      </svg>
    </div>
  );
}

// 26. Google Aerobic Cardio Curve Diagram (For Treadmill)
export function GoogleAerobicCardioCurveDiagram() {
  return (
    <div className="w-full relative rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-amber-400 font-bold">VO2 Target Band: 135–158 BPM</span>
        <span className="text-cyan-300">Aerobic Duration: 45m</span>
      </div>
      <svg viewBox="0 0 200 40" className="w-full h-10">
        {/* Target Zone Shading */}
        <rect x="40" y="8" width="120" height="24" fill="#f59e0b" fillOpacity="0.15" rx="4" />
        <path d="M 10,32 Q 40,28 60,18 T 120,14 T 160,18 T 190,30" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
        <circle cx="110" cy="15" r="3" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.5" className="animate-pulse" />
      </svg>
    </div>
  );
}

// 27. Google Bone Remodeling Cycle Diagram
export function GoogleBoneRemodelingDiagram() {
  return (
    <div className="w-full relative rounded-xl bg-slate-950/80 border border-slate-800/80 p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-purple-400 font-bold">Osteoblast / Osteoclast Flux</span>
        <span className="text-emerald-400">Resorption Offset: +0.28%/wk</span>
      </div>
      <svg viewBox="0 0 200 40" className="w-full h-10">
        <circle cx="50" cy="20" r="14" fill="#0f172a" stroke="#10b981" strokeWidth="1.5" />
        <text x="50" y="23" textAnchor="middle" fontSize="7" fill="#6ee7b7" fontWeight="bold">BUILD (OB)</text>
        <path d="M 68,20 L 132,20" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 2" />
        <circle cx="150" cy="20" r="14" fill="#0f172a" stroke="#ef4444" strokeWidth="1.5" />
        <text x="150" y="23" textAnchor="middle" fontSize="7" fill="#fca5a5" fontWeight="bold">LOSS (OC)</text>
      </svg>
    </div>
  );
}

// 28. Mini Google Fit Biometric Rhythm Diagram (For Astronaut Cards)
export function GoogleCrewBiometricRhythmDiagram({ hr = 68, fatigue = 30, status = 'nominal' }) {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';

  return (
    <svg viewBox="0 0 100 24" className="w-full h-6 shrink-0" preserveAspectRatio="none">
      <path
        d="M 5,12 L 20,12 L 25,6 L 30,18 L 35,4 L 40,20 L 45,12 L 65,12 L 70,8 L 75,16 L 80,12 L 95,12"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="4" r="2" fill={color} className="animate-pulse" />
    </svg>
  );
}

// 29. Google Medical Telemetry Waveform Diagram (For Alerts)
export function GoogleTelemetryWaveformDiagram({ category = 'Cardiovascular', severity = 'critical' }) {
  const isCrit = severity === 'critical';
  const color = isCrit ? '#ef4444' : '#f59e0b';

  return (
    <svg viewBox="0 0 140 28" className="w-32 h-7 shrink-0" preserveAspectRatio="none">
      <line x1="0" y1="14" x2="140" y2="14" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />
      <path
        d="M 5,14 L 25,14 L 32,7 L 38,21 L 45,3 L 52,25 L 58,14 L 85,14 L 92,6 L 98,22 L 105,14 L 135,14"
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="45" cy="3" r="2.5" fill="#ffffff" stroke={color} strokeWidth="1" />
    </svg>
  );
}

// 30. Google Cloud Metric Sparkline Diagram (For Admin Stat Tiles)
export function GoogleCloudMetricSparklineDiagram({ color = '#a855f7' }) {
  return (
    <svg viewBox="0 0 100 28" className="w-full h-7" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M 5,22 Q 25,10 45,18 T 75,8 T 95,14 L 95,28 L 5,28 Z"
        fill={`url(#sparkGrad-${color.replace('#','')})`}
      />
      <path
        d="M 5,22 Q 25,10 45,18 T 75,8 T 95,14"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="95" cy="14" r="2.5" fill="#ffffff" stroke={color} strokeWidth="1" />
    </svg>
  );
}

// 31. Google Deep Space Interplanetary Radio Telemetry Link Diagram
export function GoogleRadioLinkDiagram() {
  return (
    <div className="w-full relative rounded-xl bg-slate-950/90 border border-slate-800 p-2 overflow-hidden">
      <div className="flex items-center justify-between text-[9px] font-mono mb-1">
        <span className="text-violet-400 font-bold">Nagpur Ground Station ⟷ Mars Orbit Spacecraft</span>
        <span className="text-cyan-400">One-way Light Delay: 18.4 min</span>
      </div>
      <svg viewBox="0 0 300 48" className="w-full h-12">
        {/* Ground Station Dish */}
        <circle cx="25" cy="24" r="16" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" />
        <text x="25" y="27" textAnchor="middle" fontSize="8" fill="#c4b5fd" fontWeight="bold">DSN</text>

        {/* Radio Carrier Wave packets */}
        <path d="M 45,24 Q 65,12 85,24 T 125,24 T 165,24 T 205,24 T 245,24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
        <circle cx="145" cy="24" r="3.5" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '2s' }} />

        {/* Spacecraft Avionics */}
        <circle cx="275" cy="24" r="16" fill="#082f49" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="275" y="27" textAnchor="middle" fontSize="8" fill="#67e8f9" fontWeight="bold">MARS</text>
      </svg>
    </div>
  );
}


