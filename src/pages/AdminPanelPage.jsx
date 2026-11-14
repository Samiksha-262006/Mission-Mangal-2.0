import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, FileText, Database, CheckCircle2, 
  AlertTriangle, RefreshCw, Key, Lock, UserPlus, Sliders, Server, Cpu 
} from 'lucide-react';
import { getDb } from '../auth/db';
import { fetchAllAuditLogs, logAuditEvent } from '../auth/audit';
import { generateSalt, hashPassword } from '../auth/hash';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function AdminPanelPage() {
  const { currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit' | 'system'
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'astronaut',
    password: 'Mangal@123',
    pin: '1234',
    callsign: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const db = await getDb();
      const allUsers = await db.getAll('users');
      setUsersList(allUsers);

      const logs = await fetchAllAuditLogs();
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleUserStatus = async (user) => {
    soundEngine.playClick();
    const db = await getDb();
    const updated = { ...user, active: !user.active };
    await db.put('users', updated);

    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in',
      role: 'admin',
      action: 'USER_MODIFIED',
      details: `User ${user.email} status changed to ${updated.active ? 'ACTIVE' : 'DISABLED'}`
    });

    loadData();
  };

  const handleChangeRole = async (user, newRole) => {
    soundEngine.playClick();
    const db = await getDb();
    const updated = { ...user, role: newRole };
    await db.put('users', updated);

    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in',
      role: 'admin',
      action: 'USER_MODIFIED',
      details: `User ${user.email} role updated to ${newRole}`
    });

    loadData();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    soundEngine.playTelemetryPing();
    const db = await getDb();

    const salt = generateSalt();
    const passwordHash = await hashPassword(newUserData.password, salt);

    const userObj = {
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      callsign: newUserData.callsign || 'Crew-Unit',
      pin: newUserData.pin || '1234',
      salt,
      passwordHash,
      active: true,
      createdAt: new Date().toISOString()
    };

    await db.put('users', userObj);

    await logAuditEvent({
      user: currentUser?.email || 'admin@mangal.in',
      role: 'admin',
      action: 'USER_CREATED',
      details: `Created new user ${userObj.email} with role ${userObj.role}`
    });

    setShowAddModal(false);
    setNewUserData({ name: '', email: '', role: 'astronaut', password: 'Mangal@123', pin: '1234', callsign: '' });
    loadData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="font-display font-bold text-xl text-white">System Administration & Audit Ledger</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
              NAGPUR DSN GROUND CONTROL LEVEL-4
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            User provisioning, RBAC role assignments, cryptographic key audits, and immutable security log inspection.
          </p>
        </div>

        <button
          onClick={() => { soundEngine.playClick(); loadData(); }}
          className="px-3.5 py-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('users'); }}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User & Role Management ({usersList.length})</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('audit'); }}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('system'); }}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'system'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Avionics System Status</span>
        </button>
      </div>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Provisioned Astronaut & Ground Identities
            </span>
            <button
              onClick={() => { soundEngine.playClick(); setShowAddModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-black font-mono font-bold text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="pb-3">Name / Callsign</th>
                  <th className="pb-3">Email Identity</th>
                  <th className="pb-3">Assigned Role</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((user) => (
                  <tr key={user.email} className="hover:bg-space-900/40">
                    <td className="py-3 font-bold text-white">
                      <div>{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{user.callsign}</div>
                    </td>
                    <td className="py-3 text-slate-300">{user.email}</td>
                    <td className="py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        className="bg-space-950 border border-slate-700 rounded px-2 py-1 text-xs text-cyan-300 font-mono"
                      >
                        <option value="astronaut">Astronaut</option>
                        <option value="flight_surgeon">Flight Surgeon</option>
                        <option value="mission_commander">Mission Commander</option>
                        <option value="admin">Ground Admin</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        user.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {user.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`px-3 py-1 rounded text-xs transition-colors ${
                          user.active
                            ? 'bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/30'
                            : 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {user.active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Cryptographic Access & Security Audit Log
            </span>
            <span className="text-[11px] font-mono text-purple-400">IndexedDB Immutable Local Ledger</span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {auditLogs.map((log) => {
              const isCrit = log.action === 'FAILED_LOGIN' || log.emergencyOverride;
              return (
                <div
                  key={log.id}
                  className={`p-3 rounded-xl border font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isCrit 
                      ? 'border-red-500/50 bg-red-950/20' 
                      : 'border-slate-800 bg-space-950/70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${
                        log.emergencyOverride 
                          ? 'bg-red-500 text-black border-red-400 animate-pulse' 
                          : isCrit 
                          ? 'bg-red-500/20 text-red-300 border-red-500/40' 
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-white font-bold">{log.user}</span>
                      <span className="text-slate-400">({log.role})</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">{log.details}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Avionics System Status */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase text-[10px]">IndexedDB Storage Engine</span>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <span>Operational (idb v8)</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Offline persistence for users, session tokens, audit ledger, and encrypted astronaut journals.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase text-[10px]">Web Crypto Hardware Engine</span>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              <span>PBKDF2 + AES-GCM Active</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              100,000 salted iterations of SHA-256 for passwords; 256-bit AES-GCM encryption at rest.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase text-[10px]">Service Worker Offline Caching</span>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-mangal-blue" />
              <span>PWA Registered</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Service worker caching core assets for zero-network Mars transit resilience.
            </p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-slate-400 block uppercase text-[10px]">WebGL 3D Rendering Pipeline</span>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-mangal-gold" />
              <span>Three.js Procedural Active</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Procedural Mars globe, 3D body scanner, and spacecraft module map running locally.
            </p>
          </div>
        </div>
      )}

      {/* Provision User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-purple-500/40 shadow-2xl relative">
            <h3 className="font-display font-bold text-white text-base mb-4 border-b border-slate-800 pb-2">
              Provision New Crew Member / Ground Role
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email / Callsign ID</label>
                <input
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Assigned Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-cyan-300"
                  >
                    <option value="astronaut">Astronaut</option>
                    <option value="flight_surgeon">Flight Surgeon</option>
                    <option value="mission_commander">Mission Commander</option>
                    <option value="admin">Ground Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Unlock PIN (4 digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={newUserData.pin}
                    onChange={(e) => setNewUserData({ ...newUserData, pin: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Initial Passphrase</label>
                <input
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded bg-space-900 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-purple-500 hover:bg-purple-400 text-black font-bold"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
