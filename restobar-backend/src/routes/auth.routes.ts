import { Router } from 'express';
import { login, register, listUsers } from '../controllers/auth.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/users', authenticateToken, authorizeRoles('ADMIN'), listUsers);
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), register);

export default router;
