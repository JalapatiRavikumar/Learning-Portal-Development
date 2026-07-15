// ============================================================
// backend/server.js  — Express Application Entry Point
// GVCC Learning Portal | MERN Stack
// ============================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import videoRoutes from './routes/videoRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

// ── Connect to MongoDB ────────────────────────────────────────
connectDB();

const app = express();

// ── Security Middleware ───────────────────────────────────────
// ── Security Middleware ───────────────────────────────────────
// Helmet adds secure HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow video src from different origins
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "http://localhost:5000", "http://localhost:5173", "*"],
      frameSrc: ["'self'", "https://www.youtube.com"]
    },
  },
}));

// CORS — allow only the React frontend origin
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate Limiting ─────────────────────────────────────────────
// Global: 200 requests per 10 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use(globalLimiter);

// ── Body Parser ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── HTTP Request Logger (dev only) ───────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── API Health Check ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ── Mount Routes ──────────────────────────────────────────────
app.use('/api/videos', videoRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/users', userRoutes);

// ── Serve Frontend ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// ── 404 Handler for API Routes ────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ── Catch-All for React SPA ───────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// ── Global Error Handler ──────────────────────────────────────
// Catches any thrown errors from controllers — hides stack traces in prod
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred.'
    : err.message;

  console.error(`[${new Date().toISOString()}] ERROR ${statusCode}: ${err.message}`);

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Boot Server ───────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`\n🚀 GVCC Backend API running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
  });
}

// Required for Vercel Serverless deployments
export default app;
