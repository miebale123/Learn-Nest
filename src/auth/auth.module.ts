import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  AuthController,
  UserRepository,
  AuthService,
  User,
  JwtStrategy,
} from '.';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'topSecret',
      signOptions: {
        expiresIn: '20s', // but in prod, we use '15m'
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UserRepository],
  exports: [PassportModule, JwtStrategy],
})
export class AuthModule {}
