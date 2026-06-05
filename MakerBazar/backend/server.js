const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Secret Key Resolution (Resolution: Environment -> Secure Random Gen + Log)
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.warn("WARNING: JWT_SECRET environment variable is missing!");
  console.warn("Generating ephemeral secret. Instance-isolated!");
  jwtSecret = crypto.randomBytes(32).toString('hex');
  process.env.JWT_SECRET = jwtSecret;
}

// Middleware
app.use(express.json());

// Strict CORS configuration - allow only the Vite development port
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true
}));

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'self';");
  next();
});

// Import route modules (to be created next)
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

// Hook routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MakerBazar API is operational' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  // Fail safe - do not leak detailed stack traces to users
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// Connect to MongoDB & Start Server
const connectDBAndStart = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/makerbazar';
  try {
    console.log('Attempting standard MongoDB connection...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('Successfully connected to local MongoDB.');
  } catch (err) {
    console.warn('Local MongoDB connection failed. Launching ephemeral in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      console.log(`In-memory MongoDB successfully booted at: ${memoryUri}`);
      await mongoose.connect(memoryUri);
      console.log('Successfully connected to ephemeral in-memory MongoDB database.');
      global.__MONGO_MEMORY_SERVER__ = mongoServer;
    } catch (memErr) {
      console.error('CRITICAL: Failed to launch memory server:', memErr.message);
      process.exit(1);
    }
  }

  // Auto-seed product catalog if empty
  try {
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Product catalog is empty. Auto-seeding default MakerBazar products...');
      const { sampleProducts } = require('./data/seedProducts');
      await Product.insertMany(sampleProducts);
      console.log(`Successfully auto-seeded database with ${sampleProducts.length} default products.`);
    } else {
      console.log(`Database already has ${productCount} active products. Skipping auto-seed.`);
    }
  } catch (seedErr) {
    console.error('Error during automatic database seeding on startup:', seedErr.message);
  }

  // Start listening strictly on localhost/127.0.0.1 per security rules
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server is running and listening on http://127.0.0.1:${PORT}`);
  });
};

connectDBAndStart();

