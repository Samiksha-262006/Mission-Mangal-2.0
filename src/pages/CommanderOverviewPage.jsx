import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { 
  Compass, Shield, AlertTriangle, Users, Clock, 
  CheckCircle2, AlertOctagon, UserCheck, Flame, Radio, 
  Moon, Zap, ArrowRight, ShieldAlert, Award
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import defaultCrew from '../data/crew.json';
import { soundEngine } from '../utils/audio';
import { GoogleCrewBiometricRhythmDiagram } from '../components/BiometricDiagrams3D';

// ─────────────────────────── WebGL / motion detection ───────────────────────
const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && c.getContext('webgl'));
  } catch (e) { return false; }
})();
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const use3D = hasWebGL && !prefersReducedMotion;

// ─────────────────────────── 2D SVG Fallback Orbit ───────────────────────────
function OrbitFallback2D({ progress }) {
  const pct = Math.round(progress * 100);
  // Spacecraft position along elliptical arc
  const angle = Math.PI * progress;
  const cx = 200, cy = 110, rx = 160, ry = 70;
  const sx = cx + Math.cos(Math.PI - angle) * rx * 0.72;
  const sy = cy - Math.sin(angle) * ry * 0.9;
  return (
    <div className="relative h-44 rounded-2xl overflow-hidden border border-cyan-500/30 bg-slate-950 flex items-center justify-center">
      <svg width="400" height="180" viewBox="0 0 400 180" className="w-full h-full">
        {/* Stars */}
        {[...Array(40)].map((_, i) => (
          <circle key={i} cx={(i * 73 + 11) % 400} cy={(i * 47 + 7) % 180}
            r="0.8" fill="white" opacity={0.4 + (i % 3) * 0.2} />
        ))}
        {/* Earth orbit ring */}
        <ellipse cx={cx} cy={cy} rx={rx * 0.62} ry={ry * 0.62}
          fill="none" stroke="#2255ff" strokeWidth="1" opacity="0.4" strokeDasharray="4 3" />
        {/* Mars orbit ring */}
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none" stroke="#cc4400" strokeWidth="1" opacity="0.4" strokeDasharray="4 3" />
        {/* Transfer arc */}
        <path d={`M ${cx + rx * 0.62} ${cy} Q ${cx + rx * 0.5} ${cy - ry * 1.3} ${cx - rx * 0.72} ${cy - ry * 0.4}`}
          fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
        {/* Sun */}
        <circle cx={cx} cy={cy} r="12" fill="#ff9500" opacity="0.95" />
        <circle cx={cx} cy={cy} r="18" fill="#ff6600" opacity="0.15" />
        {/* Earth */}
        <circle cx={cx + rx * 0.62} cy={cy} r="7" fill="#2255ff" />
        <text x={cx + rx * 0.62} y={cy + 18} textAnchor="middle" fontSize="8" fill="#94a3b8">Earth</text>
        {/* Mars */}
        <circle cx={cx - rx * 0.72} cy={cy - ry * 0.4} r="6" fill="#cc4400" />
        <text x={cx - rx * 0.72} y={cy - ry * 0.4 + 16} textAnchor="middle" fontSize="8" fill="#94a3b8">Mars</text>
        {/* Spacecraft */}
        <polygon points={`${sx},${sy - 6} ${sx - 4},${sy + 4} ${sx + 4},${sy + 4}`}
          fill="#00f2fe" opacity="0.9" />
        <circle cx={sx} cy={sy} r="8" fill="none" stroke="#00f2fe" strokeWidth="1" opacity="0.4" />
      </svg>
      <div className="absolute bottom-3 left-3 bg-slate-900/80 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-mono">
        Day {Math.round(progress * 180)} of 180 · {pct}% of the way to Mars
      </div>
    </div>
  );
}

