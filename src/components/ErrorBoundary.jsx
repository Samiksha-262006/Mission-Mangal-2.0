import React from 'react';
import { AlertOctagon, RotateCcw, Home, Terminal } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sentinel Subsystem Error Caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full my-6 p-6 sm:p-8 rounded-2xl glass-panel border border-red-500/50 bg-red-950/20 shadow-[0_0_30px_rgba(239,68,68,0.25)] text-center font-mono space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex p-3 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
            <AlertOctagon className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase bg-red-950 px-2 py-0.5 rounded border border-red-500/30">
              MISSION MANGAL 2.0 • SUB-SYSTEM ISOLATION INTERLOCK
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {this.props.moduleName || 'Subsystem'} Failed to Load
            </h2>
            <p className="text-xs text-slate-300 font-sans max-w-md mx-auto">
              An unexpected runtime exception was isolated by Sentinel fault-containment protocols. Your telemetry session remains active and safe.
            </p>
          </div>

          {this.state.error && (
            <div className="text-left bg-space-950 p-3 rounded-lg border border-slate-800 text-[11px] text-red-300 font-mono overflow-x-auto max-h-32">
              <span className="text-slate-500 block mb-1">Diagnostic Stack Trace:</span>
              <code>{this.state.error.toString()}</code>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reboot Subsystem</span>
            </button>

            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="px-4 py-2 rounded-xl bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-200 text-xs flex items-center gap-2 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
