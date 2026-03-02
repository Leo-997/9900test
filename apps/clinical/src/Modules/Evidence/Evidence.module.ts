import { Module } from '@nestjs/common';
import { EvidenceClient } from '../../Clients/Evidence/Evidence.client';
import { EvidenceController } from '../../Controllers';
import { EvidenceService } from '../../Services';
import { AuthModule } from '../Auth/Auth.module';

@Module({
  imports: [AuthModule],
  controllers: [EvidenceController],
  providers: [EvidenceService, EvidenceClient],
  exports: [EvidenceService],
})
export class EvidenceModule {}
