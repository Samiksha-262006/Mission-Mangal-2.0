import React, { useState } from 'react';
import { 
  Pill, Plus, Search, Filter, AlertTriangle, 
  CheckCircle2, Clock, MapPin, Edit2, Minus, Trash2, X, RefreshCw
} from 'lucide-react';
import { useMissionStore } from '../store/useMissionStore';
import { soundEngine } from '../utils/audio';

export default function InventoryPage() {
  const { 
    inventory, 
    consumeInventoryItem, 
    addInventoryItem, 
    updateInventoryItem 
  } = useMissionStore();

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
    location: 'Med Kit Alpha - Bulkhead',
    notes: ''
  });

  // Calculate audit numbers
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter((i) => i.stock > 0 && i.stock <= i.minThreshold).length;
  const outOfStockCount = inventory.filter((i) => i.stock === 0).length;

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
    <div className="space-y-6">
      
      {/* Top Inventory Banner & KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Cataloged Items</span>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">{totalItems} SKUs</div>
          <span className="text-[10px] font-mono text-cyan-400">All Packs Synchronized</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">In Stock & Mission Ready</span>
          <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-1">
            {totalItems - lowStockCount - outOfStockCount}
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Nominal Reserve Levels</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Low Stock Warnings</span>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-1">{lowStockCount}</div>
          <span className="text-[10px] font-mono text-amber-400">Below Safety Threshold</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-red-500/30">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Depleted / Out of Stock</span>
          <div className="text-2xl font-extrabold font-mono text-red-400 mt-1">{outOfStockCount}</div>
          <span className="text-[10px] font-mono text-red-400">Alternatives Substituted</span>
        </div>
      </div>

      {/* Control Bar: Search + Category Pills + Add Button */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search medication, category, locker location..."
              className="w-full bg-space-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(0,242,254,0.3)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medical Item</span>
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
              className={`px-3 py-1 rounded-md text-xs font-mono whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-space-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isOut = item.stock === 0;
          const isLow = !isOut && item.stock <= item.minThreshold;

          return (
            <div
              key={item.id}
              className={`glass-panel rounded-xl p-4 border flex flex-col justify-between transition-all ${
                isOut 
                  ? 'border-red-500/40 bg-red-950/20' 
                  : isLow 
                  ? 'border-amber-500/40 bg-amber-950/20' 
                  : 'border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              <div>
                {/* Header: Name + Status */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="font-mono font-bold text-sm text-white">{item.name}</h4>
                    <span className="text-[11px] font-mono text-cyan-300">{item.dosage}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                    isOut 
                      ? 'bg-red-500/20 text-red-300 border-red-500/50' 
                      : isLow 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {isOut ? 'Depleted' : isLow ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 mb-2">
                  Category: {item.category}
                </div>

                {/* Stock Level Bar */}
                <div className="p-2.5 rounded-lg bg-space-950 border border-slate-800/80 my-2">
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Available Stock:</span>
                    <span className={`font-extrabold text-sm ${isOut ? 'text-red-400' : isLow ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {item.stock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-space-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (item.stock / (item.minThreshold * 3)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Expiry: {item.expiryDate}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenEdit(item)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-space-900 border border-slate-800 hover:border-slate-600 text-xs"
                  title="Edit Specifications"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleConsume(item.id)}
                    disabled={item.stock === 0}
                    className="px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/40 border border-red-500/30 disabled:opacity-40 text-red-300 font-mono text-xs flex items-center gap-1 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Consume</span>
                  </button>

                  <button
                    onClick={() => handleRestock(item.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>+5 Restock</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Medication Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full rounded-2xl p-6 border border-cyan-500/40 shadow-2xl relative">
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
                <label className="text-slate-400 block mb-1">Item / Medicine Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Dosage / Spec</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={formData.minThreshold}
                    onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Locker Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Clinical Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  className="w-full bg-space-900 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                  className="px-3 py-1.5 rounded bg-space-900 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono"
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
