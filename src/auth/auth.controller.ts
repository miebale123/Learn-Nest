import { User } from './user.entity';

import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';

import { GetUser } from './get-user.decorator';
import { AuthService } from './auth.service';

interface RequestWithCookies extends Request {
  cookies: { 'refresh-token': string };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signUp(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signUp(authCredentialsDto);

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, message: 'signed up successfully' };
  }

  @Post('/signIn')
  async signIn(
    @Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.signIn(authCredentialsDto);

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, message: 'signed in successfully' };
  }

  @Post('/test')
  @UseGuards(AuthGuard('jwt'))
  test(@GetUser() user: User) {
    return user.username;
  }

  @Post('/refresh')
  async refresh(@Req() req: RequestWithCookies, @GetUser() user: User) {
    const refreshToken = req.cookies['refresh-token'];
    return await this.authService.refresh(refreshToken, user);
  }

  @Post('/logout')
  async logout(@GetUser() user: User) {
    return await this.authService.logout(user);
  }
}
