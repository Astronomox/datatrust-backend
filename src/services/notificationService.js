const nodemailer = require('nodemailer');
const { logger } = require('../middleware/logger');

class NotificationService {
  constructor() {
    // Only create transporter if email is configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      try {
        this.transporter = nodemailer.createTransporter({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || 587),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
      } catch (error) {
        logger.warn('Email transporter creation failed:', error.message);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      logger.info('Email not configured - notifications will be logged only');
    }
  }

  // Send email
  async sendEmail(to, subject, html) {
    try {
      if (!this.transporter) {
        logger.warn('Email not configured, skipping email send');
        console.log(`📧 EMAIL WOULD BE SENT TO: ${to}`);
        console.log(`📧 SUBJECT: ${subject}`);
        return null;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@dataprivacy.ng',
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`, { messageId: info.messageId });
      return info;
    } catch (error) {
      logger.error('Error sending email:', error.message);
      return null;
    }
  }

  // Notify user of data access
  async notifyDataAccess(user, organization, accessLog) {
    const subject = 'Data Access Notification';
    const html = `
      <h2>Your Data Was Accessed</h2>
      <p>Dear ${user.firstName},</p>
      <p><strong>${organization.name}</strong> accessed your <strong>${accessLog.dataType}</strong> data.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Time: ${new Date(accessLog.accessedAt).toLocaleString()}</li>
        <li>Purpose: ${accessLog.purpose}</li>
        <li>Action: ${accessLog.action}</li>
        <li>Authorized: ${accessLog.wasAuthorized ? 'Yes' : 'No'}</li>
      </ul>
      ${!accessLog.wasAuthorized ? '<p style="color: red;"><strong>Warning:</strong> This access was not authorized by any active consent.</p>' : ''}
      <p>View full details in your dashboard.</p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Notify organization of consent granted
  async notifyConsentGranted(consent, user, organization) {
    const subject = 'New Consent Granted';
    const html = `
      <h2>Consent Granted</h2>
      <p>Dear ${organization.name},</p>
      <p><strong>${user.firstName} ${user.lastName}</strong> has granted you consent to process their data.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Data Types: ${consent.dataTypes.join(', ')}</li>
        <li>Purpose: ${consent.purpose}</li>
        <li>Valid Until: ${consent.expiresAt ? new Date(consent.expiresAt).toLocaleDateString() : 'Indefinite'}</li>
      </ul>
      <p>You may now access the authorized data for the stated purpose.</p>
    `;

    return await this.sendEmail(organization.email, subject, html);
  }

  // Notify organization of consent revoked
  async notifyConsentRevoked(consent, user, organization) {
    const subject = 'Consent Revoked';
    const html = `
      <h2>Consent Revoked</h2>
      <p>Dear ${organization.name},</p>
      <p><strong>${user.firstName} ${user.lastName}</strong> has revoked their consent for data processing.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Data Types: ${consent.dataTypes.join(', ')}</li>
        <li>Revoked At: ${new Date(consent.revokedAt).toLocaleString()}</li>
        ${consent.revokeReason ? `<li>Reason: ${consent.revokeReason}</li>` : ''}
      </ul>
      <p style="color: red;"><strong>Important:</strong> You must immediately stop processing this user's data for the specified purposes.</p>
    `;

    return await this.sendEmail(organization.email, subject, html);
  }

  // Notify organization of compliance violation
  async notifyViolation(organization, violation, rule) {
    const subject = 'NDPR Compliance Violation Detected';
    const html = `
      <h2>Compliance Violation Detected</h2>
      <p>Dear ${organization.name},</p>
      <p>A compliance violation has been detected in your data processing activities.</p>
      <p><strong>Violation Details:</strong></p>
      <ul>
        <li>Rule: ${rule.ruleName}</li>
        <li>Severity: ${violation.severity.toUpperCase()}</li>
        <li>Description: ${violation.description}</li>
        <li>Detected At: ${new Date(violation.detectedAt).toLocaleString()}</li>
      </ul>
      <p><strong>NDPR Reference:</strong> ${rule.ndprReference || 'N/A'}</p>
      <p>Please review this violation and take corrective action immediately.</p>
      <p>Your compliance score has been updated to reflect this violation.</p>
    `;

    return await this.sendEmail(organization.email, subject, html);
  }

  // Notify user of consent expiring soon
  async notifyConsentExpiring(user, organization, consent, daysRemaining) {
    const subject = 'Consent Expiring Soon';
    const html = `
      <h2>Your Consent is Expiring Soon</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your consent for <strong>${organization.name}</strong> to access your data will expire in <strong>${daysRemaining} days</strong>.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Data Types: ${consent.dataTypes.join(', ')}</li>
        <li>Purpose: ${consent.purpose}</li>
        <li>Expires: ${new Date(consent.expiresAt).toLocaleDateString()}</li>
      </ul>
      <p>If you wish to continue allowing access, please renew your consent in your dashboard.</p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new NotificationService();