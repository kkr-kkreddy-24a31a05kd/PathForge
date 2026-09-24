import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axiosClient';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [token]);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    fetchNotifications();

    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL.trim().replace(/\/+$/, '');
      }
      if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.trim().replace(/\/api\/?$/, '').replace(/\/+$/, '');
      }
      if (
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ) {
        return 'http://localhost:5000';
      }
      return 'https://pathforge-api-ngmj.onrender.com';
    };

    const socketUrl = getSocketUrl();
    const newSocket = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to PathForge real-time notification stream');
    });

    newSocket.on('notification', (notif) => {
      console.log('🔔 Received real-time notification:', notif);
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Trigger prominent toast notification
      setActiveToast({
        id: notif._id || Date.now(),
        title: notif.title,
        message: notif.message,
        type: notif.type,
        link: notif.link
      });

      // Auto dismiss toast after 6 seconds
      setTimeout(() => {
        setActiveToast((current) => (current?.id === (notif._id || Date.now()) ? null : current));
      }, 6000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?._id]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all read:', error);
    }
  };

  const dismissToast = () => setActiveToast(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        activeToast,
        dismissToast
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
