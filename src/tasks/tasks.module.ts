import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { TasksService } from 'src/tasks/tasks.service';
import { TasksRepository } from './task.repository';
import { TasksController } from './tasks.controller';
import { Task } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
})
export class TasksModule {}
