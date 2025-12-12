import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  return transporter;   
};

const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log('\n=== EMAIL NOTIFICATION (Development Mode) ===');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${text || html}`);
      console.log('==============================================\n');
      return { success: true, message: 'Email logged (development mode)' };
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendWishlistFulfillmentEmail = async (userEmail, userName, bookTitle, bookAuthor) => {
  const subject = `Your Wishlist Book is Now Available`;
  
  const text = `
Hello ${userName},

Your wishlist book is now available:

Book: ${bookTitle}
Author: ${bookAuthor}

You can now borrow this book from the library.

Thank you,
Library Management System
  `.trim();

  // Simple HTML format
  const html = `
<p>Hello ${userName},</p>

<p>Your wishlist book is now available:</p>

<p><strong>Book:</strong> ${bookTitle}<br>
<strong>Author:</strong> ${bookAuthor}</p>

<p>You can now borrow this book from the library.</p>

<p>Thank you,<br>
Library Management System</p>
  `.trim();

  return await sendEmail(userEmail, subject, html, text);
};

export {
  sendEmail,
  sendWishlistFulfillmentEmail,
};

