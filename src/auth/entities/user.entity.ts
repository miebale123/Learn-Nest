import { Task } from 'src/tasks/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Unique(['email'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  firstName: string | null;

  @Column({ nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', nullable: true })
  picture?: string | null;

  @Column({ nullable: true }) // nullable because OAuth users might not have a password
  password?: string | null;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'text', nullable: true })
  resetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  provider?: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerId?: string | null;

  @OneToMany(() => Task, (task) => task.user, { eager: true })
  tasks: Task[];
}
