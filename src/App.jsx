import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import StarfieldBackground from './components/StarfieldBackground';
import SolarFlareModal from './components/SolarFlareModal';
import OnboardingModal from './components/OnboardingModal';
import PinUnlockModal from './pages/PinUnlockModal';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import EmergencyOverrideModal from './components/EmergencyOverrideModal';
import { isSecureContextAvailable } from './utils/webgl';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import LanguageSwitcher from './components/LanguageSwitcher';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DoctorPatientReviewPage from './pages/DoctorPatientReviewPage';
import CommanderOverviewPage from './pages/CommanderOverviewPage';
import MissionControlPage from './pages/MissionControlPage';
import BaselineDriftPage from './pages/BaselineDriftPage';
import MultiHazardRiskPage from './pages/MultiHazardRiskPage';
import BodyScanPage from './pages/BodyScanPage';
import FlightSurgeonPage from './pages/FlightSurgeonPage';
import InventoryPage from './pages/InventoryPage';
import VitalsScanPage from './pages/VitalsScanPage';
import MindCognitionPage from './pages/MindCognitionPage';
import ExercisePage from './pages/ExercisePage';
import RadiationShelterPage from './pages/RadiationShelterPage';
import EarthSyncPage from './pages/EarthSyncPage';
import CrewViewPage from './pages/CrewViewPage';
import AlertsCenterPage from './pages/AlertsCenterPage';
import ConsentCenterPage from './pages/ConsentCenterPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AccessDeniedPage from './pages/AccessDeniedPage';

import { useAuthStore } from './auth/session';
import { useMissionStore } from './store/useMissionStore';
import { getRoleBadgeInfo, getRoleHomeRoute } from './auth/rbac';
import { soundEngine } from './utils/audio';
import {
  AlertTriangle, Moon, Eye, Volume2, VolumeX, Lock, LogOut,
  Menu, Shield, ShieldCheck, HeartPulse
} from 'lucide-react';

// Insecure Context Banner Component
function InsecureContextBanner() {
  const [dismissed, setDismissed] = useState(false);
  const isSecure = isSecureContextAvailable();
  
  if (isSecure || dismissed) return null;

  return (
    <div className="w-full bg-amber-950/90 border-b border-amber-500/60 px-4 py-2 text-center text-xs font-mono text-amber-200 flex flex-wrap items-center justify-center gap-2 z-50 relative">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        <strong>Non-Secure Context Detected.</strong> Open via <code className="bg-space-950 px-1 rounded text-amber-300">localhost</code> or <code className="bg-space-950 px-1 rounded text-amber-300">HTTPS</code> for secure login and camera features. Demo login is available.
      </span>
      <button onClick={() => setDismissed(true)} className="text-amber-400 hover:text-white underline text-[10px] ml-2">Dismiss</button>
    </div>
  );
}

