import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Trophy, 
  Download
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { exportToCSV } from '../lib/utils';

export const Reports: React.FC = () => {
  const { leads, visitors, sales, users, adLogs } = useCRM();
  const [selectedDataset, setSelectedDataset] = useState<'leads' | 'visitors' | 'sales' | 'ads'>('leads');

  const salesmen = users.filter((u) => u.role === 'salesman');

  const salesmanMetrics = salesmen.map((salesman) => {
    const assignedLeads = leads.filter((l) => l.assignedTo === salesman.uid);
    const leadsCount = assignedLeads.length;
    const callsMade = assignedLeads.reduce((acc, curr) => acc + (curr.totalCallsCount || 0), 0);
    const visitsGenerated = assignedLeads.filter((l) => l.isVisited).length;
    const closedSales = sales.filter((s) => s.closedBySalesmanId === salesman.uid || s.closedBySalesmanName.includes(salesman.name)).length;
    const conversionRate = leadsCount > 0 ? Math.round((closedSales / leadsCount) * 100) : 0;

    return {
      uid: salesman.uid,
      name: salesman.name,
      leadsCount,
      callsMade,
      visitsGenerated,
      closedSales,
      conversionRate,
    };
  });

  const handleDownloadDataset = () => {
    if (selectedDataset === 'leads') {
      const rows = leads.map((l) => ({
        'Customer': l.customerName,
        'Phone': l.phoneNumber,
        'Budget': l.budget,
        'Purpose': l.purpose,
        'Model': l.preferredModel,
        'Status': l.status,
        'Assigned': l.assignedToName,
        'Calls': l.totalCallsCount,
        'Next Follow Up': l.nextFollowUpDate || 'None',
      }));
      exportToCSV('VR_Electric_Leads', rows);
    } else if (selectedDataset === 'visitors') {
      const rows = visitors.map((v) => ({
        'Date': v.visitDate,
        'Visitor': v.visitorName,
        'Phone': v.phoneNumber,
        'Model': v.modelExplored,
        'Test Ride': v.testRideTaken ? 'Yes' : 'No',
        'Outcome': v.visitOutcome,
      }));
      exportToCSV('VR_Electric_Visitors', rows);
    } else if (selectedDataset === 'sales') {
      const rows = sales.map((s) => ({
        'Date': s.saleDate,
        'Invoice': s.invoiceNumber || 'N/A',
        'Customer': s.customerName,
        'Phone': s.phoneNumber,
        'Model': s.scooterModel,
        'Amount': s.finalSaleAmount,
        'Salesman': s.closedBySalesmanName,
      }));
      exportToCSV('VR_Electric_Sales', rows);
    } else if (selectedDataset === 'ads') {
      const rows = adLogs.map((a) => ({
        'Date': a.date,
        'Campaign': a.campaignName,
        'Spend': a.amountSpent,
        'Leads': a.whatsappLeadsReceived,
      }));
      exportToCSV('VR_Electric_Ads', rows);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-primary" /> Reports
        </h1>
      </div>

      {/* Leaderboard Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Sales Leaderboard</span>
          </div>
        </div>

        {/* Mobile View */}
        {salesmanMetrics.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No sales team members registered yet.
          </div>
        ) : (
          <>
            <div className="md:hidden divide-y divide-slate-100">
              {salesmanMetrics.map((sm, index) => (
                <div key={sm.uid} className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">#{index + 1} {sm.name}</span>
                    <span className="font-bold text-[#1B662C] text-xs tabular-nums">{sm.closedSales} sold</span>
                  </div>
                  <div className="grid grid-cols-3 text-xs text-slate-500 pt-1">
                    <span>Leads: <strong className="tabular-nums text-slate-800">{sm.leadsCount}</strong></span>
                    <span>Calls: <strong className="tabular-nums text-slate-800">{sm.callsMade}</strong></span>
                    <span>Conv: <strong className="tabular-nums text-[#1B662C]">{sm.conversionRate}%</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3">Rank & Salesman</th>
                    <th className="px-4 py-3">Leads</th>
                    <th className="px-4 py-3">Calls</th>
                    <th className="px-4 py-3">Visits</th>
                    <th className="px-4 py-3">Sold</th>
                    <th className="px-4 py-3">Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesmanMetrics.map((sm, index) => (
                    <tr key={sm.uid} className="hover:bg-blue-50/20">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        #{index + 1} {sm.name}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700">{sm.leadsCount}</td>
                      <td className="px-4 py-3 tabular-nums text-[#0A3D91] font-bold">{sm.callsMade}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-700">{sm.visitsGenerated}</td>
                      <td className="px-4 py-3 tabular-nums text-[#1B662C] font-bold">{sm.closedSales}</td>
                      <td className="px-4 py-3 tabular-nums font-bold text-[#1B662C]">{sm.conversionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* CSV Exporter */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Export Data
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { id: 'leads', label: 'Leads' },
            { id: 'sales', label: 'Sales' },
            { id: 'visitors', label: 'Visitors' },
            { id: 'ads', label: 'Ad Logs' },
          ].map((ds) => (
            <button
              key={ds.id}
              type="button"
              onClick={() => setSelectedDataset(ds.id as any)}
              className={`p-2.5 rounded-lg border text-center font-bold min-h-[44px] transition-all ${
                selectedDataset === ds.id
                  ? 'border-[#0A3D91] bg-blue-50 text-[#0A3D91]'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ds.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleDownloadDataset}
          className="w-full py-2.5 bg-[#0A3D91] hover:bg-[#062463] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] flex items-center justify-center gap-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  );
};

export default Reports;
