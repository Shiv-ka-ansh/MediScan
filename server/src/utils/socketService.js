import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';

let io = null;
const userSockets = new Map();

export function initSocketServer(server) {
    io = new Server(server, {
        cors: {
            origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'https://medi-1scanai.vercel.app'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 User connected: ${socket.userId}`);
        userSockets.set(socket.userId, socket.id);

        socket.on('mark_read', async (notificationId) => {
            try {
                await Notification.findByIdAndUpdate(notificationId, { read: true });
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        socket.on('mark_all_read', async () => {
            try {
                await Notification.updateMany(
                    { userId: socket.userId, read: false },
                    { read: true }
                );
            } catch (error) {
                console.error('Mark all read error:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.userId}`);
            userSockets.delete(socket.userId);
        });
    });

    console.log('🔌 Socket.io initialized');
    return io;
}

export async function sendNotification(userId, type, title, message, reportId = null) {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            reportId,
        });

        const socketId = userSockets.get(userId.toString());
        if (socketId && io) {
            io.to(socketId).emit('notification', {
                id: notification._id,
                type,
                title,
                message,
                reportId,
                createdAt: notification.createdAt,
            });
        }

        return notification;
    } catch (error) {
        console.error('Send notification error:', error);
        throw error;
    }
}

export async function notifyReportOpened(report, doctorName) {
    await sendNotification(
        report.userId,
        'report_opened',
        'Report Opened',
        `Dr. ${doctorName} opened your report "${report.fileName}"`,
        report._id
    );
}

export async function notifyReportCommented(report, doctorName) {
    await sendNotification(
        report.userId,
        'report_commented',
        'New Comment',
        `Dr. ${doctorName} commented on your report "${report.fileName}"`,
        report._id
    );
}

export async function notifyReportVerified(report, doctorName, status) {
    const statusText = status === 'approved' ? 'approved' : 'needs attention';
    await sendNotification(
        report.userId,
        status === 'approved' ? 'report_verified' : 'report_rejected',
        'Verification Complete',
        `Dr. ${doctorName} has ${statusText} your report "${report.fileName}"`,
        report._id
    );
}

export { io, userSockets };
