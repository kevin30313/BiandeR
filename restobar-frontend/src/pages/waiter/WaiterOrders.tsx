import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import { useWaiterOrder } from '../../hooks/useWaiterOrder';
import { useSocketContext } from '../../context/SocketContext';

type OrderStatus = 'PENDING_APPROVAL' | 'PENDING' | 'IN_PREPARATION' | 'READY' | 'DELIVERED' | 'PAID' | 'CANCELLED';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  product: { id: string; name: string };
}

interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  table: { number: number };
  items: OrderItem[];
}

interface PreorderDraftItem {
  id?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  notes: string;
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
    products,
    cart,
    total,
    loading,
    submitting,
    message,
    selectedTableId,
    selectedCategoryId,
    generalNotes,
    setSelectedTableId,
    setSelectedCategoryId,
    setGeneralNotes,
    addToCart,
    updateQuantity,
    updateNotes,
    removeFromCart,
    submitOrder,
  } = useWaiterOrder();

  const { socket } = useSocketContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<PanelTab>('ready');
  const [readyNotice, setReadyNotice] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editItems, setEditItems] = useState<PreorderDraftItem[]>([]);
  const [editGeneralNotes, setEditGeneralNotes] = useState('');
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

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

  const beginEdit = (order: Order) => {
    setEditingOrder(order);
    setEditGeneralNotes(order.notes || '');
    setEditItems(order.items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      notes: item.notes || '',
    })));
    setProductSearch('');
    setFeedback('');
  };

  const updatePreorderItem = (productId: string, changes: Partial<PreorderDraftItem>) => {
    setEditItems((current) => current.map((item) => item.productId === productId ? { ...item, ...changes } : item));
  };

  const addProductToPreorder = (product: (typeof products)[number]) => {
    setEditItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { productId: product.id, productName: product.name, unitPrice: product.price, quantity: 1, notes: '' }];
    });
  };

  const editTotal = editItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const savePreorder = async (sendToKitchen: boolean) => {
    if (!editingOrder || editItems.length === 0) {
      setFeedback('La preorden debe conservar al menos un producto.');
      return;
    }
    try {
      setBusyOrderId(editingOrder.id);
      const { data: savedOrder } = await api.patch(`/preorders/${editingOrder.id}`, {
        notes: editGeneralNotes,
        items: editItems.map((item) => ({ id: item.id, productId: item.productId, quantity: item.quantity, notes: item.notes })),
      });
      upsertOrder(savedOrder);
      if (sendToKitchen) {
        const { data: approvedOrder } = await api.patch(`/orders/${editingOrder.id}/approve`);
        upsertOrder(approvedOrder);
        setFeedback(`Preorden de Mesa #${editingOrder.table.number} actualizada y enviada a cocina.`);
      } else {
        setFeedback(`Preorden de Mesa #${editingOrder.table.number} actualizada.`);
      }
      setEditingOrder(null);
    } catch (error: unknown) {
      const message = typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setFeedback(message || 'No se pudo guardar la preorden.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const availablePickerProducts = products.filter((product) => {
    const matchesAvailability = product.isAvailable !== false;
    const matchesCategory = selectedCategoryId === 'ALL' || product.categoryId === selectedCategoryId;
    const matchesSearch = product.name.toLocaleLowerCase().includes(productSearch.trim().toLocaleLowerCase());
    return matchesAvailability && matchesCategory && matchesSearch;
  });

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
      {order.notes && <p style={{ margin: '12px 0 0', padding: 10, color: '#7f1d1d', background: '#fee2e2', border: '2px solid #ef4444', borderRadius: 8, fontWeight: 800, overflowWrap: 'anywhere' }}>Observación general: {order.notes}</p>}
      <ul style={{ paddingLeft: 20, margin: '14px 0' }}>
        {order.items.map((item) => (
          <li key={item.id} style={{ marginBottom: 5, overflowWrap: 'anywhere' }}>
            {item.quantity}× {item.product.name}
            {item.notes && <span style={{ display: 'block', marginTop: 4, padding: '6px 8px', color: '#7c2d12', background: '#ffedd5', borderRadius: 6, fontWeight: 700, overflowWrap: 'anywhere' }}>Nota: {item.notes}</span>}
          </li>
        ))}
      </ul>
      {order.status === 'PENDING_APPROVAL' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,150px),1fr))', gap: 8 }}>
          <button disabled={busyOrderId === order.id} onClick={() => void changeStatus(order, 'approve')} style={{ ...actionButton, background: '#15803d', color: '#fff' }}>
            {busyOrderId === order.id ? 'Procesando…' : 'Confirmar / Enviar a cocina'}
          </button>
          <button disabled={busyOrderId === order.id} onClick={() => beginEdit(order)} style={{ ...actionButton, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Editar</button>
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
    <main style={{ padding: 'clamp(12px, 3vw, 28px)', fontFamily: 'sans-serif', maxWidth: 1500, margin: '0 auto', minWidth: 0, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 34px)' }}>Panel del Garzón</h1>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
            <section style={panelStyle}>
              <h3 style={{ marginTop: 0 }}>2. Comanda actual</h3>
              <button onClick={() => { setProductSearch(''); setProductPickerOpen(true); }} style={{ ...actionButton, width: '100%', marginBottom: 12, background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>
                Buscar / agregar productos
              </button>
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
                  <input aria-label={`Notas para ${item.product.name}`} placeholder="Notas…" maxLength={250} value={item.notes} onChange={(event) => updateNotes(item.product.id, event.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: 10, fontSize: 16 }} />
                </div>
              ))}
              <label style={{ display: 'grid', gap: 6, marginTop: 14, fontWeight: 700 }}>
                Observación general para cocina
                <textarea maxLength={250} rows={3} value={generalNotes} onChange={(event) => setGeneralNotes(event.target.value)} placeholder="Indicaciones para toda la comanda…" style={{ width: '100%', boxSizing: 'border-box', padding: 10, fontSize: 16, border: '1px solid #9ca3af', borderRadius: 8 }} />
              </label>
              <h3>Total: ${total.toLocaleString()}</h3>
              <button onClick={() => void submitOrder()} disabled={submitting} style={{ ...actionButton, width: '100%', background: '#1d4ed8', color: '#fff' }}>
                {submitting ? 'Enviando…' : 'Enviar comanda a cocina'}
              </button>
            </section>
          </div>
        </section>
      )}

      {editingOrder && (
        <div className="waiter-sheet-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && busyOrderId !== editingOrder.id) setEditingOrder(null); }}>
          <section className="waiter-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="edit-preorder-title">
            <header className="waiter-sheet-header">
              <div><h2 id="edit-preorder-title" style={{ margin: 0 }}>Editar preorden · Mesa #{editingOrder.table.number}</h2><p style={{ margin: '4px 0 0', color: '#6b7280' }}>Ajusta productos e indicaciones antes de enviar a cocina.</p></div>
              <button onClick={() => setEditingOrder(null)} disabled={busyOrderId === editingOrder.id} aria-label="Cerrar editor" style={{ ...smallButton, fontSize: 22 }}>×</button>
            </header>
            <div className="waiter-sheet-body">
              <label style={fieldStyle}>Observación general para cocina
                <textarea maxLength={250} rows={3} value={editGeneralNotes} onChange={(event) => setEditGeneralNotes(event.target.value)} placeholder="Indicaciones para toda la orden…" style={textInputStyle} />
                <span style={{ textAlign: 'right', color: '#6b7280', fontWeight: 400 }}>{editGeneralNotes.length}/250</span>
              </label>

              <h3>Productos de la preorden</h3>
              {editItems.map((item) => (
                <article key={item.id || item.productId} style={{ padding: 12, marginBottom: 10, border: '1px solid #d1d5db', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                    <strong style={{ overflowWrap: 'anywhere' }}>{item.productName}</strong>
                    <button onClick={() => setEditItems((current) => current.filter((entry) => entry.productId !== item.productId))} aria-label={`Quitar ${item.productName}`} style={{ ...smallButton, color: '#991b1b' }}>Quitar</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
                    <button onClick={() => item.quantity > 1 ? updatePreorderItem(item.productId, { quantity: item.quantity - 1 }) : setEditItems((current) => current.filter((entry) => entry.productId !== item.productId))} style={smallButton}>−</button>
                    <strong>{item.quantity}</strong>
                    <button onClick={() => updatePreorderItem(item.productId, { quantity: item.quantity + 1 })} style={smallButton}>+</button>
                    <span style={{ marginLeft: 'auto' }}>${(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                  <input maxLength={250} value={item.notes} onChange={(event) => updatePreorderItem(item.productId, { notes: event.target.value })} placeholder="Nota para este producto…" style={textInputStyle} />
                </article>
              ))}

              <h3>Agregar productos activos</h3>
              <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Buscar en el menú…" style={textInputStyle} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '10px 0' }}>
                <button onClick={() => setSelectedCategoryId('ALL')} style={smallButton}>Todas</button>
                {categories.map((category) => <button key={category.id} onClick={() => setSelectedCategoryId(category.id)} style={smallButton}>{category.name}</button>)}
              </div>
              {availablePickerProducts.length === 0 ? <p>No se encontraron productos activos.</p> : (
                <div style={productGridStyle}>
                  {availablePickerProducts.map((product) => (
                    <article key={product.id} style={{ padding: 10, border: '1px solid #e5e7eb', borderRadius: 8, minWidth: 0 }}>
                      <strong style={{ overflowWrap: 'anywhere' }}>{product.name}</strong>
                      <p style={{ margin: '5px 0' }}>${product.price.toLocaleString()}</p>
                      <button onClick={() => addProductToPreorder(product)} style={{ ...actionButton, width: '100%', background: '#eff6ff', color: '#1d4ed8' }}>+ Agregar</button>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <footer className="waiter-sheet-footer">
              <strong style={{ fontSize: 19 }}>Total: ${editTotal.toLocaleString()}</strong>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button disabled={busyOrderId === editingOrder.id || editItems.length === 0} onClick={() => void savePreorder(false)} style={actionButton}>{busyOrderId === editingOrder.id ? 'Guardando…' : 'Guardar'}</button>
                <button disabled={busyOrderId === editingOrder.id || editItems.length === 0} onClick={() => void savePreorder(true)} style={{ ...actionButton, background: '#15803d', color: '#fff' }}>{busyOrderId === editingOrder.id ? 'Enviando…' : 'Guardar y enviar a cocina'}</button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {productPickerOpen && (
        <div className="waiter-sheet-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProductPickerOpen(false); }}>
          <section className="waiter-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="manual-picker-title">
            <header className="waiter-sheet-header">
              <div><h2 id="manual-picker-title" style={{ margin: 0 }}>Agregar productos</h2><p style={{ margin: '4px 0 0', color: '#6b7280' }}>Busca el producto y agrégalo a la comanda.</p></div>
              <button onClick={() => setProductPickerOpen(false)} aria-label="Cerrar catálogo" style={{ ...smallButton, fontSize: 22 }}>×</button>
            </header>
            <div className="waiter-sheet-body">
              <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Buscar producto…" style={textInputStyle} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, margin: '10px 0' }}>
                <button onClick={() => setSelectedCategoryId('ALL')} style={smallButton}>Todas</button>
                {categories.map((category) => <button key={category.id} onClick={() => setSelectedCategoryId(category.id)} style={smallButton}>{category.name}</button>)}
              </div>
              {availablePickerProducts.length === 0 ? <p>No hay productos activos para mostrar.</p> : (
                <div style={productGridStyle}>
                  {availablePickerProducts.map((product) => (
                    <article key={product.id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 9 }}>
                      <strong style={{ overflowWrap: 'anywhere' }}>{product.name}</strong>
                      <p>${product.price.toLocaleString()}</p>
                      <button onClick={() => addToCart(product)} style={{ ...actionButton, width: '100%', background: '#eff6ff', color: '#1d4ed8' }}>+ Agregar</button>
                    </article>
                  ))}
                </div>
              )}
            </div>
            <footer className="waiter-sheet-footer">
              <strong>Comanda: {cart.reduce((sum, item) => sum + item.quantity, 0)} productos · ${total.toLocaleString()}</strong>
              <button onClick={() => setProductPickerOpen(false)} style={{ ...actionButton, background: '#111827', color: '#fff' }}>Listo</button>
            </footer>
          </section>
        </div>
      )}

      <style>{`
        .waiter-sheet-overlay{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.52)}
        .waiter-sheet-panel{width:min(100%,820px);height:min(92dvh,900px);display:flex;flex-direction:column;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.28)}
        .waiter-sheet-header{position:sticky;top:0;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px;border-bottom:1px solid #e5e7eb;background:#fff}
        .waiter-sheet-body{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:16px;min-height:0}
        .waiter-sheet-footer{position:sticky;bottom:0;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid #e5e7eb;background:#fff}
        @media(max-width:639px){.waiter-sheet-overlay{place-items:end center;padding:0}.waiter-sheet-panel{width:100%;height:100dvh;max-height:100dvh;border-radius:0}.waiter-sheet-header{padding-top:calc(12px + env(safe-area-inset-top))}.waiter-sheet-footer{align-items:stretch;flex-direction:column}.waiter-sheet-footer>div{display:grid!important;grid-template-columns:1fr}.waiter-sheet-footer button{width:100%}}
      `}</style>
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

const fieldStyle = {
  display: 'grid',
  gap: 6,
  marginBottom: 14,
  fontWeight: 700 as const,
};

const textInputStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: 11,
  border: '1px solid #9ca3af',
  borderRadius: 8,
  fontSize: 16,
};

const productGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
  gap: 10,
};

export default WaiterOrders;
