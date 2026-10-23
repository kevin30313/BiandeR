import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User, UserRole } from '../../types/user';

const USERS_STORAGE_KEY = 'restobar-users';

const getUsers = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? (JSON.parse(storedUsers) as User[]) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const createUser = (user: Pick<User, 'name' | 'email' | 'role'>) => {
  const users = getUsers();
  saveUsers([
    ...users,
    {
      ...user,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      active: true,
    },
  ]);
};

const toggleUserStatus = (id: string): User[] => {
  const users = getUsers().map((user) =>
    user.id === id ? { ...user, active: !user.active } : user,
  );
  saveUsers(users);
  return users;
};

const deleteUser = (id: string): User[] => {
  const users = getUsers().filter((user) => user.id !== id);
  saveUsers(users);
  return users;
};

export const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('WAITER');

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    createUser({ name, email, role });
    setUsers(getUsers());
    setName('');
    setEmail('');
    setRole('WAITER');
  };

  const handleToggle = (id: string) => {
    setUsers(toggleUserStatus(id));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este usuario?')) {
      setUsers(deleteUser(id));
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/admin')} 
        style={{ marginBottom: '16px', cursor: 'pointer', padding: '6px 12px' }}
      >
        ← Volver al Admin Dashboard
      </button>

      <h2>Gestión de Usuarios</h2>

      <form 
        onSubmit={handleCreateUser} 
        style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '24px', 
          padding: '16px', 
          border: '1px solid #ccc', 
          borderRadius: '8px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value as UserRole)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="ADMIN">ADMIN</option>
          <option value="CASHIER">CASHIER (Caja)</option>
          <option value="WAITER">WAITER (Mesero)</option>
          <option value="KITCHEN">KITCHEN (Cocina)</option>
        </select>
        <button 
          type="submit" 
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Crear Usuario
        </button>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f3f4f6' }}>
            <th style={{ padding: '12px' }}>Nombre</th>
            <th style={{ padding: '12px' }}>Email</th>
            <th style={{ padding: '12px' }}>Rol</th>
            <th style={{ padding: '12px' }}>Estado</th>
            <th style={{ padding: '12px' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px' }}>{u.name}</td>
              <td style={{ padding: '12px' }}>{u.email}</td>
              <td style={{ padding: '12px' }}>
                <strong>{u.role}</strong>
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{ color: u.active ? 'green' : 'red', fontWeight: 'bold' }}>
                  {u.active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleToggle(u.id)}
                  style={{ padding: '4px 8px', cursor: 'pointer' }}
                >
                  {u.active ? 'Desactivar' : 'Activar'}
                </button>
                <button 
                  onClick={() => handleDelete(u.id)}
                  style={{ padding: '4px 8px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
