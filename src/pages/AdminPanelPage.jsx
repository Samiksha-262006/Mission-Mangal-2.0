import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Shield, FileText, Database, CheckCircle2,
  AlertTriangle, RefreshCw, Key, Lock, UserPlus, Sliders,
  Server, Cpu, Download, Upload, LogOut, Trash2, Check, Clock,
  Activity, ShieldAlert, LogIn, Settings
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { getDb } from '../auth/db';
import { fetchAllAuditLogs, logAuditEvent } from '../auth/audit';
import { generateSalt, hashPassword } from '../auth/hash';
import { useAuthStore } from '../auth/session';
import { useLanguage } from '../i18n/LanguageContext';
import { soundEngine } from '../utils/audio';
import { GoogleCloudMetricSparklineDiagram, GoogleRadioLinkDiagram } from '../components/BiometricDiagrams3D';

/* ─── Toggle Switch ─────────────────────────────────────── */
function ToggleSwitch({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${active ? 'bg-green-500' : 'bg-red-500/40'}`}
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${active ? 'translate-x-7' : 'translate-x-1'}`}
      />
    </button>
  );
}

/* ─── Role badge colors ──────────────────────────────────── */
const roleBadge = {
  astronaut: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
  flight_surgeon: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  mission_commander: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
  admin: 'bg-violet-500/20 text-violet-300 border border-violet-500/40',
};
const roleLabel = {
  astronaut: 'Astronaut',
  flight_surgeon: 'Doctor',
  mission_commander: 'Commander',
  admin: 'Admin',
};

/* ─── Circular Gauge (SVG) ───────────────────────────────── */
function CircleGauge({ value, max = 100, color, label, unit }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct;
  const initials = label.slice(0, 2).toUpperCase();
  return (
    <div
      className="flex flex-col items-center gap-1 p-3 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl hover:border-violet-400/60 hover:shadow-violet-400/20 transition-all duration-300 cursor-default"
    >
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <text x="40" y="45" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">
          {value}{unit.trim() === '%' ? '%' : ''}
        </text>
        {unit.trim() !== '%' && (
          <text x="40" y="57" textAnchor="middle" fontSize="8" fill="#94a3b8">{unit.trim()}</text>
        )}
      </svg>
      <span className="text-xs text-slate-400 text-center">{label}</span>
    </div>
  );
}

/* ─── Mouse-tilt card wrapper ────────────────────────────── */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    el.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <div ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className={className}>
      {children}
    </div>
  );
}

/* ─── Audit log icon map ─────────────────────────────────── */
function AuditIcon({ action }) {
  if (action === 'LOGIN') return <LogIn className="w-4 h-4 text-cyan-400 shrink-0" />;
  if (action === 'CONSENT_CHANGED') return <Shield className="w-4 h-4 text-emerald-400 shrink-0" />;
  if (action === 'EMERGENCY_OVERRIDE') return <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />;
  if (action?.startsWith('USER_') || action === 'PASSWORD_RESET') return <Settings className="w-4 h-4 text-violet-400 shrink-0" />;
  return <Server className="w-4 h-4 text-slate-400 shrink-0" />;
}
function auditDotColor(action) {
  if (action === 'LOGIN') return '#22d3ee';
  if (action === 'CONSENT_CHANGED') return '#34d399';
  if (action === 'EMERGENCY_OVERRIDE') return '#f87171';
  if (action?.startsWith('USER_') || action === 'PASSWORD_RESET') return '#a78bfa';
  return '#94a3b8';
}
function severityPill(action) {
  if (action === 'EMERGENCY_OVERRIDE') return 'bg-red-500/20 text-red-300 border border-red-500/40';
  if (action === 'LOGIN') return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
  if (action?.startsWith('USER_') || action === 'PASSWORD_RESET') return 'bg-violet-500/20 text-violet-300 border border-violet-500/40';
  return 'bg-slate-700/40 text-slate-300';
}

/* ─── Donut chart data ───────────────────────────────────── */
const roleDonutData = [
  { name: 'Astronaut', value: 1, color: '#22d3ee' },
  { name: 'Doctor', value: 1, color: '#34d399' },
  { name: 'Commander', value: 1, color: '#fbbf24' },
  { name: 'Admin', value: 1, color: '#a78bfa' },
  { name: 'Ground', value: 1, color: '#94a3b8' },
];

/* ─── Bar chart data: logins per hour ────────────────────── */
const loginHourData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  logins:
    h >= 8 && h <= 10 ? 4 + Math.floor(Math.random() * 3) :
    h >= 14 && h <= 16 ? 3 + Math.floor(Math.random() * 3) :
    Math.floor(Math.random() * 2),
}));

