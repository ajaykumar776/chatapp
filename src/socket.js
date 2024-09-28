import { io } from 'socket.io-client';

export const socket = io('http://localhost:3000',{
    reconnectionAttempts: 5, // Limit reconnection attempts
    reconnectionDelay: 1000,  // Delay between attempts in ms
  });
  