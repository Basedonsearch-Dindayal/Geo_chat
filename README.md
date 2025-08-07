# 🌍 Geo Chat - Real-time Location-Based Chat Application

A modern, real-time chat application that connects users based on their geographical proximity. Built with React, TypeScript, and Socket.IO.

## ✨ Features

### 🗺️ **Location-Based Connectivity**
- **GPS Integration**: Automatic location detection using browser geolocation API
- **Distance Filtering**: Adjustable distance ranges (100m to 50km)
- **Smart User Sorting**: Active users displayed by proximity

### 💬 **Real-time Communication**
- **Instant Messaging**: Real-time chat with WebSocket connections
- **Direct Messages**: Private conversations between users
- **Typing Indicators**: See when someone is typing
- **Message Status**: Delivery and read receipts

### 🔔 **Enhanced Notifications**
- **Individual Notifications**: Separate notification counts per user
- **Sound Alerts**: Different notification sounds for various message types
- **Desktop Notifications**: Browser notifications when app is in background
- **Customizable Settings**: Control notification preferences

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Eye-friendly dark theme
- **Smooth Animations**: Polished user interactions
- **Real-time Updates**: Live user presence and message updates

## 🚀 Live Demo

- **Frontend**: [https://geo-chat-flax.vercel.app](https://geo-chat-flax.vercel.app)
- **Backend**: [https://geo-chat-d184.onrender.com](https://geo-chat-d184.onrender.com)

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Socket.IO** for WebSocket connections
- **TypeScript** for type safety
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📁 Project Structure

```
Geo_chat/
├── project/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and socket services
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                # Node.js backend server
│   ├── src/
│   │   ├── handlers/       # Socket event handlers
│   │   ├── utils/          # Backend utilities
│   │   └── server.ts       # Main server file
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Modern web browser with geolocation support

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Basedonsearch-Dindayal/Geo_chat.git
   cd Geo_chat
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd project
   npm install
   npm run dev
   ```

4. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

### Environment Configuration

#### Frontend (.env)
```env
VITE_SERVER_URL=http://localhost:3001
```

#### Backend (.env)
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variable: `VITE_SERVER_URL=https://your-backend-url`
3. Deploy automatically on push to main branch

### Backend (Render/Railway/Heroku)
1. Connect your GitHub repository
2. Set root directory to `backend`
3. Configure environment variables:
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend-url`

## 🔒 Security Features

- **Input Validation**: All user inputs are sanitized and validated
- **CORS Protection**: Configured for specific origins only
- **Helmet Security**: Security headers for enhanced protection
- **XSS Prevention**: No dangerous HTML rendering
- **Safe Storage**: Client-side data stored securely

## 📱 Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Geolocation API requires HTTPS in production environments.

## 🎯 Usage

1. **Grant Location Permission**: Allow the app to access your location
2. **Enter Username**: Choose a display name for the chat
3. **Set Distance Range**: Adjust how far you want to connect with others
4. **Start Chatting**: Send public messages or start direct conversations
5. **Customize Notifications**: Configure your notification preferences

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.IO** for real-time communication
- **Vercel** for frontend hosting
- **Render** for backend hosting
- **Tailwind CSS** for beautiful styling
- **React Team** for the amazing framework

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Basedonsearch-Dindayal/Geo_chat/issues) page
2. Create a new issue with detailed description
3. Include browser console errors if applicable

---

**Made with ❤️ for connecting people through proximity and technology**