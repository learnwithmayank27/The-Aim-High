import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load Environment variables
dotenv.config();

// Route Imports
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';
import paperRoutes from './routes/paperRoutes';
import homeworkRoutes from './routes/homeworkRoutes';
import videoRoutes from './routes/videoRoutes';
import liveRoutes from './routes/liveRoutes';
import resultRoutes from './routes/resultRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import feeRoutes from './routes/feeRoutes';
import contentRoutes from './routes/contentRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

// Middlewares
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logger Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images/files
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve file uploads locally
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Aim High Academy API is running smoothly.' });
});

// Apply API Rate Limiting to routes
app.use('/api', apiLimiter);

// Mounting Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Server startup
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 Aim High Server running on: http://localhost:${PORT}`);
  console.log(`📂 Uploads served from: ${uploadsDir}`);
  console.log(`===================================================`);
});
