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

// All routes require authentication
router.use(authenticate);

// Patient routes
router.post('/upload', upload.single('file'), uploadReport);
router.get('/', getUserReports);
router.delete('/:id', deleteReport);

// Doctor routes (must be before /:id to avoid conflicts)
router.get('/pending/all', authorize('doctor', 'admin'), getPendingReports);
router.get('/reviewed', authorize('doctor', 'admin'), getReviewedReports);
router.put('/:id/review', authorize('doctor', 'admin'), reviewReport);

// Single report route (must be last due to :id param)
router.get('/:id', getReport);

export default router;
