import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD || !process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_PORT) {
      throw new Error('Email server environment variables are not set');
    }
    console.log(process.env.EMAIL_SERVER_USER)

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: `"NextStay" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify-email?token=${verificationToken}`;
    const html = `<p>Please verify your email by clicking <a href="${verificationUrl}">here</a></p>`;
    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - NextStay',
      html,
      text: `Please verify your email: ${verificationUrl}`,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;
    const html = `<p>Reset your password by clicking <a href="${resetUrl}">here</a></p>`;
    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - NextStay',
      html,
      text: `Reset your password: ${resetUrl}`,
    });
  }
}

export const emailService = new EmailService();
