import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { soundEngine } from '../utils/audio';

export default function LanguageSwitcher({ compact = false }) {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'hi', label: 'हिं', name: 'हिन्दी' },
    { code: 'mr', label: 'मरा', name: 'मराठी' }
  ];

  const handleSelect = (code) => {
    soundEngine.playClick();
    setLanguage(code);
  };

  return (
    <div className="flex items-center gap-1 bg-space-950/80 p-0.5 rounded-lg border border-mangal-blue/40 shadow-inner">
      <div className="px-1.5 py-0.5 text-cyan-400 hidden sm:flex items-center gap-1">
        <Globe className="w-3 h-3" />
      </div>

      <div className="flex items-center gap-0.5">
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleSelect(lang.code)}
              title={lang.name}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-mangal-copper to-mangal-orange text-white shadow-[0_0_8px_rgba(200,105,58,0.5)] scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-space-900'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
