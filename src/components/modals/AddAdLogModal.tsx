import React, { useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';

interface AddAdLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAdLogModal: React.FC<AddAdLogModalProps> = ({ isOpen, onClose }) => {
  const { addAdLog } = useCRM();
  const { currentUser } = useAuth();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [campaignName, setCampaignName] = useState('Meta WhatsApp Ads');
  const [amountSpent, setAmountSpent] = useState('2000');
  const [impressions, setImpressions] = useState('15000');
  const [clicks, setClicks] = useState('350');
  const [whatsappLeadsReceived, setWhatsappLeadsReceived] = useState('25');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await addAdLog({
      date,
      timestamp: new Date().toISOString(),
      platform: 'Meta',
      campaignName: campaignName.trim(),
      amountSpent: Number(amountSpent) || 0,
      impressions: Number(impressions) || 0,
      clicks: Number(clicks) || 0,
      whatsappLeadsReceived: Number(whatsappLeadsReceived) || 0,
      crmLeadsEntered: Number(whatsappLeadsReceived) || 0,
      notes: notes.trim() || undefined,
      loggedBy: currentUser?.uid || 'ads_manager',
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

        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Log Ad Spend</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg tabular-nums min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Spend (₹)</label>
              <input
                type="number"
                required
                value={amountSpent}
                onChange={(e) => setAmountSpent(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg font-bold tabular-nums min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campaign</label>
            <input
              type="text"
              required
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Impressions</label>
              <input
                type="number"
                value={impressions}
                onChange={(e) => setImpressions(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-md tabular-nums min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Clicks</label>
              <input
                type="number"
                value={clicks}
                onChange={(e) => setClicks(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-md tabular-nums min-h-[40px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Leads</label>
              <input
                type="number"
                value={whatsappLeadsReceived}
                onChange={(e) => setWhatsappLeadsReceived(e.target.value)}
                className="w-full px-2 py-1.5 text-xs border rounded-md font-bold text-primary tabular-nums min-h-[40px]"
              />
            </div>
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
              {isSubmitting ? 'Saving...' : 'Save Ad Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAdLogModal;
