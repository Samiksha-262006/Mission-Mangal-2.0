import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function MedicalTermTooltip({ termKey, label }) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  const tooltipText = t(termKey);
  if (!tooltipText) return null;

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="w-3.5 h-3.5 rounded-full bg-space-900 border border-cyan-500/40 text-cyan-300 hover:text-white flex items-center justify-center text-[9px] font-bold focus:outline-none"
        title="What does this mean?"
        aria-label="Medical explanation"
      >
        ?
      </button>

      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 sm:w-56 p-2 rounded-xl bg-space-950/95 border border-mangal-blue/60 text-slate-100 text-[10px] font-sans leading-snug shadow-2xl z-50 pointer-events-none text-center">
          <span className="block font-bold text-cyan-300 mb-0.5">{label || "Explanation"}:</span>
          {tooltipText}
        </span>
      )}
    </span>
  );
}
