import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminGuard } from '../auth/admin.guard.js';
import { CreatePatchNoteDto } from './dto/create-patch-note.dto.js';
import { FindPatchNotesQueryDto } from './dto/find-patch-notes-query.dto.js';
import { PatchNoteDto } from './dto/patch-note.dto.js';
import { UpdatePatchNoteDto } from './dto/update-patch-note.dto.js';
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

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('Bearer Authentication')
  @ApiOperation({ summary: 'Create a patch note' })
  @ApiCreatedResponse({ type: PatchNoteDto })
  @ApiBadRequestResponse({ description: 'Invalid body or version format' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Valid JWT without admin claim' })
  @ApiConflictResponse({ description: 'Version already exists' })
  create(@Body() dto: CreatePatchNoteDto): Promise<PatchNoteDto> {
    return this.patchNotesService.create(dto);
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

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('Bearer Authentication')
  @ApiOperation({ summary: 'Update a patch note' })
  @ApiOkResponse({ type: PatchNoteDto })
  @ApiBadRequestResponse({ description: 'Invalid body' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Valid JWT without admin claim' })
  @ApiNotFoundResponse({ description: 'Patch note unknown' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePatchNoteDto,
  ): Promise<PatchNoteDto> {
    return this.patchNotesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('Bearer Authentication')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a patch note' })
  @ApiOkResponse({ type: PatchNoteDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid JWT' })
  @ApiForbiddenResponse({ description: 'Valid JWT without admin claim' })
  @ApiNotFoundResponse({ description: 'Patch note unknown' })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PatchNoteDto> {
    return this.patchNotesService.remove(id);
  }
}
