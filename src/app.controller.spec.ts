import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

describe('AppController', () => {
  let appController: AppController;
  let res: { type: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    res = { type: vi.fn().mockReturnThis() };
  });

  describe('root', () => {
    it('should return JSON for non-browser clients', () => {
      expect(
        appController.getRoot('application/json', res as unknown as Response),
      ).toEqual({
        name: 'Shadow Infection Patch Notes API',
        docs: '/api',
      });
      expect(res.type).not.toHaveBeenCalled();
    });

    it('should return HTML for browsers', () => {
      const html = appController.getRoot(
        'text/html,application/xhtml+xml',
        res as unknown as Response,
      );

      expect(res.type).toHaveBeenCalledWith('html');
      expect(html).toContain('Shadow Infection Patch Notes API');
      expect(html).toContain('href="/api"');
    });
  });
});
