import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

interface Table {
  id: string;
  number: number;
  status: string;
}

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<Table[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [loadingTables, setLoadingTables] = useState(true);
  const [savingTable, setSavingTable] = useState(false);
  const [tableMessage, setTableMessage] = useState('');

  const loadTables = useCallback(async () => {
    try {
      const { data } = await api.get('/tables');
      const loadedTables: Table[] = Array.isArray(data) ? data : [];
      setTables(loadedTables);
      setTableNumber(String(Math.max(0, ...loadedTables.map((table) => table.number)) + 1));
    } catch (error) {
      console.error('Error cargando mesas:', error);
      setTableMessage('No se pudieron cargar las mesas. Revisa tu sesión e inténtalo otra vez.');
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => { void loadTables(); }, [loadTables]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const createTable = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const number = Number(tableNumber);
    if (!Number.isInteger(number) || number < 1) {
      setTableMessage('Ingresa un número de mesa entero mayor que cero.');
      return;
    }
    try {
      setSavingTable(true);
      setTableMessage('');
      const { data } = await api.post('/tables', { number });
      setTables((current) => [...current, data].sort((a, b) => a.number - b.number));
      setTableNumber(String(number + 1));
      setTableMessage(`Mesa #${number} creada; su QR ya está disponible.`);
    } catch (error: any) {
      setTableMessage(error.response?.data?.message || 'No se pudo crear la mesa. Puede que ese número ya exista.');
    } finally {
      setSavingTable(false);
    }
  };

  const menuUrl = (table: Table) => `${window.location.origin}/menu/${table.number}`;

  const copyMenuLink = async (table: Table) => {
    try {
      await navigator.clipboard.writeText(menuUrl(table));
      setTableMessage(`Enlace de Mesa #${table.number} copiado.`);
    } catch {
      setTableMessage('No se pudo copiar el enlace desde este navegador.');
    }
  };

  const downloadQr = (table: Table) => {
    const qrCanvas = document.getElementById(`table-qr-${table.id}`)?.querySelector('canvas');
    if (!qrCanvas) {
      setTableMessage(`No se pudo generar el QR de Mesa #${table.number}.`);
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
    <main style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: 1200, margin: '0 auto' }}>
      <h1>Panel de Administración</h1>
      <p>Gestiona el restobar y genera los QR de acceso al menú por mesa.</p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
        <button onClick={() => navigate('/admin/products')} style={primaryButton('#16a34a')}>
          🍽️ Gestionar Productos y Menú
        </button>
        <button onClick={() => navigate('/admin/users')} style={primaryButton('#2563eb')}>
          👥 Gestionar Usuarios
        </button>
      </div>

      <section style={{ marginTop: 30, padding: 20, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Mesas y códigos QR</h2>
        <p style={{ color: '#4b5563' }}>Cada código abre el menú directamente en su mesa: {window.location.origin}/menu/número</p>
        <form onSubmit={createTable} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Número de mesa
            <input
              type="number"
              min="1"
              step="1"
              required
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              style={{ padding: 9, border: '1px solid #9ca3af', borderRadius: 6, width: 110 }}
            />
          </label>
          <button type="submit" disabled={savingTable} style={primaryButton('#111827')}>
            {savingTable ? 'Creando…' : 'Agregar mesa'}
          </button>
          <button type="button" onClick={() => void loadTables()} style={{ padding: '10px 14px', cursor: 'pointer' }}>
            Actualizar lista
          </button>
        </form>
        {tableMessage && <p role="status" style={{ color: '#374151' }}>{tableMessage}</p>}

        {loadingTables ? <p>Cargando mesas…</p> : tables.length === 0 ? <p>No hay mesas creadas todavía.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {tables.map((table) => (
              <article key={table.id} style={{ border: '1px solid #d1d5db', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 12px' }}>Mesa #{table.number}</h3>
                <div id={`table-qr-${table.id}`} style={{ display: 'inline-flex', padding: 10, background: '#fff' }}>
                  <QRCodeCanvas value={menuUrl(table)} size={200} level="H" includeMargin />
                </div>
                <p style={{ margin: '10px 0', fontSize: 13, overflowWrap: 'anywhere' }}>{menuUrl(table)}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button onClick={() => downloadQr(table)} style={{ padding: '9px 12px', cursor: 'pointer' }}>Descargar PNG</button>
                  <button onClick={() => void copyMenuLink(table)} style={{ padding: '9px 12px', cursor: 'pointer' }}>Copiar link</button>
                  <a href={menuUrl(table)} target="_blank" rel="noreferrer" style={{ padding: '9px 12px' }}>Abrir menú</a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <hr style={{ margin: '24px 0', border: 0, borderTop: '1px solid #ddd' }} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/cashier')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Ver Caja</button>
        <button onClick={() => navigate('/kitchen')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Ver Cocina</button>
        <button onClick={() => navigate('/waiter')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Ver Garzones</button>
        <button onClick={() => navigate('/menu')} style={{ padding: '8px 16px', cursor: 'pointer' }}>Ver Menú Demo (Mesa #1)</button>
        <button onClick={handleLogout} style={primaryButton('#dc2626')}>Cerrar Sesión</button>
      </div>
    </main>
  );
};

const primaryButton = (backgroundColor: string) => ({
  padding: '12px 20px',
  backgroundColor,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold' as const,
});

export default AdminDashboard;
