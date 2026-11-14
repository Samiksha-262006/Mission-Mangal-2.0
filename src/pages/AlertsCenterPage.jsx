import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, AlertTriangle, AlertOctagon, CheckCircle2, 
  Volume2, VolumeX, X, ChevronRight, Shield, Zap 
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';

export default function AlertsCenterPage() {
  const navigate = useNavigate();
  const { 
    alerts, 
    dismissAlert, 
    soundMuted, 
    toggleSoundMute,
    missionDay 
  } = useMissionStore();

  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedFilter === 'ALL') return true;
    return a.severity.toLowerCase() === selectedFilter.toLowerCase();
  });

  const handleTestAlarm = () => {
    soundEngine.playCriticalAlarm();
  };

  const handleAction = (alert) => {
    soundEngine.playClick();
    if (alert.category === 'Radiation Hazard') {
      navigate('/hazards');
    } else if (alert.category === 'Cardiovascular') {
      navigate('/surgeon');
    } else if (alert.category === 'Deep Space DTN') {
      navigate('/sync');
    } else if (alert.category === 'Behavioral Health') {
      navigate('/crew');
    } else {
      navigate('/baseline');
    }
  };

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="font-mono font-bold text-xl text-white">Central Mission Alerts & Telemetry Alarms</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              PRIORITIZED EVENT LOG
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Autonomous alert triage notifying astronauts of life-support, radiation anomalies, and clinical drift thresholds.
          </p>
        </div>

        {/* Audio Test & Mute Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleTestAlarm}
            className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/40 text-red-300 flex items-center gap-1.5 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Alarm Siren</span>
          </button>

          <button
            onClick={toggleSoundMute}
            className={`p-2 rounded-lg border transition-colors ${
              soundMuted ? 'bg-amber-950/60 border-amber-500 text-amber-300' : 'bg-space-900 border-slate-700 text-slate-300'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono">
        {['ALL', 'CRITICAL', 'WARNING'].map((filter) => (
          <button
            key={filter}
            onClick={() => { soundEngine.playClick(); setSelectedFilter(filter); }}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              selectedFilter === filter
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>{filter}</span>
            {filter === 'CRITICAL' && criticalCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-bold animate-pulse">
                {criticalCount}
              </span>
            )}
            {filter === 'WARNING' && warningCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-black font-bold">
                {warningCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-emerald-500/30 text-center font-mono space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-white">All Subsystems Nominal</h3>
            <p className="text-xs text-slate-400">No unacknowledged alerts in the selected priority queue.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCrit = alert.severity === 'critical';
            const isWarn = alert.severity === 'warning';

            return (
              <div
                key={alert.id}
                className={`glass-panel p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  isCrit 
                    ? 'border-red-500/60 bg-red-950/30 shadow-[0_0_25px_rgba(239,68,68,0.2)]' 
                    : isWarn 
                    ? 'border-amber-500/50 bg-amber-950/20' 
                    : 'border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                      isCrit 
                        ? 'bg-red-500 text-black border-red-400 animate-pulse' 
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
                    <span className="text-[10px] font-mono text-cyan-400">• {alert.category}</span>
                  </div>

                  <h4 className="font-mono font-bold text-sm text-white">
                    {alert.title}
                  </h4>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {alert.details}
                  </p>
                </div>

                {/* Action & Dismiss */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleAction(alert)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <span>{alert.actionLabel || 'Inspect'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      dismissAlert(alert.id);
                    }}
                    title="Dismiss Alert"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-space-850"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