// ─────────────────────────── 3D Trajectory (raw THREE.js) ────────────────────
function Orbit3D({ missionDay }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight || 288;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 6, 10);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) { return; }

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starArr = [];
    for (let i = 0; i < 3000; i++) {
      starArr.push((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160, (Math.random() - 0.5) * 160);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starArr, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Ambient light
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    // Sun
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#ff9500', emissive: '#ff6600', emissiveIntensity: 2 })
    );
    const sunLight = new THREE.PointLight('#ff9500', 3, 20);
    sun.add(sunLight);
    scene.add(sun);

    // Earth orbit ring
    const earthOrbitR = 3;
    const eRing = new THREE.Mesh(
      new THREE.RingGeometry(earthOrbitR - 0.015, earthOrbitR + 0.015, 64),
      new THREE.MeshBasicMaterial({ color: '#2255ff', side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
    );
    eRing.rotation.x = Math.PI / 2;
    scene.add(eRing);

    // Mars orbit ring
    const marsOrbitR = 5.5;
    const mRing = new THREE.Mesh(
      new THREE.RingGeometry(marsOrbitR - 0.015, marsOrbitR + 0.015, 64),
      new THREE.MeshBasicMaterial({ color: '#cc4400', side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
    );
    mRing.rotation.x = Math.PI / 2;
    scene.add(mRing);

    // Earth sphere (animated)
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#2255ff', emissive: '#0033aa', emissiveIntensity: 0.4 })
    );
    scene.add(earth);

    // Mars sphere (animated)
    const mars = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#cc4400', emissive: '#882200', emissiveIntensity: 0.5 })
    );
    scene.add(mars);

    // Flight path arc
    const progress = Math.min(Math.max((missionDay - 1) / 179, 0), 1);
    const arcPts = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const angle = Math.PI * t;
      arcPts.push(new THREE.Vector3(Math.cos(angle) * 4.2, 0, Math.sin(angle) * 2.5));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
    scene.add(new THREE.Line(arcGeo, new THREE.LineBasicMaterial({ color: '#00f2fe', transparent: true, opacity: 0.5 })));

    // Spacecraft
    const spAngle = Math.PI * progress;
    const ship = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.2, 6),
      new THREE.MeshStandardMaterial({ color: '#00f2fe', emissive: '#00c8f8', emissiveIntensity: 1.5 })
    );
    const shipLight = new THREE.PointLight('#00f2fe', 1, 2);
    ship.position.set(Math.cos(spAngle) * 4.2, 0.1, Math.sin(spAngle) * 2.5);
    ship.add(shipLight);
    scene.add(ship);

    // Beacon ring around ship
    const beacon = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.22, 16),
      new THREE.MeshBasicMaterial({ color: '#00f2fe', side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    beacon.rotation.x = Math.PI / 2;
    beacon.position.copy(ship.position);
    scene.add(beacon);

    // Resize handler
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / (container.clientHeight || 288);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight || 288);
    };
    window.addEventListener('resize', onResize);

    // Animation
    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      earth.position.set(Math.cos(t * 0.3) * earthOrbitR, 0, Math.sin(t * 0.3) * earthOrbitR);
      mars.position.set(Math.cos(t * 0.18) * marsOrbitR, 0, Math.sin(t * 0.18) * marsOrbitR);
      const s = 1 + Math.sin(t * 6) * 0.3;
      beacon.scale.set(s, s, s);
      sun.rotation.y += 0.005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, [missionDay]);

  return <div ref={mountRef} className="w-full h-full" />;
}

// ─────────────────────────── Fatigue Gauge (SVG circle) ──────────────────────
function FatigueGauge({ value, color }) {
  const r = 24, circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
      <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 32 32)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="32" y="37" textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">{value}%</text>
    </svg>
  );
}

// ─────────────────────────── Astronaut Helmet Avatar ─────────────────────────
function HelmetAvatar({ initials, statusColor }) {
  return (
    <svg viewBox="0 0 60 60" width="56" height="56">
      <circle cx="30" cy="30" r="28" fill="#0f172a" stroke={statusColor} strokeWidth="3" />
      <ellipse cx="30" cy="27" rx="16" ry="18" fill="#1e3a5f" opacity="0.8" />
      <ellipse cx="30" cy="26" rx="12" ry="13" fill="#0ea5e9" opacity="0.3" />
      <text x="30" y="31" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{initials}</text>
    </svg>
  );
}

