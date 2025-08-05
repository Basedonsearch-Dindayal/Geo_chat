// Simple test script to verify backend functionality
// Run with: node test-backend.js

import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('✅ Connected to backend successfully!');
  
  // Test joining location
  socket.emit('join_location', {
    username: 'TestUser',
    latitude: 40.7128,
    longitude: -74.0060
  });
  
  console.log('📍 Sent join_location event');
});

socket.on('users_in_range', (users) => {
  console.log('👥 Received users in range:', users.length);
});

socket.on('messages_in_range', (messages) => {
  console.log('💬 Received messages in range:', messages.length);
});

socket.on('error', (error) => {
  console.log('❌ Error:', error.message);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
});

socket.on('disconnect', () => {
  console.log('👋 Disconnected from backend');
});

// Test sending a message after 2 seconds
setTimeout(() => {
  socket.emit('send_message', {
    content: 'Hello from test script!',
    latitude: 40.7128,
    longitude: -74.0060
  });
  console.log('📤 Sent test message');
}, 2000);

// Disconnect after 5 seconds
setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 5000);
