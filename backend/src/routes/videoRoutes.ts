import { Router } from 'express';
import { createVideo, getVideos, updateProgress, getContinueWatching, toggleBookmark, getBookmarks } from '../controllers/videoController';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../utils/fileUpload';

const router = Router();

router.post('/', protect, restrictTo('ADMIN', 'FACULTY'), upload.single('file'), createVideo);
router.get('/', protect, getVideos);
router.post('/progress', protect, restrictTo('STUDENT'), updateProgress);
router.get('/continue-watching', protect, restrictTo('STUDENT'), getContinueWatching);
router.post('/bookmark', protect, restrictTo('STUDENT'), toggleBookmark);
router.get('/bookmarks', protect, restrictTo('STUDENT'), getBookmarks);

export default router;
