import { Router } from 'express';
import { createTable, deleteTable, getTables, updateTableStatus } from '../controllers/table.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getTables);
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createTable);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteTable);
router.patch('/:id/status', authenticateToken, updateTableStatus);

export default router;
