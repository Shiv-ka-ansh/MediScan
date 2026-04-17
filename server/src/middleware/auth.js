import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (
    req,
    res,
    next
) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables!');
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error.message);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
        } else {
            res.status(401).json({ message: 'Authentication failed' });
        }
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Not authenticated' });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        next();
    };
};
