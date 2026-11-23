import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { cleanPhoneNumber } from '../../lib/utils';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated?: (leadId: string) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onLeadCreated }) => {
  const { settings, users, addLead, checkDuplicatePhone } = useCRM();
  const { currentUser } = useAuth();

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [budget, setBudget] = useState(settings.budgetRanges[1] || '₹60k - ₹80k');
  const [purpose, setPurpose] = useState(settings.purposes[0] || 'Personal Commute');
  const [preferredModel, setPreferredModel] = useState(settings.scooterModels[1] || 'VR-Glide Pro (85km)');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [autoAssign, setAutoAssign] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const salesmen = users.filter(u => u.role === 'salesman' && u.isActive);
  const duplicateLead = phoneNumber.length >= 10 ? checkDuplicatePhone(phoneNumber) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = cleanPhoneNumber(phoneNumber);
    if (clean.length !== 10) {
      setError('Enter valid 10-digit number');
      return;
    }

    if (!customerName.trim()) {
      setError('Name required');
      return;
    }

    if (duplicateLead) {
      setError(`Already assigned to ${duplicateLead.assignedToName}`);
      return;
    }

    setIsSubmitting(true);

    let finalUid = assignedTo;
    let finalName = 'Unassigned';

    if (autoAssign && salesmen.length > 0) {
      const randomIndex = Math.floor(Math.random() * salesmen.length);
      finalUid = salesmen[randomIndex].uid;
      finalName = salesmen[randomIndex].name;
    } else {
      const match = salesmen.find(s => s.uid === assignedTo);
      if (match) {
        finalName = match.name;
      } else if (salesmen.length > 0) {
        finalUid = salesmen[0].uid;
        finalName = salesmen[0].name;
      }
    }

    const res = await addLead({
      customerName: customerName.trim(),
      phoneNumber: clean,
      alternatePhone: null,
      budget,
      purpose,
      preferredModel,
      leadSource: 'Meta WhatsApp Ad',
      status: 'New',
      assignedTo: finalUid,
      assignedToName: finalName,
      createdBy: currentUser?.uid || 'manager',
      latestRemark: notes.trim() || 'New Meta inquiry',
      nextFollowUpDate: new Date().toISOString().split('T')[0],
      followUpTimeSlot: '11:00 AM',
    });

    setIsSubmitting(false);

    if (res.success && res.leadId) {
      onClose();
      if (onLeadCreated) onLeadCreated(res.leadId);
    } else {
      setError(res.error || 'Failed to save');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Responsive Sheet (Bottom on Mobile, Center Modal on Desktop) */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-sheet sm:shadow-large border border-slate-200 overflow-hidden z-10 animate-slide-up sm:animate-in max-h-[92vh] flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">New Lead</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          {error && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-xs font-bold text-slate-400">+91</span>
              <input
                type="tel"
                maxLength={10}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="98765 43210"
                className="w-full pl-12 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none tabular-nums min-h-[44px]"
              />
            </div>

            {duplicateLead && (
              <div className="mt-1.5 p-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-medium">
                Already exists: <strong>{duplicateLead.customerName}</strong> ({duplicateLead.assignedToName})
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
            />
          </div>

          {/* Model & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Model</label>
              <select
                value={preferredModel}
                onChange={(e) => setPreferredModel(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              >
                {settings.scooterModels.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Budget</label>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
              >
                {settings.budgetRanges.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
            >
              {settings.purposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Assignment */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Assign Salesman</span>
              <label className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  className="rounded border-slate-300 text-primary"
                />
                Auto Round-Robin
              </label>
            </div>

            {!autoAssign && (
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-md focus:border-primary focus:outline-none min-h-[44px]"
              >
                <option value="">Select</option>
                {salesmen.map((s) => (
                  <option key={s.uid} value={s.uid}>{s.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Initial Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Customer requirements..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Sticky Form Footer */}
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
              disabled={isSubmitting || !!duplicateLead}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-[#1D4ED8] rounded-lg shadow-subtle min-h-[44px] flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
