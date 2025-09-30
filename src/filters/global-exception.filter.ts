// src/common/filters/global-exception.filter.ts
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

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorType = 'ServerError';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null) {
                const obj = res as Record<string, unknown>;
                if (typeof obj.message === 'string') message = obj.message;
                if (typeof obj.error === 'string') errorType = obj.error;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        // Smart contextual logging
        const path = request.url;
        const method = request.method;

        if (path.startsWith('/auth')) {
            this.logger.warn(`[AUTH ERROR] ${method} ${path} → ${message}`);
        } else if (path.startsWith('/tasks')) {
            this.logger.warn(`[TASKS ERROR] ${method} ${path} → ${message}`);
        } else if (path.startsWith('/users')) {
            this.logger.warn(`[USERS ERROR] ${method} ${path} → ${message}`);
        } else {
            this.logger.warn(`[GENERAL ERROR] ${method} ${path} → ${message}`);
        }

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
