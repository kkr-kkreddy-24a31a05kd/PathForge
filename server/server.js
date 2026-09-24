import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { connectDB, closeDB } from './config/db.js';
import { initMailer } from './config/nodemailer.js';
import { initSocket } from './socket/socketHandler.js';
import { seedDatabase } from './utils/seedData.js';

import authRoutes from './routes/authRoutes.js';
import internshipRoutes from './routes/internshipRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
const server = http.createServer(app);

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://kkr-kkreddy-24a31a05kd.github.io'
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const trimmed = url.trim();
    if (trimmed) {
      try {
        const parsed = new URL(trimmed);
        if (!allowedOrigins.includes(parsed.origin)) {
          allowedOrigins.push(parsed.origin);
        }
      } catch {
        const clean = trimmed.replace(/\/+$/, '');
        if (!allowedOrigins.includes(clean)) {
          allowedOrigins.push(clean);
        }
      }
    }
  });
}

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (mobile apps, curl, Postman, server-to-server health checks)
  if (!origin) return true;
  if (process.env.CORS_ORIGIN === '*') return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow GitHub Pages deployments
  if (/^https:\/\/[a-zA-Z0-9-]+\.github\.io$/.test(origin)) return true;
  // Allow localhost during development
  if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Initialize Socket.io
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Socket CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
  }
});
initSocket(io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// TASK 2: Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PathForge API is running',
    service: 'PathForge API'
  });
});

// TASK 2: Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'PathForge API'
  });
});

// Backward-compatible API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'PathForge API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// TASK 9: 404 Handler for all unmatched routes (returns JSON instead of Express default HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// TASK 9: Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Process event handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

// TASK 9: Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🔌 HTTP server closed.');
    try {
      await closeDB();
      console.log('📦 Database connection closed.');
    } catch (err) {
      console.error('Error during database disconnect:', err?.message || err);
    }
    process.exit(0);
  });

  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// TASK 3: Render Port & Host binding
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

const startServer = async () => {
  // Bind server to 0.0.0.0:PORT first so Render health check can pass immediately
  server.listen(PORT, HOST, () => {
    console.log(`🚀 PathForge Server running on http://${HOST}:${PORT}`);
  });

  // TASK 8: Database & services connection resilience
  try {
    await connectDB();
    await initMailer();
    await seedDatabase();
  } catch (error) {
    console.error('⚠️ Database/Service initialization warning during startup:', error?.message || error);
    console.log('ℹ️ Server will continue running to answer health checks; Mongoose will retry.');
  }
};

startServer();

