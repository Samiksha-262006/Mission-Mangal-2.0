import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, Shield, AlertTriangle, 
  Key, UserCheck, RefreshCw, CheckCircle2, RotateCcw, Zap 
} from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { login, quickDemoLogin, failedAttempts, lockoutUntil, resetLockout } = useAuthStore();

  const [email, setEmail] = useState('astronaut@mangal.in');
  const [password, setPassword] = useState('Mangal@123');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Lockout countdown timer
  useEffect(() => {
    let interval = null;
    const checkLockout = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setCooldownRemaining(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setCooldownRemaining(0);
      }
    };

    checkLockout();
    interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      soundEngine.playClick();
      await login(email, password, rememberDevice);
      soundEngine.playTelemetryPing();
      if (onLoginSuccess) onLoginSuccess();
      navigate('/dashboard');
    } catch (err) {
      soundEngine.playWarningChime();
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick selector
  const handleSelectDemo = (demoEmail, demoRole) => {
    soundEngine.playClick();
    resetLockout();
    setEmail(demoEmail);
    setPassword('Mangal@123');
    setErrorMsg('');
  };

  // Instant demo login
  const handleInstantDemoLogin = async (role) => {
    soundEngine.playTelemetryPing();
    resetLockout();
    setLoading(true);
    try {
      await quickDemoLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-space-950 relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-mangal-copper/20 via-mangal-blue/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10">
        
        {/* Emblem & Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-block relative mb-3">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-mangal-copper via-mangal-blue to-mangal-gold opacity-50 blur-lg animate-pulse"></div>
            <img
              src="/assets/mission-mangal-logo.png"
              alt="Mission Mangal 2.0"
              className="relative w-28 h-28 mx-auto object-contain drop-shadow-[0_0_25px_rgba(46,139,255,0.5)]"
            />
          </div>

          <h2 className="font-display font-black text-2xl text-white tracking-wider">
            MANGAL HEALTH <span className="text-transparent bg-clip-text bg-gradient-to-r from-mangal-orange to-mangal-gold">SENTINEL</span>
          </h2>
          <p className="text-xs font-display text-mangal-blue tracking-widest uppercase mt-0.5 font-bold">
            MISSION MANGAL 2.0 • TERMINAL ACCESS
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-mangal-blue/30 shadow-[0_0_40px_rgba(7,11,31,0.8)] space-y-5">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-mangal-gold" />
              <span className="font-mono font-bold text-xs text-slate-200 uppercase tracking-wider">
                Cryptographic Authentication
              </span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-space-900 px-2 py-0.5 rounded border border-slate-700">
              PBKDF2 SHA-256
            </span>
          </div>

          {/* Lockout Warning with Instant Reset Button */}
          {cooldownRemaining > 0 && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500 font-mono text-xs text-red-200 space-y-2 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <strong>TERMINAL SECURITY LOCKOUT:</strong>
                  <p className="text-[11px] text-red-300">
                    5 consecutive failed attempts. System locked for {cooldownRemaining}s.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  resetLockout();
                  setErrorMsg('');
                }}
                className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Security Lockout</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && cooldownRemaining === 0 && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 font-mono text-xs text-red-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => resetLockout()}
                className="text-[10px] underline text-cyan-300"
              >
                Reset
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <label className="text-slate-400 block mb-1.5 flex items-center justify-between">
                <span>Crew Email / Callsign:</span>
                <span className="text-slate-500 text-[10px]">IndexedDB Identity</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-mangal-blue text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 flex items-center justify-between">
                <span>Passphrase:</span>
                <span className="text-slate-500 text-[10px]">100k Salted Iterations</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-space-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-mangal-blue text-xs font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded accent-mangal-copper"
                />
                <span className="text-[11px]">Remember terminal session</span>
              </label>
              <span className="text-[10px] text-slate-500">Auto-lock: 5 min</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-mangal-copper via-mangal-orange to-mangal-gold hover:from-mangal-orange hover:to-mangal-gold disabled:opacity-40 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,105,58,0.4)] transition-all transform hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying PBKDF2 Hash...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Terminal Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-[10px] font-mono text-mangal-gold font-bold block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>One-Click Role Demonstration Accounts:</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg border bg-space-950 border-slate-800 flex flex-col justify-between">
                <div onClick={() => handleSelectDemo('astronaut@mangal.in', 'astronaut')} className="cursor-pointer">
                  <div className="font-bold text-cyan-300">1. Astronaut</div>
                  <div className="text-[9px] text-slate-400 truncate">Cmdr. Sarah Chen</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('astronaut')}
                  className="mt-1.5 py-1 px-2 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center justify-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Login As Astronaut</span>
                </button>
              </div>

              <div className="p-2 rounded-lg border bg-space-950 border-slate-800 flex flex-col justify-between">
                <div onClick={() => handleSelectDemo('surgeon@mangal.in', 'flight_surgeon')} className="cursor-pointer">
                  <div className="font-bold text-emerald-300">2. Flight Surgeon</div>
                  <div className="text-[9px] text-slate-400 truncate">Dr. Elena Rostova</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('flight_surgeon')}
                  className="mt-1.5 py-1 px-2 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center justify-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Login As Surgeon</span>
                </button>
              </div>

              <div className="p-2 rounded-lg border bg-space-950 border-slate-800 flex flex-col justify-between">
                <div onClick={() => handleSelectDemo('commander@mangal.in', 'mission_commander')} className="cursor-pointer">
                  <div className="font-bold text-amber-300">3. Commander</div>
                  <div className="text-[9px] text-slate-400 truncate">Cmdr. Rajesh Nair</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('mission_commander')}
                  className="mt-1.5 py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center justify-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Login As Commander</span>
                </button>
              </div>

              <div className="p-2 rounded-lg border bg-space-950 border-slate-800 flex flex-col justify-between">
                <div onClick={() => handleSelectDemo('admin@mangal.in', 'admin')} className="cursor-pointer">
                  <div className="font-bold text-purple-300">4. Ground Admin</div>
                  <div className="text-[9px] text-slate-400 truncate">Nagpur DSN Control</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('admin')}
                  className="mt-1.5 py-1 px-2 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[9px] font-bold flex items-center justify-center gap-1"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>Login As Admin</span>
                </button>
              </div>
            </div>

            <p className="text-[9px] font-mono text-slate-500 mt-2 text-center">
              Passphrase: <strong className="text-slate-300">Mangal@123</strong> • PIN: <strong className="text-slate-300">1234</strong>
            </p>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs font-mono text-slate-400 py-3 relative z-10 border-t border-slate-900">
        <span>Team Mission Mangal 2.0 · Nagpur, India</span>
      </footer>

    </div>
  );
}
