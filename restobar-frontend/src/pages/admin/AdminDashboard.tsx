import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>Panel de Administración</h1>
      <p>Bienvenido al control central del Restobar.</p>

      <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 20 }}>
        <button onClick={() => navigate('/admin/products')} style={buttonStyle('#16a34a')}>
          🍽️ Gestionar Productos y Menú
        </button>
        <button onClick={() => navigate('/admin/users')} style={buttonStyle('#2563eb')}>
          👥 Gestionar Usuarios
        </button>
        <button onClick={() => navigate('/admin/qr')} style={buttonStyle('#b45309')}>
          ▦ Gestionar Mesas y códigos QR
        </button>
      </section>

      <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #ddd' }} />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/cashier')} style={buttonStyle('#fff')}>Ver Caja</button>
        <button onClick={() => navigate('/kitchen')} style={buttonStyle('#fff')}>Ver Cocina</button>
        <button onClick={() => navigate('/waiter')} style={buttonStyle('#fff')}>Ver Garzones</button>
        <button onClick={() => navigate('/menu')} style={buttonStyle('#fff')}>Ver Menú Demo (Mesa #1)</button>
        <button onClick={handleLogout} style={buttonStyle('#dc2626')}>Cerrar Sesión</button>
      </div>
    </main>
  );
};

const buttonStyle = (backgroundColor: string) => ({
  padding: '12px 16px',
  backgroundColor,
  color: backgroundColor === '#fff' ? '#111827' : '#fff',
  border: backgroundColor === '#fff' ? '1px solid #9ca3af' : 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 600 as const,
});

export default AdminDashboard;
