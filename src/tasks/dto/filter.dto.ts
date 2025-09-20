import { TaskStatus } from '../task.enum';

export class FilterTaskDto {
  status?: TaskStatus;
  search?: string;
}
