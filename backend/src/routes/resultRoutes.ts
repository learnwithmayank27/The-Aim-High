import { Router } from 'express';
import { publishResult, getStudentResults } from '../controllers/resultController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, restrictTo('ADMIN', 'FACULTY'), publishResult);
router.get('/student/:studentId', protect, getStudentResults);

export default router;
