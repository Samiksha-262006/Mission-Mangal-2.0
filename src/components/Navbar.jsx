import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, ShieldAlert, Cpu, Pill, Camera, Brain, 
  Dumbbell, Radio, Users, Bell, Moon, Eye, Volume2, 
  VolumeX, Menu, X, User, Lock, LogOut, Shield, ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useAuthStore } from '../auth/session';
import { getRoleBadgeInfo } from '../auth/rbac';
import { soundEngine } from '../utils/audio';
import EmergencyOverrideModal from './EmergencyOverrideModal';

export default function Navbar({ onOpenProfile }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const navigate = useNavigate();

  const {
    missionDay,
    currentVitals,
    commStatus,
    lowGlareMode,
    tacticalRedMode,
    soundMuted,
    toggleLowGlare,
    toggleTacticalRed,
    toggleSoundMute,
    alerts,
    activeEvents
  } = useMissionStore();

  const { currentUser, logout, lockTerminal, emergencyOverride } = useAuthStore();

  const roleBadge = getRoleBadgeInfo(currentUser?.role);
  const isFlightSurgeon = currentUser?.role === 'flight_surgeon';
  const isAdmin = currentUser?.role === 'admin';
  const isAstronaut = currentUser?.role === 'astronaut';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: Activity, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/baseline', label: 'Drift Anomaly', icon: Activity, roles: ['astronaut', 'flight_surgeon', 'admin'] },
    { to: '/hazards', label: '5-Hazards', icon: ShieldAlert, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/surgeon', label: 'AI Surgeon', icon: Cpu, roles: ['astronaut', 'flight_surgeon', 'admin'] },
    { to: '/inventory', label: 'Med Kit', icon: Pill, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/scan', label: 'Vitals Scan', icon: Camera, roles: ['astronaut', 'flight_surgeon', 'admin'] },
    { to: '/cognition', label: 'Mind & PVT', icon: Brain, roles: ['astronaut', 'flight_surgeon', 'admin'] },
    { to: '/exercise', label: 'Exercise', icon: Dumbbell, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/sync', label: 'Earth Sync', icon: Radio, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/crew', label: 'Crew View', icon: Users, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/alerts', label: 'Alerts', icon: Bell, badge: alerts.length, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
    { to: '/consent', label: 'Consent Center', icon: Shield, roles: ['astronaut', 'admin'] },
    { to: '/admin', label: 'Admin Ledger', icon: ShieldCheck, roles: ['admin'] }
  ];

  // Filter nav by role
  const visibleNavItems = navItems.filter(item => 
    !currentUser?.role || item.roles.includes(currentUser.role) || currentUser.role === 'admin'
  );

  const handleNavClick = () => {
    soundEngine.playClick();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-mangal-blue/20 bg-space-950/90 backdrop-blur-md">
        
        {/* Top Mission Telemetry Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            {/* Mission Mangal Emblem + Title */}
            <div 
              onClick={() => { soundEngine.playClick(); navigate('/'); }}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img
                src="/assets/mission-mangal-logo.png"
                alt="Mission Mangal 2.0"
                className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(46,139,255,0.6)] group-hover:scale-105 transition-transform"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black tracking-wider text-sm sm:text-base text-white">MANGAL</span>
                  <span className="font-display text-xs font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-mangal-copper to-mangal-orange text-white">
                    SENTINEL
                  </span>
                </div>
                <p className="text-[9px] text-mangal-blue font-display tracking-widest hidden sm:block">
                  MISSION MANGAL 2.0 • NAGPUR, INDIA
                </p>
              </div>
            </div>

            {/* Active Contingency Pills */}
            <div className="hidden xl:flex items-center gap-2 ml-3">
              {activeEvents.solarFlare && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> SOLAR FLARE ACTIVE
                </span>
              )}
              {activeEvents.chestPain && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> CARDIAC EMERGENCY
                </span>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Flight Surgeon Break-Glass Button */}
            {isFlightSurgeon && (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowOverrideModal(true);
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
                  emergencyOverride.active
                    ? 'bg-red-500 text-white animate-pulse border border-red-400'
                    : 'bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/40'
                }`}
                title="Break-Glass Emergency Medical Override"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{emergencyOverride.active ? 'Override Active' : 'Emergency Override'}</span>
              </button>
            )}

            {/* Mission Day Badge */}
            <div className="bg-space-900 border border-mangal-blue/40 px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1">
              <span className="text-slate-400 text-[10px]">SOL</span>
              <span className="font-bold text-white text-xs sm:text-sm">{missionDay}</span>
              <span className="text-slate-500 text-[9px]">/180</span>
            </div>

            {/* Health Score Pill */}
            <div 
              onClick={() => navigate('/')}
              className={`cursor-pointer px-2 py-1 rounded-md border text-xs font-mono flex items-center gap-1 transition-colors ${
                currentVitals.healthScore >= 80 
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                  : currentVitals.healthScore >= 60 
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' 
                  : 'bg-red-950/40 border-red-500/50 text-red-300 animate-pulse'
              }`}
            >
              <span className="text-[9px] hidden sm:inline">HEALTH</span>
              <span className="font-bold">{currentVitals.healthScore}%</span>
            </div>

            {/* UI Toggles */}
            <div className="hidden sm:flex items-center gap-1 bg-space-900/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => { soundEngine.playClick(); toggleLowGlare(); }}
                title="Low-Glare Mode"
                className={`p-1.5 rounded text-xs ${lowGlareMode ? 'bg-mangal-blue/30 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { soundEngine.playClick(); toggleTacticalRed(); }}
                title="Tactical Red Night Mode"
                className={`p-1.5 rounded text-xs ${tacticalRedMode ? 'bg-red-500/30 text-red-300 ring-1 ring-red-500' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleSoundMute}
                title={soundMuted ? 'Unmute Audio Alarms' : 'Mute Alarms'}
                className="p-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Authenticated User & Quick Lock */}
            {currentUser && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { soundEngine.playClick(); onOpenProfile(); }}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-space-900 border border-slate-700 hover:border-mangal-blue text-xs font-mono"
                  title="Astronaut Baseline Setup"
                >
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                  <span className="text-white hidden lg:inline text-xs">{currentUser.name}</span>
                </button>

                <button
                  onClick={() => { soundEngine.playClick(); lockTerminal(); }}
                  title="Lock Terminal (PIN Protected)"
                  className="p-1.5 rounded-lg bg-space-900 border border-slate-700 hover:text-mangal-gold text-slate-400"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => { soundEngine.playClick(); logout(); }}
                  title="Logout Session"
                  className="p-1.5 rounded-lg bg-space-900 border border-slate-700 hover:text-red-400 text-slate-400 hidden sm:block"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center gap-1 px-4 py-1.5 max-w-7xl mx-auto overflow-x-auto text-xs font-mono scrollbar-none">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={({ isActive }) => `
                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/40 shadow-[0_0_12px_rgba(46,139,255,0.3)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-850 border border-transparent'}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden p-4 space-y-2 bg-space-950/95 border-b border-mangal-blue/20">
            <div className="grid grid-cols-2 gap-2">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    className={({ isActive }) => `
                      flex items-center gap-2 p-2.5 rounded-lg text-xs font-mono transition-colors
                      ${isActive ? 'bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/40' : 'bg-space-900/60 text-slate-300 border border-slate-800'}
                    `}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span className="flex-1 truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
            
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Team Mission Mangal 2.0</span>
              <button onClick={() => logout()} className="text-red-400 flex items-center gap-1">
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Emergency Override Modal */}
      <EmergencyOverrideModal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
      />
    </>
  );
}
