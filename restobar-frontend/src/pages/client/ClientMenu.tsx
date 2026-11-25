import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import type { Category, Product, CartItem } from '../../hooks/useWaiterOrder';

export const ClientMenu = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const selectedTable = tableId || '1';
  const isDemoTable = !tableId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [cartOpen, setCartOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSent, setOrderSent] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products'),
        ]);
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
        setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      } catch (err) {
        console.error('Error cargando el menú:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);

    if (categoryId === 'ALL') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionEl = document.getElementById(`category-${categoryId}`);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
    if (cart.length === 0) return;

    try {
      setSubmitting(true);
      await api.post('/orders', {
        tableId: selectedTable,
        notes: generalNotes,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });

      setOrderSent(true);
      setCart([]);
      setGeneralNotes('');
      setCartOpen(false);
    } catch (err) {
      console.error('Error al realizar el pedido:', err);
      setSubmitError('No se pudo enviar la preorden. Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCartNotes = (productId: string, notes: string) => {
    setCart((current) => current.map((item) => item.product.id === productId ? { ...item, notes } : item));
  };

  const updateCartQuantity = (productId: string, change: number) => {
    setCart((current) => current
      .map((item) => item.product.id === productId ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0));
  };

  const availableProducts = products.filter((p) => p.isAvailable !== false);

  const groupedSections = categories
    .map((category) => ({
      category,
      items: availableProducts.filter((p) => p.categoryId === category.id),
    }))
    .filter((group) => group.items.length > 0);

  const knownCategoryIds = new Set(categories.map((c) => c.id));
  const uncategorizedItems = availableProducts.filter((p) => !knownCategoryIds.has(p.categoryId));

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'sans-serif', color: '#4b5563' }}>
        Cargando carta...
      </div>
    );
  }

  if (orderSent) {
    return (
      <div
        style={{
          padding: '48px 24px',
          maxWidth: '480px',
          margin: '40px auto',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '14px',
        }}
      >
        <h2 style={{ marginTop: 0, color: '#111827' }}>🎉 ¡Preorden enviada!</h2>
        <p style={{ color: '#4b5563', lineHeight: 1.5 }}>
          El garzón recibió tu pedido y lo revisará antes de enviarlo a cocina. La preparación comenzará cuando lo apruebe.
        </p>
        <button
          onClick={() => setOrderSent(false)}
          style={{
            padding: '12px 22px',
            marginTop: '16px',
            cursor: 'pointer',
            backgroundColor: '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
          }}
        >
          Realizar otro pedido
        </button>
      </div>
    );
  }

  const renderProductCard = (prod: Product) => (
    <div
      key={prod.id}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        padding: '14px 16px',
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      {prod.image && (
        <img
          src={prod.image}
          alt={prod.name}
          style={{
            width: '68px',
            height: '68px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            flexShrink: 0,
          }}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ display: 'block', fontSize: '15px', color: '#111827' }}>
          {prod.name}
        </strong>
        {prod.description && (
          <p
            style={{
              margin: '4px 0 6px',
              fontSize: '13px',
              color: '#6b7280',
              lineHeight: 1.35,
            }}
          >
            {prod.description}
          </p>
        )}
        <span style={{ display: 'inline-block', fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>
          ${Number(prod.price).toLocaleString()}
        </span>
      </div>

      <button
        onClick={() => addToCart(prod)}
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        + Pedir
      </button>
    </div>
  );

  return (
    <div
      style={{
        padding: '16px',
        paddingBottom: cart.length > 0 ? '110px' : '32px',
        maxWidth: '680px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
        color: '#111827',
        overflowX: 'hidden',
      }}
    >
      {/* Encabezado */}
      <header style={{ marginBottom: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
          Menú Digital — Mesa #{selectedTable}
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
          {isDemoTable ? 'Vista demo en Mesa #1. ' : ''}Desliza por la carta o elige una categoría para ir directo.
        </p>
      </header>

      {/* Barra de Categorías Pegajosa */}
      <nav
        aria-label="Categorías del menú"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '10px 0',
          marginBottom: '18px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #f3f4f6',
        }}
      >
        <button
          onClick={() => handleSelectCategory('ALL')}
          style={{
            padding: '8px 14px',
            borderRadius: '999px',
            border: selectedCategoryId === 'ALL' ? '1px solid #111827' : '1px solid #d1d5db',
            backgroundColor: selectedCategoryId === 'ALL' ? '#111827' : '#f9fafb',
            color: selectedCategoryId === 'ALL' ? '#ffffff' : '#374151',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Todos
        </button>

        {categories.map((c) => {
          const isActive = selectedCategoryId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => handleSelectCategory(c.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                border: isActive ? '1px solid #111827' : '1px solid #d1d5db',
                backgroundColor: isActive ? '#111827' : '#f9fafb',
                color: isActive ? '#ffffff' : '#374151',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {c.name}
            </button>
          );
        })}
      </nav>

      {/* Secciones por Categoría en Scroll */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {groupedSections.map(({ category, items }) => (
          <section
            key={category.id}
            id={`category-${category.id}`}
            style={{ scrollMarginTop: '72px' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '6px',
                marginBottom: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, textTransform: 'capitalize' }}>
                {category.name}
              </h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                {items.length} {items.length === 1 ? 'opción' : 'opciones'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {items.map(renderProductCard)}
            </div>
          </section>
        ))}

        {uncategorizedItems.length > 0 && (
          <section id="category-other" style={{ scrollMarginTop: '72px' }}>
            <h3
              style={{
                margin: '0 0 12px',
                fontSize: '18px',
                fontWeight: 700,
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '6px',
              }}
            >
              Otros
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {uncategorizedItems.map(renderProductCard)}
            </div>
          </section>
        )}

        {groupedSections.length === 0 && uncategorizedItems.length === 0 && (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '24px 0' }}>
            No hay productos disponibles en este momento.
          </p>
        )}
      </div>

      {/* Footer Flotante del Carrito */}
      {cart.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '540px',
            backgroundColor: '#111827',
            color: '#fff',
            padding: '14px 18px',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.22)',
            zIndex: 20,
          }}
        >
          <div>
            <strong style={{ fontSize: '14px' }}>
              {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'} en tu pedido
            </strong>
            <p style={{ margin: '2px 0 0', fontSize: '15px', fontWeight: 700 }}>
              Total: ${totalAmount.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() => { setSubmitError(''); setCartOpen(true); }}
            style={{
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              minHeight: 44,
              cursor: 'pointer',
            }}
          >
            Revisar pedido
          </button>
        </div>
      )}

      {cartOpen && (
        <div className="client-cart-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setCartOpen(false); }}>
          <section className="client-cart-panel" role="dialog" aria-modal="true" aria-labelledby="client-cart-title">
            <header className="client-cart-header">
              <div><h2 id="client-cart-title" style={{ margin: 0 }}>Tu pedido · Mesa #{selectedTable}</h2><p style={{ margin: '4px 0 0', color: '#6b7280' }}>Revisa cantidades y agrega indicaciones.</p></div>
              <button type="button" onClick={() => setCartOpen(false)} disabled={submitting} aria-label="Cerrar resumen" style={{ minWidth: 44, minHeight: 44, fontSize: 24 }}>×</button>
            </header>
            <div className="client-cart-scroll">
              {cart.map((item) => (
                <article key={item.product.id} style={{ padding: '14px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <strong style={{ overflowWrap: 'anywhere' }}>{item.product.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      <button type="button" onClick={() => updateCartQuantity(item.product.id, -1)} aria-label={`Quitar una unidad de ${item.product.name}`} style={{ minWidth: 44, minHeight: 44 }}>−</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateCartQuantity(item.product.id, 1)} aria-label={`Agregar una unidad de ${item.product.name}`} style={{ minWidth: 44, minHeight: 44 }}>+</button>
                    </div>
                  </div>
                  <p style={{ margin: '4px 0 8px', color: '#4b5563' }}>${(item.product.price * item.quantity).toLocaleString()}</p>
                  <label style={{ display: 'grid', gap: 5, fontSize: 14, fontWeight: 600 }}>
                    Nota para este producto
                    <input
                      value={item.notes}
                      maxLength={250}
                      onChange={(event) => updateCartNotes(item.product.id, event.target.value)}
                      placeholder="Ej. sin cebolla, sin hielo…"
                      style={{ boxSizing: 'border-box', width: '100%', padding: 10, fontSize: 16, border: '1px solid #9ca3af', borderRadius: 8 }}
                    />
                  </label>
                </article>
              ))}
              <label style={{ display: 'grid', gap: 6, marginTop: 16, fontSize: 14, fontWeight: 700 }}>
                Observación para el garzón (opcional)
                <textarea
                  value={generalNotes}
                  maxLength={250}
                  onChange={(event) => setGeneralNotes(event.target.value)}
                  placeholder="Ej. estamos celebrando, traer todo junto…"
                  rows={3}
                  style={{ boxSizing: 'border-box', width: '100%', padding: 10, fontSize: 16, border: '1px solid #9ca3af', borderRadius: 8, resize: 'vertical' }}
                />
                <span style={{ textAlign: 'right', color: '#6b7280', fontWeight: 400 }}>{generalNotes.length}/250</span>
              </label>
              {submitError && <p role="alert" style={{ color: '#991b1b', background: '#fee2e2', padding: 10, borderRadius: 8 }}>{submitError}</p>}
            </div>
            <footer className="client-cart-footer">
              <strong style={{ fontSize: 20 }}>Total: ${totalAmount.toLocaleString()}</strong>
              <button type="button" onClick={() => void handleClientOrder()} disabled={submitting || cart.length === 0} style={{ minHeight: 48, padding: '12px 18px', color: '#fff', background: '#15803d', border: 0, borderRadius: 8, fontWeight: 800, fontSize: 16 }}>
                {submitting ? 'Enviando…' : 'Enviar preorden al garzón'}
              </button>
            </footer>
          </section>
          <style>{`
            .client-cart-overlay{position:fixed;inset:0;z-index:60;display:grid;place-items:center;padding:16px;background:rgba(0,0,0,.5)}
            .client-cart-panel{width:min(100%,680px);max-height:min(92dvh,900px);display:flex;flex-direction:column;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.25);overflow:hidden}
            .client-cart-header{position:sticky;top:0;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px;border-bottom:1px solid #e5e7eb;background:#fff}
            .client-cart-scroll{overflow-y:auto;overscroll-behavior:contain;padding:0 16px;min-height:0}
            .client-cart-footer{position:sticky;bottom:0;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #e5e7eb;background:#fff}
            @media(max-width:639px){.client-cart-overlay{place-items:end center;padding:0}.client-cart-panel{width:100%;height:100dvh;max-height:100dvh;border-radius:0}.client-cart-header{padding-top:calc(14px + env(safe-area-inset-top))}.client-cart-footer{align-items:stretch;flex-direction:column}.client-cart-footer button{width:100%}}
          `}</style>
        </div>
      )}
    </div>
  );
};

export default ClientMenu;