// Slim TopBar (replaces old full Navbar)
function TopBar({ onOpenSidebar, onOpenProfile }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { missionDay, currentVitals, activeEvents, lowGlareMode, tacticalRedMode, soundMuted, toggleLowGlare, toggleTacticalRed, toggleSoundMute, alerts } = useMissionStore();
  const { currentUser, logout, lockTerminal, emergencyOverride } = useAuthStore();
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const roleBadge = getRoleBadgeInfo(currentUser?.role);
  const isFlightSurgeon = currentUser?.role === 'flight_surgeon';

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-mangal-blue/20 bg-space-950/90 backdrop-blur-md">
        <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2">

          {/* Left: Hamburger (mobile) + Mangal Emblem + Sol Chip */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              onClick={onOpenSidebar}
              className="lg:hidden p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white shrink-0"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mission Mangal 2.0 Emblem */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-mangal-blue/30 bg-space-900/80 shrink-0">
              <img
                src="/assets/mission-mangal-logo.png"
                alt="Mission Mangal 2.0"
                className="w-5 h-5 object-contain drop-shadow-[0_0_8px_rgba(46,139,255,0.6)]"
              />
              <span className="font-display font-bold text-[10px] text-white hidden md:inline tracking-wider">
                MANGAL 2.0
              </span>
            </div>

            {/* Sol Day Chip */}
            <div className="bg-space-900 border border-mangal-blue/40 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1 shrink-0">
              <span className="text-slate-400 text-[10px] uppercase">{t('solDay')}</span>
              <span className="font-bold text-white text-xs sm:text-sm">{missionDay}</span>
              <span className="text-slate-500 text-[9px]">/ 180</span>
            </div>

            {/* Health Score Pill */}
            <div className={`cursor-pointer px-2.5 py-1 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors shrink-0 ${
              currentVitals.healthScore >= 80
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : currentVitals.healthScore >= 60
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                : 'bg-red-950/40 border-red-500/50 text-red-300 animate-pulse'
            }`}>
              <span className="text-[9px] hidden sm:inline">{t('healthStatus')}</span>
              <span className="font-bold">{currentVitals.healthScore}%</span>
            </div>
          </div>

          {/* Right Controls: Big "I Need Help" Button + Language Switcher + User */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Big "I Need Help" Emergency Doctor Button */}
            <button
              onClick={() => { soundEngine.playTelemetryPing(); navigate('/surgeon'); }}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse shrink-0 transition-transform active:scale-95"
              title="Talk to AI Doctor Immediately"
            >
              <HeartPulse className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline font-display font-bold uppercase tracking-wider">{t('needHelp')}</span>
            </button>

            {/* Language Switcher in Top Bar */}
            <LanguageSwitcher compact />

            {/* Flight Surgeon Break-Glass */}
            {isFlightSurgeon && (
              <button
                onClick={() => { soundEngine.playClick(); setShowOverrideModal(true); }}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all shrink-0 ${
                  emergencyOverride.active
                    ? 'bg-red-500 text-white animate-pulse border border-red-400'
                    : 'bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/40'
                }`}
                title={t('emergencyOverride')}
              >
                <AlertTriangle className="w-3 h-3" />
                <span className="hidden sm:inline">{emergencyOverride.active ? 'Override Active' : t('emergencyOverride')}</span>
              </button>
            )}

            {/* UI Toggles */}
            <div className="hidden md:flex items-center gap-0.5 bg-space-900/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => { soundEngine.playClick(); toggleLowGlare(); }}
                title={t('lowGlareMode')}
                className={`p-1.5 rounded text-xs ${lowGlareMode ? 'bg-mangal-blue/30 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { soundEngine.playClick(); toggleTacticalRed(); }}
                title={t('tacticalNightMode')}
                className={`p-1.5 rounded text-xs ${tacticalRedMode ? 'bg-red-500/30 text-red-300 ring-1 ring-red-500' : 'text-slate-400 hover:text-white'}`}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleSoundMute}
                title={t('muteAudio')}
                className="p-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* User Badge & Welcome Purpose Line */}
            {currentUser && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => { soundEngine.playClick(); onOpenProfile(); }}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-space-900 border border-slate-700 hover:border-mangal-blue text-xs font-mono transition-colors"
                  title={`${currentUser.name} · ${roleBadge.description}`}
                >
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${roleBadge.color}`}>
                    {t(`role${roleBadge.label}`) || roleBadge.label}
                  </span>
                  <span className="text-white hidden lg:inline text-xs truncate max-w-[90px]">{currentUser.name}</span>
                </button>
                <span className="hidden xl:inline text-[10px] font-mono text-slate-400 border-l border-slate-800 pl-2 max-w-[260px] truncate" title={roleBadge.description}>
                  {roleBadge.description}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Override Modal */}
      <EmergencyOverrideModal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
      />
    </>
  );
}

function AppContent() {
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { initializeAuth, isAuthenticated, isLocked, lockTerminal, currentUser } = useAuthStore();

  // Initialize Firebase Realtime Database Sync
  useEffect(() => {
    useMissionStore.getState().initFirebaseSync();
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // 5-minute inactivity auto-lock
  useEffect(() => {
    let timeout = null;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (isAuthenticated && !isLocked) {
        timeout = setTimeout(() => {
          lockTerminal();
        }, 5 * 60 * 1000);
      }
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated, isLocked, lockTerminal]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const isPublicPage = location.pathname === '/welcome' || location.pathname === '/login';

  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-hidden">
      {/* Insecure Context Warning */}
      <InsecureContextBanner />

      {/* Starfield */}
      {!isPublicPage && <StarfieldBackground />}

      {/* Solar Flare Modal */}
      <SolarFlareModal />

      {/* PIN Unlock Modal */}
      <PinUnlockModal />

      {/* Profile / Baseline Onboarding */}
      <OnboardingModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {isPublicPage ? (
        /* Public pages: no sidebar, no topbar */
        <div className="w-full min-h-screen flex flex-col">
          <ErrorBoundary moduleName="Public Page">
            <Routes>
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage onLoginSuccess={() => {}} />} />
            </Routes>
          </ErrorBoundary>
        </div>
      ) : (
        /* Authenticated layout: sidebar + topbar + main content */
        <div className="flex min-h-screen">
          {/* Sidebar Navigation */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Main Content Area */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
          }`}>
            {/* Top Bar */}
            <TopBar
              onOpenSidebar={() => setSidebarOpen(true)}
              onOpenProfile={() => setProfileModalOpen(true)}
            />

            {/* Scrollable Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 sm:py-6 overflow-x-hidden">
              <ErrorBoundary moduleName="Application">
                <Routes>
                  {/* Root Redirect by Role */}
                  <Route
                    path="/"
                    element={isAuthenticated ? <Navigate to={getRoleHomeRoute(currentUser?.role)} replace /> : <Navigate to="/welcome" replace />}
                  />

                  {/* Role Homepages */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'admin']}>
                      <ErrorBoundary moduleName="Astronaut My Health">
                        <DashboardPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/doctor" element={
                    <ProtectedRoute allowedRoles={['flight_surgeon', 'admin']}>
                      <ErrorBoundary moduleName="Doctor Patient Review">
                        <DoctorPatientReviewPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/commander" element={
                    <ProtectedRoute allowedRoles={['mission_commander', 'admin']}>
                      <ErrorBoundary moduleName="Commander Mission Overview">
                        <CommanderOverviewPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/mission-control" element={
                    <ProtectedRoute>
                      <ErrorBoundary moduleName="Mission Control">
                        <MissionControlPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/alerts" element={
                    <ProtectedRoute>
                      <ErrorBoundary moduleName="Alerts Center">
                        <AlertsCenterPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  {/* Health */}
                  <Route path="/baseline" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'admin']}>
                      <ErrorBoundary moduleName="Health Drift & Baseline">
                        <BaselineDriftPage onOpenCalibration={() => setProfileModalOpen(true)} />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/hazards" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'mission_commander', 'admin']}>
                      <ErrorBoundary moduleName="Multi-Hazard Risk">
                        <MultiHazardRiskPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/body-scan" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'admin']}>
                      <ErrorBoundary moduleName="3D Body Scanner">
                        <BodyScanPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/scan" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'admin']}>
                      <ErrorBoundary moduleName="Contactless Vitals Scan">
                        <VitalsScanPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  {/* Care */}
                  <Route path="/surgeon" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'admin']}>
                      <ErrorBoundary moduleName="AI Flight Surgeon">
                        <FlightSurgeonPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/inventory" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'mission_commander', 'admin']}>
                      <ErrorBoundary moduleName="Medical Kit">
                        <InventoryPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/exercise" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'mission_commander', 'admin']}>
                      <ErrorBoundary moduleName="Exercise Plan">
                        <ExercisePage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/cognition" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'admin']}>
                      <ErrorBoundary moduleName="Mind & Cognition">
                        <MindCognitionPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  {/* Safety */}
                  <Route path="/shelter" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'mission_commander', 'admin']}>
                      <ErrorBoundary moduleName="Radiation Shelter">
                        <RadiationShelterPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  {/* Team */}
                  <Route path="/crew" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'flight_surgeon', 'mission_commander', 'admin']}>
                      <ErrorBoundary moduleName="Crew Telemetry">
                        <CrewViewPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  {/* Comms */}
                  <Route path="/sync" element={
                    <ProtectedRoute>
                      <ErrorBoundary moduleName="Earth Sync">
                        <EarthSyncPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  {/* Security */}
                  <Route path="/consent" element={
                    <ProtectedRoute allowedRoles={['astronaut', 'admin']}>
                      <ErrorBoundary moduleName="Consent Center">
                        <ConsentCenterPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ErrorBoundary moduleName="Admin Panel">
                        <AdminPanelPage />
                      </ErrorBoundary>
                    </ProtectedRoute>
                  } />

                  <Route path="/access-denied" element={<AccessDeniedPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ErrorBoundary>
            </main>

            {/* Global Footer */}
            <footer className="border-t border-slate-900 bg-space-950/80 backdrop-blur text-xs font-mono text-slate-400 py-3 px-4 text-center">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
                <span className="font-display font-semibold text-white">MANGAL HEALTH SENTINEL</span>
                <span className="text-mangal-orange font-bold">Team Mission Mangal 2.0 · Nagpur, India</span>
                <span className="text-slate-500 text-[11px]">NASA Space Apps Challenge Nagpur</span>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary moduleName="Mangal Health Sentinel">
      <LanguageProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
