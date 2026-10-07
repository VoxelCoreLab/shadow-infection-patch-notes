import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import { configureApp } from './../src/configure-app.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        onModuleInit: vi.fn(),
        onModuleDestroy: vi.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('/ (GET) returns JSON by default', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Accept', 'application/json')
      .expect(200)
      .expect({
        name: 'Shadow Infection Patch Notes API',
        docs: '/api',
      });
  });

  it('/ (GET) returns HTML for browsers', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Accept', 'text/html')
      .expect(200)
      .expect('Content-Type', /html/)
      .expect((response) => {
        expect(response.text).toContain('Shadow Infection Patch Notes API');
        expect(response.text).toContain('href="/api"');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
