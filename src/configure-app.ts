import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ApiExceptionFilter } from './common/filters/api-exception.filter.js';

function validationMessage(errors: { constraints?: Record<string, string> }[]): string {
  const parts = errors.flatMap((error) =>
    error.constraints ? Object.values(error.constraints) : [],
  );
  return parts.length > 0 ? parts.join('; ') : 'Validation failed';
}

/** Shared Nest setup so e2e and production use the same pipes and filters. */
export function configureApp(app: INestApplication): void {
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) =>
        new BadRequestException(validationMessage(errors)),
    }),
  );
}
