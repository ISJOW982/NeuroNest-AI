import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MongoDB URI not provided. Database functionality will be limited.');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Import routes
import routes from './routes';

// Routes
app.get('/', (req, res) => {
  res.send('NeuroNest-AI API is running');
});

// API routes
app.use('/api', routes);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Handle user messages
  socket.on('user-message', async (message) => {
    console.log('Received message:', message);
    
    // TODO: Process message through agent system
    
    // Send response back to client
    socket.emit('agent-response', {
      type: 'text',
      content: 'Your message has been received. Agent processing will be implemented soon.'
    });
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});

export default server;