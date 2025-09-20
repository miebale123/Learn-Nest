import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { TaskStatus, TaskStatusValidationPipe } from './task.enum';

import { CreateTaskDto } from './dto/task.dto';
import { TasksService } from './tasks.service';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { FilterTaskDto } from './dto/filter.dto';
import { Task } from './task.entity';

@UseGuards(AuthGuard())
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('createTask')
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ) {
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Post()
  async getTasks(
    @Query() filterTaskDto: FilterTaskDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(filterTaskDto, user);
  }

  @Get('/:id')
  async getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ) {
    return await this.tasksService.getTaskById(id, user);
  }

  @Patch('/:id')
  async updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUser() user: User,
  ) {
    return this.tasksService.updateTaskStatus(id, status, user);
  }

  @Delete('deleteTask/:id')
  async deleteTask(@Param('id') id: number) {
    return this.tasksService.deleteTask(id);
  }
}
