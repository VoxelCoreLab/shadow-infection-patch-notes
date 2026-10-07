import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module.js';
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

/**
 * TF-13 ohne Auth: Anlegen, Ändern, Löschen, 400 (Format), 409 (Duplikat).
 * JWT/401/403 folgen in AP 4.2.6.
 */
describe('PatchNotesController (e2e)', () => {
  let app: INestApplication<App>;
  const findMany = vi.fn();
  const findUnique = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const remove = vi.fn();

  beforeEach(async () => {
    findMany.mockReset();
    findUnique.mockReset();
    create.mockReset();
    update.mockReset();
    remove.mockReset();

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
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /patch-notes creates a note (201)', async () => {
    create.mockResolvedValue(sampleNote);

    const response = await request(app.getHttpServer())
      .post('/patch-notes')
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
    await request(app.getHttpServer())
      .post('/patch-notes')
      .send({ ...createBody, version: '1.2' })
      .expect(400);

    expect(create).not.toHaveBeenCalled();
  });

  it('POST /patch-notes returns 409 when version already exists', async () => {
    create.mockRejectedValue({ code: 'P2002' });

    await request(app.getHttpServer())
      .post('/patch-notes')
      .send(createBody)
      .expect(409);
  });

  it('PATCH /patch-notes/:id updates a note (200)', async () => {
    const patched = { ...sampleNote, title: 'Hotfix' };
    update.mockResolvedValue(patched);

    const response = await request(app.getHttpServer())
      .patch(`/patch-notes/${sampleNote.id}`)
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
      .expect(200);

    expect(response.body.id).toBe(sampleNote.id);
    expect(remove).toHaveBeenCalledWith({ where: { id: sampleNote.id } });
  });

  it('GET /patch-notes returns 400 for invalid version query', async () => {
    await request(app.getHttpServer())
      .get('/patch-notes')
      .query({ version: 'latest' })
      .expect(400);

    expect(findMany).not.toHaveBeenCalled();
  });
});
