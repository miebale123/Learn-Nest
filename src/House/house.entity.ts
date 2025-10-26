// src/upload/house.entity.ts
import { User } from 'src/users/entities';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';


@Entity('houses')
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  area: string;

  @Column({ type: 'int', nullable: true })
  bedroom: number;

  @Column({ type: 'int', nullable: true })
  bathroom: number;

  @Column({ type: 'int', nullable: true })
  car: number;

  @ManyToOne(() => User, (user) => user.house, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
