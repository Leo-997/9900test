import { Module } from '@nestjs/common';

import { GermlineCnvController } from 'Controllers/Curation/CNV/GermlineCnv.controller';
import { GermlineCnvCurationClient } from 'Clients/Curation/CNV/GermlineCnv.client';
import { GermlineCnvService } from 'Services/Curation/CNV/GermlineCnv.service';
import { AuthModule } from 'Modules/Auth/Auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GermlineCnvController],
  providers: [GermlineCnvCurationClient, GermlineCnvService],
})
export class GermlineCnvCurationModule {}
