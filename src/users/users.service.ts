import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from './user.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers() {
    return await this.userRepository.find();
  }

  async createUser(email: string, password?: string | null): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const refreshToken = crypto.randomUUID();
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      refreshToken: hashedRefreshToken,
      role: UserRole.User,
    });

    try {
      return await this.userRepository.save(newUser);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async updateUser(id: number, data: Partial<User>): Promise<void> {
    await this.userRepository.update(id, data);
  }

  async findByResetToken(resetToken: string): Promise<User | null> {
    const users = await this.userRepository.find({
      where: { resetToken: Not(IsNull()) },
    });

    for (const user of users) {
      if (!user.resetToken) return null;
      const isMatch = await bcrypt.compare(resetToken, user.resetToken);
      if (isMatch) return user;
    }

    return null;
  }

  async updateRole(id: number, role: UserRole): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new Error('User not found');

    user.role = role;
    console.log(user.role);
    return this.userRepository.save(user);
  }

  async createAdmin(email: string, password: string): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email });
    if (existing) return existing;

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminUser = this.userRepository.create({
      email,
      password: hashedPassword,
      role: UserRole.Admin,
    });

    console.log(`initial admin created with ${email} and ${password}`);

    return this.userRepository.save(adminUser);
  }
}
