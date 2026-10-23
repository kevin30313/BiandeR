import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '../api/axiosInstance';

export interface Category { id: string; name: string; }
export interface Product { id: string; name: string; price: number; categoryId: string; }
export interface Table { id: string; number: number; status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'; }
export interface CartItem { product: Product; quantity: number; notes: string; }

export const useWaiterOrder = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [tablesRes, categoriesRes, productsRes] = await Promise.all([
          api.get('/tables'),
          api.get('/categories'),
          api.get('/products'),
        ]);
        setTables(tablesRes.data);
        setCategories(categoriesRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setMessage({ type: 'error', text: 'Error cargando datos del servidor' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  }, []);

  const updateNotes = useCallback((productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, notes } : item))
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const filteredProducts = useMemo(() => {
    return selectedCategoryId === 'ALL'
      ? products
      : products.filter((p) => p.categoryId === selectedCategoryId);
  }, [products, selectedCategoryId]);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const submitOrder = async () => {
    if (!selectedTableId) return setMessage({ type: 'error', text: 'Selecciona una mesa.' });
    if (cart.length === 0) return setMessage({ type: 'error', text: 'El carrito está vacío.' });

    try {
      setSubmitting(true);
      setMessage(null);
      await api.post('/orders', {
        tableId: selectedTableId,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      });
      setMessage({ type: 'success', text: 'Comanda enviada a cocina con éxito' });
      setCart([]);
      setSelectedTableId('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error al enviar comanda' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
};