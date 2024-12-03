// load env-vars
require('dotenv').config();

// requiring dependencies
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http'); // Import the http module
const socketIo = require('socket.io'); // Import Socket.io

// initialize express
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with the HTTP server
const io = socketIo(server, {
  cors: {
    origin: [/netlify\.app$/, /localhost:\d{4}$/], // Ensure this matches the client origins
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// requiring routers
const paymentRouter = require('./routes/paymentRouter');
const productRouter = require('./routes/productRouter');
const containerRouter = require('./routes/containerRouter');
const kitchenRouter = require('./routes/kitchenRouter');
const schoolRouter = require('./routes/schoolRouter');
const pathwayRouter = require('./routes/pathwayRouter');
const truckRouter = require('./routes/truckRouter');
const assignRouter = require('./routes/assignRouter');
const adminRouter = require('./routes/adminRouter');
const orderRouter = require('./routes/orderRouter');
const uploadRouter = require('./routes/uploadRouter');

// requiring middlewares
const errorMiddleware = require('./middleware/Error');

// require db configs
const connectToDb = require('./config/db');

// require cloudinary configs
const cloudinary = require('./config/cloudinary');

// uncaught exception
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shutting down due to uncaught exception`);
  process.exit(1);
});

// connect to db
connectToDb();

// using middlewares
app.use(
  cors({
    origin: [/netlify\.app$/, /localhost:\d{4}$/],
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(cookieParser());

// basic api route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API service running 🚀',
  });
});

// using routers
app.use('/api/payment', paymentRouter);
app.use('/api/products', productRouter);
app.use('/api/trucks', truckRouter);
app.use('/api/assign', assignRouter);
app.use('/api/schools', schoolRouter);
app.use('/api/pathways', pathwayRouter);
app.use('/api/containers', containerRouter);
app.use('/api/kitchens', kitchenRouter);
app.use('/api/admin', adminRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);

// using other middlewares
app.use(errorMiddleware);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New socket connection:', socket.id);

  // Emit a message when a new client connects
  socket.emit('welcome', 'Welcome to the socket server!');

  // Example of listening for events from clients
  socket.on('newOrder', (orderData) => {
    console.log('New order received:', orderData);
    // Broadcast the new order to all clients
    io.emit('newOrder', orderData);  // Emit the order to all connected clients
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server shutting down due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  });
});

// starting server
server.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port', process.env.PORT || 5000);
});
