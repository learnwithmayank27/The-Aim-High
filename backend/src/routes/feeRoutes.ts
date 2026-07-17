import { Router } from 'express';
import { createInvoice, payFee, getStudentFees } from '../controllers/feeController';
import { protect, restrictTo } from '../middleware/auth';

const router = Router();

router.post('/invoice', protect, restrictTo('ADMIN'), createInvoice);
router.post('/:id/pay', protect, payFee);
router.get('/student/:studentId', protect, getStudentFees);

export default router;
