import { useEffect, useState, type FC } from 'react';
import api from '../../api/axiosInstance';
import { useSocketContext } from '../../context/SocketContext';

interface CashierOrder {
  id: string;
  status: string;
  totalAmount: number;
  table: { number: number };
  items: { id: string; quantity: number; product: { name: string } }[];
}

const VISIBLE_STATUSES = ['PENDING', 'IN_PREPARATION', 'READY', 'DELIVERED', 'PAID'];

export const CashierBoard: FC = () => {
  const [orders, setOrders] = useState<CashierOrder[]>([]);
  const { socket } = useSocketContext();

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data.filter((order: CashierOrder) => VISIBLE_STATUSES.includes(order.status))))
      .catch((error) => console.error('Error cargando órdenes para caja:', error));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const upsertOrder = (order: CashierOrder) => {
      setOrders((current) => VISIBLE_STATUSES.includes(order.status)
        ? [order, ...current.filter((item) => item.id !== order.id)]
        : current.filter((item) => item.id !== order.id));
    };
    socket.on('order:created', upsertOrder);
    socket.on('order:status_updated', upsertOrder);
    const onPaid = ({ order }: { order: CashierOrder }) => upsertOrder(order);
    socket.on('order:paid', onPaid);
    return () => {
      socket.off('order:created', upsertOrder);
      socket.off('order:status_updated', upsertOrder);
      socket.off('order:paid', onPaid);
    };
  }, [socket]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Órdenes para caja</h1>
      {orders.length === 0 ? <p>No hay órdenes aprobadas.</p> : orders.map((order) => (
        <article key={order.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <h2>Mesa #{order.table.number} · {order.status}</h2>
          <p>Total: ${Number(order.totalAmount).toLocaleString()}</p>
          <ul>{order.items.map((item) => <li key={item.id}>{item.quantity}× {item.product.name}</li>)}</ul>
        </article>
      ))}
    </main>
  );
};

export default CashierBoard;
