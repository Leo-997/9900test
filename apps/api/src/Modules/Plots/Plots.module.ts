import {
  Module,
} from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { PlotsClient } from 'Clients/Plots.client';
import { PlotsController } from 'Controllers/Plots.controller';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { S3Module } from 'Modules/S3/S3.module';
import { PlotsService } from 'Services/Plots.service';
import { DNANexusModuleConfig } from '../DNANexus/DNANexus.module';
import { FileTrackerModule } from '../FileTracker/FileTracker.module';

@Module({
  imports: [
    HttpModule,
    S3Module,
    DNANexusModuleConfig,
    FileTrackerModule,
    AuthModule,
  ],
  controllers: [PlotsController],
  providers: [
    PlotsClient,
    PlotsService,
  ],
  exports: [PlotsService, PlotsClient],
})
export class PlotsModule {}
