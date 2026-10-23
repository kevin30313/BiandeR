import { Router } from 'express';
import { getTables, updateTableStatus } from '../controllers/table.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getTables);
router.patch('/:id/status', authenticateToken, updateTableStatus);

export default router;