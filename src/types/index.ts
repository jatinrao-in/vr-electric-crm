// Role definitions based on Strict RBAC Matrix
export type UserRole = 'master_admin' | 'owner' | 'manager' | 'salesman' | 'ads_manager' | 'super_admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: any;
  lastLogin?: any;
}

// Lead Pipeline Statuses
export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Interested / Hot'
  | 'Visit Scheduled'
  | 'Converted'
  | 'Sold'
  | 'Not Interested'
  | 'Lost'
  | 'Junk';

export interface Lead {
  id: string;
  customerName: string;
  phoneNumber: string; // 10-digit
  alternatePhone?: string | null;
  budget: string;
  purpose: string;
  preferredModel: string;
  leadSource: string;
  campaignName?: string | null;
  status: LeadStatus;
  assignedTo: string; // Salesman UID
  assignedToName: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
  lastContactedAt?: any;
  nextFollowUpDate?: any;
  followUpTimeSlot?: string | null;
  latestRemark: string;
  totalCallsCount: number;
  isVisited: boolean;
  isSold: boolean;
}

export type ActivityType = 
  | 'CALL_LOG'
  | 'STATUS_CHANGE'
  | 'NOTE_ADDED'
  | 'ASSIGNMENT_CHANGE'
  | 'VISIT_LOGGED'
  | 'SALE_CLOSED';

export interface LeadActivity {
  activityId: string;
  leadId: string;
  type: ActivityType;
  callOutcome?: string;
  remark: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  scheduledFollowUp?: any;
  timeSlot?: string | null;
  performedBy: string;
  performedByName: string;
  createdAt: any;
}

export interface AdLog {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: any;
  platform: string;
  campaignName: string;
  amountSpent: number;
  impressions: number;
  clicks: number;
  whatsappLeadsReceived: number;
  crmLeadsEntered: number;
  notes?: string;
  loggedBy: string;
  createdAt: any;
}

export interface ShowroomVisitor {
  id: string;
  visitDate: string; // YYYY-MM-DD
  timestamp: any;
  visitorName: string;
  phoneNumber: string;
  linkedLeadId?: string | null;
  purpose: string;
  modelExplored: string;
  testRideTaken: boolean;
  attendedBy: string;
  visitOutcome: 'Booked / Purchased' | 'Will Decide Soon' | 'Price Issue' | 'Just Exploring';
  remarks: string;
  loggedBy: string;
}

export interface SalesRecord {
  id: string;
  saleDate: string; // YYYY-MM-DD
  timestamp: any;
  invoiceNumber?: string | null;
  customerName: string;
  phoneNumber: string;
  linkedLeadId?: string | null;
  scooterModel: string;
  colorVariant: string;
  chassisNumber?: string | null;
  finalSaleAmount: number;
  paymentMode: 'Full Cash / UPI' | 'Loan / Finance' | 'Downpayment + EMI';
  financierName?: string | null;
  closedBySalesmanId?: string | null;
  closedBySalesmanName: string;
  loggedBy: string;
  createdAt: any;
}

export interface SystemSettings {
  scooterModels: string[];
  budgetRanges: string[];
  purposes: string[];
  callOutcomes: string[];
}

// ============================================================
// SCOOTER CATALOGUE MODULE
// ============================================================
export type RTOType = "RTO (Registration Required)" | "Non-RTO (No License/Registration)";
export type BatteryChemistry = "Lithium-ion (LFP)" | "Lithium-ion (NMC)" | "Lead-Acid / Graphene";
export type BatteryType = "Detachable (Portable)" | "Fixed";

export interface Scooter {
  id: string;
  modelName: string;
  rtoType: RTOType;
  availableColors: string[];
  imageUrl: string;
  rangeKm: number;
  topSpeedKmph: number;
  batteryChemistry: BatteryChemistry;
  batterySpecs: string;
  batteryType: BatteryType;
  chargingTimeHours: string;
  bestFor: string[];
  keyFeatures: string[];
  onRoadPrice: number;
  minDownPayment: number;
  startingEmi: number;
  warrantyDetails: string;
  inStock: boolean;
  createdAt?: any;
  updatedAt?: any;
}

// ============================================================
// CUSTOMER VOUCHER & INVOICE MODULE
// ============================================================
export type VoucherType = "Customer Quotation / Estimate" | "Booking Voucher / Sales Invoice";
export type VoucherPaymentMode = "Full Cash / UPI / Bank Transfer" | "EMI / Finance";
export type EmiCalculationType = "Flat Rate" | "Reducing Balance";

export interface CustomerVoucher {
  id: string;
  voucherNumber: string; // e.g. VRE-2026-0001
  voucherType: VoucherType;
  date: string; // YYYY-MM-DD
  createdAt: any;
  
  // Customer Details
  customerName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  city?: string;
  visitPurpose?: string;

  // Vehicle Details
  scooterId: string;
  modelName: string;
  rtoType: RTOType;
  selectedColor: string;
  imageUrl: string;
  rangeKm: number;
  topSpeedKmph: number;
  batterySpecs: string;
  warrantyDetails: string;

  // Pricing & Breakdown
  baseOnRoadPrice: number;
  accessoryCharges: number;
  showroomDiscount: number;
  finalNetPayable: number;

  // Finance / EMI
  paymentMode: VoucherPaymentMode;
  downPayment?: number;
  loanAmount?: number;
  tenureMonths?: number;
  annualInterestRate?: number;
  processingFee?: number;
  monthlyEmi?: number;
  totalLoanPayable?: number;
  totalAmountWithFinance?: number;
  emiType?: EmiCalculationType;

  // Staff & Audit
  preparedByUid: string;
  preparedByName: string;
  notes?: string;
}
