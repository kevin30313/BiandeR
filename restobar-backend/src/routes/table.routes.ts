import { Router } from 'express';
import { createTable, getTables, updateTableStatus } from '../controllers/table.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getTables);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createTable);
router.patch('/:id/status', authenticateToken, updateTableStatus);

export default router;
