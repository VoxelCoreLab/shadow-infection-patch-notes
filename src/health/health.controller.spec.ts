import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  const check = vi.fn();
  const pingCheck = vi.fn();
  const prisma = {} as PrismaService;

  beforeEach(async () => {
    check.mockReset();
    pingCheck.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: { check } },
        { provide: PrismaHealthIndicator, useValue: { pingCheck } },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    controller = module.get(HealthController);
  });

  it('runs a Prisma database ping via Terminus', async () => {
    const result = {
      status: 'ok',
      info: { database: { status: 'up' } },
      error: {},
      details: { database: { status: 'up' } },
    };
    const attempt = { status: 'up' };
    pingCheck.mockReturnValue(attempt);
    check.mockImplementation(async (indicators: Array<() => unknown>) => {
      for (const indicator of indicators) {
        indicator();
      }
      return result;
    });

    await expect(controller.check()).resolves.toEqual(result);
    expect(check).toHaveBeenCalledOnce();
    expect(pingCheck).toHaveBeenCalledWith('database', prisma);
  });
});
