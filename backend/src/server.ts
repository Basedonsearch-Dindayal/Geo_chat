import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { ChatService } from './chatService.js';
import { SocketHandler } from './socketHandler.js';
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData
} from './types.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Socket.IO setup with proper typing
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Initialize services
const chatService = new ChatService();
const socketHandler = new SocketHandler(io, chatService);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req, res) => {
  res.json({
    message: 'Geo Chat Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  const stats = chatService.getStats();
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    stats,
    timestamp: new Date().toISOString(),
  });
});

app.get('/stats', (req, res) => {
  const stats = chatService.getStats();
  res.json({
    ...stats,
    connectedSockets: io.sockets.sockets.size,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found',
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Geo Chat Backend running on port ${PORT}`);
  console.log(`📍 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:5173"}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, io, server };
