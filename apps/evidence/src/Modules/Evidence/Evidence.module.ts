import { Module } from '@nestjs/common';
import { EvidenceClient } from 'Clients/Evidence/Evidence.client';
import { EvidenceController } from 'Controllers/Evidence/Evidence.controller';
import { EvidenceService } from 'Services/Evidence/Evidence.service';
import { CitationModule } from '../Citation/Citation.module';
import { ResourceModule } from '../Resource/Resource.module';

@Module({
  imports: [
    CitationModule,
    ResourceModule,
  ],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceClient],
  exports: [EvidenceService],
})
export class EvidenceModule {}
