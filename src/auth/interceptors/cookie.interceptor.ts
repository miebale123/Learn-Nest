import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { map, Observable } from "rxjs";
import { AuthResponseDto } from "../dto/auth-response.dto";
import { AuthInternal } from "../interfaces/AuthInternal.interface";
import { setRefreshTokenCookie } from "src/common/utils/cookie.util";

@Injectable()
export class SetRefreshTokenCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: AuthInternal): AuthResponseDto => {

        setRefreshTokenCookie(response, data.refreshToken)

        delete data?.refreshToken

        const { accessToken, message } = data;

        return { accessToken, message }
      }),
    );

  }
}
