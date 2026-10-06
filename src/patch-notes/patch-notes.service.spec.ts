import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { PatchNotesService } from './patch-notes.service.js';

const sampleNote = {
  id: '11111111-1111-4111-8111-111111111111',
  version: '1.2.3',
  title: 'Balance',
  content: 'Damage down.',
  createdAt: new Date('2026-09-25T10:00:00.000Z'),
  updatedAt: new Date('2026-09-25T10:00:00.000Z'),
};

const createDto = {
  version: '1.2.3',
  title: 'Balance',
  content: 'Damage down.',
};

describe('PatchNotesService', () => {
  let service: PatchNotesService;
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchNotesService,
        {
          provide: PrismaService,
          useValue: {
            patchNote: {
              findMany,
              findUnique,
              create,
              update,
              delete: remove,
            },
          },
        },
      ],
    }).compile();

    service = module.get(PatchNotesService);
  });

  it('lists all notes ordered by createdAt desc', async () => {
    findMany.mockResolvedValue([sampleNote]);

    await expect(service.findAll()).resolves.toEqual([sampleNote]);
    expect(findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { createdAt: 'desc' },
    });
  });

  it('filters by version when provided', async () => {
    findMany.mockResolvedValue([sampleNote]);

    await expect(service.findAll('1.2.3')).resolves.toEqual([sampleNote]);
    expect(findMany).toHaveBeenCalledWith({
      where: { version: '1.2.3' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns a note by id', async () => {
    findUnique.mockResolvedValue(sampleNote);

    await expect(service.findOne(sampleNote.id)).resolves.toEqual(sampleNote);
    expect(findUnique).toHaveBeenCalledWith({ where: { id: sampleNote.id } });
  });

  it('throws NotFoundException for unknown id', async () => {
    findUnique.mockResolvedValue(null);

    await expect(service.findOne(sampleNote.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates a note', async () => {
    create.mockResolvedValue(sampleNote);

    await expect(service.create(createDto)).resolves.toEqual(sampleNote);
    expect(create).toHaveBeenCalledWith({ data: createDto });
  });

  it('throws ConflictException when version exists', async () => {
    create.mockRejectedValue({ code: 'P2002' });

    await expect(service.create(createDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('updates a note', async () => {
    const patched = { ...sampleNote, title: 'Hotfix' };
    update.mockResolvedValue(patched);

    await expect(
      service.update(sampleNote.id, { title: 'Hotfix' }),
    ).resolves.toEqual(patched);
    expect(update).toHaveBeenCalledWith({
      where: { id: sampleNote.id },
      data: { title: 'Hotfix' },
    });
  });

  it('throws NotFoundException when updating unknown id', async () => {
    update.mockRejectedValue({ code: 'P2025' });

    await expect(
      service.update(sampleNote.id, { title: 'Hotfix' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes a note', async () => {
    remove.mockResolvedValue(sampleNote);

    await expect(service.remove(sampleNote.id)).resolves.toEqual(sampleNote);
    expect(remove).toHaveBeenCalledWith({ where: { id: sampleNote.id } });
  });

  it('throws NotFoundException when deleting unknown id', async () => {
    remove.mockRejectedValue({ code: 'P2025' });

    await expect(service.remove(sampleNote.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
