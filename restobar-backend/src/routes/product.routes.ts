import { Router } from 'express';
import { getProducts, createProduct, createCategory } from '../controllers/product.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// ✅ Ruta pública: Obtener lista de productos (Cualquier cliente/móvil puede ver la carta)
router.get('/', getProducts);

// 🔒 Rutas protegidas: Requieren token y rol ADMIN para modificar el menú
router.post('/category', authenticateToken, authorizeRoles('ADMIN'), createCategory);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createProduct);

export default router;