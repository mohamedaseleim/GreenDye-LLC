const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

/**
 * Generate a PDF invoice for a completed payment.
 * Saves the file into `backend/invoices` (creating the folder if needed).
 *
 * @param {Object} payment Payment document (with invoice number & completedAt)
 * @param {Object} user Populated user (with `name` and `email`)
 * @param {Object} course Populated course (with `title`)
 * @returns {Promise<{fileName: string, filePath: string}>}  the created file name and path
 */
async function generateInvoicePDF(payment, user, course) {
  return new Promise((resolve, reject) => {
    try {
      // ensure invoices folder exists
      const invoicesDir = path.join(__dirname, '..', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const invoiceNumber = payment.invoice && payment.invoice.invoiceNumber
        ? payment.invoice.invoiceNumber
        : payment._id.toString();
      const fileName = `${invoiceNumber}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(24).text('Invoice', { align: 'center' });
      doc.moveDown();

      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice Number: ${invoiceNumber}`);
      doc.text(`Date: ${payment.completedAt ? new Date(payment.completedAt).toDateString() : new Date().toDateString()}`);
      doc.moveDown();

      // User details
      doc.text(`Billed To: ${user.name} <${user.email}>`);
      doc.moveDown();

      // Course details
      doc.text(`Course: ${course.title}`);
      doc.moveDown();

      // Payment details
      doc.text(`Transaction ID: ${payment.transactionId}`);
      doc.text(`Amount Paid: ${payment.amount} ${payment.currency}`);
      doc.text(`Status: ${payment.status}`);
      doc.end();

      writeStream.on('finish', () => resolve({ fileName, filePath }));
      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Send the PDF invoice via email to the user.
 * SMTP credentials are read from environment variables.
 *
 * @param {Object} user Populated user (with `name` and `email`)
 * @param {Object} payment Payment document
 * @param {Object} course Populated course (with `title`)
 * @param {string} attachmentPath Absolute path to the generated invoice
 */
async function sendInvoiceEmail(user, payment, course, attachmentPath) {
  if (!user || !user.email) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const invoiceNum = payment.invoice && payment.invoice.invoiceNumber
    ? payment.invoice.invoiceNumber
    : payment._id;
  const subject = `Your Invoice ${invoiceNum}`;
  const textBody = `Dear ${user.name},

Thank you for your payment for the course "${course.title}".
Attached is your invoice for reference.

Best regards,
GreenDye Academy`;

  const mailOptions = {
    from: `"GreenDye Academy" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject,
    text: textBody,
    attachments: [{
      filename: path.basename(attachmentPath),
      path: attachmentPath,
    }],
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { generateInvoicePDF, sendInvoiceEmail };
