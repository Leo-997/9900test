import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FileTrackerClient } from 'Clients/FileTracker/FileTracker.client';
import { FileTrackerController } from 'Controllers/FileTracker/FileTracker.controller';
import { DNANexusService } from 'Modules/DNANexus/DNANexus.service';
import { S3Module } from 'Modules/S3/S3.module';
import { FileTrackerService } from 'Services/FileTracker/FileTracker.service';

@Module({
  imports: [
    HttpModule,
    S3Module,
  ],
  controllers: [FileTrackerController],
  providers: [
    FileTrackerClient,
    FileTrackerService,
    DNANexusService,
  ],
  exports: [FileTrackerService],
})
export class FileTrackerModule {}
