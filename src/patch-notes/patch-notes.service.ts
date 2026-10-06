import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreatePatchNoteDto } from './dto/create-patch-note.dto.js';
import type { PatchNoteDto } from './dto/patch-note.dto.js';
import type { UpdatePatchNoteDto } from './dto/update-patch-note.dto.js';
import {
  isRecordNotFoundError,
  isUniqueConstraintError,
} from './prisma-error.js';

@Injectable()
export class PatchNotesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(version?: string): Promise<PatchNoteDto[]> {
    return this.prisma.patchNote.findMany({
      where: version ? { version } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<PatchNoteDto> {
    const note = await this.prisma.patchNote.findUnique({ where: { id } });
    if (!note) {
      throw new NotFoundException(`Patch note ${id} not found`);
    }
    return note;
  }

  async create(dto: CreatePatchNoteDto): Promise<PatchNoteDto> {
    try {
      return await this.prisma.patchNote.create({ data: dto });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException(`version ${dto.version} already exists`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePatchNoteDto): Promise<PatchNoteDto> {
    try {
      return await this.prisma.patchNote.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException(`Patch note ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<PatchNoteDto> {
    try {
      return await this.prisma.patchNote.delete({ where: { id } });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException(`Patch note ${id} not found`);
      }
      throw error;
    }
  }
}
