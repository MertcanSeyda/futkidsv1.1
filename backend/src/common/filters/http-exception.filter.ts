import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        // Log sensitive info but don't expose to user in production
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            console.error('🔥 CRITICAL ERROR:', exception);
        }

        const isProduction = process.env.NODE_ENV === 'production';

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: isProduction && status === HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Bir sunucu hatası oluştu. Lütfen teknik ekiple iletişime geçin.'
                : (typeof message === 'object' ? (message as any).message || message : message),
            // Hide stack trace in production
            ...(isProduction ? {} : { stack: (exception as any)?.stack }),
        });
    }
}
