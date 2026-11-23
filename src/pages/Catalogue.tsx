import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, 
  Plus, 
  Search, 
  Eye, 
  FileText, 
  Edit2, 
  Trash2, 
  BatteryCharging, 
  Gauge, 
  Zap,
  Filter
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { Scooter } from '../types';
import AddEditScooterModal from '../components/modals/AddEditScooterModal';
import ScooterDetailModal from '../components/modals/ScooterDetailModal';

export const Catalogue: React.FC = () => {
  const { scooters, deleteScooter } = useCRM();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRtoFilter, setSelectedRtoFilter] = useState<'All' | 'RTO' | 'Non-RTO'>('All');
  const [selectedPurposeFilter, setSelectedPurposeFilter] = useState<string>('All');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingScooter, setEditingScooter] = useState<Scooter | null>(null);
  const [detailModalScooter, setDetailModalScooter] = useState<Scooter | null>(null);

  const role = currentUser?.role || 'salesman';
  const canManageCatalogue = role === 'master_admin' || (role as any) === 'super_admin' || role === 'owner';

  const filteredScooters = useMemo(() => {
    return scooters.filter((s) => {
      if (selectedRtoFilter === 'RTO' && !s.rtoType.includes('Registration Required')) {
        return false;
      }
      if (selectedRtoFilter === 'Non-RTO' && !s.rtoType.includes('Non-RTO')) {
        return false;
      }
      if (selectedPurposeFilter !== 'All' && !s.bestFor?.includes(selectedPurposeFilter)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = s.modelName.toLowerCase().includes(q);
        const matchBattery = s.batterySpecs.toLowerCase().includes(q);
        const matchFeatures = s.keyFeatures?.some(f => f.toLowerCase().includes(q));
        if (!matchName && !matchBattery && !matchFeatures) return false;
      }
      return true;
    });
  }, [scooters, selectedRtoFilter, selectedPurposeFilter, searchQuery]);

  const handleEdit = (scooter: Scooter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingScooter(scooter);
    setIsAddEditOpen(true);
  };

  const handleDelete = async (scooterId: string, modelName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${modelName}" from the showroom catalogue?`)) {
      await deleteScooter(scooterId);
    }
  };

  const handleCreateVoucher = (scooterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/vouchers/new?scooterId=${scooterId}`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Bike className="w-5 h-5 text-[#0A3D91]" /> Digital Scooter Catalogue
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] tabular-nums">
            {filteredScooters.length} models
          </span>
        </div>

        {canManageCatalogue && (
          <button
            onClick={() => {
              setEditingScooter(null);
              setIsAddEditOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Scooter</span>
          </button>
        )}
      </div>

      {/* 2. Filters Toolbar */}
      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input 
              type="text"
              placeholder="Search by model, specs, battery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0A3D91] outline-none min-h-[38px]"
            />
          </div>

          {/* RTO Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto text-xs">
            {(['All', 'RTO', 'Non-RTO'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedRtoFilter(cat)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all text-xs min-h-[36px] sm:min-h-auto ${
                  selectedRtoFilter === cat
                    ? 'bg-[#0A3D91] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'All' ? 'All Models' : cat === 'RTO' ? 'RTO Certified' : 'Non-RTO (No License)'}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Purpose:
          </span>
          {['All', 'Daily Commute', 'Family Use', 'Delivery / Commercial', 'Students / Ladies'].map((purpose) => (
            <button
              key={purpose}
              onClick={() => setSelectedPurposeFilter(purpose)}
              className={`px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all min-h-[32px] ${
                selectedPurposeFilter === purpose
                  ? 'bg-[#65B32E] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {purpose}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Responsive Scooter Grid (1 col mobile, 3 col desktop) */}
      {filteredScooters.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <Bike className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No scooter models matched your filter</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting filters or adding a new model</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredScooters.map((scooter) => (
            <div 
              key={scooter.id}
              onClick={() => setDetailModalScooter(scooter)}
              className="bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle hover:border-[#0A3D91] transition-all overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* 16:9 Image Showcase */}
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src={scooter.imageUrl} 
                  alt={scooter.modelName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    scooter.rtoType.includes('Non-RTO') 
                      ? 'bg-amber-400 text-slate-900' 
                      : 'bg-[#65B32E] text-white'
                  }`}>
                    {scooter.rtoType.includes('Non-RTO') ? 'Non-RTO' : 'RTO'}
                  </span>

                  {!scooter.inStock && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500 text-white shadow-sm">
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Edit & Delete Controls for Master Admin & Owner */}
                {canManageCatalogue && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      onClick={(e) => handleEdit(scooter, e)}
                      title="Edit Specs"
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:text-[#0A3D91] hover:bg-white shadow transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(scooter.id, scooter.modelName, e)}
                      title="Delete Model"
                      className="p-1.5 rounded-lg bg-white/90 text-slate-700 hover:text-red-600 hover:bg-white shadow transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-display font-bold text-base text-slate-900 truncate">
                      {scooter.modelName}
                    </h3>
                  </div>

                  {/* Best For Tags */}
                  {scooter.bestFor && scooter.bestFor.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {scooter.bestFor.map(bf => (
                        <span key={bf} className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          {bf}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 3 Key Spec Pills */}
                  <div className="grid grid-cols-3 gap-1.5 text-center p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Range</span>
                      <span className="font-bold text-[#0A3D91] tabular-nums text-xs">
                        {scooter.rangeKm} km
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Speed</span>
                      <span className="font-bold text-slate-800 tabular-nums text-xs">
                        {scooter.topSpeedKmph} km/h
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Battery</span>
                      <span className="font-bold text-slate-800 tabular-nums text-[11px] truncate block">
                        {scooter.batterySpecs}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On-Road</span>
                      <div className="text-lg font-bold text-slate-900 tabular-nums">
                        <span className="text-slate-400 text-xs font-medium mr-0.5">₹</span>
                        {scooter.onRoadPrice.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {scooter.startingEmi > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">From</span>
                        <div className="text-xs font-bold text-[#1B662C] tabular-nums">
                          ₹{scooter.startingEmi.toLocaleString('en-IN')}/mo
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2 Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailModalScooter(scooter);
                      }}
                      className="py-2 px-3 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>View Specs</span>
                    </button>

                    <button
                      onClick={(e) => handleCreateVoucher(scooter.id, e)}
                      className="py-2 px-3 bg-[#65B32E] hover:bg-[#1B662C] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] transition-colors shadow-subtle active:scale-[0.98]"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Quote / Voucher</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isAddEditOpen && (
        <AddEditScooterModal 
          isOpen={isAddEditOpen} 
          onClose={() => setIsAddEditOpen(false)} 
          scooterToEdit={editingScooter} 
        />
      )}

      {detailModalScooter && (
        <ScooterDetailModal
          scooter={detailModalScooter}
          isOpen={!!detailModalScooter}
          onClose={() => setDetailModalScooter(null)}
        />
      )}
    </div>
  );
};

export default Catalogue;
