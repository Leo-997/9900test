import { Module } from '@nestjs/common';
import { IGVClient } from 'Clients/IGV/IGV.client';
import { IGVController } from 'Controllers/IGV/IGV.controller';
import { S3Module } from 'Modules/S3/S3.module';
import { IGVService } from 'Services/IGV/IGV.service';

@Module({
  imports: [S3Module],
  controllers: [IGVController],
  providers: [
    IGVClient,
    IGVService,
  ],
})
export class IGVModule {}
