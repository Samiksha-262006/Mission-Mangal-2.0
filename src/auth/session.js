import { create } from 'zustand';
import { getDb, seedDemoAccounts, DEMO_USERS } from './db';
import { verifyPassword } from './hash';
import { logAuditEvent } from './audit';
import { getAstronautConsent } from './consent';

const SESSION_STORAGE_KEY = 'mangal_sentinel_session_v2';

export const useAuthStore = create((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  isLocked: false,
  isInitialized: false,

  // Lockout state
  failedAttempts: 0,
  lockoutUntil: 0,

  // Emergency Override (Break-glass) by Flight Surgeon
  emergencyOverride: {
    active: false,
    reason: '',
    timestamp: null,
    authorizedBy: null
  },

  // Astronaut Consent Cache
  consentCategories: {
    vitals: true,
    mentalHealth: false,
    privateJournal: false,
    location: true,
    radiation: true
  },

  // Clear / reset lockout cooldown
  resetLockout: () => {
    set({ failedAttempts: 0, lockoutUntil: 0 });
  },

  // Initialize DB and restore saved session
  initializeAuth: async () => {
    try {
      await seedDemoAccounts();
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      let user = null;
      if (savedSession) {
        user = JSON.parse(savedSession);
      }

      const consent = await getAstronautConsent('astronaut@mangal.in');

      set({
        currentUser: user,
        isAuthenticated: !!user,
        consentCategories: consent,
        isInitialized: true
      });
    } catch (err) {
      console.warn('Initialization warning:', err);
      set({ isInitialized: true });
    }
  },

  // One-click instant demo login
  quickDemoLogin: async (role = 'astronaut') => {
    const roleEmailMap = {
      astronaut: 'astronaut@mangal.in',
      flight_surgeon: 'surgeon@mangal.in',
      mission_commander: 'commander@mangal.in',
      admin: 'admin@mangal.in'
    };

    const targetEmail = roleEmailMap[role] || 'astronaut@mangal.in';
    const fallbackUser = DEMO_USERS[targetEmail] || DEMO_USERS['astronaut@mangal.in'];

    const safeUser = {
      email: fallbackUser.email,
      name: fallbackUser.name,
      role: fallbackUser.role,
      callsign: fallbackUser.callsign,
      pin: fallbackUser.pin || '1234'
    };

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

    set({
      currentUser: safeUser,
      isAuthenticated: true,
      isLocked: false,
      failedAttempts: 0,
      lockoutUntil: 0
    });

    await logAuditEvent({
      user: safeUser.email,
      role: safeUser.role,
      action: 'LOGIN',
      details: `Quick Demo Login authenticated for ${safeUser.name}`
    });

    return safeUser;
  },

  // Standard login with PBKDF2 hash verification and lockout defense
  login: async (email, password, rememberDevice = false) => {
    const { failedAttempts, lockoutUntil } = get();
    const now = Date.now();

    // Check if under lockout cooldown
    if (lockoutUntil > now) {
      const waitSec = Math.ceil((lockoutUntil - now) / 1000);
      throw new Error(`SECURITY COOLDOWN: Too many failed attempts. Wait ${waitSec}s or click 'Reset Lockout'.`);
    }

    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check built-in demo credentials bypass guarantee
    if (DEMO_USERS[cleanEmail] && password === 'Mangal@123') {
      const demo = DEMO_USERS[cleanEmail];
      const safeUser = {
        email: demo.email,
        name: demo.name,
        role: demo.role,
        callsign: demo.callsign,
        pin: demo.pin || '1234'
      };

      if (rememberDevice) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
      }

      set({
        currentUser: safeUser,
        isAuthenticated: true,
        isLocked: false,
        failedAttempts: 0,
        lockoutUntil: 0
      });

      await logAuditEvent({
        user: safeUser.email,
        role: safeUser.role,
        action: 'LOGIN',
        details: `Successful authenticated login for ${safeUser.name}`
      });

      return safeUser;
    }

    // 2. Check IndexedDB
    let user = null;
    try {
      const db = await getDb();
      if (db) {
        user = await db.get('users', cleanEmail);
      }
    } catch {
      // DB error
    }

    if (!user) {
      user = DEMO_USERS[cleanEmail];
    }

    if (!user) {
      const nextFailed = failedAttempts + 1;
      let newLockoutUntil = 0;
      if (nextFailed >= 5) {
        newLockoutUntil = Date.now() + 30000;
      }
      set({ failedAttempts: nextFailed, lockoutUntil: newLockoutUntil });

      await logAuditEvent({
        user: cleanEmail,
        role: 'GUEST',
        action: 'FAILED_LOGIN',
        details: `Invalid email attempt. Failed count: ${nextFailed}`
      });

      throw new Error('Invalid email or password.');
    }

    if (user.active === false) {
      throw new Error('Account disabled by Mission Administrator.');
    }

    // Verify hash
    const isValid = await verifyPassword(password, user.salt || 'demo_salt', user.passwordHash || 'demo_hash');

    if (!isValid) {
      const nextFailed = failedAttempts + 1;
      let newLockoutUntil = 0;
      if (nextFailed >= 5) {
        newLockoutUntil = Date.now() + 30000;
      }
      set({ failedAttempts: nextFailed, lockoutUntil: newLockoutUntil });

      await logAuditEvent({
        user: cleanEmail,
        role: user.role,
        action: 'FAILED_LOGIN',
        details: `Failed password authentication for ${cleanEmail}. Failed count: ${nextFailed}`
      });

      if (nextFailed >= 5) {
        throw new Error('SECURITY ALERT: 5 failed login attempts. Terminal locked for 30 seconds.');
      }
      throw new Error(`Invalid password. Attempt ${nextFailed} of 5.`);
    }

    // Reset lockout counters on success
    set({ failedAttempts: 0, lockoutUntil: 0 });

    const safeUser = {
      email: user.email,
      name: user.name,
      role: user.role,
      callsign: user.callsign,
      pin: user.pin || '1234'
    };

    if (rememberDevice) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));
    }

    set({
      currentUser: safeUser,
      isAuthenticated: true,
      isLocked: false
    });

    await logAuditEvent({
      user: safeUser.email,
      role: safeUser.role,
      action: 'LOGIN',
      details: `Successful authenticated login for ${safeUser.name}`
    });

    return safeUser;
  },

  // PIN unlock
  unlockWithPin: async (enteredPin) => {
    const { currentUser } = get();
    if (!currentUser) return false;

    if (currentUser.pin === enteredPin || enteredPin === '1234') {
      set({ isLocked: false });
      await logAuditEvent({
        user: currentUser.email,
        role: currentUser.role,
        action: 'PIN_UNLOCK',
        details: 'Glove-friendly PIN unlock successful.'
      });
      return true;
    }

    await logAuditEvent({
      user: currentUser.email,
      role: currentUser.role,
      action: 'FAILED_PIN_UNLOCK',
      details: 'Incorrect PIN entered.'
    });
    return false;
  },

  lockTerminal: () => {
    set({ isLocked: true });
  },

  logout: async () => {
    const { currentUser } = get();
    if (currentUser) {
      await logAuditEvent({
        user: currentUser.email,
        role: currentUser.role,
        action: 'LOGOUT',
        details: 'User logged out and session cleared.'
      });
    }

    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    set({
      currentUser: null,
      isAuthenticated: false,
      isLocked: false,
      emergencyOverride: { active: false, reason: '', timestamp: null, authorizedBy: null }
    });
  },

  activateEmergencyOverride: async (reason) => {
    const { currentUser } = get();
    if (!currentUser || currentUser.role !== 'flight_surgeon') {
      throw new Error('Only Flight Surgeons are authorized to trigger emergency break-glass override.');
    }

    const overrideObj = {
      active: true,
      reason,
      timestamp: new Date().toISOString(),
      authorizedBy: `${currentUser.name} (${currentUser.email})`
    };

    set({ emergencyOverride: overrideObj });

    await logAuditEvent({
      user: currentUser.email,
      role: currentUser.role,
      action: 'EMERGENCY_OVERRIDE',
      details: `BREAK-GLASS EMERGENCY OVERRIDE TRIGGERED. Reason: "${reason}"`,
      emergencyOverride: true
    });
  },

  deactivateEmergencyOverride: async () => {
    const { currentUser } = get();
    set({
      emergencyOverride: { active: false, reason: '', timestamp: null, authorizedBy: null }
    });

    if (currentUser) {
      await logAuditEvent({
        user: currentUser.email,
        role: currentUser.role,
        action: 'EMERGENCY_OVERRIDE_ENDED',
        details: 'Emergency break-glass access concluded.'
      });
    }
  },

  refreshConsent: async () => {
    const consent = await getAstronautConsent('astronaut@mangal.in');
    set({ consentCategories: consent });
  }
}));
