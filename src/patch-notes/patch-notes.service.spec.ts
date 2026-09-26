import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { PatchNotesService } from './patch-notes.service.js';

const sampleNote = {
  id: '11111111-1111-4111-8111-111111111111',
  version: '1.2.3',
  titel: 'Balance',
  inhalt: 'Damage down.',
  createdAt: new Date('2026-09-25T10:00:00.000Z'),
  updatedAt: new Date('2026-09-25T10:00:00.000Z'),
};

describe('PatchNotesService', () => {
  let service: PatchNotesService;
  const findMany = vi.fn();
  const findUnique = vi.fn();

  beforeEach(async () => {
    findMany.mockReset();
    findUnique.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchNotesService,
        {
          provide: PrismaService,
          useValue: {
            patchNote: { findMany, findUnique },
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
});
