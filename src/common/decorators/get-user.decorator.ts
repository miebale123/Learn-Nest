import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { RequestWithUserAndCookies } from '../../auth/interfaces/req-user-cookies.interface';

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserAndCookies>();
    return request.user;
  },
);

