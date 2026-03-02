import { Module } from '@nestjs/common';
import { CurationAtlasNotesController } from 'Controllers/Curation/Atlas/CurationAtlasNotes.controller';
import { CurationAtlasNotesClient } from 'Clients/Curation/Atlas/CurationAtlasNotes.client';
import { CurationAtlasNotesService } from 'Services/Curation/Atlas/CurationAtlasNotes.service';

@Module({
  controllers: [CurationAtlasNotesController],
  providers: [CurationAtlasNotesClient, CurationAtlasNotesService],
})
export class CurationAtlasNotesModule {}
