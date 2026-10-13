import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorResponseDto } from '../dto/api-error-response.dto.js';

const STATUS_LABEL: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service Unavailable',
};

function flattenMessage(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((entry) => flattenMessage(entry))
      .filter((entry) => entry.length > 0);
    if (parts.length > 0) {
      return parts.join('; ');
    }
  }
  if (value && typeof value === 'object' && 'message' in value) {
    return flattenMessage((value as { message: unknown }).message);
  }
  return 'Unexpected error';
}

function labelForStatus(status: number): string {
  return STATUS_LABEL[status] ?? 'Error';
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? flattenMessage(body)
          : flattenMessage(
              (body as { message?: unknown }).message ?? exception.message,
            );
      const error =
        typeof body === 'object' &&
        body !== null &&
        typeof (body as { error?: unknown }).error === 'string'
          ? ((body as { error: string }).error ?? labelForStatus(status))
          : labelForStatus(status);

      const payload: ApiErrorResponseDto = {
        statusCode: status,
        message,
        error,
      };
      response.status(status).json(payload);
      return;
    }

    const payload: ApiErrorResponseDto = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: labelForStatus(HttpStatus.INTERNAL_SERVER_ERROR),
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(payload);
  }
}
