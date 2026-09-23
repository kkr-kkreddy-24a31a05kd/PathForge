import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pathforge_jwt_super_secret_dev_key_2026';

let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;

  // Socket middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const decoded = jwt.verify(cleanToken, JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userRoom = `user:${socket.userId}`;
    socket.join(userRoom);
    console.log(`⚡ Socket connected: ${socket.id} joined room ${userRoom}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => ioInstance;

/**
 * Creates persistent notification in DB and emits real-time event to the user's socket room
 */
export const notifyUser = async ({ userId, title, message, type = 'general', link = '', metadata = {} }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
      metadata
    });

    if (ioInstance) {
      const room = `user:${userId.toString()}`;
      ioInstance.to(room).emit('notification', {
        _id: notification._id,
        title,
        message,
        type,
        link,
        metadata,
        createdAt: notification.createdAt,
        read: false
      });
      console.log(`📢 Real-time notification dispatched to room ${room}: "${title}"`);
    }

    return notification;
  } catch (error) {
    console.error('Error dispatching notification:', error);
    return null;
  }
};
