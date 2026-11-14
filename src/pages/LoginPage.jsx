import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, ArrowRight, Shield, AlertTriangle, 
  Key, UserCheck, RefreshCw, Zap, RotateCcw
} from 'lucide-react';
import { useAuthStore } from '../auth/session';
import { useLanguage } from '../i18n/LanguageContext';
import { getRoleHomeRoute } from '../auth/rbac';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { soundEngine } from '../utils/audio';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { login, quickDemoLogin, failedAttempts, lockoutUntil, resetLockout } = useAuthStore();
  const { t } = useLanguage();

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
      const currentRole = useAuthStore.getState().currentUser?.role;
      navigate(getRoleHomeRoute(currentRole));
    } catch (err) {
      soundEngine.playWarningChime();
      setErrorMsg(err.message || 'Login failed. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick selector
  const handleSelectDemo = (demoEmail) => {
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
      navigate(getRoleHomeRoute(role));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-3 sm:p-6 bg-space-950 relative overflow-hidden">
      
      {/* 3D Deep Space Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-mangal-copper/20 via-mangal-blue/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar inside Login (Language Switcher) */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-20 pt-2 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{t('online')}</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Main Login Card with 3D Depth Pattern */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 min-w-0">
        
        {/* Emblem & Branding Header */}
        <div className="text-center mb-5">
          <div className="inline-block relative mb-2">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-mangal-copper via-mangal-blue to-mangal-gold opacity-50 blur-lg animate-pulse"></div>
            <img
              src="/assets/mission-mangal-logo.png"
              alt="Mission Mangal 2.0"
              className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain drop-shadow-[0_0_25px_rgba(46,139,255,0.5)] transform hover:scale-105 transition-transform"
            />
          </div>

          <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-wider drop-shadow-md">
            MANGAL HEALTH <span className="text-transparent bg-clip-text bg-gradient-to-r from-mangal-orange to-mangal-gold">SENTINEL</span>
          </h1>
          <p className="text-[11px] font-display text-mangal-blue tracking-widest uppercase mt-0.5 font-bold">
            {t('missionTitle')} · {t('loginSubtitle')}
          </p>
        </div>

        {/* 3D Layered Card Container: Lower 3D glow, Dark gradient overlay, High-contrast text */}
        <div className="relative rounded-2xl p-5 sm:p-7 border border-mangal-blue/40 shadow-[0_12px_40px_rgba(0,0,0,0.7)] backdrop-blur-xl card-3d-hover overflow-hidden bg-gradient-to-b from-space-900/95 via-space-950/95 to-slate-950/95 space-y-4">
          
          {/* Subtle 3D Grid texture overlay */}
          <div className="absolute inset-0 bg-hud-scanlines opacity-20 pointer-events-none"></div>

          {/* Card Header */}
          <div className="relative flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-mangal-gold" />
              <h2 className="font-mono font-bold text-sm text-white drop-shadow">
                {t('loginHeader')}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-space-900/90 px-2 py-0.5 rounded border border-slate-700">
              Safe & Offline
            </span>
          </div>

          {/* Security Lockout Alert with Instant Reset */}
          {cooldownRemaining > 0 && (
            <div className="relative p-3.5 rounded-xl bg-red-950/70 border border-red-500 font-mono text-xs text-red-200 space-y-2 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <strong>{t('loginLockoutTitle')}</strong>
                  <p className="text-[11px] text-red-300">
                    {t('loginLockoutDesc').replace('{sec}', cooldownRemaining)}
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
                className="w-full py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('loginResetLockout')}</span>
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && cooldownRemaining === 0 && (
            <div className="relative p-3 rounded-lg bg-red-950/50 border border-red-500/50 font-mono text-xs text-red-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => resetLockout()}
                className="text-[10px] underline text-cyan-300 shrink-0"
              >
                {t('reset')}
              </button>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="relative space-y-3.5 font-mono text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                {t('loginEmailLabel')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-space-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none text-xs font-mono shadow-inner"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">
                {t('loginPasswordLabel')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('loginPasswordPlaceholder')}
                  className="w-full bg-space-950 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none text-xs font-mono shadow-inner"
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
                <span className="text-[11px]">{t('loginRemember')}</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-mangal-copper via-mangal-orange to-mangal-gold hover:from-mangal-orange hover:to-mangal-gold disabled:opacity-40 text-white font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(200,105,58,0.4)] transition-all transform hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('signIn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Switcher */}
          <div className="relative pt-3 border-t border-slate-800">
            <span className="text-[10px] font-mono text-mangal-gold font-bold block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('loginDemoHeader')}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
              {/* 1. Astronaut */}
              <div className="p-2.5 rounded-xl border bg-space-950/80 border-slate-800 flex flex-col justify-between hover:border-cyan-400/50 transition-colors">
                <div onClick={() => handleSelectDemo('astronaut@mangal.in')} className="cursor-pointer">
                  <div className="font-bold text-cyan-300">1. {t('roleAstronaut')}</div>
                  <div className="text-[9px] text-slate-300 font-semibold truncate">Cmdr. Sarah Chen</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 line-clamp-1">Personal vitals, body scan & checklist</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('astronaut')}
                  className="mt-2 py-1 px-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{t('signIn')} as Astronaut</span>
                </button>
              </div>

              {/* 2. Doctor (Surgeon) */}
              <div className="p-2.5 rounded-xl border bg-space-950/80 border-slate-800 flex flex-col justify-between hover:border-emerald-400/50 transition-colors">
                <div onClick={() => handleSelectDemo('surgeon@mangal.in')} className="cursor-pointer">
                  <div className="font-bold text-emerald-300">2. {t('roleSurgeon')}</div>
                  <div className="text-[9px] text-slate-300 font-semibold truncate">Dr. Elena Rostova</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 line-clamp-1">Patient vitals vs baseline & medical kit</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('flight_surgeon')}
                  className="mt-2 py-1 px-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{t('signIn')} as Doctor</span>
                </button>
              </div>

              {/* 3. Commander */}
              <div className="p-2.5 rounded-xl border bg-space-950/80 border-slate-800 flex flex-col justify-between hover:border-amber-400/50 transition-colors">
                <div onClick={() => handleSelectDemo('commander@mangal.in')} className="cursor-pointer">
                  <div className="font-bold text-amber-300">3. {t('roleCommander')}</div>
                  <div className="text-[9px] text-slate-300 font-semibold truncate">Cmdr. Rajesh Nair</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 line-clamp-1">Crew readiness board & fatigue (no vitals)</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('mission_commander')}
                  className="mt-2 py-1 px-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{t('signIn')} as Commander</span>
                </button>
              </div>

              {/* 4. Ground Admin */}
              <div className="p-2.5 rounded-xl border bg-space-950/80 border-slate-800 flex flex-col justify-between hover:border-purple-400/50 transition-colors">
                <div onClick={() => handleSelectDemo('admin@mangal.in')} className="cursor-pointer">
                  <div className="font-bold text-purple-300">4. {t('roleAdmin')}</div>
                  <div className="text-[9px] text-slate-300 font-semibold truncate">Nagpur DSN</div>
                  <div className="text-[8px] text-slate-400 mt-0.5 line-clamp-1">User management, audit logs & avionics</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('admin')}
                  className="mt-2 py-1 px-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[9px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{t('signIn')} as Admin</span>
                </button>
              </div>
            </div>

            <div className="text-center text-[9px] text-slate-400 mt-2 font-mono">
              Password for all demo accounts: <strong className="text-white">Mangal@123</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] font-mono text-slate-400 py-2 relative z-20">
        <span>{t('teamName')}</span>
      </footer>

    </div>
  );
}
