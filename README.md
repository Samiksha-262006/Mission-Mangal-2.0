![Mission Mangal 2.0 Emblem](/public/assets/mission-mangal-logo.png)

---

## 🌟 Executive Summary

During an interplanetary voyage to Mars (180 days one-way, 3-year total mission duration), crew members endure extreme physiological stressors: microgravity cardiovascular deconditioning, trabecular bone mineral resorption, cephalad fluid shift inducing Spaceflight Associated Neuro-ocular Syndrome (SANS), high-energy cosmic ionizing radiation, and psychological confinement. 

Compounding these perils, electromagnetic communication between Mars and Earth suffers a **20-minute one-way light delay** (up to 44 minutes round-trip) and can be completely severed for weeks during solar conjunction.

**Mangal Health Sentinel**, engineered by **Team Mission Mangal 2.0 (Nagpur, India)**, is a mission-grade, edge-computing physiological monitoring and autonomous clinical decision-support system. Operating **100% locally on spacecraft avionics and portable crew tablets with zero cloud dependencies**, Mangal Health Sentinel couples an autonomous rule-based clinical triage engine, Web Crypto PBKDF2 authentication, and procedural 3D WebGL visualizations with real-time biometric drift detection.

---

## 🎨 Branding & Visual Identity

- **Official Mission Emblem**: Displayed across the 3D cinematic splash, terminal login, HUD header, PWA icons, and exported clinical reports.
- **Color Palette (Derived from Emblem)**:
  - Deep Space Navy (`#070B1F` / `#0A112C`): Spacecraft avionics background
  - Mars Copper / Rust (`#C8693A`, `#E8894F`): Mission accents and primary action vectors
  - Glowing Blue (`#2E8BFF`, `#00C2FF`): HUD telemetry and optical waveforms
  - Sun Gold (`#F2B44C`): Critical benchmarks and helmet visor reflections
  - Status Indicators: Teal (`#10B981`, nominal), Amber (`#F59E0B`, watch), Red (`#EF4444`, critical)
- **Typography**:
  - Headings: **Orbitron** / **Rajdhani** futuristic aerospace display typography
  - Body: **Inter** readable sans-serif, with offline local system fallbacks
- **Footer**: `Team Mission Mangal 2.0 · Nagpur, India` displayed across all views and report headers.

---

## 🏛 System Architecture

```text
Mangal Health Sentinel (Team Mission Mangal 2.0)
│
├── 3D WebGL Procedural Visuals (Three.js)
│   ├── CinematicLandingScene.jsx       # Procedural bump-mapped Mars sphere + Earth + Rocket
│   ├── AstronautBodyScanner3D.jsx      # Low-poly astronaut with 6 pulsing biometrics hotspots
│   ├── SpacecraftModuleMap3D.jsx       # Module cutaway with storm shelter path & screen shake
│   └── MissionTrajectory3D.jsx         # Heliocentric Hohmann transfer orbit with Sol marker
│
├── Security & Access Layer (Web Crypto API + idb)
│   ├── hash.js                         # PBKDF2 100k salted hash + AES-GCM 256-bit journal cipher
│   ├── db.js                           # IndexedDB (users, sessions, consent, audit_logs)
│   ├── session.js                      # 5-min inactivity lock, 5-attempt lockout, token management
│   ├── rbac.js                         # 4-role permissions matrix & Route Guards
│   ├── consent.js                      # Astronaut-governed data-access enforcement
│   └── audit.js                        # Immutable security and access event ledger
│
├── Physiological & Autonomous Engines
│   ├── simulator.js                    # Microgravity adaptation equations (Day 1-180)
│   ├── anomaly.js                      # Z-score (|Z| >= 1.8σ) personal baseline drift engine
│   ├── triage.js                       # 10 rule-based spaceflight protocols + Web Speech API
│   ├── rppg.js                         # Webcam remote photoplethysmography (forehead ROI)
│   └── audio.js                        # Web Audio API alert sirens, heartbeats, and pings
│
└── User Interface HUD
    ├── Navbar.jsx                      # Mission status, role badge, break-glass trigger, PIN lock
    ├── MissionSimulatorBar.jsx         # Day slider, 1x/5x/15x speeds, 3D orbit toggle, event triggers
    ├── RadialHealthGauge.jsx           # 0-100 score arc with "Why this score?" breakdown
    ├── DashboardPage.jsx               # 7 live sparkline cards + 3D Body Scanner
    ├── SolarFlareModal.jsx             # SPE red alert vignette + 3D module shelter map
    └── PinUnlockModal.jsx              # Glove-friendly quick numeric unlock
