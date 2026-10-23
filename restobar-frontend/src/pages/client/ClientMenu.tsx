import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import type { Category, Product, CartItem } from '../../hooks/useWaiterOrder';

export const ClientMenu = () => {
  const { tableId } = useParams<{ tableId: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategories(categoriesRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        console.error('Error cargando el menú:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  };

  const handleClientOrder = async () => {
    if (!tableId || cart.length === 0) return;

    try {
      setSubmitting(true);
      await api.post('/orders', {
        tableId,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });

      setOrderSent(true);
      setCart([]);
    } catch (err) {
      console.error('Error al realizar el pedido:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts =
    selectedCategoryId === 'ALL'
      ? products
      : products.filter((p) => p.categoryId === selectedCategoryId);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando carta...</div>;

  if (orderSent) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>🎉 ¡Pedido Enviado!</h2>
        <p>Tu orden ha sido enviada a la cocina. Te avisaremos cuando esté lista.</p>
        <button
          onClick={() => setOrderSent(false)}
          style={{ padding: '10px 20px', marginTop: '15px', cursor: 'pointer' }}
        >
          Realizar otro pedido
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Menú Digital - Mesa #{tableId}</h2>

      {/* Filtro por Categorías */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px' }}>
        <button onClick={() => setSelectedCategoryId('ALL')}>Todos</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setSelectedCategoryId(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Catálogo de Productos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #eee',
              padding: '12px',
              borderRadius: '8px',
            }}
          >
            <div>
              <strong>{prod.name}</strong>
              <p style={{ margin: '4px 0', color: '#666' }}>${prod.price.toLocaleString()}</p>
            </div>
            <button onClick={() => addToCart(prod)}>+ Pedir</button>
          </div>
        ))}
      </div>

      {/* Footer Flotante del Carrito */}
      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '500px',
            backgroundColor: '#0d6efd',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div>
            <strong>{cart.reduce((acc, i) => acc + i.quantity, 0)} ítems</strong>
            <p style={{ margin: 0 }}>
              Total: ${cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleClientOrder}
            disabled={submitting}
            style={{
              backgroundColor: '#fff',
              color: '#0d6efd',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Enviando...' : 'Confirmar Pedido'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientMenu;