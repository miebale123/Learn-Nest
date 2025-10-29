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
import { Bookmark } from 'src/bookmarks/bookmarks.entity';

@Unique(['email'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: true })
  password?: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'text', nullable: true })
  resetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  provider?: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerId?: string | null;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user, { eager: true })
  bookmarks: Bookmark[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', default: UserRole.User })
  role: UserRole;
}
