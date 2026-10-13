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
import { ApiErrorResponseDto } from '../common/dto/api-error-response.dto.js';
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
  @ApiBadRequestResponse({
    description: 'Invalid version query',
    type: ApiErrorResponseDto,
  })
  findAll(@Query() query: FindPatchNotesQueryDto): Promise<PatchNoteDto[]> {
    return this.patchNotesService.findAll(query.version);
  }

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('Bearer Authentication')
  @ApiOperation({ summary: 'Create a patch note' })
  @ApiCreatedResponse({ type: PatchNoteDto })
  @ApiBadRequestResponse({
    description: 'Invalid body or version format',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Valid JWT without admin claim',
    type: ApiErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Version already exists',
    type: ApiErrorResponseDto,
  })
  create(@Body() dto: CreatePatchNoteDto): Promise<PatchNoteDto> {
    return this.patchNotesService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one patch note by id' })
  @ApiOkResponse({ type: PatchNoteDto })
  @ApiBadRequestResponse({
    description: 'Invalid UUID',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Patch note unknown',
    type: ApiErrorResponseDto,
  })
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
  @ApiBadRequestResponse({
    description: 'Invalid body or UUID',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Valid JWT without admin claim',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Patch note unknown',
    type: ApiErrorResponseDto,
  })
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
  @ApiBadRequestResponse({
    description: 'Invalid UUID',
    type: ApiErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid JWT',
    type: ApiErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Valid JWT without admin claim',
    type: ApiErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Patch note unknown',
    type: ApiErrorResponseDto,
  })
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PatchNoteDto> {
    return this.patchNotesService.remove(id);
  }
}
