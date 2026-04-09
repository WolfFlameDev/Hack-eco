import nodemailer from 'nodemailer';

const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT?.trim() || 587);
const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const fromEmail = process.env.FROM_EMAIL?.trim() || emailUser;
const fromName = process.env.FROM_NAME?.trim() || 'EcoCommerce';
const EMAIL_MAX_RETRIES = Number(process.env.EMAIL_MAX_RETRIES ?? 3);
const EMAIL_RETRY_DELAY_MS = Number(process.env.EMAIL_RETRY_DELAY_MS ?? 1000);

const isEmailConfigured = !!(emailUser && emailPass && fromEmail);

if (!isEmailConfigured) {
  console.warn('Email disabled: SMTP settings (EMAIL_USER, EMAIL_PASS, FROM_EMAIL) are not configured.');
}

let transporter = null;
if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
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
}

const getFromAddress = () => {
  return process.env.FROM_EMAIL
    ? `"${fromName}" <${fromEmail}>`
    : emailUser;
};

export const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    console.warn('Email skipped (SMTP not configured):', subject);
    return null;
  }
  const mailOptions = {
    from: getFromAddress(),
    to,
    subject,
    html,
  };

  for (let attempt = 1; attempt <= EMAIL_MAX_RETRIES; attempt += 1) {
    try {
      const result = await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully on attempt ${attempt}:`, result.messageId);
      return result;
    } catch (error) {
      console.error(`Email sending failed (attempt ${attempt}/${EMAIL_MAX_RETRIES}):`, error.message);
      if (attempt >= EMAIL_MAX_RETRIES) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, EMAIL_RETRY_DELAY_MS * attempt));
    }
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

export const sendOrderConfirmationEmail = async (order, user) => {
  const itemRows = (order.items ?? [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${item.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">&#8377;${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafb;padding:24px;border-radius:16px">
      <div style="background:#16a34a;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
        <h1 style="color:#fff;margin:0;font-size:22px">&#10003; Order Confirmed!</h1>
        <p style="color:#dcfce7;margin:8px 0 0">Thank you for shopping with EcoCommerce</p>
      </div>
      <p style="color:#1e293b">Hi <strong>${user.name}</strong>,</p>
      <p style="color:#475569">Your order <strong>#${String(order._id).slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#fff;border-radius:12px;overflow:hidden">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b">ITEM</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b">QTY</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b">TOTAL</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <table style="width:100%;margin-top:8px">
        <tr><td style="color:#64748b">Subtotal</td><td style="text-align:right">&#8377;${order.subtotal?.toFixed(2)}</td></tr>
        <tr><td style="color:#64748b">Shipping</td><td style="text-align:right">${order.shippingFee === 0 ? 'Free' : '&#8377;' + order.shippingFee?.toFixed(2)}</td></tr>
        <tr><td style="font-weight:bold;color:#1e293b;padding-top:8px">Total</td><td style="font-weight:bold;color:#16a34a;text-align:right;padding-top:8px">&#8377;${order.totalAmount?.toFixed(2)}</td></tr>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px">Payment: ${order.paymentDetails?.mode === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
      <p style="color:#94a3b8;font-size:12px">EcoCommerce &mdash; Sustainable shopping, delivered.</p>
    </div>`;

  return await sendEmail(user.email, `Order Confirmed #${String(order._id).slice(-8).toUpperCase()} — EcoCommerce`, html);
};

export const sendOrderStatusEmail = async (order, user, newStatus) => {
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
  };
  const label = statusLabels[newStatus] ?? newStatus;
  const tracking = order.trackingDetails || {};
  const orderCode = String(order._id).slice(-8).toUpperCase();
  const estimatedDelivery = tracking.estimatedDelivery
    ? new Date(tracking.estimatedDelivery).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'To be updated';

  const productRows = (order.items ?? [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9">${item.title}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right">&#8377;${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const trackingLinkHtml = tracking.trackingUrl
    ? `<p style="margin:8px 0 0"><a href="${tracking.trackingUrl}" style="color:#2563eb;text-decoration:none">Track your shipment</a></p>`
    : '';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafb;padding:24px;border-radius:16px">
      <h2 style="color:#1e293b">Order Update — EcoCommerce</h2>
      <p style="color:#475569">Hi <strong>${user.name}</strong>, your order <strong>#${orderCode}</strong> status has been updated.</p>
      <div style="background:#dcfce7;border-left:4px solid #16a34a;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:0;color:#15803d;font-size:18px;font-weight:bold">${label}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;background:#fff;border-radius:12px;overflow:hidden">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b">ITEM</th>
            <th style="padding:10px 12px;text-align:center;font-size:12px;color:#64748b">QTY</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#64748b">TOTAL</th>
          </tr>
        </thead>
        <tbody>${productRows}</tbody>
      </table>
      <div style="background:#fff;border:1px solid #e2e8f0;padding:12px 14px;border-radius:10px;color:#334155">
        <p style="margin:0 0 6px"><strong>Order ID:</strong> ${orderCode}</p>
        <p style="margin:0 0 6px"><strong>Shipping Status:</strong> ${label}</p>
        <p style="margin:0 0 6px"><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
        <p style="margin:0 0 6px"><strong>Tracking Number:</strong> ${tracking.trackingNumber || 'Not available yet'}</p>
        <p style="margin:0"><strong>Carrier:</strong> ${tracking.carrier || 'Not available yet'}</p>
        ${trackingLinkHtml}
      </div>
      <p style="color:#94a3b8;font-size:12px">EcoCommerce &mdash; Thank you for shopping with us.</p>
    </div>`;

  return await sendEmail(user.email, `Order ${label} #${orderCode} — EcoCommerce`, html);
};
