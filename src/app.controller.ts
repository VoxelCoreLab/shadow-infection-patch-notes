import { Controller, Get, Headers, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot(
    @Headers('accept') accept: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (accept?.includes('text/html')) {
      res.type('html');
      return this.appService.getRootHtml();
    }

    return this.appService.getRootJson();
  }
}
