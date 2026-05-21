const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

exports.sendEmail = async ({ to, subject, html }) => {
  if (!transporter) {
    console.log('Email not sent: no email config (EMAIL_HOST missing)');
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Xender Earnings" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email error:', error);
  }
};
