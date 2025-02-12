// server/server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const bodyParser = require("body-parser");

const smsRoutes = require('./routes/sms');
const chatRoutes = require('./routes/chat');
const emailRoutes = require('./routes/email');
const callRoutes = require('./routes/call');
const twimlRoutes = require("./routes/twiml");
const tokenRoutes = require("./routes/token");

const app = express();
const server = http.createServer(app);
const server2 = http.createServer(app);

const io = socketIO(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
  }
});

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://192.168.1.10:5173",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/sms', smsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/call', callRoutes);
app.use("/api/call/twiml", twimlRoutes);
app.use("/api/call/token", tokenRoutes);

// Socket.IO for chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('chat message', async (msg) => {
    console.log('Message:', msg);
    io.emit('chat message', msg); // Broadcast to all connected clients
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Server is running...");
});


server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port http://0.0.0.0:${PORT}`);
});
server2.listen(PORT, () => {
  console.log(`Server running on port localhost:${PORT}`);
});