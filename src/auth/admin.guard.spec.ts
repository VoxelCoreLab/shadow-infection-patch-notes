import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';
import { FirebaseAuthService } from './firebase-auth.service.js';

function contextWithAuth(authorization?: string) {
  const request = { headers: { authorization }, user: undefined };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  };
}

describe('AdminGuard', () => {
  const verifyIdToken = vi.fn();
  let guard: AdminGuard;

  beforeEach(() => {
    verifyIdToken.mockReset();
    guard = new AdminGuard({
      verifyIdToken,
    } as unknown as FirebaseAuthService);
  });

  it('rejects missing Authorization header with 401', async () => {
    const ctx = contextWithAuth();
    await expect(
      guard.canActivate(ctx as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects invalid token with 401', async () => {
    verifyIdToken.mockRejectedValue(new Error('bad token'));
    const ctx = contextWithAuth('Bearer bad');

    await expect(
      guard.canActivate(ctx as never),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects valid token without admin claim with 403', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'u1', admin: false });
    const ctx = contextWithAuth('Bearer user-token');

    await expect(
      guard.canActivate(ctx as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows token with admin claim', async () => {
    const decoded = { uid: 'admin-1', admin: true };
    verifyIdToken.mockResolvedValue(decoded);
    const ctx = contextWithAuth('Bearer admin-token');

    await expect(guard.canActivate(ctx as never)).resolves.toBe(true);
    expect(ctx.request.user).toEqual(decoded);
    expect(verifyIdToken).toHaveBeenCalledWith('admin-token');
  });
});
