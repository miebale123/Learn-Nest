import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // we use custom  providers like sendGrid in production
      auth: {
        user: 'miebalen@gmail.com',
        pass: process.env.EMAIL_PASS
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `http://localhost:4200/auth/reset-password/${resetToken}`;

    await this.transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      text: `Hello,\n\nYou requested to reset your password. 
Click the link below to reset it:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    });
  }
}
