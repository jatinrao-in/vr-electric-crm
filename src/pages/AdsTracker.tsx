import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  AlertTriangle
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import AddAdLogModal from '../components/modals/AddAdLogModal';

export const AdsTracker: React.FC = () => {
  const { adLogs, leads, sales } = useCRM();
  const { currentUser } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const totalSpend = adLogs.reduce((acc, curr) => acc + (curr.amountSpent || 0), 0);
  const totalWhatsAppLeads = adLogs.reduce((acc, curr) => acc + (curr.whatsappLeadsReceived || 0), 0);
  const totalCrmLeads = leads.length;
  const overallCPL = totalCrmLeads > 0 ? Math.round(totalSpend / totalCrmLeads) : 0;
  const overallCPA = sales.length > 0 ? Math.round(totalSpend / sales.length) : 0;

  return (
    <div className="space-y-3.5 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" /> Ads Tracker
        </h1>

        {(currentUser?.role === 'ads_manager' || currentUser?.role === 'master_admin' || (currentUser?.role as any) === 'super_admin') && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Spend</span>
          </button>
        )}
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ad Spend</span>
          <div className="text-xl md:text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
            <span className="text-slate-400 text-sm font-medium mr-0.5">₹</span>
            {totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Leads</span>
          <div className="text-xl md:text-2xl font-bold text-primary tabular-nums mt-0.5">
            {totalWhatsAppLeads}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost / Lead (CPL)</span>
          <div className="text-xl md:text-2xl font-bold text-rose-600 tabular-nums mt-0.5">
            <span className="text-slate-400 text-sm font-medium mr-0.5">₹</span>
            {overallCPL}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-subtle">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Cost / Sale (CPA)</span>
          <div className="text-xl md:text-2xl font-bold text-emerald-700 tabular-nums mt-0.5">
            <span className="text-emerald-400 text-sm font-medium mr-0.5">₹</span>
            {overallCPA}
          </div>
        </div>
      </div>

      {/* Mobile Cards & Desktop Table */}
      <div className="space-y-2 md:space-y-0">
        {/* Mobile View */}
        <div className="md:hidden space-y-2.5">
          {adLogs.map((log) => {
            const metaLeads = log.whatsappLeadsReceived || 0;
            const crmLeads = log.crmLeadsEntered || 0;
            const diff = Math.max(0, metaLeads - crmLeads);
            const leakage = metaLeads > 0 ? Math.round((diff / metaLeads) * 100) : 0;
            const cpl = crmLeads > 0 ? Math.round(log.amountSpent / crmLeads) : 0;

            return (
              <div key={log.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 tabular-nums">{log.date}</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    ₹{log.amountSpent.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-700 truncate">{log.campaignName}</div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <span>Leads: <strong className="tabular-nums text-primary">{log.whatsappLeadsReceived}</strong></span>
                  <span>CPL: <strong className="tabular-nums text-rose-600">₹{cpl}</strong></span>
                  {leakage > 0 && (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-bold">
                      {leakage}% Leak
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Spend</th>
                <th className="px-4 py-3">Leads</th>
                <th className="px-4 py-3">CRM Added</th>
                <th className="px-4 py-3">Leakage</th>
                <th className="px-4 py-3">CPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adLogs.map((log) => {
                const metaLeads = log.whatsappLeadsReceived || 0;
                const crmLeads = log.crmLeadsEntered || 0;
                const diff = Math.max(0, metaLeads - crmLeads);
                const leakage = metaLeads > 0 ? Math.round((diff / metaLeads) * 100) : 0;
                const cpl = crmLeads > 0 ? Math.round(log.amountSpent / crmLeads) : 0;

                return (
                  <tr key={log.id} className="hover:bg-blue-50/20">
                    <td className="px-4 py-3 text-slate-700 tabular-nums">{log.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs truncate">{log.campaignName}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 tabular-nums">
                      ₹{log.amountSpent.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-bold text-primary tabular-nums">{log.whatsappLeadsReceived}</td>
                    <td className="px-4 py-3 font-bold text-emerald-600 tabular-nums">{log.crmLeadsEntered}</td>
                    <td className="px-4 py-3">
                      {leakage > 10 ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px] tabular-nums">
                          {leakage}%
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] tabular-nums">
                          {leakage}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600 tabular-nums">₹{cpl}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddAdLogModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

export default AdsTracker;
