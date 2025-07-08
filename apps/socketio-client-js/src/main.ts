import io from 'socket.io-client';

console.log('Connecting to server:', 'http://localhost:3000');
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('message', "I'm here bitchessss");
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('error', (error) => {
  console.error('Error:', error);
});
