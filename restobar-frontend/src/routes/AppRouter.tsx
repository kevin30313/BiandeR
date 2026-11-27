import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useSocketContext } from '../context/SocketContext';

import ClientMenu from '../pages/client/ClientMenu';
import UserManagement from '../pages/admin/UserManagement';
import AdminProducts from '../pages/admin/AdminProducts';
import KitchenBoard from '../pages/kitchen/KitchenBoard';
import { WaiterOrders } from '../pages/waiter/WaiterOrders';
import CashierBoard from '../pages/cashier/CashierBoard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminTablesQr from '../pages/admin/AdminTablesQr';
import Login from '../pages/Login';
import HomeSelector from '../pages/HomeSelector'; // <--- 1. Nuevo import

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

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
};

const AuthenticatedLayout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { isConnected, disconnectSocket } = useSocketContext();
  let user: { role?: string; email?: string } = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    localStorage.removeItem('user');
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 12, minHeight: 56, padding: '8px clamp(12px, 3vw, 28px)', boxSizing: 'border-box', borderBottom: '1px solid #e5e7eb', background: '#fff', fontFamily: 'sans-serif' }}>
        <span style={{ color: '#4b5563', fontSize: 13 }}>
          {user.role && <strong style={{ color: '#111827' }}>{user.role}</strong>}
          {user.role && user.email && ' · '}{user.email}
        </span>
        <span aria-live="polite" style={{ color: isConnected ? '#15803d' : '#b91c1c', fontSize: 13, fontWeight: 700 }}>
          Red: {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
        <button type="button" onClick={handleLogout} style={{ minHeight: 40, padding: '8px 13px', color: '#374151', background: '#fff', border: '1px solid #d1d5db', borderRadius: 7, fontWeight: 700, cursor: 'pointer' }}>
          Cerrar sesión
        </button>
      </header>
      {children}
    </>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Selector principal público */}
      <Route path="/" element={<HomeSelector />} /> {/* <--- 2. HomeSelector en la raíz */}
      
      <Route path="/login" element={<Login />} />
      <Route path="/menu" element={<ClientMenu />} />
      <Route path="/menu/:tableId" element={<ClientMenu />} />

      {/* Rutas Protegidas por Rol */}
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
        path="/admin/qr"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminTablesQr />
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
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProducts />
          </ProtectedRoute>
        }
        />

      {/* Redirección por defecto ante rutas desconocidas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
