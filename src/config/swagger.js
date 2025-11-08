const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DataTrust Nigeria API',
      version: '1.0.0',
      description: `
# DataTrust Nigeria - NDPR Compliance Platform

## About
DataTrust Nigeria is a comprehensive data privacy and consent management platform built for NDPR (Nigeria Data Protection Regulation) compliance.

## Key Features
- 🔐 **Consent Management** - Grant, revoke, and track data consents
- 📊 **Transparency Dashboard** - Real-time visibility into data usage
- 🤖 **AI Compliance Scanner** - Automated NDPR compliance checking
- 🔔 **Real-time Alerts** - Instant security notifications
- 📈 **Analytics & Reporting** - Comprehensive compliance metrics
- 🌍 **Multi-language Support** - English, Yoruba, Hausa, Igbo

## Authentication
All protected endpoints require a Firebase JWT token in the Authorization header:
\`\`\`
Authorization: Bearer YOUR_FIREBASE_JWT_TOKEN
\`\`\`

## Rate Limiting
API requests are limited to 100 requests per 15 minutes per IP address.
      `,
      contact: {
        name: 'DataTrust Nigeria Team',
        email: 'support@datatrust-nigeria.com',
        url: 'https://datatrust-nigeria.web.app'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://datatrust-backend.onrender.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Firebase JWT token (without "Bearer" prefix)'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message description'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and profile management'
      },
      {
        name: 'Dashboard',
        description: 'Dashboard and analytics endpoints'
      },
      {
        name: 'Consent',
        description: 'Consent management operations'
      },
      {
        name: 'Compliance',
        description: 'NDPR compliance checking and reporting'
      },
      {
        name: 'Organizations',
        description: 'Organization management'
      },
      {
        name: 'Access Logs',
        description: 'Data access logging and auditing'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
