import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FindPatchNotesQueryDto } from './dto/find-patch-notes-query.dto.js';
import { PatchNoteDto } from './dto/patch-note.dto.js';
import { PatchNotesService } from './patch-notes.service.js';

@ApiTags('Patch Notes')
@Controller('patch-notes')
export class PatchNotesController {
  constructor(private readonly patchNotesService: PatchNotesService) {}

  @Get()
  @ApiOperation({
    summary: 'List patch notes',
    description:
      'Returns all notes, or at most one note when filtered by version.',
  })
  @ApiOkResponse({ type: PatchNoteDto, isArray: true })
  findAll(@Query() query: FindPatchNotesQueryDto): Promise<PatchNoteDto[]> {
    return this.patchNotesService.findAll(query.version);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one patch note by id' })
  @ApiOkResponse({ type: PatchNoteDto })
  @ApiNotFoundResponse({ description: 'Patch note unknown' })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PatchNoteDto> {
    return this.patchNotesService.findOne(id);
  }
}
