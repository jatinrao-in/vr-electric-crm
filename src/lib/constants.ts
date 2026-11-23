import { SystemSettings, UserRole } from '../types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  scooterModels: [
    "VR-Lite (Low Speed)",
    "VR-Glide Pro (85km)",
    "VR-Thunder (120km)",
    "VR-Cargo Max (Dual Battery)"
  ],
  budgetRanges: [
    "Under ₹60k",
    "₹60k - ₹80k",
    "₹80k - ₹1L",
    "Above ₹1L"
  ],
  purposes: [
    "Personal Commute",
    "Delivery / Gig",
    "Commercial Fleet",
    "Student / Family"
  ],
  callOutcomes: [
    "Interested",
    "Test Ride Requested",
    "Call Later",
    "RNR (Ring No Response)",
    "Busy",
    "Switched Off",
    "Budget Issue",
    "Bought Competitor",
    "Junk / Wrong Number"
  ]
};

// Brand-Compliant Role Labels (VR Electric Navy Blue & Action Green)
export const ROLE_LABELS: Record<UserRole | 'super_admin', { title: string; color: string; badgeBg: string; border: string }> = {
  master_admin: {
    title: 'Master Admin',
    color: '#0A3D91',
    badgeBg: '#EFF6FF',
    border: '#BFDBFE'
  },
  super_admin: {
    title: 'Master Admin',
    color: '#0A3D91',
    badgeBg: '#EFF6FF',
    border: '#BFDBFE'
  },
  owner: {
    title: 'Showroom Owner',
    color: '#062463',
    badgeBg: '#EFF6FF',
    border: '#BFDBFE'
  },
  manager: {
    title: 'Operations Manager',
    color: '#0D9488',
    badgeBg: '#F0FDFA',
    border: '#99F6E4'
  },
  salesman: {
    title: 'Sales Executive',
    color: '#1B662C',
    badgeBg: '#F4FBF0',
    border: '#DCFCE7'
  },
  ads_manager: {
    title: 'Ads Specialist',
    color: '#E11D48',
    badgeBg: '#FFF1F2',
    border: '#FECDD3'
  }
};

// Strict Role Permissions Matrix
export interface RolePermissionConfig {
  defaultHome: string;
  allowedRoutes: string[];
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canAddSales: boolean;
  canAddVisitors: boolean;
  canEditAds: boolean;
  canManageUsers: boolean;
  canManageCatalogue: boolean;
  canDeleteVouchers: boolean;
  scopeSalesmanLeadsOnly: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole | 'super_admin', RolePermissionConfig> = {
  master_admin: {
    defaultHome: '/dashboard',
    allowedRoutes: ['/dashboard', '/leads', '/follow-ups', '/catalogue', '/vouchers', '/ads-tracker', '/visitors-sales', '/reports', '/settings'],
    canEditLeads: true,
    canDeleteLeads: true,
    canAddSales: true,
    canAddVisitors: true,
    canEditAds: true,
    canManageUsers: true,
    canManageCatalogue: true,
    canDeleteVouchers: true,
    scopeSalesmanLeadsOnly: false,
  },
  super_admin: {
    defaultHome: '/dashboard',
    allowedRoutes: ['/dashboard', '/leads', '/follow-ups', '/catalogue', '/vouchers', '/ads-tracker', '/visitors-sales', '/reports', '/settings'],
    canEditLeads: true,
    canDeleteLeads: true,
    canAddSales: true,
    canAddVisitors: true,
    canEditAds: true,
    canManageUsers: true,
    canManageCatalogue: true,
    canDeleteVouchers: true,
    scopeSalesmanLeadsOnly: false,
  },
  owner: {
    defaultHome: '/dashboard',
    allowedRoutes: ['/dashboard', '/visitors-sales', '/reports', '/leads', '/catalogue', '/vouchers'],
    canEditLeads: false, // Read-Only on leads
    canDeleteLeads: false,
    canAddSales: true,
    canAddVisitors: true,
    canEditAds: false,
    canManageUsers: false,
    canManageCatalogue: true,
    canDeleteVouchers: true,
    scopeSalesmanLeadsOnly: false,
  },
  manager: {
    defaultHome: '/leads',
    allowedRoutes: ['/leads', '/follow-ups', '/visitors-sales', '/catalogue', '/vouchers'],
    canEditLeads: true,
    canDeleteLeads: false,
    canAddSales: false,
    canAddVisitors: true,
    canEditAds: false,
    canManageUsers: false,
    canManageCatalogue: false, // Read-only catalogue
    canDeleteVouchers: false,
    scopeSalesmanLeadsOnly: false,
  },
  salesman: {
    defaultHome: '/leads',
    allowedRoutes: ['/leads', '/follow-ups', '/catalogue', '/vouchers'],
    canEditLeads: true,
    canDeleteLeads: false,
    canAddSales: false,
    canAddVisitors: false,
    canEditAds: false,
    canManageUsers: false,
    canManageCatalogue: false, // Read-only catalogue
    canDeleteVouchers: false,
    scopeSalesmanLeadsOnly: true, // Only assigned leads
  },
  ads_manager: {
    defaultHome: '/ads-tracker',
    allowedRoutes: ['/ads-tracker'],
    canEditLeads: false,
    canDeleteLeads: false,
    canAddSales: false,
    canAddVisitors: false,
    canEditAds: true,
    canManageUsers: false,
    canManageCatalogue: false,
    canDeleteVouchers: false,
    scopeSalesmanLeadsOnly: false,
  },
};

// Compact 1-2 word status colors using Brand palette
export const STATUS_COLORS: Record<string, { label: string; bg: string; text: string; border: string }> = {
  'New': { label: 'New', bg: '#EFF6FF', text: '#0A3D91', border: '#BFDBFE' },
  'Contacted': { label: 'Contacted', bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE' },
  'Interested / Hot': { label: 'Hot', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  'Hot': { label: 'Hot', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  'Visit Scheduled': { label: 'Visit Set', bg: '#F4FBF0', text: '#1B662C', border: '#DCFCE7' },
  'Visit Set': { label: 'Visit Set', bg: '#F4FBF0', text: '#1B662C', border: '#DCFCE7' },
  'Converted': { label: 'Sold', bg: '#E7F7E0', text: '#134D21', border: '#BBF7D0' },
  'Sold': { label: 'Sold', bg: '#E7F7E0', text: '#134D21', border: '#BBF7D0' },
  'Not Interested': { label: 'Lost', bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
  'Lost': { label: 'Lost', bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' },
  'Junk': { label: 'Junk', bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

export const TIME_SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];
