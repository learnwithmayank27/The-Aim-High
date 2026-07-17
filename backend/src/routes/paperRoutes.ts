import { Router } from 'express';
import { createPaper, getPapers, uploadSolution, approveSolution, likeSolution, addComment, getSolutionLeaderboard } from '../controllers/paperController';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../utils/fileUpload';

const router = Router();

router.post('/', protect, restrictTo('ADMIN', 'FACULTY'), upload.single('file'), createPaper);
router.get('/', getPapers);
router.post('/solution', protect, restrictTo('STUDENT'), upload.single('file'), uploadSolution);
router.patch('/solution/:id/approve', protect, restrictTo('ADMIN'), approveSolution);
router.post('/solution/:id/like', protect, likeSolution);
router.post('/solution/:id/comment', protect, addComment);
router.get('/leaderboard', protect, getSolutionLeaderboard);

export default router;
