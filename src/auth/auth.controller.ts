import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

import {
  SignupDto,
  SignInDto,
  UpdatePasswordDto,
  ForgotPasswordDto,
} from './dto/auth-credentials.dto';
import { User } from './user.entity';

import { GetUser } from './get-user.decorator';
import { AuthService } from './auth.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
interface RequestWithCookies extends Request {
  cookies: { 'refresh-token': string };
}

@Controller('auth')
export class AuthController {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private jwtService: JwtService,
    private readonly authService: AuthService,
  ) { }

  @Post('signup')
  async signUp(
    @Body(ValidationPipe) dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; message: string }> {
    const { accessToken, refreshToken } =
      await this.authService.signUp(dto);

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, message: 'signed up successfully' };
  }

  @Post('signIn')
  async signIn(
    @Body(ValidationPipe) dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; message: string }> {
    const { accessToken, refreshToken } =
      await this.authService.signIn(dto);

    res.cookie('refresh-token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken, message: 'signed in successfully' };
  }

  @Post('test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    return user.username;
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @GetUser() user: User,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies['refresh-token'];
    return await this.authService.refresh(refreshToken, user);
  }

  @Post('logout')
  async logout(@GetUser() user: User) {
    return await this.authService.logout(user);
  }

  @UseGuards(AuthGuard())
  @Patch('update-password')
  async updatePassword(@GetUser() user: User, @Body() dto: UpdatePasswordDto) {
    const existingUser = await this.userRepo.findOneBy({ id: user.id });


    if (!existingUser) throw new BadRequestException('user does not exist');

    console.log(existingUser)

    const isMatch = await bcrypt.compare(
      dto.oldPassword,
      existingUser.password,
    );



    if (!isMatch) throw new UnauthorizedException('password does not match');

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 12);
    existingUser.password = hashedNewPassword;

    await this.userRepo.save(existingUser);

    return { message: 'Password updated successfully' };
  }

  @Post('forget-password')
  forgetPassword(@Body() dto: ForgotPasswordDto) {
    if (!dto.username && !dto.email) {
      throw new BadRequestException(
        'Either username or email must be provided',
      );
    }
  }
  //   const existingUser = this.userRepo.find({
  //     where: { username: user.username },
  //   });

  //   console.log(existingUser)
  //   if(!existingUser)throw new BadRequestException('user not found')
  // }

  // @Post('forgot-password')
  // async forgotPassword(@Body() dto: ForgotPasswordDto) {
  //   const user = await this.userRepo.findOne({
  //     where: [{ username: dto.username }, { email: dto.email }],
  //   });
  //   if (!user) throw new NotFoundException('User not found');

  //   const token = this.jwtService.sign(
  //     { sub: user.id },
  //     { secret: process.env.RESET_PASSWORD_SECRET, expiresIn: '20s' },
  //   );

  //   // In production → send via email
  //   return { message: 'Reset link sent to email', token };
  // }

  //   @Post('reset-password')
  //   async resetPassword(@Body() dto: ResetPasswordDto) {
  //     try {
  //       const payload = this.jwtService.verify(dto.token, {
  //         secret: process.env.RESET_PASSWORD_SECRET,
  //       });

  //       const user = await this.userRepo.findOneBy({ id: payload.id });
  //       if (!user) throw new NotFoundException('User not found');

  //       user.password = await bcrypt.hash(dto.newPassword, 10);
  //       await this.userRepo.save(user);

  //       return { message: 'Password reset successful' };
  //     } catch {
  //       throw new UnauthorizedException('Invalid or expired reset token');
  //     }
  //   }
}
