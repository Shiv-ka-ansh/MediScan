import express from 'express';
import {
    uploadReport,
    getUserReports,
    getReport,
    getPendingReports,
    reviewReport,
    deleteReport,
    getReviewedReports,
    translateReportHandler,
    getSupportedLanguages,
} from '../controllers/reportController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

// Public (authenticated) routes
router.post('/upload', upload.single('file'), uploadReport);
router.get('/', getUserReports);
router.delete('/:id', deleteReport);

// Multi-lingual translation
router.get('/languages', getSupportedLanguages);
router.get('/:id/translate', translateReportHandler);

// Doctor / Admin only
router.get('/pending/all', authorize('doctor', 'admin'), getPendingReports);
router.get('/reviewed', authorize('doctor', 'admin'), getReviewedReports);
router.put('/:id/review', authorize('doctor', 'admin'), reviewReport);

router.get('/:id', getReport);

export default router;
