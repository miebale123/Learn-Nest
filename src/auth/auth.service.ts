import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { UserRepository } from './auth.repo';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignupDto,
  UpdatePasswordDto,
} from './dto';
import { AuthInternal } from './interfaces/AuthInternal.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) { }

  async signUp(dto: SignupDto): Promise<AuthInternal> {
    return this.userRepo.signUp(dto);
  }

  async signIn(dto: SignInDto): Promise<AuthInternal> {
    const { email, password } = dto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Incorrect password');

    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await this.userRepository.update(user.id, { refreshToken: hashedRefreshToken });

    return {
      accessToken,
      refreshToken,
      message: 'Signed in successfully',
    };
  }

  async refresh(oldRefreshToken: string, user: User): Promise<AuthInternal> {
    const found = await this.userRepository.findOneBy({ id: user.id });

    if (!found || !found.refreshToken)
      throw new BadRequestException('No refresh token found');

    const isMatch = await bcrypt.compare(oldRefreshToken, found.refreshToken);
    if (!isMatch) throw new BadRequestException('Invalid refresh token');

    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = crypto.randomUUID();
    const hashed = await bcrypt.hash(newRefreshToken, 12);

    await this.userRepository.update(user.id, { refreshToken: hashed });

    return {
      accessToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully',
    };
  }

  async updatePassword(user: User, dto: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword } = dto;
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    user.password = await bcrypt.hash(newPassword, 12);
    await this.userRepository.save(user);
  }

  async logout(user: User): Promise<void> {
    await this.userRepository.update(user.id, { refreshToken: null });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = dto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const resetToken = crypto.randomUUID();
    user.resetToken = await bcrypt.hash(resetToken, 12);
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.userRepository.save(user);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Password Reset Request',
      text: `Hello,\n\nYou requested to reset your password. Click the link below to reset it:\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    });

    return { message: 'Password reset link sent to your email.' };
  }

  async resetPassword(
    dto: ResetPasswordDto,
    resetToken: string,
  ): Promise<{ message: string }> {
    const { email, newPassword } = dto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (
      !user ||
      !user.resetToken ||
      (user.resetTokenExpiry && user.resetTokenExpiry < new Date())
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    const isMatch = await bcrypt.compare(resetToken, user.resetToken);
    if (!isMatch) throw new BadRequestException('Invalid or expired token');

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await this.userRepository.save(user);

    return { message: 'Password reset successful!' };
  }
}
