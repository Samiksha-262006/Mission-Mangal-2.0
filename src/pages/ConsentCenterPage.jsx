import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, Unlock, Eye, EyeOff, AlertTriangle, 
  CheckCircle2, Save, Radio, Heart, Brain, FileText, MapPin, Sun 
} from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { updateAstronautConsent, getAstronautConsent } from '../auth/consent';
import { soundEngine } from '../utils/audio';

export default function ConsentCenterPage() {
  const { currentUser, emergencyOverride, refreshConsent } = useAuthStore();

  const [consentState, setConsentState] = useState({
    vitals: true,
    mentalHealth: false,
    privateJournal: false,
    location: true,
    radiation: true
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const c = await getAstronautConsent('astronaut@mangal.in');
      setConsentState(c);
    }
    load();
  }, []);

  const handleToggle = (key) => {
    soundEngine.playClick();
    setConsentState((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    soundEngine.playClick();
    try {
      await updateAstronautConsent('astronaut@mangal.in', consentState, currentUser);
      await refreshConsent();
      soundEngine.playTelemetryPing();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Failed to update consent policies.');
    } finally {
      setIsSaving(false);
    }
  };

  const consentItems = [
    {
      key: 'vitals',
      icon: Heart,
      title: 'Routine Biometrics & Vitals',
      desc: 'Real-time heart rate, blood pressure, SpO2, core body temperature, and fluid shift index.',
      allowedByDefault: true,
      roleAudience: 'Flight Surgeon & Ground Medical Telemetry'
    },
    {
      key: 'mentalHealth',
      icon: Brain,
      title: 'Cognitive & Behavioral Telemetry',
      desc: 'Psychomotor Vigilance Test (PVT) attentional lapses, circumplex mood valence, and stress scores.',
      allowedByDefault: false,
      roleAudience: 'Requires explicit astronaut consent or Emergency Override'
    },
    {
      key: 'privateJournal',
      icon: FileText,
      title: 'Private Encrypted Astronaut Journal',
      desc: 'Subjective personal reflections, sleep notes, and interpersonal observations encrypted at rest.',
      allowedByDefault: false,
      roleAudience: 'Strictly restricted; encrypted with astronaut AES-GCM key'
    },
    {
      key: 'location',
      icon: MapPin,
      title: 'Spacecraft Module Positioning',
      desc: 'Real-time astronaut compartment presence within the spacecraft transit modules.',
      allowedByDefault: true,
      roleAudience: 'Mission Commander & Flight Dynamics'
    },
    {
      key: 'radiation',
      icon: Sun,
      title: 'Cumulative Dosimetry Exposure',
      desc: 'Operational dosimeter readings (RAD-DOS) and acute SPE proton flux exposure counters.',
      allowedByDefault: true,
      roleAudience: 'Flight Surgeon & Space Radiation Safety'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-mangal-blue/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-mangal-blue" />
            <h2 className="font-display font-bold text-xl text-white">Astronaut Privacy & Consent Center</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-mangal-copper/20 text-mangal-orange border border-mangal-copper/40">
              DATA-LAYER ENFORCEMENT
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Granular autonomy controls allowing astronauts to specify which medical and behavioral telemetry categories Ground Control and Crew can access.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-mangal-copper to-mangal-orange hover:from-mangal-orange hover:to-mangal-gold text-white font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(200,105,58,0.4)] transition-all shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Enforcing...' : 'Save Consent Matrix'}</span>
        </button>
      </div>

      {/* Emergency Override Banner (If triggered by Flight Surgeon) */}
      {emergencyOverride.active && (
        <div className="p-4 rounded-xl bg-red-950/50 border-2 border-red-500 font-mono text-xs text-red-200 space-y-2 animate-pulse">
          <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span>ACTIVE EMERGENCY OVERRIDE (BREAK-GLASS ACCESS LOGGED)</span>
          </div>
          <p className="text-slate-200">
            A temporary medical emergency override was exercised by <strong>{emergencyOverride.authorizedBy}</strong>.
          </p>
          <p className="p-2 rounded bg-space-950 border border-slate-700 text-amber-300 text-[11px]">
            <strong>Typed Justification:</strong> "{emergencyOverride.reason}"
          </p>
          <span className="text-[10px] text-slate-400 block">
            Logged to persistent IndexedDB audit ledger at {emergencyOverride.timestamp}.
          </span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 font-mono text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Consent policies successfully synchronized. Data-access guards updated.</span>
        </div>
      )}

      {/* Categories Toggle List */}
      <div className="space-y-3 font-mono text-xs">
        {consentItems.map((item) => {
          const Icon = item.icon;
          const isAllowed = !!consentState[item.key];

          return (
            <div
              key={item.key}
              className={`glass-panel p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                isAllowed 
                  ? 'border-emerald-500/30 bg-emerald-950/10' 
                  : 'border-slate-800 bg-space-950/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border shrink-0 ${
                  isAllowed 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' 
                    : 'bg-space-900 border-slate-800 text-slate-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${
                      isAllowed 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {isAllowed ? 'Shared' : 'Restricted / Private'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5 max-w-xl leading-relaxed">
                    {item.desc}
                  </p>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Audience: {item.roleAudience}
                  </span>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => handleToggle(item.key)}
                className={`px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  isAllowed
                    ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-space-900 hover:bg-space-850 text-slate-400 border border-slate-700'
                }`}
              >
                {isAllowed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isAllowed ? 'Consent Granted' : 'Consent Denied'}</span>
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
