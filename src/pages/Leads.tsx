import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  MessageSquare, 
  LayoutList, 
  LayoutGrid,
  ChevronRight,
  Lock
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { STATUS_COLORS, ROLE_PERMISSIONS } from '../lib/constants';
import { buildWhatsAppLink, formatPhone, cleanPhoneNumber } from '../lib/utils';
import AddLeadModal from '../components/modals/AddLeadModal';
import LeadDetailDrawer from '../components/modals/LeadDetailDrawer';

export const Leads: React.FC = () => {
  const { leads, settings, users } = useCRM();
  const { currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('All');
  const [selectedSalesman, setSelectedSalesman] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const role = currentUser?.role || 'salesman';
  const roleConfig = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.salesman;

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // salesman can ONLY see their assigned leads
      if (roleConfig.scopeSalesmanLeadsOnly && lead.assignedTo !== currentUser?.uid) {
        return false;
      }
      if (selectedSalesman !== 'All' && lead.assignedTo !== selectedSalesman) {
        return false;
      }
      if (selectedStatus !== 'All') {
        const leadMapped = STATUS_COLORS[lead.status]?.label || lead.status;
        const filterMapped = STATUS_COLORS[selectedStatus]?.label || selectedStatus;
        if (lead.status !== selectedStatus && leadMapped !== filterMapped) return false;
      }
      if (selectedPurpose !== 'All' && lead.purpose !== selectedPurpose) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const phone = cleanPhoneNumber(lead.phoneNumber);
        const matchName = lead.customerName.toLowerCase().includes(q);
        const matchPhone = phone.includes(q);
        const matchModel = lead.preferredModel.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchModel) return false;
      }
      return true;
    });
  }, [leads, currentUser, roleConfig, selectedSalesman, selectedStatus, selectedPurpose, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    leads.forEach((l) => {
      if (roleConfig.scopeSalesmanLeadsOnly && l.assignedTo !== currentUser?.uid) return;
      counts.All = (counts.All || 0) + 1;
      const key = STATUS_COLORS[l.status]?.label || l.status;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [leads, currentUser, roleConfig]);

  const activeSalesmen = users.filter((u) => u.role === 'salesman' && u.isActive);
  const filterTabs = ['All', 'New', 'Hot', 'Contacted', 'Visit Set', 'Sold', 'Lost'];

  return (
    <div className="space-y-3.5 md:space-y-5">
      {/* 1. Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight">
            {role === 'salesman' ? 'My Assigned Leads' : 'Leads'}
          </h1>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0A3D91] tabular-nums">
            {filteredLeads.length}
          </span>
          {role === 'owner' && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only
            </span>
          )}
        </div>

        {/* Add Lead CTA: Visible ONLY if role canEditLeads and is manager/master_admin */}
        {roleConfig.canEditLeads && (role === 'manager' || role === 'master_admin') && (
          <button
            onClick={() => setIsAddLeadOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Lead</span>
          </button>
        )}
      </div>

      {/* 2. Status Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {filterTabs.map((tab) => {
          const count = statusCounts[tab] || 0;
          const isSelected = selectedStatus === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                isSelected
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Search & Filters */}
      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, model..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0A3D91] focus:outline-none min-h-[44px] md:min-h-auto"
            />
          </div>

          <div>
            <select
              value={selectedPurpose}
              onChange={(e) => setSelectedPurpose(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0A3D91] focus:outline-none min-h-[44px] md:min-h-auto"
            >
              <option value="All">All Purposes</option>
              {settings.purposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {!roleConfig.scopeSalesmanLeadsOnly ? (
            <div>
              <select
                value={selectedSalesman}
                onChange={(e) => setSelectedSalesman(e.target.value)}
                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:border-[#0A3D91] focus:outline-none min-h-[44px] md:min-h-auto"
              >
                <option value="All">All Salesmen</option>
                {activeSalesmen.map((s) => (
                  <option key={s.uid} value={s.uid}>{s.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="hidden md:flex items-center justify-end text-xs font-semibold text-[#1B662C]">
              Your Queue Only
            </div>
          )}
        </div>

        {/* Desktop View Switcher */}
        <div className="hidden md:flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
          <span className="tabular-nums">{filteredLeads.length} leads matching</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded ${viewMode ==='table' ?'bg-slate-200 text-slate-900 font-bold' :'hover:bg-slate-100'}`}
              title="Table"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded ${viewMode ==='cards' ?'bg-slate-200 text-slate-900 font-bold' :'hover:bg-slate-100'}`}
              title="Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          No records yet
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredLeads.map((lead) => {
              const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS['New'];
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle active:border-[#0A3D91] transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-slate-900 truncate">
                      {lead.customerName}
                    </h3>
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

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-bold tabular-nums">
                      {formatPhone(lead.phoneNumber)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                      {lead.preferredModel} • {lead.budget}
                    </span>
                  </div>

                  {lead.latestRemark && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 italic bg-slate-50 p-1.5 rounded">
                      "{lead.latestRemark}"
                    </p>
                  )}

                  {/* Quick Action Touch Targets (Green Action Palette) */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-5 gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${lead.phoneNumber}`}
                      className="col-span-1 min-h-[44px] flex items-center justify-center rounded-xl bg-[#F4FBF0] text-[#1B662C] hover:bg-[#E7F7E0] active:scale-95 transition-all"
                      title="Call"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    <a
                      href={buildWhatsAppLink(lead.phoneNumber, lead.customerName, lead.preferredModel)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="col-span-1 min-h-[44px] flex items-center justify-center rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 active:scale-95 transition-all"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => setSelectedLeadId(lead.id)}
                      className="col-span-3 min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl bg-[#0A3D91] text-white font-bold text-xs hover:bg-[#062463] active:scale-98 transition-all"
                    >
                      <span>{role === 'owner' ? 'View Details' : 'Update'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E2E8F0] shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Model & Budget</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned</th>
                    <th className="px-4 py-3">Next Call</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const statusStyle = STATUS_COLORS[lead.status] || STATUS_COLORS['New'];
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {lead.customerName}
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-600 tabular-nums">
                          {formatPhone(lead.phoneNumber)}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          <span className="font-semibold">{lead.preferredModel}</span>
                          <span className="text-slate-400 text-[11px] block">{lead.budget}</span>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-0.5 rounded-full font-bold text-[10px] border tabular-nums"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.text,
                              borderColor: statusStyle.border,
                            }}
                          >
                            {statusStyle.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-600 font-medium">
                          {lead.assignedToName}
                        </td>

                        <td className="px-4 py-3 text-slate-700 tabular-nums">
                          {lead.nextFollowUpDate || '—'}
                        </td>

                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${lead.phoneNumber}`}
                              className="p-1.5 rounded-lg bg-[#F4FBF0] text-[#1B662C] hover:bg-[#E7F7E0]"
                              title="Call"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={buildWhatsAppLink(lead.phoneNumber, lead.customerName, lead.preferredModel)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100"
                              title="WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals & Drawer */}
      {isAddLeadOpen && (
        <AddLeadModal
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          onLeadCreated={(id) => setSelectedLeadId(id)}
        />
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

export default Leads;
