import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import EventsPage from './pages/public/EventsPage';
import EventDetailPage from './pages/public/EventDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerVehicles from './pages/customer/CustomerVehicles';
import CustomerReservations from './pages/customer/CustomerReservations';
import CustomerTravel from './pages/customer/CustomerTravel';
import CustomerNotifications from './pages/customer/CustomerNotifications';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerEvents from './pages/manager/ManagerEvents';
import ManagerCreateEvent from './pages/manager/ManagerCreateEvent';
import ManagerEventDetail from './pages/manager/ManagerEventDetail';
import ManagerScanner from './pages/manager/ManagerScanner';
import ManagerAnalytics from './pages/manager/ManagerAnalytics';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEvents from './pages/admin/AdminEvents';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerFacilities from './pages/owner/OwnerFacilities';
import OwnerEventRequests from './pages/owner/OwnerEventRequests';
import CustomerFines from './pages/customer/CustomerFines';
import ParkingPage from './pages/public/ParkingPage';

import OwnerLoginPage from './pages/auth/OwnerLoginPage';
import OwnerRegisterPage from './pages/auth/OwnerRegisterPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />;
    if (user.role === 'PARKING_OWNER') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:id" element={<EventDetailPage />} />
      <Route path="/parking" element={<ParkingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/owner/login" element={<OwnerLoginPage />} />
      <Route path="/owner/register" element={<OwnerRegisterPage />} />

      {/* Customer Routes */}
      <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/vehicles" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerVehicles /></ProtectedRoute>} />
      <Route path="/customer/reservations" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerReservations /></ProtectedRoute>} />
      <Route path="/customer/travel" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerTravel /></ProtectedRoute>} />
      <Route path="/customer/fines" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerFines /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerNotifications /></ProtectedRoute>} />

      {/* Owner Routes */}
      <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['PARKING_OWNER']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/facilities" element={<ProtectedRoute allowedRoles={['PARKING_OWNER']}><OwnerFacilities /></ProtectedRoute>} />
      <Route path="/owner/event-requests" element={<ProtectedRoute allowedRoles={['PARKING_OWNER']}><OwnerEventRequests /></ProtectedRoute>} />

      {/* Manager Routes */}
      <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/events" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerEvents /></ProtectedRoute>} />
      <Route path="/manager/events/create" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerCreateEvent /></ProtectedRoute>} />
      <Route path="/manager/events/:id" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerEventDetail /></ProtectedRoute>} />
      <Route path="/manager/scanner" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerScanner /></ProtectedRoute>} />
      <Route path="/manager/analytics" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerAnalytics /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminEvents /></ProtectedRoute>} />
      <Route path="/admin/events/create" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManagerCreateEvent /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAuditLogs /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
