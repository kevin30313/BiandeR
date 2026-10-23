import { Router } from 'express';
import { getDailySalesReport, closeShift } from '../controllers/report.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Requerir autenticación para los reportes
router.use(authenticateToken);

// Obtener reporte de ventas del día (Cajero y Admin)
router.get('/daily', authorizeRoles('CASHIER', 'ADMIN'), getDailySalesReport);

// Realizar el cierre de turno / arqueo (Cajero y Admin)
router.post('/close-shift', authorizeRoles('CASHIER', 'ADMIN'), closeShift);

export default router;