import { Module } from '@nestjs/common';

import { GermlineSnvController } from 'Controllers/Curation/SNV/GermlineSnv.controller';
import { GermlineSnvCurationClient } from 'Clients/Curation/SNV/GermlineSnv.client';
import { GermlineSnvService } from 'Services/Curation/SNV/GermlineSnv.service';
import { FileTrackerModule } from 'Modules/FileTracker/FileTracker.module';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { GenesModule } from './Genes.module';

@Module({
  imports: [
    GenesModule,
    FileTrackerModule,
    AuthModule,
  ],
  controllers: [GermlineSnvController],
  providers: [GermlineSnvCurationClient, GermlineSnvService],
})
export class GermlineSnvCurationModule {}
