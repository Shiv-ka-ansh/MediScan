import express from 'express';
import { getDynamicReference, checkValue } from '../controllers/referenceController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', authenticate, getDynamicReference);
router.post('/check', authenticate, checkValue);

export default router;
