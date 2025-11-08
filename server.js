require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const app = express();

// Security - Modified for Swagger UI
app.use(helmet({
  contentSecurityPolicy: false,  // Disable for Swagger UI to work
  crossOriginEmbedderPolicy: false
}));

// CORS - Allow Swagger UI
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5000',
    'https://datatrust-nigeria.web.app',
    'https://datatrust-backend.onrender.com',
    // Add any other frontend URLs
    '*' // Temporary for testing - REMOVE IN PRODUCTION
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

// Body parser
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DataTrust Nigeria API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,  // Keep auth between page refreshes
  }
}));

// ✅ IMPORT ALL ROUTES
const authRoutes = require('./src/routes/authRoutes');
const consentRoutes = require('./src/routes/consentRoutes');
const accessLogRoutes = require('./src/routes/accessLogRoutes');
const complianceRoutes = require('./src/routes/complianceRoutes');
const organizationRoutes = require('./src/routes/organizationRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

// ✅ USE API ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/consent', consentRoutes);
app.use('/api/v1/access-logs', accessLogRoutes);
app.use('/api/v1/compliance', complianceRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// Root - Show all available endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DataTrust Nigeria API - NDPR Compliance Platform',
    version: 'v1',
    timestamp: new Date().toISOString(),
    documentation: `http://localhost:${process.env.PORT || 5000}/api-docs`,
    endpoints: {
      auth: {
        'POST /api/v1/auth/register': 'Register new user',
        'POST /api/v1/auth/login': 'User login',
        'GET /api/v1/auth/me': 'Get user profile',
        'PUT /api/v1/auth/profile': 'Update profile'
      },
      consent: {
        'POST /api/v1/consent/grant': 'Grant data consent',
        'GET /api/v1/consent/my-consents': 'Get user consents',
        'PUT /api/v1/consent/:id/revoke': 'Revoke consent',
        'GET /api/v1/consent/:id': 'Get specific consent'
      },
      dashboard: {
        'GET /api/v1/dashboard/citizen': 'Citizen dashboard',
        'POST /api/v1/dashboard/compliance-scan': 'AI compliance scan',
        'GET /api/v1/dashboard/real-time-alerts': 'Security alerts'
      },
      access: {
        'POST /api/v1/access-logs/log': 'Log data access',
        'GET /api/v1/access-logs/my-data': 'User access logs',
        'GET /api/v1/access-logs/organization/:id': 'Org access logs'
      },
      compliance: {
        'POST /api/v1/compliance/check': 'Check compliance',
        'GET /api/v1/compliance/user-score': 'User compliance score',
        'GET /api/v1/compliance/organization/:id': 'Org compliance',
        'POST /api/v1/compliance/report-violation': 'Report violation'
      },
      organizations: {
        'GET /api/v1/organizations': 'List organizations',
        'GET /api/v1/organizations/:id': 'Get organization',
        'GET /api/v1/organizations/user/my-organizations': 'User organizations',
        'POST /api/v1/organizations': 'Create organization (admin)'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 DataTrust API Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// API Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ DataTrust API v1 is operational',
    timestamp: new Date().toISOString(),
    service: 'DataTrust Nigeria',
    compliance: 'NDPR Ready',
    features: [
      'Consent Management',
      'Transparency Dashboard',
      'AI Compliance Scanner',
      'Real-time Auditing',
      'Multi-language Support'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: '🔍 Route not found',
    path: req.originalUrl,
    documentation: '/api-docs',
    available_endpoints: {
      root: 'GET /',
      health: 'GET /health',
      api_health: 'GET /api/v1/health',
      swagger_docs: 'GET /api-docs',
      auth: 'GET /api/v1/auth/*',
      consent: 'GET /api/v1/consent/*',
      dashboard: 'GET /api/v1/dashboard/*',
      access_logs: 'GET /api/v1/access-logs/*',
      compliance: 'GET /api/v1/compliance/*',
      organizations: 'GET /api/v1/organizations/*'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Server Error:', err);
  
  // Firebase auth errors
  if (err.code?.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: err.message
    });
  }
  
  // Firestore errors
  if (err.code?.startsWith('firestore/')) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: 'Internal server error'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      error: err.message,
      stack: err.stack 
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🌈 ' + '🌈'.repeat(27));
  console.log('🌈 ' + '🚀 DataTrust Nigeria API Server Started' + ' '.repeat(13) + '🌈');
  console.log('🌈 ' + '📡 Port:', PORT + ' '.repeat(39) + '🌈');
  console.log('🌈 ' + '🌍 Environment:', process.env.NODE_ENV || 'development', ' '.repeat(24) + '🌈');
  console.log('🌈 ' + '🏥 Health Check:', `http://localhost:${PORT}/health` + ' '.repeat(7) + '🌈');
  console.log('🌈 ' + '🔗 API Base:', `http://localhost:${PORT}/api/v1` + ' '.repeat(11) + '🌈');
  console.log('🌈 ' + '📚 Swagger UI:', `http://localhost:${PORT}/api-docs` + ' '.repeat(7) + '🌈');
  console.log('🌈 ' + '📋 API Endpoints:', `http://localhost:${PORT}/` + ' '.repeat(12) + '🌈');
  console.log('🌈 ' + '🔒 NDPR Compliance: ✅ ACTIVE' + ' '.repeat(23) + '🌈');
  console.log('🌈 ' + '🤖 AI Features: ✅ ENABLED' + ' '.repeat(26) + '🌈');
  console.log('🌈 ' + '🌈'.repeat(27));
  
  // Log available endpoints
  console.log('\n📋 Available Endpoints:');
  console.log('   🔐 AUTH');
  console.log('     POST /api/v1/auth/register    - Register user');
  console.log('     POST /api/v1/auth/login       - User login');
  console.log('     GET  /api/v1/auth/me          - Get profile');
  
  console.log('   📝 CONSENT');
  console.log('     POST /api/v1/consent/grant    - Grant consent');
  console.log('     GET  /api/v1/consent/my-consents - User consents');
  
  console.log('   📊 DASHBOARD');
  console.log('     GET  /api/v1/dashboard/citizen - Citizen dashboard');
  console.log('     POST /api/v1/dashboard/compliance-scan - AI scan');
  
  console.log('   🔍 COMPLIANCE');
  console.log('     GET  /api/v1/compliance/user-score - Compliance score');
  console.log('     POST /api/v1/compliance/report-violation - Report issue');
  
  console.log('   🏢 ORGANIZATIONS');
  console.log('     GET  /api/v1/organizations    - List organizations');
  console.log('     GET  /api/v1/organizations/user/my-organizations - User orgs');
  
  console.log('\n🎯 Hackathon Features:');
  console.log('   ✅ Consent Management');
  console.log('   ✅ Transparency Dashboard');
  console.log('   ✅ AI Compliance Scanner');
  console.log('   ✅ Real-time Security Alerts');
  console.log('   ✅ NDPR Compliance');
  console.log('   ✅ Multi-language Support');
  console.log('   ✅ Scalable Architecture');
  console.log('   ✅ Interactive API Documentation (Swagger UI)');
});

module.exports = app;
