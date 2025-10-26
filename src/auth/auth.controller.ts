import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { GetRefreshToken, GetUser, Roles } from './decorators';
import type { AuthInternal, Profile } from './interfaces';
import { SetRefreshTokenCookie } from './interceptors';
import { Public } from 'src/common/decorators';
import { User } from '../users/entities';
import { AuditExclude } from 'src/audit/audit-exclude.decorator';
import { PasswordService } from './password.service';
import { AuthGuard } from '@nestjs/passport';

import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
  UpdatePasswordDto,
} from './dto/auth-credentials.dto';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordSerivce: PasswordService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: Profile) {
    return this.authService.handleSocialLogin(req);
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(SetRefreshTokenCookie)
  @AuditExclude()
  @Post('sign-up')
  async signUp(@Body() dto: SignupDto): Promise<AuthInternal> {
    return this.authService.signUp(dto);
  }

  @Public()
  @Throttle({ default: { limit: 60000, ttl: 5 } })
  @UseInterceptors(SetRefreshTokenCookie)
  @AuditExclude()
  @Post('sign-in')
  async signIn(@Body() dto: SigninDto): Promise<AuthInternal> {
    return this.authService.signIn(dto);
  }

  @Throttle({ default: { limit: 60000, ttl: 3 } })
  @UseInterceptors(SetRefreshTokenCookie)
  @Post('refresh')
  async refresh(
    @GetUser() user: User,
    @GetRefreshToken() oldRefreshToken: string,
  ): Promise<AuthInternal> {
    return this.authService.refresh(oldRefreshToken, user);
  }

  @Post('log-out')
  async logOut(
    @GetUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(user);
    res.clearCookie('refresh-token');

    return { message: 'logged out succesfully' };
  }

  @Patch('update-password')
  async updatePassword(
    @GetUser() user: User,
    @Body() dto: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    await this.passwordSerivce.updatePassword(user, dto);
    return { message: 'password updated successfully' };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.passwordSerivce.forgotPassword(dto);
    return { message: 'Password reset link sent to your email.' };
  }

  @Public()
  @Post('reset-password/:resetToken')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Param('resetToken') resetToken: string,
  ): Promise<{ message: string }> {
    await this.passwordSerivce.resetPassword(dto, resetToken);
    return { message: 'Password reset successfully' };
  }
}
