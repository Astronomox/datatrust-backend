const nodemailer = require('nodemailer');
const { logger } = require('../middleware/logger');
const smsService = require('./smsService');

class NotificationService {
  constructor() {
    // Only create transporter if email is configured
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT || 587),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
          }
        });
        logger.info('Email service configured successfully');
      } catch (error) {
        logger.warn('Email transporter creation failed:', error.message);
        this.transporter = null;
      }
    } else {
      this.transporter = null;
      logger.info('Email not configured - notifications will be logged only');
    }
  }
  async sendEmail(to, subject, html) {
    try {
      if (!this.transporter) {
        logger.warn('Email not configured, skipping email send');
        console.log(`📧 EMAIL WOULD BE SENT TO: ${to}`);
        console.log(`📧 SUBJECT: ${subject}`);
        return null;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'DataTrust Nigeria <noreply@dataprivacy.ng>',
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

  // Send login notification (EMAIL + SMS)
  async notifyLogin(user, ipAddress, userAgent, location = 'Unknown') {
    const subject = 'New Login to Your DataTrust Account';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563EB, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: 600; color: #6b7280; }
          .button { background: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Security Alert</h1>
          </div>
          <div class="content">
            <h2>New Login Detected</h2>
            <p>Hello ${user.firstName},</p>
            <p>We detected a new login to your DataTrust Nigeria account. If this was you, you can safely ignore this email.</p>
            
            <div class="alert-box">
              <strong>⚠️ If this wasn't you:</strong> Your account may be compromised. Please secure your account immediately by changing your password.
            </div>

            <div class="details">
              <h3>Login Details:</h3>
              <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span>${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">IP Address:</span>
                <span>${ipAddress}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Device:</span>
                <span>${this.getDeviceFromUserAgent(userAgent)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Browser:</span>
                <span>${this.getBrowserFromUserAgent(userAgent)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <span>${location}</span>
              </div>
            </div>

            <a href="${process.env.FRONTEND_URL}/security" class="button">Secure My Account</a>

            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              If you did not log in, please change your password immediately and contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>DataTrust Nigeria - Advanced Data Protection Platform</p>
            <p>This is an automated security notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await this.sendEmail(user.email, subject, html);

    // Send SMS
    const smsResult = await smsService.sendLoginNotification(user, ipAddress, userAgent);

    return { email: emailResult, sms: smsResult };
  }

  // Send registration welcome (EMAIL + SMS)
  async notifyRegistration(user) {
    const subject = 'Welcome to DataTrust Nigeria! 🎉';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563EB, #8B5CF6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .feature-box { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #2563EB; }
          .button { background: #2563EB; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to DataTrust Nigeria!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName}!</h2>
            <p>Thank you for joining DataTrust Nigeria - your trusted partner in data privacy and protection.</p>
            
            <div class="feature-box">
              <h3>🛡️ What You Can Do:</h3>
              <ul>
                <li><strong>Manage Consents:</strong> Control who can access your data</li>
                <li><strong>Track Access:</strong> See who accessed your data and when</li>
                <li><strong>Get Alerts:</strong> Receive instant breach notifications</li>
                <li><strong>Stay Compliant:</strong> Ensure NDPR compliance automatically</li>
              </ul>
            </div>

            <div class="feature-box">
              <h3>🚀 Get Started:</h3>
              <ol>
                <li>Complete your profile</li>
                <li>Set up your first consent</li>
                <li>Enable two-factor authentication</li>
                <li>Review your privacy settings</li>
              </ol>
            </div>

            <a href="${process.env.FRONTEND_URL}" class="button">Go to Dashboard</a>

            <p style="margin-top: 30px;">
              Need help? Our support team is here for you at <a href="mailto:support@dataprivacy.ng">support@dataprivacy.ng</a>
            </p>
          </div>
          <div class="footer">
            <p>DataTrust Nigeria - Building Trust in Nigeria's Digital Economy</p>
            <p>© 2025 DataTrust Nigeria. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await this.sendEmail(user.email, subject, html);

    // Send SMS
    const smsResult = await smsService.sendWelcomeSMS(user);

    return { email: emailResult, sms: smsResult };
  }

  // Send consent granted notification
  async notifyConsentGranted(consent, user, organization) {
    const subject = 'Consent Granted - DataTrust Confirmation';
    const html = `
      <h2>Consent Granted Successfully</h2>
      <p>Dear ${user.firstName},</p>
      <p>You have granted <strong>${organization.name}</strong> consent to access your data.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Data Types: ${consent.dataTypes.join(', ')}</li>
        <li>Purpose: ${consent.purpose}</li>
        <li>Valid Until: ${consent.expiresAt ? new Date(consent.expiresAt).toLocaleDateString() : 'Indefinite'}</li>
      </ul>
      <p>You can revoke this consent anytime from your dashboard.</p>
    `;

    // Send email
    const emailResult = await this.sendEmail(user.email, subject, html);

    // Send SMS
    const smsResult = await smsService.sendConsentGrantedSMS(user, organization.name);

    return { email: emailResult, sms: smsResult };
  }

  // Send data access notification
  async notifyDataAccess(user, organization, accessLog) {
    const subject = 'Data Access Notification - DataTrust';
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

  // Send breach alert (EMAIL + SMS)
  async notifyBreachAttempt(user, organizationName, dataType) {
    const subject = '🚨 URGENT: Unauthorized Access Blocked';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #EF4444, #DC2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .button { background: #EF4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Security Breach Blocked</h1>
          </div>
          <div class="content">
            <h2>Immediate Action Required</h2>
            <p>Dear ${user.firstName},</p>
            
            <div class="alert-box">
              <strong>⚠️ Unauthorized Access Blocked:</strong><br>
              <strong>${organizationName}</strong> attempted to access your <strong>${dataType}</strong> data without proper consent.
            </div>

            <p><strong>What We Did:</strong></p>
            <ul>
              <li>✅ Blocked the unauthorized access</li>
              <li>✅ Logged the incident for review</li>
              <li>✅ Notified you immediately</li>
            </ul>

            <p><strong>What You Should Do:</strong></p>
            <ol>
              <li>Review your consent settings</li>
              <li>Report this incident to NDPC</li>
              <li>Monitor your account for suspicious activity</li>
            </ol>

            <a href="${process.env.FRONTEND_URL}/activity" class="button">View Details</a>

            <p style="margin-top: 30px; color: #6b7280;">
              This is an automated security alert. Your data is protected.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const emailResult = await this.sendEmail(user.email, subject, html);

    // Send SMS
    const smsResult = await smsService.sendBreachAlertSMS(user, organizationName);

    return { email: emailResult, sms: smsResult };
  }

  // Helper: Get device from user agent
  getDeviceFromUserAgent(userAgent) {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Mobile')) return 'Mobile Device';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop Computer';
  }

  // Helper: Get browser from user agent
  getBrowserFromUserAgent(userAgent) {
    if (!userAgent) return 'Unknown Browser';
    if (userAgent.includes('Chrome')) return 'Google Chrome';
    if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Microsoft Edge';
    return 'Unknown Browser';
  }

  // Send OTP email
  async sendOTPEmail(user, otp) {
    const subject = 'Your DataTrust Verification Code';
    const html = `
      <h2>Verification Code</h2>
      <p>Dear ${user.firstName},</p>
      <p>Your verification code is:</p>
      <h1 style="font-size: 32px; color: #2563EB; letter-spacing: 5px;">${otp}</h1>
      <p>This code is valid for 10 minutes.</p>
      <p><strong>Important:</strong> Do not share this code with anyone.</p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Send all notifications for consent revocation
  async notifyConsentRevoked(consent, user, organization) {
    const subject = 'Consent Revoked - DataTrust Confirmation';
    const html = `
      <h2>Consent Revoked Successfully</h2>
      <p>Dear ${user.firstName},</p>
      <p>You have successfully revoked <strong>${organization.name}</strong>'s access to your data.</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Data Types: ${consent.dataTypes.join(', ')}</li>
        <li>Revoked At: ${new Date(consent.revokedAt).toLocaleString()}</li>
        ${consent.revokeReason ? `<li>Reason: ${consent.revokeReason}</li>` : ''}
      </ul>
      <p>The organization will no longer be able to access your data.</p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Send violation notification to organization
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

  // Send consent expiring notification
  async notifyConsentExpiring(user, organization, consent, daysRemaining) {
    const subject = 'Consent Expiring Soon - DataTrust';
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