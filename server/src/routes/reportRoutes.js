import express from 'express';
import {
    uploadReport,
    getUserReports,
    getReport,
    getPendingReports,
    reviewReport,
    deleteReport,
    getReviewedReports,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadReport);
router.get('/', getUserReports);
router.delete('/:id', deleteReport);

router.get('/pending/all', authorize('doctor', 'admin'), getPendingReports);
router.get('/reviewed', authorize('doctor', 'admin'), getReviewedReports);
router.put('/:id/review', authorize('doctor', 'admin'), reviewReport);

router.get('/:id', getReport);

export default router;
