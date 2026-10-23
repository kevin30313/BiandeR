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
    socket.on('order:created', (newOrder: Order) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    // Escuchar cambios de estado desde otros clientes
    socket.on('order:status_updated', (updatedOrder: Order) => {
      setOrders((prev) =>
        prev
          .map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          .filter((o) => ['PENDING', 'IN_PREPARATION'].includes(o.status))
      );
    });

    return () => {
      socket.off('order:created');
      socket.off('order:status_updated');
    };
  }, [socket]);

  // 3. Cambiar estado del pedido
  const handleStatusChange = async (orderId: string, status: 'IN_PREPARATION' | 'READY') => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Pantalla de Cocina</h1>
      <p>Estado de la conexión: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>

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
                  <button onClick={() => handleStatusChange(order.id, 'IN_PREPARATION')}>
                    En Preparación
                  </button>
                )}
                {order.status === 'IN_PREPARATION' && (
                  <button onClick={() => handleStatusChange(order.id, 'READY')}>
                    Listo para Servir
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