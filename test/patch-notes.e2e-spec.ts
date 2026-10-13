import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
import { FirebaseAuthService } from '../src/auth/firebase-auth.service.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const sampleNote = {
  id: '11111111-1111-4111-8111-111111111111',
  version: '1.2.3',
  title: 'Balance',
  content: 'Damage down.',
  createdAt: new Date('2026-09-25T10:00:00.000Z'),
  updatedAt: new Date('2026-09-25T10:00:00.000Z'),
};

const createBody = {
  version: '1.2.3',
  title: 'Balance',
  content: 'Damage down.',
};

const ADMIN_TOKEN = 'admin-token';
const USER_TOKEN = 'user-token';

/**
 * TF-13: Anlegen, Ändern, Löschen inkl. Auth (JWT + admin claim → 401/403).
 */
describe('PatchNotesController (e2e)', () => {
  let app: INestApplication<App>;
  const findMany = vi.fn();
  const findUnique = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const remove = vi.fn();
  const verifyIdToken = vi.fn();

  beforeEach(async () => {
    findMany.mockReset();
    findUnique.mockReset();
    create.mockReset();
    update.mockReset();
    remove.mockReset();
    verifyIdToken.mockReset();
    verifyIdToken.mockImplementation(async (token: string) => {
      if (token === ADMIN_TOKEN) {
        return { uid: 'admin', admin: true };
      }
      if (token === USER_TOKEN) {
        return { uid: 'user', admin: false };
      }
      throw new Error('invalid token');
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        patchNote: {
          findMany,
          findUnique,
          create,
          update,
          delete: remove,
        },
        $connect: vi.fn(),
        $disconnect: vi.fn(),
        onModuleInit: vi.fn(),
        onModuleDestroy: vi.fn(),
      })
      .overrideProvider(FirebaseAuthService)
      .useValue({
        onModuleInit: vi.fn(),
        verifyIdToken,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /patch-notes returns 401 without token', async () => {
    const response = await request(app.getHttpServer())
      .post('/patch-notes')
      .send(createBody)
      .expect(401);

    expect(response.body).toEqual({
      statusCode: 401,
      message: expect.any(String),
      error: 'Unauthorized',
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('POST /patch-notes returns 401 for invalid token', async () => {
    const response = await request(app.getHttpServer())
      .post('/patch-notes')
      .set('Authorization', 'Bearer invalid')
      .send(createBody)
      .expect(401);

    expect(response.body).toMatchObject({
      statusCode: 401,
      error: 'Unauthorized',
    });
    expect(typeof response.body.message).toBe('string');
    expect(create).not.toHaveBeenCalled();
  });

  it('POST /patch-notes returns 403 without admin claim', async () => {
    const response = await request(app.getHttpServer())
      .post('/patch-notes')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send(createBody)
      .expect(403);

    expect(response.body).toMatchObject({
      statusCode: 403,
      error: 'Forbidden',
    });
    expect(typeof response.body.message).toBe('string');
    expect(create).not.toHaveBeenCalled();
  });

  it('POST /patch-notes creates a note with admin JWT (201)', async () => {
    create.mockResolvedValue(sampleNote);

    const response = await request(app.getHttpServer())
      .post('/patch-notes')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(createBody)
      .expect(201);

    expect(response.body).toMatchObject({
      id: sampleNote.id,
      version: '1.2.3',
      title: 'Balance',
      content: 'Damage down.',
    });
    expect(create).toHaveBeenCalledWith({ data: createBody });
  });

  it('POST /patch-notes returns 400 for invalid version format', async () => {
    const response = await request(app.getHttpServer())
      .post('/patch-notes')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ ...createBody, version: '1.2' })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    expect(typeof response.body.message).toBe('string');
    expect(Array.isArray(response.body.message)).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it('POST /patch-notes returns 409 when version already exists', async () => {
    create.mockRejectedValue({ code: 'P2002' });

    const response = await request(app.getHttpServer())
      .post('/patch-notes')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send(createBody)
      .expect(409);

    expect(response.body).toMatchObject({
      statusCode: 409,
      error: 'Conflict',
    });
    expect(typeof response.body.message).toBe('string');
  });

  it('PATCH /patch-notes/:id updates a note (200)', async () => {
    const patched = { ...sampleNote, title: 'Hotfix' };
    update.mockResolvedValue(patched);

    const response = await request(app.getHttpServer())
      .patch(`/patch-notes/${sampleNote.id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ title: 'Hotfix' })
      .expect(200);

    expect(response.body.title).toBe('Hotfix');
    expect(update).toHaveBeenCalledWith({
      where: { id: sampleNote.id },
      data: { title: 'Hotfix' },
    });
  });

  it('DELETE /patch-notes/:id deletes a note (200)', async () => {
    remove.mockResolvedValue(sampleNote);

    const response = await request(app.getHttpServer())
      .delete(`/patch-notes/${sampleNote.id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .expect(200);

    expect(response.body.id).toBe(sampleNote.id);
    expect(remove).toHaveBeenCalledWith({ where: { id: sampleNote.id } });
  });

  it('PATCH /patch-notes/:id returns 404 when note is unknown', async () => {
    update.mockRejectedValue({ code: 'P2025' });

    await request(app.getHttpServer())
      .patch(`/patch-notes/${sampleNote.id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ title: 'Missing' })
      .expect(404);
  });

  it('DELETE /patch-notes/:id returns 404 when note is unknown', async () => {
    remove.mockRejectedValue({ code: 'P2025' });

    await request(app.getHttpServer())
      .delete(`/patch-notes/${sampleNote.id}`)
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .expect(404);
  });

  it('GET /patch-notes stays public (no auth)', async () => {
    findMany.mockResolvedValue([sampleNote]);

    const response = await request(app.getHttpServer())
      .get('/patch-notes')
      .expect(200);

    expect(response.body).toHaveLength(1);
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('GET /patch-notes returns 400 for invalid version query', async () => {
    const response = await request(app.getHttpServer())
      .get('/patch-notes')
      .query({ version: 'latest' })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    expect(typeof response.body.message).toBe('string');
    expect(Array.isArray(response.body.message)).toBe(false);
    expect(findMany).not.toHaveBeenCalled();
  });
});
