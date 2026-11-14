import React, { useState } from 'react';
import { 
  Plus, Search, AlertTriangle, 
  CheckCircle2, Clock, MapPin, Edit2, Minus, X, RefreshCw,
  Package, XCircle, ShieldAlert, Sparkles, HelpCircle, Layers
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { useLanguage } from '../i18n/LanguageContext';
import { soundEngine } from '../utils/audio';
import VisualCard from '../components/VisualCard';

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

// 1. Tablet / Capsule Icon (Pill with division and sheen)
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

// 2. Sublingual / Aerosol Spray Canister Icon
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

// 3. Injectable Syringe / Ampoule Icon
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

// 4. Oxygen Mask & Regulator Icon
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

// 5. Saline IV Bag / Rehydration Icon
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

// 6. Bandage / Sterile Dressing Icon
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
  const circ = 2 * Math.PI * r; // ~131.95
  const strokeDash = pct * circ;
  
  const strokeColor = isOut ? '#ef4444' : isLow ? '#f59e0b' : '#10b981';
  const glowColor = isOut ? 'rgba(239,68,68,0.45)' : isLow ? 'rgba(245,158,11,0.45)' : 'rgba(16,185,129,0.45)';

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width="54" height="54" viewBox="0 0 54 54" className="transform -rotate-90">
        <circle
          cx="27"
          cy="27"
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth="4"
        />
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

  // Filter items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
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

  return (
    <div className="space-y-6 overflow-x-hidden px-1 sm:px-2">
      
      {/* ─── Top 4 KPI Summary Cards (Using VisualCard with mouse tilt & neon glow) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Cataloged Items */}
        <VisualCard accent="cyan" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              {t('totalCataloged') || 'Total Items in Kit'}
            </span>
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {totalItems} <span className="text-xs font-semibold text-slate-400">SKUs</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400 mt-2 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>All packs ready & verified</span>
          </div>
        </VisualCard>

        {/* In Stock & Mission Ready */}
        <VisualCard accent="emerald" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
              {t('inStockReady') || 'In Stock & Ready'}
            </span>
            <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-emerald-300 tracking-tight">
            {inStockCount}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Good reserve levels</span>
          </div>
        </VisualCard>

        {/* Low Stock Warnings */}
        <VisualCard accent="amber" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider">
              {t('lowStockWarning') || 'Running Low'}
            </span>
            <div className="p-2 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-300">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-amber-300 tracking-tight">
            {lowStockCount}
          </div>
          <div className="text-[11px] font-mono text-amber-400 mt-2 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Needs restock soon</span>
          </div>
        </VisualCard>

        {/* Depleted / Out of Stock */}
        <VisualCard accent="red" className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-red-300 font-bold uppercase tracking-wider">
              {t('outOfStockDepleted') || 'Out of Stock'}
            </span>
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-red-400 tracking-tight">
            {outOfStockCount}
          </div>
          <div className="text-[11px] font-mono text-red-400 mt-2 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>Use substitute item</span>
          </div>
        </VisualCard>
      </div>

      {/* ─── Search, Filter Pills & Add Button (VisualCard) ─── */}
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

      {/* ─── Inventory Items Grid (Using VisualCard with Ring, Expiry Bar, and Type Icon) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isOut = item.stock === 0;
          const isLow = !isOut && item.stock <= item.minThreshold;
          const cardAccent = isOut ? 'red' : isLow ? 'amber' : 'cyan';

          return (
            <VisualCard
              key={item.id}
              accent={cardAccent}
              className={`p-4 flex flex-col justify-between transition-all ${
                isOut ? 'opacity-90' : ''
              }`}
            >
              <div>
                {/* 1. Header Row: Name + Dosage + Type Icon Badge */}
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-800/80">
                  <div className="min-w-0 pr-1">
                    <h4 className="font-mono font-bold text-sm text-white truncate leading-snug">
                      {item.name}
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-300 font-medium block">
                      {item.dosage}
                    </span>
                  </div>
                  
                  {/* Item Type Badge (tablet, spray, injection, oxygen mask, etc.) */}
                  <ItemTypeBadge item={item} />
                </div>

                {/* 2. Status Badge & Category */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-3">
                  <span className="truncate">
                    <span className="text-slate-400">Type: </span>
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

                {/* 3. Circular Stock Ring & Stock Details Block */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 my-2 flex items-center gap-3">
                  {/* Circular Stock Ring with color & glow */}
                  <StockRing 
                    stock={item.stock} 
                    minThreshold={item.minThreshold} 
                    unit={item.unit} 
                  />

                  {/* Stock textual details */}
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

                {/* 4. Expiry Countdown Bar ("Expires in 1 year 7 months") */}
                <div className="mt-2.5 mb-3 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <ExpiryBar expiryDate={item.expiryDate} />
                </div>

                {/* 5. Meta details: Location & Clinical Notes */}
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

              {/* 6. Action Buttons: Edit, Consume, Restock */}
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
