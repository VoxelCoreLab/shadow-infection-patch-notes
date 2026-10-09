import {
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseAuthService implements OnModuleInit {
  private app: App | undefined;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    if (getApps().length > 0) {
      this.app = getApps()[0];
      return;
    }

    const projectId = this.configService.get<string>('firebase.projectId');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');
    const privateKey = this.configService.get<string>('firebase.privateKey');

    if (projectId && clientEmail && privateKey) {
      this.app = initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
      return;
    }

    // Local/dev fallback when GOOGLE_APPLICATION_CREDENTIALS is set.
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.app = initializeApp({ credential: applicationDefault() });
    }
  }

  async verifyIdToken(token: string): Promise<DecodedIdToken> {
    if (!this.app && getApps().length === 0) {
      throw new ServiceUnavailableException(
        'Firebase Admin is not configured',
      );
    }
    return getAuth().verifyIdToken(token);
  }
}
