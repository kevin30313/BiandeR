// src/pages/kitchen/KitchenBoard.tsx
import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import { useSocketContext } from '../../context/SocketContext';

interface OrderItem {
  id: string;
  quantity: number;
  notes?: string;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  status: 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED';
  createdAt: string;
  table: {
    number: number;
  };
  items: OrderItem[];
}

export const KitchenBoard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState('');
  const { socket, isConnected } = useSocketContext();

  // 1. Cargar pedidos pendientes al montar el componente
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        // Filtrar pedidos que requieran atención en cocina
        const activeOrders = res.data.filter((o: Order) => ['PENDING', 'IN_PREPARATION'].includes(o.status));
        setOrders(activeOrders);
      } catch (err) {
        console.error('Error cargando órdenes:', err);
      }
    };

    fetchOrders();
  }, []);

  // 2. Escuchar eventos en tiempo real con Socket.io
  useEffect(() => {
    if (!socket) return;

    // Recibir nuevas comandas
    const onCreated = (newOrder: Order) => {
      if (['PENDING', 'IN_PREPARATION'].includes(newOrder.status)) {
        setOrders((prev) => [newOrder, ...prev.filter((order) => order.id !== newOrder.id)]);
      }
    };

    // Escuchar cambios de estado desde otros clientes
    const onUpdated = (updatedOrder: Order) => {
      setOrders((prev) =>
        prev
          .map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          .filter((o) => ['PENDING', 'IN_PREPARATION'].includes(o.status))
      );
    };

    socket.on('order:created', onCreated);
    socket.on('order:status_updated', onUpdated);

    return () => {
      socket.off('order:created', onCreated);
      socket.off('order:status_updated', onUpdated);
    };
  }, [socket]);

  // 3. Cambiar estado del pedido
  const handleStatusChange = async (orderId: string, status: 'IN_PREPARATION' | 'READY') => {
    try {
      setLoadingOrderId(orderId);
      setActionMessage('');
      const { data } = await api.patch(`/orders/${orderId}/status`, { status });
      if (status === 'READY') {
        setActionMessage(`Mesa #${data.table.number} marcada como lista. Se avisó al garzón.`);
      } else {
        setActionMessage(`Mesa #${data.table.number}: preparación iniciada.`);
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setActionMessage('No se pudo actualizar la comanda. Inténtalo nuevamente.');
    } finally {
      setLoadingOrderId(null);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Pantalla de Cocina</h1>
      <p>Estado de la conexión: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
      {actionMessage && <p role="status" style={{ padding: 12, background: '#dcfce7', color: '#166534', borderRadius: 8 }}>{actionMessage}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {orders.length === 0 ? (
          <p>No hay comandas pendientes.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: order.status === 'PENDING' ? '#fff3cd' : '#d1e7dd',
              }}
            >
              <h3>Mesa #{order.table.number}</h3>
              <p>Estado: <strong>{order.status}</strong></p>
              <hr />
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product.name}
                    {item.notes && <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>Nota: {item.notes}</p>}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {order.status === 'PENDING' && (
                  <button disabled={loadingOrderId === order.id} onClick={() => void handleStatusChange(order.id, 'IN_PREPARATION')} style={{ minHeight: 48, padding: '12px 18px', fontWeight: 700, cursor: loadingOrderId === order.id ? 'wait' : 'pointer' }}>
                    {loadingOrderId === order.id ? 'Actualizando…' : 'Iniciar preparación'}
                  </button>
                )}
                {order.status === 'IN_PREPARATION' && (
                  <button disabled={loadingOrderId === order.id} onClick={() => void handleStatusChange(order.id, 'READY')} style={{ minHeight: 52, width: '100%', padding: '12px 18px', fontSize: 16, fontWeight: 800, color: '#fff', background: '#15803d', border: 0, borderRadius: 8, cursor: loadingOrderId === order.id ? 'wait' : 'pointer', boxShadow: '0 3px 8px rgba(21,128,61,.3)' }}>
                    {loadingOrderId === order.id ? 'Avisando…' : '✓ Marcar Listo / Avisar Mesero'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default KitchenBoard;