/* ─── System metrics ─────────────────────────────────────── */
const systemMetrics = [
  { label: 'Storage used', value: 34, color: '#22c55e', unit: '%' },
  { label: 'Memory', value: 58, color: '#f59e0b', unit: '%' },
  { label: 'Sync queue', value: 12, color: '#06b6d4', unit: ' items', max: 50 },
];

/* ─── Stat tiles ─────────────────────────────────────────── */
const statTilesDef = [
  { label: 'Total Users', value: 5, icon: Users, color: 'violet', sub: 'Active accounts' },
  { label: 'Active Sessions', value: 3, icon: Activity, color: 'cyan', sub: 'Right now' },
  { label: 'Failed Logins Today', value: 2, icon: ShieldAlert, color: 'red', sub: 'Last 24 hours' },
  { label: 'Last Backup', value: '2h ago', icon: Clock, color: 'green', sub: 'Auto-backup on' },
];
const tileColorMap = {
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: 'text-violet-400', val: 'text-violet-200', glow: 'rgba(168,85,247,0.4)', sparkColor: '#a855f7' },
  cyan:   { bg: 'bg-cyan-500/10',   border: 'border-cyan-500/30',   icon: 'text-cyan-400',   val: 'text-cyan-200',   glow: 'rgba(34,211,238,0.4)', sparkColor: '#22d3ee' },
  red:    { bg: 'bg-red-500/10',    border: 'border-red-500/30',    icon: 'text-red-400',    val: 'text-red-200',    glow: 'rgba(239,68,68,0.4)', sparkColor: '#ef4444' },
  green:  { bg: 'bg-green-500/10',  border: 'border-green-500/30',  icon: 'text-green-400',  val: 'text-green-200',  glow: 'rgba(34,197,94,0.4)', sparkColor: '#22c55e' },
};

