const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_USER !== 'your_smtp_user';

  if (!hasSmtpConfig) {
    console.log('====================================================');
    console.log(`[EMAIL LOG - DEV MODE]`);
    console.log(`To (Secondary Email): ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log('====================================================');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `${process.env.SMTP_FROM_NAME || 'Company Workspace'} <${process.env.SMTP_FROM || 'no-reply@companyworkspace.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
