import { Router } from 'express';
import { 
  createPublicPreorder,
  createWaiterOrder,
  approvePreorder,
  rejectPreorder,
  getOrders, 
  updateOrderStatus, 
  payOrder 
} from '../controllers/order.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// ✅ PÚBLICO: Los clientes de las mesas pueden crear pedidos sin token
router.post('/', createPublicPreorder);

// 🔒 RUTAS PROTEGIDAS: Requieren autenticación con JWT
router.get('/', authenticateToken, getOrders);

router.post('/manual', authenticateToken, authorizeRoles('WAITER', 'ADMIN'), createWaiterOrder);
router.patch('/:id/approve', authenticateToken, authorizeRoles('WAITER', 'ADMIN'), approvePreorder);
router.patch('/:id/reject', authenticateToken, authorizeRoles('WAITER', 'ADMIN'), rejectPreorder);

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
