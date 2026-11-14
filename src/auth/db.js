import { openDB } from 'idb';
import { generateSalt, hashPassword } from './hash';

const DB_NAME = 'mangal_health_sentinel_db';
const DB_VERSION = 1;

// Built-in demo accounts fallback
export const DEMO_USERS = {
  'astronaut@mangal.in': {
    email: 'astronaut@mangal.in',
    name: 'Cmdr. Sarah Chen',
    role: 'astronaut',
    callsign: 'Ares-Lead',
    pin: '1234',
    active: true
  },
  'surgeon@mangal.in': {
    email: 'surgeon@mangal.in',
    name: 'Dr. Elena Rostova',
    role: 'flight_surgeon',
    callsign: 'Flight-Surgeon-1',
    pin: '1234',
    active: true
  },
  'commander@mangal.in': {
    email: 'commander@mangal.in',
    name: 'Cmdr. Rajesh Nair',
    role: 'mission_commander',
    callsign: 'Mars-Command',
    pin: '1234',
    active: true
  },
  'admin@mangal.in': {
    email: 'admin@mangal.in',
    name: 'Ground SysAdmin (Nagpur DSN)',
    role: 'admin',
    callsign: 'Nagpur-Control',
    pin: '1234',
    active: true
  }
};

export async function getDb() {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'email' });
          userStore.createIndex('role', 'role');
        }
        if (!db.objectStoreNames.contains('audit_logs')) {
          const auditStore = db.createObjectStore('audit_logs', { keyPath: 'id', autoIncrement: true });
          auditStore.createIndex('timestamp', 'timestamp');
        }
        if (!db.objectStoreNames.contains('consent')) {
          db.createObjectStore('consent', { keyPath: 'astronautEmail' });
        }
        if (!db.objectStoreNames.contains('journal')) {
          db.createObjectStore('journal', { keyPath: 'id' });
        }
      }
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, operating in memory fallback:', err);
    return null;
  }
}

// Seed demo accounts
export async function seedDemoAccounts() {
  try {
    const db = await getDb();
    if (!db) return;

    const existingAstronaut = await db.get('users', 'astronaut@mangal.in');
    if (existingAstronaut) return;

    const defaultPassword = 'Mangal@123';
    const salt = generateSalt();
    const passwordHash = await hashPassword(defaultPassword, salt);

    for (const email of Object.keys(DEMO_USERS)) {
      const base = DEMO_USERS[email];
      await db.put('users', {
        ...base,
        salt,
        passwordHash,
        createdAt: new Date().toISOString()
      });
    }

    const defaultConsent = {
      astronautEmail: 'astronaut@mangal.in',
      categories: {
        vitals: true,
        mentalHealth: false,
        privateJournal: false,
        location: true,
        radiation: true
      },
      updatedAt: new Date().toISOString()
    };
    await db.put('consent', defaultConsent);
  } catch (err) {
    console.warn('seedDemoAccounts warning:', err);
  }
}
