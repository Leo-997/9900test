import { Module } from '@nestjs/common';

import { HTSClient } from 'Clients/Curation/HTS/HTS.client';
import { HTSController } from 'Controllers/Curation/HTS/HTS.controller';
import { AuthModule } from 'Modules/Auth/Auth.module';
import { PlotsModule } from 'Modules/Plots/Plots.module';
import { S3Module } from 'Modules/S3/S3.module';
import { HTSService } from 'Services/Curation/HTS/HTS.service';

@Module({
  imports: [
    PlotsModule,
    AuthModule,
    S3Module,
  ],
  controllers: [HTSController],
  providers: [HTSClient, HTSService],
})
export class HTSModule {}
