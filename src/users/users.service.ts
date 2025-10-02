import { Injectable, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from 'src/auth';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async createUser(email: string, password?: string | null): Promise<User> {
        // Optional: Remove redundant check if DB enforces unique constraint
        const existing = await this.userRepository.findOne({ where: { email } });
        if (existing) throw new ConflictException('Email already exists');

        const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
        const refreshToken = crypto.randomUUID();
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

        const newUser = this.userRepository.create({
            email,
            password: hashedPassword,
            refreshToken: hashedRefreshToken,
        });

        try {
            return await this.userRepository.save(newUser);
        } catch (error) {
            //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (error.code === '23505') {
                throw new ConflictException('Email already exists');
            } else {
                throw new InternalServerErrorException();
            }
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async updateUser(id: number, data: Partial<User>): Promise<void> {
        await this.userRepository.update(id, data);
    }
}