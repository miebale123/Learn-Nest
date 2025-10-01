import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { AuthService } from './auth.service';
import { SignupDto, SignInDto, UpdatePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { GetRefreshToken, GetUser } from './decorators';
import type { AuthInternal, GoogleRequest } from './interfaces';
import { SetRefreshTokenCookieInterceptor } from './interceptors';
import { Public } from 'src/common/decorators';
import { User } from '../users/entities';
import { AuthGuard } from '@nestjs/passport';
import { AuditExclude } from 'src/audit/audit-exclude.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // STEP 1: Redirect to Google login page
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  // STEP 2: Handle Google redirect callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest) {

    const googleUser = req.user;

    return await this.authService.googleLogin(googleUser);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(SetRefreshTokenCookieInterceptor)
  @AuditExclude()
  @Post('sign-up')
  async signUp(@Body() dto: SignupDto): Promise<AuthInternal> {
    return this.authService.signUp(dto);
  }


  @Public()
  @Throttle({ default: { limit: 60000, ttl: 5 } })
  @UseInterceptors(SetRefreshTokenCookieInterceptor)
  @AuditExclude()
  @Post('sign-in')
  async signIn(@Body() dto: SignInDto): Promise<AuthInternal> {
    return this.authService.signIn(dto);
  }


  @Throttle({ default: { limit: 60000, ttl: 5 } })
  @UseInterceptors(SetRefreshTokenCookieInterceptor)
  @Post('refresh')
  async refresh(
    @GetUser() user: User,
    @GetRefreshToken() oldRefreshToken: string,
  ): Promise<AuthInternal> {
    return this.authService.refresh(oldRefreshToken, user);
  }


  @Patch('update-password')
  async updatePassword(
    @GetUser() user: User,
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.updatePassword(user, dto);
    return { message: 'password updated successfully' }
  }


  @Post('log-out')
  async logOut(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(user);
    res.clearCookie('refresh-token');

    return { message: 'logged out succesfully' }
  }


  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(dto);
    return { message: 'Password reset link sent to your email.' };
  }


  @Public()
  @Post('reset-password/:resetToken')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Param('resetToken') resetToken: string,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(dto, resetToken);
    return { message: 'Password reset successfully' };
  }
}
