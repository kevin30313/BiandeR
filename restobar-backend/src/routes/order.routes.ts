import { Router } from 'express';
import { 
  createOrder, 
  getOrders, 
  updateOrderStatus, 
  payOrder 
} from '../controllers/order.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// ✅ PÚBLICO: Los clientes de las mesas pueden crear pedidos sin token
router.post('/', createOrder);

// 🔒 RUTAS PROTEGIDAS: Requieren autenticación con JWT
router.get('/', authenticateToken, getOrders);

router.patch(
  '/:id/status', 
  authenticateToken, 
  authorizeRoles('KITCHEN', 'WAITER', 'ADMIN'), 
  updateOrderStatus
);

router.post(
  '/:id/pay', 
  authenticateToken, 
  authorizeRoles('CASHIER', 'ADMIN'), 
  payOrder
);

export default router;