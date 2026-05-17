import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }
  if (!token) return null;
  
  socket = io('http://localhost:5000', {
    auth: { token }
  });

  socket.on('connect', () => {
    console.log('Connected to Socket.IO server', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
  });

  return socket;
};

export const getSocket = () => socket;
