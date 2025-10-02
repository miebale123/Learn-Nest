import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

interface ExceptionResponse {
    message?: string | string[];
    [key: string]: any;
}


// we should sanitize 5xx errors, stack traces.... from being sent to client.
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(GlobalExceptionFilter.name);
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // we use these for fallback if not provided
        let status = 500;
        let errorType = 'InternalServerErrorException';
        let message: string | string[] = 'An unexpected error occurred';

        
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            errorType = exception.constructor.name;

            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (res && typeof res === 'object' && 'message' in res) {
                const obj = res as ExceptionResponse;
                message = obj.message ?? 'An unexpected error occurred';
            } else {
                message = 'An unexpected error occurred';
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        const logPayload = {
            statusCode: status,
            path: request.url,
            method: request.method,
            errorType,
            message,
            timestamp: new Date().toISOString(),
        };

        this.logger.error({ err: exception, ...logPayload });

        response.status(status).json({
            success: false,
            statusCode: status,
            path: request.url,
            timestamp: new Date().toISOString(),
            error: errorType,
            message,
        });
    }
}
