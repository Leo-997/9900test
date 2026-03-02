import { Module } from '@nestjs/common';

import { CnvCurationController } from 'Controllers/Curation/CNV/CNV.controller';
import { CnvCurationClient } from 'Clients/Curation/CNV/CNV.client';
import { CnvCurationService } from 'Services/Curation/CNV/CNV.service';
import { AuthModule } from 'Modules/Auth/Auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CnvCurationController],
  providers: [CnvCurationClient, CnvCurationService],
})
export class CnvCurationModule {}
