import React, { useState } from 'react';
import { 
  Radio, Send, Download, Printer, Wifi, WifiOff, 
  Clock, CheckCircle2, AlertTriangle, FileText, Database, Shield, Lock 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function EarthSyncPage() {
  const {
    commStatus,
    packetQueue,
    syncLogs,
    transmitSummary,
    currentVitals,
    profile,
    baseline,
    missionDay,
    vitalsHistory,
    alerts,
    journalEntries,
    pvtHistory
  } = useMissionStore();

  const { currentUser, consentCategories, emergencyOverride } = useAuthStore();

  const isBlackout = commStatus === 'BLACKOUT';
  const isTransmitting = commStatus === 'TRANSMITTING';

  // Check consent filtering for report export
  const includeMentalHealth = consentCategories.mentalHealth || emergencyOverride.active || currentUser?.role === 'astronaut';
  const includePrivateJournal = consentCategories.privateJournal || currentUser?.role === 'astronaut';

  // Sort queue
  const sortedQueue = [...packetQueue].sort((a, b) => {
    const pOrder = { CRITICAL: 0, HIGH: 1, ROUTINE: 2 };
    return (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2);
  });

  const handleTransmit = () => {
    transmitSummary();
  };

  // Export JSON Report
  const handleExportJson = () => {
    soundEngine.playTelemetryPing();
    const reportData = {
      branding: {
        mission: 'MISSION MANGAL 2.0 - ARES V MARS TRANSIT',
        organization: 'Team Mission Mangal 2.0 (Nagpur, India)',
        challenge: 'NASA Space Apps Challenge'
      },
      generatedAt: new Date().toISOString(),
      missionDay,
      generatedBy: {
        user: currentUser?.name || 'Astronaut',
        role: currentUser?.role || 'astronaut'
      },
      consentEnforcement: {
        mentalHealthIncluded: includeMentalHealth,
        privateJournalIncluded: includePrivateJournal
      },
      astronaut: profile,
      baseline,
      currentVitals,
      recentHistory: vitalsHistory.slice(-7),
      activeAlerts: alerts,
      queueStatus: packetQueue,
      // Consent-restricted fields
      cognitiveData: includeMentalHealth ? pvtHistory : '[RESTRICTED_BY_ASTRONAUT_CONSENT]',
      journalLogs: includePrivateJournal ? journalEntries : '[RESTRICTED_BY_ASTRONAUT_CONSENT]'
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mission-Mangal-Health-Report-Sol${missionDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export / Print Branded PDF Report
  const handlePrintPdf = () => {
    soundEngine.playClick();
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Printable Report Header (Visible when printing or on page) */}
      <div className="glass-panel rounded-2xl p-5 border border-mangal-blue/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/mission-mangal-logo.png"
            alt="Mission Mangal 2.0 Emblem"
            className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(46,139,255,0.6)]"
          />
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-display font-bold text-xl text-white">Delay-Tolerant Network (DTN) Earth Sync</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-mangal-copper/20 text-mangal-orange border border-mangal-copper/30">
                NAGPUR DSN RELAY
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">
              Interplanetary telemetry relay simulating a 20-minute light-speed delay with autonomous packet buffering.
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-mangal-copper to-mangal-orange hover:from-mangal-orange hover:to-mangal-gold text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Branded Report</span>
          </button>
        </div>
      </div>

      {/* Orbital Link Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className={`glass-panel p-4 rounded-xl border flex items-center justify-between ${
          isBlackout ? 'border-red-500/50 bg-red-950/20' : 'border-slate-800'
        }`}>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Deep Space Network Link</span>
            <div className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
              {isBlackout ? (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">BLACKOUT</span>
                </>
              ) : (
                <>
                  <Wifi className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300">{isTransmitting ? 'UPLINK BURST' : 'DSN CONNECTED'}</span>
                </>
              )}
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            isBlackout ? 'bg-red-500/30 text-red-200' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {commStatus}
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">One-Way Light Delay</span>
            <div className="text-xl font-extrabold text-cyan-300 mt-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>20 min 18 sec</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500">185M km distance</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">DTN Local Buffer</span>
            <div className="text-xl font-extrabold text-white mt-1">
              {packetQueue.filter(p => p.status === 'QUEUED').length} <span className="text-xs font-normal text-slate-400">Packets Pending</span>
            </div>
          </div>
          <span className="text-[10px] text-cyan-400 font-bold">Encrypted</span>
        </div>
      </div>

      {/* Transmit Action Banner */}
      <div className="glass-panel p-4 rounded-2xl border border-mangal-blue/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-cyan-400" />
            Severity-Sorted Transmission Queue
          </span>
          <p className="text-[11px] font-mono text-slate-400">
            Emergency cardiac and SPE alarms are prioritized ahead of daily telemetry.
          </p>
        </div>

        <button
          onClick={handleTransmit}
          disabled={isBlackout || isTransmitting}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-mono text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
            isBlackout
              ? 'bg-space-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              : isTransmitting
              ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400 animate-pulse'
              : 'bg-mangal-copper hover:bg-mangal-orange text-white shadow-[0_0_20px_rgba(200,105,58,0.4)]'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isTransmitting ? 'Transmitting High-Rate Bundle...' : 'Transmit Telemetry Summary'}</span>
        </button>
      </div>

      {/* Packet Queue & Uplink Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Queued Telemetry Packets ({sortedQueue.length})
          </span>

          <div className="space-y-2.5">
            {sortedQueue.map((pkt) => {
              const isCrit = pkt.priority === 'CRITICAL';
              const isHigh = pkt.priority === 'HIGH';

              return (
                <div
                  key={pkt.id}
                  className={`p-3.5 rounded-xl border font-mono text-xs flex items-center justify-between gap-3 ${
                    isCrit 
                      ? 'border-red-500/50 bg-red-950/20' 
                      : isHigh 
                      ? 'border-amber-500/40 bg-amber-950/20' 
                      : 'border-slate-800 bg-space-900/60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${
                        isCrit 
                          ? 'bg-red-500/20 text-red-300 border-red-500' 
                          : isHigh 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500' 
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      }`}>
                        {pkt.priority}
                      </span>
                      <span className="font-bold text-white text-xs">{pkt.type}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {pkt.queuedAt} • Size: {pkt.size || '24 KB'}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    pkt.status === 'DELIVERED' 
                      ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40' 
                      : 'text-amber-400 bg-amber-950/60 border border-amber-500/40'
                  }`}>
                    {pkt.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Deep Space Ground Uplink Log
          </span>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-space-900 border border-slate-800 font-mono text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-cyan-400">
                  <span>{log.timestamp}</span>
                  <span className="text-emerald-400">✓ SYNCHRONIZED</span>
                </div>
                <p className="text-slate-300 font-sans text-xs">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
