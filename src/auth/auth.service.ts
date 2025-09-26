import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';

import { User } from './user.entity';
import { UserRepository } from './auth.repo';
import { JwtPayload } from './jwt-payload.interface';
import { SignInDto, SignupDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepository,
  ) { }

  async signUp(dto: SignupDto) {
    return this.userRepo.signUp(dto)
  }

  async signIn(dto: SignInDto) {
    const { username, email, password } = dto;

    const user = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    console.log(password)

    if (!user) throw new UnauthorizedException('invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new BadRequestException('password error. try again');

    const payLoad: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payLoad);

    const refreshToken = crypto.randomUUID();

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    await this.userRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
    });
    return { accessToken, refreshToken }

  }

  async refresh(refreshToken: string, user: User) {
    const found = await this.userRepository.findOneBy({ id: user.id });

    if (!found || !found.refreshToken) throw new BadRequestException();

    const isMatch = await bcrypt.compare(refreshToken, found.refreshToken);

    if (!isMatch) throw new BadRequestException('refresh token is not valid');

    const payLoad: JwtPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payLoad);

    return { accessToken };
  }



  async logout(user: User) {
    await this.userRepository.update(user.id, { refreshToken: null });
    return { message: 'logged out' };
  }
}
