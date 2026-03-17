import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  IEvidence, UpdateEvidenceDTO, QueryEvidenceDTO, EvidenceSortOptions,
} from 'Models/Evidence/Evidence.model';
import { IUser } from 'Models/User/User.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EvidenceClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  async getEvidenceById(id: string): Promise<IEvidence> {
    return this.knex('zcc_evidences')
      .select('*')
      .where('id', id)
      .first();
  }

  async getAllEvidences({
    ids,
    excludeIds,
    type,
    citationType,
    resourceType,
    citationId,
    resourceId,
    searchQuery,
    title,
    author,
    year,
    publication,
    sortColumns,
    sortDirections,
    page = 1,
    limit = 100,
  }: QueryEvidenceDTO): Promise<IEvidence[]> {
    const sortColumnMapping: Record<EvidenceSortOptions, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Upload date': 'evidence.createdAt',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Publication date': 'citations.year',
    };
    const query = this.knex
      .select({
        id: 'evidence.id',
        resourceId: 'evidence.resourceId',
        citationId: 'evidence.citationId',
        createdAt: 'evidence.createdAt',
        createdBy: 'evidence.createdBy',
        updatedAt: 'evidence.updatedAt',
        updatedBy: 'evidence.updatedBy',
        deletedAt: 'evidence.deletedAt',
        deletedBy: 'evidence.deletedBy',
      })
      .from({ evidence: 'zcc_evidences' })
      .leftJoin({ resources: 'zcc_resources' }, 'evidence.resourceId', 'resources.id')
      .leftJoin({ citations: 'zcc_citations' }, 'evidence.citationId', 'citations.id')
      .whereNull('evidence.deletedAt')
      .where(function custom() {
        if (ids && ids.length > 0) this.whereIn('evidence.id', ids);

        if (excludeIds && excludeIds.length > 0) this.whereNotIn('evidence.id', excludeIds);

        if (type && type === 'CITATION') this.whereNotNull('citationId');

        if (type && type === 'RESOURCE') this.whereNotNull('resourceId');

        if (citationType && citationType.length > 0) this.whereIn('citations.source', citationType);

        if (resourceType && resourceType.length > 0) this.whereIn('resources.type', resourceType);

        if (citationId) this.where('citationId', citationId);

        if (resourceId) this.where('resourceId', resourceId);

        if (title && title.length > 0) {
          this.where(function titleFilter() {
            title.forEach((t) => {
              this.orWhere('citations.title', 'LIKE', `%${t}%`);
              this.orWhere('resources.name', 'LIKE', `%${t}%`);
            });
          });
        }

        if (author && author.length > 0) {
          this.where(function authorFilter() {
            author.forEach((a) => this.orWhere('citations.authors', 'LIKE', `${a}%`));
          });
        }

        if (year) this.where('citations.year', year);

        if (publication && publication.length > 0) {
          this.where(function publicationFilter() {
            publication.forEach((p) => this.orWhere('citations.publication', 'LIKE', `%${p}%`));
          });
        }

        if (searchQuery) {
          this.where(function search() {
            this.where('citations.authors', 'LIKE', `${searchQuery}%`)
              .orWhere('citations.externalId', searchQuery);
          });
        }
      })
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy(
        sortColumns && sortDirections && sortColumns.length === sortDirections.length
          ? [
            ...sortColumns.map((col, index) => ({
              column: sortColumnMapping[col],
              order: sortDirections[index],
            })),
            // to differentiate items that have the same sort
            {
              column: 'evidence.id',
              order: 'asc',
            },
          ]
          : [
            {
              column: 'evidence.createdAt',
              order: 'desc',
            },
            // to differentiate items that have the same sort
            {
              column: 'evidence.id',
              order: 'asc',
            },
          ],
      );

    return query;
  }

  async getEvidenceCount({
    ids,
    excludeIds,
    type,
    citationType,
    resourceType,
    citationId,
    resourceId,
    searchQuery,
  }: QueryEvidenceDTO): Promise<number> {
    const result = await this.knex
      .count({
        count: '*',
      })
      .from({ evidence: 'zcc_evidences' })
      .leftJoin({ resources: 'zcc_resources' }, 'evidence.resourceId', 'resources.id')
      .leftJoin({ citations: 'zcc_citations' }, 'evidence.citationId', 'citations.id')
      .whereNull('evidence.deletedAt')
      .where(function custom() {
        if (ids && ids.length > 0) this.whereIn('evidence.id', ids);

        if (excludeIds && excludeIds.length > 0) this.whereNotIn('evidence.id', excludeIds);

        if (type && type === 'CITATION') this.whereNotNull('citationId');

        if (type && type === 'RESOURCE') this.whereNotNull('resourceId');

        if (citationType && citationType.length > 0) this.whereIn('citations.source', citationType);

        if (resourceType && resourceType.length > 0) this.whereIn('resources.type', resourceType);

        if (citationId) this.where('citationId', citationId);

        if (resourceId) this.where('resourceId', resourceId);

        if (searchQuery) {
          this.where(function search() {
            this.where('citations.title', 'LIKE', `%${searchQuery}%`)
              .orWhere('citations.authors', 'LIKE', `%${searchQuery}%`)
              .orWhere('citations.publication', 'LIKE', `%${searchQuery}%`)
              .orWhere('citations.source', 'LIKE', `%${searchQuery}%`)
              .orWhere('citations.externalId', 'LIKE', `%${searchQuery}%`)
              .orWhere('resources.name', 'LIKE', `%${searchQuery}%`)
              .orWhere('resources.url', 'LIKE', `%${searchQuery}%`);
          });
        }
      });

    return result && result[0] ? result[0].count : null;
  }

  async createEvidence(
    evidence: UpdateEvidenceDTO,
    user: IUser,
  ): Promise<string> {
    const id: string = uuid();
    await this.knex
      .insert({
        id,
        ...evidence,
        createdAt: new Date(),
        createdBy: user.id,
      })
      .into('zcc_evidences');
    return id;
  }

  async updateEvidence(
    id: string,
    evidence: UpdateEvidenceDTO,
    user: IUser,
  ): Promise<string> {
    try {
      await this.knex
        .update({
          ...evidence,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .from('zcc_evidences')
        .where('id', id);
      return `Updated evidence with id: ${id}`;
    } catch (e) {
      return `Failed to update evidence with id: ${id}. Error: ${e}`;
    }
  }

  async deleteEvidence(
    id: string,
    user: IUser,
  ): Promise<void> {
    const date = new Date();

    await this.knex
      .update({
        deletedAt: date,
        deletedBy: user.id,
      })
      .from('zcc_evidences')
      .where('id', id);
  }

  /**
   * Counts old records that match the cleanup criteria.
   * @param cutoffDate - Date before which records should be deleted
   * @param compareColumn - Column name to compare against (typically 'deleted_at')
   * @returns Promise resolving to the count of records to be deleted
   */
  async countOldRecords(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<number> {
    const recordsToDeleteCount = (await this.knex('zcc_evidences')
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .count('* as count')
      .first()) as unknown as { count: string | number } | undefined;

    return recordsToDeleteCount ? Number(recordsToDeleteCount.count) : 0;
  }

  /**
   * Permanently deletes old records from the database.
   * @param cutoffDate - Date before which records should be deleted
   * @param compareColumn - Column name to compare against (typically 'deleted_at')
   * @returns Promise resolving to the total number of records permanently deleted
   */
  async deleteOldRecords(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<number> {
    return this.knex('zcc_evidences')
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .delete();
  }
}
