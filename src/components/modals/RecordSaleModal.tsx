import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { cleanPhoneNumber } from '../../lib/utils';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({ isOpen, onClose }) => {
  const { settings, recordSale, checkDuplicatePhone, users } = useCRM();
  const { currentUser } = useAuth();

  const activeSalesmen = users.filter((u) => u.role === 'salesman' && u.isActive);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [scooterModel, setScooterModel] = useState(settings.scooterModels[1] || 'VR-Glide Pro (85km)');
  const [colorVariant, setColorVariant] = useState('Ocean Blue');
  const [chassisNumber, setChassisNumber] = useState('');
  const [finalSaleAmount, setFinalSaleAmount] = useState('85000');
  const [paymentMode, setPaymentMode] = useState<'Full Cash / UPI' | 'Loan / Finance' | 'Downpayment + EMI'>('Full Cash / UPI');
  const [closedBySalesmanId, setClosedBySalesmanId] = useState(activeSalesmen[0]?.uid || '');
  const [closedBySalesmanName, setClosedBySalesmanName] = useState(activeSalesmen[0]?.name || 'Direct Walk-in');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedLead = phoneNumber.length >= 10 ? checkDuplicatePhone(phoneNumber) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) return;

    setIsSubmitting(true);
    await recordSale({
      saleDate: new Date().toISOString().split('T')[0],
      invoiceNumber: invoiceNumber.trim() || null,
      customerName: customerName.trim(),
      phoneNumber: cleanPhoneNumber(phoneNumber),
      scooterModel,
      colorVariant,
      chassisNumber: chassisNumber.trim() || null,
      finalSaleAmount: Number(finalSaleAmount) || 0,
      paymentMode,
      closedBySalesmanId: closedBySalesmanId || null,
      closedBySalesmanName: closedBySalesmanName || 'Direct Walk-in',
      loggedBy: currentUser?.uid || 'owner',
    });

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-sheet sm:shadow-large border border-slate-200 overflow-hidden z-10 animate-slide-up sm:animate-in max-h-[92vh] flex flex-col">
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-300" />
        </div>

        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Record Sale</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none tabular-nums min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Vikas Malhotra"
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          {matchedLead && (
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Links to CRM lead: <strong>{matchedLead.customerName}</strong></span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
              <select
                value={scooterModel}
                onChange={(e) => setScooterModel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              >
                {settings.scooterModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Color</label>
              <input
                type="text"
                value={colorVariant}
                onChange={(e) => setColorVariant(e.target.value)}
                placeholder="Color"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                <input
                  type="number"
                  required
                  value={finalSaleAmount}
                  onChange={(e) => setFinalSaleAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none font-bold tabular-nums min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              >
                <option value="Full Cash / UPI">Full Cash / UPI</option>
                <option value="Loan / Finance">Loan / Finance</option>
                <option value="Downpayment + EMI">Downpayment + EMI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Salesman Credit</label>
            <select
              value={closedBySalesmanId}
              onChange={(e) => {
                const id = e.target.value;
                setClosedBySalesmanId(id);
                const found = activeSalesmen.find((s) => s.uid === id);
                setClosedBySalesmanName(found ? found.name : 'Direct Walk-in');
              }}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
            >
              <option value="">Direct Walk-in / Showroom</option>
              {activeSalesmen.map((s) => (
                <option key={s.uid} value={s.uid}>{s.name} (Sales)</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#65B32E] hover:bg-[#1B662C] rounded-lg shadow-subtle min-h-[44px] transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordSaleModal;
