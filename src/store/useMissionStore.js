import { create } from 'zustand';
import { ref, set as fbSet, get as fbGet, onValue } from 'firebase/database';
import { db } from '../firebase';
import { clean, toList, safeId, toObjectMap } from '../utils/firebaseHelpers';
import { generateVitalsForDay } from '../utils/simulator';
import defaultInventory from '../data/inventory.json';
import defaultCrew from '../data/crew.json';
import { soundEngine } from '../utils/audio';

const STORAGE_KEY = 'astromed_sentinel_state_v1';

// Default pre-flight baseline
const DEFAULT_BASELINE = {
  heartRate: 58,
  systolic: 115,
  diastolic: 75,
  spO2: 99,
  bodyTemp: 36.6,
  hydration: 78,
  boneDensity: 100,
  vo2Max: 52
};

// Module-level guard to ensure Firebase sync runs only once
let isFirebaseSyncInitialized = false;

// Helper to sync list-based collections (stored in Firebase as objects keyed by ID)
const syncListCollection = async (collectionPath, defaultItems, sortFn, onUpdate) => {
  try {
    const colRef = ref(db, collectionPath);
    try {
      const snap = await fbGet(colRef);
      if (!snap.exists() || snap.val() === null) {
        const initialMap = toObjectMap(defaultItems);
        await fbSet(colRef, clean(initialMap));
      }
    } catch (seedErr) {
      console.error(`Firebase sync failed (${collectionPath} seeding):`, seedErr);
    }

    onValue(
      colRef,
      (snap) => {
        try {
          const val = snap.val();
          if (val === null || val === undefined) {
            // Keep default data if null
            return;
          }
          let list = toList(val);
          if (sortFn) {
            list = sortFn(list);
          }
          if (list) {
            onUpdate(list);
          }
        } catch (err) {
          console.error(`Firebase sync failed (${collectionPath} onValue):`, err);
        }
      },
      (subErr) => {
        console.error(`Firebase sync failed (${collectionPath} subscription):`, subErr);
      }
    );
  } catch (err) {
    console.error(`Firebase sync failed (${collectionPath} setup):`, err);
  }
};

// Helper to sync single object collections (profile, baseline)
const syncObjectCollection = async (path, defaultData, onUpdate) => {
  try {
    const objRef = ref(db, path);
    try {
      const snap = await fbGet(objRef);
      if (!snap.exists() || snap.val() === null) {
        await fbSet(objRef, clean(defaultData));
      }
    } catch (seedErr) {
      console.error(`Firebase sync failed (${path} seeding):`, seedErr);
    }

    onValue(
      objRef,
      (snap) => {
        try {
          const val = snap.val();
          if (val === null || val === undefined) {
            return;
          }
          onUpdate(val);
        } catch (err) {
          console.error(`Firebase sync failed (${path} onValue):`, err);
        }
      },
      (subErr) => {
        console.error(`Firebase sync failed (${path} subscription):`, subErr);
      }
    );
  } catch (err) {
    console.error(`Firebase sync failed (${path} setup):`, err);
  }
};

