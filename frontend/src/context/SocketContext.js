import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        newSocket.emit('join-room', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      newSocket.on('notification', (data) => {
        toast.info(data.message || data.title);
        setNotifications(prev => [data, ...prev]);
      });

      newSocket.on('ticket:created', (ticket) => {
        if (user.role !== 'Employee') {
          toast.info('New ticket created');
        }
      });

      newSocket.on('ticket:updated', (ticket) => {
        toast.info(`Ticket "${ticket.title}" has been updated`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
    notifications
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

