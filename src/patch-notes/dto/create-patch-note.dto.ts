import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

export class CreatePatchNoteDto {
  @ApiProperty({
    example: '1.2.3',
    description: 'Game version in Major.Minor.Patch format',
  })
  @IsString()
  @Matches(VERSION_PATTERN, {
    message: 'version must be Major.Minor.Patch',
  })
  version: string;

  @ApiProperty({ example: 'Balance Update' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 'Enemy damage reduced by 10%.' })
  @IsString()
  @MinLength(1)
  content: string;
}
