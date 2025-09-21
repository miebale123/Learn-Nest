import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FilterTaskDto, CreateTaskDto } from './dto';
import { User } from 'src/auth/user.entity';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  logger = new Logger('TaskRepository');

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user: user,
    });

    try {
      await this.taskRepository.save(task);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Not created task for your Data: ${JSON.stringify(task)}`,
          error.stack,
        );
      } else {
        this.logger.error('Not created task', JSON.stringify(error));
      }
    }

    delete task.user;

    return task;
  }

  async getTasks(filterTaskDto: FilterTaskDto, user: User): Promise<Task[]> {
    const { status, search } = filterTaskDto;
    const query = this.taskRepository.createQueryBuilder('task');

    query.where('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to get tasks for user  Filters: ${JSON.stringify(filterTaskDto)}`,
          error.stack,
        );
      } else {
        this.logger.error('Not created task', JSON.stringify(error));
      }

      throw new InternalServerErrorException();
    }
  }
}
