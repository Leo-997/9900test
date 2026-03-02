import { Module } from '@nestjs/common';
import { CountsClient } from 'Clients/Curation/Counts/Counts.client';
import { CountsService } from 'Services/Curation/Counts/Counts.service';

@Module({
  imports: [],
  exports: [CountsService],
  providers: [CountsService, CountsClient],
})
export class CountsModule {}
