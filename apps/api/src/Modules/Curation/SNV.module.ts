import { Module } from '@nestjs/common';

import { SnvCurationController } from 'Controllers/Curation/SNV/SNV.controller';
import { SnvCurationClient } from 'Clients/Curation/SNV/SNV.client';
import { SnvCurationService } from 'Services/Curation/SNV/SNV.service';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { CountsModule } from './Counts.module';

@Module({
  imports: [AuthModule, CountsModule],
  controllers: [SnvCurationController],
  providers: [SnvCurationClient, SnvCurationService],
})
export class SnvCurationModule {}
