import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, AlertTriangle, 
  CheckCircle2, Pill, ShieldAlert, Cpu, Sparkles, HelpCircle, 
  RotateCcw, Info, User
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { runMedicalTriage, initSpeechRecognition, speakText, stopSpeech } from '../utils/triage';
import { soundEngine } from '../utils/audio';

export default function FlightSurgeonPage() {
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
      alert('Speech recognition is not supported in this browser environment. You can type symptoms directly.');
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
      timestamp: `Day ${missionDay} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };
    addChatMessage(userMsg);
    setInputText('');

    // 2. Run offline triage engine
    setTimeout(() => {
      soundEngine.playTelemetryPing();
      const triageResult = runMedicalTriage(text, currentVitals, inventory);

      const aiMsg = {
        sender: 'ai',
        text: `Clinical evaluation complete for: "${text}". Differential matched: ${triageResult.title}.`,
        timestamp: `Day ${missionDay} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        triageResult
      };

      addChatMessage(aiMsg);

      // Play audio notification
      if (triageResult.severity === 'Critical') {
        soundEngine.playCriticalAlarm();
      } else {
        soundEngine.playWarningChime();
      }

      // Automatically queue high priority telemetry packet for ground flight surgeons
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
    const speechSummary = `${triageResult.title}. Severity: ${triageResult.severity}. Recommended actions: ${triageResult.stepByStepActions.slice(0, 2).join('. ')}`;
    speakText(speechSummary);
  };

  const handleDispenseMed = (medId, medName) => {
    soundEngine.playClick();
    consumeInventoryItem(medId, 1);
    alert(`Dispensed 1 unit of ${medName} from Medical Kit.`);
  };

  const quickProtocols = [
    'Acute chest pressure with pain radiating to left shoulder',
    'Severe space motion sickness and persistent vomiting',
    'Blurry vision and optic disc strain (SANS check)',
    'Intracranial headache and sinus cephalic fullness',
    'Acute solar particle radiation sickness with nausea',
    'Severe insomnia, sleep latency over 90 minutes',
    'Skin rash with localized erythema and immune distress',
    'Acute isolation panic and hyperventilation'
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-14rem)] min-h-[600px]">
      
      {/* Top Protocol Header & Disclaimer */}
      <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-sm sm:text-base text-white">Autonomous AI Flight Surgeon</h2>
              <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                OFFLINE PROTOCOL ENGINE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Biometric Cross-Referencing: HR {currentVitals.heartRate} bpm | SpO2 {currentVitals.spO2}% | Fluid {currentVitals.fluidShiftIndex}σ
            </p>
          </div>
        </div>

        {/* Disclaimer Tag */}
        <div className="text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 rounded-lg max-w-xs leading-tight">
          <strong>DISCLAIMER:</strong> Clinical decision support only; not a replacement for flight surgeon consultation.
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap mr-1">Quick Protocols:</span>
        {quickProtocols.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-space-900 hover:bg-space-850 border border-slate-700 hover:border-cyan-500/50 text-[11px] font-mono text-slate-300 hover:text-cyan-200 whitespace-nowrap transition-colors"
          >
            {prompt.length > 32 ? prompt.slice(0, 32) + '...' : prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Log Area */}
      <div className="flex-1 glass-panel rounded-2xl p-4 border border-slate-800 overflow-y-auto space-y-4">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          const triage = msg.triageResult;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-1">
                <span>{isUser ? 'Astronaut' : 'Sentinel AI Surgeon'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Body */}
              <div
                className={`max-w-2xl rounded-2xl p-3.5 text-xs font-mono leading-relaxed ${
                  isUser
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-space-900 border border-slate-700 text-slate-200 rounded-tl-none space-y-3'
                }`}
              >
                <p>{msg.text}</p>

                {/* Rich Triage Card Output */}
                {triage && (
                  <div className="pt-2 border-t border-slate-700/80 space-y-3">
                    
                    {/* Title & Severity Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-cyan-300">
                        {triage.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          triage.severity === 'Critical' 
                            ? 'bg-red-500/20 text-red-300 border-red-500 animate-pulse' 
                            : triage.severity === 'High' 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                        }`}>
                          Severity: {triage.severity}
                        </span>

                        <button
                          onClick={() => handleSpeakResponse(triage)}
                          title="Read Aloud Protocol"
                          className="p-1 rounded bg-space-800 hover:bg-space-700 text-cyan-400"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Likely Causes */}
                    {triage.likelyCauses && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block mb-1">
                          Likely Spaceflight Etiologies:
                        </span>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                          {triage.likelyCauses.map((cause, cIdx) => (
                            <li key={cIdx}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Step-by-Step Countermeasure Actions */}
                    {triage.stepByStepActions && (
                      <div className="p-3 rounded-xl bg-space-950 border border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Step-by-Step Clinical Directives:
                        </span>
                        <div className="space-y-1 text-[11px] text-slate-200 font-sans">
                          {triage.stepByStepActions.map((step, sIdx) => (
                            <div key={sIdx} className="leading-snug">{step}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Medication Recommendations & Stock Verification */}
                    {triage.medicationRecommendations && triage.medicationRecommendations.length > 0 && (
                      <div>
                        <span className="text-[11px] font-bold text-slate-400 block mb-1.5 flex items-center gap-1">
                          <Pill className="w-3.5 h-3.5 text-cyan-400" />
                          On-Board Medical Kit Verification:
                        </span>
                        <div className="space-y-1.5">
                          {triage.medicationRecommendations.map((med, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-2.5 rounded-lg bg-space-950/80 border border-slate-800 flex items-center justify-between gap-3 text-[11px]"
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{med.name}</span>
                                  <span className="text-slate-400 font-normal">({med.dosage})</span>
                                </div>
                                <div className="text-[10px]">
                                  <span className={med.inStock ? 'text-emerald-400' : 'text-red-400'}>
                                    Status: {med.status}
                                  </span>
                                  {med.location && <span className="text-slate-400 ml-2">Loc: {med.location}</span>}
                                </div>

                                {/* Alternatives if out of stock */}
                                {!med.inStock && med.alternatives && med.alternatives.length > 0 && (
                                  <div className="text-[10px] text-amber-300 font-bold mt-1">
                                    In-Stock Alternative: {med.alternatives.join(', ')}
                                  </div>
                                )}
                              </div>

                              {med.inStock && med.id && (
                                <button
                                  onClick={() => handleDispenseMed(med.id, med.name)}
                                  className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-[10px] transition-colors shrink-0"
                                >
                                  Dispense 1x
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DTN Ground Status */}
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Ground Sync: {triage.groundNotification || 'Logged in daily medical summary'}</span>
                      <span className="text-cyan-400 font-bold">DTN Priority: {triage.telemetryPriority}</span>
                    </div>

                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Box & Voice Controls */}
      <div className="glass-panel p-2.5 rounded-xl border border-cyan-500/30 flex items-center gap-2 shrink-0">
        <button
          onClick={handleToggleVoice}
          title={isListening ? 'Stop Listening' : 'Speak Symptoms via Microphone (Web Speech API)'}
          className={`p-3 rounded-lg transition-all ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
              : 'bg-space-900 text-cyan-400 hover:bg-space-800 border border-slate-700'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isListening ? "Listening... speak symptoms clearly..." : "Describe symptoms (e.g. chest pain, SMS nausea, blurry eyes, headache)..."}
          className="flex-1 bg-space-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim()}
          className="px-4 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