// ─────────────────────────── Sleep Bar Chart (7 nights) ───────────────────────
function SleepBars({ hours }) {
  // Mock 7-night data with actual last night as final bar
  const nights = [7.2, 6.8, 7.4, 6.9, 7.1, 6.5, hours];
  const maxH = 24;
  return (
    <svg width="52" height="32" viewBox="0 0 52 32" className="mt-1">
      {nights.map((h, i) => {
        const barH = Math.min((h / 9) * maxH, maxH);
        const color = h < 6 ? '#ef4444' : h < 7 ? '#f59e0b' : '#06b6d4';
        return (
          <rect key={i} x={i * 7 + 1} y={maxH - barH + 4} width="5" height={barH}
            fill={color} rx="1" opacity="0.85" />
        );
      })}
    </svg>
  );
}

// ─────────────────────────── Main Page ───────────────────────────────────────
export default function CommanderOverviewPage() {
  const { 
    crew, 
    assignCrewTask, 
    missionDay, 
    activeEvents, 
    toggleTriggerEvent, 
    stormShelterEvacuated, 
    setStormShelterEvacuated 
  } = useMissionStore();
  const { t } = useLanguage();

  const activeCrew = (crew && Array.isArray(crew) && crew.length > 0) ? crew : defaultCrew;
  const missionProgress = Math.min(Math.max((missionDay - 1) / 179, 0), 1);

  // Task assignment form state
  const [selectedCrewId, setSelectedCrewId] = useState(activeCrew[0]?.id || 'crew_1');
  const [selectedTask, setSelectedTask] = useState('Outside Solar Array Inspection');
  const [taskRisk, setTaskRisk] = useState('Critical');
  const [schedulingWarning, setSchedulingWarning] = useState(null);
  const [assignmentSuccess, setAssignmentSuccess] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [showOrbitTooltip, setShowOrbitTooltip] = useState(false);

  const availableTasks = [
    { name: 'Outside Solar Array Inspection', risk: 'Critical', maxFatigue: 50, requiredSleep: 6.0 },
    { name: 'Manual Thruster Burn Maneuver', risk: 'Critical', maxFatigue: 45, requiredSleep: 6.5 },
    { name: 'Engine Diagnostic & Filter Check', risk: 'Critical', maxFatigue: 50, requiredSleep: 6.0 },
    { name: 'Air Scrubber Carbon Filter Swap', risk: 'Medium', maxFatigue: 65, requiredSleep: 5.0 },
    { name: 'Plant Growth & Hydroponics Care', risk: 'Low', maxFatigue: 80, requiredSleep: 4.0 },
    { name: 'Deep Space Navigation Log Entry', risk: 'Medium', maxFatigue: 65, requiredSleep: 5.0 }
  ];

  const getReadiness = (member) => {
    if (member.fatigueLevel >= 70 || member.sleepHours < 5.0) {
      return { status: 'NOT FIT', color: '#ef4444', badge: 'bg-red-500/20 text-red-300 border-red-500', desc: 'Mandatory Rest Required', fit: 'not_fit' };
    }
    if (member.fatigueLevel >= 45 || member.sleepHours < 6.5) {
      return { status: 'CAUTION', color: '#f59e0b', badge: 'bg-amber-500/20 text-amber-300 border-amber-500', desc: 'Light Duties Only', fit: 'caution' };
    }
    return { status: 'FIT', color: '#22c55e', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500', desc: 'Cleared for All Operations', fit: 'fit' };
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    setAssignmentSuccess(null);
    const astronaut = activeCrew.find((c) => c.id === selectedCrewId);
    if (!astronaut) return;
    const taskObj = availableTasks.find((t) => t.name === selectedTask) || { risk: taskRisk, maxFatigue: 55, requiredSleep: 5.5 };
    if (taskObj.risk === 'Critical' && ((astronaut.fatigueLevel || 0) > taskObj.maxFatigue || (astronaut.sleepHours || 0) < taskObj.requiredSleep)) {
      soundEngine.playWarningChime();
      setSchedulingWarning({
        crewName: astronaut.name,
        role: astronaut.role,
        fatigue: astronaut.fatigueLevel,
        sleep: astronaut.sleepHours,
        task: selectedTask,
        recommendation: `Sarah Chen (Tiredness 28%) or Elena (Tiredness 42%) have adequate rest for this critical maneuver.`
      });
      return;
    }
    soundEngine.playTelemetryPing();
    assignCrewTask(selectedCrewId, selectedTask, taskRisk);
    setSchedulingWarning(null);
    setAssignmentSuccess(`Mission task "${selectedTask}" assigned to ${astronaut.name}. Operational clearance validated.`);
    setTimeout(() => setAssignmentSuccess(null), 4000);
  };

  const handleForceOverride = () => {
    soundEngine.playTelemetryPing();
    const astronaut = activeCrew.find((c) => c.id === selectedCrewId);
    assignCrewTask(selectedCrewId, selectedTask, taskRisk);
    setSchedulingWarning(null);
    setAssignmentSuccess(`COMMANDER OVERRIDE: "${selectedTask}" assigned to ${astronaut?.name || 'Astronaut'} under operational necessity.`);
    setTimeout(() => setAssignmentSuccess(null), 4000);
  };

  const triggerOrder = (orderType) => {
    soundEngine.playCriticalAlarm();
    if (orderType === 'SHELTER_DRILL') {
      setStormShelterEvacuated(true);
      setActiveOrder({ title: 'COMMANDER ORDER: STORM SHELTER DRILL INITIATED', desc: 'All personnel ordered to proceed to Module 04 Storm Shelter immediately.', type: 'danger' });
    } else if (orderType === 'REST_MANDATE') {
      setActiveOrder({ title: 'COMMANDER ORDER: MANDATORY CREW REST STAND-DOWN', desc: 'All non-critical maintenance halted. Minimum 8 hours sleep cycle enforced for fatigued crew.', type: 'warning' });
    } else if (orderType === 'COMMS_CHECK') {
      soundEngine.playTelemetryPing();
      setActiveOrder({ title: 'COMMANDER ORDER: DEEP SPACE COMMS ARRAY CALIBRATION', desc: 'DSN carrier lock verified with Goldstone and Madrid ground stations. Round-trip delay: 18.4 min.', type: 'info' });
    }
  };

  // Gantt task data (uses live crew data where possible)
  const ganttTasks = activeCrew.map((m, i) => {
    const rd = getReadiness(m);
    const priorities = ['Medium', 'Low', 'Critical', 'Medium'];
    return {
      name: m.name,
      task: m.currentTask || 'Nominal Duty',
      priority: m.taskRisk || priorities[i] || 'Medium',
      fatigue: m.fatigueLevel,
      fit: rd.fit,
      color: rd.color,
      barW: rd.fit === 'not_fit' ? 85 : rd.fit === 'caution' ? 60 : 45
    };
  });

  const priorityBadge = (p) => {
    const map = { Critical: 'bg-red-500/20 text-red-300 border-red-500/50', Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/50', Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' };
    return map[p] || map.Medium;
  };

  return (
    <div className="space-y-6 min-w-0 max-w-7xl mx-auto overflow-hidden">

      {/* Header Banner */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-amber-500/40 shadow-xl overflow-hidden bg-gradient-to-r from-space-900/95 via-space-950/95 to-slate-950/95 card-3d-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide drop-shadow"
                style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
                Commander Console · Mission Overview
              </h1>
              <p className="text-xs text-slate-300 font-sans">
                Crew status, Earth to Mars flight path, and emergency orders.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <span className="text-slate-400">Transit Day:</span>
          <span className="text-mangal-gold font-bold bg-space-950 px-3 py-1.5 rounded-lg border border-amber-500/40">
            {missionDay} / 180
          </span>
        </div>
      </div>

      {/* Active Commander Directive Banner */}
      {activeOrder && (
        <div className={`p-4 rounded-2xl border text-xs font-mono flex items-start justify-between gap-3 shadow-xl animate-pulse ${
          activeOrder.type === 'danger' ? 'bg-red-950/70 border-red-500 text-red-200'
          : activeOrder.type === 'warning' ? 'bg-amber-950/70 border-amber-500 text-amber-200'
          : 'bg-cyan-950/70 border-cyan-500 text-cyan-200'}`}>
          <div>
            <h4 className="font-bold text-sm">{activeOrder.title}</h4>
            <p className="font-sans text-xs mt-0.5">{activeOrder.desc}</p>
          </div>
          <button onClick={() => setActiveOrder(null)}
            className="px-2 py-1 rounded bg-space-900 border border-slate-700 text-slate-300 hover:text-white text-[10px]">
            Dismiss
          </button>
        </div>
      )}

      {/* ── ORBIT / FLIGHT PATH ── */}
      <div className="rounded-2xl p-4 border border-slate-800 bg-space-950/80 shadow-xl overflow-hidden card-3d-hover">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-mono">
          <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-mangal-orange" />
            Earth to Mars flight path
            <button className="ml-1 w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center hover:bg-slate-600"
              onClick={() => setShowOrbitTooltip(v => !v)}>?</button>
          </span>
          <span className="text-cyan-300 text-[10px]">Progress: {Math.round(missionProgress * 100)}%</span>
        </div>
        {showOrbitTooltip && (
          <div className="mb-2 text-xs text-cyan-100 bg-cyan-950/60 border border-cyan-500/40 rounded-xl px-3 py-2 font-sans">
            The spacecraft travels in a curved path from Earth to Mars, taking about 6 months.
          </div>
        )}
        <div className="relative h-72 rounded-2xl overflow-hidden border border-cyan-500/30">
          {use3D ? (
            <>
              <div className="w-full h-full bg-slate-950">
                <Orbit3D missionDay={missionDay} />
              </div>
              <div className="absolute bottom-3 left-3 bg-slate-900/80 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono pointer-events-none">
                Day {missionDay} of 180 · {Math.round(missionProgress * 100)}% of the way to Mars
              </div>
            </>
          ) : (
            <OrbitFallback2D progress={missionProgress} />
          )}
        </div>
      </div>

      {/* ── CREW READINESS BOARD ── */}
      <div className="space-y-3 min-w-0">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2 font-display"
            style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
            <UserCheck className="w-4 h-4 text-amber-400" />
            Crew Readiness Board (Fit / Caution / Not Fit)
          </span>
          <span className="text-slate-400 text-[10px]">Health details are private — you see only Fit/Caution/Not Fit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeCrew.map((member) => {
            const readiness = getReadiness(member);
            const isTired = member.fatigueLevel >= 60;
            const initials = member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const gaugeColor = readiness.color;
            return (
              <div key={member.id}
                className="relative rounded-2xl p-4 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl flex flex-col justify-between card-3d-hover hover:border-amber-400/60 hover:shadow-amber-400/20 transition-all duration-300">
                {/* Top row: avatar + name + badge */}
                <div className="flex items-center gap-3 mb-3">
                  <HelmetAvatar initials={initials} statusColor={readiness.color} />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-mono font-bold text-sm text-white truncate">{member.name}</h2>
                    <span className="text-[10px] text-slate-400 block truncate">{member.role}</span>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${readiness.badge}`}>
                      {readiness.status}
                    </span>
                  </div>
                </div>

                {/* Fatigue gauge + sleep bars side by side */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex flex-col items-center">
                    <FatigueGauge value={member.fatigueLevel} color={gaugeColor} />
                    <span className="text-[9px] text-slate-400 mt-0.5">Tiredness</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] text-slate-300 font-mono">Last night: {member.sleepHours} hrs sleep</span>
                    <SleepBars hours={member.sleepHours} />
                    <span className="text-[9px] text-slate-500 mt-0.5">7-night sleep log</span>
                  </div>
                </div>

                {/* Biometric sparkline */}
                <div className="my-1.5 pt-1 border-t border-slate-800/60">
                  <GoogleCrewBiometricRhythmDiagram
                    hr={member.currentVitals?.heartRate || 68}
                    fatigue={member.fatigueLevel}
                    status={readiness.fit === 'not_fit' ? 'critical' : readiness.fit === 'caution' ? 'warning' : 'nominal'}
                  />
                </div>

                {/* Task row */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] font-mono flex items-center justify-between text-slate-300">
                  <span className="truncate">Task: <strong className="text-white">{member.currentTask || 'Nominal Duty'}</strong></span>
                  <span className="text-[10px] text-amber-400 shrink-0 font-bold ml-1">{member.taskRisk}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GANTT TASK TIMELINE ── */}
      <div className="rounded-2xl p-4 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <h3 className="text-sm font-bold text-amber-400 font-display uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
          <Clock className="w-4 h-4" /> Task Schedule
        </h3>
        <div className="space-y-2.5">
          {ganttTasks.map((item, i) => {
            const isAlert = item.fit === 'not_fit' && (item.priority === 'Critical');
            const isWarn = item.fit === 'caution' && item.priority === 'Critical';
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-slate-300 w-32 shrink-0 truncate">{item.name}</span>
                <div className="flex-1 relative h-6 bg-slate-800 rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg transition-all duration-700"
                    style={{ width: `${item.barW}%`, backgroundColor: item.color, opacity: 0.7 }} />
                  <span className="absolute left-2 top-0 h-full flex items-center text-[10px] font-mono text-white truncate max-w-[80%]">
                    {item.task}
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${priorityBadge(item.priority)} shrink-0`}>
                  {item.priority}
                </span>
                {isAlert && <span className="text-red-400 shrink-0 text-sm" title="Critical task — crew not fit!">⚠️</span>}
                {isWarn && !isAlert && <span className="text-amber-400 shrink-0 text-sm" title="Caution — high fatigue">⚠️</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM ROW: Task Scheduler + Emergency Orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">

        {/* Task Assignment */}
        <div className="lg:col-span-7 rounded-2xl p-5 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl space-y-4 card-3d-hover min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Operational Task Allocation
            </h3>
            <span className="text-[10px] font-mono text-emerald-300 bg-space-950 px-2 py-0.5 rounded border border-slate-800">Interlock Guard Active</span>
          </div>

          {assignmentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{assignmentSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAssignTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 font-mono text-xs">
            <div className="sm:col-span-5 space-y-1">
              <label className="text-slate-300 text-[10px] block">Assignee:</label>
              <select value={selectedCrewId} onChange={(e) => setSelectedCrewId(e.target.value)}
                className="w-full bg-space-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400">
                {activeCrew.map((m) => {
                  const rd = getReadiness(m);
                  return <option key={m.id} value={m.id}>{m.name} — [{rd.status}] Tiredness {m.fatigueLevel}%</option>;
                })}
              </select>
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-slate-300 text-[10px] block">Mission Task:</label>
              <select value={selectedTask} onChange={(e) => { setSelectedTask(e.target.value); const f = availableTasks.find(t => t.name === e.target.value); if (f) setTaskRisk(f.risk); }}
                className="w-full bg-space-950 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400">
                {availableTasks.map((t, idx) => <option key={idx} value={t.name}>[{t.risk.toUpperCase()}] {t.name}</option>)}
              </select>
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold font-mono text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <span>Authorize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {schedulingWarning && (
            <div className="p-4 rounded-xl bg-red-950/60 border-2 border-red-500 font-mono text-xs space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-red-200 font-bold">
                <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                <span>SAFETY INTERLOCK: ASTRONAUT NOT FIT FOR CRITICAL MANEUVER</span>
              </div>
              <p className="text-slate-200 font-sans leading-relaxed text-xs">
                <strong>{schedulingWarning.crewName}</strong> has logged {schedulingWarning.sleep} hrs sleep and has an elevated tiredness level of {schedulingWarning.fatigue}%. Giving <em>"{schedulingWarning.task}"</em> to fatigued personnel increases operational failure risk.
              </p>
              <div className="flex justify-end gap-2 pt-1 border-t border-red-500/30">
                <button type="button" onClick={() => setSchedulingWarning(null)}
                  className="px-3 py-1 rounded bg-space-900 text-slate-300 text-xs">Select Other Crew</button>
                <button type="button" onClick={handleForceOverride}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs">Commander Override</button>
              </div>
            </div>
          )}
        </div>

        {/* Emergency Orders — big icon cards */}
        <div className="lg:col-span-5 rounded-2xl p-5 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl space-y-3 card-3d-hover min-w-0">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide flex items-center gap-2"
              style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Emergency Orders
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Direct Broadcast</span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Execute spacecraft-wide orders across intercom avionics and automated crew alert displays.
          </p>

          {/* Big icon buttons grid */}
          <div className="grid grid-cols-3 gap-3 pt-1">

            {/* Shelter Drill */}
            <button onClick={() => triggerOrder('SHELTER_DRILL')}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-red-500/50 bg-red-950/30 hover:border-amber-400/60 hover:shadow-amber-400/20 hover:bg-red-900/40 transition-all duration-300 p-3"
              style={{ minHeight: '120px', minWidth: '0' }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" fill="#7f1d1d" stroke="#f97316" strokeWidth="2" opacity="0.8" />
                <path d="M24 10 L14 22 H20 V36 H28 V22 H34 Z" fill="#fb923c" opacity="0.9" />
                <rect x="20" y="28" width="8" height="8" fill="#fbbf24" rx="1" />
              </svg>
              <span className="text-red-200 font-mono font-bold text-[11px] text-center leading-tight">Shelter drill</span>
              <span className="text-[9px] bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40 text-red-300">DRILL</span>
            </button>

            {/* Rest Order */}
            <button onClick={() => triggerOrder('REST_MANDATE')}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-amber-500/50 bg-amber-950/30 hover:border-amber-400/60 hover:shadow-amber-400/20 hover:bg-amber-900/40 transition-all duration-300 p-3"
              style={{ minHeight: '120px', minWidth: '0' }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" fill="#1c1917" stroke="#60a5fa" strokeWidth="2" opacity="0.8" />
                <path d="M28 14 C18 14 14 20 15 27 C20 24 24 25 28 32 C35 28 36 20 28 14Z" fill="#93c5fd" opacity="0.85" />
                {[...Array(5)].map((_, i) => (
                  <circle key={i} cx={14 + i * 5} cy={16 + (i % 2) * 4} r="1" fill="white" opacity="0.5" />
                ))}
              </svg>
              <span className="text-amber-200 font-mono font-bold text-[11px] text-center leading-tight">Rest order</span>
              <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 text-amber-300">REST</span>
            </button>

            {/* Comms Check */}
            <button onClick={() => triggerOrder('COMMS_CHECK')}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-cyan-500/50 bg-cyan-950/30 hover:border-amber-400/60 hover:shadow-amber-400/20 hover:bg-cyan-900/40 transition-all duration-300 p-3"
              style={{ minHeight: '120px', minWidth: '0' }}>
              <svg width="48" height="48" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="22" fill="#022c22" stroke="#34d399" strokeWidth="2" opacity="0.8" />
                <rect x="20" y="28" width="8" height="10" fill="#6ee7b7" rx="1" />
                <line x1="24" y1="10" x2="24" y2="28" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="14" y1="16" x2="34" y2="16" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                <line x1="17" y1="20" x2="31" y2="20" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
              </svg>
              <span className="text-cyan-200 font-mono font-bold text-[11px] text-center leading-tight">Comms check</span>
              <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded border border-cyan-500/40 text-cyan-300">DSN</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
