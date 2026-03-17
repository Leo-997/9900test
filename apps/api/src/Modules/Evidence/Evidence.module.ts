import { Module } from '@nestjs/common';

import { EvidenceController } from 'Controllers/Evidence/Evidence.controller';
import { EvidenceClient } from 'Clients/Evidence/Evidence.client';
import { EvidenceService } from 'Services/Evidence/Evidence.service';
import { FileTrackerModule } from 'Modules/FileTracker/FileTracker.module';

@Module({
  imports: [FileTrackerModule],
  controllers: [EvidenceController],
  providers: [EvidenceClient, EvidenceService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
