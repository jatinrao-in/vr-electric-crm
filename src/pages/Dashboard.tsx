import React, { useState, useMemo } from 'react';
import { 
  Users, 
  PhoneCall, 
  CalendarClock, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  Plus, 
  Clock, 
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, isOverdue, isDueToday } from '../lib/utils';
import { ROLE_PERMISSIONS } from '../lib/constants';
import AddVisitorModal from '../components/modals/AddVisitorModal';
import RecordSaleModal from '../components/modals/RecordSaleModal';
import LeadDetailDrawer from '../components/modals/LeadDetailDrawer';

export const Dashboard: React.FC = () => {
  const { leads, adLogs, visitors, sales, activities } = useCRM();
  const { currentUser } = useAuth();

  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | '7days' | 'month' | 'all'>('all');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const role = currentUser?.role || 'owner';
  const roleConfig = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.owner;

  const filterBoundary = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    return { todayStr, yesterdayStr, sevenDaysAgo, monthAgo };
  }, []);

  const filteredLeads = useMemo(() => {
    if (dateRange === 'all') return leads;
    return leads.filter((l) => {
      const d = l.createdAt?.slice(0, 10);
      if (dateRange === 'today') return d === filterBoundary.todayStr;
      if (dateRange === 'yesterday') return d === filterBoundary.yesterdayStr;
      if (dateRange === '7days') return new Date(l.createdAt) >= filterBoundary.sevenDaysAgo;
      if (dateRange === 'month') return new Date(l.createdAt) >= filterBoundary.monthAgo;
      return true;
    });
  }, [leads, dateRange, filterBoundary]);

  const filteredAds = useMemo(() => {
    if (dateRange === 'all') return adLogs;
    return adLogs.filter((a) => {
      if (dateRange === 'today') return a.date === filterBoundary.todayStr;
      if (dateRange === 'yesterday') return a.date === filterBoundary.yesterdayStr;
      if (dateRange === '7days') return new Date(a.date) >= filterBoundary.sevenDaysAgo;
      if (dateRange === 'month') return new Date(a.date) >= filterBoundary.monthAgo;
      return true;
    });
  }, [adLogs, dateRange, filterBoundary]);

  const filteredVisitors = useMemo(() => {
    if (dateRange === 'all') return visitors;
    return visitors.filter((v) => {
      if (dateRange === 'today') return v.visitDate === filterBoundary.todayStr;
      if (dateRange === 'yesterday') return v.visitDate === filterBoundary.yesterdayStr;
      if (dateRange === '7days') return new Date(v.visitDate) >= filterBoundary.sevenDaysAgo;
      if (dateRange === 'month') return new Date(v.visitDate) >= filterBoundary.monthAgo;
      return true;
    });
  }, [visitors, dateRange, filterBoundary]);

  const filteredSales = useMemo(() => {
    if (dateRange === 'all') return sales;
    return sales.filter((s) => {
      if (dateRange === 'today') return s.saleDate === filterBoundary.todayStr;
      if (dateRange === 'yesterday') return s.saleDate === filterBoundary.yesterdayStr;
      if (dateRange === '7days') return new Date(s.saleDate) >= filterBoundary.sevenDaysAgo;
      if (dateRange === 'month') return new Date(s.saleDate) >= filterBoundary.monthAgo;
      return true;
    });
  }, [sales, dateRange, filterBoundary]);

  // Aggregates (Strictly Realtime from Firestore)
  const totalCrmLeads = filteredLeads.length;
  const totalCallsCount = filteredLeads.reduce((acc, curr) => acc + (curr.totalCallsCount || 0), 0);
  const pendingFollowUps = leads.filter(l => 
    l.status !== 'Converted' && l.status !== 'Sold' && l.status !== 'Not Interested' && l.status !== 'Lost' && l.status !== 'Junk' &&
    (isOverdue(l.nextFollowUpDate) || isDueToday(l.nextFollowUpDate))
  ).length;
  const totalWalkIns = filteredVisitors.length;
  const totalScootersSold = filteredSales.length;
  const totalRevenue = filteredSales.reduce((acc, curr) => acc + (curr.finalSaleAmount || 0), 0);
  const totalAdSpend = filteredAds.reduce((acc, curr) => acc + (curr.amountSpent || 0), 0);

  // Charts
  const funnelData = [
    { name: 'Leads', count: totalCrmLeads, fill: '#0A3D91' },
    { name: 'Contacted', count: filteredLeads.filter(l => l.status !== 'New').length, fill: '#1B662C' },
    { name: 'Visited', count: totalWalkIns, fill: '#0D9488' },
    { name: 'Sold', count: totalScootersSold, fill: '#65B32E' },
  ];

  const purposeCounts: Record<string, number> = {};
  filteredLeads.forEach(l => {
    const p = l.purpose ? l.purpose.split(' ')[0] : 'Other';
    purposeCounts[p] = (purposeCounts[p] || 0) + 1;
  });
  const purposePieData = Object.keys(purposeCounts).map(k => ({ name: k, value: purposeCounts[k] }));
  const PIE_COLORS = ['#0A3D91', '#65B32E', '#0D9488', '#B45309'];

  const allActivitiesList = useMemo(() => {
    const list: any[] = [];
    Object.values(activities).forEach(arr => {
      arr.forEach(a => list.push(a));
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [activities]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1. Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <span className="text-[11px] font-bold text-[#65B32E] tracking-wider uppercase block mt-0.5">
            VR Electric Live Operations
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-lg shadow-subtle self-start sm:self-auto text-xs">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: '7D' },
            { id: 'month', label: 'Month' },
            { id: 'all', label: 'All' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setDateRange(pill.id as any)}
              className={`px-2.5 py-1.5 rounded-md font-bold transition-colors min-h-[36px] sm:min-h-auto ${
                dateRange === pill.id
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 6 KPI Cards (3-Element: Icon, 2-word label, tabular number) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Leads</span>
            <Users className="w-4 h-4 text-[#0A3D91]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-[#0A3D91] tabular-nums">
            {totalCrmLeads}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Calls Logged</span>
            <PhoneCall className="w-4 h-4 text-[#1B662C]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalCallsCount}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Calls</span>
            <CalendarClock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-amber-600 tabular-nums">
            {pendingFollowUps}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Walk-In Visits</span>
            <Store className="w-4 h-4 text-[#0A3D91]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalWalkIns}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#DCFCE7] bg-[#F4FBF0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#1B662C] mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B662C]">Units Sold</span>
            <ShoppingBag className="w-4 h-4 text-[#65B32E]" />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-[#1B662C] tabular-nums">
            {totalScootersSold}
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Ad Spend</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 tabular-nums flex items-baseline">
            <span className="text-slate-400 font-medium mr-0.5 text-base">₹</span>
            <span>{totalAdSpend.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. Owner & Admin Quick Actions */}
      {roleConfig.canAddSales && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#062463] to-[#0A3D91] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-medium">
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#65B32E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xs sm:text-sm">Showroom Fast Actions</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg min-h-[44px] transition-all border border-white/20"
            >
              <Store className="w-3.5 h-3.5 text-[#65B32E]" />
              <span>+ Log Walk-In</span>
            </button>

            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg min-h-[44px] transition-all active:scale-[0.98] shadow-subtle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Record Sale</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Live Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Conversion Funnel */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Conversion Funnel</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-[#0A3D91]">Realtime</span>
          </div>

          {totalCrmLeads === 0 && totalWalkIns === 0 && totalScootersSold === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-400">
              No leads or sales recorded yet
            </div>
          ) : (
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 15, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={65} tick={{ fontSize: 11, fill: '#64748B', fontFamily: "'Lato', sans-serif" }} />
                  <Tooltip 
                    formatter={(val: any) => [`${val}`, 'Count']}
                    contentStyle={{ backgroundColor: '#062463', color: '#FFF', borderRadius: '8px', fontSize: '11px', border: 'none', fontFamily: "'Lato', sans-serif" }}
                    itemStyle={{ fontFamily: "'Lato', sans-serif" }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Buyer Segments */}
        <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Lead Purpose</h3>
          </div>

          {purposePieData.length === 0 ? (
            <div className="h-36 flex items-center justify-center text-xs text-slate-400">
              No purpose segments logged yet
            </div>
          ) : (
            <>
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={purposePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {purposePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#062463', color: '#FFF', borderRadius: '8px', fontSize: '11px', border: 'none', fontFamily: "'Lato', sans-serif" }}
                      itemStyle={{ fontFamily: "'Lato', sans-serif" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 font-medium pt-2 border-t border-slate-100 flex-wrap">
                {purposePieData.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span>{item.name}: <strong className="tabular-nums">{item.value}</strong></span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 5. Live Recent Activity */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#0A3D91]" />
            <span>Recent Activity</span>
          </div>
          <span className="text-[10px] text-slate-400">Realtime</span>
        </div>

        {allActivitiesList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">No activity logged yet</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allActivitiesList.map((act) => (
              <div key={act.activityId} className="py-2 flex items-center justify-between text-xs gap-2">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#65B32E] flex-shrink-0" />
                  <span className="font-bold text-slate-900 truncate">{act.performedByName}:</span>
                  <span className="text-slate-600 truncate">{act.remark || act.callOutcome}</span>
                </div>
                <span className="text-[10px] text-slate-400 tabular-nums flex-shrink-0">
                  {formatDateTime(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isVisitorModalOpen && (
        <AddVisitorModal isOpen={isVisitorModalOpen} onClose={() => setIsVisitorModalOpen(false)} />
      )}
      {isSaleModalOpen && (
        <RecordSaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} />
      )}
      {selectedLeadId && (
        <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
    </div>
  );
};

export default Dashboard;