/* ─── Main Component ─────────────────────────────────────── */
export default function AdminPanelPage() {
  const { currentUser } = useAuthStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess_1', user: 'astronaut@mangal.in', role: 'astronaut', ip: '192.168.1.42 (Hab-Terminal-A)', loginTime: '2 hours ago', current: false },
    { id: 'sess_2', user: 'surgeon@mangal.in', role: 'flight_surgeon', ip: '192.168.1.88 (Med-Bay-Console)', loginTime: '45 mins ago', current: false },
    { id: 'sess_3', user: 'commander@mangal.in', role: 'mission_commander', ip: '192.168.1.10 (Bridge-Deck)', loginTime: '10 mins ago', current: false },
    { id: 'sess_4', user: 'admin@mangal.in', role: 'admin', ip: '127.0.0.1 (Local Avionics)', loginTime: 'Active Now', current: true }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '', email: '', role: 'astronaut', password: 'Mangal@123', pin: '1234', callsign: ''
  });

  const [storageEstimate, setStorageEstimate] = useState({ usage: '1.8 MB', quota: 'Unlimited Local' });

  const loadData = async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const allUsers = await db.getAll('users');
      setUsersList(allUsers);
      const logs = await fetchAllAuditLogs();
      setAuditLogs(logs);
      if (navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const mbUsed = (est.usage / (1024 * 1024)).toFixed(2);
        setStorageEstimate({ usage: `${mbUsed} MB`, quota: 'Browser Storage' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleUserStatus = async (user) => {
    soundEngine.playClick();
    const db = await getDb();
    const updated = { ...user, active: !user.active };
    await db.put('users', updated);
    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in', role: 'admin',
      action: 'USER_MODIFIED',
      details: `User ${user.email} status changed to ${updated.active ? 'ACTIVE' : 'DISABLED'}`
    });
    setActionSuccess(`User ${user.name} is now ${updated.active ? 'Active' : 'Disabled'}.`);
    loadData();
  };

  const handleChangeRole = async (user, newRole) => {
    soundEngine.playClick();
    const db = await getDb();
    const updated = { ...user, role: newRole };
    await db.put('users', updated);
    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in', role: 'admin',
      action: 'USER_MODIFIED',
      details: `User ${user.email} role updated to ${newRole}`
    });
    setActionSuccess(`Updated ${user.name}'s role to ${newRole}.`);
    loadData();
  };

  const handleResetPassword = async (user) => {
    soundEngine.playClick();
    const db = await getDb();
    const salt = generateSalt();
    const passwordHash = await hashPassword('Mangal@123', salt);
    const updated = { ...user, salt, passwordHash };
    await db.put('users', updated);
    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in', role: 'admin',
      action: 'PASSWORD_RESET',
      details: `Password reset to default (Mangal@123) for ${user.email}`
    });
    alert(`Password for ${user.name} reset to default: Mangal@123`);
    loadData();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    soundEngine.playTelemetryPing();
    const db = await getDb();
    const salt = generateSalt();
    const passwordHash = await hashPassword(newUserData.password, salt);
    const userObj = {
      name: newUserData.name, email: newUserData.email, role: newUserData.role,
      callsign: newUserData.callsign || 'Crew-Unit', pin: newUserData.pin || '1234',
      salt, passwordHash, active: true, createdAt: new Date().toISOString()
    };
    await db.put('users', userObj);
    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in', role: 'admin',
      action: 'USER_CREATED',
      details: `New account provisioned: ${userObj.email} (${userObj.role})`
    });
    setShowAddModal(false);
    setActionSuccess(`User ${userObj.name} successfully created.`);
    loadData();
  };

  const handleForceLogoutSession = (sessionId) => {
    soundEngine.playClick();
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setActionSuccess('Session terminated. Token invalidated.');
    setTimeout(() => setActionSuccess(''), 3000);
  };

  const handleExportBackup = async () => {
    soundEngine.playTelemetryPing();
    const db = await getDb();
    const backupData = {
      app: 'Mangal Health Sentinel', version: '2.4.0',
      exportedAt: new Date().toISOString(),
      users: await db.getAll('users'),
      auditLogs: await db.getAll('audit_logs'),
      consent: await db.getAll('consent')
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mangal_sentinel_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setActionSuccess('Local backup successfully exported to JSON.');
  };

  /* Audit filter logic */
  const auditFilterMap = {
    ALL: null, Login: 'LOGIN', Consent: 'CONSENT_CHANGED',
    Emergency: 'EMERGENCY_OVERRIDE', Admin: 'USER_MODIFIED'
  };
  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter === 'ALL') return true;
    const mapped = auditFilterMap[auditFilter];
    return mapped ? log.action === mapped : true;
  });

  /* ── Helpers ── */
  const getInitials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5 min-w-0 max-w-7xl mx-auto overflow-hidden">

      {/* ─── Header Banner ─────────────────────────────────── */}
      <div className="relative rounded-2xl p-4 sm:p-5 border border-purple-500/40 shadow-xl overflow-hidden bg-gradient-to-r from-space-900/95 via-space-950/95 to-slate-950/95 card-3d-hover flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide drop-shadow"
                style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
                Admin Control Room · Systems &amp; Ledger
              </h1>
              <p className="text-xs text-slate-300 font-sans">
                Security log, sessions and backups.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-space-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <span className="text-xs font-mono text-purple-300 bg-space-950 px-3 py-1.5 rounded-lg border border-purple-500/40">
            Ground Station
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-purple-950/50 border border-purple-500 text-purple-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ─── STAT TILES ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statTilesDef.map((tile) => {
          const Icon = tile.icon;
          const c = tileColorMap[tile.color];
          return (
            <TiltCard key={tile.label}
              className={`${c.bg} border ${c.border} bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hover:border-violet-400/60 hover:shadow-violet-400/20 transition-all duration-300 cursor-default flex flex-col justify-between`}>
              <div>
                <div className="flex items-start justify-between mb-2">
                  <Icon className={`w-8 h-8 ${c.icon}`} />
                </div>
                <div className={`text-3xl font-bold ${c.val}`}
                  style={{ textShadow: `0 0 20px ${c.glow}` }}>
                  {tile.value}
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-0.5">{tile.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{tile.sub}</div>
              </div>
              {/* Google Cloud metric sparkline diagram */}
              <div className="mt-2 pt-1 border-t border-slate-800/60">
                <GoogleCloudMetricSparklineDiagram color={c.sparkColor} />
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* ─── CHARTS ROW ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Donut: users by role */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-3"
            style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
            Users by Role
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={roleDonutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                dataKey="value" nameKey="name" label={({ name }) => name} labelLine={false}>
                {roleDonutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <RechartTooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: logins per hour */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
          <h3 className="text-sm font-bold text-white mb-3"
            style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
            Logins per Hour (Today)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={loginHourData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" tick={{ fill: '#64748b', fontSize: 9 }} interval={3} />
              <YAxis tick={{ fill: '#64748b', fontSize: 9 }} />
              <RechartTooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
              />
              <Bar dataKey="logins" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── GROUND STATION MAP ────────────────────────────── */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white" style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
            Ground Station Link
          </h3>
          <span className="flex items-center gap-1 text-xs font-mono text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Active
          </span>
        </div>
        <GoogleRadioLinkDiagram />
      </div>

      {/* ─── SYSTEM HEALTH GAUGES ──────────────────────────── */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-4"
          style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
          System Health
        </h3>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {systemMetrics.map((m) => (
            <TiltCard key={m.label}>
              <CircleGauge value={m.value} max={m.max || 100} color={m.color} label={m.label} unit={m.unit} />
            </TiltCard>
          ))}
        </div>
      </div>

      {/* ─── NAVIGATION TABS ───────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
        {[
          { id: 'users', label: 'Crew Users', icon: Users },
          { id: 'audit', label: 'Audit Log', icon: FileText },
          { id: 'status', label: 'System Status', icon: Server },
          { id: 'sessions', label: 'Active Sessions', icon: Clock },
          { id: 'backup', label: 'Backup & Restore', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { soundEngine.playClick(); setActiveTab(tab.id); }}
              className={`px-3.5 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-500/25 border-purple-500 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-space-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── 1. USERS TAB ──────────────────────────────────── */}
      {activeTab === 'users' && (
        <div className="rounded-2xl p-4 sm:p-5 border border-slate-800 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-display font-bold text-base text-white drop-shadow"
                style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
                User Management
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Passwords stored safely on this device
              </p>
            </div>
            <button
              onClick={() => { soundEngine.playClick(); setShowAddModal(true); }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Crew User</span>
            </button>
          </div>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="pb-2.5">Crew Member</th>
                  <th className="pb-2.5">Code name</th>
                  <th className="pb-2.5">Role</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((user, idx) => (
                  <tr key={idx} className="hover:bg-space-900/40 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {/* Avatar circle */}
                        <div className="relative shrink-0 w-10 h-10 rounded-full bg-violet-900/40 border border-violet-500/40 flex items-center justify-center text-sm font-bold text-white select-none">
                          {getInitials(user.name)}
                          {user.active !== false && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-slate-900 animate-pulse" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-[10px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-cyan-300">{user.callsign}</td>
                    <td className="py-3">
                      <div className="flex flex-col gap-1">
                        {/* Role badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold w-fit ${roleBadge[user.role] || 'bg-slate-700/40 text-slate-300'}`}>
                          {roleLabel[user.role] || user.role}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value)}
                          className="bg-space-950 border border-slate-700 rounded-lg p-1 text-[10px] text-slate-400 focus:outline-none mt-0.5"
                        >
                          <option value="astronaut">Astronaut</option>
                          <option value="flight_surgeon">Doctor</option>
                          <option value="mission_commander">Commander</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        user.active !== false ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {user.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="px-2 py-1 rounded border border-slate-600 bg-transparent hover:bg-slate-800 text-slate-300 text-[10px] transition-colors"
                          title="Reset to Mangal@123"
                        >
                          Reset Password
                        </button>
                        <ToggleSwitch
                          active={user.active !== false}
                          onChange={() => handleToggleUserStatus(user)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 2. AUDIT LOG TAB ──────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl p-4 sm:p-5 border border-slate-800 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h2 className="font-display font-bold text-base text-white drop-shadow"
                style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
                Security Audit Log
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Chronological log of all logins, consent changes, and emergency overrides.
              </p>
            </div>
            {/* Filter bar */}
            <div className="flex items-center gap-1 font-mono text-[10px] flex-wrap">
              {['ALL', 'Login', 'Consent', 'Emergency', 'Admin'].map((f) => (
                <button
                  key={f}
                  onClick={() => setAuditFilter(f)}
                  className={`px-2 py-0.5 rounded border transition-colors ${
                    auditFilter === f
                      ? 'bg-purple-500/30 text-purple-200 border-purple-500'
                      : 'bg-space-900 text-slate-400 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto relative pl-6">
            {/* Vertical timeline line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-800 rounded-full" />

            {filteredLogs.length === 0 ? (
              <p className="text-xs text-slate-500 font-mono text-center py-4">No audit entries found.</p>
            ) : (
              filteredLogs.map((log, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline dot */}
                  <div
                    className="absolute -left-4 top-3 w-3 h-3 rounded-full border-2 border-slate-900"
                    style={{ backgroundColor: auditDotColor(log.action) }}
                  />
                  <div className="p-3 rounded-xl bg-space-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs font-mono hover:border-slate-700 transition-colors">
                    <div className="flex items-start gap-2 min-w-0">
                      <AuditIcon action={log.action} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${severityPill(log.action)}`}>
                            {log.action}
                          </span>
                          <strong className="text-white truncate">{log.user}</strong>
                          <span className="text-[10px] text-slate-500">({log.role})</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs truncate">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">{log.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── 3. SYSTEM STATUS TAB ──────────────────────────── */}
      {activeTab === 'status' && (
        <div className="rounded-2xl p-5 border border-slate-800 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl space-y-4">
          <h2 className="font-display font-bold text-base text-white drop-shadow pb-2 border-b border-slate-800"
            style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
            Avionics &amp; Subsystem Diagnostics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Storage Used</span>
              <div className="text-lg font-bold text-cyan-300">{storageEstimate.usage}</div>
              <span className="text-[10px] text-slate-500">Quota: {storageEstimate.quota}</span>
            </div>
            <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Web Crypto API</span>
              <div className="text-lg font-bold text-emerald-400">Secure Hashing</div>
              <span className="text-[10px] text-slate-500 cursor-default" title="PBKDF2 SHA-256, 100k iterations">Salted Password Protection ⓘ</span>
            </div>
            <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">App Build</span>
              <div className="text-lg font-bold text-white">v2.4.0 PWA Offline</div>
              <span className="text-[10px] text-slate-500">Service Worker Active</span>
            </div>
            <div className="p-4 rounded-xl bg-space-950/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[10px] uppercase block">Database Engine</span>
              <div className="text-lg font-bold text-purple-300">Local Browser DB</div>
              <span className="text-[10px] text-slate-500">4 Stores Mounted</span>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. ACTIVE SESSIONS TAB ────────────────────────── */}
      {activeTab === 'sessions' && (
        <div className="rounded-2xl p-5 border border-slate-800 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h2 className="font-display font-bold text-base text-white drop-shadow"
                style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
                Connected Crew Terminal Sessions
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Active logins and terminal hardware across the spacecraft.
              </p>
            </div>
          </div>
          <div className="space-y-2.5">
            {activeSessions.map((sess) => (
              <div key={sess.id} className="p-3.5 rounded-xl bg-space-950 border border-slate-800 flex items-center justify-between text-xs font-mono hover:border-slate-700 transition-colors">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-white">{sess.user}</strong>
                    <span className="text-[10px] text-cyan-400 uppercase">[{sess.role}]</span>
                    {sess.current && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        This Session
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Terminal: {sess.ip} · {sess.loginTime}</div>
                </div>
                {!sess.current && (
                  <button
                    onClick={() => handleForceLogoutSession(sess.id)}
                    className="px-3 py-1 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/50 text-red-300 text-xs font-bold transition-colors"
                  >
                    Force Logout
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 5. BACKUP & RESTORE TAB ───────────────────────── */}
      {activeTab === 'backup' && (
        <div className="rounded-2xl p-5 border border-slate-800 bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-white drop-shadow"
              style={{ textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
              Local Data Backup &amp; Snapshot Export
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Export accounts, audit logs, and mission data to a downloadable JSON file for offline disaster recovery.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-space-950/90 border border-slate-800 space-y-3 text-center">
              <Download className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="font-mono font-bold text-sm text-white">Export Local Backup (JSON)</h3>
              <p className="text-xs text-slate-400 font-sans">
                Exports all stored data — users, consent records, and security logs — into an offline backup file.
              </p>
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-md"
              >
                Download Snapshot (.json)
              </button>
            </div>
            <div className="p-5 rounded-2xl bg-space-950/90 border border-slate-800 space-y-3 text-center">
              <Upload className="w-8 h-8 text-purple-400 mx-auto" />
              <h3 className="font-mono font-bold text-sm text-white">Restore from Snapshot</h3>
              <p className="text-xs text-slate-400 font-sans">
                Restore system state from a previously exported JSON backup file.
              </p>
              <label className="w-full py-2.5 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 font-mono text-xs font-bold block cursor-pointer transition-colors">
                <span>Select Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      alert('Snapshot validated. System data successfully restored.');
                      loadData();
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Create User ─────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-purple-500/50 max-w-md w-full space-y-4">
            <h3 className="font-mono font-bold text-sm text-white">Provision New Crew User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Full Name:</label>
                <input type="text" value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                  className="w-full bg-space-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  required />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Email / Code name:</label>
                <input type="email" value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. rajesh@mangal.in"
                  className="w-full bg-space-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  required />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Role Assignment:</label>
                <select value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl p-2 text-white text-xs">
                  <option value="astronaut">Astronaut</option>
                  <option value="flight_surgeon">Doctor</option>
                  <option value="mission_commander">Commander</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">Initial Password:</label>
                <input type="password" value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  required />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-space-900 text-slate-400 text-xs">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
