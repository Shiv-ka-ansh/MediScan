import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        console.log('Registration attempt for email:', email);

        // Validation
        if (!name || !email || !password) {
            console.log('Registration failed: Missing required fields');
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Registration failed: User already exists for email:', email);
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Check if JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables!');
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
        });

        // Generate token
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
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ message: messages.join(', ') });
        } else {
            res.status(500).json({ message: error.message || 'Registration failed' });
        }
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        // Validation
        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            res.status(400).json({ message: 'Please provide email and password' });
            return;
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('Login failed: User not found for email:', email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch for email:', email);
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check if JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables!');
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        // Generate token
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
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message || 'Login failed' });
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
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
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to get user' });
    }
};