export const useMissionStore = create((set, get) => ({
  // Astronaut Profile
  profile: {
    name: 'Cmdr. Sarah Chen',
    role: 'Mission Commander',
    callsign: 'Ares-Lead',
    age: 42,
    bloodType: 'O-Negative',
    missionName: 'Ares V - Mars Transit',
    onboarded: true
  },
  baseline: DEFAULT_BASELINE,

  // Simulator State
  missionDay: 42,
  isPlaying: false,
  playSpeed: 1, // 1x, 5x, 15x
  activeEvents: {
    solarFlare: false,
    chestPain: false,
    commBlackout: false,
    crewConflict: false
  },
  solarFlareTimer: 0,
  stormShelterEvacuated: false,

  // UI Modes
  lowGlareMode: false,
  tacticalRedMode: false,
  soundMuted: false,

  // Dynamic Biometrics
  currentVitals: generateVitalsForDay(42, DEFAULT_BASELINE, {}),
  vitalsHistory: Array.from({ length: 42 }, (_, i) => generateVitalsForDay(i + 1, DEFAULT_BASELINE, {})),

  // Medical Inventory
  inventory: defaultInventory,

  // Crew Telemetry
  crew: defaultCrew,

  // AI Flight Surgeon Chat History
  chatMessages: [
    {
      id: 'welcome_msg',
      sender: 'ai',
      text: 'AstroMed Sentinel Flight Surgeon operational. Local bio-sensors synchronized. Report symptoms anytime via voice or text.',
      timestamp: 'Day 42 - 08:00 UTC'
    }
  ],

  // Earth Sync & DTN Telemetry Queue
  commStatus: 'ONLINE', // 'ONLINE' | 'BLACKOUT' | 'TRANSMITTING'
  packetQueue: [
    {
      id: 'pkt_1042',
      priority: 'ROUTINE',
      type: 'Daily Biometric Summary',
      queuedAt: 'Day 42 - 07:45 UTC',
      size: '142 KB',
      status: 'QUEUED'
    },
    {
      id: 'pkt_1041',
      priority: 'HIGH',
      type: 'Optical Retinal SANS Scan',
      queuedAt: 'Day 41 - 22:15 UTC',
      size: '14.8 MB',
      status: 'QUEUED'
    }
  ],
  syncLogs: [
    { id: 1, timestamp: 'Day 41 - 12:00 UTC', message: 'Ground telemetry burst received. Link delay: 19.8 min.', type: 'info' }
  ],

  // Cognitive & Mental Health State
  pvtHistory: [
    { id: 1, day: 38, meanRt: 248, lapses: 0, score: 95 },
    { id: 2, day: 40, meanRt: 262, lapses: 1, score: 91 },
    { id: 3, day: 42, meanRt: 279, lapses: 2, score: 86 }
  ],
  journalEntries: [
    {
      id: 1,
      day: 41,
      mood: 'Focused',
      valence: 4,
      arousal: 3,
      note: 'Deep space silence is profound. Earth is now a bright blue star behind us. Minor lower back soreness during ARED deadlifts.',
      isPrivate: true,
      timestamp: '2026-11-13T20:30:00Z'
    }
  ],
  mentalHealthGroundSync: 'anonymized', // 'private' | 'anonymized' | 'telemetry'

  // Exercise Prescriptions & Log
  completedWorkouts: [
    { id: 1, day: 40, type: 'ARED Heavy Resistance', duration: 45, adherence: 100, calories: 420 },
    { id: 2, day: 41, type: 'T2 Treadmill Interval', duration: 35, adherence: 95, calories: 380 }
  ],

  // Active System Alerts
  alerts: [
    {
      id: 'alert_sans_monitor',
      severity: 'warning',
      title: 'Cephalad Fluid Shift Alert',
      category: 'Neuro-Ocular',
      timestamp: 'Day 42 - 06:30 UTC',
      details: 'Cephalic redistribution index +1.64. Early choroidal fold risk. Perform daily visual acuity testing.',
      actionLabel: 'View Protocol'
    }
  ],

  // ----------------------------------------
  // FIREBASE INITIALIZATION ACTION
  // ----------------------------------------
  initFirebaseSync: () => {
    if (isFirebaseSyncInitialized) return;
    isFirebaseSyncInitialized = true;

    const state = get();

    // 1. inventory -> "inventory/<id>"
    syncListCollection(
      'inventory',
      defaultInventory,
      (items) => {
        const orderMap = new Map(defaultInventory.map((item, idx) => [item.id, idx]));
        return items.sort((a, b) => {
          const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
          const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
          if (idxA !== idxB) return idxA - idxB;
          return (a.name || '').localeCompare(b.name || '');
        });
      },
      (inventory) => set({ inventory })
    );

    // 2. crew -> "crew/<id>"
    syncListCollection(
      'crew',
      defaultCrew,
      (items) => {
        const orderMap = new Map(defaultCrew.map((item, idx) => [item.id, idx]));
        return items.sort((a, b) => {
          const idxA = orderMap.has(a.id) ? orderMap.get(a.id) : 9999;
          const idxB = orderMap.has(b.id) ? orderMap.get(b.id) : 9999;
          return idxA - idxB;
        });
      },
      (crew) => set({ crew })
    );

    // 3. journalEntries -> "journalEntries/<id>"
    syncListCollection(
      'journalEntries',
      state.journalEntries,
      (items) => {
        return items.sort((a, b) => {
          const tA = new Date(a.timestamp || 0).getTime() || Number(a.id) || 0;
          const tB = new Date(b.timestamp || 0).getTime() || Number(b.id) || 0;
          return tB - tA; // Newest first
        });
      },
      (journalEntries) => set({ journalEntries })
    );

    // 4. pvtHistory -> "pvtHistory/<id>"
    syncListCollection(
      'pvtHistory',
      state.pvtHistory,
      (items) => {
        return items.sort((a, b) => {
          const dA = Number(a.day) || Number(a.id) || 0;
          const dB = Number(b.day) || Number(b.id) || 0;
          return dA - dB;
        });
      },
      (pvtHistory) => set({ pvtHistory })
    );

    // 5. completedWorkouts -> "completedWorkouts/<id>"
    syncListCollection(
      'completedWorkouts',
      state.completedWorkouts,
      (items) => {
        return items.sort((a, b) => {
          const idA = Number(a.id) || (a.day ? a.day * 100 : 0);
          const idB = Number(b.day) || (b.day ? b.day * 100 : 0);
          return idB - idA; // Newest first
        });
      },
      (completedWorkouts) => set({ completedWorkouts })
    );

    // 6. chatMessages -> "chatMessages/<id>"
    syncListCollection(
      'chatMessages',
      state.chatMessages,
      (items) => {
        return items.sort((a, b) => {
          if (a.id === 'welcome_msg') return -1;
          if (b.id === 'welcome_msg') return 1;
          return String(a.id).localeCompare(String(b.id));
        });
      },
      (chatMessages) => set({ chatMessages })
    );

    // 7. profile -> "profile"
    syncObjectCollection(
      'profile',
      state.profile,
      (profile) => set({ profile })
    );

    // 8. baseline -> "baseline"
    syncObjectCollection(
      'baseline',
      state.baseline,
      (baseline) => set((s) => ({
        baseline,
        currentVitals: generateVitalsForDay(s.missionDay, baseline, s.activeEvents)
      }))
    );
  },

  // ----------------------------------------
  // ACTIONS & REDUCERS
  // ----------------------------------------

  // Update Astronaut Profile / Baseline
  updateProfile: (newProfile) => {
    let mergedProfile = null;
    set((state) => {
      mergedProfile = { ...state.profile, ...newProfile };
      return { profile: mergedProfile };
    });
    if (mergedProfile) {
      try {
        fbSet(ref(db, 'profile'), clean(mergedProfile)).catch((err) => {
          console.error('Firebase sync failed (updateProfile):', err);
        });
      } catch (err) {
        console.error('Firebase sync failed (updateProfile):', err);
      }
    }
  },

  updateBaseline: (newBaseline) => {
    let mergedBaseline = null;
    set((state) => {
      mergedBaseline = { ...state.baseline, ...newBaseline };
      const newVitals = generateVitalsForDay(state.missionDay, mergedBaseline, state.activeEvents);
      return {
        baseline: mergedBaseline,
        currentVitals: newVitals
      };
    });
    if (mergedBaseline) {
      try {
        fbSet(ref(db, 'baseline'), clean(mergedBaseline)).catch((err) => {
          console.error('Firebase sync failed (updateBaseline):', err);
        });
      } catch (err) {
        console.error('Firebase sync failed (updateBaseline):', err);
      }
    }
  },

  // Mission Day Stepper / Timeline
  setMissionDay: (day) => {
    const safeDay = Math.max(1, Math.min(180, Math.round(day)));
    const { baseline, activeEvents } = get();
    const newVitals = generateVitalsForDay(safeDay, baseline, activeEvents);

    // Update history up to current day
    const updatedHistory = Array.from({ length: safeDay }, (_, i) =>
      generateVitalsForDay(i + 1, baseline, activeEvents)
    );

    set({
      missionDay: safeDay,
      currentVitals: newVitals,
      vitalsHistory: updatedHistory
    });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPlaySpeed: (playSpeed) => set({ playSpeed }),

  advanceSimulationTick: () => {
    const { missionDay, baseline, activeEvents, isPlaying } = get();
    if (!isPlaying) return;

    if (missionDay >= 180) {
      set({ isPlaying: false });
      return;
    }

    const nextDay = missionDay + 1;
    const nextVitals = generateVitalsForDay(nextDay, baseline, activeEvents);
    set((state) => ({
      missionDay: nextDay,
      currentVitals: nextVitals,
      vitalsHistory: [...state.vitalsHistory, nextVitals]
    }));
  },

  // Trigger Events
  toggleTriggerEvent: (eventType) => {
    const { activeEvents, baseline, missionDay } = get();
    const currentVal = !!activeEvents[eventType];
    const updatedEvents = { ...activeEvents, [eventType]: !currentVal };

    // Handle audio / special side effects
    if (!currentVal) {
      soundEngine.playWarningChime();
      if (eventType === 'solarFlare' || eventType === 'chestPain') {
        soundEngine.playCriticalAlarm();
      }
    }

    // Set countdown if solar flare triggered
    let flareTimer = get().solarFlareTimer;
    if (eventType === 'solarFlare') {
      flareTimer = !currentVal ? 1080 : 0; // 18 minutes warning countdown
    }

    const newVitals = generateVitalsForDay(missionDay, baseline, updatedEvents);

    // If comm blackout triggered, update commStatus
    let commStatus = get().commStatus;
    if (eventType === 'commBlackout') {
      commStatus = !currentVal ? 'BLACKOUT' : 'ONLINE';
    }

    // Add alert notification
    const alerts = [...get().alerts];
    if (!currentVal) {
      if (eventType === 'solarFlare') {
        alerts.unshift({
          id: `alert_flare_${Date.now()}`,
          severity: 'critical',
          title: 'SOLAR PARTICLE EVENT (SPE) IN PROGRESS',
          category: 'Radiation Hazard',
          timestamp: `Day ${missionDay} - Active`,
          details: 'Coronal Mass Ejection proton storm inbound. Immediate evacuation to Storm Shelter (Module 04) required.',
          actionLabel: 'Evacuate Module'
        });
      } else if (eventType === 'chestPain') {
        alerts.unshift({
          id: `alert_chest_${Date.now()}`,
          severity: 'critical',
          title: 'ACUTE CHEST PAIN EMERGENCY',
          category: 'Cardiovascular',
          timestamp: `Day ${missionDay} - Active`,
          details: 'Severe precordial discomfort with tachyarrhythmia. Vital signs critical. Review Protocol CP-01 immediately.',
          actionLabel: 'Launch Triage'
        });
      } else if (eventType === 'commBlackout') {
        alerts.unshift({
          id: `alert_comm_${Date.now()}`,
          severity: 'warning',
          title: 'COMMUNICATION LINK OCCULTATION',
          category: 'Deep Space DTN',
          timestamp: `Day ${missionDay} - Active`,
          details: 'Solar conjunction blackout. Ground uplink severed. All telemetry packets cached locally in DTN buffer.',
          actionLabel: 'View Queue'
        });
      } else if (eventType === 'crewConflict') {
        alerts.unshift({
          id: `alert_crew_${Date.now()}`,
          severity: 'warning',
          title: 'INTERPERSONAL STRESS SPIKE',
          category: 'Behavioral Health',
          timestamp: `Day ${missionDay} - Active`,
          details: 'Autonomous conflict detected during EVA mission prep. Crew stress index > 80%. Workload pacing recommended.',
          actionLabel: 'Crew View'
        });
      }
    }

    set({
      activeEvents: updatedEvents,
      currentVitals: newVitals,
      solarFlareTimer: flareTimer,
      commStatus,
      alerts
    });
  },

  setStormShelterEvacuated: (evacuated) => {
    set((state) => {
      // If evacuated into storm shelter, reduce radiation dose rate by 92%
      const newVitals = { ...state.currentVitals };
      if (evacuated && state.activeEvents.solarFlare) {
        newVitals.radiationDoseRate = 180.0; // Heavily attenuated by water shield
      }
      return {
        stormShelterEvacuated: evacuated,
        currentVitals: newVitals
      };
    });
  },

  // UI Modes
  toggleLowGlare: () => {
    const next = !get().lowGlareMode;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('mode-low-glare', next);
    }
    set({ lowGlareMode: next });
  },

  toggleTacticalRed: () => {
    const next = !get().tacticalRedMode;
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('mode-tactical', next);
    }
    set({ tacticalRedMode: next });
  },

  toggleSoundMute: () => {
    const next = !get().soundMuted;
    soundEngine.setMuted(next);
    set({ soundMuted: next });
  },

  // Medical Kit CRUD Actions
  consumeInventoryItem: (itemId, count = 1) => {
    let targetItem = null;
    set((state) => {
      const updated = state.inventory.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stock - count);
          targetItem = {
            ...item,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= item.minThreshold ? 'Low Stock' : 'In Stock'
          };
          return targetItem;
        }
        return item;
      });
      return { inventory: updated };
    });

    if (targetItem) {
      try {
        const key = safeId(targetItem.id);
        fbSet(ref(db, `inventory/${key}`), clean(targetItem)).catch((err) => {
          console.error('Firebase sync failed (consumeInventoryItem):', err);
        });
      } catch (err) {
        console.error('Firebase sync failed (consumeInventoryItem):', err);
      }
    }
  },

  addInventoryItem: (newItem) => {
    const itemWithId = { ...newItem, id: newItem.id || `med_${Date.now()}` };
    set((state) => ({
      inventory: [...state.inventory, itemWithId]
    }));
    try {
      const key = safeId(itemWithId.id);
      fbSet(ref(db, `inventory/${key}`), clean(itemWithId)).catch((err) => {
        console.error('Firebase sync failed (addInventoryItem):', err);
      });
    } catch (err) {
      console.error('Firebase sync failed (addInventoryItem):', err);
    }
  },

  updateInventoryItem: (itemId, updates) => {
    let targetItem = null;
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.id === itemId) {
          targetItem = { ...item, ...updates };
          return targetItem;
        }
        return item;
      })
    }));
    if (targetItem) {
      try {
        const key = safeId(targetItem.id);
        fbSet(ref(db, `inventory/${key}`), clean(targetItem)).catch((err) => {
          console.error('Firebase sync failed (updateInventoryItem):', err);
        });
      } catch (err) {
        console.error('Firebase sync failed (updateInventoryItem):', err);
      }
    }
  },

  // Chat Messages
  addChatMessage: (msg) => {
    const newMsg = {
      ...msg,
      id: msg.id || `msg_${Date.now()}`
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMsg]
    }));
    try {
      const key = safeId(newMsg.id);
      fbSet(ref(db, `chatMessages/${key}`), clean(newMsg)).catch((err) => {
        console.error('Firebase sync failed (addChatMessage):', err);
      });
    } catch (err) {
      console.error('Firebase sync failed (addChatMessage):', err);
    }
  },

  // DTN & Earth Sync
  queuePacket: (packet) => {
    set((state) => ({
      packetQueue: [
        {
          id: `pkt_${Date.now()}`,
          queuedAt: `Day ${state.missionDay} - ${new Date().toLocaleTimeString()}`,
          status: 'QUEUED',
          ...packet
        },
        ...state.packetQueue
      ]
    }));
  },

  transmitSummary: () => {
    const { commStatus } = get();
    if (commStatus === 'BLACKOUT') {
      soundEngine.playWarningChime();
      return false;
    }

    soundEngine.playTelemetryPing();
    set({ commStatus: 'TRANSMITTING' });

    setTimeout(() => {
      set((state) => {
        const updatedQueue = state.packetQueue.map((p) => ({ ...p, status: 'DELIVERED' }));
        return {
          commStatus: 'ONLINE',
          packetQueue: updatedQueue,
          syncLogs: [
            {
              id: Date.now(),
              timestamp: `Day ${state.missionDay} - ${new Date().toLocaleTimeString()} UTC`,
              message: `Telemetry bundle synced to Houston Ground Station. 20-min delay relay acknowledged.`,
              type: 'success'
            },
            ...state.syncLogs
          ]
        };
      });
    }, 2500);

    return true;
  },

  // Crew Task Assignment
  assignCrewTask: (crewId, task, taskRisk) => {
    let targetMember = null;
    set((state) => ({
      crew: state.crew.map((member) => {
        if (member.id === crewId) {
          targetMember = { ...member, currentTask: task, taskRisk };
          return targetMember;
        }
        return member;
      })
    }));
    if (targetMember) {
      try {
        const key = safeId(targetMember.id);
        fbSet(ref(db, `crew/${key}`), clean(targetMember)).catch((err) => {
          console.error('Firebase sync failed (assignCrewTask):', err);
        });
      } catch (err) {
        console.error('Firebase sync failed (assignCrewTask):', err);
      }
    }
  },

  // Mind & Cognition Additions
  addPvtResult: (result) => {
    const newPvt = {
      id: Date.now(),
      day: get().missionDay,
      ...result
    };
    set((state) => ({
      pvtHistory: [...state.pvtHistory, newPvt]
    }));
    try {
      const key = safeId(newPvt.id);
      fbSet(ref(db, `pvtHistory/${key}`), clean(newPvt)).catch((err) => {
        console.error('Firebase sync failed (addPvtResult):', err);
      });
    } catch (err) {
      console.error('Firebase sync failed (addPvtResult):', err);
    }
  },

  addJournalEntry: (entry) => {
    const newEntry = {
      id: Date.now(),
      day: get().missionDay,
      timestamp: new Date().toISOString(),
      ...entry
    };
    set((state) => ({
      journalEntries: [newEntry, ...state.journalEntries]
    }));
    try {
      const key = safeId(newEntry.id);
      fbSet(ref(db, `journalEntries/${key}`), clean(newEntry)).catch((err) => {
        console.error('Firebase sync failed (addJournalEntry):', err);
      });
    } catch (err) {
      console.error('Firebase sync failed (addJournalEntry):', err);
    }
  },

  setMentalHealthSync: (mode) => set({ mentalHealthGroundSync: mode }),

  // Workout Log
  logWorkout: (workout) => {
    const newWorkout = {
      id: Date.now(),
      day: get().missionDay,
      ...workout
    };
    set((state) => ({
      completedWorkouts: [newWorkout, ...state.completedWorkouts]
    }));
    try {
      const key = safeId(newWorkout.id);
      fbSet(ref(db, `completedWorkouts/${key}`), clean(newWorkout)).catch((err) => {
        console.error('Firebase sync failed (logWorkout):', err);
      });
    } catch (err) {
      console.error('Firebase sync failed (logWorkout):', err);
    }
  },

  // Dismiss Alert
  dismissAlert: (alertId) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== alertId)
    }));
  },

  // Update Biometric Measurement (from rPPG or simulation)
  updateVitalsMeasurement: ({ heartRate, source, confidence }) => {
    set((state) => {
      const updatedVitals = {
        ...state.currentVitals,
        heartRate: heartRate || state.currentVitals.heartRate,
        measurementSource: source || 'simulated',
        measurementConfidence: confidence || 'Medium',
        lastMeasuredAt: `Day ${state.missionDay} - ${new Date().toLocaleTimeString()}`
      };
      return { currentVitals: updatedVitals };
    });
  }
}));
