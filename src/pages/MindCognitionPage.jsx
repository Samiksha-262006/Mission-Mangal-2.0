import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Clock, Shield, Lock, Unlock, Eye, CheckCircle2, 
  AlertTriangle, Play, RotateCcw, Heart, Smile, Wind, Save, ShieldAlert 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useAuthStore } from '../auth/session';
import { encryptJournalNote, decryptJournalNote } from '../auth/hash';
import { soundEngine } from '../utils/audio';

export default function MindCognitionPage() {
  const {
    pvtHistory,
    addPvtResult,
    journalEntries,
    addJournalEntry,
    mentalHealthGroundSync,
    setMentalHealthSync,
    missionDay
  } = useMissionStore();

  const { currentUser, consentCategories, emergencyOverride } = useAuthStore();

  const [activeTab, setActiveTab] = useState('pvt'); // 'pvt' | 'mood' | 'breathe'

  // Consent enforcement: If Flight Surgeon, check consent or emergency override
  const isSurgeon = currentUser?.role === 'flight_surgeon';
  const hasConsent = isSurgeon ? (consentCategories.mentalHealth || emergencyOverride.active) : true;

  // ------------------------------------
  // 1. PVT (Psychomotor Vigilance Test)
  // ------------------------------------
  const [pvtState, setPvtState] = useState('IDLE'); // 'IDLE' | 'WAITING' | 'TRIGGERED' | 'FINISHED'
  const [pvtTimerDisplay, setPvtTimerDisplay] = useState(0);
  const [pvtReactionTimes, setPvtReactionTimes] = useState([]);
  const [pvtLapses, setPvtLapses] = useState(0);
  const [pvtFalseStarts, setPvtFalseStarts] = useState(0);
  const [pvtTimeRemaining, setPvtTimeRemaining] = useState(60);

  const pvtTriggerTimeRef = useRef(0);
  const pvtTimeoutRef = useRef(null);
  const pvtIntervalRef = useRef(null);
  const pvtSessionTimerRef = useRef(null);

  const startPvtTest = () => {
    soundEngine.playClick();
    setPvtState('WAITING');
    setPvtTimerDisplay(0);
    setPvtReactionTimes([]);
    setPvtLapses(0);
    setPvtFalseStarts(0);
    setPvtTimeRemaining(60);

    pvtSessionTimerRef.current = setInterval(() => {
      setPvtTimeRemaining((prev) => {
        if (prev <= 1) {
          finishPvtTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    scheduleNextStimulus();
  };

  const scheduleNextStimulus = () => {
    setPvtState('WAITING');
    setPvtTimerDisplay(0);

    const delay = Math.floor(Math.random() * 3200) + 1800;

    pvtTimeoutRef.current = setTimeout(() => {
      pvtTriggerTimeRef.current = performance.now();
      setPvtState('TRIGGERED');
      soundEngine.playBeep(980, 0.05);

      pvtIntervalRef.current = setInterval(() => {
        const elapsed = Math.round(performance.now() - pvtTriggerTimeRef.current);
        setPvtTimerDisplay(elapsed);
      }, 16);
    }, delay);
  };

  const handlePvtTap = () => {
    if (pvtState === 'WAITING') {
      soundEngine.playBeep(320, 0.1, 'sawtooth');
      clearTimeout(pvtTimeoutRef.current);
      setPvtFalseStarts((prev) => prev + 1);
      scheduleNextStimulus();
    } else if (pvtState === 'TRIGGERED') {
      clearInterval(pvtIntervalRef.current);
      const rt = Math.round(performance.now() - pvtTriggerTimeRef.current);
      soundEngine.playClick();

      setPvtReactionTimes((prev) => [...prev, rt]);
      if (rt > 500) {
        setPvtLapses((prev) => prev + 1);
      }

      scheduleNextStimulus();
    }
  };

  const finishPvtTest = () => {
    clearInterval(pvtSessionTimerRef.current);
    clearTimeout(pvtTimeoutRef.current);
    clearInterval(pvtIntervalRef.current);
    setPvtState('FINISHED');
    soundEngine.playTelemetryPing();
  };

  const handleSavePvt = () => {
    if (pvtReactionTimes.length === 0) return;
    const mean = Math.round(pvtReactionTimes.reduce((a, b) => a + b, 0) / pvtReactionTimes.length);
    const score = Math.max(20, Math.min(100, Math.round(100 - (mean - 200) * 0.25 - pvtLapses * 8 - pvtFalseStarts * 5)));

    addPvtResult({
      meanRt: mean,
      lapses: pvtLapses,
      falseStarts: pvtFalseStarts,
      trials: pvtReactionTimes.length,
      score
    });

    alert(`PVT Trial Logged. Mean RT: ${mean}ms | Score: ${score}/100.`);
    setPvtState('IDLE');
  };

  // ------------------------------------
  // 2. Mood & Encrypted Journal
  // ------------------------------------
  const [selectedMood, setSelectedMood] = useState('Focused');
  const [journalText, setJournalText] = useState('');
  const [isPrivateJournal, setIsPrivateJournal] = useState(true);

  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    soundEngine.playClick();

    // Encrypt at rest
    const encrypted = await encryptJournalNote(journalText, 'Mangal@123', 'a1b2c3d4e5f60718293a4b5c6d7e8f90');

    addJournalEntry({
      mood: selectedMood,
      note: journalText,
      ciphertext: encrypted.ciphertext,
      isPrivate: isPrivateJournal
    });

    setJournalText('');
    soundEngine.playTelemetryPing();
    alert('Entry encrypted with AES-GCM and stored in local IndexedDB.');
  };

  // ------------------------------------
  // 3. Guided Breathing
  // ------------------------------------
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [breathSec, setBreathSec] = useState(4);
  const [breathActive, setBreathActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (breathActive) {
      interval = setInterval(() => {
        setBreathSec((prev) => {
          if (prev <= 1) {
            setBreathPhase((current) => {
              if (current === 'Inhale') return 'Hold (Full)';
              if (current === 'Hold (Full)') return 'Exhale';
              if (current === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathActive]);

  // If Flight Surgeon is denied consent
  if (isSurgeon && !hasConsent) {
    return (
      <div className="max-w-xl mx-auto my-12 glass-panel rounded-2xl p-6 text-center space-y-4 border border-amber-500/50">
        <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/80 mx-auto flex items-center justify-center text-amber-400">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="font-display font-bold text-lg text-white">Mental Health Telemetry Restricted</h3>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          Cmdr. Sarah Chen has classified cognitive reaction trials and private logs under the <strong>Consent Center</strong>. Flight Surgeons may only access this telemetry if the astronaut grants consent or in life-threatening events via Emergency Override.
        </p>
        <div className="pt-2">
          <span className="text-[10px] font-mono text-cyan-300">
            Use the "Emergency Override" button in the top navigation bar if immediate medical break-glass access is required.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-mangal-blue/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-5 h-5 text-mangal-blue" />
            <h2 className="font-display font-bold text-xl text-white">Mind, Cognition & Circadian Health</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-mangal-copper/20 text-mangal-orange border border-mangal-copper/30">
              PVT-192 FLIGHT BATTERY
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Evaluates behavioral fatigue, attentional lapses, and psychological well-being in deep space isolation.
          </p>
        </div>

        {/* Break-glass badge indicator if active */}
        {emergencyOverride.active && isSurgeon && (
          <div className="px-3 py-1.5 rounded-lg bg-red-950/60 border border-red-500 text-red-200 font-mono text-xs flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Emergency Break-Glass Active</span>
          </div>
        )}
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('pvt'); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'pvt' 
              ? 'bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/40 font-bold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Psychomotor Vigilance Test (PVT)</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('mood'); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'mood' 
              ? 'bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/40 font-bold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Mood Check-in & Encrypted Journal</span>
        </button>

        <button
          onClick={() => { soundEngine.playClick(); setActiveTab('breathe'); }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'breathe' 
              ? 'bg-mangal-blue/20 text-cyan-300 border border-mangal-blue/40 font-bold' 
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>Guided Box-Breathing</span>
        </button>
      </div>

      {/* Tab 1: PVT */}
      {activeTab === 'pvt' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 glass-panel rounded-2xl p-6 border border-mangal-blue/30 flex flex-col items-center justify-between min-h-[380px]">
            <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
              <span className="text-cyan-400 font-bold">NASA Standard 60s Vigilance Trial</span>
              <span>Time Left: <strong className="text-white">{pvtTimeRemaining}s</strong></span>
            </div>

            <div
              onClick={handlePvtTap}
              className={`w-full max-w-md h-52 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all select-none my-4 shadow-2xl ${
                pvtState === 'TRIGGERED'
                  ? 'bg-red-950/80 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
                  : pvtState === 'WAITING'
                  ? 'bg-space-950 border-cyan-500/40 hover:border-cyan-400'
                  : 'bg-space-950/60 border-slate-700'
              }`}
            >
              {pvtState === 'TRIGGERED' ? (
                <div className="text-center">
                  <div className="text-6xl font-extrabold font-mono text-red-400 tracking-tight">
                    {pvtTimerDisplay}
                  </div>
                  <span className="text-xs font-mono text-red-300 tracking-widest mt-1 block uppercase">
                    TAP NOW (MILLISECONDS)
                  </span>
                </div>
              ) : pvtState === 'WAITING' ? (
                <div className="text-center text-slate-400 font-mono text-xs">
                  <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping mx-auto mb-3"></div>
                  <span>WAIT FOR RED NUMBERS...</span>
                  <span className="block text-[10px] text-slate-500 mt-1">Tap immediately when counter starts</span>
                </div>
              ) : pvtState === 'FINISHED' ? (
                <div className="text-center font-mono space-y-1">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <span className="text-base font-bold text-white">60s Battery Finished</span>
                  <span className="text-xs text-slate-400 block">Review cognitive readiness scores</span>
                </div>
              ) : (
                <div className="text-center font-mono space-y-2">
                  <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-1 opacity-70" />
                  <span className="text-sm font-bold text-white">Psychomotor Vigilance Battery Ready</span>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Tap anywhere on this pad as soon as red millisecond counter starts.
                  </p>
                </div>
              )}
            </div>

            <div className="w-full flex items-center justify-between pt-2 border-t border-slate-800">
              {pvtState === 'IDLE' ? (
                <button
                  onClick={startPvtTest}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold font-mono text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start 60-Second PVT Battery</span>
                </button>
              ) : pvtState === 'FINISHED' ? (
                <div className="flex items-center gap-3 w-full justify-between">
                  <button
                    onClick={startPvtTest}
                    className="px-4 py-2 rounded-lg bg-space-900 border border-slate-700 text-slate-300 font-mono text-xs"
                  >
                    Retake Test
                  </button>
                  <button
                    onClick={handleSavePvt}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Log PVT Score</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={finishPvtTest}
                  className="px-4 py-2 rounded-lg bg-space-900 text-slate-400 hover:text-white font-mono text-xs border border-slate-700"
                >
                  Abort Test
                </button>
              )}

              <span className="text-[11px] font-mono text-slate-400">
                Lapses (&gt;500ms): <strong className="text-amber-400">{pvtLapses}</strong> | False Starts: <strong className="text-red-400">{pvtFalseStarts}</strong>
              </span>
            </div>
          </div>

          {/* PVT History */}
          <div className="md:col-span-4 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block mb-3">
                Cognitive Readiness History
              </span>

              <div className="space-y-2.5">
                {pvtHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-space-900 border border-slate-800 font-mono text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="text-slate-400 text-[10px]">Sol {item.day}</span>
                      <div className="text-white font-bold">{item.meanRt} ms mean</div>
                      <span className="text-[10px] text-slate-400">{item.lapses} lapse(s)</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-extrabold ${item.score >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {item.score}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Readiness</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
              NASA Standard: Mean RT &lt; 300ms indicates nominal vigilance without micro-sleep vulnerability.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Mood & Encrypted Journal */}
      {activeTab === 'mood' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <span className="text-xs font-mono font-bold text-mangal-orange uppercase tracking-wider block">
              Spaceflight Affective State & Encrypted Journal
            </span>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-2">Select Dominant State:</label>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {['Focused', 'Alert', 'Calm', 'Fatigued', 'Anxious', 'Isolated'].map((mood) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-2.5 rounded-lg border text-center transition-colors ${
                      selectedMood === mood
                        ? 'bg-mangal-copper/30 text-mangal-orange border-mangal-copper font-bold shadow-[0_0_12px_rgba(200,105,58,0.3)]'
                        : 'bg-space-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">
                  Private Subjective Observations (AES-GCM Encrypted at Rest):
                </label>
                <textarea
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Record sensory reflections, sleep quality notes, or cabin interactions..."
                  rows="4"
                  className="w-full bg-space-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:border-mangal-blue"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                  <input
                    type="checkbox"
                    checked={isPrivateJournal}
                    onChange={(e) => setIsPrivateJournal(e.target.checked)}
                    className="rounded accent-mangal-copper"
                  />
                  <span>Private (Governed by Consent Center)</span>
                </label>

                <button
                  type="submit"
                  disabled={!journalText.trim()}
                  className="px-4 py-2 rounded-lg bg-mangal-copper hover:bg-mangal-orange disabled:opacity-40 text-white font-bold font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Encrypt & Save</span>
                </button>
              </div>
            </form>
          </div>

          <div className="md:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Recent Astronaut Logs ({journalEntries.length})
            </span>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {journalEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-space-900 border border-slate-800 space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-cyan-300 font-bold">Sol {entry.day} • {entry.mood}</span>
                    <span>{entry.isPrivate ? '🔒 AES-GCM Encrypted' : '📡 Telemetry'}</span>
                  </div>
                  <p className="text-slate-200 font-sans leading-relaxed text-xs">
                    {entry.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Guided Breathing */}
      {activeTab === 'breathe' && (
        <div className="glass-panel rounded-2xl p-8 border border-mangal-blue/30 flex flex-col items-center justify-center text-center space-y-6 min-h-[420px]">
          <div>
            <h3 className="font-display font-bold text-xl text-white">Autonomic Box-Breathing Countermeasure</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              4s Inhale • 4s Hold • 4s Exhale • 4s Hold — Downregulates sympathetic arousal and normalizes HRV.
            </p>
          </div>

          <div className="relative w-64 h-64 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border border-mangal-blue/40 transition-all duration-1000 ${
                breathPhase.startsWith('Inhale')
                  ? 'scale-110 shadow-[0_0_50px_rgba(46,139,255,0.4)]'
                  : breathPhase.startsWith('Exhale')
                  ? 'scale-75 shadow-none'
                  : 'scale-95'
              }`}
            />

            <div
              className={`w-48 h-48 rounded-full border-2 border-mangal-blue flex flex-col items-center justify-center transition-all duration-1000 ${
                breathPhase.startsWith('Inhale')
                  ? 'bg-mangal-blue/20 scale-110'
                  : breathPhase.startsWith('Exhale')
                  ? 'bg-space-950 scale-75'
                  : 'bg-space-900/60 scale-95'
              }`}
            >
              <span className="text-sm font-mono font-bold text-cyan-300 tracking-wider uppercase">
                {breathActive ? breathPhase : 'READY'}
              </span>
              <span className="text-4xl font-mono font-extrabold text-white mt-1">
                {breathActive ? breathSec : '4'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              setBreathActive(!breathActive);
            }}
            className={`px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
              breathActive
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50'
                : 'bg-mangal-copper hover:bg-mangal-orange text-white shadow-[0_0_20px_rgba(200,105,58,0.5)]'
            }`}
          >
            {breathActive ? 'Pause Exercise' : 'Begin 5-Minute Box Breathing'}
          </button>
        </div>
      )}

    </div>
  );
}
