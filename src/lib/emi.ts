/**
 * VR Electric EMI & Finance Calculation Utilities
 */

import { EmiCalculationType } from '../types';

export interface EmiCalculationResult {
  principalAmount: number;
  monthlyEmi: number;
  totalInterest: number;
  totalLoanPayable: number;
  grandTotalCost: number; // Down payment + total loan payable + processing fee
  tenureMonths: number;
  annualInterestRate: number;
  downPayment: number;
  processingFee: number;
}

export function calculateEmi({
  netPrice,
  downPayment,
  tenureMonths,
  annualInterestRate = 9.5,
  processingFee = 0,
  calculationType = 'Reducing Balance',
}: {
  netPrice: number;
  downPayment: number;
  tenureMonths: number;
  annualInterestRate?: number;
  processingFee?: number;
  calculationType?: EmiCalculationType;
}): EmiCalculationResult {
  const principal = Math.max(0, netPrice - downPayment);

  if (principal <= 0 || tenureMonths <= 0) {
    return {
      principalAmount: 0,
      monthlyEmi: 0,
      totalInterest: 0,
      totalLoanPayable: 0,
      grandTotalCost: netPrice + processingFee,
      tenureMonths,
      annualInterestRate,
      downPayment,
      processingFee,
    };
  }

  let monthlyEmi = 0;
  let totalInterest = 0;
  let totalLoanPayable = 0;

  if (calculationType === 'Flat Rate') {
    // Dealership Flat Interest Rate Formula:
    // Interest = Principal * (Rate / 100) * (Months / 12)
    totalInterest = Math.round(principal * (annualInterestRate / 100) * (tenureMonths / 12));
    totalLoanPayable = principal + totalInterest;
    monthlyEmi = Math.round(totalLoanPayable / tenureMonths);
  } else {
    // Standard Banking Reducing Balance Formula:
    // EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    if (annualInterestRate === 0) {
      monthlyEmi = Math.round(principal / tenureMonths);
      totalLoanPayable = principal;
      totalInterest = 0;
    } else {
      const monthlyRate = annualInterestRate / (12 * 100);
      const factor = Math.pow(1 + monthlyRate, tenureMonths);
      monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
      totalLoanPayable = monthlyEmi * tenureMonths;
      totalInterest = Math.max(0, totalLoanPayable - principal);
    }
  }

  const grandTotalCost = downPayment + totalLoanPayable + processingFee;

  return {
    principalAmount: principal,
    monthlyEmi,
    totalInterest,
    totalLoanPayable,
    grandTotalCost,
    tenureMonths,
    annualInterestRate,
    downPayment,
    processingFee,
  };
}

/**
 * Generates a clean human-readable WhatsApp quotation text
 */
export function buildVoucherWhatsAppMessage({
  customerName,
  voucherNumber,
  voucherType,
  modelName,
  color,
  rtoType,
  rangeKm,
  topSpeedKmph,
  batterySpecs,
  warranty,
  onRoadPrice,
  discount,
  netPrice,
  isFinance,
  downPayment,
  monthlyEmi,
  tenureMonths,
}: {
  customerName: string;
  voucherNumber: string;
  voucherType: string;
  modelName: string;
  color: string;
  rtoType: string;
  rangeKm: number;
  topSpeedKmph: number;
  batterySpecs: string;
  warranty: string;
  onRoadPrice: number;
  discount: number;
  netPrice: number;
  isFinance: boolean;
  downPayment?: number;
  monthlyEmi?: number;
  tenureMonths?: number;
}): string {
  const isEstimate = voucherType.includes('Quotation');
  let msg = `*VR ELECTRIC — RIDE THE FUTURE*\n`;
  msg += `📍 Showroom: 1786/3, Rajiv Nagar, Sector 13, Gurgaon\n`;
  msg += `📞 Support: +91 7838026026 / 9871113153\n\n`;
  msg += `Namaste *${customerName}* ji,\n`;
  msg += `Here is your official *${isEstimate ? 'Scooter Quotation' : 'Booking Voucher'}* [${voucherNumber}]:\n\n`;

  msg += `🛵 *Model:* ${modelName}\n`;
  msg += `🎨 *Color:* ${color}\n`;
  msg += `⚡ *RTO Type:* ${rtoType}\n`;
  msg += `🔋 *Battery Specs:* ${batterySpecs}\n`;
  msg += `🛣️ *Certified Range:* ${rangeKm} km/charge\n`;
  msg += `🚀 *Top Speed:* ${topSpeedKmph} km/h\n`;
  msg += `🛡️ *Warranty:* ${warranty}\n\n`;

  msg += `💰 *PRICE BREAKDOWN:*\n`;
  msg += `• Base On-Road Price: ₹${onRoadPrice.toLocaleString('en-IN')}\n`;
  if (discount > 0) {
    msg += `• Special Showroom Discount: -₹${discount.toLocaleString('en-IN')}\n`;
  }
  msg += `• *Final Net Payable:* ₹${netPrice.toLocaleString('en-IN')}\n\n`;

  if (isFinance && downPayment !== undefined && monthlyEmi !== undefined && tenureMonths) {
    msg += `📊 *EASY FINANCE / EMI PLAN:*\n`;
    msg += `• Down Payment: ₹${downPayment.toLocaleString('en-IN')}\n`;
    msg += `• Tenure: ${tenureMonths} Months\n`;
    msg += `• *Monthly EMI: ₹${monthlyEmi.toLocaleString('en-IN')} / month*\n\n`;
  }

  msg += `✨ *Visit our showroom today for a Free Test Ride!*`;
  return encodeURIComponent(msg);
}
