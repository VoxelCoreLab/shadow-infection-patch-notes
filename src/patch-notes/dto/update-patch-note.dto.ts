import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePatchNoteDto {
  @ApiPropertyOptional({ example: 'Balance Update' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'Enemy damage reduced by 10%.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;
}
