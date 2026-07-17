import { Router } from 'express';
import { createCourse, getAllCourses, createSubject, getSubjectsByCourse, getSubjectDetails } from '../controllers/courseController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/', protect, restrictTo('ADMIN'), createCourse);
router.get('/', getAllCourses);
router.post('/subject', protect, restrictTo('ADMIN'), createSubject);
router.get('/:courseId/subjects', getSubjectsByCourse);
router.get('/subject/:id', getSubjectDetails);

export default router;
