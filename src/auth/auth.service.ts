import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

import { JwtPayload } from './jwt-payload.interface';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto) {
    const { username, password } = authCredentialsDto;

    const hashedPassword = await bcrypt.hash(password, 12);

    const payLoad: JwtPayload = { username };
    const accessToken = this.jwtService.sign(payLoad);

    const refreshToken = crypto.randomUUID();

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    const user = this.userRepository.create({
      username,
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
    });

    try {
      await this.userRepository.save(user);
    } catch (error) {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('Username already exists ');
      } else {
        throw new InternalServerErrorException();
      }
    }
    return { accessToken, refreshToken };
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
