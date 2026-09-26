import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PatchNotesController } from './patch-notes.controller.js';
import { PatchNotesService } from './patch-notes.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PatchNotesController],
  providers: [PatchNotesService],
})
export class PatchNotesModule {}
