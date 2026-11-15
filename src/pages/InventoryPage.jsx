import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Plus, Search, AlertTriangle, 
  CheckCircle2, Clock, MapPin, Edit2, Minus, X, RefreshCw,
  Package, XCircle, ShieldAlert, Sparkles, HelpCircle, Layers,
  Heart, Zap, Info, ChevronRight, ArrowRight
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { soundEngine } from '../utils/audio';
import VisualCard from '../components/VisualCard';

// ─── WebGL & Reduced Motion Detection ────────────────────────────────────────
const hasWebGL = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && c.getContext('webgl'));
  } catch (e) { return false; }
})();
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const use3D = hasWebGL && !prefersReducedMotion;

// ─── 3D Rotating Medical Kit Scene (THREE.js) ────────────────────────────────
function MedKit3DScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight || 180;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 4.2);
    camera.lookAt(0, 0, 0);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      return;
    }

    const group = new THREE.Group();
    scene.add(group);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const cyanLight = new THREE.DirectionalLight(0x06b6d4, 1.8);
    cyanLight.position.set(3, 4, 3);
    scene.add(cyanLight);

    const redGlow = new THREE.PointLight(0xef4444, 1.5, 6);
    redGlow.position.set(0, 0.5, 0);
    scene.add(redGlow);

    // Case bottom (main tray)
    const baseMat = new THREE.MeshStandardMaterial({ 
      color: 0x0f172a, 
      roughness: 0.25, 
      metalness: 0.85 
    });
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 1.6), baseMat);
    group.add(base);

    // Open Lid angled backward
    const lid = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.6), baseMat);
    lid.position.set(0, 0.75, -0.68);
    lid.rotation.x = -Math.PI / 3;
    group.add(lid);

    // Red Cross Emblem on Lid
    const crossMat = new THREE.MeshStandardMaterial({ 
      color: 0xef4444, 
      emissive: 0xef4444, 
      emissiveIntensity: 1.2 
    });
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.02), crossMat);
    crossH.position.set(0, 0.77, -0.67);
    crossH.rotation.x = -Math.PI / 3;
    group.add(crossH);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.55, 0.02), crossMat);
    crossV.position.set(0, 0.77, -0.67);
    crossV.rotation.x = -Math.PI / 3;
    group.add(crossV);

    // Internal compartments with glowing medication slots
    const slotColors = [0x10b981, 0x06b6d4, 0x10b981, 0xf59e0b, 0x06b6d4, 0x10b981];
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 3; col++) {
        const slotColor = slotColors[row * 3 + col];
        const slotMat = new THREE.MeshStandardMaterial({
          color: 0x1e293b,
          emissive: slotColor,
          emissiveIntensity: 0.75,
          roughness: 0.3
        });
        const slot = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.16, 0.64), slotMat);
        slot.position.set((col - 1) * 0.72, 0.12, (row - 0.5) * 0.72);
        group.add(slot);
      }
    }

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      group.rotation.y += 0.007;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / (container.clientHeight || 180);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight || 180);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      if (container && renderer?.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

// 2D SVG Fallback for Med Kit
function MedKitFallbackSVG() {
  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 200 120" className="w-full h-40 max-w-xs" fill="none">
        <rect x="20" y="30" width="160" height="80" rx="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
        <path d="M75 30 Q100 10 125 30" stroke="#06b6d4" strokeWidth="2" fill="none" />
        <rect x="85" y="45" width="30" height="10" rx="2" fill="#ef4444" />
        <rect x="95" y="35" width="10" height="30" rx="2" fill="#ef4444" />
        <rect x="30" y="70" width="30" height="30" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
        <rect x="68" y="70" width="30" height="30" rx="4" fill="#1e293b" stroke="#06b6d4" strokeWidth="1.5" />
        <rect x="106" y="70" width="30" height="30" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
        <rect x="144" y="70" width="26" height="30" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// ─── Item Type Detection & Inline SVG Icons ──────────────────────────────────
function getItemType(item) {
  const name = (item.name || '').toLowerCase();
  const unit = (item.unit || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();
  
  if (name.includes('oxygen') || name.includes('mask') || unit.includes('regulator') || cat.includes('respiratory')) {
    return 'oxygen';
  }
  if (name.includes('spray') || unit.includes('canister') || name.includes('sublingual')) {
    return 'spray';
  }
  if (name.includes('injection') || name.includes('syringe') || unit.includes('vial') || unit.includes('ampoule') || name.includes('auto-injector')) {
    return 'injection';
  }
  if (name.includes('iv') || name.includes('saline') || name.includes('rehydration') || name.includes('ors') || unit.includes('pouch') || unit.includes('bag')) {
    return 'saline';
  }
  if (name.includes('bandage') || name.includes('gauze') || name.includes('dressing') || name.includes('suture') || name.includes('tourniquet')) {
    return 'bandage';
  }
  return 'tablet';
}

function TabletIcon({ className = "w-5 h-5", color = "#06b6d4" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pillGrad" x1="6" y1="6" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.85" />
          <stop offset="1" stopColor="#0369a1" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect x="8" y="14" width="20" height="10" rx="5" transform="rotate(-45 18 19)" fill="url(#pillGrad)" stroke={color} strokeWidth="1.8" />
      <line x1="18" y1="11" x2="18" y2="27" transform="rotate(-45 18 19)" stroke="#ffffff" strokeWidth="1.6" strokeOpacity="0.8" />
      <path d="M11 16 Q14 12 18 15" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.75" />
    </svg>
  );
}

function SprayIcon({ className = "w-5 h-5", color = "#38bdf8" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="13" y="14" width="10" height="17" rx="2" fill="#0c4a6e" stroke={color} strokeWidth="1.6" />
      <rect x="15" y="10" width="6" height="4" rx="1" fill="#1e3a5f" stroke={color} strokeWidth="1.4" />
      <rect x="17" y="6" width="4" height="4" rx="0.5" fill={color} />
      <circle cx="15.5" cy="8" r="0.7" fill="#ffffff" />
      <path d="M12 7 L8 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 1.5" />
      <path d="M11 9 L6 9" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 1.5" />
      <path d="M12 11 L8 13" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeDasharray="1 1.5" />
      <line x1="15" y1="23" x2="21" y2="23" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
}

function InjectionIcon({ className = "w-5 h-5", color = "#f43f5e" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="9" width="7" height="16" rx="1.5" transform="rotate(-45 17.5 17)" fill="#4c0519" stroke={color} strokeWidth="1.6" />
      <line x1="17.5" y1="3" x2="17.5" y2="9" transform="rotate(-45 17.5 17)" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="17.5" y1="25" x2="17.5" y2="31" transform="rotate(-45 17.5 17)" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="14" y1="31" x2="21" y2="31" transform="rotate(-45 17.5 17)" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15.5" y1="13" x2="18.5" y2="13" transform="rotate(-45 17.5 17)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.75" />
      <line x1="15.5" y1="17" x2="18.5" y2="17" transform="rotate(-45 17.5 17)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.75" />
      <line x1="15.5" y1="21" x2="18.5" y2="21" transform="rotate(-45 17.5 17)" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.75" />
    </svg>
  );
}

function OxygenMaskIcon({ className = "w-5 h-5", color = "#10b981" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 14 C10 8 18 6 26 12 C28 18 24 26 18 28 C13 26 10 20 10 14 Z" fill="#064e3b" stroke={color} strokeWidth="1.6" />
      <circle cx="19" cy="20" r="2.8" fill="#022c22" stroke={color} strokeWidth="1.2" />
      <path d="M19 23 C19 28 14 31 9 32" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 12 C6 14 4 18 4 22" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round" />
      <path d="M25 13 C30 15 32 19 32 23" stroke="#64748b" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round" />
    </svg>
  );
}

function SalineIcon({ className = "w-5 h-5", color = "#06b6d4" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9 L24 9 C25.5 9 26.5 11 25.5 13 L23.5 25 C22.5 27 21 28 19 28 L17 28 C15 28 13.5 27 12.5 25 L10.5 13 C9.5 11 10.5 9 12 9 Z" fill="#083344" stroke={color} strokeWidth="1.6" />
      <rect x="16" y="6" width="4" height="3" rx="1" stroke={color} strokeWidth="1.2" />
      <line x1="14" y1="14" x2="18" y2="14" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="14" y1="18" x2="19" y2="18" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="14" y1="22" x2="17" y2="22" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
      <line x1="18" y1="28" x2="18" y2="33" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BandageIcon({ className = "w-5 h-5", color = "#f59e0b" }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="14" width="26" height="8" rx="2.5" fill="#451a03" stroke={color} strokeWidth="1.6" />
      <rect x="14" y="5" width="8" height="26" rx="2.5" fill="#451a03" stroke={color} strokeWidth="1.6" />
      <rect x="14" y="14" width="8" height="8" fill={color} fillOpacity="0.7" />
      <circle cx="16" cy="16" r="0.7" fill="#ffffff" />
      <circle cx="20" cy="16" r="0.7" fill="#ffffff" />
      <circle cx="16" cy="20" r="0.7" fill="#ffffff" />
      <circle cx="20" cy="20" r="0.7" fill="#ffffff" />
    </svg>
  );
}

function ItemTypeBadge({ item }) {
  const type = getItemType(item);
  let IconComp = TabletIcon;
  let color = '#06b6d4';
  let label = 'Tablet / Capsule';

  if (type === 'oxygen') {
    IconComp = OxygenMaskIcon;
    color = '#10b981';
    label = 'Oxygen Mask';
  } else if (type === 'spray') {
    IconComp = SprayIcon;
    color = '#38bdf8';
    label = 'Aerosol Spray';
  } else if (type === 'injection') {
    IconComp = InjectionIcon;
    color = '#f43f5e';
    label = 'Injectable';
  } else if (type === 'saline') {
    IconComp = SalineIcon;
    color = '#06b6d4';
    label = 'Fluid / Salts';
  } else if (type === 'bandage') {
    IconComp = BandageIcon;
    color = '#f59e0b';
    label = 'Surgical Dressing';
  }

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/60 shadow-inner"
      title={label}
    >
      <IconComp className="w-4 h-4 shrink-0" color={color} />
      <span className="text-[10px] font-mono text-slate-300 font-semibold truncate max-w-[100px]">
        {label}
      </span>
    </div>
  );
}

// ─── Circular Stock Ring ─────────────────────────────────────────────────────
function StockRing({ stock, minThreshold, unit }) {
  const isOut = stock === 0;
  const isLow = !isOut && stock <= minThreshold;
  
  const maxStock = Math.max(minThreshold * 3, stock, 20);
  const pct = Math.min(Math.max(stock / maxStock, 0), 1);
  
  const r = 21;
  const circ = 2 * Math.PI * r;
  const strokeDash = pct * circ;
  
  const strokeColor = isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const glowColor = isOut ? 'rgba(239,68,68,0.45)' : isLow ? 'rgba(245,158,11,0.45)' : 'rgba(16,185,129,0.45)';

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="54" height="54" viewBox="0 0 54 54" className="transform -rotate-90">
        <circle cx="27" cy="27" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle
          cx="27"
          cy="27"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={`${strokeDash} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dasharray 0.6s ease',
            filter: `drop-shadow(0 0 4px ${glowColor})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
        <span className={`text-xs font-mono font-black leading-none ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-300'}`}>
          {stock}
        </span>
        <span className="text-[8px] font-mono text-slate-400 leading-tight truncate max-w-[38px] mt-0.5">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Expiry Countdown Bar ────────────────────────────────────────────────────
function getExpiryCountdown(expiryDateStr) {
  if (!expiryDateStr) return { text: 'No date', color: 'slate', percent: 100 };
  
  const now = new Date();
  const expiry = new Date(expiryDateStr);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return { text: 'EXPIRED', color: 'red', percent: 0, isExpired: true };
  }
  
  const totalMonths = Math.floor(diffDays / 30.4375);
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;
  
  let label = '';
  if (years > 0) {
    label = `Expires in ${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} mo` : ''}`;
  } else if (totalMonths > 0) {
    label = `Expires in ${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
  } else {
    label = `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }

  let color = 'emerald';
  let percent = Math.min(100, Math.max(5, (totalMonths / 36) * 100));
  
  if (totalMonths < 6) {
    color = 'red';
  } else if (totalMonths < 12) {
    color = 'amber';
  } else {
    color = 'emerald';
  }

  return { text: label, color, percent };
}

function ExpiryBar({ expiryDate }) {
  const { text, color, percent } = getExpiryCountdown(expiryDate);
  const barColor = color === 'red' ? 'bg-red-500' : color === 'amber' ? 'bg-amber-400' : 'bg-emerald-400';
  const textColor = color === 'red' ? 'text-red-400' : color === 'amber' ? 'text-amber-300' : 'text-emerald-300';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{expiryDate}</span>
        </span>
        <span className={`font-bold ${textColor}`}>{text}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className={`h-full ${barColor} transition-all duration-500 rounded-full`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ─── Top-6 "What This Treats" Symptom Chips ──────────────────────────────────
const SYMPTOM_CHIPS = [
  { id: 'chest_pain', label: 'Chest Pain', icon: '❤️', keywords: ['aspirin', 'nitroglycerin'] },
  { id: 'nausea', label: 'Nausea & SMS', icon: '🤢', keywords: ['promethazine', 'ondansetron'] },
  { id: 'dehydration', label: 'Dehydration', icon: '💧', keywords: ['rehydration', 'ors', 'saline'] },
  { id: 'breathing', label: 'Breathing Trouble', icon: '🫁', keywords: ['oxygen', 'mask', 'regulator'] },
  { id: 'pain', label: 'Pain & Headache', icon: '💊', keywords: ['ibuprofen', 'aspirin', 'paracetamol'] },
  { id: 'radiation', label: 'Radiation Risk', icon: '☢️', keywords: ['iodide', 'potassium', 'ondansetron'] },
];

// ─── Kit Layout Schematic Diagram ───────────────────────────────────────────
function KitLayoutDiagram({ inventory, hoveredItemId, onSelectSlot }) {
  const layoutSlots = [
    { slotName: 'Slot 01', keyword: 'aspirin', desc: 'Oral Analgesics' },
    { slotName: 'Slot 02', keyword: 'ibuprofen', desc: 'NSAIDs' },
    { slotName: 'Slot 03', keyword: 'promethazine', desc: 'SMS Antiemetic' },
    { slotName: 'Slot 04', keyword: 'ondansetron', desc: 'Radiation Antiemetic' },
    { slotName: 'Slot 05', keyword: 'potassium', desc: 'Thyroid Protection' },
    { slotName: 'Emergency Tray', keyword: 'nitroglycerin', desc: 'Acute Cardiac' },
    { slotName: 'Bulkhead Bay', keyword: 'oxygen', desc: 'O₂ Life Support' },
    { slotName: 'Galley Rack', keyword: 'rehydration', desc: 'Electrolytes' }
  ];

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" />
          Kit Layout Schematic (Med Kit Alpha)
        </span>
        <span className="text-[10px] text-slate-400">Click a compartment to highlight</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
        {layoutSlots.map((slot) => {
          const item = inventory.find(i => 
            i.name.toLowerCase().includes(slot.keyword) || 
            i.location.toLowerCase().includes(slot.keyword)
          );
          const isOut = item && item.stock === 0;
          const isLow = item && item.stock <= item.minThreshold && !isOut;
          const isTargeted = hoveredItemId && item && hoveredItemId === item.id;

          const ringColor = isOut ? 'border-red-500/60 bg-red-950/30' :
                            isLow ? 'border-amber-500/60 bg-amber-950/30' :
                            'border-emerald-500/50 bg-emerald-950/20';

          return (
            <button
              key={slot.slotName}
              type="button"
              onClick={() => item && onSelectSlot(item.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${ringColor} ${
                isTargeted ? 'ring-2 ring-cyan-400 scale-[1.03] shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'hover:border-cyan-400/80'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">{slot.slotName}</span>
                <span className={`w-2 h-2 rounded-full ${isOut ? 'bg-red-400 animate-ping' : isLow ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              </div>
              <div className="font-bold text-white text-xs truncate">
                {item ? item.name : slot.desc}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{slot.desc}</span>
                {item && <span className="font-semibold text-cyan-300">{item.stock} left</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main InventoryPage Component ────────────────────────────────────────────
export default function InventoryPage() {
  const { 
    inventory, 
    consumeInventoryItem, 
    addInventoryItem, 
    updateInventoryItem 
  } = useMissionStore();

  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeSymptom, setActiveSymptom] = useState(null);
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    category: 'Cardiovascular / Analgesic',
    stock: 20,
    unit: 'tablets',
    minThreshold: 10,
    expiryDate: '2028-12-31',
    location: 'Med Kit Alpha - Slot 05',
    notes: ''
  });

  // Calculate audit numbers
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter((i) => i.stock > 0 && i.stock <= i.minThreshold).length;
  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;
  const inStockCount = totalItems - lowStockCount - outOfStockCount;

  // Filter items based on Search, Category, and Symptom Chip
  const filteredItems = inventory.filter((item) => {
    const itemName = item.name.toLowerCase();
    const itemCat = item.category.toLowerCase();
    const itemLoc = item.location.toLowerCase();

    // 1. Search Query
    const matchesSearch = itemName.includes(searchTerm.toLowerCase()) ||
                          itemCat.includes(searchTerm.toLowerCase()) ||
                          itemLoc.includes(searchTerm.toLowerCase());

    // 2. Category Pill
    const matchesCat = selectedCategory === 'ALL' || itemCat.includes(selectedCategory.toLowerCase());

    // 3. Symptom Chip Filter
    let matchesSymptom = true;
    if (activeSymptom) {
      const chip = SYMPTOM_CHIPS.find(c => c.id === activeSymptom);
      if (chip) {
        matchesSymptom = chip.keywords.some(k => itemName.includes(k) || itemCat.includes(k) || (item.notes || '').toLowerCase().includes(k));
      }
    }

    return matchesSearch && matchesCat && matchesSymptom;
  });

  const categories = [
    'ALL',
    'Cardiovascular',
    'NSAID',
    'Antiemetic',
    'Hydration',
    'Radiation',
    'Circadian',
    'Consumable'
  ];

  const handleConsume = (id) => {
    soundEngine.playClick();
    consumeInventoryItem(id, 1);
  };

  const handleRestock = (id) => {
    soundEngine.playClick();
    const item = inventory.find(i => i.id === id);
    if (item) {
      updateInventoryItem(id, { stock: item.stock + 5, status: 'In Stock' });
    }
  };

  const handleOpenAdd = () => {
    soundEngine.playClick();
    setFormData({
      name: '',
      dosage: '',
      category: 'Cardiovascular / Analgesic',
      stock: 20,
      unit: 'tablets',
      minThreshold: 10,
      expiryDate: '2028-12-31',
      location: 'Med Kit Alpha - Slot 05',
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    soundEngine.playClick();
    setEditingItem(item);
    setFormData({ ...item });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    soundEngine.playTelemetryPing();
    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        ...formData,
        stock: Number(formData.stock),
        minThreshold: Number(formData.minThreshold),
        status: Number(formData.stock) === 0 ? 'Out of Stock' : Number(formData.stock) <= Number(formData.minThreshold) ? 'Low Stock' : 'In Stock'
      });
      setEditingItem(null);
    } else {
      addInventoryItem({
        ...formData,
        stock: Number(formData.stock),
        minThreshold: Number(formData.minThreshold),
        status: Number(formData.stock) === 0 ? 'Out of Stock' : Number(formData.stock) <= Number(formData.minThreshold) ? 'Low Stock' : 'In Stock',
        alternatives: []
      });
      setShowAddModal(false);
    }
  };

  const handleScrollToItem = (itemId) => {
    soundEngine.playClick();
    setHoveredItemId(itemId);
    const element = document.getElementById(`item-card-${itemId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden px-1 sm:px-2 max-w-7xl mx-auto">
      
      {/* ─── 1. HERO BANNER: Rotating 3D Med Kit + Stock Summary ─── */}
      <VisualCard accent="cyan" className="p-4 sm:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          
          {/* Left: 3D Animated Medical Kit Scene */}
          <div className="lg:col-span-5 h-48 sm:h-52 relative rounded-xl overflow-hidden bg-slate-950/80 border border-cyan-500/30 flex items-center justify-center">
            {use3D ? <MedKit3DScene /> : <MedKitFallbackSVG />}
            <div className="absolute bottom-2 left-3 bg-slate-900/90 rounded px-2.5 py-1 text-[10px] font-mono text-cyan-300 border border-slate-800 pointer-events-none">
              Med Kit Alpha · 3D Avionics Tray
            </div>
          </div>

          {/* Right: Stock Summary KPI Overlaid Grid */}
          <div className="lg:col-span-7 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-cyan-400" />
                <h1 className="font-display font-bold text-lg sm:text-xl text-white tracking-wide drop-shadow"
                  style={{ textShadow: '0 0 20px rgba(6,182,212,0.5)' }}>
                  {t('medKitTitle') || 'Medicine Kit & Supplies'}
                </h1>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {t('medKitDesc') || 'Everything available on board. Tracks quantity, shelf-life and clinical indications.'}
              </p>
            </div>

            {/* 4 Overlaid Stat Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-cyan-300 uppercase block font-bold">Cataloged</span>
                <div className="text-2xl font-black font-mono text-white mt-0.5">{totalItems}</div>
                <span className="text-[9px] text-slate-400">Total SKUs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                <span className="text-[10px] font-mono text-emerald-300 uppercase block font-bold">In Stock</span>
                <div className="text-2xl font-black font-mono text-emerald-300 mt-0.5">{inStockCount}</div>
                <span className="text-[9px] text-slate-400">Mission Ready</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/30">
                <span className="text-[10px] font-mono text-amber-300 uppercase block font-bold">Low Stock</span>
                <div className="text-2xl font-black font-mono text-amber-300 mt-0.5">{lowStockCount}</div>
                <span className="text-[9px] text-slate-400">Restock Soon</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-red-500/30">
                <span className="text-[10px] font-mono text-red-300 uppercase block font-bold">Depleted</span>
                <div className="text-2xl font-black font-mono text-red-400 mt-0.5">{outOfStockCount}</div>
                <span className="text-[9px] text-slate-400">Substitutes On</span>
              </div>
            </div>
          </div>

        </div>
      </VisualCard>

      {/* ─── 2. Top-6 "What This Treats" Symptom Chips ─── */}
      <VisualCard accent="slate" className="p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" />
            What This Treats (Filter by Symptom)
          </span>
          {activeSymptom && (
            <button
              onClick={() => setActiveSymptom(null)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SYMPTOM_CHIPS.map((chip) => {
            const isSelected = activeSymptom === chip.id;
            return (
              <button
                key={chip.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveSymptom(isSelected ? null : chip.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] scale-105'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{chip.icon}</span>
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </VisualCard>

      {/* ─── 3. Kit Layout Schematic Diagram ─── */}
      <KitLayoutDiagram
        inventory={inventory}
        hoveredItemId={hoveredItemId}
        onSelectSlot={handleScrollToItem}
      />

      {/* ─── 4. Search, Filter Pills & Add Button ─── */}
      <VisualCard accent="slate" className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchMedication') || 'Search medicine, category, locker...'}
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Add Medical Item Button */}
          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-mono font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('addItem') || 'Add Medical Item'}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </VisualCard>

      {/* ─── 5. Inventory Items Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isOut = item.stock === 0;
          const isLow = !isOut && item.stock <= item.minThreshold;
          const cardAccent = isOut ? 'red' : isLow ? 'amber' : 'cyan';

          // Find alternative item if out of stock
          const substituteItem = isOut && item.alternatives?.length > 0 
            ? inventory.find(i => item.alternatives.includes(i.id) && i.stock > 0)
            : null;

          return (
            <div
              key={item.id}
              id={`item-card-${item.id}`}
              onMouseEnter={() => setHoveredItemId(item.id)}
              onMouseLeave={() => setHoveredItemId(null)}
            >
              <VisualCard
                accent={cardAccent}
                className={`p-4 flex flex-col justify-between transition-all h-full ${
                  isOut ? 'opacity-85 grayscale-[0.35]' : ''
                } ${hoveredItemId === item.id ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]' : ''}`}
              >
                <div>
                  {/* Header Row: Name + Dosage + Type Icon Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
                    <div className="min-w-0 pr-1">
                      <h4 className="font-mono font-bold text-sm text-white truncate leading-snug">
                        {item.name}
                      </h4>
                      <span className="text-[11px] font-mono text-cyan-300 font-medium block">
                        {item.dosage}
                      </span>
                    </div>

                    
                    <ItemTypeBadge item={item} />
                  </div>

                  {/* Status Badge & Category */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-2.5">
                    <span className="truncate">
                      <span className="text-slate-400">Category: </span>
                      <span className="text-white font-medium">{item.category}</span>
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 border ${
                      isOut 
                        ? 'bg-red-500/20 text-red-300 border-red-500/50' 
                        : isLow 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  {/* Circular Stock Ring & Stock Details */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 my-2 flex items-center gap-3">
                    <StockRing 
                      stock={item.stock} 
                      minThreshold={item.minThreshold} 
                      unit={item.unit} 
                    />

                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">
                        {t('availableStock') || 'Available Stock'}
                      </div>

                      <div className={`text-base font-extrabold font-mono leading-tight ${isOut ? 'text-red-400' : isLow ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {item.stock} <span className="text-xs font-normal text-slate-300">{item.unit}</span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Safe Minimum: <span className="text-slate-200 font-semibold">{item.minThreshold} {item.unit}</span>
                      </div>

                    </div>

                  </div>

                  {/* Out of stock recommendation card */}
                  {isOut && (
                    <div className="my-2 p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-xs font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-red-300 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Out of Stock</span>
                      </div>

                      {substituteItem ? (
                        <div className="text-[11px] text-slate-200">
                          <span>Use this instead: </span>
                          <button
                            onClick={() => handleScrollToItem(substituteItem.id)}
                            className="text-cyan-300 underline font-bold inline-flex items-center gap-0.5 ml-1"
                          >
                            <span>{substituteItem.name}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                      ) : (
                        <div className="text-[11px] text-slate-400">
                          Emergency stock depletion. Request Earth supply drone drop.
                        </div>

                      )}
                    </div>

                  )}

                  {/* Expiry Countdown Bar */}
                  <div className="mt-2.5 mb-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <ExpiryBar expiryDate={item.expiryDate} />
                  </div>

                  {/* Meta details: Location & Clinical Notes */}
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate text-slate-200">{item.location}</span>
                    </div>

                    {item.notes && (
                      <p className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800/70 line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Edit, Consume, Restock */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-700/70 hover:border-cyan-400 text-xs transition-colors"
                    title="Edit Specifications"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleConsume(item.id)}
                      disabled={item.stock === 0}
                      className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 disabled:opacity-40 text-red-300 hover:text-red-200 font-mono text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>{t('consumeDose') || 'Consume'}</span>
                    </button>

                    <button
                      onClick={() => handleRestock(item.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 font-mono text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{t('restockDose') || '+5 Restock'}</span>
                    </button>
                  </div>
                </div>

              </VisualCard>
            </div>
          );
        })}
      </div>

      {/* ─── Add / Edit Medication Modal ─── */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-cyan-500/40 shadow-2xl relative bg-slate-950/95">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4">
              <h3 className="font-mono font-bold text-white text-base">
                {editingItem ? 'Edit Medical Kit Item' : 'Catalog New Medication / Asset'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Item / Medicine Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Dosage / Spec</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Locker Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Clinical Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-3 py-1.5 rounded bg-slate-900 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
