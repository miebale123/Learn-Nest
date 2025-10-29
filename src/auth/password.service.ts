import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from './dto/auth-credentials.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  async updatePassword(user: User, dto: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword } = dto;

    if (!user.password)
      throw new BadRequestException('No password set for user');
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');
    if (oldPassword === newPassword)
      throw new ConflictException('Old and new password cannot be the same');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updateUser(user.id, { password: hashedPassword });
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const { email } = dto;
    if (typeof email !== 'string')
      throw new BadRequestException('Email is required');

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const resetToken = crypto.randomUUID();
    const hashedResetToken = await bcrypt.hash(resetToken, 12);
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.updateUser(user.id, {
      resetToken: hashedResetToken,
      resetTokenExpiry: expiry,
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }
  async resetPassword(dto: ResetPasswordDto, resetToken: string) {
    const { newPassword } = dto;

    const user = await this.usersService.findByResetToken(resetToken);

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updateUser(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    return { message: 'Password reset successful' };
  }
}
