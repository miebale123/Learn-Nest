import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);
    private readonly isDev = process.env.NODE_ENV === 'development';

    private readonly safeMessages: Record<string, string> = {
        BadRequestException: 'Invalid input provided',
        UnauthorizedException: 'Authentication failed',
        NotFoundException: 'Resource not found',
        ForbiddenException: 'Access denied',
        ConflictException: 'Request conflict',
        RequestTimeoutException: 'Request timed out',
        ServiceUnavailableException: 'Service unavailable',
        GatewayTimeoutException: 'Gateway timed out',
        InternalServerErrorException: 'An unexpected error occurred',
    };

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorType = 'InternalServerErrorException';
        let message: any = this.safeMessages.InternalServerErrorException;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            errorType = exception.constructor.name;

            if (typeof res === 'string') {
                message = this.isDev ? res : this.safeMessages[errorType] || res;
            } else if (typeof res === 'object' && res !== null) {
                const obj = res as Record<string, any>;
                if (Array.isArray(obj.message)) {
                    message = this.isDev ? obj.message : this.safeMessages.BadRequestException;
                    errorType = obj.error || 'BadRequestException';
                } else if (typeof obj.message === 'string') {
                    message = this.isDev ? obj.message : this.safeMessages[errorType] || obj.message;
                    errorType = obj.error || errorType;
                } else if (obj.error) {
                    errorType = obj.error;
                }
            }
        } else if (exception instanceof Error) {
            message = this.isDev
                ? exception.message
                : this.safeMessages.InternalServerErrorException;
        }

        const path = request.url;
        const method = request.method;
        const logMessage = `${method} ${path} → ${JSON.stringify(message)}`;

        // 🔹 Always log stack trace internally (but not in Postman)
        if (exception instanceof Error) {
            this.logger.error(`[${errorType}] ${logMessage}`, exception.stack);
        } else if (status >= 500) {
            this.logger.error(`[${errorType}] ${logMessage}`);
        } else if (status >= 400) {
            this.logger.warn(`[${errorType}] ${logMessage}`);
        } else {
            this.logger.log(`[${errorType}] ${logMessage}`);
        }

        if (this.isDev) {
            if (path.startsWith('/auth')) this.logger.verbose(`[AUTH ERROR] ${logMessage}`);
            else if (path.startsWith('/tasks')) this.logger.verbose(`[TASKS ERROR] ${logMessage}`);
            else if (path.startsWith('/users')) this.logger.verbose(`[USERS ERROR] ${logMessage}`);
        }

        // 🔹 Client gets safe response (no stack trace)
        response.status(status).json({
            success: false,
            statusCode: status,
            path,
            timestamp: new Date().toISOString(),
            error: errorType,
            message,
        });
    }
}
