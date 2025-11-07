const crypto = require('crypto');

// Generate random API key
exports.generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Calculate days between dates
exports.daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

// Add days to date
exports.addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Check if date is expired
exports.isExpired = (date) => {
  return new Date() > new Date(date);
};

// Format date to Nigerian timezone
exports.formatNigerianDate = (date) => {
  return new Date(date).toLocaleString('en-NG', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate compliance score
exports.calculateComplianceScore = (violations, totalAccesses) => {
  if (totalAccesses === 0) return 100;
  
  const criticalViolations = violations.filter(v => v.severity === 'critical').length;
  const highViolations = violations.filter(v => v.severity === 'high').length;
  const mediumViolations = violations.filter(v => v.severity === 'medium').length;
  const lowViolations = violations.filter(v => v.severity === 'low').length;
  
  const penaltyScore = (
    criticalViolations * 20 +
    highViolations * 10 +
    mediumViolations * 5 +
    lowViolations * 2
  );
  
  const score = Math.max(0, 100 - penaltyScore);
  return parseFloat(score.toFixed(2));
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Generate consent reference
exports.generateConsentRef = () => {
  return `CNS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};