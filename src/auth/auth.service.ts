import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AuthInternal, JwtPayload, Profile } from './interfaces';
import { UsersService } from '../users/users.service';
import { SigninDto, SignupDto } from './dto/auth-credentials.dto';
import { User } from 'src/users/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: SignupDto): Promise<AuthInternal> {
    const { email, password } = dto;

    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    const user = await this.usersService.createUser(email, password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const userEmail = user.email;
    return {
      userEmail,
      accessToken,
      refreshToken: user.refreshToken!,
      message: 'Signed up successfully',
    };
  }

  async signIn(dto: SigninDto): Promise<AuthInternal> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password)
      throw new UnauthorizedException('User not found');

    const userEmail = user.email;

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new BadRequestException('Incorrect password');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = crypto.randomUUID();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateUser(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return {
      userEmail,
      accessToken,
      refreshToken,
      message: 'Signed in successfully',
    };
  }

  async handleSocialLogin(profile: Profile): Promise<AuthInternal> {
    const { email, provider, providerId } = profile;

    let user = await this.usersService.findByEmail(email);
    if (!user) user = await this.usersService.createUser(email, null);

    await this.usersService.updateUser(user.id, { provider, providerId });

    const userEmail = user.email;

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const hashed = await bcrypt.hash(refreshToken, 12);
    await this.usersService.updateUser(user.id, { refreshToken: hashed });

    return {
      userEmail,
      accessToken,
      refreshToken,
      message: `Signed in with ${provider} successfully`,
    };
  }

  async refresh(oldRefreshToken: string, user: User): Promise<AuthInternal> {
    const found = await this.usersService.findByEmail(user.email);
    if (!found?.refreshToken)
      throw new BadRequestException('No refresh token found');

    const isMatch = await bcrypt.compare(oldRefreshToken, found.refreshToken);
    if (!isMatch) throw new BadRequestException('Invalid refresh token');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    const newRefreshToken = crypto.randomUUID();
    const hashed = await bcrypt.hash(newRefreshToken, 12);
    await this.usersService.updateUser(user.id, { refreshToken: hashed });
    const userEmail = found?.email;

    return {
      userEmail,
      accessToken,
      refreshToken: newRefreshToken,
      message: 'Token refreshed successfully',
    };
  }

  async logout(user: User): Promise<void> {
    await this.usersService.updateUser(user.id, { refreshToken: null });
  }
}
