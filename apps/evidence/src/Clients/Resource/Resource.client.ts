import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  CreateResourceDTO,
  IResource,
  QueryResourceDTO,
  UpdateResourceDTO,
} from 'Models/Resource/Resource.model';
import { IUser } from 'Models/User/User.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ResourceClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) { }

  async getResourceById(id: string): Promise<IResource> {
    return this.knex
      .select('*')
      .from('zcc_resources')
      .where('id', id)
      .first();
  }

  async getAllResources({
    ids,
    name,
    type,
    url,
    fileId,
    searchQuery,
    page = 1,
    limit = 100,
  }: QueryResourceDTO): Promise<IResource[]> {
    return this.knex
      .select('*')
      .from('zcc_resources')
      .where(function search() {
        if (searchQuery) {
          this.where('name', 'LIKE', `%${searchQuery}%`)
            .orWhere('url', 'LIKE', `%${searchQuery}%`);
        }
      })
      .where(function custom() {
        if (ids && ids.length > 0) this.whereIn('id', ids);

        if (name) this.where('name', name);

        if (type) this.where('type', type);

        if (url) this.where('url', url);

        if (fileId) this.where('fileId', fileId);
      })
      .limit(limit)
      .offset((page - 1) * limit)
      .orderBy('createdAt', 'desc');
  }

  async createResource(
    resource: CreateResourceDTO,
    user: IUser,
  ): Promise<string> {
    const id: string = uuid();
    await this.knex
      .insert({
        id,
        ...resource,
        createdAt: new Date(),
        createdBy: user.id,
      })
      .into('zcc_resources');

    return id;
  }

  async updateResource(
    id: string,
    resource: UpdateResourceDTO,
    user: IUser,
  ): Promise<string> {
    try {
      await this.knex
        .update({
          ...resource,
          updatedAt: new Date(),
          updatedBy: user.id,
        })
        .from('zcc_resources')
        .where('id', id);
      return `Updated resource with id: ${id}`;
    } catch (e) {
      return `Failed to update resource with id: ${id}. Error: ${e}`;
    }
  }

  async deleteResource(
    id: string,
    user: IUser,
  ): Promise<void> {
    await this.knex
      .update({
        deletedAt: new Date(),
        deletedBy: user.id,
      })
      .from('zcc_resources')
      .where('id', id);
  }

  public async getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  async getOldResourceIds(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    return this.knex('zcc_resources')
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  async permanentlyDeleteResources(
    resourceIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (resourceIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db('zcc_resources')
      .whereIn('id', resourceIds)
      .delete();
  }

  async deleteEvidenceByResourceIds(
    resourceIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (resourceIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db('zcc_evidences')
      .whereIn('resourceId', resourceIds)
      .delete();
  }
}
