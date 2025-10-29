import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { configuration } from '../config/app.config';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { GoogleStrategy, JwtStrategy } from './strategies';
import { UsersModule } from 'src/users/users.module';
import { PasswordService } from './password.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      inject: [configuration.KEY],
      useFactory: (config: ConfigType<typeof configuration>) => ({
        secret: config.jwt_secret,
        signOptions: { expiresIn: config.jwt_expiry },
      }),
    }),
    UsersModule,
    MailModule,
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    MailService,
    UsersService,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
