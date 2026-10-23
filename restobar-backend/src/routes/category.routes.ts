import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/product.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// ✅ Ruta pública para que el menú pueda obtener la lista de categorías
router.get('/', getCategories);

// 🔒 Ruta protegida para crear categorías
router.post('/', authenticateToken, createCategory);

export default router;