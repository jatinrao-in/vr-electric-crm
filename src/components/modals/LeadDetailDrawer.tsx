import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MessageSquare, 
  Calendar, 
  History, 
  Send,
  AlertCircle
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { LeadStatus, LeadActivity } from '../../types';
import { TIME_SLOTS, STATUS_COLORS } from '../../lib/constants';
import { formatDateTime, formatDateOnly, formatPhone, buildWhatsAppLink } from '../../lib/utils';

interface LeadDetailDrawerProps {
  leadId: string;
  onClose: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ leadId, onClose }) => {
  const { leads, logCallActivity, fetchActivitiesForLead, settings } = useCRM();
  const { currentUser } = useAuth();

  const lead = leads.find(l => l.id === leadId);

  const [callOutcome, setCallOutcome] = useState(settings.callOutcomes[0] || 'Interested');
  const [newStatus, setNewStatus] = useState<LeadStatus>(lead?.status || 'Contacted');
  const [remark, setRemark] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0]
  );
  const [followUpTimeSlot, setFollowUpTimeSlot] = useState('11:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [timelineActivities, setTimelineActivities] = useState<LeadActivity[]>([]);

  useEffect(() => {
    if (leadId) {
      fetchActivitiesForLead(leadId).then(acts => {
        setTimelineActivities(acts);
      });
      if (lead) {
        setNewStatus(lead.status);
      }
    }
  }, [leadId, lead]);

  if (!lead) return null;

  const isClosedStatus = newStatus === 'Converted' || newStatus === 'Sold' || newStatus === 'Not Interested' || newStatus === 'Lost' || newStatus === 'Junk';

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!remark.trim()) {
      setError('Please enter remarks');
      return;
    }

    if (!isClosedStatus && !nextFollowUpDate) {
      setError('Select follow-up date');
      return;
    }

    setIsSubmitting(true);

    await logCallActivity(leadId, {
      type: 'CALL_LOG',
      callOutcome,
      remark: remark.trim(),
      previousStatus: lead.status,
      newStatus,
      scheduledFollowUp: isClosedStatus ? null : nextFollowUpDate,
      timeSlot: isClosedStatus ? null : followUpTimeSlot,
      performedBy: currentUser?.uid || 'user',
      performedByName: currentUser?.name || 'Sales',
    });

    const refreshed = await fetchActivitiesForLead(leadId);
    setTimelineActivities(refreshed);

    setRemark('');
    setIsSubmitting(false);
  };

  const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS['New'];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch justify-end">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer / Sheet */}
      <div className="relative w-full md:max-w-xl bg-white h-[90vh] md:h-full rounded-t-2xl md:rounded-none shadow-large flex flex-col z-10 animate-slide-up md:animate-in overflow-hidden">
        {/* Mobile handle */}
        <div className="md:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate font-display">
                {lead.customerName}
              </h2>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border tabular-nums"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
              >
                {statusStyle.label}
              </span>
            </div>
            <div className="text-xs text-slate-500 tabular-nums mt-0.5">
              {formatPhone(lead.phoneNumber)} • <span className="font-sans">{lead.preferredModel}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Call */}
            <a
              href={`tel:${lead.phoneNumber}`}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>

            {/* WhatsApp */}
            <a
              href={buildWhatsAppLink(lead.phoneNumber, lead.customerName, lead.preferredModel)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Budget</span>
              <span className="font-bold text-slate-900 tabular-nums">{lead.budget}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Purpose</span>
              <span className="font-bold text-slate-900 truncate block">{lead.purpose}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Calls</span>
              <span className="font-bold text-primary tabular-nums">{lead.totalCallsCount || 0}</span>
            </div>
          </div>

          {/* LOG CALL FORM */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Log Call Outcome
            </h4>

            {error && (
              <div className="p-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogCall} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Outcome</label>
                  <select
                    value={callOutcome}
                    onChange={(e) => setCallOutcome(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px]"
                  >
                    {settings.callOutcomes.map((co) => (
                      <option key={co} value={co}>{co}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
                    className="w-full px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none min-h-[44px] font-semibold"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested / Hot">Hot</option>
                    <option value="Visit Scheduled">Visit Set</option>
                    <option value="Converted">Sold</option>
                    <option value="Not Interested">Lost</option>
                    <option value="Junk">Junk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Remarks</label>
                <textarea
                  rows={2}
                  required
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Summary of discussion..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {!isClosedStatus && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Next Date</label>
                    <input
                      type="date"
                      required
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md tabular-nums min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Time</label>
                    <select
                      value={followUpTimeSlot}
                      onChange={(e) => setFollowUpTimeSlot(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-md min-h-[40px]"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary hover:bg-[#1D4ED8] rounded-lg shadow-subtle min-h-[44px] transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save & Update'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* TIMELINE */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider">
              <span>Activity History ({timelineActivities.length})</span>
            </div>

            {timelineActivities.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                No activity yet
              </div>
            ) : (
              <div className="space-y-2">
                {timelineActivities.map((act) => (
                  <div key={act.activityId} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {act.callOutcome || act.type}
                        {act.newStatus && <span className="text-slate-500 font-normal ml-1">→ {act.newStatus}</span>}
                      </span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{act.remark}</p>
                    <div className="text-[10px] text-slate-400 flex justify-between pt-1">
                      <span>By: {act.performedByName}</span>
                      {act.scheduledFollowUp && <span className="text-primary tabular-nums">Next: {act.scheduledFollowUp}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailDrawer;
