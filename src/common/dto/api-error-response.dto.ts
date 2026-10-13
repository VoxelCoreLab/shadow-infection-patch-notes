import { ApiProperty } from '@nestjs/swagger';

/** Uniform error body for every HTTP exception from this API. */
export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: 'version must match Major.Minor.Patch',
    description: 'Single human-readable message (never an array)',
  })
  message!: string;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;
}
