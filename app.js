const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const medicineRoutes = require('./routes/medicine');
const expiryNotifier = require('./jobs/expiryNotifier');
const dotenv = require('dotenv');

// 🌱 Load environment variables
dotenv.config({path: './config.env'});

const app = express();

// 🛡️ Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://product-expiry-check.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

// 📦 Middleware
app.use(bodyParser.json());

// 🩺 API Routes
app.use('/api/v1/medicine', medicineRoutes);

// ⏰ Cron Job (Always enabled)
expiryNotifier.start();

module.exports = app;
