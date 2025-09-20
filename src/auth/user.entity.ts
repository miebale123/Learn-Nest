import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Task } from 'src/tasks/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  username: string;

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
