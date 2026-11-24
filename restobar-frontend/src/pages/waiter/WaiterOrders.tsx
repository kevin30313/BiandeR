import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import { useWaiterOrder } from '../../hooks/useWaiterOrder';
import { useSocketContext } from '../../context/SocketContext';

type OrderStatus = 'PENDING_APPROVAL' | 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'PAID' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
  notes?: string;
  product: { name: string };
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  table: { number: number };
  items: OrderItem[];
}

type PanelTab = 'ready' | 'preorders' | 'active' | 'manual';

const statusLabels: Record<OrderStatus, string> = {
  PENDING_APPROVAL: 'Pendiente de aprobación',
  PENDING: 'Pendiente de cocina',
  IN_PREPARATION: 'En preparación',
  READY: 'Listo para retirar',
  DELIVERED: 'Entregado',
  PAID: 'Pagado',
  CANCELLED: 'Cancelado',
};

const mergeOrder = (current: Order[], incoming: Order): Order[] => {
  const existing = current.find((order) => order.id === incoming.id);
  if (existing && new Date(existing.updatedAt).getTime() > new Date(incoming.updatedAt).getTime()) return current;
  return [incoming, ...current.filter((order) => order.id !== incoming.id)];
};

const mergeOrders = (current: Order[], incoming: Order[]): Order[] =>
  incoming.reduce((orders, order) => mergeOrder(orders, order), current);

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

  const { socket, isConnected } = useSocketContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<PanelTab>('ready');
  const [readyNotice, setReadyNotice] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);

  const upsertOrder = useCallback((order: Order) => {
    setOrders((current) => mergeOrder(current, order));
  }, []);

  useEffect(() => {
    let mounted = true;
    api.get('/orders')
      .then(({ data }) => {
        if (mounted && Array.isArray(data)) setOrders((current) => mergeOrders(current, data));
      })
      .catch((error) => console.error('Error cargando órdenes del garzón:', error));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onPreorderCreated = (order: Order) => upsertOrder(order);
    const onStatusUpdated = (order: Order) => upsertOrder(order);
    const onReady = (event: { order: Order; tableNumber: number; items: { name: string; quantity: number }[] }) => {
      upsertOrder(event.order);
      const readyItems = event.items.map((item) => `${item.quantity}× ${item.name}`).join(', ');
      setReadyNotice(`¡Cocina avisó! Mesa #${event.tableNumber}: ${readyItems} listo para retirar.`);
    };
    const onPaid = ({ order }: { order: Order }) => upsertOrder(order);

    socket.on('order:preorder_created', onPreorderCreated);
    socket.on('order:status_updated', onStatusUpdated);
    socket.on('order:ready', onReady);
    socket.on('order:paid', onPaid);
    return () => {
      socket.off('order:preorder_created', onPreorderCreated);
      socket.off('order:status_updated', onStatusUpdated);
      socket.off('order:ready', onReady);
      socket.off('order:paid', onPaid);
    };
  }, [socket, upsertOrder]);

  const readyOrders = useMemo(() => orders.filter((order) => order.status === 'READY'), [orders]);
  const preorders = useMemo(() => orders.filter((order) => order.status === 'PENDING_APPROVAL'), [orders]);
  const activeOrders = useMemo(
    () => orders.filter((order) => ['PENDING', 'IN_PREPARATION', 'DELIVERED'].includes(order.status)),
    [orders]
  );

  const changeStatus = async (order: Order, status: 'DELIVERED' | 'approve' | 'reject') => {
    try {
      setBusyOrderId(order.id);
      setFeedback('');
      if (status === 'approve' || status === 'reject') {
        const { data } = await api.patch(`/orders/${order.id}/${status}`);
        upsertOrder(data);
        setFeedback(status === 'approve' ? `Preorden de Mesa #${order.table.number} aprobada y enviada a cocina.` : `Preorden de Mesa #${order.table.number} rechazada.`);
      } else {
        const { data } = await api.patch(`/orders/${order.id}/status`, { status });
        upsertOrder(data);
        setFeedback(`Mesa #${order.table.number} marcada como entregada.`);
      }
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setFeedback(message || 'No se pudo actualizar la orden. Inténtalo nuevamente.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const tabs: { id: PanelTab; label: string; count?: number }[] = [
    { id: 'ready', label: 'Listos', count: readyOrders.length },
    { id: 'preorders', label: 'Preórdenes', count: preorders.length },
    { id: 'active', label: 'Activos', count: activeOrders.length },
    { id: 'manual', label: 'Tomar pedido' },
  ];

  if (loading) return <div style={{ padding: 20 }}>Cargando catálogo…</div>;

  const OrderCard = ({ order, priority = false }: { order: Order; priority?: boolean }) => (
    <article style={{ border: `1px solid ${priority ? '#f59e0b' : '#d1d5db'}`, borderRadius: 12, padding: 16, background: priority ? '#fffbeb' : '#fff', boxShadow: priority ? '0 4px 14px rgba(217,119,6,.14)' : '0 2px 8px rgba(0,0,0,.04)', minWidth: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 20 }}>Mesa #{order.table.number}</h3>
          <p style={{ margin: '5px 0 0', color: '#4b5563', fontSize: 14 }}>{statusLabels[order.status]}</p>
        </div>
        <time style={{ fontSize: 12, color: '#6b7280', textAlign: 'right' }}>{new Date(order.updatedAt).toLocaleTimeString()}</time>
      </header>
      <ul style={{ paddingLeft: 20, margin: '14px 0' }}>
        {order.items.map((item) => (
          <li key={item.id} style={{ marginBottom: 5, overflowWrap: 'anywhere' }}>
            {item.quantity}× {item.product.name}{item.notes ? ` · ${item.notes}` : ''}
          </li>
        ))}
      </ul>
      {order.status === 'PENDING_APPROVAL' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button disabled={busyOrderId === order.id} onClick={() => void changeStatus(order, 'approve')} style={{ ...actionButton, background: '#15803d', color: '#fff' }}>
            {busyOrderId === order.id ? 'Procesando…' : 'Aprobar y enviar a cocina'}
          </button>
          <button disabled={busyOrderId === order.id} onClick={() => void changeStatus(order, 'reject')} style={{ ...actionButton, background: '#fff', color: '#991b1b', border: '1px solid #fecaca' }}>
            Rechazar
          </button>
        </div>
      )}
      {order.status === 'READY' && (
        <button disabled={busyOrderId === order.id} onClick={() => void changeStatus(order, 'DELIVERED')} style={{ ...actionButton, width: '100%', background: '#b45309', color: '#fff' }}>
          {busyOrderId === order.id ? 'Actualizando…' : 'Marcar entregado / servido'}
        </button>
      )}
    </article>
  );

  return (
    <main style={{ padding: 'clamp(12px, 3vw, 28px)', fontFamily: 'sans-serif', maxWidth: 1500, margin: '0 auto', minWidth: 0 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 34px)' }}>Panel del Garzón</h1>
        <span aria-live="polite">Red: {isConnected ? '🟢 Online' : '🔴 Offline'}</span>
      </header>

      {readyNotice && (
        <div role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 16, marginBottom: 16, color: '#78350f', background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 12, fontWeight: 700 }}>
          <span>🔔 {readyNotice}</span>
          <button onClick={() => setReadyNotice('')} aria-label="Cerrar aviso" style={{ ...actionButton, padding: '6px 10px' }}>×</button>
        </div>
      )}
      {feedback && <p role="status" style={{ padding: 12, borderRadius: 8, background: '#eff6ff', color: '#1e3a8a' }}>{feedback}</p>}

      <nav aria-label="Secciones de órdenes" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '18px 0' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            style={{ ...tabButton, background: activeTab === tab.id ? '#111827' : '#fff', color: activeTab === tab.id ? '#fff' : '#111827', borderColor: activeTab === tab.id ? '#111827' : '#d1d5db' }}
          >
            {tab.label}{tab.count !== undefined ? ` (${tab.count})` : ''}
          </button>
        ))}
      </nav>

      {activeTab === 'ready' && (
        <section>
          <h2 style={{ color: '#92400e' }}>Comandas listas · Prioridad alta</h2>
          {readyOrders.length === 0 ? <p>No hay platos esperando retiro.</p> : (
            <div style={cardGrid}>{readyOrders.map((order) => <OrderCard key={order.id} order={order} priority />)}</div>
          )}
        </section>
      )}

      {activeTab === 'preorders' && (
        <section>
          <h2 style={{ color: '#1d4ed8' }}>Preórdenes pendientes de aprobación</h2>
          {preorders.length === 0 ? <p>No hay preórdenes pendientes.</p> : (
            <div style={cardGrid}>{preorders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          )}
        </section>
      )}

      {activeTab === 'active' && (
        <section>
          <h2>Pedidos activos / en curso</h2>
          {activeOrders.length === 0 ? <p>No hay otros pedidos activos.</p> : (
            <div style={cardGrid}>{activeOrders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          )}
        </section>
      )}

      {activeTab === 'manual' && (
        <section>
          <h2>Tomar pedido manual</h2>
          {message && <p role="status" style={{ padding: 10, background: message.type === 'success' ? '#dcfce7' : '#fee2e2', borderRadius: 8 }}>{message.text}</p>}
          <h3>1. Seleccionar mesa</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {tables.map((table) => (
              <button key={table.id} onClick={() => setSelectedTableId(table.id)} aria-pressed={selectedTableId === table.id} style={{ ...tabButton, background: selectedTableId === table.id ? '#1d4ed8' : '#fff', color: selectedTableId === table.id ? '#fff' : '#111827' }}>
                Mesa #{table.number}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: 18, alignItems: 'start' }}>
            <section style={panelStyle}>
              <h3 style={{ marginTop: 0 }}>2. Menú</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <button onClick={() => setSelectedCategoryId('ALL')} aria-pressed={selectedCategoryId === 'ALL'} style={smallButton}>Todos</button>
                {categories.map((category) => <button key={category.id} onClick={() => setSelectedCategoryId(category.id)} aria-pressed={selectedCategoryId === category.id} style={smallButton}>{category.name}</button>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {filteredProducts.map((product) => (
                  <article key={product.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, minWidth: 0 }}>
                    <strong style={{ overflowWrap: 'anywhere' }}>{product.name}</strong>
                    <p>${product.price.toLocaleString()}</p>
                    <button onClick={() => addToCart(product)} style={smallButton}>+ Agregar</button>
                  </article>
                ))}
              </div>
            </section>

            <section style={panelStyle}>
              <h3 style={{ marginTop: 0 }}>3. Comanda actual</h3>
              {cart.length === 0 && <p>Agrega productos para comenzar.</p>}
              {cart.map((item) => (
                <div key={item.product.id} style={{ padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <strong>{item.product.name}</strong>
                    <button onClick={() => removeFromCart(item.product.id)} aria-label={`Quitar ${item.product.name}`}>×</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
                    <button onClick={() => updateQuantity(item.product.id, -1)} aria-label="Restar">−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} aria-label="Sumar">+</button>
                  </div>
                  <input aria-label={`Notas para ${item.product.name}`} placeholder="Notas…" value={item.notes} onChange={(event) => updateNotes(item.product.id, event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: 8 }} />
                </div>
              ))}
              <h3>Total: ${total.toLocaleString()}</h3>
              <button onClick={() => void submitOrder()} disabled={submitting} style={{ ...actionButton, width: '100%', background: '#1d4ed8', color: '#fff' }}>
                {submitting ? 'Enviando…' : 'Enviar comanda a cocina'}
              </button>
            </section>
          </div>
        </section>
      )}
    </main>
  );
};

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
  gap: 14,
};

const panelStyle = {
  border: '1px solid #d1d5db',
  borderRadius: 12,
  padding: 16,
  background: '#fff',
  minWidth: 0,
};

const actionButton = {
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  fontWeight: 700 as const,
  minHeight: 44,
};

const tabButton = {
  padding: '10px 14px',
  borderRadius: 999,
  border: '1px solid #d1d5db',
  cursor: 'pointer',
  fontWeight: 700 as const,
  minHeight: 44,
};

const smallButton = {
  padding: '8px 10px',
  borderRadius: 6,
  border: '1px solid #d1d5db',
  background: '#fff',
  cursor: 'pointer',
  minHeight: 40,
};

export default WaiterOrders;
