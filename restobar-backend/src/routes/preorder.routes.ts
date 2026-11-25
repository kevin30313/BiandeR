import { Router } from 'express';
import { editPreorder } from '../controllers/order.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.patch('/:id', authenticateToken, authorizeRoles('WAITER', 'ADMIN'), editPreorder);

export default router;
