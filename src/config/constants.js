module.exports = {
  USER_ROLES: {
    CITIZEN: 'citizen',
    ORGANIZATION: 'organization',
    ADMIN: 'admin'
  },

  CONSENT_STATUS: {
    ACTIVE: 'active',
    REVOKED: 'revoked',
    EXPIRED: 'expired',
    PENDING: 'pending'
  },

  DATA_TYPES: {
    PERSONAL_INFO: 'personal_info',
    FINANCIAL: 'financial',
    HEALTH: 'health',
    BIOMETRIC: 'biometric',
    LOCATION: 'location',
    CONTACT: 'contact',
    EMPLOYMENT: 'employment',
    EDUCATION: 'education'
  },

  ACCESS_ACTIONS: {
    READ: 'read',
    WRITE: 'write',
    UPDATE: 'update',
    DELETE: 'delete',
    SHARE: 'share',
    EXPORT: 'export'
  },

  COMPLIANCE_SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  VIOLATION_STATUS: {
    DETECTED: 'detected',
    INVESTIGATING: 'investigating',
    RESOLVED: 'resolved',
    IGNORED: 'ignored'
  },

  ORGANIZATION_SIZES: {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large',
    ENTERPRISE: 'enterprise'
  },

  SECTORS: {
    BANKING: 'banking',
    FINTECH: 'fintech',
    HEALTHCARE: 'healthcare',
    ECOMMERCE: 'ecommerce',
    TELECOM: 'telecom',
    EDUCATION: 'education',
    GOVERNMENT: 'government',
    OTHER: 'other'
  },

  NDPR_PURPOSES: [
    'account_opening',
    'kyc_verification',
    'transaction_processing',
    'service_delivery',
    'marketing',
    'analytics',
    'legal_obligation',
    'contract_fulfillment'
  ]
};