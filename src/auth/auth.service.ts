import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { AuthCredentialsDto } from './dto/auth-credentials.dto';

import { User } from './user.entity';
import { UserRepository } from './auth.repo';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto) {
    return await this.userRepo.signUp(authCredentialsDto);
  }
  async signIn(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOneBy({ username });

    if (!user) throw new UnauthorizedException('invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new BadRequestException('password error. try again');

    const payLoad: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payLoad);

    const refreshToken = crypto.randomUUID();

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string, user: User) {
    const found = await this.userRepository.findOneBy({ id: user.id });

    if (!found || !found.refreshToken) throw new BadRequestException();

    const isMatch = await bcrypt.compare(refreshToken, found.refreshToken);

    if (!isMatch) throw new BadRequestException('refresh token is not valid');
  }

  async logout(user: User) {
    await this.userRepository.update(user.id, { refreshToken: null });
    return { message: 'logged out' };
  }
}
