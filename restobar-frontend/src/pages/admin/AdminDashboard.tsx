import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
 const navigate = useNavigate();

 const handleLogout = () => {
	localStorage.removeItem('token');
	localStorage.removeItem('user');
	navigate('/login');
 };

 return (
	<main>
	 <h1>Panel de Administración (Admin)</h1>
	 <p>Bienvenido al control central del Restobar.</p>

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
		Gestionar Usuarios (Meseros / Cajeros)
	 </button>

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
	 <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>
		Cerrar Sesión
	 </button>
	</main>
 );
};

export default AdminDashboard;

