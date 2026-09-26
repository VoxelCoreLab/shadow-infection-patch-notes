import { ApiProperty } from '@nestjs/swagger';

export class PatchNoteDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: '1.2.3' })
  version: string;

  @ApiProperty({ example: 'Balance Update' })
  titel: string;

  @ApiProperty({ example: 'Enemy damage reduced by 10%.' })
  inhalt: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
