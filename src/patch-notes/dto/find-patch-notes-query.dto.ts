import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';
import { VERSION_PATTERN } from './create-patch-note.dto.js';

export class FindPatchNotesQueryDto {
  @ApiPropertyOptional({
    description:
      'Filter by game version (Major.Minor.Patch). At most one note.',
    example: '1.2.3',
  })
  @IsOptional()
  @IsString()
  @Matches(VERSION_PATTERN, {
    message: 'version must be Major.Minor.Patch',
  })
  version?: string;
}
