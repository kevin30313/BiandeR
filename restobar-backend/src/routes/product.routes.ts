import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// ✅ Ruta pública: Obtener lista de productos (Cualquier cliente/móvil puede ver la carta)
router.get('/', getProducts);

// 🔒 Rutas protegidas (Admin): Crear, actualizar y eliminar productos
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createProduct);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateProduct);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteProduct);
export default router;