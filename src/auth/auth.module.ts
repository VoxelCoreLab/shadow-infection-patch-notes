import { Global, Module } from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';
import { FirebaseAuthService } from './firebase-auth.service.js';

@Global()
@Module({
  providers: [FirebaseAuthService, AdminGuard],
  exports: [FirebaseAuthService, AdminGuard],
})
export class AuthModule {}
