const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'data-privacy-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' to error.log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log') 
    })
  ]
});

// Request logging middleware
const requestLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user.id : 'anonymous'
  });
  next();
};

module.exports = {
  logger,
  requestLogger
};