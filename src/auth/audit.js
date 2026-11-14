import { getDb } from './db';

/**
 * Audit Logging Service
 * Records security-relevant events to IndexedDB
 */
export async function logAuditEvent({ user, role, action, details, emergencyOverride = false }) {
  try {
    const db = await getDb();
    const entry = {
      timestamp: new Date().toISOString(),
      user: user || 'anonymous',
      role: role || 'UNKNOWN',
      action, // LOGIN, LOGOUT, FAILED_LOGIN, PIN_UNLOCK, DATA_ACCESS, CONSENT_CHANGE, EMERGENCY_OVERRIDE, USER_MODIFIED
      details: details || '',
      emergencyOverride,
      clientNode: 'Mars-Avionics-Node-01 (Nagpur Relay)'
    };
    await db.add('audit_logs', entry);
    return entry;
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

export async function fetchAllAuditLogs() {
  try {
    const db = await getDb();
    const logs = await db.getAll('audit_logs');
    // Return newest first
    return logs.reverse();
  } catch (err) {
    console.error('Failed to fetch audit logs:', err);
    return [];
  }
}
