import { Router } from 'express';
import { deleteUser } from '../controllers/auth.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);

export default router;
