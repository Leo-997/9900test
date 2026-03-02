import { Module } from '@nestjs/common';
import { EvidenceModule } from 'Modules/Evidence/Evidence.module';
import { CommentsModule } from 'Modules/Comments/Comments.module';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { GermlineSvController } from 'Controllers/Curation/SV/GermlineSv.controller';
import { GermlineSVCurationClient } from 'Clients/Curation/SV/GermlineSv.client';
import { GermlineSVCurationService } from 'Services/Curation/SV/GermlineSv.service';

@Module({
  imports: [
    CommentsModule,
    EvidenceModule,
    AuthModule,
  ],
  controllers: [GermlineSvController],
  providers: [GermlineSVCurationClient, GermlineSVCurationService],
})
export class GermlineSVModule {}
