import { Controller, Get, Headers, Res } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { AppService } from './app.service.js';
import { RootResponseDto } from './dtos/root-response.dto.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ type: RootResponseDto })
  getRoot(
    @Headers('accept') accept: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ): RootResponseDto {
    if (accept?.includes('text/html')) {
      res.type('html');
      // HTML for browsers; OpenAPI documents the JSON response shape
      return this.appService.getRootHtml() as unknown as RootResponseDto;
    }

    return this.appService.getRootJson();
  }
}
