import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Bike, 
  User, 
  CreditCard, 
  Calculator, 
  Check, 
  ArrowRight, 
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { Scooter, VoucherType, VoucherPaymentMode, EmiCalculationType } from '../types';
import { calculateEmi } from '../lib/emi';
import { cleanPhoneNumber, formatINR } from '../lib/utils';

const TENURE_OPTIONS = [6, 9, 12, 18, 24, 36];

export const NewVoucher: React.FC = () => {
  const { scooters, addVoucher, checkDuplicatePhone } = useCRM();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // 1. Customer Details State
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Sector 14, Gurgaon');
  const [city, setCity] = useState('Gurgaon');
  const [notes, setNotes] = useState('');
  const [phoneMatchNotice, setPhoneMatchNotice] = useState<string | null>(null);

  // 2. Scooter Selection State
  const preselectedScooterId = searchParams.get('scooterId');
  const [selectedScooterId, setSelectedScooterId] = useState<string>(preselectedScooterId || '');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // 3. Pricing State
  const [basePrice, setBasePrice] = useState<number | ''>(85000);
  const [accessoryCharges, setAccessoryCharges] = useState<number | ''>(0);
  const [showroomDiscount, setShowroomDiscount] = useState<number | ''>(0);

  // 4. Payment & Finance State
  const [paymentMode, setPaymentMode] = useState<VoucherPaymentMode>('EMI / Finance');
  const [downPayment, setDownPayment] = useState<number | ''>(15000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);
  const [annualInterestRate, setAnnualInterestRate] = useState<number | ''>(9.5);
  const [processingFee, setProcessingFee] = useState<number | ''>(0);
  const [emiCalculationType, setEmiCalculationType] = useState<EmiCalculationType>('Reducing Balance');

  // 5. Document Type
  const [voucherType, setVoucherType] = useState<VoucherType>('Customer Quotation / Estimate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-select scooter from URL or list
  useEffect(() => {
    if (scooters.length > 0) {
      const match = preselectedScooterId ? scooters.find(s => s.id === preselectedScooterId) : scooters[0];
      if (match) {
        setSelectedScooterId(match.id);
        setBasePrice(match.onRoadPrice);
        setDownPayment(match.minDownPayment);
        setSelectedColor(match.availableColors[0] || 'Standard');
      }
    }
  }, [scooters, preselectedScooterId]);

  // When selected scooter changes
  const activeScooter = useMemo(() => {
    return scooters.find(s => s.id === selectedScooterId) || null;
  }, [scooters, selectedScooterId]);

  const handleSelectScooter = (scooter: Scooter) => {
    setSelectedScooterId(scooter.id);
    setBasePrice(scooter.onRoadPrice);
    setDownPayment(scooter.minDownPayment);
    setSelectedColor(scooter.availableColors[0] || 'Standard');
  };

  // Check duplicate phone in CRM for instant auto-fill
  useEffect(() => {
    const clean = cleanPhoneNumber(phoneNumber);
    if (clean.length === 10) {
      const existing = checkDuplicatePhone(clean);
      if (existing) {
        setPhoneMatchNotice(`Matched CRM lead: ${existing.customerName} (${existing.preferredModel})`);
        if (!customerName) setCustomerName(existing.customerName);
      } else {
        setPhoneMatchNotice(null);
      }
    } else {
      setPhoneMatchNotice(null);
    }
  }, [phoneNumber]);

  // Live Pricing Math
  const netPayableAmount = useMemo(() => {
    const base = Number(basePrice) || 0;
    const acc = Number(accessoryCharges) || 0;
    const disc = Number(showroomDiscount) || 0;
    return Math.max(0, base + acc - disc);
  }, [basePrice, accessoryCharges, showroomDiscount]);

  // Live EMI Calculation
  const emiResult = useMemo(() => {
    if (paymentMode !== 'EMI / Finance') return null;
    return calculateEmi({
      netPrice: netPayableAmount,
      downPayment: Number(downPayment) || 0,
      tenureMonths,
      annualInterestRate: Number(annualInterestRate) || 0,
      processingFee: Number(processingFee) || 0,
      calculationType: emiCalculationType,
    });
  }, [netPayableAmount, downPayment, tenureMonths, annualInterestRate, processingFee, emiCalculationType, paymentMode]);

  // Sequential Voucher Number Generator
  const generatedVoucherNumber = useMemo(() => {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const prefix = voucherType.includes('Booking') ? 'VRE-INV' : 'VRE-EST';
    return `${prefix}-${year}-${randomSeq}`;
  }, [voucherType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Please enter Customer Full Name.');
      return;
    }

    const clean = cleanPhoneNumber(phoneNumber);
    if (!clean || clean.length < 10) {
      setFormError('Please enter a valid 10-digit customer mobile number.');
      return;
    }

    if (!activeScooter) {
      setFormError('Please select a scooter model from the catalogue.');
      return;
    }

    setIsSubmitting(true);

    const isFinance = paymentMode === 'EMI / Finance';

    const voucherPayload = {
      voucherNumber: generatedVoucherNumber,
      voucherType,
      date: new Date().toISOString().split('T')[0],
      
      customerName: customerName.trim(),
      phoneNumber: clean,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      city: city.trim() || 'Gurgaon',
      visitPurpose: notes.trim() || 'Showroom Inquiry',

      scooterId: activeScooter.id,
      modelName: activeScooter.modelName,
      rtoType: activeScooter.rtoType,
      selectedColor: selectedColor || activeScooter.availableColors[0] || 'Standard',
      imageUrl: activeScooter.imageUrl,
      rangeKm: activeScooter.rangeKm,
      topSpeedKmph: activeScooter.topSpeedKmph,
      batterySpecs: activeScooter.batterySpecs,
      warrantyDetails: activeScooter.warrantyDetails,

      baseOnRoadPrice: Number(basePrice) || 0,
      accessoryCharges: Number(accessoryCharges) || 0,
      showroomDiscount: Number(showroomDiscount) || 0,
      finalNetPayable: netPayableAmount,

      paymentMode,
      downPayment: isFinance ? (Number(downPayment) || 0) : undefined,
      loanAmount: isFinance && emiResult ? emiResult.principalAmount : undefined,
      tenureMonths: isFinance ? tenureMonths : undefined,
      annualInterestRate: isFinance ? (Number(annualInterestRate) || 0) : undefined,
      processingFee: isFinance ? (Number(processingFee) || 0) : undefined,
      monthlyEmi: isFinance && emiResult ? emiResult.monthlyEmi : undefined,
      totalLoanPayable: isFinance && emiResult ? emiResult.totalLoanPayable : undefined,
      totalAmountWithFinance: isFinance && emiResult ? emiResult.grandTotalCost : netPayableAmount,
      emiType: isFinance ? emiCalculationType : undefined,

      preparedByUid: currentUser?.uid || 'staff',
      preparedByName: currentUser?.name || 'Sales Staff',
      notes: notes.trim() || undefined,
    };

    const res = await addVoucher(voucherPayload);
    setIsSubmitting(false);

    if (res.success && res.id) {
      navigate(`/vouchers/${res.id}`);
    } else {
      setFormError(res.error || 'Failed to save voucher. Please check inputs.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0A3D91]" /> Smart EMI Calculator & Voucher Generator
          </h1>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Prepare professional A4 estimates, finance options & booking delivery vouchers
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ============================================================ */}
        {/* STEP 1: CUSTOMER DETAILS */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-[#0A3D91]" /> 1. Customer Information
            </h3>
            <span className="text-[11px] text-slate-400">Auto-syncs with showroom visitors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                required
                placeholder="98765 43210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-2 text-sm border rounded-lg tabular-nums focus:border-[#0A3D91] outline-none min-h-[44px]"
              />
              {phoneMatchNotice && (
                <p className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {phoneMatchNotice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikas Malhotra"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg font-bold text-slate-900 focus:border-[#0A3D91] outline-none min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="customer@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg min-h-[40px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Showroom / City Address</label>
              <input
                type="text"
                placeholder="e.g. Sector 14, Gurgaon, Haryana"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border rounded-lg min-h-[40px]"
              />
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 2: SCOOTER SELECTION */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#0A3D91]" /> 2. Vehicle Selection from Live Catalogue
            </h3>
            <span className="text-[11px] text-slate-400">{scooters.length} models available</span>
          </div>

          {/* Quick Horizontal Scooter Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {scooters.map((s) => {
              const isSelected = s.id === selectedScooterId;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectScooter(s)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0A3D91] bg-blue-50/40 ring-2 ring-[#0A3D91]/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-2">
                    <img src={s.imageUrl} alt={s.modelName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block truncate">{s.modelName}</span>
                    <span className="text-[10px] text-slate-400 tabular-nums">{s.rangeKm}km • {s.batterySpecs}</span>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A3D91] tabular-nums">
                      ₹{s.onRoadPrice.toLocaleString('en-IN')}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#0A3D91]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Picker for Selected Scooter */}
          {activeScooter && activeScooter.availableColors && activeScooter.availableColors.length > 0 && (
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer's Chosen Color Variant:</label>
              <div className="flex flex-wrap gap-1.5">
                {activeScooter.availableColors.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#0A3D91] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* STEP 3: PRICING & DISCOUNTS */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0A3D91]" /> 3. Pricing, Add-ons & Showroom Discount
            </h3>
            <span className="text-[11px] text-slate-400">Live ₹ math calculation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base On-Road Price (₹)</label>
              <input
                type="number"
                required
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-slate-900 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Accessories / Insurance Add-on (₹)</label>
              <input
                type="number"
                value={accessoryCharges}
                onChange={(e) => setAccessoryCharges(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border rounded-lg tabular-nums min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Showroom Special Discount (₹)</label>
              <input
                type="number"
                value={showroomDiscount}
                onChange={(e) => setShowroomDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-[#1B662C] min-h-[44px]"
              />
            </div>
          </div>

          {/* Net Final Price Display Banner */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Final Net Payable Amount</span>
              <span className="text-xs text-slate-300">Base Price + Add-ons − Special Discount</span>
            </div>
            <div className="text-2xl font-bold tabular-nums text-[#65B32E]">
              ₹{netPayableAmount.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* STEP 4: PAYMENT MODE & LIVE EMI CALCULATOR */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0A3D91]" /> 4. Payment Mode & Finance Plan
            </h3>
            <span className="text-[11px] text-slate-400">Live EMI Engine</span>
          </div>

          {/* Payment Mode Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setPaymentMode('EMI / Finance')}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                paymentMode === 'EMI / Finance'
                  ? 'bg-[#0A3D91] text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>EMI / Easy Finance</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('Full Cash / UPI / Bank Transfer')}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                paymentMode === 'Full Cash / UPI / Bank Transfer'
                  ? 'bg-slate-900 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Full Cash / UPI</span>
            </button>
          </div>

          {/* LIVE EMI CALCULATOR SECTION */}
          {paymentMode === 'EMI / Finance' && (
            <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Interactive EMI Simulator
                </span>
                
                {/* Reducing vs Flat Toggle */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setEmiCalculationType('Reducing Balance')}
                    className={`px-2 py-1 rounded font-bold ${
                      emiCalculationType === 'Reducing Balance' ? 'bg-[#0A3D91] text-white' : 'text-slate-600'
                    }`}
                  >
                    Reducing
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmiCalculationType('Flat Rate')}
                    className={`px-2 py-1 rounded font-bold ${
                      emiCalculationType === 'Flat Rate' ? 'bg-[#0A3D91] text-white' : 'text-slate-600'
                    }`}
                  >
                    Flat Rate
                  </button>
                </div>
              </div>

              {/* Down Payment & Tenure */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Down Payment (₹)</label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-slate-900 min-h-[44px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Loan: ₹{((netPayableAmount) - (Number(downPayment) || 0)).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-slate-900 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Processing Fee (₹)</label>
                  <input
                    type="number"
                    value={processingFee}
                    onChange={(e) => setProcessingFee(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border rounded-lg tabular-nums min-h-[44px]"
                  />
                </div>
              </div>

              {/* Tenure Quick Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Finance Tenure (Months):</label>
                <div className="grid grid-cols-6 gap-1.5">
                  {TENURE_OPTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`py-2 rounded-lg text-xs font-bold tabular-nums transition-all ${
                        tenureMonths === m
                          ? 'bg-[#65B32E] text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {m}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Live EMI Output Highlight Box */}
              {emiResult && (
                <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-subtle grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Principal Loan</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                      ₹{emiResult.principalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-[#F4FBF0] p-2 rounded-lg border border-[#DCFCE7]">
                    <span className="text-[10px] font-bold text-[#1B662C] uppercase tracking-wider block">Monthly EMI</span>
                    <span className="text-lg sm:text-xl font-bold text-[#1B662C] tabular-nums">
                      ₹{emiResult.monthlyEmi.toLocaleString('en-IN')}<span className="text-xs font-normal">/mo</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Interest</span>
                    <span className="text-sm sm:text-base font-bold text-amber-700 tabular-nums">
                      ₹{emiResult.totalInterest.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Payable</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tabular-nums">
                      ₹{emiResult.grandTotalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* STEP 5: DOCUMENT TYPE & SUBMIT */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E2E8F0] shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0A3D91]" /> 5. Document Type & Save
            </h3>
            <span className="text-[11px] text-[#0A3D91] font-bold">{generatedVoucherNumber}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setVoucherType('Customer Quotation / Estimate')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                voucherType === 'Customer Quotation / Estimate'
                  ? 'border-[#0A3D91] bg-blue-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">Customer Quotation / Estimate</span>
                {voucherType ==='Customer Quotation / Estimate' && <Check className="w-4 h-4 text-[#0A3D91]" />}
              </div>
              <p className="text-[11px] text-slate-500">
                Official price estimate valid for 7 days with EMI calculations for exploring customers.
              </p>
            </div>

            <div
              onClick={() => setVoucherType('Booking Voucher / Sales Invoice')}
              className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                voucherType === 'Booking Voucher / Sales Invoice'
                  ? 'border-[#65B32E] bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">Booking Voucher / Sales Invoice</span>
                {voucherType ==='Booking Voucher / Sales Invoice' && <Check className="w-4 h-4 text-[#65B32E]" />}
              </div>
              <p className="text-[11px] text-slate-500">
                Confirmed vehicle booking receipt with down payment and delivery commitment.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Showroom Notes (Optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Free helmet included, delivery promised on Friday..."
              className="w-full px-3 py-2 text-xs border rounded-lg focus:border-[#0A3D91] outline-none"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/vouchers')}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[44px] flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving Voucher...' : 'Save & Preview Printable Voucher'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewVoucher;
