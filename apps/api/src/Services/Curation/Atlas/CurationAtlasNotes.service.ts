import { Injectable } from '@nestjs/common';
import type { CurationAtlasNote, GetCurationAtlasNotesFilterDTO, UpdateCurationAtlasNoteDTO } from '@zero-dash/types';
import { CurationAtlasNotesClient } from 'Clients/Curation/Atlas/CurationAtlasNotes.client';

@Injectable()
export class CurationAtlasNotesService {
  constructor(
    private readonly curationAtlasNotesClient: CurationAtlasNotesClient,
  ) {}

  public async getNotes(
    query: GetCurationAtlasNotesFilterDTO,
  ): Promise<CurationAtlasNote[]> {
    return this.curationAtlasNotesClient.getNotes(query);
  }

  public async upsertNote(
    body: UpdateCurationAtlasNoteDTO,
  ): Promise<void> {
    await this.curationAtlasNotesClient.upsertNote(body);
  }
}
