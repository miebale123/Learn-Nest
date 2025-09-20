import { Injectable, NotFoundException } from '@nestjs/common';
import { TasksRepository } from './task.repository';
import { CreateTaskDto } from './dto/task.dto';
import { FilterTaskDto } from './dto/filter.dto';
import { TaskStatus } from './task.enum';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    private readonly taskRepository: TasksRepository,
  ) {}

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async getTasks(filterTaskDto: FilterTaskDto, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(filterTaskDto, user);
  }

  async getTaskById(id: number, user: User) {
    const found = await this.taskRepo.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!found) throw new NotFoundException(`Task with ID "${id}" not found`);
    return found;
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    return await this.taskRepo.save(task);
  }

  async deleteTask(id: number): Promise<void> {
    const result = await this.taskRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    
  }
}
