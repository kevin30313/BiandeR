import { Router } from 'express';
import {
  closeCashRegister,
  getCashSummary,
  getChargeableTables,
  getSales,
  payTable,
  updateSalePayment,
} from '../controllers/cashier.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken, authorizeRoles('CASHIER', 'ADMIN'));
router.get('/tables', getChargeableTables);
router.post('/tables/:tableId/pay', payTable);
router.get('/sales', getSales);
router.patch('/sales/:id/payment', updateSalePayment);
router.get('/summary', getCashSummary);
router.post('/close', closeCashRegister);

export default router;
