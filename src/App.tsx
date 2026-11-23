import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import FollowUps from './pages/FollowUps';
import VisitorsSales from './pages/VisitorsSales';
import AdsTracker from './pages/AdsTracker';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Catalogue from './pages/Catalogue';
import Vouchers from './pages/Vouchers';
import NewVoucher from './pages/NewVoucher';
import VoucherDetail from './pages/VoucherDetail';
import { ROLE_PERMISSIONS } from './lib/constants';

// Strict Role Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#0A3D91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || !currentUser.isActive) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role || 'salesman';
  const roleConfig = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.salesman;

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={roleConfig.defaultHome} replace />;
  }

  return <>{children}</>;
};

// Root index redirect according to strict role permissions
const RootRedirect: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-3 border-[#0A3D91] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  const role = currentUser.role || 'salesman';
  const roleConfig = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.salesman;
  return <Navigate to={roleConfig.defaultHome} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CRMProvider>
          <Routes>
            {/* Public Login */}
            <Route path="/login" element={<Login />} />

            {/* Authenticated CRM Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RootRedirect />} />

              {/* Dashboard: master_admin, owner */}
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Leads: master_admin, owner (read-only), manager, salesman */}
              <Route 
                path="leads" 
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner', 'manager', 'salesman']}>
                    <Leads />
                  </ProtectedRoute>
                } 
              />

              {/* Follow-ups: master_admin, manager, salesman */}
              <Route 
                path="follow-ups" 
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'manager', 'salesman']}>
                    <FollowUps />
                  </ProtectedRoute>
                } 
              />

              {/* Digital Scooter Catalogue: master_admin, owner, manager, salesman */}
              <Route
                path="catalogue"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner', 'manager', 'salesman']}>
                    <Catalogue />
                  </ProtectedRoute>
                }
              />

              {/* Quotations & Vouchers: master_admin, owner, manager, salesman */}
              <Route
                path="vouchers"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner', 'manager', 'salesman']}>
                    <Vouchers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vouchers/new"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner', 'manager', 'salesman']}>
                    <NewVoucher />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vouchers/:id"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner', 'manager', 'salesman']}>
                    <VoucherDetail />
                  </ProtectedRoute>
                }
              />

              {/* Visitors & Sales: master_admin, owner, manager */}
              <Route 
                path="visitors-sales" 
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner', 'manager']}>
                    <VisitorsSales />
                  </ProtectedRoute>
                } 
              />

              {/* Ads Tracker: master_admin, ads_manager */}
              <Route
                path="ads-tracker"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'ads_manager']}>
                    <AdsTracker />
                  </ProtectedRoute>
                }
              />

              {/* Reports: master_admin, owner */}
              <Route
                path="reports"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin', 'owner']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Settings: master_admin ONLY */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute allowedRoles={['master_admin', 'super_admin']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CRMProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
