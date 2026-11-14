import { create } from 'zustand';
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
  // ACTIONS & REDUCERS
  // ----------------------------------------

  // Update Astronaut Profile / Baseline
  updateProfile: (newProfile) => {
    set((state) => ({ profile: { ...state.profile, ...newProfile } }));
  },

  updateBaseline: (newBaseline) => {
    set((state) => {
      const mergedBaseline = { ...state.baseline, ...newBaseline };
      const newVitals = generateVitalsForDay(state.missionDay, mergedBaseline, state.activeEvents);
      return {
        baseline: mergedBaseline,
        currentVitals: newVitals
      };
    });
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
    set((state) => {
      const updated = state.inventory.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.stock - count);
          return {
            ...item,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= item.minThreshold ? 'Low Stock' : 'In Stock'
          };
        }
        return item;
      });
      return { inventory: updated };
    });
  },

  addInventoryItem: (newItem) => {
    set((state) => ({
      inventory: [...state.inventory, { ...newItem, id: `med_${Date.now()}` }]
    }));
  },

  updateInventoryItem: (itemId, updates) => {
    set((state) => ({
      inventory: state.inventory.map((item) => (item.id === itemId ? { ...item, ...updates } : item))
    }));
  },

  // Chat Messages
  addChatMessage: (msg) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, { ...msg, id: `msg_${Date.now()}` }]
    }));
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
    set((state) => ({
      crew: state.crew.map((member) => {
        if (member.id === crewId) {
          return { ...member, currentTask: task, taskRisk };
        }
        return member;
      })
    }));
  },

  // Mind & Cognition Additions
  addPvtResult: (result) => {
    set((state) => ({
      pvtHistory: [
        ...state.pvtHistory,
        { id: Date.now(), day: state.missionDay, ...result }
      ]
    }));
  },

  addJournalEntry: (entry) => {
    set((state) => ({
      journalEntries: [
        {
          id: Date.now(),
          day: state.missionDay,
          timestamp: new Date().toISOString(),
          ...entry
        },
        ...state.journalEntries
      ]
    }));
  },

  setMentalHealthSync: (mode) => set({ mentalHealthGroundSync: mode }),

  // Workout Log
  logWorkout: (workout) => {
    set((state) => ({
      completedWorkouts: [
        {
          id: Date.now(),
          day: state.missionDay,
          ...workout
        },
        ...state.completedWorkouts
      ]
    }));
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
