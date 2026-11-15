import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
 const navigate = useNavigate();

 const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
 };

 return (
    <main style={{ padding: '24px', fontFamily: 'sans-serif' }}>
     <h1>Panel de Administración (Admin)</h1>
     <p>Bienvenido al control central del Restobar.</p>

     <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
       <button
          onClick={() => navigate('/admin/products')}
          style={{
           padding: '12px 20px',
           backgroundColor: '#16a34a', // Verde para destacar el menú/productos
           color: 'white',
           border: 'none',
           borderRadius: '6px',
           cursor: 'pointer',
           fontWeight: 'bold',
          }}
       >
          🍽️ Gestionar Productos y Menú
       </button>

       <button
          onClick={() => navigate('/admin/users')}
          style={{
           padding: '12px 20px',
           backgroundColor: '#2563eb',
           color: 'white',
           border: 'none',
           borderRadius: '6px',
           cursor: 'pointer',
           fontWeight: 'bold',
          }}
       >
          👥 Gestionar Usuarios (Meseros / Cajeros)
       </button>
     </div>

     <hr style={{ margin: '24px 0', border: '0', borderTop: '1px solid #ddd' }} />

     <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
       <button onClick={() => navigate('/cashier')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Ver Caja
       </button>
       <button onClick={() => navigate('/kitchen')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Ver Cocina
       </button>
       <button onClick={() => navigate('/waiter')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Ver Meseros
       </button>
       <button onClick={() => navigate('/menu')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Ver Menú Cliente
       </button>
       <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
       </button>
     </div>
    </main>
 );
};

export default AdminDashboard;