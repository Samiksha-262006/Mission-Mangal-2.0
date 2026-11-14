import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Compass, Bell, ShieldAlert, Camera, Cpu, Pill, 
  Dumbbell, Brain, Shield, Users, Radio, Lock, LogOut, 
  ChevronLeft, ChevronRight, X, ShieldCheck, Orbit, Flame,
  Stethoscope, UserCheck, HardDrive, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { getRoleBadgeInfo, getRoleHomeRoute, ROLES } from '../auth/rbac';
import { soundEngine } from '../utils/audio';
import EmergencyOverrideModal from './EmergencyOverrideModal';

export default function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, lockTerminal } = useAuthStore();
  const { alerts, activeEvents } = useMissionStore();
  const { t } = useLanguage();
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  const role = currentUser?.role || 'astronaut';
  const roleBadge = getRoleBadgeInfo(role);
  const criticalAlertCount = alerts.filter(a => a.severity === 'critical').length;

  const handleNav = () => {
    soundEngine.playClick();
    if (onClose) onClose();
  };

  // Build role-specific navigation menu
  const getRoleNavItems = () => {
    switch (role) {
      case ROLES.FLIGHT_SURGEON:
        return [
          {
            groupTitle: t('navPatientReview'),
            items: [
              { to: '/doctor', label: t('navPatients'), icon: Users, badge: null },
              { to: '/alerts', label: t('navAlertsQueue'), icon: Bell, badge: alerts.length, badgeCrit: criticalAlertCount > 0 },
              { to: '/baseline', label: t('navReports'), icon: Activity, badge: null },
              { to: '/sync', label: t('navSync'), icon: Radio, badge: null },
              { action: 'emergency', label: t('navEmergencyAccess'), icon: ShieldAlert, badge: 'OVERRIDE', badgeCrit: true }
            ]
          }
        ];

      case ROLES.MISSION_COMMANDER:
        return [
          {
            groupTitle: t('navMissionOverview'),
            items: [
              { to: '/commander', label: t('navMissionOverview'), icon: Compass, badge: null },
              { to: '/crew', label: t('navCrewReadiness'), icon: Users, badge: null },
              { to: '/commander', hash: '#tasks', label: t('navTasks'), icon: UserCheck, badge: null },
              { to: '/mission-control', label: t('navTimeline'), icon: Orbit, badge: null },
              { to: '/commander', hash: '#orders', label: t('navEmergencyOrders'), icon: ShieldAlert, badge: null },
              { to: '/shelter', label: t('navShelter'), icon: Flame, badge: activeEvents.solarFlare ? 'SPE' : null, badgeCrit: activeEvents.solarFlare }
            ]
          }
        ];

      case ROLES.ADMIN:
        return [
          {
            groupTitle: t('navControlRoom'),
            items: [
              { to: '/admin', hash: '#users', label: t('navUsers'), icon: Users, badge: null },
              { to: '/admin', hash: '#audit', label: t('navAuditLog'), icon: ShieldCheck, badge: null },
              { to: '/admin', hash: '#status', label: t('navSystemStatus'), icon: HardDrive, badge: null },
              { to: '/admin', hash: '#sessions', label: t('navSessions'), icon: Lock, badge: null },
              { to: '/admin', hash: '#backup', label: t('navBackup'), icon: Radio, badge: null }
            ]
          },
          {
            groupTitle: t('navInspectorViews'),
            items: [
              { to: '/dashboard', label: t('navMyHealth'), icon: Activity, badge: null },
              { to: '/doctor', label: t('navPatientReview'), icon: Stethoscope, badge: null },
              { to: '/commander', label: t('navMissionOverview'), icon: Compass, badge: null }
            ]
          }
        ];

      case ROLES.ASTRONAUT:
      default:
        return [
          {
            groupTitle: t('navMyHealth'),
            items: [
              { to: '/dashboard', label: t('navMyHealth'), icon: Activity, badge: null },
              { to: '/scan', label: t('navContactless'), icon: Camera, badge: null },
              { to: '/surgeon', label: t('navSurgeon'), icon: Cpu, badge: null },
              { to: '/inventory', label: t('navInventory'), icon: Pill, badge: null },
              { to: '/exercise', label: t('navExercise'), icon: Dumbbell, badge: null },
              { to: '/cognition', label: t('navCognition'), icon: Brain, badge: null },
              { to: '/shelter', label: t('navShelter'), icon: Flame, badge: activeEvents.solarFlare ? 'SPE' : null, badgeCrit: activeEvents.solarFlare },
              { to: '/consent', label: t('navConsent'), icon: Shield, badge: null }
            ]
          }
        ];
    }
  };

  const roleNavGroups = getRoleNavItems();

  // Active link styling per role
  const getActiveStyles = () => {
    switch (role) {
      case ROLES.FLIGHT_SURGEON:
        return {
          activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          iconActive: 'text-emerald-400'
        };
      case ROLES.MISSION_COMMANDER:
        return {
          activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
          iconActive: 'text-amber-400'
        };
      case ROLES.ADMIN:
        return {
          activeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.25)]',
          iconActive: 'text-purple-400'
        };
      case ROLES.ASTRONAUT:
      default:
        return {
          activeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.25)]',
          iconActive: 'text-cyan-400'
        };
    }
  };

  const { activeClass, iconActive } = getActiveStyles();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar Container with 3D Glass styling */}
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
            onClick={() => { 
              soundEngine.playClick(); 
              navigate(getRoleHomeRoute(currentUser?.role)); 
              handleNav(); 
            }}
            className={`flex items-center gap-2.5 cursor-pointer group ${isCollapsed ? 'lg:justify-center lg:w-full' : ''}`}
            title={t('appName')}
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
                  {t('missionTitle')}
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

        {/* Scrollable Role-Specific Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-none">
          {roleNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(!isCollapsed || isOpen) && (
                <span className="px-2.5 text-[9px] font-mono font-bold tracking-widest text-slate-400 uppercase block mb-1">
                  {group.groupTitle}
                </span>
              )}

              {group.items.map((item, iIdx) => {
                const Icon = item.icon;

                // Handle Action button (like Doctor Emergency Override)
                if (item.action === 'emergency') {
                  return (
                    <button
                      key={iIdx}
                      onClick={() => {
                        soundEngine.playWarningChime();
                        setShowOverrideModal(true);
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`
                        w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all group relative text-left
                        bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/40
                        ${isCollapsed && !isOpen ? 'lg:justify-center' : ''}
                      `}
                    >
                      <Icon className="w-4 h-4 shrink-0 text-red-400 animate-pulse" />
                      {(!isCollapsed || isOpen) && (
                        <span className="truncate flex-1 font-bold">{item.label}</span>
                      )}
                      {item.badge && (!isCollapsed || isOpen) && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-600 text-white animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                const isActive = location.pathname === item.to || (item.to === getRoleHomeRoute(role) && location.pathname === '/');

                return (
                  <NavLink
                    key={item.to + (item.hash || '') + iIdx}
                    to={item.to + (item.hash || '')}
                    onClick={handleNav}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-mono font-medium transition-all group relative
                      ${isActive
                        ? `${activeClass} border`
                        : 'text-slate-400 hover:text-slate-200 hover:bg-space-900 border border-transparent'
                      }
                      ${isCollapsed && !isOpen ? 'lg:justify-center' : ''}
                    `}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? iconActive : 'text-slate-400 group-hover:text-slate-200'}`} />

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
          ))}
        </div>

        {/* Bottom User Profile & Session Controls */}
        <div className="p-3 border-t border-white/5 bg-space-950/60 space-y-2">
          {currentUser && (
            <div className={`flex items-center gap-2 ${isCollapsed && !isOpen ? 'lg:justify-center' : ''}`}>
              <div 
                className="w-8 h-8 rounded-lg bg-space-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-white text-xs shrink-0 cursor-pointer hover:border-mangal-blue transition-colors"
                onClick={() => navigate(role === ROLES.ADMIN ? '/admin' : '/consent')}
                title={currentUser.name}
              >
                {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'AU'}
              </div>

              {(!isCollapsed || isOpen) && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-mono font-bold text-white truncate">{currentUser.name}</div>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase inline-block ${roleBadge.color}`}>
                    {t(`role${roleBadge.label}`) || roleBadge.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Lock & Logout Buttons */}
          <div className={`flex items-center gap-1.5 pt-1 ${isCollapsed && !isOpen ? 'lg:flex-col' : 'justify-between'}`}>
            <button
              onClick={() => { soundEngine.playClick(); lockTerminal(); }}
              title={t('lockTerminal')}
              className="p-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-400 hover:text-mangal-gold text-xs font-mono flex items-center justify-center flex-1 transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              {(!isCollapsed || isOpen) && <span className="ml-1 text-[11px]">{t('lockTerminal')}</span>}
            </button>

            <button
              onClick={() => { soundEngine.playClick(); logout(); }}
              title={t('signOut')}
              className="p-1.5 rounded-lg bg-space-900 hover:bg-red-950/40 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-xs font-mono flex items-center justify-center flex-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              {(!isCollapsed || isOpen) && <span className="ml-1 text-[11px]">{t('signOut')}</span>}
            </button>
          </div>
        </div>

      </aside>

      {/* Emergency Override Modal for Doctor */}
      <EmergencyOverrideModal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
      />
    </>
  );
}
