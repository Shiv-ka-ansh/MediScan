import express from 'express';
import {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    googleAuth
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

router.get('/me', authenticate, getMe);

export default router;
