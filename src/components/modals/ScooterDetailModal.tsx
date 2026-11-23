import React from 'react';
import { 
  X, 
  BatteryCharging, 
  Gauge, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText,
  CreditCard
} from 'lucide-react';
import { Scooter } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ScooterDetailModalProps {
  scooter: Scooter | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScooterDetailModal: React.FC<ScooterDetailModalProps> = ({
  scooter,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !scooter) return null;

  const handleCreateVoucher = () => {
    onClose();
    navigate(`/vouchers/new?scooterId=${scooter.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-sheet sm:shadow-large border border-[#E2E8F0] overflow-hidden z-10 animate-slide-up sm:animate-in max-h-[92vh] flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-300" />
        </div>

        {/* 16:9 Hero Image Banner */}
        <div className="aspect-video w-full bg-slate-100 relative overflow-hidden flex-shrink-0">
          <img 
            src={scooter.imageUrl} 
            alt={scooter.modelName} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                scooter.rtoType.includes('Non-RTO') 
                  ? 'bg-amber-400 text-slate-900' 
                  : 'bg-[#65B32E] text-white'
              }`}>
                {scooter.rtoType.includes('Non-RTO') ? 'Non-RTO (No License)' : 'RTO Certified'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                scooter.inStock ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
              }`}>
                {scooter.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display">{scooter.modelName}</h2>
          </div>
        </div>

        {/* Modal Specs Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Key Spec Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Range</span>
              <div className="text-base sm:text-lg font-bold text-[#0A3D91] tabular-nums mt-0.5">
                {scooter.rangeKm} <span className="text-xs font-normal">km</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Top Speed</span>
              <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                {scooter.topSpeedKmph} <span className="text-xs font-normal">km/h</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Battery</span>
              <div className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums mt-1">
                {scooter.batterySpecs}
              </div>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">On-Road Showroom Price</span>
              <div className="text-xl font-bold text-slate-900 tabular-nums">
                <span className="text-slate-400 text-sm font-medium mr-0.5">₹</span>
                {scooter.onRoadPrice.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Easy Finance From</span>
              <div className="text-base font-bold text-[#1B662C] tabular-nums">
                ₹{scooter.startingEmi.toLocaleString('en-IN')}<span className="text-xs font-normal">/mo</span>
              </div>
              <span className="text-[10px] text-slate-500">Min. Down: ₹{scooter.minDownPayment.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Detailed Specs Table */}
          <div className="space-y-1.5 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 border-b border-slate-200">
              Technical Specifications
            </div>
            <div className="divide-y divide-slate-100 px-3 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Battery Chemistry:</span>
                <span className="font-semibold text-slate-900">{scooter.batteryChemistry}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Battery Type:</span>
                <span className="font-semibold text-slate-900">{scooter.batteryType}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Charging Time:</span>
                <span className="font-semibold text-slate-900">{scooter.chargingTimeHours}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">Warranty Coverage:</span>
                <span className="font-semibold text-slate-900">{scooter.warrantyDetails}</span>
              </div>
            </div>
          </div>

          {/* Colors */}
          {scooter.availableColors && scooter.availableColors.length > 0 && (
            <div>
              <span className="font-bold text-slate-800 block mb-1.5">Color Options</span>
              <div className="flex flex-wrap gap-1.5">
                {scooter.availableColors.map((col) => (
                  <span key={col} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {scooter.keyFeatures && scooter.keyFeatures.length > 0 && (
            <div>
              <span className="font-bold text-slate-800 block mb-1.5">Standard Equipment & Features</span>
              <div className="grid grid-cols-2 gap-1.5">
                {scooter.keyFeatures.map((feat) => (
                  <div key={feat} className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#65B32E] flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Actions */}
        <div className="p-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px]"
          >
            Close
          </button>
          
          <button
            onClick={handleCreateVoucher}
            className="flex-1 py-2.5 px-4 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] flex items-center justify-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Customer Quotation / Voucher</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScooterDetailModal;
