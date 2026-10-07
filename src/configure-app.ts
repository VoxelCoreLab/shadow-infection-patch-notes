import { INestApplication, ValidationPipe } from '@nestjs/common';

/** Shared Nest setup so e2e and production use the same pipes. */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
}
