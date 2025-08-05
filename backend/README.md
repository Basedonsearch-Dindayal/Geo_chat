# Geo Chat Backend

A real-time location-based chat backend built with Node.js, Express, Socket.IO, and TypeScript.

## Features

- 🌍 **Location-based chat**: Users can chat with others within a specific distance range
- 💬 **Direct messaging**: Private messaging between users
- 🔄 **Real-time updates**: Live user location updates and message delivery
- 📱 **Distance filtering**: Choose chat range (1km, 5km, or 10km)
- 🚀 **WebSocket support**: Real-time bi-directional communication
- 🔒 **Input validation**: Comprehensive data validation and sanitization

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **TypeScript** - Type safety
- **Joi** - Data validation

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy `.env` file and adjust if needed:
   ```bash
   # Default values are already set in .env
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **For production:**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### REST API

- `GET /` - API information
- `GET /health` - Health check with statistics
- `GET /stats` - Detailed server statistics

### WebSocket Events

#### Client to Server Events

- `join_location` - Join chat with username and location
- `update_location` - Update user's current location
- `send_message` - Send a message (public or direct)
- `start_direct_chat` - Start a direct chat with another user
- `set_distance_range` - Set the distance range for receiving messages
- `get_users_in_range` - Get list of users within range

#### Server to Client Events

- `user_joined` - New user joined nearby
- `user_left` - User left or went offline
- `user_updated` - User updated their location
- `new_message` - New message received
- `users_in_range` - List of users within distance range
- `messages_in_range` - List of messages within distance range
- `direct_chat_started` - Direct chat session started
- `error` - Error occurred

## Data Models

### User
```typescript
interface User {
  id: string;
  username: string;
  latitude: number;
  longitude: number;
  lastSeen: Date;
  isOnline: boolean;
}
```

### Message
```typescript
interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  recipientId?: string; // For direct messages
  isDirectMessage?: boolean;
}
```

## Distance Calculation

The backend uses the Haversine formula to calculate distances between geographical coordinates, providing accurate distance measurements for location-based chat filtering.

## Development

- **Hot reload**: `npm run dev` uses `tsx watch` for instant reloads
- **Linting**: `npm run lint` to check code quality
- **Building**: `npm run build` to compile TypeScript

## Architecture

```
src/
├── server.ts          # Main server setup
├── types.ts           # Shared TypeScript interfaces
├── chatService.ts     # Core chat business logic
├── socketHandler.ts   # WebSocket event handling
├── utils.ts           # Utility functions (distance calculation, etc.)
└── validation.ts      # Input validation schemas
```

## Security Features

- **CORS protection** with configurable origins
- **Helmet.js** for security headers
- **Input validation** for all user inputs
- **Rate limiting** ready (configurable)
- **Graceful shutdown** handling

## Monitoring

The `/health` and `/stats` endpoints provide:
- Server uptime
- Active user count
- Total messages
- Connected sockets
- Memory usage

## Frontend Integration

This backend is designed to work with the React frontend. Make sure to:

1. Update the frontend's Socket.IO connection URL to point to this backend
2. Ensure CORS_ORIGIN is set correctly
3. The frontend should handle all the socket events listed above

## Future Enhancements

- [ ] Database persistence (MongoDB/PostgreSQL)
- [ ] User authentication (JWT)
- [ ] Message encryption
- [ ] File/image sharing
- [ ] Push notifications
- [ ] Rate limiting per user
- [ ] Admin dashboard
- [ ] Message history pagination

## License

MIT
