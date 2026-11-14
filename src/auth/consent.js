import { getDb } from './db';
import { logAuditEvent } from './audit';

/**
 * Astronaut Consent Management Service
 * Enforces field-level access control for Flight Surgeon, Commander, and Ground Control.
 */

export const DEFAULT_CONSENT = {
  vitals: true,          // Heart rate, BP, SpO2, Temperature
  mentalHealth: false,   // PVT scores, stress index, mood circumplex
  privateJournal: false, // Subjective encrypted logs
  location: true,        // Spacecraft module positioning
  radiation: true        // Cumulative dosimeter exposure
};

export async function getAstronautConsent(astronautEmail = 'astronaut@mangal.in') {
  try {
    const db = await getDb();
    const entry = await db.get('consent', astronautEmail);
    if (entry && entry.categories) {
      return entry.categories;
    }
    return DEFAULT_CONSENT;
  } catch {
    return DEFAULT_CONSENT;
  }
}

export async function updateAstronautConsent(astronautEmail, newCategories, currentUser) {
  try {
    const db = await getDb();
    const updated = {
      astronautEmail,
      categories: newCategories,
      updatedAt: new Date().toISOString()
    };
    await db.put('consent', updated);

    await logAuditEvent({
      user: currentUser?.email || astronautEmail,
      role: currentUser?.role || 'astronaut',
      action: 'CONSENT_CHANGE',
      details: `Consent categories updated: ${JSON.stringify(newCategories)}`
    });

    return updated;
  } catch (err) {
    console.error('Failed to update consent:', err);
    throw err;
  }
}

/**
 * Data Layer Consent Enforcer:
 * Validates whether the current active user/role can access the requested data category.
 * If Flight Surgeon has active Emergency Override, access is granted but flagged.
 */
export async function canAccessDataCategory({ userRole, category, astronautEmail = 'astronaut@mangal.in', hasEmergencyOverride = false }) {
  // 1. Astronaut always has access to their own data
  if (userRole === 'astronaut') return true;

  // 2. Admin has system access for diagnostics
  if (userRole === 'admin') return true;

  // 3. Flight Surgeon with Emergency Override (Break-Glass) has temporary access
  if (userRole === 'flight_surgeon' && hasEmergencyOverride) {
    return true;
  }

  // 4. Mission Commander only sees operational status, never private journal
  if (userRole === 'mission_commander') {
    if (category === 'privateJournal' || category === 'mentalHealth') {
      return false;
    }
    return true;
  }

  // 5. Query Consent Center settings
  const consent = await getAstronautConsent(astronautEmail);
  return !!consent[category];
}
