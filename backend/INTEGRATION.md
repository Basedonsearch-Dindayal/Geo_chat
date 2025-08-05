# Frontend Integration Guide

This guide explains how to integrate your React frontend with the Geo Chat backend.

## Prerequisites

1. Make sure the backend is running on `http://localhost:3001`
2. Install Socket.IO client in your frontend project:

```bash
cd ../project  # Navigate to your frontend directory
npm install socket.io-client
```

## Integration Steps

### 1. Copy Integration Files to Frontend

Copy the integration files from the backend to your frontend:

```bash
# From your backend directory, copy files to frontend
cp frontend-integration/types.ts ../project/src/types/
cp frontend-integration/socketService.ts ../project/src/services/
cp frontend-integration/useLocationChatBackend.ts ../project/src/hooks/
```

**Create directories if they don't exist:**
```bash
mkdir -p ../project/src/types
mkdir -p ../project/src/services
```

### 2. Replace Mock Hook with Real Backend Hook

Your current `useLocationChat.ts` hook uses mock data. Replace it with the real backend implementation:

1. **Backup your current hook** (if you want to keep the mock version):
   ```bash
   cd ../project
   mv src/hooks/useLocationChat.ts src/hooks/useLocationChat.mock.ts
   ```

2. **Rename the new hook**:
   ```bash
   mv src/hooks/useLocationChatBackend.ts src/hooks/useLocationChat.ts
   ```

### 3. Update Your Components

The new hook has the same interface as your existing mock hook, so your React components should work without changes. However, you'll now get real-time functionality!

### 4. Key Differences from Mock

- **Real-time updates**: Users and messages update in real-time
- **Network dependency**: Requires backend connection
- **Error handling**: Includes connection and server error states
- **Performance**: Actual distance calculations and filtering

### 5. Testing the Integration

1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start your frontend**:
   ```bash
   cd project
   npm run dev
   ```

3. **Open multiple browser tabs** to test multi-user functionality

## Environment Configuration

Update your frontend's environment variables if needed:

```bash
# .env.local in your frontend project
VITE_BACKEND_URL=http://localhost:3001
```

Then update the SocketService constructor:

```typescript
const socketService = new SocketService(
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
);
```

## Advanced Usage

### Custom Socket Events

You can access the raw socket service for custom events:

```typescript
const { socketService } = useLocationChatBackend();

// Listen to custom events
socketService.on('custom_event', (data) => {
  console.log('Custom event received:', data);
});
```

### Error Handling

The hook provides error state management:

```typescript
const { error, clearError } = useLocationChatBackend();

// Display errors in your UI
{error && (
  <div className="error-message">
    {error}
    <button onClick={clearError}>Dismiss</button>
  </div>
)}
```

### Connection Status

Monitor connection status:

```typescript
const { isConnected } = useLocationChatBackend();

// Show connection status
{!isConnected && (
  <div className="connection-status">
    Connecting to server...
  </div>
)}
```

## Production Deployment

For production deployment:

1. **Backend**: Deploy to a cloud service (Heroku, Railway, etc.)
2. **Environment**: Update CORS_ORIGIN and frontend URL
3. **SSL**: Use HTTPS and WSS for Socket.IO in production

## Troubleshooting

### Common Issues

1. **CORS errors**: Check that `CORS_ORIGIN` in backend matches your frontend URL
2. **Connection refused**: Ensure backend is running on the correct port
3. **Type errors**: Make sure you've copied the latest `types.ts` file

### Debug Mode

Enable debug logging in development:

```typescript
// In your main.tsx or App.tsx
if (import.meta.env.DEV) {
  localStorage.debug = 'socket.io-client:socket';
}
```

## Next Steps

Once basic integration is working, consider adding:

- User authentication
- Message persistence
- Push notifications
- File sharing capabilities
- Admin features

The backend is designed to be easily extensible for these features.
