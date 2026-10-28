import { io } from 'socket.io-client';

// One shared connection; pages connect when they need live seat updates.
const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || undefined;

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});
