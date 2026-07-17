import { Router } from 'express';
import { takeAttendance, getStudentAttendance } from '../controllers/attendanceController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, restrictTo('ADMIN', 'FACULTY'), takeAttendance);
router.get('/student/:studentId', protect, getStudentAttendance);

export default router;
