import { Router } from 'express';
import { createLiveClass, getLiveClasses } from '../controllers/liveClassController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, restrictTo('ADMIN', 'FACULTY'), createLiveClass);
router.get('/', protect, getLiveClasses);

export default router;
