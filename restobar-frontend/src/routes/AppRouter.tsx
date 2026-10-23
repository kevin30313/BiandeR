import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import ClientMenu from '../pages/client/ClientMenu';
import UserManagement from '../pages/admin/UserManagement';
import KitchenBoard from '../pages/kitchen/KitchenBoard';
import { WaiterOrders } from '../pages/waiter/WaiterOrders';
import CashierBoard from '../pages/cashier/CashierBoard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Login from '../pages/Login';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  let user: { role?: string } = {};

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    localStorage.removeItem('user');
  }

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role || '')) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/menu" element={<ClientMenu />} />

      <Route
        path="/kitchen"
        element={
          <ProtectedRoute allowedRoles={['KITCHEN', 'ADMIN']}>
            <KitchenBoard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/waiter"
        element={
          <ProtectedRoute allowedRoles={['WAITER', 'ADMIN']}>
            <WaiterOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cashier"
        element={
          <ProtectedRoute allowedRoles={['CASHIER', 'ADMIN']}>
            <CashierBoard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserManagement />
          </ProtectedRoute>
        }
       />

      <Route path="/" element={<Navigate to="/menu" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
  
);

export default AppRouter;
