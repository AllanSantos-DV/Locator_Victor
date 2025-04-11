import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { lazyLoad } from './utils/lazyLoad';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { LandingLayout } from './layouts/LandingLayout';

// Lazy loaded pages
const LandingPage = lazyLoad(async () => {
  const module = await import('./pages/LandingPage');
  return { default: module.LandingPage };
});

const LoginPage = lazyLoad(async () => {
  const module = await import('./pages/auth/Login');
  return { default: module.Login };
});

const RegisterPage = lazyLoad(async () => {
  const module = await import('./pages/auth/Register');
  return { default: module.Register };
});

const DashboardPage = lazyLoad(async () => {
  const module = await import('./pages/Dashboard');
  return { default: module.Dashboard };
});

const VehiclesPage = lazyLoad(async () => {
  const module = await import('./pages/vehicles/VehiclePage');
  return { default: module.VehiclePage };
});

const CustomersPage = lazyLoad(async () => {
  const module = await import('./pages/clients/CustomerPage');
  return { default: module.CustomerPage };
});

const RentalsPage = lazyLoad(async () => {
  const module = await import('./pages/rentals/RentalsPage');
  return { default: module.RentalsPage };
});

const ProfilePage = lazyLoad(async () => {
  const module = await import('./pages/Profile');
  return { default: module.Profile };
});

const NotificationsPage = lazyLoad(async () => {
  const module = await import('./pages/user/notifications/NotificationsPage');
  return { default: module.default };
});

const NotFoundPage = lazyLoad(async () => {
  const module = await import('./pages/NotFound');
  return { default: module.NotFound };
});

// Admin Pages
const AdminUserListPage = lazyLoad(async () => {
  const module = await import('./pages/admin/users');
  return { default: module.UserListPage };
});

const AdminUserFormPage = lazyLoad(async () => {
  const module = await import('./pages/admin/users');
  return { default: module.UserFormPage };
});

const AdminNotifyUserPage = lazyLoad(async () => {
  const module = await import('./pages/admin/users');
  return { default: module.NotifyUserPage };
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles && !requiredRoles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Landing Page */}
      <Route element={<LandingLayout />}>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      </Route>

      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <VehiclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rentals"
          element={
            <ProtectedRoute>
              <RentalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route element={
        <AdminRoute>
          <MainLayout />
        </AdminRoute>
      }>
        <Route path="/admin/vehicles" element={<VehiclesPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/rentals" element={<RentalsPage />} />
        
        {/* Admin User Management Routes */}
        <Route path="/admin/users" element={<AdminUserListPage />} />
        <Route path="/admin/users/new" element={<AdminUserFormPage />} />
        <Route path="/admin/users/:id/edit" element={<AdminUserFormPage />} />
        <Route path="/admin/users/:id/notify" element={<AdminNotifyUserPage />} />
      </Route>

      {/* Fallback Routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}; 