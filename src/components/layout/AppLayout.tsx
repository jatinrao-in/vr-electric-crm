import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  Store, 
  BarChart3, 
  FileSpreadsheet, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Plus, 
  MoreHorizontal, 
  X, 
  ShoppingBag,
  Download,
  ChevronRight,
  Bike,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../../lib/constants';
import { isOverdue, isDueToday, cleanPhoneNumber, formatPhone } from '../../lib/utils';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import AddLeadModal from '../modals/AddLeadModal';
import AddVisitorModal from '../modals/AddVisitorModal';
import RecordSaleModal from '../modals/RecordSaleModal';
import AddAdLogModal from '../modals/AddAdLogModal';
import LeadDetailDrawer from '../modals/LeadDetailDrawer';

export const AppLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { leads } = useCRM();
  const location = useLocation();
  const { canInstall, triggerInstall } = usePWAInstall();

  // Mobile "More" Sheet State (for master_admin)
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  // Global search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Modals
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddVisitorOpen, setIsAddVisitorOpen] = useState(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isAddAdLogOpen, setIsAddAdLogOpen] = useState(false);

  const role = currentUser?.role || 'salesman';
  const roleConfig = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.salesman;
  const roleMeta = ROLE_LABELS[role] || ROLE_LABELS.salesman;

  // Calculate live badge for follow-ups (Overdue + Due Today)
  const pendingFollowUpsCount = leads.filter(l => {
    if (l.status === 'Converted' || l.status === 'Sold' || l.status === 'Not Interested' || l.status === 'Lost' || l.status === 'Junk') return false;
    if (role === 'salesman' && l.assignedTo !== currentUser?.uid) return false;
    return isOverdue(l.nextFollowUpDate) || isDueToday(l.nextFollowUpDate);
  }).length;

  const overdueCount = leads.filter(l => {
    if (l.status === 'Converted' || l.status === 'Sold' || l.status === 'Not Interested' || l.status === 'Lost' || l.status === 'Junk') return false;
    if (role === 'salesman' && l.assignedTo !== currentUser?.uid) return false;
    return isOverdue(l.nextFollowUpDate);
  }).length;

  // Filtered search results
  const searchResults = searchQuery.trim().length >= 2 ? leads.filter(l => {
    if (role === 'salesman' && l.assignedTo !== currentUser?.uid) return false;
    const q = searchQuery.toLowerCase().trim();
    const phone = cleanPhoneNumber(l.phoneNumber);
    return l.customerName.toLowerCase().includes(q) || phone.includes(q);
  }).slice(0, 5) : [];

  const handleSelectSearchResult = (leadId: string) => {
    setSelectedLeadId(leadId);
    setSearchQuery('');
  };

  // Master Nav Menu Definitions
  const allNavItems = [
    {
      title: 'Dashboard',
      shortTitle: 'Home',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Leads Pipeline',
      shortTitle: 'Leads',
      path: '/leads',
      icon: Users,
      badge: role === 'salesman' 
        ? leads.filter(l => l.assignedTo === currentUser?.uid && l.status === 'New').length 
        : leads.filter(l => l.status === 'New').length,
    },
    {
      title: 'Follow-ups',
      shortTitle: 'Calls',
      path: '/follow-ups',
      icon: CalendarClock,
      badge: pendingFollowUpsCount > 0 ? pendingFollowUpsCount : null,
      badgeColor: overdueCount > 0 ? 'bg-red-500 text-white' : 'bg-[#65B32E] text-white',
    },
    {
      title: 'Digital Catalogue',
      shortTitle: 'Scooters',
      path: '/catalogue',
      icon: Bike,
    },
    {
      title: 'Quotes & Vouchers',
      shortTitle: 'Vouchers',
      path: '/vouchers',
      icon: FileText,
    },
    {
      title: 'Showroom & Sales',
      shortTitle: 'Sales',
      path: '/visitors-sales',
      icon: Store,
    },
    {
      title: 'Ads Tracker',
      shortTitle: 'Ads',
      path: '/ads-tracker',
      icon: BarChart3,
    },
    {
      title: 'Reports',
      shortTitle: 'Reports',
      path: '/reports',
      icon: FileSpreadsheet,
    },
    {
      title: 'Settings',
      shortTitle: 'Users',
      path: '/settings',
      icon: SettingsIcon,
    },
  ];

  // Strictly filter desktop items to allowed routes
  const desktopNavItems = allNavItems.filter(item => 
    roleConfig.allowedRoutes.includes(item.path)
  );

  return (
    <div className="flex h-screen w-full overflow-x-hidden bg-[#F8FAFC]">
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (VR Electric Blue Brand Palette) */}
      {/* ============================================================ */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-[#E2E8F0] select-none flex-shrink-0 z-30">
        {/* Brand Header (Clean Typography-Only, Zero Icons) */}
        <div className="h-16 px-5 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="font-display font-extrabold text-lg tracking-tight leading-none text-[#0A3D91]">
              VR <span className="text-[#65B32E]">ELECTRIC</span>
            </div>
            <div className="text-[10px] font-bold text-[#65B32E] tracking-wider uppercase mt-1">
              Ride The Future
            </div>
          </div>
        </div>

        {/* Dynamic Allowed Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#EFF6FF] text-[#0A3D91] border-l-2 border-[#0A3D91] shadow-subtle'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#0A3D91]' : 'text-slate-400 group-hover:text-slate-900'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full tabular-nums ${
                      item.badgeColor || 'bg-blue-100 text-[#0A3D91]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Profile & Install App */}
        <div className="p-3 border-t border-[#E2E8F0] space-y-2 bg-[#F8FAFC]">
          {canInstall && (
            <button
              onClick={triggerInstall}
              className="w-full flex items-center justify-center gap-1.5 p-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg transition-colors shadow-subtle"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E2E8F0]">
            <div className="flex items-center gap-2 min-w-0">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase flex-shrink-0"
                style={{ backgroundColor: roleMeta.color }}
              >
                {currentUser?.name?.slice(0, 1) || 'V'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name}
                </div>
                <div 
                  className="text-[9px] font-bold px-1 py-0.2 rounded inline-block truncate"
                  style={{ backgroundColor: roleMeta.badgeBg, color: roleMeta.color }}
                >
                  {roleMeta.title}
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MAIN APP SHELL */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-3 sm:px-6 flex items-center justify-between gap-3 z-30 flex-shrink-0">
          {/* Brand on Mobile + Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md min-w-0">
            {/* Clean Typography-Only Brand Title on Mobile (Zero Icons) */}
            <div className="md:hidden flex items-center flex-shrink-0 mr-1.5">
              <span className="font-display font-extrabold text-sm tracking-tight text-[#0A3D91] whitespace-nowrap">
                VR <span className="text-[#65B32E]">ELECTRIC</span>
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative flex-1 min-w-0">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Search name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[#0A3D91] focus:outline-none transition-all placeholder:text-slate-400 min-h-[38px]"
              />

              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-large py-1.5 z-50 max-h-72 overflow-y-auto">
                  {searchResults.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => handleSelectSearchResult(lead.id)}
                      className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{lead.customerName}</div>
                        <div className="text-slate-500 text-[11px] tabular-nums">{formatPhone(lead.phoneNumber)}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 ml-2">
                        {lead.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role-Specific Quick Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {canInstall && (
              <button
                onClick={triggerInstall}
                className="md:hidden p-2 rounded-lg bg-emerald-50 text-[#1B662C] font-bold text-xs flex items-center gap-1 min-h-[38px]"
                title="Install App"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {/* Manager / Admin: Add Lead */}
            {roleConfig.canEditLeads && (role === 'manager' || role === 'master_admin') && (
              <button
                onClick={() => setIsAddLeadOpen(true)}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[38px] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Lead</span>
              </button>
            )}

            {/* Owner / Admin: Record Sale */}
            {roleConfig.canAddSales && (
              <button
                onClick={() => setIsRecordSaleOpen(true)}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#0A3D91] hover:bg-[#062463] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[38px] active:scale-[0.98] transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Sale</span>
              </button>
            )}

            {/* Ads Manager / Admin: Log Spend */}
            {roleConfig.canEditAds && role === 'ads_manager' && (
              <button
                onClick={() => setIsAddAdLogOpen(true)}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#65B32E] hover:bg-[#1B662C] text-white text-xs font-bold rounded-lg shadow-subtle min-h-[38px] active:scale-[0.98] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Spend</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Outlet */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* ============================================================ */}
      {/* 3. DYNAMIC ROLE-AWARE MOBILE BOTTOM NAVIGATION BAR (< 768px) */}
      {/* ============================================================ */}
      <nav className="fixed bottom-0 inset-x-0 z-50 h-16 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] flex items-center justify-around px-1 md:hidden select-none">
        {/* Role 1: master_admin */}
        {(role === 'master_admin' || (role as any) === 'super_admin') && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </NavLink>

            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Bike className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Scooters</span>
            </NavLink>

            <NavLink
              to="/vouchers"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Quotes</span>
            </NavLink>

            <NavLink
              to="/leads"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Leads</span>
            </NavLink>

            <button
              onClick={() => setMoreSheetOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] text-slate-400"
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">More</span>
            </button>
          </>
        )}

        {/* Role 2: owner */}
        {role === 'owner' && (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Home</span>
            </NavLink>

            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Bike className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Scooters</span>
            </NavLink>

            <NavLink
              to="/vouchers"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Quotes</span>
            </NavLink>

            <NavLink
              to="/visitors-sales"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Store className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Sales</span>
            </NavLink>

            <button
              onClick={() => setMoreSheetOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] text-slate-400"
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">More</span>
            </button>
          </>
        )}

        {/* Role 3: manager */}
        {role === 'manager' && (
          <>
            <NavLink
              to="/leads"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Leads</span>
            </NavLink>

            <NavLink
              to="/follow-ups"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] relative transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <CalendarClock className="w-5 h-5 mb-0.5" />
              {pendingFollowUpsCount > 0 && (
                <span className="absolute top-1 right-6 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold tabular-nums">
                  {pendingFollowUpsCount}
                </span>
              )}
              <span className="text-[10px]">Calls</span>
            </NavLink>

            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Bike className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Scooters</span>
            </NavLink>

            <NavLink
              to="/vouchers"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Quotes</span>
            </NavLink>

            <button
              onClick={() => setMoreSheetOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] text-slate-400"
            >
              <MoreHorizontal className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">More</span>
            </button>
          </>
        )}

        {/* Role 4: salesman */}
        {role === 'salesman' && (
          <>
            <NavLink
              to="/leads"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Users className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">My Leads</span>
            </NavLink>

            <NavLink
              to="/follow-ups"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] relative transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <CalendarClock className="w-5 h-5 mb-0.5" />
              {pendingFollowUpsCount > 0 && (
                <span className="absolute top-1 right-8 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold tabular-nums">
                  {pendingFollowUpsCount}
                </span>
              )}
              <span className="text-[10px]">Calls</span>
            </NavLink>

            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <Bike className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Scooters</span>
            </NavLink>

            <NavLink
              to="/vouchers"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <FileText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Quotes</span>
            </NavLink>

            <button
              onClick={() => logout()}
              className="flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] text-slate-400 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Logout</span>
            </button>
          </>
        )}

        {/* Role 5: ads_manager */}
        {role === 'ads_manager' && (
          <>
            <NavLink
              to="/ads-tracker"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
                  isActive ? 'text-[#0A3D91] font-bold' : 'text-slate-400'
                }`
              }
            >
              <BarChart3 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Ads Tracker</span>
            </NavLink>

            <button
              onClick={() => logout()}
              className="flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] text-slate-400 hover:text-red-600"
            >
              <LogOut className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">Logout</span>
            </button>
          </>
        )}
      </nav>

      {/* ============================================================ */}
      {/* 4. "MORE" BOTTOM SHEET (master_admin) */}
      {/* ============================================================ */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMoreSheetOpen(false)}
          />
          <div className="relative w-full bg-white rounded-t-2xl shadow-sheet z-10 max-h-[85vh] overflow-y-auto animate-slide-up pb-8">
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            <div className="px-5 py-2 flex items-center justify-between border-b border-slate-100">
              <div>
                <div className="font-display font-bold text-sm text-[#0A3D91]">{currentUser?.name}</div>
                <div className="text-[11px] font-bold text-[#65B32E]">{roleMeta.title}</div>
              </div>
              <button 
                onClick={() => setMoreSheetOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 space-y-1">
              <NavLink
                to="/follow-ups"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <CalendarClock className="w-4 h-4 text-[#0A3D91]" />
                  <span>Follow-up Calls ({pendingFollowUpsCount})</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>

              <NavLink
                to="/visitors-sales"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-[#0A3D91]" />
                  <span>Showroom Walk-ins & Sales</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>

              <NavLink
                to="/ads-tracker"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#0A3D91]" />
                  <span>Meta Ads Tracker</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>

              <NavLink
                to="/reports"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-[#0A3D91]" />
                  <span>Reports & Scorecard</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>

              <NavLink
                to="/settings"
                onClick={() => setMoreSheetOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-xs min-h-[48px]"
              >
                <div className="flex items-center gap-3">
                  <SettingsIcon className="w-4 h-4 text-[#0A3D91]" />
                  <span>Team & User Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </NavLink>
            </div>

            <div className="p-3">
              <button
                onClick={() => {
                  setMoreSheetOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-xs min-h-[48px] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Modals */}
      {isAddLeadOpen && (
        <AddLeadModal 
          isOpen={isAddLeadOpen} 
          onClose={() => setIsAddLeadOpen(false)} 
          onLeadCreated={(id) => setSelectedLeadId(id)}
        />
      )}

      {isAddVisitorOpen && (
        <AddVisitorModal 
          isOpen={isAddVisitorOpen} 
          onClose={() => setIsAddVisitorOpen(false)} 
        />
      )}

      {isRecordSaleOpen && (
        <RecordSaleModal 
          isOpen={isRecordSaleOpen} 
          onClose={() => setIsRecordSaleOpen(false)} 
        />
      )}

      {isAddAdLogOpen && (
        <AddAdLogModal 
          isOpen={isAddAdLogOpen} 
          onClose={() => setIsAddAdLogOpen(false)} 
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

export default AppLayout;
