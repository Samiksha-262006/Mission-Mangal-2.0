/**
 * Role-Based Access Control (RBAC) Definitions & Route Authorizations
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
  '/baseline': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON],
  '/hazards': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER],
  '/surgeon': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON],
  '/inventory': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER],
  '/scan': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON],
  '/cognition': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON], // Flight Surgeon requires consent or emergency override
  '/exercise': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER],
  '/sync': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/crew': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/alerts': [ROLES.ASTRONAUT, ROLES.FLIGHT_SURGEON, ROLES.MISSION_COMMANDER, ROLES.ADMIN],
  '/consent': [ROLES.ASTRONAUT, ROLES.ADMIN],
  '/admin': [ROLES.ADMIN]
};

// Check if a role can access a specific route
export function isRouteAllowed(path, role) {
  if (!role) return false;
  if (role === ROLES.ADMIN) return true; // Admin has oversight access
  const allowedRoles = ROUTE_PERMISSIONS[path];
  if (!allowedRoles) return true; // Default allow if unlisted
  return allowedRoles.includes(role);
}

// Get user-friendly role display badge
export function getRoleBadgeInfo(role) {
  switch (role) {
    case ROLES.ASTRONAUT:
      return { label: 'Astronaut', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
    case ROLES.FLIGHT_SURGEON:
      return { label: 'Flight Surgeon', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    case ROLES.MISSION_COMMANDER:
      return { label: 'Mission Commander', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case ROLES.ADMIN:
      return { label: 'Ground Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    default:
      return { label: 'Guest', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
}
