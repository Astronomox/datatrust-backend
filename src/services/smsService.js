const axios = require('axios');
const { logger } = require('../middleware/logger');

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'termii';
    this.termiiApiKey = process.env.TERMII_API_KEY;
    this.termiiSenderId = process.env.TERMII_SENDER_ID || 'N-Alert';
    this.termiiBaseUrl = 'https://api.ng.termii.com/api';
  }

  async sendSMS(phone, message) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      console.log(`📱 Attempting to send SMS to: ${formattedPhone}`);

      if (this.provider === 'termii' && this.termiiApiKey) {
        return await this.sendViaTermii(formattedPhone, message);
      } else {
        return this.sendViaConsole(formattedPhone, message);
      }
    } catch (error) {
      console.error('📱 SMS sending failed:', error.message);
      return this.sendViaConsole(phone, message);
    }
  }

  // Methods required by your notification service
  async sendLoginNotification(user, ipAddress, userAgent) {
    const message = `DataTrust Security: New login from ${ipAddress}. Device: ${this.getDeviceFromUserAgent(userAgent)}. If this wasn't you, secure your account immediately.`;
    return await this.sendSMS(user.phone, message);
  }

  async sendWelcomeSMS(user) {
    const message = `Welcome to DataTrust Nigeria! Your account has been created. Start managing your data privacy today. Login: ${process.env.FRONTEND_URL}`;
    return await this.sendSMS(user.phone, message);
  }

  async sendConsentGrantedSMS(user, organizationName) {
    const message = `DataTrust: Consent granted to ${organizationName}. You can revoke anytime from your dashboard.`;
    return await this.sendSMS(user.phone, message);
  }

  async sendBreachAlertSMS(user, organizationName) {
    const message = `🚨 DataTrust Alert: Unauthorized access attempt by ${organizationName} was blocked. Review your account security.`;
    return await this.sendSMS(user.phone, message);
  }

  async sendViaTermii(phone, message) {
    try {
      const payload = {
        to: phone,
        from: this.termiiSenderId,
        sms: message,
        type: 'plain',
        channel: 'dnd',
        api_key: this.termiiApiKey,
      };

      console.log('📱 Sending via Termii:', { to: phone, message: message.substring(0, 50) + '...' });

      const response = await axios.post(`${this.termiiBaseUrl}/sms/send`, payload, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data && response.data.message === 'Successfully sent') {
        console.log('📱 SMS sent successfully via Termii');
        return { success: true, messageId: response.data.message_id };
      } else {
        console.error('📱 Termii API error:', response.data);
        return { success: false, error: response.data };
      }
    } catch (error) {
      console.error('📱 Termii SMS error:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  sendViaConsole(phone, message) {
    console.log('📱 SMS WOULD BE SENT:');
    console.log('📱 TO:', phone);
    console.log('📱 MESSAGE:', message);
    console.log('---');
    return { success: true, method: 'console' };
  }

  formatPhoneNumber(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('234') && cleanPhone.length === 13) {
      return cleanPhone;
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      return '234' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 10) {
      return '234' + cleanPhone;
    } else {
      return '234' + cleanPhone.substring(cleanPhone.length - 10);
    }
  }

  getDeviceFromUserAgent(userAgent) {
    if (!userAgent) return 'Unknown Device';
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }
}

module.exports = new SMSService();