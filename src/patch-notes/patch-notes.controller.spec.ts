import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PatchNotesController } from './patch-notes.controller.js';
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

describe('PatchNotesController', () => {
  let controller: PatchNotesController;
  const findAll = vi.fn();
  const findOne = vi.fn();
  const create = vi.fn();
  const update = vi.fn();
  const remove = vi.fn();

  beforeEach(async () => {
    findAll.mockReset();
    findOne.mockReset();
    create.mockReset();
    update.mockReset();
    remove.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatchNotesController],
      providers: [
        {
          provide: PatchNotesService,
          useValue: { findAll, findOne, create, update, remove },
        },
      ],
    }).compile();

    controller = module.get(PatchNotesController);
  });

  it('delegates list without version filter', async () => {
    findAll.mockResolvedValue([sampleNote]);

    await expect(controller.findAll({})).resolves.toEqual([sampleNote]);
    expect(findAll).toHaveBeenCalledWith(undefined);
  });

  it('delegates list with version filter', async () => {
    findAll.mockResolvedValue([sampleNote]);

    await expect(controller.findAll({ version: '1.2.3' })).resolves.toEqual([
      sampleNote,
    ]);
    expect(findAll).toHaveBeenCalledWith('1.2.3');
  });

  it('delegates get by id', async () => {
    findOne.mockResolvedValue(sampleNote);

    await expect(controller.findOne(sampleNote.id)).resolves.toEqual(
      sampleNote,
    );
    expect(findOne).toHaveBeenCalledWith(sampleNote.id);
  });

  it('propagates NotFoundException', async () => {
    findOne.mockRejectedValue(new NotFoundException('missing'));

    await expect(controller.findOne(sampleNote.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('delegates create', async () => {
    create.mockResolvedValue(sampleNote);

    await expect(controller.create(createDto)).resolves.toEqual(sampleNote);
    expect(create).toHaveBeenCalledWith(createDto);
  });

  it('propagates ConflictException on create', async () => {
    create.mockRejectedValue(new ConflictException('exists'));

    await expect(controller.create(createDto)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('delegates update', async () => {
    const patched = { ...sampleNote, title: 'Hotfix' };
    update.mockResolvedValue(patched);

    await expect(
      controller.update(sampleNote.id, { title: 'Hotfix' }),
    ).resolves.toEqual(patched);
    expect(update).toHaveBeenCalledWith(sampleNote.id, { title: 'Hotfix' });
  });

  it('delegates delete', async () => {
    remove.mockResolvedValue(sampleNote);

    await expect(controller.remove(sampleNote.id)).resolves.toEqual(sampleNote);
    expect(remove).toHaveBeenCalledWith(sampleNote.id);
  });
});
