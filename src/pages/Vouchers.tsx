import React, { useState, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Search, 
  Printer, 
  MessageSquare, 
  Trash2, 
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { CustomerVoucher } from '../types';
import { formatPhone, cleanPhoneNumber } from '../lib/utils';
import { buildVoucherWhatsAppMessage } from '../lib/emi';

export const Vouchers: React.FC = () => {
  const { vouchers, deleteVoucher } = useCRM();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'All' | 'Quotation' | 'Booking'>('All');

  const role = currentUser?.role || 'salesman';
  const canDeleteVouchers = role === 'master_admin' || (role as any) === 'super_admin' || role === 'owner';

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((v) => {
      if (selectedTypeFilter === 'Quotation' && !v.voucherType.includes('Quotation')) {
        return false;
      }
      if (selectedTypeFilter === 'Booking' && !v.voucherType.includes('Booking')) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanP = cleanPhoneNumber(v.phoneNumber);
        const matchName = v.customerName.toLowerCase().includes(q);
        const matchPhone = cleanP.includes(q);
        const matchNum = v.voucherNumber.toLowerCase().includes(q);
        const matchModel = v.modelName.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNum && !matchModel) return false;
      }
      return true;
    });
  }, [vouchers, selectedTypeFilter, searchQuery]);

  const totalQuotedValue = useMemo(() => {
    return vouchers.reduce((acc, curr) => acc + (curr.finalNetPayable || 0), 0);
  }, [vouchers]);

  const totalQuotationsCount = vouchers.filter(v => v.voucherType.includes('Quotation')).length;
  const totalBookingsCount = vouchers.filter(v => v.voucherType.includes('Booking')).length;

  const handleDelete = async (voucher: CustomerVoucher, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete voucher ${voucher.voucherNumber} for ${voucher.customerName}?`)) {
      await deleteVoucher(voucher.id);
    }
  };

  const handleWhatsApp = (v: CustomerVoucher, e: React.MouseEvent) => {
    e.stopPropagation();
    const encoded = buildVoucherWhatsAppMessage({
      customerName: v.customerName,
      voucherNumber: v.voucherNumber,
      voucherType: v.voucherType,
      modelName: v.modelName,
      color: v.selectedColor,
      rtoType: v.rtoType,
      rangeKm: v.rangeKm,
      topSpeedKmph: v.topSpeedKmph,
      batterySpecs: v.batterySpecs,
      warranty: v.warrantyDetails,
      onRoadPrice: v.baseOnRoadPrice,
      discount: v.showroomDiscount,
      netPrice: v.finalNetPayable,
      isFinance: v.paymentMode === 'EMI / Finance',
      downPayment: v.downPayment,
      monthlyEmi: v.monthlyEmi,
      tenureMonths: v.tenureMonths,
    });
    window.open(`https://wa.me/91${cleanPhoneNumber(v.phoneNumber)}?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0A3D91]" /> Quotations & Booking Vouchers
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Customer Quotations, EMI Proposals & Booking Delivery Invoices
          </p>
        </div>

        <button
          onClick={() => navigate('/vouchers/new')}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] sm:min-h-[38px] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Voucher / Quote</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Quotations</span>
          <div className="text-2xl font-bold text-[#0A3D91] tabular-nums mt-0.5">
            {totalQuotationsCount}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirmed Bookings</span>
          <div className="text-2xl font-bold text-[#1B662C] tabular-nums mt-0.5">
            {totalBookingsCount}
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline Value</span>
          <div className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5 flex items-baseline">
            <span className="text-slate-400 text-sm font-medium mr-0.5">₹</span>
            <span>{totalQuotedValue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search customer, phone, voucher #, scooter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0A3D91] outline-none min-h-[38px]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          {(['All', 'Quotation', 'Booking'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedTypeFilter(cat)}
              className={`px-3 py-1.5 rounded-md font-bold transition-all text-xs min-h-[36px] sm:min-h-auto ${
                selectedTypeFilter === cat
                  ? 'bg-[#0A3D91] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'All' ? 'All Types' : cat === 'Quotation' ? 'Estimates' : 'Bookings'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Voucher List (Mobile Cards + Desktop Table) */}
      {filteredVouchers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-600">No vouchers or quotes generated yet</p>
          <p className="text-xs text-slate-400 mt-1">Create your first showroom quote with live EMI calculation</p>
          <button
            onClick={() => navigate('/vouchers/new')}
            className="mt-3 px-4 py-2 bg-[#0A3D91] text-white text-xs font-bold rounded-lg shadow"
          >
            + Create Quotation
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Mobile View */}
          <div className="md:hidden space-y-2.5">
            {filteredVouchers.map((v) => (
              <div
                key={v.id}
                onClick={() => navigate(`/vouchers/${v.id}`)}
                className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-subtle space-y-2.5 active:scale-[0.99] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0A3D91] tabular-nums block">
                      {v.voucherNumber}
                    </span>
                    <span className="font-bold text-slate-900 text-sm font-display">{v.customerName}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    v.voucherType.includes('Booking')
                      ? 'bg-emerald-100 text-[#1B662C]'
                      : 'bg-blue-100 text-[#0A3D91]'
                  }`}>
                    {v.voucherType.includes('Booking') ? 'Booking' : 'Quotation'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium truncate max-w-[180px]">{v.modelName} ({v.selectedColor})</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    ₹{v.finalNetPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                {v.paymentMode === 'EMI / Finance' && v.monthlyEmi && (
                  <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-[#1B662C] flex items-center justify-between tabular-nums">
                    <span>Down: ₹{(v.downPayment || 0).toLocaleString('en-IN')}</span>
                    <span className="font-bold">EMI: ₹{v.monthlyEmi.toLocaleString('en-IN')}/mo ({v.tenureMonths}M)</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400 tabular-nums">{v.date}</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleWhatsApp(v, e)}
                      className="p-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 min-h-[40px] flex items-center justify-center"
                      title="Share WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/vouchers/${v.id}`)}
                      className="px-3 py-2 rounded-lg bg-[#0A3D91] text-white font-bold text-xs flex items-center gap-1 min-h-[40px]"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                    {canDeleteVouchers && (
                      <button
                        onClick={(e) => handleDelete(v, e)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 min-h-[40px] flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Voucher #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Scooter Model</th>
                  <th className="px-4 py-3">Payment Plan</th>
                  <th className="px-4 py-3 text-right">Net Payable</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVouchers.map((v) => (
                  <tr 
                    key={v.id} 
                    onClick={() => navigate(`/vouchers/${v.id}`)}
                    className="hover:bg-blue-50/20 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-[#0A3D91] tabular-nums">
                      {v.voucherNumber}
                      <span className={`block text-[9px] font-bold uppercase tracking-wider ${
                        v.voucherType.includes('Booking') ? 'text-[#1B662C]' : 'text-slate-400'
                      }`}>
                        {v.voucherType.includes('Booking') ? 'Booking Voucher' : 'Quotation'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">{v.date}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900 block">{v.customerName}</span>
                      <span className="text-slate-400 text-[11px] tabular-nums">{formatPhone(v.phoneNumber)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900 block">{v.modelName}</span>
                      <span className="text-[11px] text-slate-500">{v.selectedColor}</span>
                    </td>
                    <td className="px-4 py-3">
                      {v.paymentMode === 'EMI / Finance' ? (
                        <div className="text-[11px] text-[#1B662C] font-semibold tabular-nums">
                          <span>EMI: ₹{(v.monthlyEmi || 0).toLocaleString('en-IN')}/mo</span>
                          <span className="text-slate-400 block text-[10px]">Down: ₹{(v.downPayment || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Full Cash/UPI
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 text-right tabular-nums text-sm">
                      ₹{v.finalNetPayable.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={(e) => handleWhatsApp(v, e)}
                          title="Share on WhatsApp"
                          className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/vouchers/${v.id}`)}
                          title="Print / View"
                          className="px-2.5 py-1.5 rounded-lg bg-[#0A3D91] hover:bg-[#062463] text-white font-bold text-xs flex items-center gap-1 shadow-subtle transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                        {canDeleteVouchers && (
                          <button
                            onClick={(e) => handleDelete(v, e)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vouchers;
