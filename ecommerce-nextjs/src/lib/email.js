import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT?.trim() || 587);
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const fromEmail = process.env.FROM_EMAIL?.trim() || emailUser;
const fromName = process.env.FROM_NAME?.trim() || 'EcoCommerce';

console.log('Email config:', {
  smtpHost,
  smtpPort,
  emailUser: emailUser ? 'SET' : 'NOT SET',
  emailPass: emailPass ? 'SET' : 'NOT SET',
  fromEmail,
  fromName,
});

if (!emailUser || !emailPass || !fromEmail) {
  console.error('Missing SMTP settings:', {
    EMAIL_USER: !!emailUser,
    EMAIL_PASS: !!emailPass,
    FROM_EMAIL: !!fromEmail,
  });
  throw new Error('SMTP settings are required: EMAIL_USER, EMAIL_PASS, and FROM_EMAIL.');
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify().then(
  () => {
    console.log('SMTP transporter verified successfully.');
  },
  (error) => {
    console.warn('SMTP transporter verification failed:', error.message);
  }
);

const getFromAddress = () => {
  return process.env.FROM_EMAIL
    ? `"${fromName}" <${fromEmail}>`
    : emailUser;
};

export const sendEmail = async (to, subject, html) => {
  console.log('Attempting to send email to:', to, 'subject:', subject);
  try {
    const mailOptions = {
      from: getFromAddress(),
      to,
      subject,
      html,
    };

    console.log('Mail options:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendVerificationEmail = async (email, token) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const verificationUrl = `${appUrl}/auth/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to EcoCommerce!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    </div>
  `;

  return await sendEmail(email, 'Verify Your Email - EcoCommerce', html);
};

export const sendPasswordResetEmail = async (email, token) => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your EcoCommerce account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return await sendEmail(email, 'Reset Your Password - EcoCommerce', html);
};

export const sendOTPEmail = async (email, otp, { purpose = 'verification' } = {}) => {
  const isResetOtp = purpose === 'reset-password';
  const heading = isResetOtp ? 'Password Reset OTP' : 'Email Verification OTP';
  const intro = isResetOtp
    ? 'Use this OTP to reset your EcoCommerce password:'
    : 'Use this OTP to verify your EcoCommerce account:';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>${heading}</h2>
      <p>${intro}</p>
      <div style="font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0;">
        ${otp}
      </div>
      <p>This OTP will expire in 5 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return await sendEmail(
    email,
    isResetOtp ? 'Password Reset OTP - EcoCommerce' : 'Email Verification OTP - EcoCommerce',
    html
  );
};
