const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Check if email configuration exists
      if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('📧 Email configuration incomplete - using console fallback');
        this.transporter = null;
        return;
      }

      console.log('📧 Initializing email transporter...');

      // Create transporter with proper configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Verify transporter configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('📧 Email transporter verification failed:', error.message);
          this.transporter = null;
        } else {
          console.log('📧 Email transporter initialized successfully');
        }
      });

    } catch (error) {
      console.error('📧 Email transporter initialization failed:', error.message);
      this.transporter = null;
    }
  }

  async sendEmail(to, subject, html) {
    try {
      if (this.transporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || 'DataTrust Nigeria <noreply@dataprivacy.ng>',
          to,
          subject,
          html,
        };

        console.log('📧 Attempting to send email to:', to);
        const result = await this.transporter.sendMail(mailOptions);
        console.log('📧 Email sent successfully:', result.messageId);
        return true;
      } else {
        // Fallback to console log
        console.log('📧 EMAIL WOULD BE SENT:');
        console.log('📧 TO:', to);
        console.log('📧 SUBJECT:', subject);
        console.log('📧 CONTENT:', html.substring(0, 200) + '...');
        return false;
      }
    } catch (error) {
      console.error('📧 Email sending failed:', error.message);
      console.log('📧 EMAIL FAILED - LOGGING TO CONSOLE:');
      console.log('📧 TO:', to);
      console.log('📧 SUBJECT:', subject);
      console.log('📧 CONTENT:', html.substring(0, 200) + '...');
      return false;
    }
  }
}

module.exports = new EmailService();