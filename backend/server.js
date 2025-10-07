const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5176', 'http://localhost:5000', 'https://new-project-plp.onrender.com', 'https://new-project-plp.onrender.com'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5176', 'http://localhost:5000', 'https://new-project-plp.onrender.com', 'https://new-project-plp.onrender.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist')));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://isavameshack_db_user:DgjsDX69G6U6CMH0@domain.ufzx0pz.mongodb.net/devcollab?retryWrites=true&w=majority&appName=DEVEOPS')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models (ensure they are loaded)
const User = require('./models/User');
const Project = require('./models/Project');
const Message = require('./models/Message');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const projectRoutes = require('./routes/projects');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes.router);
app.use('/api/profiles', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'DevCollab Backend API' });
});

// Online users tracking
const onlineUsers = new Map(); // userId -> { socketId, userInfo }

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate socket connection using handshake auth
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log('No token provided, disconnecting');
    socket.disconnect();
    return;
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    socket.userId = decoded.userId;
    socket.join(`user_${decoded.userId}`);
    console.log('User authenticated:', decoded.userId);

    // Add user to online list
    const userInfo = await User.findById(decoded.userId).select('name username');
    if (userInfo) {
      onlineUsers.set(decoded.userId, { socketId: socket.id, userInfo });

      // Emit user joined event to all clients
      io.emit('user_joined', {
        userId: decoded.userId,
        userInfo,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('Socket authentication failed:', error);
    socket.disconnect();
    return;
  }

  // Handle request for online users list
  socket.on('get_online_users', () => {
    const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      userInfo: data.userInfo
    }));
    socket.emit('online_users', onlineUsersList);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove user from online list if they were authenticated
    if (socket.userId) {
      const userData = onlineUsers.get(socket.userId);
      if (userData) {
        onlineUsers.delete(socket.userId);

        // Emit user left event to all clients
        io.emit('user_left', {
          userId: socket.userId,
          userInfo: userData.userInfo,
          timestamp: new Date()
        });
      }
    }
  });
});

// Make io available to routes
app.set('io', io);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
