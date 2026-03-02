import { Module } from '@nestjs/common';
import { CitationClient } from 'Clients/Citation/Citation.client';
import { CitationController } from 'Controllers/Citation/Citation.controller';
import { CitationService } from 'Services/Citation/Citation.service';

@Module({
  imports: [],
  controllers: [CitationController],
  providers: [CitationService, CitationClient],
  exports: [CitationService],
})
export class CitationModule {}
