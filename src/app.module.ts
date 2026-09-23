import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import configuration from './configuration.js';
import { HealthModule } from './health/health.module.js';
import { PatchNotesModule } from './patch-notes/patch-notes.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),
    PrismaModule,
    HealthModule,
    PatchNotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
