import { Module } from '@nestjs/common';

import { SVController } from 'Controllers/Curation/SV/SV.controller';
import { SVClient } from 'Clients/Curation/SV/SV.client';
import { SVService } from 'Services/Curation/SV/SV.service';
import { EvidenceModule } from 'Modules/Evidence/Evidence.module';
import { CommentsModule } from 'Modules/Comments/Comments.module';
import { AuthModule } from 'Modules/Auth/Auth.module';

@Module({
  imports: [
    CommentsModule,
    EvidenceModule,
    AuthModule,
  ],
  controllers: [SVController],
  providers: [SVClient, SVService],
})
export class SVModule {}
