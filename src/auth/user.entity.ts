import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from 'src/tasks/task.entity';
import { IsOptional } from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @IsOptional()
  username: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  @IsOptional()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => Task, (task) => task.user, { eager: true })
  tasks: Task[];
}
