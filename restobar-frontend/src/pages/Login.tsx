import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useSocketContext } from '../context/SocketContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { connectWithToken } = useSocketContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Persistir sesión
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Autenticar la conexión Socket.io
      connectWithToken(token);

      // Redirección según rol
      switch (user.role) {
        case 'WAITER':
          navigate('/waiter');
          break;
        case 'KITCHEN':
          navigate('/kitchen');
          break;
        case 'CASHIER':
          navigate('/cashier');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        default:
          navigate('/login');
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '320px' }}>
        <h2>Errandbi - Restobar</h2>
        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default Login;