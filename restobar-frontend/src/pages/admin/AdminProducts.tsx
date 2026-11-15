import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  category: Category;
  isAvailable: boolean;
}

export const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados del formulario (Crear / Editar)
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`)
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(prodData);
      setCategories(catData);
      if (catData.length > 0 && !categoryId) {
        setCategoryId(catData[0].id);
      }
    } catch (err) {
      setError('Error al cargar los datos del servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isEditing ? `${API_URL}/products/${currentId}` : `${API_URL}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          image,
          categoryId,
          isAvailable
        })
      });

      if (!res.ok) throw new Error('Error al guardar el producto');

      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setImage(product.image || '');
    setCategoryId(product.categoryId);
    setIsAvailable(product.isAvailable);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('No se pudo eliminar');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setName('');
    setDescription('');
    setPrice('');
    setImage('');
    if (categories.length > 0) setCategoryId(categories[0].id);
    setIsAvailable(true);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '20px', padding: '8px 14px', cursor: 'pointer' }}
      >
        ← Volver al Panel
      </button>

      <h1>Gestión de Productos y Menú</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #ddd' }}>
        <h3>{isEditing ? 'Editar Producto' : 'Crear Nuevo Plato / Producto'}</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nombre:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Precio ($):</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Categoría:</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ width: '100%', padding: '8px' }}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>URL de Imagen:</label>
            <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Descripción:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '8px' }} />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input type="checkbox" checked={isAvailable} onChange={e => setIsAvailable(e.target.checked)} /> Disponible en el menú
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
        </button>
        {isEditing && (
          <button type="button" onClick={resetForm} style={{ marginLeft: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            Cancelar
          </button>
        )}
      </form>

      {/* Listado de Productos */}
      <h3>Platos Actuales en la Carta</h3>
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Imagen</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Nombre</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Categoría</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Precio</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Estado</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    'Sin foto'
                  )}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.category?.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>${product.price.toLocaleString()}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {product.isAvailable ? '✅ Disponible' : '❌ Oculto'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <button onClick={() => handleEdit(product)} style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}>Editar</button>
                  <button onClick={() => handleDelete(product.id)} style={{ padding: '5px 10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;