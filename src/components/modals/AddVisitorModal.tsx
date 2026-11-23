import React, { useState } from 'react';
import { X, Store, CheckCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { cleanPhoneNumber } from '../../lib/utils';

interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVisitorModal: React.FC<AddVisitorModalProps> = ({ isOpen, onClose }) => {
  const { settings, addShowroomVisitor, checkDuplicatePhone, users } = useCRM();
  const { currentUser } = useAuth();

  const [visitorName, setVisitorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [purpose, setPurpose] = useState(settings.purposes[0] || 'Personal Commute');
  const [modelExplored, setModelExplored] = useState(settings.scooterModels[1] || 'VR-Glide Pro');
  const [testRideTaken, setTestRideTaken] = useState(true);
  const [attendedBy, setAttendedBy] = useState(currentUser?.name || 'Showroom Staff');
  const [visitOutcome, setVisitOutcome] = useState<'Booked / Purchased' | 'Will Decide Soon' | 'Price Issue' | 'Just Exploring'>('Will Decide Soon');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedLead = phoneNumber.length >= 10 ? checkDuplicatePhone(phoneNumber) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    setIsSubmitting(true);
    await addShowroomVisitor({
      visitDate: new Date().toISOString().split('T')[0],
      visitorName: visitorName.trim(),
      phoneNumber: cleanPhoneNumber(phoneNumber),
      purpose,
      modelExplored,
      testRideTaken,
      attendedBy,
      visitOutcome,
      remarks: remarks.trim() || 'Showroom visit',
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

        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">Log Visitor</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
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
            {matchedLead && (
              <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Matched CRM Lead: <strong>{matchedLead.customerName}</strong></span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Visitor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
              <select
                value={modelExplored}
                onChange={(e) => setModelExplored(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              >
                {settings.scooterModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Outcome</label>
              <select
                value={visitOutcome}
                onChange={(e) => setVisitOutcome(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              >
                <option value="Booked / Purchased">Booked</option>
                <option value="Will Decide Soon">Will Decide Soon</option>
                <option value="Price Issue">Price Issue</option>
                <option value="Just Exploring">Just Exploring</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Test Ride Taken?</span>
            <input
              type="checkbox"
              checked={testRideTaken}
              onChange={(e) => setTestRideTaken(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Customer impressions..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none resize-none"
            />
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#0A3D91] hover:bg-[#062463] rounded-lg shadow-subtle min-h-[44px] transition-all"
            >
              {isSubmitting ? 'Saving...' : 'Save Visitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVisitorModal;
