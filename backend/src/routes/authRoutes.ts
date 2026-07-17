import { Router } from 'express';
import { register, login, googleLogin, getProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google-login', authLimiter, googleLogin);
router.get('/me', protect, getProfile);

export default router;
