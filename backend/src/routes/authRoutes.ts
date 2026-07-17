import { Router } from 'express';
import { register, login, googleLogin, getProfile, updateProfile, getStudentsList } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { upload } from '../utils/fileUpload';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google-login', authLimiter, googleLogin);
router.get('/me', protect, getProfile);
router.put('/me', protect, upload.single('avatar'), updateProfile);
router.get('/students', protect, getStudentsList);

export default router;
