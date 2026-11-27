import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import type { User, UserRole } from '../../types/user';

const roles: { value: UserRole; label: string }[] = [
  { value: 'WAITER', label: 'WAITER (Garzón)' },
  { value: 'KITCHEN', label: 'KITCHEN (Cocina)' },
  { value: 'CASHIER', label: 'CASHIER (Caja)' },
  { value: 'ADMIN', label: 'ADMIN' },
];

const getAuthenticatedUserId = (): string | null => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}') as { id?: string };
    return user.id || null;
  } catch {
    return null;
  }
};

export const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('WAITER');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);
  const authenticatedUserId = getAuthenticatedUserId();

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get<User[]>('/auth/users');
      setUsers(data);
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setFeedback({ text: message || 'No se pudieron cargar los usuarios.', error: true });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await api.post('/auth/register', { name: name.trim(), email: email.trim(), password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('WAITER');
      setFeedback({ text: 'Usuario creado correctamente.' });
      await loadUsers();
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setFeedback({ text: message || 'No se pudo crear el usuario.', error: true });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`¿Eliminar al usuario ${user.name} (${user.email})? Esta acción no se puede deshacer.`)) return;

    setDeletingUserId(user.id);
    setFeedback(null);
    try {
      await api.delete(`/users/${user.id}`);
      setUsers((current) => current.filter((entry) => entry.id !== user.id));
      setFeedback({ text: `El usuario ${user.email} fue eliminado correctamente.` });
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setFeedback({ text: message || 'No se pudo eliminar el usuario.', error: true });
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <main style={{ padding: 'clamp(16px, 4vw, 32px)', fontFamily: 'sans-serif', maxWidth: 1000, margin: '0 auto', minWidth: 0, boxSizing: 'border-box' }}>
      <button onClick={() => navigate('/admin')} style={{ marginBottom: 16, cursor: 'pointer', padding: '10px 14px', minHeight: 44 }}>← Volver al Admin Dashboard</button>
      <h1>Gestión de Usuarios</h1>
      <p>Registra cuentas del personal y asígnales el rol correspondiente.</p>

      <form onSubmit={(event) => void handleCreateUser(event)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12, marginBottom: 24, padding: 16, border: '1px solid #d1d5db', borderRadius: 10 }}>
        <label style={labelStyle}>Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} required autoComplete="name" style={inputStyle} />
        </label>
        <label style={labelStyle}>Correo electrónico
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" style={inputStyle} />
        </label>
        <label style={labelStyle}>Contraseña inicial
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" style={inputStyle} />
        </label>
        <label style={labelStyle}>Rol
          <select value={role} onChange={(event) => setRole(event.target.value as UserRole)} style={inputStyle}>
            {roles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="submit" disabled={submitting} style={{ alignSelf: 'end', minHeight: 44, padding: '10px 16px', background: '#2563eb', color: '#fff', border: 0, borderRadius: 7, cursor: submitting ? 'wait' : 'pointer', fontWeight: 700 }}>
          {submitting ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>

      {feedback && <p role="status" style={{ padding: 12, borderRadius: 8, background: feedback.error ? '#fee2e2' : '#dcfce7', color: feedback.error ? '#991b1b' : '#166534' }}>{feedback.text}</p>}

      <h2>Usuarios registrados</h2>
      {loading ? <p>Cargando usuarios…</p> : users.length === 0 ? <p>No hay usuarios registrados.</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 12 }}>
          {users.map((user) => (
            <article key={user.id} style={{ minWidth: 0, padding: 16, border: '1px solid #d1d5db', borderRadius: 10, background: '#fff' }}>
              <strong style={{ display: 'block', overflowWrap: 'anywhere' }}>{user.name}</strong>
              <span style={{ display: 'block', margin: '6px 0 10px', overflowWrap: 'anywhere', color: '#4b5563' }}>{user.email}</span>
              <span style={{ display: 'inline-block', padding: '4px 9px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, fontWeight: 700 }}>{user.role}</span>
              {user.id !== authenticatedUserId && (
                <button
                  type="button"
                  onClick={() => void handleDeleteUser(user)}
                  disabled={deletingUserId === user.id}
                  style={{ display: 'block', width: '100%', minHeight: 44, marginTop: 14, padding: '9px 12px', color: '#b91c1c', background: '#fff', border: '1px solid #fecaca', borderRadius: 7, fontWeight: 700, cursor: deletingUserId === user.id ? 'wait' : 'pointer' }}
                >
                  {deletingUserId === user.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

const labelStyle = { display: 'grid', gap: 6, fontWeight: 700 };
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, minHeight: 44, padding: 10, border: '1px solid #9ca3af', borderRadius: 7, fontSize: 16 };

export default UserManagement;
