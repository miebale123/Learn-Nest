import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController, } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { UserRepository } from './auth.repo';
import { JwtStrategy } from './strategies/jwt.strategy';
import { configuration } from '../config/app.config'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from './entities';
import { GoogleStrategy } from './strategies/google.strategy';

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
  ],

  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy, GoogleStrategy, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },],
  exports: [PassportModule, UserRepository],
})
export class AuthModule { }
