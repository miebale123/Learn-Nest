import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';

import { User } from './user.entity';

import { SignupDto } from './dto';
import { AuthInternal, JwtPayload } from './interfaces';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }
  async signUp(dto: SignupDto): Promise<AuthInternal> {
    const { email, password } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) throw new BadRequestException('email already exists')

    const hashedPassword = await bcrypt.hash(password, 12);

    const refreshToken = crypto.randomUUID();

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    const newuser = this.userRepository.create({
      email,
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
    });

    try {
      await this.userRepository.save(newuser);
    } catch (error) {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('email already exists ');
      } else {
        throw new InternalServerErrorException('this is internal server error');
      }
    }

    const payLoad: JwtPayload = { sub: newuser.id, };

    const accessToken = this.jwtService.sign(payLoad);

    return { accessToken, refreshToken, message: 'you have signed up successfully' };
  }
}
