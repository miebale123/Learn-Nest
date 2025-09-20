import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/tasks/task.entity';
import { Repository } from 'typeorm';
import { TaskStatus } from './task.enum';

class CreateTaskDto {
  title: string;
  description: string;
}

@Controller('tasks')
export class TasksController {
  constructor(
    @InjectRepository(Task)
    private userRepository: Repository<Task>,
  ) {}

  @Post('createTask')
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    const { title, description } = createTaskDto;

    const task = this.userRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    try {
      await this.userRepository.save(task);
    } catch (error: unknown) {
      return error;
    }
    return await this.userRepository.find();
  }

  @Get()
  getTasks(@Query() search: string) {
    const query = this.userRepository.createQueryBuilder();

    query.where('tasks.title := search', { search });

    // return await this.userRepository.find();
    return query;
  }
}
