require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL.split(','),
  credentials: true
}));

// Body parser
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ✅ FIREBASE ROUTES (We'll create these next)
const authRoutes = require('./src/routes/authRoutes');
const consentRoutes = require('./src/routes/consentRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/consent', consentRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DataTrust API - Firebase Edition',
    version: 'v1'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;