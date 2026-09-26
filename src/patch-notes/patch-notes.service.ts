import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { PatchNoteDto } from './dto/patch-note.dto.js';

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
}
