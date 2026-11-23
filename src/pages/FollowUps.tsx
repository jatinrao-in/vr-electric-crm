import React, { useState, useMemo } from 'react';
import { 
  CalendarClock, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageSquare, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { isOverdue, isDueToday, formatPhone, buildWhatsAppLink } from '../lib/utils';
import { STATUS_COLORS } from '../lib/constants';
import LeadDetailDrawer from '../components/modals/LeadDetailDrawer';

export const FollowUps: React.FC = () => {
  const { leads } = useCRM();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'overdue' | 'today' | 'upcoming'>('today');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const userLeads = useMemo(() => {
    return leads.filter(l => {
      if (l.status === 'Converted' || l.status === 'Sold' || l.status === 'Not Interested' || l.status === 'Lost' || l.status === 'Junk') return false;
      if (currentUser?.role === 'salesman' && l.assignedTo !== currentUser.uid) return false;
      return true;
    });
  }, [leads, currentUser]);

  const overdueLeads = useMemo(() => {
    return userLeads.filter(l => isOverdue(l.nextFollowUpDate));
  }, [userLeads]);

  const todayLeads = useMemo(() => {
    return userLeads
      .filter(l => isDueToday(l.nextFollowUpDate))
      .sort((a, b) => (a.followUpTimeSlot || '').localeCompare(b.followUpTimeSlot || ''));
  }, [userLeads]);

  const upcomingLeads = useMemo(() => {
    return userLeads.filter(l => {
      if (!l.nextFollowUpDate) return false;
      return !isOverdue(l.nextFollowUpDate) && !isDueToday(l.nextFollowUpDate);
    }).sort((a, b) => (a.nextFollowUpDate || '').localeCompare(b.nextFollowUpDate || ''));
  }, [userLeads]);

  const currentTabLeads = activeTab === 'overdue' ? overdueLeads : activeTab === 'today' ? todayLeads : upcomingLeads;

  return (
    <div className="space-y-3.5 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-[#0A3D91]" /> Follow-ups
        </h1>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 tabular-nums">
          {userLeads.length} total
        </span>
      </div>

      {/* ============================================================ */}
      {/* 3 ACTIONABLE TABS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
        {/* Overdue */}
        <button
          onClick={() => setActiveTab('overdue')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
            activeTab === 'overdue'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Overdue</span>
          {overdueLeads.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
              activeTab === 'overdue' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
            }`}>
              {overdueLeads.length}
            </span>
          )}
        </button>

        {/* Today */}
        <button
          onClick={() => setActiveTab('today')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
            activeTab === 'today'
              ? 'bg-[#0A3D91] text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
            activeTab === 'today' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#0A3D91]'
          }`}>
            {todayLeads.length}
          </span>
        </button>

        {/* Upcoming */}
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
            activeTab === 'upcoming'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <span>Upcoming</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
            activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-800'
          }`}>
            {upcomingLeads.length}
          </span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAPPABLE MOBILE & DESKTOP CARDS */}
      {/* ============================================================ */}
      {currentTabLeads.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          <CheckCircle2 className="w-6 h-6 text-[#65B32E] mx-auto mb-1.5" />
          <span>No follow-ups in this queue</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {currentTabLeads.map((lead) => {
            const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS['New'];
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`p-3.5 sm:p-4 bg-white rounded-xl border shadow-subtle hover:border-[#0A3D91] active:scale-[0.99] transition-all space-y-2.5 ${
                  activeTab === 'overdue' ? 'border-red-200' : 'border-slate-200'
                }`}
              >
                {/* Top Row: Name + Time/Date Pill + Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                      {lead.customerName}
                    </h3>
                    {lead.followUpTimeSlot && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#0A3D91] tabular-nums">
                        {lead.followUpTimeSlot}
                      </span>
                    )}
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold border tabular-nums"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      borderColor: statusStyle.border,
                    }}
                  >
                    {statusStyle.label}
                  </span>
                </div>

                {/* Middle: Phone + Model */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-bold tabular-nums">
                    {formatPhone(lead.phoneNumber)}
                  </span>
                  <span className="text-slate-500 truncate max-w-[180px]">
                    {lead.preferredModel}
                  </span>
                </div>

                {lead.latestRemark && (
                  <p className="text-[11px] text-slate-500 line-clamp-1 italic bg-slate-50 p-1.5 rounded">
                    "{lead.latestRemark}"
                  </p>
                )}

                {/* Bottom: 44px Touch Targets (Call, WhatsApp, Call & Log) */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-5 gap-2" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`tel:${lead.phoneNumber}`}
                    className="col-span-1 min-h-[44px] flex items-center justify-center rounded-xl bg-[#65B32E]/10 text-[#1B662C] hover:bg-[#65B32E]/20 active:scale-95 transition-all"
                    title="Call"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <a
                    href={buildWhatsAppLink(lead.phoneNumber, lead.customerName, lead.preferredModel)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="col-span-1 min-h-[44px] flex items-center justify-center rounded-xl bg-teal-50 text-[#1B662C] hover:bg-teal-100 active:scale-95 transition-all"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="col-span-3 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#0A3D91] hover:bg-[#062463] text-white font-bold text-xs active:scale-98 transition-all"
                  >
                    <span>Log Call</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedLeadId && (
        <LeadDetailDrawer
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
};

export default FollowUps;
