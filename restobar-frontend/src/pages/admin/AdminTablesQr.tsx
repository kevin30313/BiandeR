import axios from 'axios';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

interface Table {
  id: string;
  number: number;
  status: string;
}

export const AdminTablesQr = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const loadTables = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tables');
      const loadedTables: Table[] = Array.isArray(data) ? data : [];
      setTables(loadedTables);
      setTableNumber(String(Math.max(0, ...loadedTables.map((table) => table.number)) + 1));
    } catch (error) {
      console.error('Error cargando mesas:', error);
      setMessage('No se pudieron cargar las mesas. Revisa tu sesión e inténtalo otra vez.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTables(); }, [loadTables]);

  const menuUrl = (table: Table) => `${window.location.origin}/menu/${table.number}`;

  const createTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const number = Number(tableNumber);
    if (!Number.isInteger(number) || number < 1) {
      setMessage('Ingresa un número de mesa entero mayor que cero.');
      setMessageType('error');
      return;
    }

    try {
      setSaving(true);
      setMessage('');
      const { data } = await api.post('/tables', { number });
      setTables((current) => [...current, data].sort((left, right) => left.number - right.number));
      setTableNumber(String(number + 1));
      setMessage(`Mesa #${number} creada; su QR ya está disponible.`);
      setMessageType('success');
    } catch (error: unknown) {
      setMessage(axios.isAxiosError(error)
        ? error.response?.data?.message || 'No se pudo crear la mesa. Puede que ese número ya exista.'
        : 'No se pudo crear la mesa.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const deleteTable = async (table: Table) => {
    const confirmed = window.confirm(`¿Eliminar la Mesa #${table.number}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      setDeletingId(table.id);
      setMessage('');
      const token = localStorage.getItem('token');
      await api.delete(`/tables/${table.id}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      setTables((current) => current.filter((item) => item.id !== table.id));
      setMessage(`Mesa #${table.number} eliminada.`);
      setMessageType('success');
    } catch (error: unknown) {
      setMessage(axios.isAxiosError(error)
        ? error.response?.data?.message || `No se pudo eliminar la Mesa #${table.number}.`
        : `No se pudo eliminar la Mesa #${table.number}.`);
      setMessageType('error');
    } finally {
      setDeletingId(null);
    }
  };

  const copyMenuLink = async (table: Table) => {
    try {
      await navigator.clipboard.writeText(menuUrl(table));
      setMessage(`Enlace de Mesa #${table.number} copiado.`);
      setMessageType('success');
    } catch {
      setMessage('No se pudo copiar el enlace desde este navegador.');
      setMessageType('error');
    }
  };

  const downloadQr = (table: Table) => {
    const qrCanvas = document.getElementById(`table-qr-${table.id}`)?.querySelector('canvas');
    if (!qrCanvas) {
      setMessage(`No se pudo generar el QR de Mesa #${table.number}.`);
      setMessageType('error');
      return;
    }

    const image = new Image();
    image.onload = () => {
      const output = document.createElement('canvas');
      output.width = 900;
      output.height = 1060;
      const context = output.getContext('2d');
      if (!context) return;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, output.width, output.height);
      context.fillStyle = '#111827';
      context.textAlign = 'center';
      context.font = 'bold 58px sans-serif';
      context.fillText(`Mesa #${table.number}`, output.width / 2, 85);
      context.drawImage(image, 110, 140, 680, 680);
      context.font = '28px sans-serif';
      context.fillText('Escanea para ver el menú', output.width / 2, 890);

      const link = document.createElement('a');
      link.download = `mesa-${table.number}-qr.png`;
      link.href = output.toDataURL('image/png');
      link.click();
    };
    image.src = qrCanvas.toDataURL('image/png');
  };

  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 1200, margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={buttonStyle}>← Volver a Administración</button>
      <h1>Mesas y códigos QR</h1>
      <p style={{ color: '#4b5563' }}>Cada QR abre el menú de su mesa: {window.location.origin}/menu/número</p>

      <form onSubmit={createTable} style={{ display: 'flex', alignItems: 'end', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
        <label style={{ display: 'grid', gap: 6 }}>
          Número de mesa
          <input
            type="number"
            min="1"
            step="1"
            required
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
            style={{ padding: 9, border: '1px solid #9ca3af', borderRadius: 6, width: 140 }}
          />
        </label>
        <button type="submit" disabled={saving} style={buttonStyle}>{saving ? 'Creando…' : 'Agregar mesa'}</button>
        <button type="button" onClick={() => void loadTables()} style={buttonStyle}>Actualizar lista</button>
      </form>

      {message && (
        <p role="status" style={{ padding: 12, borderRadius: 6, color: messageType === 'error' ? '#991b1b' : '#166534', background: messageType === 'error' ? '#fee2e2' : '#dcfce7' }}>
          {message}
        </p>
      )}

      {loading ? <p>Cargando mesas…</p> : tables.length === 0 ? <p>No hay mesas creadas todavía.</p> : (
        <section aria-label="Mesas con códigos QR" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: 18 }}>
          {tables.map((table) => (
            <article key={table.id} style={{ border: '1px solid #d1d5db', borderRadius: 12, padding: 18, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: 21 }}>Mesa #{table.number}</h2>
              <div id={`table-qr-${table.id}`} style={{ display: 'inline-flex', padding: 10, background: '#fff' }}>
                <QRCodeCanvas value={menuUrl(table)} size={200} level="H" includeMargin />
              </div>
              <p style={{ margin: '10px 0', fontSize: 13, overflowWrap: 'anywhere' }}>{menuUrl(table)}</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={() => downloadQr(table)} style={buttonStyle}>Descargar PNG</button>
                <button onClick={() => void copyMenuLink(table)} style={buttonStyle}>Copiar link</button>
                <a href={menuUrl(table)} target="_blank" rel="noreferrer" style={{ ...buttonStyle, textDecoration: 'none' }}>Abrir menú</a>
                <button
                  onClick={() => void deleteTable(table)}
                  disabled={deletingId === table.id}
                  style={{ ...buttonStyle, color: '#fff', background: '#b91c1c', borderColor: '#b91c1c' }}
                >
                  {deletingId === table.id ? 'Eliminando…' : 'Eliminar mesa'}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
};

const buttonStyle = {
  padding: '10px 14px',
  border: '1px solid #9ca3af',
  borderRadius: 6,
  background: '#fff',
  color: '#111827',
  cursor: 'pointer',
  fontWeight: 600 as const,
};

export default AdminTablesQr;
