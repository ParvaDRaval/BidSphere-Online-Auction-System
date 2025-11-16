import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP credentials in .env');
    }

    // FIX: assign to this.transporter
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("Email service connected:", process.env.SMTP_USER);
    } catch (err) {
      console.error("Email connection failed:", err.message);
    }
  }

  // Optional: getter to expose transporter
  getTransporter() {
    return this.transporter;
  }
}

const emailService = new EmailService();
const transporter = emailService.getTransporter();

export default transporter;