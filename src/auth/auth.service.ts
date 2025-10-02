import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { Injectable, BadRequestException, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { MailService } from 'src/mail/mail.service';
import { SignupDto, SignInDto, ForgotPasswordDto, ResetPasswordDto, UpdatePasswordDto } from './dto';
import { AuthInternal, GoogleRequest, JwtPayload } from './interfaces';
import { User } from '../users/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }


  async googleLogin(googleUser: any): Promise<AuthInternal> {
    const { email, providerId } = googleUser;

    if (typeof email !== 'string') throw new BadRequestException('Invalid email from Google user');


    let user = await this.usersService.findByEmail(email);

    if (user) throw new ConflictException('User already exists');

    user = await this.usersService.createUser(email, null);
    user.provider = 'google';
    user.providerId = providerId;

    await this.usersService.updateUser(user.id, { provider: user.provider, providerId: user.providerId });

    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const hashed = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateUser(user.id, { refreshToken: hashed });

    return { accessToken, refreshToken, message: 'Signed in with Google successfully' };
  }


  async signUp(dto: SignupDto): Promise<AuthInternal> {
    const user = await this.usersService.createUser(dto.email, dto.password);

    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, refreshToken: user.refreshToken!, message: 'Signed up successfully' };
  }


  async signIn(dto: SignInDto): Promise<AuthInternal> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.password) throw new BadRequestException('No password set for user');

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Incorrect password');

    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateUser(user.id, { refreshToken: hashedRefreshToken });

    return { accessToken, refreshToken, message: 'Signed in successfully' };
  }


  async refresh(oldRefreshToken: string, user: User): Promise<AuthInternal> {
    const found = await this.usersService.findByEmail(user.email);
    if (!found || !found.refreshToken) throw new BadRequestException('No refresh token found');

    const isMatch = await bcrypt.compare(oldRefreshToken, found.refreshToken);
    if (!isMatch) throw new BadRequestException('Invalid refresh token');

    const payload: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = crypto.randomUUID();
    const hashed = await bcrypt.hash(newRefreshToken, 12);
    await this.usersService.updateUser(user.id, { refreshToken: hashed });

    return { accessToken, refreshToken: newRefreshToken, message: 'Token refreshed successfully' };
  }


  async updatePassword(user: User, dto: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword } = dto;

    if (!user.password) throw new BadRequestException('No password set for user');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    if (oldPassword === newPassword) throw new ConflictException('Old and new password cannot be the same');

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.usersService.updateUser(user.id, { password: hashedPassword });
  }


  async logout(user: User): Promise<void> {
    await this.usersService.updateUser(user.id, { refreshToken: null });
  }


  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const resetToken = crypto.randomUUID();
    user.resetToken = await bcrypt.hash(resetToken, 12);
    user.resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.updateUser(user.id, {
      resetToken: user.resetToken,
      resetTokenExpiry: user.resetTokenExpiry,
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  }


  async resetPassword(dto: ResetPasswordDto, resetToken: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.resetToken || (user.resetTokenExpiry && user.resetTokenExpiry < new Date()))
      throw new BadRequestException('Invalid or expired token');

    const isMatch = await bcrypt.compare(resetToken, user.resetToken);
    if (!isMatch) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    await this.usersService.updateUser(user.id, { password: hashedPassword, resetToken: null, resetTokenExpiry: null });

    return { message: 'Password reset successful' };
  }
}
