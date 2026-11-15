import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, AlertTriangle, 
  CheckCircle2, Pill, ShieldAlert, Cpu, Sparkles, HelpCircle, 
  RotateCcw, Info, User, HeartPulse, ArrowRight
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { runMedicalTriage, initSpeechRecognition, speakText, stopSpeech } from '../utils/triage';
import { soundEngine } from '../utils/audio';

// Visual Clinical Mechanism Diagram for Triage Diagnostic Cards
function TriageDiagram({ triage }) {
  const text = ((triage.title || '') + ' ' + (triage.category || '')).toLowerCase();
  
  if (text.includes('cardiac') || text.includes('chest') || text.includes('heart') || text.includes('angina')) {
    return (
      <div className="my-2 p-2 rounded-xl bg-space-950/90 border border-rose-500/30">
        <div className="text-[9px] font-mono text-rose-400 font-bold mb-1">CARDIAC TELEMETRY DIAGRAM</div>
        <svg viewBox="0 0 160 36" className="w-full h-9">
          <path d="M 5,20 L 35,20 L 42,8 L 48,32 L 56,4 L 64,28 L 70,20 L 110,20 L 116,9 L 122,30 L 128,6 L 135,26 L 140,20 L 155,20" fill="none" stroke="#f43f5e" strokeWidth="1.8" />
          <circle cx="56" cy="4" r="3" fill="#f43f5e" className="animate-ping" />
        </svg>
      </div>
    );
  }
  
  if (text.includes('motion') || text.includes('vestibular') || text.includes('nausea') || text.includes('sms')) {
    return (
      <div className="my-2 p-2 rounded-xl bg-space-950/90 border border-amber-500/30">
        <div className="text-[9px] font-mono text-amber-400 font-bold mb-1">VESTIBULAR OTOLITH DISORIENTATION</div>
        <svg viewBox="0 0 160 36" className="w-full h-9">
          <circle cx="80" cy="18" r="14" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.2" />
          <path d="M 68,18 C 72,10 88,10 92,18 C 88,26 72,26 68,18 Z" fill="#f59e0b" fillOpacity="0.3" stroke="#f59e0b" strokeWidth="1" />
          <circle cx="80" cy="18" r="3" fill="#fbbf24" className="animate-pulse" />
          <line x1="40" y1="18" x2="65" y2="18" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="95" y1="18" x2="120" y2="18" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
        </svg>
      </div>
    );
  }

  if (text.includes('radiation') || text.includes('solar') || text.includes('storm')) {
    return (
      <div className="my-2 p-2 rounded-xl bg-space-950/90 border border-red-500/30">
        <div className="text-[9px] font-mono text-red-400 font-bold mb-1">IONIZING PROTON PENETRATION</div>
        <svg viewBox="0 0 160 36" className="w-full h-9">
          <rect x="70" y="6" width="16" height="24" rx="2" fill="#0369a1" stroke="#38bdf8" strokeWidth="1" />
          <path d="M 10,12 L 68,12" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx="68" cy="12" r="2.5" fill="#ef4444" className="animate-ping" />
          <path d="M 10,24 L 75,24" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="100" y="6" width="50" height="24" rx="2" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
          <text x="125" y="21" fill="#10b981" fontSize="7" textAnchor="middle" fontFamily="monospace">HAVEN</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="my-2 p-2 rounded-xl bg-space-950/90 border border-cyan-500/30">
      <div className="text-[9px] font-mono text-cyan-400 font-bold mb-1">PHYSIOLOGICAL COHERENCE WAVEFORM</div>
      <svg viewBox="0 0 160 36" className="w-full h-9">
        <path d="M 10,18 Q 30,5 50,18 T 90,18 T 130,18 T 150,18" fill="none" stroke="#00f2fe" strokeWidth="1.5" />
        <circle cx="90" cy="18" r="3" fill="#00f2fe" className="animate-pulse" />
      </svg>
    </div>
  );
}

export default function FlightSurgeonPage() {
  const { t } = useLanguage();
  const { 
    chatMessages, 
    addChatMessage, 
    currentVitals, 
    inventory, 
    consumeInventoryItem,
    missionDay,
    queuePacket
  } = useMissionStore();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechRecInstance, setSpeechRecInstance] = useState(null);
  const chatBottomRef = useRef(null);

  // Initialize Web Speech API
  useEffect(() => {
    const rec = initSpeechRecognition(
      (transcript) => {
        setInputText(transcript);
        setIsListening(false);
        soundEngine.playTelemetryPing();
      },
      () => {
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      setSpeechSupported(true);
      setSpeechRecInstance(rec);
    }

    return () => {
      stopSpeech();
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleToggleVoice = () => {
    soundEngine.playClick();
    if (!speechRecInstance) {
      alert('Speech recognition is not supported in this browser. Please type your symptoms.');
      return;
    }

    if (isListening) {
      speechRecInstance.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecInstance.start();
    }
  };

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    soundEngine.playClick();

    // 1. Add user message
    const userMsg = {
      sender: 'user',
      text: text,
      timestamp: `${t('solDay')} ${missionDay} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    addChatMessage(userMsg);
    setInputText('');

    // 2. Run offline triage engine
    setTimeout(() => {
      soundEngine.playTelemetryPing();
      const triageResult = runMedicalTriage(text, currentVitals, inventory);

      const aiMsg = {
        sender: 'ai',
        text: `Doctor Assessment for "${text}": Match found: ${triageResult.title}.`,
        timestamp: `${t('solDay')} ${missionDay} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        triageResult
      };

      addChatMessage(aiMsg);

      if (triageResult.severity === 'Critical') {
        soundEngine.playCriticalAlarm();
      } else {
        soundEngine.playWarningChime();
      }

      // Automatically queue high priority packet for ground doctors
      queuePacket({
        priority: triageResult.severity === 'Critical' ? 'CRITICAL' : 'HIGH',
        type: `Medical Triage: ${triageResult.title}`,
        size: '34 KB',
        payload: {
          symptoms: text,
          severity: triageResult.severity,
          actionsPrescribed: triageResult.stepByStepActions
        }
      });
    }, 450);
  };

  const handleSpeakResponse = (triageResult) => {
    soundEngine.playClick();
    const speechSummary = `${triageResult.title}. Severity: ${triageResult.severity}. Action: ${triageResult.stepByStepActions.slice(0, 2).join('. ')}`;
    speakText(speechSummary);
  };

  const quickProtocols = [
    'Chest pressure & tightness',
    'Severe headache & blurred vision',
    'Space motion sickness & nausea',
    'Lower back stiffness & spinal pain',
    'Extreme fatigue & sleep trouble',
    'Skin rash & minor radiation redness'
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-3 min-w-0 max-w-5xl mx-auto overflow-hidden">
      
      {/* Top Header Card with 3D Depth Layering */}
      <div className="relative rounded-2xl p-3.5 sm:p-4 border border-cyan-500/30 overflow-hidden bg-gradient-to-r from-space-900/95 via-space-950/95 to-slate-950/95 shadow-xl shrink-0 card-3d-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-sm sm:text-base text-white truncate drop-shadow">
                  {t('doctorTitle')}
                </h2>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {t('online')}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans truncate">
                {t('doctorDesc')}
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-amber-200 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-xl max-w-xs leading-tight shrink-0">
            <strong>Note:</strong> {t('doctorDisclaimer')}
          </div>
        </div>
      </div>

      {/* Quick Questions Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0 min-w-0">
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap mr-1">{t('doctorQuickPrompt')}</span>
        {quickProtocols.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-space-900 hover:bg-space-850 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 hover:text-white whitespace-nowrap transition-colors shrink-0 shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Area with 3D Depth Card Pattern */}
      <div className="flex-1 rounded-2xl p-4 border border-slate-800 overflow-y-auto space-y-3.5 bg-gradient-to-b from-space-900/90 via-space-950/95 to-slate-950/95 shadow-inner">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          const triage = msg.triageResult;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1">
                <span className="font-bold text-white">{isUser ? t('roleAstronaut') : t('roleSurgeon')}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-3.5 text-xs font-mono leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-space-900/95 border border-slate-700 text-slate-200 rounded-tl-none space-y-3'
                }`}
              >
                <p className="text-sm font-sans">{msg.text}</p>

                {triage && (
                  <div className="pt-2 border-t border-slate-700/80 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-cyan-300">
                        {triage.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          triage.severity === 'Critical' 
                            ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse' 
                            : triage.severity === 'High' 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        }`}>
                          {triage.severity}
                        </span>

                        <button
                          onClick={() => handleSpeakResponse(triage)}
                          title="Read Aloud"
                          className="p-1 rounded bg-space-800 hover:bg-space-700 text-cyan-400"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Step by step action steps */}
                    {triage.stepByStepActions && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                          Step-by-step Actions to take:
                        </span>
                        <ol className="list-decimal list-inside space-y-1 text-slate-200 font-sans text-xs">
                          {triage.stepByStepActions.map((step, sIdx) => (
                            <li key={sIdx} className="leading-snug">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Onboard Medicine Prescription */}
                    {triage.recommendedMeds && triage.recommendedMeds.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-space-950 border border-slate-700 space-y-1.5">
                        <span className="text-[10px] font-bold text-mangal-orange uppercase tracking-wider flex items-center gap-1">
                          <Pill className="w-3 h-3" />
                          <span>Onboard Medicine Available:</span>
                        </span>
                        <div className="space-y-1">
                          {triage.recommendedMeds.map((med, mIdx) => (
                            <div key={mIdx} className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-white font-bold">{med.name} ({med.dosage})</span>
                              <button
                                onClick={() => {
                                  soundEngine.playClick();
                                  consumeInventoryItem(med.id, 1);
                                  alert(`Recorded taking 1 dose of ${med.name}. Stock updated.`);
                                }}
                                className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold"
                              >
                                {t('medTake')}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-3 rounded-xl border transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse border-red-400' 
              : 'bg-space-900 border-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isListening ? t('doctorSpeaking') : t('doctorListening')}
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('doctorPlaceholder')}
          className="flex-1 bg-space-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-xs font-mono focus:outline-none shadow-inner"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-mangal-copper to-mangal-orange hover:from-mangal-orange hover:to-mangal-gold disabled:opacity-40 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(200,105,58,0.4)] transition-all"
        >
          <span>{t('doctorSend')}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
