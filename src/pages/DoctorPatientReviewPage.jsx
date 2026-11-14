import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Stethoscope, Search, Filter, AlertTriangle, 
  CheckCircle2, Lock, Unlock, FileText, Pill, Calendar, 
  ArrowRight, Activity, Heart, Shield, Clock, ShieldAlert,
  Send, ChevronRight, UserCheck, Flame
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, YAxis, XAxis,
  Tooltip as RechartsTooltip, ReferenceArea, ReferenceLine, Dot
} from 'recharts';
import { useMissionStore } from '../store/useMissionStore';
import { useAuthStore } from '../auth/session';
import { useLanguage } from '../i18n/LanguageContext';
import defaultCrew from '../data/crew.json';
import { soundEngine } from '../utils/audio';
import { logAuditEvent } from '../auth/audit';
import EmergencyOverrideModal from '../components/EmergencyOverrideModal';

// ─── Card tilt handlers ───────────────────────────────────────────────────────
const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  e.currentTarget.style.transform = `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`;
};
const handleMouseLeave = (e) => {
  e.currentTarget.style.transform = '';
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = { CRITICAL: '#ef4444', WATCH: '#f59e0b', STABLE: '#22c55e' };

const getFlag = (nationality = '') => {
  if (nationality.includes('USA') || nationality.includes('NASA')) return '🇺🇸';
  if (nationality.includes('Russia') || nationality.includes('Roscosmos') || nationality.includes('ESA')) return '🇷🇺';
  return '🇮🇳';
};

// ─── Astronaut Helmet Avatar (SVG) ───────────────────────────────────────────
function AstroAvatar({ initials = 'XX', status = 'STABLE', size = 48 }) {
  const color = STATUS_COLORS[status] || '#22c55e';
  const faceColors = { S: '#a78bfa', M: '#60a5fa', A: '#34d399', E: '#f87171', D: '#fbbf24', R: '#c084fc', L: '#38bdf8' };
  const faceColor = faceColors[initials[0]] || '#94a3b8';
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx="30" cy="30" r="28" fill="#0f172a" stroke={color} strokeWidth="2.5" />
      <ellipse cx="30" cy="27" rx="16" ry="18" fill="#1e3a5f" opacity="0.8" />
      <ellipse cx="30" cy="26" rx="12" ry="13" fill={faceColor} opacity="0.3" />
      <ellipse cx="30" cy="26" rx="12" ry="13" fill="#0ea5e9" opacity="0.25" />
      <text x="30" y="31" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{initials}</text>
      <circle cx="48" cy="12" r="4" fill={color} className="animate-pulse" />
    </svg>
  );
}

// ─── Mission Patch SVG ────────────────────────────────────────────────────────
function MissionPatch() {
  return (
    <svg viewBox="0 0 80 80" width={64} height={64}>
      <circle cx="40" cy="40" r="38" fill="#0f172a" stroke="#6366f1" strokeWidth="2" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="#4f46e5" strokeWidth="1" strokeDasharray="4 2" />
      <text x="40" y="36" textAnchor="middle" fontSize="7" fill="#a5b4fc" fontWeight="bold">MANGAL-2</text>
      <text x="40" y="47" textAnchor="middle" fontSize="6" fill="#818cf8">· ISRO ·</text>
      <circle cx="40" cy="40" r="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      <line x1="40" y1="10" x2="40" y2="22" stroke="#f59e0b" strokeWidth="1" />
      <line x1="40" y1="58" x2="40" y2="70" stroke="#f59e0b" strokeWidth="1" />
      <line x1="10" y1="40" x2="22" y2="40" stroke="#f59e0b" strokeWidth="1" />
      <line x1="58" y1="40" x2="70" y2="40" stroke="#f59e0b" strokeWidth="1" />
    </svg>
  );
}

// ─── Circular Progress Ring ───────────────────────────────────────────────────
function CircleGauge({ value, max, color, size = 48 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
      />
    </svg>
  );
}

