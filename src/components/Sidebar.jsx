import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Compass, Bell, ShieldAlert, Camera, Cpu, Pill, 
  Dumbbell, Brain, Shield, Users, Radio, Lock, LogOut, 
  ChevronLeft, ChevronRight, X, ShieldCheck, Orbit, UserCheck, Flame
} from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { useMissionStore } from '../store/useMissionStore';
import { getRoleBadgeInfo } from '../auth/rbac';
import { soundEngine } from '../utils/audio';

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, lockTerminal } = useAuthStore();
  const { alerts, activeEvents, missionDay } = useMissionStore();

  const roleBadge = getRoleBadgeInfo(currentUser?.role);
  const criticalAlertCount = alerts.filter(a => a.severity === 'critical').length;

  const navGroups = [
    {
      group: 'Mission',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: Activity, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
        { to: '/mission-control', label: 'Mission Control', icon: Compass, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
        { to: '/alerts', label: 'Alerts Center', icon: Bell, badge: alerts.length, badgeCrit: criticalAlertCount > 0, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] }
      ]
    },
    {
      group: 'Health',
      items: [
        { to: '/baseline', label: 'Health Drift & Base', icon: Activity, roles: ['astronaut', 'flight_surgeon', 'admin'] },
        { to: '/hazards', label: 'Multi-Hazard Risk', icon: ShieldAlert, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
        { to: '/body-scan', label: '3D Body Scanner', icon: Orbit, roles: ['astronaut', 'flight_surgeon', 'admin'] },
        { to: '/scan', label: 'Contactless Vitals', icon: Camera, roles: ['astronaut', 'flight_surgeon', 'admin'] }
      ]
    },
    {
      group: 'Care',
      items: [
        { to: '/surgeon', label: 'AI Flight Surgeon', icon: Cpu, roles: ['astronaut', 'flight_surgeon', 'admin'] },
        { to: '/inventory', label: 'Medical Kit', icon: Pill, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
        { to: '/exercise', label: 'Exercise Plan', icon: Dumbbell, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] },
        { to: '/cognition', label: 'Mind & Cognition', icon: Brain, roles: ['astronaut', 'flight_surgeon', 'admin'] }
      ]
    },
    {
      group: 'Safety',
      items: [
        { to: '/shelter', label: 'Radiation Shelter', icon: Flame, badge: activeEvents.solarFlare ? 'SPE' : null, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] }
      ]
    },
    {
      group: 'Team',
      items: [
        { to: '/crew', label: 'Crew View', icon: Users, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] }
      ]
    },
    {
      group: 'Comms',
      items: [
        { to: '/sync', label: 'Earth Sync & Delay', icon: Radio, roles: ['astronaut', 'flight_surgeon', 'mission_commander', 'admin'] }
      ]
    },
    {
      group: 'Security',
      items: [
        { to: '/consent', label: 'Consent Center', icon: Shield, roles: ['astronaut', 'admin'] },
        { to: '/admin', label: 'Admin Ledger', icon: ShieldCheck, roles: ['admin'] }
      ]
    }
  ];

  const handleNav = () => {
    soundEngine.playClick();
    if (onClose) onClose();
  };

  const isPermitted = (roles) => {
    if (!currentUser?.role) return true;
    if (currentUser.role === 'admin') return true;
    return roles.includes(currentUser.role);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between
          bg-space-950/95 backdrop-blur-xl border-r border-mangal-blue/20
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-60'}
          w-72 max-w-[85vw]
        `}
      >
        {/* Top Branding */}
        <div className="p-3 border-b border-white/5 flex items-center justify-between">
          <div 
            onClick={() => { soundEngine.playClick(); navigate('/dashboard'); handleNav(); }}
            className={`flex items-center gap-2.5 cursor-pointer group ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
            title="Mangal Health Sentinel"
          >
            <img
              src="/assets/mission-mangal-logo.png"
              alt="Mission Mangal 2.0"
              className="w-9 h-9 object-contain drop-shadow-[0_0_12px_rgba(46,139,255,0.6)] group-hover:scale-105 transition-transform shrink-0"
            />
            {(!isCollapsed || isOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm text-white tracking-wider">MANGAL</span>
                  <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-gradient-to-r from-mangal-copper to-mangal-orange text-white">
                    SENTINEL
                  </span>
                </div>
                <p className="text-[8px] font-mono text-mangal-blue tracking-widest truncate">
                  MISSION MANGAL 2.0
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-white hover:bg-space-850"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
          {navGroups.map((group) => {
            const permittedItems = group.items.filter(item => isPermitted(item.roles));
            if (permittedItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                {(!isCollapsed || isOpen) && (
                  <span className="px-2.5 text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase block mb-1">
                    {group.group}
                  </span>
                )}

                {permittedItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || (item.to === '/dashboard' && location.pathname === '/');

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={handleNav}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all group relative
                        ${isActive
                          ? 'bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/50 shadow-[0_0_15px_rgba(46,139,255,0.25)]'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-space-900 border border-transparent'
                        }
                        ${isCollapsed && !isOpen ? 'lg:justify-center' : ''}
                      `}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />

                      {(!isCollapsed || isOpen) && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}

                      {/* Notification Badge */}
                      {item.badge && (!isCollapsed || isOpen) && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                          item.badgeCrit || item.badge === 'SPE'
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-space-900 text-cyan-300 border border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {/* Tooltip in collapsed mode */}
                      {isCollapsed && !isOpen && (
                        <div className="hidden lg:group-hover:flex absolute left-full ml-2 px-2.5 py-1 rounded bg-space-900 border border-slate-700 text-white text-[11px] whitespace-nowrap shadow-xl z-50">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Bottom User Profile & Session Controls */}
        <div className="p-3 border-t border-white/5 bg-space-950/60 space-y-2">
          {currentUser && (
            <div className={`flex items-center gap-2 ${isCollapsed && !isOpen ? 'lg:justify-center' : ''}`}>
              <div 
                className="w-8 h-8 rounded-lg bg-mangal-copper/20 border border-mangal-copper/50 flex items-center justify-center font-mono font-bold text-mangal-gold text-xs shrink-0 cursor-pointer"
                onClick={() => navigate('/consent')}
                title={currentUser.name}
              >
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AU'}
              </div>

              {(!isCollapsed || isOpen) && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono font-bold text-white truncate">{currentUser.name}</div>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase inline-block ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Lock & Logout Buttons */}
          <div className={`flex items-center gap-1.5 pt-1 ${isCollapsed && !isOpen ? 'lg:flex-col' : 'justify-between'}`}>
            <button
              onClick={() => { soundEngine.playClick(); lockTerminal(); }}
              title="Lock Terminal"
              className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-400 hover:text-mangal-gold text-xs font-mono flex items-center justify-center flex-1"
            >
              <Lock className="w-3.5 h-3.5" />
              {(!isCollapsed || isOpen) && <span className="ml-1 text-[11px]">Lock</span>}
            </button>

            <button
              onClick={() => { soundEngine.playClick(); logout(); }}
              title="Logout Session"
              className="p-1.5 rounded-lg bg-space-900 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs font-mono flex items-center justify-center flex-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              {(!isCollapsed || isOpen) && <span className="ml-1 text-[11px]">Logout</span>}
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}
