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
  category?: Category;
  isAvailable: boolean;
}

export const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para crear categoría desde el panel del admin
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Estados del formulario de producto
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

  const getAuthToken = () => localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProducts(Array.isArray(prodData) ? prodData : []);

      if (Array.isArray(catData)) {
        setCategories(catData);
        if (catData.length > 0) {
          setCategoryId((prev) => prev || catData[0].id);
        } else {
          setCategoryId('');
        }
      } else {
        setCategories([]);
        setCategoryId('');
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos del servidor');
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    const token = getAuthToken();
    if (!token) {
      setCategoryFeedback({ type: 'err', text: 'Sesión no encontrada. Inicia sesión como admin.' });
      return;
    }

    try {
      setCreatingCategory(true);
      setCategoryFeedback(null);

      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || `Error ${res.status} al crear la categoría`);
      }

      setCategories((prev) => [...prev, data]);
      setCategoryId(data.id);
      setNewCategoryName('');
      setCategoryFeedback({ type: 'ok', text: `Categoría "${data.name}" creada y seleccionada.` });
    } catch (err: any) {
      setCategoryFeedback({ type: 'err', text: err.message || 'No se pudo crear la categoría' });
    } finally {
      setCreatingCategory(false);
    }
  };

  // Manejar la subida de imagen local y convertirla a Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryId) {
      alert('Crea o selecciona una categoría válida antes de guardar.');
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      alert('Ingresa un precio válido mayor a 0.');
      return;
    }

    const token = getAuthToken();

    try {
      const endpoint = isEditing ? `${API_URL}/products/${currentId}` : `${API_URL}/products`;
      const method = isEditing ? 'PUT' : 'POST';
      const bodyData = {
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        image: image || undefined,
        categoryId,
        isAvailable,
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || errData.error || `Error ${res.status} al guardar el producto`
        );
      }

      resetForm();
      fetchData();
      alert(isEditing ? '¡Producto actualizado con éxito!' : '¡Producto creado con éxito!');
    } catch (err: any) {
      console.error('Detalle del error:', err);
      alert(err.message || 'Error al guardar el producto');
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
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
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

      {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

      {/* Crear Nueva Categoría */}
      <div
        style={{
          background: '#f3f6fa',
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #d0d7de',
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Nueva Categoría del Restaurante</h3>
        <form onSubmit={handleCreateCategory} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Ej. Comidas, Pizzas, Coctelería..."
            style={{ flex: '1 1 240px', padding: '8px', boxSizing: 'border-box' }}
          />
          <button
            type="submit"
            disabled={creatingCategory || !newCategoryName.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creatingCategory ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: creatingCategory || !newCategoryName.trim() ? 0.6 : 1,
            }}
          >
            {creatingCategory ? 'Creando...' : '+ Crear Categoría'}
          </button>
        </form>
        {categoryFeedback && (
          <p
            style={{
              marginTop: '8px',
              marginBottom: 0,
              fontSize: '14px',
              color: categoryFeedback.type === 'ok' ? '#15803d' : '#dc2626',
            }}
          >
            {categoryFeedback.text}
          </p>
        )}
      </div>

      {/* Formulario de Producto */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #ddd',
        }}
      >
        <h3>{isEditing ? 'Editar Producto' : 'Crear Nuevo Plato / Producto'}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej. Chorrillana Familiar"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Precio ($):</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="Ej. 8500"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Categoría:</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            >
              {categories.length === 0 ? (
                <option value="">Crea una categoría arriba primero</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Subir Imagen desde el Dispositivo:
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Vista previa de la imagen cargada */}
        {image && (
          <div style={{ marginBottom: '15px' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>
              Vista previa de la imagen:
            </span>
            <img
              src={image}
              alt="Preview"
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ingredientes, porción, detalles..."
            style={{ width: '100%', padding: '8px', height: '60px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />{' '}
            Disponible en el menú
          </label>
        </div>

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#16a34a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          {isEditing ? 'Actualizar Producto' : 'Guardar Producto'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            style={{
              marginLeft: '10px',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '4px',
              border: '1px solid #ccc',
            }}
          >
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
            {Array.isArray(products) && products.length > 0 ? (
              products.map((product) => (
                <tr key={product.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      'Sin foto'
                    )}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {product.category?.name || 'Sin categoría'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    ${Number(product.price).toLocaleString()}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    {product.isAvailable ? '✅ Disponible' : '❌ Oculto'}
                  </td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{ marginRight: '5px', padding: '5px 10px', cursor: 'pointer' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  No hay productos registrados en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminProducts;