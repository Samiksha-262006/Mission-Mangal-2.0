/**
 * Role-Based Access Control (RBAC) Definitions & Route Authorizations
 * Team Mission Mangal 2.0 · Nagpur, India
 */

export const ROLES = {
  ASTRONAUT: 'astronaut',
  FLIGHT_SURGEON: 'flight_surgeon',
  MISSION_COMMANDER: 'mission_commander',
  ADMIN: 'admin'
};

// Route-level permission matrix
export const ROUTE_PERMISSIONS = {
  '/': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/dashboard': [ROLES.ASTRONAUT, ROLES.ADMIN],
  '/doctor': [ROLES.FLIGHT_SURGEON, ROLES.ADMIN],
  '/commander': [ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/admin': [ROLES.ADMIN],
  '/baseline': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.ADMIN],
  '/hazards': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/body-scan': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.ADMIN],
  '/scan': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.ADMIN],
  '/surgeon': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.ADMIN],
  '/inventory': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/exercise': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/cognition': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.ADMIN], // Mental health requires consent
  '/shelter': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/crew': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/sync': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/alerts': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/mission-control': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/consent': [ROLES.ASTRONAUT, ROLES.ADMIN]
};

// Check if a role can access a specific route
export function isRouteAllowed(path, role) {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true; // Admin has oversight access
  const allowedRoles = ROUTE_PERMISSIONS[path];
  if (!allowedRoles) return true; // Default allow if unlisted
  return allowedRoles.includes(role);
}

// Redirect target by role for the root "/" route
export function getRoleHomeRoute(role) {
  switch (role) {
    case ROLES.FLIGHT_SURGEON:
      return '/doctor';
    case ROLES.MISSION_COMMANDER:
      return '/commander';
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.ASTRONAUT:
    default:
      return '/dashboard';
  }
}

// User-friendly role display badge & color theme
export function getRoleBadgeInfo(role) {
  switch (role) {
    case ROLES.ASTRONAUT:
      return { 
        label: 'Astronaut', 
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        accentColor: '#00f2fe',
        ringColor: 'ring-cyan-500/40',
        description: 'Monitors personal vitals, body scans & daily health checklist.'
      };
    case ROLES.FLIGHT_SURGEON:
      return { 
        label: 'Flight Surgeon', 
        color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        accentColor: '#10b981',
        ringColor: 'ring-emerald-500/40',
        description: 'Reviews patient vitals vs baseline, triages alerts & prescribes medical kit.'
      };
    case ROLES.MISSION_COMMANDER:
      return { 
        label: 'Mission Commander', 
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        accentColor: '#f59e0b',
        ringColor: 'ring-amber-500/40',
        description: 'Tracks crew operational fitness & fatigue, assigns tasks & emergency orders.'
      };
    case ROLES.ADMIN:
      return { 
        label: 'Ground Admin', 
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        accentColor: '#a855f7',
        ringColor: 'ring-purple-500/40',
        description: 'Ground avionics control, user administration & security audit logs.'
      };
    default:
      return { 
        label: 'Guest', 
        color: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
        accentColor: '#64748b',
        ringColor: 'ring-slate-500/40',
        description: 'Observational terminal access.'
      };
  }
}
