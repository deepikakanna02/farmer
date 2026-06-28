require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('socketio', io); // Make it accessible in endpoints

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('joinChat', (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined chat: ${conversationId}`);
  });

  socket.on('sendMessage', (data) => {
    // Expected data format: { conversationId, senderId, text }
    io.to(data.conversationId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const gracefulShutdown = async (signal) => {
  console.log(`🔌 Received ${signal}. Disconnecting from MongoDB...`);
  await mongoose.connection.close();
  server.close(() => {
    console.log("👋 Server stopped gracefully.");
    process.exit(0);
  });
};

if (process.env.NODE_ENV !== "test") {
  (async () => {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })();
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

module.exports = { server, connectDB, gracefulShutdown };
