import React from 'react';
import { useNavigate } from 'react-router-dom';
import CinematicLandingScene from '../three/CinematicLandingScene';
import { useAuthStore } from '../auth/session';
import { soundEngine } from '../utils/audio';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleEnter = () => {
    soundEngine.playTelemetryPing();
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-space-950 flex flex-col justify-between">
      {/* 3D Cinematic Scene */}
      <div className="flex-1 w-full h-full">
        <CinematicLandingScene onEnter={handleEnter} />
      </div>

      {/* Footer Required By Prompt */}
      <footer className="text-center text-xs font-mono text-slate-400 py-3 relative z-20 border-t border-slate-900 bg-space-950/80 backdrop-blur-md">
        <span>Team Mission Mangal 2.0 · Nagpur, India</span>
      </footer>
    </div>
  );
}
