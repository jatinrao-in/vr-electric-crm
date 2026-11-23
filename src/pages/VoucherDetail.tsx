import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  MessageSquare, 
  ArrowLeft, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Calendar,
  Building
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { cleanPhoneNumber, formatPhone } from '../lib/utils';
import { buildVoucherWhatsAppMessage } from '../lib/emi';

export const VoucherDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { vouchers } = useCRM();
  const navigate = useNavigate();

  const voucher = vouchers.find(v => v.id === id);

  if (!voucher) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-sm font-bold text-slate-700">Voucher record not found.</p>
        <button
          onClick={() => navigate('/vouchers')}
          className="mt-3 px-4 py-2 bg-[#0A3D91] text-white text-xs font-bold rounded-lg"
        >
          Back to Vouchers
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const encoded = buildVoucherWhatsAppMessage({
      customerName: voucher.customerName,
      voucherNumber: voucher.voucherNumber,
      voucherType: voucher.voucherType,
      modelName: voucher.modelName,
      color: voucher.selectedColor,
      rtoType: voucher.rtoType,
      rangeKm: voucher.rangeKm,
      topSpeedKmph: voucher.topSpeedKmph,
      batterySpecs: voucher.batterySpecs,
      warranty: voucher.warrantyDetails,
      onRoadPrice: voucher.baseOnRoadPrice,
      discount: voucher.showroomDiscount,
      netPrice: voucher.finalNetPayable,
      isFinance: voucher.paymentMode === 'EMI / Finance',
      downPayment: voucher.downPayment,
      monthlyEmi: voucher.monthlyEmi,
      tenureMonths: voucher.tenureMonths,
    });
    window.open(`https://wa.me/91${cleanPhoneNumber(voucher.phoneNumber)}?text=${encoded}`, '_blank');
  };

  const isBooking = voucher.voucherType.includes('Booking');

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12 print:p-0 print:m-0 print:max-w-none">
      {/* ============================================================ */}
      {/* 1. SCREEN ACTION BAR (Hidden when Printing) */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-subtle print:hidden">
        <button
          onClick={() => navigate('/vouchers')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Vouchers</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/vouchers/new')}
            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 min-h-[40px] flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quote</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold min-h-[40px] flex items-center gap-1.5 shadow-subtle transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-[#0A3D91] hover:bg-[#062463] text-white text-xs font-bold min-h-[40px] flex items-center gap-1.5 shadow-subtle transition-all active:scale-[0.98]"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. OFFICIAL PRINT-READY SHEET (A4 Standard Format) */}
      {/* ============================================================ */}
      <div 
        id="printable-voucher-sheet" 
        className="bg-white p-6 sm:p-10 rounded-2xl border border-[#E2E8F0] shadow-medium print:border-none print:shadow-none print:p-6 print:rounded-none space-y-6 text-slate-900"
      >
        {/* Document Header */}
        <div className="flex items-start justify-between border-b-2 border-[#0A3D91] pb-4">
          <div>
            <div className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#0A3D91] leading-none">
              VR <span className="text-[#65B32E]">ELECTRIC</span>
            </div>
            <div className="text-[11px] font-bold text-[#65B32E] tracking-widest uppercase mt-1">
              Ride The Future • Dealership & Experience Centre
            </div>

            <div className="mt-2 text-xs text-slate-600 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>1786/3, Rajiv Nagar, Sector 13, Gurgaon, Haryana 122001</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 tabular-nums">
                  <Phone className="w-3 h-3 text-slate-400" /> +91 78380 26026 / 98711 13153
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> info@vrelectric.in
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider mb-1.5 ${
              isBooking ? 'bg-emerald-100 text-[#1B662C] border border-emerald-300' : 'bg-blue-100 text-[#0A3D91] border border-blue-300'
            }`}>
              {isBooking ? 'Booking Voucher' : 'Quotation Estimate'}
            </span>
            <div className="text-sm font-bold text-slate-900 tabular-nums">
              {voucher.voucherNumber}
            </div>
            <div className="text-xs text-slate-500 tabular-nums mt-0.5">
              Date: <strong>{voucher.date}</strong>
            </div>
          </div>
        </div>

        {/* Customer & Prepared By Info Box */}
        <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Customer Details
            </span>
            <div className="font-bold text-slate-900 text-sm font-display">{voucher.customerName}</div>
            <div className="font-bold text-slate-700 tabular-nums mt-0.5">
              +91 {formatPhone(voucher.phoneNumber)}
            </div>
            {voucher.email && <div className="text-slate-500">{voucher.email}</div>}
            {voucher.address && <div className="text-slate-600 mt-0.5">{voucher.address}</div>}
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Prepared & Verified By
            </span>
            <div className="font-bold text-slate-900 text-sm">{voucher.preparedByName}</div>
            <div className="text-slate-500">Showroom Sales Consultant</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Valid For: <strong>7 Days From Issue Date</strong>
            </div>
          </div>
        </div>

        {/* Selected Vehicle Showcase Box (16:9 Image + Specs) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
              Selected Electric Vehicle Specifications
            </span>
            <span className="text-xs font-bold text-[#0A3D91]">
              Color: <strong>{voucher.selectedColor}</strong>
            </span>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* 16:9 Thumbnail */}
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
              <img 
                src={voucher.imageUrl} 
                alt={voucher.modelName} 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Spec Columns */}
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold font-display text-slate-900">{voucher.modelName}</h4>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-[#1B662C] border border-emerald-200">
                  {voucher.rtoType}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Range</span>
                  <span className="font-bold text-[#0A3D91] tabular-nums">{voucher.rangeKm} km</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Top Speed</span>
                  <span className="font-bold text-slate-900 tabular-nums">{voucher.topSpeedKmph} km/h</span>
                </div>

                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Battery</span>
                  <span className="font-bold text-slate-900 tabular-nums">{voucher.batterySpecs}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#65B32E] flex-shrink-0" />
                <span>Warranty: <strong>{voucher.warrantyDetails}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Itemized Pricing & Discount Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="px-4 py-2.5 text-left">Description</th>
                <th className="px-4 py-2.5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-4 py-2.5">
                  <span className="font-bold text-slate-900 block">{voucher.modelName} — Ex-Showroom / On-Road Price</span>
                  <span className="text-[11px] text-slate-500">Includes Battery, Charger, RTO/Registration charges & Inspection</span>
                </td>
                <td className="px-4 py-2.5 text-right font-bold text-slate-900 tabular-nums text-sm">
                  ₹{voucher.baseOnRoadPrice.toLocaleString('en-IN')}
                </td>
              </tr>

              {voucher.accessoryCharges > 0 && (
                <tr>
                  <td className="px-4 py-2 text-slate-700">Accessories / Helmet / Additional Add-on</td>
                  <td className="px-4 py-2 text-right text-slate-800 tabular-nums">
                    ₹{voucher.accessoryCharges.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}

              {voucher.showroomDiscount > 0 && (
                <tr className="bg-emerald-50/30">
                  <td className="px-4 py-2 text-[#1B662C] font-semibold">Special Showroom Seasonal Discount</td>
                  <td className="px-4 py-2 text-right font-bold text-[#1B662C] tabular-nums">
                    − ₹{voucher.showroomDiscount.toLocaleString('en-IN')}
                  </td>
                </tr>
              )}

              {/* Grand Total Row */}
              <tr className="bg-slate-100/80 font-bold text-slate-900">
                <td className="px-4 py-3 text-xs uppercase tracking-wider">
                  Grand Total Net Payable Amount
                </td>
                <td className="px-4 py-3 text-right text-base tabular-nums text-[#0A3D91]">
                  ₹{voucher.finalNetPayable.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Finance & Live EMI Box (Only if Finance Chosen) */}
        {voucher.paymentMode === 'EMI / Finance' && voucher.monthlyEmi && (
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-[#1B662C]">
                Finance & Easy Monthly EMI Plan
              </span>
              <span className="text-[11px] text-slate-500">
                Calculation Mode: {voucher.emiType || 'Standard Reducing'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Down Payment</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{(voucher.downPayment || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Loan Amount</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  ₹{(voucher.loanAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Tenure & Rate</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {voucher.tenureMonths}M @ {voucher.annualInterestRate || 9.5}%
                </span>
              </div>

              <div className="p-2 bg-white rounded-lg border-2 border-[#65B32E] bg-emerald-50/30">
                <span className="text-[10px] text-[#1B662C] font-bold block uppercase">Monthly EMI</span>
                <span className="font-bold text-[#1B662C] text-sm tabular-nums">
                  ₹{voucher.monthlyEmi.toLocaleString('en-IN')}<span className="text-[10px] font-normal">/mo</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Showroom Notes */}
        {voucher.notes && (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong>Notes / Inclusions:</strong> {voucher.notes}
          </div>
        )}

        {/* Terms & Conditions */}
        <div className="text-[10px] text-slate-500 space-y-1 border-t border-slate-200 pt-3">
          <p className="font-bold text-slate-700 uppercase">Terms & Conditions:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            <li>Quotation is valid for 7 days from the date of issue. Prices and government subsidies (if applicable) are subject to change.</li>
            <li>Vehicle delivery is subject to realization of full payment or bank finance approval letter.</li>
            <li>All disputes are subject to exclusive Gurgaon / Gurugram court jurisdiction.</li>
          </ul>
        </div>

        {/* Signatures Area */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-xs">
          <div className="border-t border-slate-300 pt-2 text-center text-slate-600">
            <span className="font-bold block">Customer Signature</span>
            <span className="text-[10px] text-slate-400">Accepted terms & verified specs</span>
          </div>

          <div className="border-t border-slate-300 pt-2 text-center text-slate-600">
            <span className="font-bold text-[#0A3D91] block">For VR Electric Mobility</span>
            <span className="text-[10px] text-slate-400">Authorized Dealership Signatory & Seal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetail;
