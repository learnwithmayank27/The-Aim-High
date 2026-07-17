import { Router } from 'express';
import { createHomework, submitHomework, gradeSubmission, getHomeworkBySubject, getStudentSubmissions, getFacultySubmissions } from '../controllers/homeworkController';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../utils/fileUpload';

const router = Router();

router.post('/', protect, restrictTo('FACULTY'), upload.single('file'), createHomework);
router.post('/submit', protect, restrictTo('STUDENT'), upload.single('file'), submitHomework);
router.patch('/submission/:id/grade', protect, restrictTo('FACULTY'), gradeSubmission);
router.get('/subject/:subjectId', protect, getHomeworkBySubject);
router.get('/my-submissions', protect, restrictTo('STUDENT'), getStudentSubmissions);
router.get('/submissions', protect, restrictTo('FACULTY'), getFacultySubmissions);

export default router;
