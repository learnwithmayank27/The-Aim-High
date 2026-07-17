import { Router } from 'express';
import { createNotice, getNotices, createBlogPost, getBlogs, updateContactConfig, getContactConfig, uploadNote, getNotesBySubject } from '../controllers/contentController';
import { protect, restrictTo } from '../middleware/auth';
import { upload } from '../utils/fileUpload';

const router = Router();

// Notices
router.post('/notice', protect, restrictTo('ADMIN'), createNotice);
router.get('/notice', getNotices);

// Blogs
router.post('/blog', protect, restrictTo('ADMIN', 'FACULTY'), upload.single('banner'), createBlogPost);
router.get('/blog', getBlogs);

// Contact Configurations
router.post('/contact', protect, restrictTo('ADMIN'), updateContactConfig);
router.get('/contact', getContactConfig);

// Subject Notes
router.post('/notes', protect, restrictTo('ADMIN', 'FACULTY'), upload.single('file'), uploadNote);
router.get('/notes/subject/:subjectId', protect, getNotesBySubject);

export default router;