// ─── Radiation Half-Circle Gauge ──────────────────────────────────────────────
function RadiationGauge({ value, max = 250 }) {
  const pct = Math.min(value / max, 1);
  const angle = pct * 180;
  const r = 54;
  const cx = 70, cy = 70;
  const toRad = (d) => (d * Math.PI) / 180;
  const arcX = (a) => cx + r * Math.cos(toRad(180 - a));
  const arcY = (a) => cy - r * Math.sin(toRad(180 - a));

  const [animPct, setAnimPct] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 1200;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      setAnimPct(t * pct);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [pct]);

  const animAngle = animPct * 180;
  const arcColor = animPct < 0.4 ? '#22c55e' : animPct < 0.7 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 140 80" width="160" height="90">
        {/* Background arc */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1e293b" strokeWidth="10" strokeLinecap="round" />
        {/* Colored arc */}
        {animAngle > 0 && (
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${animAngle > 90 ? 1 : 0} 1 ${arcX(animAngle)} ${arcY(animAngle)}`}
            fill="none" stroke={arcColor} strokeWidth="10" strokeLinecap="round"
          />
        )}
        {/* Needle pointer */}
        <circle cx={arcX(animAngle)} cy={arcY(animAngle)} r="5" fill={arcColor} />
        {/* Value */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">{value} mSv</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="7" fill="#94a3b8">SAFE LIMIT: {max} mSv</text>
        {/* Tick labels */}
        <text x={cx - r - 4} y={cy + 4} textAnchor="end" fontSize="7" fill="#64748b">0</text>
        <text x={cx + r + 4} y={cy + 4} textAnchor="start" fontSize="7" fill="#64748b">{max}</text>
      </svg>
    </div>
  );
}

// ─── Vital Card ───────────────────────────────────────────────────────────────
function VitalCard({ label, value, unit, baseValue, max, statusColor, tooltip }) {
  const [showTip, setShowTip] = useState(false);
  const delta = typeof baseValue === 'number' ? Math.round((value - baseValue) * 10) / 10 : null;
  const arrow = delta === null ? '→' : delta > 0.5 ? '↑' : delta < -0.5 ? '↓' : '→';
  const arrowColor = delta === null ? '#22c55e' : delta > 0.5 ? '#ef4444' : delta < -0.5 ? '#60a5fa' : '#22c55e';
  const gaugeColor = statusColor || '#22c55e';
  const gaugeMax = max || (baseValue ? baseValue * 2 : 200);

  return (
    <div
      className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-3 shadow-2xl hover:border-emerald-400/60 hover:shadow-emerald-400/20 transition-all duration-300"
      style={{ borderLeftWidth: 3, borderLeftColor: gaugeColor }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute top-2 right-2 z-10">
          <button
            type="button"
            onMouseEnter={() => setShowTip(true)}
            onMouseLeave={() => setShowTip(false)}
            className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 text-[10px] flex items-center justify-center hover:bg-slate-600"
          >?</button>
          {showTip && (
            <div className="absolute right-0 top-5 w-44 p-2 rounded-xl bg-slate-800 border border-slate-600 text-[10px] text-slate-200 z-50 shadow-xl">{tooltip}</div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <CircleGauge value={typeof value === 'number' ? value : 0} max={gaugeMax} color={gaugeColor} size={48} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-bold text-white" style={{ lineHeight: 1 }}>{Math.round((typeof value === 'number' ? value : 0) / gaugeMax * 100)}%</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">{label}</span>
          <span className="text-lg font-bold text-white leading-tight">{value}</span>
          <span className="text-[10px] text-slate-400 ml-1">{unit}</span>
          {delta !== null && (
            <div className="text-[10px] mt-0.5" style={{ color: arrowColor }}>
              {arrow} {Math.abs(delta)} from normal {baseValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Body Map SVG Diagram ─────────────────────────────────────────────────────
function BodyMap({ patient, onSelectSystem, selectedSystem }) {
  const [hovered, setHovered] = useState(null);
  const vitals = patient?.currentVitals || {};
  const baseline = patient?.baseline || {};

  const hrCrit = vitals.heartRate > baseline.heartRate * 1.15;
  const o2Low = vitals.spO2 < (baseline.spO2 || 99) - 2;
  const bpCrit = vitals.systolic > (baseline.systolic || 116) * 1.1;

  const hotspots = [
    { id: 'brain', cx: 100, cy: 42, label: 'Brain', metric: 'Stress', value: patient.stressScore || 50, color: patient.stressScore > 60 ? '#ef4444' : '#22c55e' },
    { id: 'heart', cx: 95, cy: 128, label: 'Heart Rate', metric: 'HR', value: `${vitals.heartRate || '--'} BPM`, color: hrCrit ? '#ef4444' : '#22c55e' },
    { id: 'lungL', cx: 80, cy: 118, label: 'Left Lung', metric: 'Blood O₂', value: `${vitals.spO2 || '--'}%`, color: o2Low ? '#f59e0b' : '#22c55e' },
    { id: 'lungR', cx: 120, cy: 118, label: 'Right Lung', metric: 'Blood O₂', value: `${vitals.spO2 || '--'}%`, color: o2Low ? '#f59e0b' : '#22c55e' },
    { id: 'spine', cx: 100, cy: 160, label: 'Spine / BP', metric: 'BP', value: `${vitals.systolic || '--'}/${vitals.diastolic || '--'}`, color: bpCrit ? '#f59e0b' : '#22c55e' },
    { id: 'eyeL', cx: 92, cy: 52, label: 'Left Eye', metric: 'SANS Risk', value: 'Monitor', color: '#6366f1' },
    { id: 'eyeR', cx: 108, cy: 52, label: 'Right Eye', metric: 'SANS Risk', value: 'Monitor', color: '#6366f1' },
  ];

  return (
    <div
      className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4 shadow-2xl"
      style={{ width: '100%', maxWidth: 240 }}
    >
      <h3 className="text-xs font-bold text-emerald-300 mb-3 uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
        Body Map
      </h3>
      <div className="flex justify-center relative">
        <svg viewBox="60 10 80 300" width={160} height={280}>
          {/* Head */}
          <ellipse cx="100" cy="38" rx="20" ry="24" fill="none" stroke="#334155" strokeWidth="2" />
          {/* Neck */}
          <rect x="93" y="60" width="14" height="14" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
          {/* Torso */}
          <rect x="72" y="74" width="56" height="80" rx="6" fill="none" stroke="#334155" strokeWidth="2" />
          {/* Left arm */}
          <path d="M72 78 L55 100 L52 140" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          {/* Right arm */}
          <path d="M128 78 L145 100 L148 140" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          {/* Left leg */}
          <path d="M82 154 L78 200 L76 240" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          {/* Right leg */}
          <path d="M118 154 L122 200 L124 240" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
          {/* Spine line */}
          <line x1="100" y1="74" x2="100" y2="154" stroke="#1e3a5f" strokeWidth="1" strokeDasharray="3 2" />

          {/* Hotspots */}
          {hotspots.map((h) => (
            <g key={h.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelectSystem(selectedSystem === h.id ? null : h.id)}
            >
              <circle cx={h.cx} cy={h.cy} r="9"
                fill={h.color} opacity="0.15"
                className={selectedSystem === h.id ? '' : ''}
              />
              <circle cx={h.cx} cy={h.cy} r={selectedSystem === h.id ? '7' : '5'}
                fill={h.color} opacity={selectedSystem === h.id ? '0.95' : '0.8'}
                style={{ filter: `drop-shadow(0 0 ${selectedSystem === h.id ? '8' : '4'}px ${h.color})` }}
                className="animate-pulse"
              />
              {/* Tooltip */}
              {hovered === h.id && (
                <g>
                  <rect x={h.cx - 38} y={h.cy - 28} width="76" height="22" rx="4" fill="#0f172a" stroke={h.color} strokeWidth="1" />
                  <text x={h.cx} y={h.cy - 20} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">{h.label}</text>
                  <text x={h.cx} y={h.cy - 11} textAnchor="middle" fontSize="7" fill="#94a3b8">{h.metric}: {h.value}</text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Glowing Red Dot for chart ────────────────────────────────────────────────
function GlowDot(props) {
  const { cx, cy, value, payload, baseline } = props;
  if (cx === undefined || cy === undefined) return null;
  const isAlert = baseline && value > baseline * 1.1;
  if (!isAlert) return <circle cx={cx} cy={cy} r={3} fill="#10b981" />;
  return (
    <circle cx={cx} cy={cy} r={5} fill="#ef4444"
      style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }} />
  );
}

// ─── Custom Tooltip for chart ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, baseline }) {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value;
  const delta = baseline ? Math.round((val - baseline) * 10) / 10 : null;
  return (
    <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-2 text-[10px] font-mono shadow-xl">
      <div className="text-white font-bold">HR: {val} BPM</div>
      {delta !== null && (
        <div style={{ color: delta > 0 ? '#ef4444' : '#60a5fa' }}>
          {delta > 0 ? '↑' : '↓'} {Math.abs(delta)} from baseline
        </div>
      )}
    </div>
  );
}

// ─── Risk Heat Strip ──────────────────────────────────────────────────────────
const HAZARDS = ['Cardiac', 'Respiratory', 'Radiation', 'Fatigue', 'Nutrition'];
const RISK_COLORS = ['bg-green-500', 'bg-yellow-400', 'bg-orange-500', 'bg-red-500'];

function getRiskLevel(hazard, dayIdx, patient) {
  const fatigue = patient.fatigueLevel || 30;
  const rad = patient.radiationDose || 80;
  const hr = patient.currentVitals?.heartRate || 65;
  const base = patient.baseline?.heartRate || 60;
  const seed = (dayIdx * 7 + hazard.length) % 10;

  if (hazard === 'Cardiac') {
    const v = hr > base * 1.2 ? 3 : hr > base * 1.1 ? 2 : seed < 3 ? 1 : 0;
    return Math.min(v + (dayIdx > 4 ? 1 : 0), 3);
  }
  if (hazard === 'Respiratory') return patient.currentVitals?.spO2 < 97 ? 2 : seed < 3 ? 1 : 0;
  if (hazard === 'Radiation') return rad > 150 ? 3 : rad > 100 ? 2 : rad > 80 ? 1 : 0;
  if (hazard === 'Fatigue') return fatigue > 70 ? 3 : fatigue > 50 ? 2 : fatigue > 30 ? 1 : 0;
  if (hazard === 'Nutrition') return seed < 2 ? 1 : 0;
  return 0;
}

function RiskHeatStrip({ patient, missionDay }) {
  const [tipInfo, setTipInfo] = useState(null);
  const days = Array.from({ length: 7 }, (_, i) => missionDay - 6 + i);

  return (
    <div
      className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-4 shadow-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <h3 className="text-xs font-bold text-emerald-300 mb-3 uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
        7-Day Risk Map (last 7 days)
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Day headers */}
          <div className="flex gap-1 mb-1 ml-20">
            {days.map((d) => (
              <div key={d} className="w-8 text-center text-[9px] text-slate-400 font-mono">D{d}</div>
            ))}
          </div>
          {HAZARDS.map((hazard) => (
            <div key={hazard} className="flex items-center gap-1 mb-1">
              <div className="w-20 text-[10px] text-slate-300 font-mono shrink-0">{hazard}</div>
              {days.map((d, di) => {
                const level = getRiskLevel(hazard, di, patient);
                const cls = RISK_COLORS[level];
                const pct = [0, 25, 60, 90][level];
                return (
                  <div
                    key={d}
                    className={`w-8 h-6 rounded ${cls} opacity-80 cursor-default relative`}
                    onMouseEnter={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setTipInfo({ x: r.left, y: r.top, text: `Day ${d} · ${hazard}: ${pct}%` });
                    }}
                    onMouseLeave={() => setTipInfo(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex gap-3 mt-2 flex-wrap">
        {[['bg-green-500', 'Low'], ['bg-yellow-400', 'Watch'], ['bg-orange-500', 'High'], ['bg-red-500', 'Critical']].map(([cls, lbl]) => (
          <div key={lbl} className="flex items-center gap-1 text-[10px] text-slate-400">
            <div className={`w-3 h-3 rounded ${cls}`} />{lbl}
          </div>
        ))}
      </div>
      {/* Floating tooltip */}
      {tipInfo && (
        <div className="fixed z-50 bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-[10px] text-white shadow-xl pointer-events-none"
          style={{ left: tipInfo.x + 10, top: tipInfo.y - 30 }}>
          {tipInfo.text}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DoctorPatientReviewPage() {
  const { crew, inventory, consumeInventoryItem, missionDay, alerts } = useMissionStore();
  const { currentUser, emergencyOverride, consentCategories } = useAuthStore();
  const { t } = useLanguage();

  const activeCrew = (crew && Array.isArray(crew) && crew.length > 0) ? crew : defaultCrew;

  const [selectedPatientId, setSelectedPatientId] = useState(activeCrew[2]?.id || activeCrew[0]?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);

  const [doctorNotes, setDoctorNotes] = useState({
    crew_3: 'Slight cardiovascular deconditioning. Advised 40 min cycle ergometer and increased hydration.',
    crew_1: 'Baseline stable. Cleared for EVA operations.',
    crew_2: 'Nominal physiological adaptation.',
    crew_4: 'Mild sleep latency reported. Prescribed melatonin 3mg.'
  });
  const [noteInput, setNoteInput] = useState('');
  const [prescribeMedId, setPrescribeMedId] = useState(inventory[0]?.id || '');
  const [prescribeDosage, setPrescribeDosage] = useState('1 dose');
  const [actionSuccess, setActionSuccess] = useState('');

  const getPatientRisk = (member) => {
    if (member.fatigueLevel >= 70 || member.healthScore < 70) return 'CRITICAL';
    if (member.fatigueLevel >= 40 || member.healthScore < 85) return 'WATCH';
    return 'STABLE';
  };

  const sortedPatients = [...activeCrew].sort((a, b) => {
    const riskWeight = { CRITICAL: 3, WATCH: 2, STABLE: 1 };
    return riskWeight[getPatientRisk(b)] - riskWeight[getPatientRisk(a)];
  });

  const filteredPatients = sortedPatients.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const risk = getPatientRisk(member);
    const matchesRisk = filterRisk === 'ALL' || risk === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const patient = activeCrew.find((c) => c.id === selectedPatientId) || activeCrew[0];
  const patientRisk = getPatientRisk(patient);
  const hasMentalHealthConsent = consentCategories.mentalHealth || emergencyOverride.active;

  const hrBase = patient.baseline?.heartRate || 62;
  const hrCurrent = patient.currentVitals?.heartRate || 68;

  const vitalsTrend = [
    { day: `D${missionDay - 6}`, hr: hrBase },
    { day: `D${missionDay - 5}`, hr: hrBase + 2 },
    { day: `D${missionDay - 4}`, hr: hrBase + 4 },
    { day: `D${missionDay - 3}`, hr: hrCurrent - 2 },
    { day: `D${missionDay - 2}`, hr: hrCurrent - 1 },
    { day: `D${missionDay - 1}`, hr: hrCurrent },
    { day: `D${missionDay}`, hr: hrCurrent + (patientRisk === 'CRITICAL' ? 3 : 1) },
  ];

  const bandLow = Math.round(hrBase * 0.9);
  const bandHigh = Math.round(hrBase * 1.1);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    soundEngine.playTelemetryPing();
    setDoctorNotes((prev) => ({ ...prev, [patient.id]: `${new Date().toLocaleDateString()}: ${noteInput.trim()}` }));
    setNoteInput('');
    setActionSuccess(`Doctor's clinical note saved for ${patient.name}`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handlePrescribeMed = (e) => {
    e.preventDefault();
    soundEngine.playClick();
    const med = inventory.find((i) => i.id === prescribeMedId);
    if (!med || med.stock <= 0) { alert('Selected medicine is out of stock in the kit.'); return; }
    consumeInventoryItem(med.id, 1);
    soundEngine.playTelemetryPing();
    setActionSuccess(`Prescribed ${med.name} (${prescribeDosage}) to ${patient.name}. Inventory stock updated.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const handleRequestCheckup = () => {
    soundEngine.playTelemetryPing();
    setActionSuccess(`Mandatory optical check-up request transmitted to ${patient.name}'s terminal.`);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  // Vital card data
  const vitals = patient.currentVitals || {};
  const baseline = patient.baseline || {};
  const riskColor = STATUS_COLORS[patientRisk];

  const vitalCards = [
    { label: 'Heart Rate', value: vitals.heartRate || 68, unit: 'BPM', baseValue: baseline.heartRate || 62, max: 180, tooltip: null },
    { label: 'Blood Pressure', value: vitals.systolic || 120, unit: 'mmHg sys', baseValue: baseline.systolic || 116, max: 180, tooltip: null },
    { label: 'Blood Oxygen', value: vitals.spO2 || 98, unit: '%', baseValue: baseline.spO2 || 99, max: 100, tooltip: '% of blood carrying oxygen normally' },
    { label: 'Radiation received', value: patient.radiationDose || 84, unit: 'mSv', baseValue: null, max: 250, tooltip: 'Total radiation absorbed so far (safe limit: 250 mSv)' },
  ];

  return (
    <div className="space-y-5 min-w-0 max-w-7xl mx-auto overflow-x-hidden px-4 sm:px-6 lg:px-8">

      {/* Header Banner */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-emerald-500/40 shadow-xl overflow-hidden bg-gradient-to-r from-space-900/95 via-space-950/95 to-slate-950/95 card-3d-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide drop-shadow">
                Doctor Console · Patient Review
              </h1>
              <p className="text-xs text-slate-300 font-sans">
                Monitoring physiological drift and prescribing treatments for 4 crew members.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { soundEngine.playClick(); setShowOverrideModal(true); }}
            className={`px-3.5 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
              emergencyOverride.active
                ? 'bg-red-500 text-white animate-pulse border border-red-400'
                : 'bg-red-950/60 hover:bg-red-900/60 text-red-200 border border-red-500/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{emergencyOverride.active ? 'Emergency Access Active' : 'Emergency Medical Override'}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-w-0">

        {/* ── Left Column: Patient List ── */}
        <div className="lg:col-span-4 space-y-3 min-w-0">

          {/* Search & Filter */}
          <div className="p-3 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name or role..."
                className="w-full bg-space-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono flex-wrap">
              <span className="text-slate-400 mr-1">Risk:</span>
              {['ALL', 'CRITICAL', 'WATCH', 'STABLE'].map((lvl) => (
                <button key={lvl} type="button" onClick={() => setFilterRisk(lvl)}
                  className={`px-2 py-1 rounded-lg border font-bold uppercase transition-all ${
                    filterRisk === lvl
                      ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500'
                      : 'bg-space-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Cards */}
          <div className="space-y-2.5">
            {filteredPatients.map((member) => {
              const risk = getPatientRisk(member);
              const isSelected = member.id === patient.id;
              const initials = member.avatar || member.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div
                  key={member.id}
                  onClick={() => { soundEngine.playClick(); setSelectedPatientId(member.id); }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-900/60 backdrop-blur-xl border-slate-700/50 hover:border-emerald-400/60 hover:shadow-emerald-400/20'
                  }`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <AstroAvatar initials={initials} status={risk} size={44} />
                      <div className="min-w-0">
                        <h2 className="font-mono font-bold text-xs text-white truncate drop-shadow">{member.name}</h2>
                        <span className="text-[10px] text-slate-300 block truncate">{member.role}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border shrink-0 ${
                      risk === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                        : risk === 'WATCH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {risk}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-200 pt-1 border-t border-slate-800/80">
                    <div>Health: <strong className="text-white">{member.healthScore}%</strong></div>
                    <div>Tiredness: <strong className={member.fatigueLevel > 60 ? 'text-red-400' : 'text-cyan-300'}>{member.fatigueLevel}%</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Patient Detail ── */}
        <div className="lg:col-span-8 space-y-5 min-w-0">

          {/* Patient Header Card */}
          <div className="rounded-2xl p-4 sm:p-5 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl space-y-4">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-4">
                {/* Large avatar */}
                <AstroAvatar
                  initials={(patient.avatar || patient.name.split(' ').map(w => w[0]).join('').slice(0, 2)).toUpperCase()}
                  status={patientRisk}
                  size={72}
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-base sm:text-lg text-white drop-shadow" style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
                      {patient.name}
                    </h2>
                    <span className="text-lg">{getFlag(patient.nationality)}</span>
                    <span className="text-xs font-mono text-cyan-300 bg-space-950 px-2 py-0.5 rounded border border-slate-700">
                      {patient.nationality} · Age {patient.age}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-sans mt-0.5">
                    Assigned Task: <strong className="text-white">{patient.currentTask || 'Nominal Duty'}</strong> ({patient.taskRisk} Risk)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <MissionPatch />
                <button
                  type="button"
                  onClick={handleRequestCheckup}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 font-mono text-xs font-bold transition-colors"
                >
                  Request Check-up
                </button>
              </div>
            </div>

            {/* Body Map + Vitals row */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Body Map */}
              <div className="shrink-0 flex justify-center">
                <BodyMap patient={patient} onSelectSystem={setSelectedSystem} selectedSystem={selectedSystem} />
              </div>

              {/* Right: Vital Cards + Radiation Gauge */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Vital Cards 2×2 */}
                <div className="grid grid-cols-2 gap-3">
                  {vitalCards.map((vc) => (
                    <VitalCard
                      key={vc.label}
                      label={vc.label}
                      value={vc.value}
                      unit={vc.unit}
                      baseValue={vc.baseValue}
                      max={vc.max}
                      statusColor={riskColor}
                      tooltip={vc.tooltip}
                    />
                  ))}
                </div>

                {/* Radiation Half-Circle Gauge */}
                <div
                  className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 p-3 shadow-2xl hover:border-emerald-400/60 transition-all duration-300"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Radiation received — total dose</div>
                  <RadiationGauge value={patient.radiationDose || 84} max={250} />
                </div>
              </div>
            </div>

            {/* 7-Day Trend Chart */}
            <div
              className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-400/60 transition-all duration-300"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-slate-200 font-bold uppercase tracking-wider" style={{ textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
                  7-Day Heart Rate Trend
                </span>
                <span className="text-cyan-400 text-[10px]">
                  Baseline: {hrBase} BPM · Normal band: {bandLow}–{bandHigh}
                </span>
              </div>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrend}>
                    <defs>
                      <linearGradient id="docTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="95%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis hide domain={[bandLow - 5, 'dataMax + 8']} />
                    {/* Normal band shaded */}
                    <ReferenceArea y1={bandLow} y2={bandHigh} fill="#22c55e" fillOpacity={0.08} />
                    {/* Baseline dashed line */}
                    <ReferenceLine y={hrBase} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5}
                      label={{ value: 'Your normal', position: 'insideTopRight', fontSize: 9, fill: '#22c55e' }} />
                    <RechartsTooltip
                      content={(props) => <ChartTooltip {...props} baseline={hrBase} />}
                    />
                    <Line
                      type="monotone" dataKey="hr" stroke="#10b981" strokeWidth={2}
                      dot={(props) => <GlowDot {...props} baseline={hrBase} />}
                      activeDot={{ r: 5, fill: '#10b981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Heat Strip */}
            <RiskHeatStrip patient={patient} missionDay={missionDay} />
          </div>

          {/* Mental Health Card */}
          <div className="rounded-2xl p-4 sm:p-5 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-400" />
                <h3 className="font-mono font-bold text-sm text-white">Mental Health &amp; Private Sleep Log</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                hasMentalHealthConsent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {hasMentalHealthConsent ? 'Access Granted' : 'Protected Record'}
              </span>
            </div>

            {hasMentalHealthConsent ? (
              <div className="space-y-2 text-xs font-mono text-slate-200">
                <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-300 text-[10px]">
                    <span>Stress Level: {patient.stressScore}/100</span>
                    <span>Sleep Last Night: {patient.sleepHours} hrs</span>
                  </div>
                  <p className="text-slate-200 font-sans">
                    Astronaut reported mild circadian desynchronization on Sol {missionDay - 1}. Recommended light exposure adjustment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-space-950/90 border border-slate-800 text-center space-y-3 relative overflow-hidden">
                {/* Blurred SVG brain behind the lock */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg viewBox="0 0 120 80" width="160" style={{ filter: 'blur(8px)', opacity: 0.35 }}>
                    <ellipse cx="60" cy="40" rx="50" ry="34" fill="none" stroke="#a855f7" strokeWidth="3" />
                    <path d="M30 40 Q45 15 60 40 Q75 65 90 40" fill="none" stroke="#a855f7" strokeWidth="2.5" />
                    <circle cx="45" cy="35" r="10" fill="#a855f7" opacity="0.3" />
                    <circle cx="75" cy="35" r="10" fill="#a855f7" opacity="0.3" />
                    <path d="M20 50 Q60 70 100 50" fill="none" stroke="#ec4899" strokeWidth="2" />
                  </svg>
                </div>

                <style>{`
                  @keyframes lockGlow {
                    0%, 100% { filter: drop-shadow(0 0 4px #a855f7); }
                    50% { filter: drop-shadow(0 0 12px #a855f7); }
                  }
                `}</style>
                <Lock
                  className="w-8 h-8 text-purple-400 mx-auto relative z-10"
                  style={{ animation: 'lockGlow 2.5s ease-in-out infinite' }}
                />
                <h4 className="font-mono font-bold text-xs text-white relative z-10">Mind &amp; mood data — not shared by astronaut</h4>
                <p className="text-[11px] text-slate-300 font-sans max-w-md mx-auto relative z-10">
                  {patient.name} has not enabled Doctor sharing for mental health &amp; private journals. In life-critical situations, use the Emergency Medical Override button above.
                </p>
              </div>
            )}
          </div>

          {/* Clinical Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Write Note */}
            <div className="rounded-2xl p-4 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl space-y-3 shadow-2xl hover:border-emerald-400/60 transition-all duration-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono font-bold text-xs text-white">Doctor's Medical Note</h3>
              </div>
              {doctorNotes[patient.id] && (
                <div className="p-2.5 rounded-xl bg-space-900 border border-slate-800 text-[11px] font-mono text-emerald-300">
                  {doctorNotes[patient.id]}
                </div>
              )}
              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder={`Write clinical note for ${patient.name}...`}
                  rows={2}
                  className="w-full bg-space-900 border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                <button
                  type="submit"
                  disabled={!noteInput.trim()}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition-colors"
                >
                  Save Clinical Note
                </button>
              </form>
            </div>

            {/* Prescribe */}
            <div className="rounded-2xl p-4 border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl space-y-3 shadow-2xl hover:border-emerald-400/60 transition-all duration-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Pill className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono font-bold text-xs text-white">Prescribe from Medical Kit</h3>
              </div>
              <form onSubmit={handlePrescribeMed} className="space-y-2 font-mono text-xs">
                <div>
                  <label className="text-slate-300 text-[10px] block mb-1">Select Medicine in Stock:</label>
                  <select
                    value={prescribeMedId}
                    onChange={(e) => setPrescribeMedId(e.target.value)}
                    className="w-full bg-space-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  >
                    {inventory.map((item) => (
                      <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                        {item.name} ({item.dosage}) — {item.stock > 0 ? `${item.stock} left` : 'OUT OF STOCK'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 text-[10px] block mb-1">Instruction / Dose:</label>
                  <input
                    type="text"
                    value={prescribeDosage}
                    onChange={(e) => setPrescribeDosage(e.target.value)}
                    className="w-full bg-space-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md"
                >
                  Prescribe &amp; Update Inventory
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>

      <EmergencyOverrideModal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
      />
    </div>
  );
}
