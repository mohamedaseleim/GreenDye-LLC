const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Create email transporter using SMTP configuration from environment variables
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send a single email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} - Send result
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'GreenDye Academy'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`Error sending email to ${options.to}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send bulk emails to multiple recipients
 * @param {Array} recipients - Array of recipient objects with email and name
 * @param {string} subject - Email subject
 * @param {string} content - HTML content
 * @returns {Promise<Object>} - Results with success and failure counts
 */
const sendBulkEmails = async (recipients, subject, content) => {
  const results = {
    total: recipients.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const recipient of recipients) {
    try {
      const personalizedContent = content
        .replace(/\{name\}/g, recipient.name || 'User')
        .replace(/\{email\}/g, recipient.email);

      const result = await sendEmail({
        to: recipient.email,
        subject: subject,
        html: personalizedContent,
      });

      if (result.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          email: recipient.email,
          error: result.error
        });
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: recipient.email,
        error: error.message
      });
      logger.error(`Error sending bulk email to ${recipient.email}:`, error);
    }

    // Add a small delay to avoid overwhelming the SMTP server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
};

/**
 * Send newsletter to subscribers
 * @param {Array} subscribers - Array of subscriber objects with email and name
 * @param {Object} newsletter - Newsletter object with subject and content
 * @returns {Promise<Object>} - Results with success and failure counts
 */
const sendNewsletter = async (subscribers, newsletter) => {
  return sendBulkEmails(subscribers, newsletter.subject, newsletter.content);
};

/**
 * Create email template with standard layout
 * @param {string} content - Main content
 * @param {Object} options - Template options
 * @returns {string} - HTML email template
 */
const createEmailTemplate = (content, options = {}) => {
  const { title = 'GreenDye Academy', preheader = '' } = options;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background-color: #2e7d32;
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 30px;
        }
        .footer {
          background-color: #f8f8f8;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2e7d32;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          margin: 15px 0;
        }
        .preheader {
          display: none;
          font-size: 1px;
          color: #fefefe;
          line-height: 1px;
          max-height: 0px;
          max-width: 0px;
          opacity: 0;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <span class="preheader">${preheader}</span>
      <div class="container">
        <div class="header">
          <h1>GreenDye Academy</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} GreenDye Academy. All rights reserved.</p>
          <p>You are receiving this email because you are a member of GreenDye Academy.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendNewsletter,
  createEmailTemplate,
};
