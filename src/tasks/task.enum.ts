import { PipeTransform, BadRequestException } from '@nestjs/common';

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowedStatuses = [TaskStatus.OPEN, TaskStatus.DONE];

  transform(value: string) {
    if (!value) {
      return value as TaskStatus;
    }
    value = value.toUpperCase();

    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`${value} is an invalid status`);
    }

    return value as TaskStatus;
  }

  private isStatusValid(status: any) {
    const idx = this.allowedStatuses.includes(status as TaskStatus);

    console.log(idx);
    return idx;
  }
}
