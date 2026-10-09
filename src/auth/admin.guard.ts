import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { FirebaseAuthService } from './firebase-auth.service.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    let decoded;
    try {
      decoded = await this.firebaseAuth.verifyIdToken(token);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Missing or invalid bearer token');
    }

    if (decoded.admin !== true) {
      throw new ForbiddenException('Admin claim required');
    }

    (request as Request & { user: typeof decoded }).user = decoded;
    return true;
  }
}
