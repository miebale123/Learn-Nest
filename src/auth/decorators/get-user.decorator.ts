import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user.entity';
import { RequestWithUserAndCookies } from '../interfaces/req-user-cookies.interface';

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUserAndCookies>();
    return request.user;
  },
);

