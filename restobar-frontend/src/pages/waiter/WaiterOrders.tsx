import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useWaiterOrder } from '../../hooks/useWaiterOrder';
import { useSocketContext } from '../../context/SocketContext';

interface Preorder {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  table: { number: number };
  items: { id: string; quantity: number; notes?: string; product: { name: string } }[];
}

export const WaiterOrders = () => {
  const {
    tables,
    categories,
    filteredProducts,
    cart,
    total,
    loading,
    submitting,
    message,
    selectedTableId,
    selectedCategoryId,
    setSelectedTableId,
    setSelectedCategoryId,
    addToCart,
    updateQuantity,
    updateNotes,
    removeFromCart,
    submitOrder,
  } = useWaiterOrder();

  const { isConnected, socket } = useSocketContext();
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'preorders'>('manual');

  const loadPreorders = useCallback(async () => {
    try {
      const response = await api.get('/orders');
      setPreorders(response.data.filter((order: Preorder) => order.status === 'PENDING_APPROVAL'));
    } catch (error) {
      console.error('Error cargando preórdenes:', error);
    }
  }, []);

  useEffect(() => { void loadPreorders(); }, [loadPreorders]);

  useEffect(() => {
    if (!socket) return;
    const onCreated = (order: Preorder) => setPreorders((current) => [order, ...current.filter((item) => item.id !== order.id)]);
    const onUpdated = (order: Preorder) => setPreorders((current) => current.filter((item) => item.id !== order.id));
    socket.on('order:preorder_created', onCreated);
    socket.on('order:status_updated', onUpdated);
    return () => {
      socket.off('order:preorder_created', onCreated);
      socket.off('order:status_updated', onUpdated);
    };
  }, [socket]);

  const updatePreorder = async (id: string, action: 'approve' | 'reject') => {
    try {
      await api.patch(`/orders/${id}/${action}`);
      setPreorders((current) => current.filter((order) => order.id !== id));
    } catch (error: any) {
      alert(error.response?.data?.message || 'No se pudo actualizar la preorden');
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Cargando catálogo...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Garzón - Tomar Pedido</h1>
        <span>Red: {isConnected ? '🟢 Online' : '🔴 Offline'}</span>
      </header>

      <nav style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button onClick={() => setActiveTab('manual')} aria-pressed={activeTab === 'manual'}>Tomar pedido</button>
        <button onClick={() => setActiveTab('preorders')} aria-pressed={activeTab === 'preorders'}>
          Preórdenes pendientes ({preorders.length})
        </button>
      </nav>

      {activeTab === 'preorders' ? (
        <section>
          <h2>Preórdenes esperando aprobación</h2>
          {preorders.length === 0 ? <p>No hay preórdenes pendientes.</p> : preorders.map((order) => (
            <article key={order.id} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <h3>Mesa #{order.table.number}</h3>
              <p>{new Date(order.createdAt).toLocaleString()} · Total: ${Number(order.totalAmount).toLocaleString()}</p>
              <ul>{order.items.map((item) => <li key={item.id}>{item.quantity}× {item.product.name}{item.notes ? ` — ${item.notes}` : ''}</li>)}</ul>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => void updatePreorder(order.id, 'approve')}>Aprobar y enviar a cocina</button>
                <button onClick={() => void updatePreorder(order.id, 'reject')}>Rechazar</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
      <>
      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da' }}>
          {message.text}
        </div>
      )}

      {/* Mesas */}
      <section style={{ marginBottom: '20px' }}>
        <h3>1. Seleccionar Mesa</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTableId(t.id)}
              style={{
                padding: '10px 16px',
                backgroundColor: selectedTableId === t.id ? '#0d6efd' : '#fff',
                color: selectedTableId === t.id ? '#fff' : '#000',
              }}
            >
              Mesa #{t.number}
            </button>
          ))}
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Productos */}
        <section>
          <h3>2. Menú</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
            <button
              onClick={() => setSelectedCategoryId('ALL')}
              style={{
                padding: '8px 12px',
                backgroundColor: selectedCategoryId === 'ALL' ? '#0d6efd' : '#fff',
                color: selectedCategoryId === 'ALL' ? '#fff' : '#000',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: selectedCategoryId === c.id ? '#0d6efd' : '#fff',
                  color: selectedCategoryId === c.id ? '#fff' : '#000',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {filteredProducts.map((p) => (
              <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>
                <strong>{p.name}</strong>
                <p>${p.price.toLocaleString()}</p>
                <button onClick={() => addToCart(p)}>+ Agregar</button>
              </div>
            ))}
          </div>
        </section>

        {/* Comanda */}
        <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '6px' }}>
          <h3>3. Comanda Actual</h3>
          {cart.map((item) => (
            <div key={item.product.id} style={{ marginBottom: '10px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.product.name}</span>
                <button onClick={() => removeFromCart(item.product.id)}>✕</button>
              </div>
              <div>
                <button onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, 1)}>+</button>
              </div>
              <input
                type="text"
                placeholder="Notas..."
                value={item.notes}
                onChange={(e) => updateNotes(item.product.id, e.target.value)}
              />
            </div>
          ))}
          <hr />
          <h4>Total: ${total.toLocaleString()}</h4>
          <button onClick={submitOrder} disabled={submitting} style={{ width: '100%', padding: '10px' }}>
            {submitting ? 'Enviando...' : 'Enviar Comanda'}
          </button>
        </section>
      </div>
      </>
      )}
    </div>
  );
};

export default WaiterOrders;
