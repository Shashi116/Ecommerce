const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { prisma } = require('./config/prisma');

dotenv.config();

const app = express();

// CORS configuration - Only allow the frontend URL (secure for production)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
  process.env.FRONTEND_PROD_URL // Add production frontend URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) for development only
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed from ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// API Routes - Only these should be exposed
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// In production, do NOT serve frontend from backend - use separate deployment
if (process.env.NODE_ENV === 'production') {
  // Optional: Block all non-API requests
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'Backend API only. Use the frontend application.' });
    }
    res.status(404).json({ message: 'Endpoint not found' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ message: 'CORS: Not allowed' });
  }
  
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Backend running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`\n🔒 Only API requests are allowed from frontend applications\n`);
});
