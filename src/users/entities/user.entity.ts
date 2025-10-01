// src/users/user.entity.ts
import { Task } from 'src/tasks/entities/task.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../user.enum';

@Unique(['email'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  // Nullable because OAuth users may not have a password
  @Column({ type: 'text', nullable: true })
  password?: string | null;

  // Hashed refresh token
  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  // Password reset token
  @Column({ type: 'text', nullable: true })
  resetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null;

  @Column({ default: true })
  isActive: boolean;

  // OAuth provider (e.g., 'google', 'github')
  @Column({ type: 'varchar', nullable: true })
  provider?: string | null;

  // Provider-specific ID
  @Column({ type: 'varchar', nullable: true })
  providerId?: string | null;

  // Tasks relation
  @OneToMany(() => Task, (task) => task.user, { eager: true })
  tasks: Task[];

  // Optional timestamps for auditing
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar', default: UserRole.USER })
  role: UserRole;
}
