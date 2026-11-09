import { useNavigate } from 'react-router-dom';

export const HomeSelector = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 'bold', marginBottom: '8px', color: '#38bdf8' }}>
          BiandeR Restobar
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '1rem' }}>
          Plataforma de Gestión y Pre-órdenes en Tiempo Real
        </p>

        <div style={{ display: 'grid', gap: '14px' }}>
          <button
            onClick={() => navigate('/menu/1')}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>📱 Menú Cliente (Mesa #1)</span>
            <span>➔</span>
          </button>

          <button
            onClick={() => navigate('/waiter')}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>📋 Panel de Garzón</span>
            <span>➔</span>
          </button>

          <button
            onClick={() => navigate('/kitchen')}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>👨‍🍳 Pantalla Cocina (KDS)</span>
            <span>➔</span>
          </button>

          <button
            onClick={() => navigate('/cashier')}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>💳 Panel de Caja</span>
            <span>➔</span>
          </button>

          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '16px 20px',
              fontSize: '1rem',
              fontWeight: '600',
              backgroundColor: '#475569',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span>🔐 Administración & Login</span>
            <span>➔</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeSelector;