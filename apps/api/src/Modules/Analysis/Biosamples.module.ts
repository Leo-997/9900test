import { Module } from '@nestjs/common';
import { BiosamplesClient } from 'Clients/Analysis/Biosamples.client';
import { BiosamplesController } from 'Controllers/Analysis/Biosamples.controller';
import { BiosamplesService } from 'Services/Analysis/Biosamples.service';

@Module({
  imports: [],
  exports: [BiosamplesService],
  controllers: [BiosamplesController],
  providers: [BiosamplesClient, BiosamplesService],
})
export class BiosamplesModule {}
