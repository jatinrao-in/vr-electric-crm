import React, { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  Plus, 
  Download, 
  CheckCircle, 
  CheckCircle2, 
  Phone
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatPhone, exportToCSV } from '../lib/utils';
import AddVisitorModal from '../components/modals/AddVisitorModal';
import RecordSaleModal from '../components/modals/RecordSaleModal';

export const VisitorsSales: React.FC = () => {
  const { visitors, sales } = useCRM();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'visitors' | 'sales'>('visitors');
  const [isVisitorModalOpen, setIsVisitorModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  const role = currentUser?.role || 'owner';
  const canLogVisitor = role === 'master_admin' || role === 'owner' || role === 'manager' || (role as any) === 'super_admin';
  const canRecordSale = role === 'master_admin' || role === 'owner' || (role as any) === 'super_admin';

  const handleExportSales = () => {
    const rows = sales.map((s) => ({
      'Sale Date': s.saleDate,
      'Invoice': s.invoiceNumber || 'N/A',
      'Customer': s.customerName,
      'Phone': s.phoneNumber,
      'Model': s.scooterModel,
      'Color': s.colorVariant,
      'Amount': s.finalSaleAmount,
      'Payment': s.paymentMode,
      'Salesman': s.closedBySalesmanName,
    }));
    exportToCSV('VR_Electric_Sales', rows);
  };

  const handleExportVisitors = () => {
    const rows = visitors.map((v) => ({
      'Date': v.visitDate,
      'Visitor': v.visitorName,
      'Phone': v.phoneNumber,
      'Model': v.modelExplored,
      'Test Ride': v.testRideTaken ? 'Yes' : 'No',
      'Attended': v.attendedBy,
      'Outcome': v.visitOutcome,
      'Remarks': v.remarks,
    }));
    exportToCSV('VR_Electric_Visitors', rows);
  };

  return (
    <div className="space-y-3.5 md:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight">
          Showroom & Sales
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            onClick={activeTab === 'visitors' ? handleExportVisitors : handleExportSales}
            className="p-2 sm:px-3 sm:py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {activeTab === 'visitors' && canLogVisitor && (
            <button
              onClick={() => setIsVisitorModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0A3D91] hover:bg-[#062463] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Visitor</span>
            </button>
          )}

          {activeTab === 'sales' && canRecordSale && (
            <button
              onClick={() => setIsSaleModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Sale</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs sm:text-sm font-bold">
        <button
          onClick={() => setActiveTab('visitors')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all min-h-[44px] sm:min-h-auto ${
            activeTab === 'visitors'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Walk-Ins ({visitors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`pb-2.5 flex items-center gap-2 border-b-2 transition-all min-h-[44px] sm:min-h-auto ${
            activeTab === 'sales'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sales Ledger ({sales.length})</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* TAB A: VISITORS */}
      {/* ============================================================ */}
      {activeTab === 'visitors' && (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-2.5">
            {visitors.map((v) => (
              <div key={v.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm font-display">{v.visitorName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-primary">
                    {v.visitOutcome}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold tabular-nums">
                    {formatPhone(v.phoneNumber)}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {v.modelExplored}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>{v.visitDate}</span>
                  <span>{v.testRideTaken ? '✓ Test Ride' : 'No Ride'}</span>
                  <span>{v.attendedBy.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Test Ride</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Attended</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-blue-50/20">
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{v.visitDate}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{v.visitorName}</span>
                      <span className="text-slate-400 text-[11px] tabular-nums">{formatPhone(v.phoneNumber)}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{v.modelExplored}</td>
                    <td className="px-4 py-3">
                      {v.testRideTaken ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Yes</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{v.visitOutcome}</td>
                    <td className="px-4 py-3 text-slate-500">{v.attendedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* TAB B: SALES */}
      {/* ============================================================ */}
      {activeTab === 'sales' && (
        <>
          {/* Mobile Cards */}
          <div className="md:hidden space-y-2.5">
            {sales.map((s) => (
              <div key={s.id} className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm font-display">{s.customerName}</span>
                  <span className="text-xs font-bold text-emerald-600 tabular-nums">
                    ₹{s.finalSaleAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium tabular-nums">{formatPhone(s.phoneNumber)}</span>
                  <span className="text-slate-500">{s.scooterModel} ({s.colorVariant})</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="tabular-nums">{s.invoiceNumber || s.saleDate}</span>
                  <span>{s.paymentMode}</span>
                  <span>{s.closedBySalesmanName.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Salesman</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-emerald-50/20">
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{s.saleDate}</td>
                    <td className="px-4 py-3 font-bold text-primary tabular-nums">{s.invoiceNumber ||'—'}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{s.customerName}</span>
                      <span className="text-slate-400 text-[11px] tabular-nums">{formatPhone(s.phoneNumber)}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{s.scooterModel} ({s.colorVariant})</td>
                    <td className="px-4 py-3 font-bold text-emerald-700 tabular-nums">
                      ₹{s.finalSaleAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.paymentMode}</td>
                    <td className="px-4 py-3 text-slate-500">{s.closedBySalesmanName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isVisitorModalOpen && (
        <AddVisitorModal isOpen={isVisitorModalOpen} onClose={() => setIsVisitorModalOpen(false)} />
      )}
      {isSaleModalOpen && (
        <RecordSaleModal isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} />
      )}
    </div>
  );
};

export default VisitorsSales;
