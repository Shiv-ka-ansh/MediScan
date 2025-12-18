import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import net from 'net';

// Import routes with .js extension for ES modules
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET is not set in .env file!');
    console.warn('⚠️  Authentication will fail. Please set JWT_SECRET in server/.env');
}

// Create Express app
const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (for debugging)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MediScan AI Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mediscan';

// Store server instance for graceful shutdown
let serverInstance = null;

/**
 * Check if a port is available
 */
const isPortAvailable = (port) => {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.once('close', () => resolve(true));
            server.close();
        });
        server.on('error', () => resolve(false));
    });
};

/**
 * Wait for port to become available
 */
const waitForPort = async (port, maxWait = 10000, checkInterval = 500) => {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
        if (await isPortAvailable(port)) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    return false;
};

// Graceful shutdown handler
const gracefulShutdown = () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (serverInstance) {
        serverInstance.close(() => {
            console.log('✅ Server closed');
            mongoose.connection.close(false, () => {
                console.log('✅ MongoDB connection closed');
                process.exit(0);
            });
        });
        // Force close after 5 seconds
        setTimeout(() => {
            console.log('⚠️  Forcing shutdown...');
            process.exit(0);
        }, 5000);
    } else {
        mongoose.connection.close(false, () => {
            process.exit(0);
        });
    }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions to ensure cleanup
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});

mongoose
    .connect(MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Start server
        const PORT = parseInt(process.env.PORT || 8000);
        
        // Function to start server with proper port handling
        const startServer = async () => {
            // Close previous server instance if it exists
            if (serverInstance) {
                try {
                    await new Promise((resolve) => {
                        serverInstance.close(() => {
                            console.log('🔄 Previous server instance closed');
                            resolve();
                        });
                        // Force close after 2 seconds
                        setTimeout(resolve, 2000);
                    });
                    serverInstance = null;
                } catch (e) {
                    // Ignore errors when closing
                    serverInstance = null;
                }
            }

            // Wait for port to become available (up to 10 seconds)
            console.log(`🔍 Checking if port ${PORT} is available...`);
            const portAvailable = await waitForPort(PORT, 10000, 500);
            
            if (!portAvailable) {
                console.error(`❌ Port ${PORT} is still in use after waiting!`);
                console.error(`💡 Solutions:`);
                console.error(`   1. Kill the process: netstat -ano | findstr :${PORT} then taskkill /F /PID <PID>`);
                console.error(`   2. Change PORT in server/.env file to a different port`);
                console.error(`   3. Stop node --watch and restart manually`);
                process.exit(1);
                return;
            }

            try {
                // Create HTTP server
                const httpServer = http.createServer(app);
                
                // Attach error handler BEFORE listening
                httpServer.on('error', (error) => {
                    if (error.code === 'EADDRINUSE') {
                        console.error(`❌ Port ${PORT} became unavailable during startup!`);
                        console.error(`💡 This usually means another process grabbed the port.`);
                        console.error(`   Try stopping node --watch and restarting manually.`);
                        process.exit(1);
                    } else {
                        console.error('❌ Server error:', error);
                        process.exit(1);
                    }
                });

                // Success handler
                httpServer.once('listening', () => {
                    const addr = httpServer.address();
                    console.log(`🚀 Server running on port ${addr.port}`);
                    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
                });

                // Set socket options for better connection handling
                httpServer.on('connection', (socket) => {
                    socket.setKeepAlive(true);
                    socket.setNoDelay(true);
                });

                // Start listening - Node.js sets SO_REUSEADDR by default on Windows
                // The waitForPort check ensures the port is available before binding
                serverInstance = httpServer.listen(PORT, '0.0.0.0', () => {
                    // Server started successfully - handled by 'listening' event
                });

            } catch (error) {
                console.error('❌ Failed to start server:', error);
                process.exit(1);
            }
        };

        // Start the server
        await startServer();
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

export default app;
