import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import bcrypt from 'bcrypt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class UserRepository {
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

  async findUser(username: string) {
    return await this.userRepository.findOneBy({ username });
  }
}
