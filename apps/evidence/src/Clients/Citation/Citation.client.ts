import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  UpdateCitationDTO, QueryCitationDTO, ICitation, ExternalCitationSource,
} from 'Models/Citation/Citation.model';
import { IUser } from 'Models/User/User.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CitationClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getCitationById(id: string): Promise<ICitation> {
    return this.knex
      .select('*')
      .from('zcc_citations')
      .where('id', id)
      .first();
  }

  public async getAllCitations({
    ids,
    title,
    authors,
    publication,
    year,
    link,
    source,
    externalId,
    searchQuery,
    page = 1,
    limit = 100,
  }: QueryCitationDTO): Promise<ICitation[]> {
    return this.knex
      .select('*')
      .from('zcc_citations')
      .where(function search() {
        if (searchQuery) {
          this.where('title', 'LIKE', `%${searchQuery}%`)
            .orWhere('authors', 'LIKE', `%${searchQuery}%`)
            .orWhere('publication', 'LIKE', `%${searchQuery}%`)
            .orWhere('source', 'LIKE', `%${searchQuery}%`)
            .orWhere('externalId', 'LIKE', `%${searchQuery}%`);
        }
      })
      .where(function custom() {
        if (ids && ids.length > 0) this.whereIn('id', ids);

        if (title) this.where('title', title);

        if (authors) this.where('authors', authors);

        if (publication) this.where('publication', publication);

        if (year) this.where('year', year);

        if (link) this.where('link', link);

        if (source) this.where('source', source);

        if (externalId) this.where('externalId', externalId);
      })
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('createdAt', 'desc');
  }

  public async createCitation(
    citation: UpdateCitationDTO,
    user: IUser,
  ): Promise<string> {
    const id: string = uuid();
    await this.knex
      .insert({
        id,
        ...citation,
        createdAt: new Date(),
        createdBy: user.id,
      })
      .into('zcc_citations');

    return id;
  }

  public async updateCitation(
    id: string,
    citation: UpdateCitationDTO,
    user: IUser,
  ): Promise<string> {
    try {
      await this.knex
        .update({
          ...citation,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .from('zcc_citations')
        .where('id', id);
      return `Updated citation with id: ${id}`;
    } catch (e) {
      return `Failed to update citation with id: ${id}. Error: ${e}`;
    }
  }

  public async deleteCitation(
    id: string,
    user: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        deletedAt: new Date(),
        deletedBy: user.id,
      })
      .from('zcc_citations')
      .where('id', id);
  }

  public async getCitationByExternalId(
    externalId: string,
    source: ExternalCitationSource,
  ): Promise<ICitation | undefined> {
    return this.knex
      .select('*')
      .from('zcc_citations')
      .where('externalId', externalId)
      .andWhere('source', source)
      .first();
  }

  public async getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  async getOldCitationIds(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    return this.knex('zcc_citations')
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  async deleteEvidenceByCitationIds(
    citationIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (citationIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db('zcc_evidences')
      .whereIn('citationId', citationIds)
      .delete();
  }

  async permanentlyDeleteCitations(
    citationIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (citationIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db('zcc_citations')
      .whereIn('id', citationIds)
      .delete();
  }
}
