import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { v4 as uuid } from 'uuid';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import type { CurationAtlasNote, GetCurationAtlasNotesFilterDTO, UpdateCurationAtlasNoteDTO } from '@zero-dash/types';

@Injectable()
export class CurationAtlasNotesClient {
  private readonly notesTable = 'zcc_curation_atlas_notes';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public getNotes(
    query: GetCurationAtlasNotesFilterDTO,
  ): Promise<CurationAtlasNote[]> {
    return this.knex
      .select({
        id: 'a.id',
        entityType: 'a.entity_type',
        version: 'a.version',
        notes: 'a.notes',
      })
      .from<CurationAtlasNote[]>({
        a: this.notesTable,
      })
      .where(function applyFilters() {
        if (query.entityType) this.where('a.entity_type', query.entityType);
        if (query.version) this.where('a.version', query.version);
      })
      .orderBy('a.entity_type', 'asc')
      .orderBy('a.version', 'asc');
  }

  public async upsertNote(
    { entityType, version, notes }: UpdateCurationAtlasNoteDTO,
  ): Promise<void> {
    await this.knex
      .insert({
        id: uuid(),
        entity_type: entityType,
        version: version ?? null,
        notes: notes ?? null,
      })
      .into(this.notesTable)
      .onConflict(['entity_type', 'version'])
      .merge({
        notes: notes ?? null,
      });
  }
}
