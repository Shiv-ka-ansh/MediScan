import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log('Registration attempt for email:', email);

        if (!name || !email || !password) {
            console.log('Registration failed: Missing required fields');
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Registration failed: User already exists for email:', email);
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables!');
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
        });

        const token = generateToken(user._id.toString());

        console.log('Registration successful for user:', user.email);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ message: messages.join(', ') });
        } else {
            res.status(500).json({ message: error.message || 'Registration failed' });
        }
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            res.status(400).json({ message: 'Please provide email and password' });
            return;
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Login failed: User not found for email:', email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch for email:', email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables!');
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        const token = generateToken(user._id.toString());

        console.log('Login successful for user:', user.email);

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isProfileComplete: user.isProfileComplete,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                isProfileComplete: user.isProfileComplete,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get user' });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        try {
            await sendPasswordResetEmail(user.email, resetToken);
        } catch (emailError) {
            console.error('Email send error:', emailError);
        }

        res.json({ message: 'If an account exists, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Failed to process request' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ message: 'Failed to verify email' });
    }
};

export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user || user.verified) {
            return res.json({ message: 'If an unverified account exists, a verification link has been sent.' });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        await user.save();

        try {
            await sendVerificationEmail(user.email, verificationToken);
        } catch (emailError) {
            console.error('Email send error:', emailError);
        }

        res.json({ message: 'If an unverified account exists, a verification link has been sent.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Failed to process request' });
    }
};

export const googleAuth = async (req, res) => {
    try {
        const { credential, role } = req.body;

        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        console.log('Google auth attempt for:', email);

        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleId;
                user.avatar = picture;
                await user.save();
                console.log('Linked Google account to existing user:', email);
            }
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                avatar: picture,
                role: role || 'patient',
                verified: true,
            });
            console.log('Created new user via Google:', email);
        }

        const token = generateToken(user._id.toString());

        res.json({
            message: 'Google authentication successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                isProfileComplete: user.isProfileComplete,
            },
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(401).json({ message: 'Google authentication failed. Please try again.' });
    }
};
