import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FindPatchNotesQueryDto {
  @ApiPropertyOptional({
    description:
      'Filter by game version (Major.Minor.Patch). At most one note.',
    example: '1.2.3',
  })
  @IsOptional()
  @IsString()
  version?: string;
}
