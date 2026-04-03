const nodemailer = require('nodemailer');

class EmailService {
  static getTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  static async sendEmail({ to, subject, html }) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📧 [EMAIL SKIPPED - no credentials] To: ${to} | Subject: ${subject}`);
      return;
    }
    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"ShareHub 2.0" <${process.env.EMAIL_USER}>`,
        to, subject, html,
      });
      console.log(`📧 Email sent to ${to}`);
    } catch (err) {
      console.error('📧 Email send failed:', err.message);
    }
  }

  static async sendWelcome(user) {
    await this.sendEmail({
      to: user.email,
      subject: 'Welcome to ShareHub 2.0!',
      html: `<h2>Welcome, ${user.full_name}!</h2><p>Your account has been created successfully on ShareHub 2.0.</p><p>Start browsing products, donating to NGOs, and connecting with your community.</p><br><p>The ShareHub Team</p>`,
    });
  }

  static async sendOrderConfirmation(user, order) {
    await this.sendEmail({
      to: user.email,
      subject: `Order Confirmed — #${order.order_number}`,
      html: `<h2>Order Confirmed!</h2><p>Hi ${user.full_name},</p><p>Your order <strong>#${order.order_number}</strong> has been placed successfully.</p><p>Total: <strong>PKR ${parseFloat(order.total_amount).toLocaleString()}</strong></p><p>We'll notify you when it ships.</p><br><p>The ShareHub Team</p>`,
    });
  }

  static async sendPasswordReset(user, resetUrl) {
    await this.sendEmail({
      to: user.email,
      subject: 'Reset Your ShareHub Password',
      html: `<h2>Password Reset Request</h2><p>Hi ${user.full_name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}" style="background:#f97316;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Reset Password</a></p><p>If you did not request this, ignore this email.</p><br><p>The ShareHub Team</p>`,
    });
  }

  static async sendDonationReceived(ngoEmail, ngoName, donorName, productTitle) {
    await this.sendEmail({
      to: ngoEmail,
      subject: 'New Donation Request',
      html: `<h2>New Donation!</h2><p>Hi ${ngoName},</p><p><strong>${donorName}</strong> has sent a donation request for: <strong>${productTitle}</strong>.</p><p>Log in to your ShareHub portal to accept or reject the donation.</p><br><p>The ShareHub Team</p>`,
    });
  }
}

module.exports = EmailService;
