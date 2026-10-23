import { useWaiterOrder } from '../../hooks/useWaiterOrder';
import { useSocketContext } from '../../context/SocketContext';

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

  const { isConnected } = useSocketContext();

  if (loading) return <div style={{ padding: '20px' }}>Cargando catálogo...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Garzón - Tomar Pedido</h1>
        <span>Red: {isConnected ? '🟢 Online' : '🔴 Offline'}</span>
      </header>

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
            <button onClick={() => setSelectedCategoryId('ALL')}>Todos</button>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}>
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
    </div>
  );
};

export default WaiterOrders;