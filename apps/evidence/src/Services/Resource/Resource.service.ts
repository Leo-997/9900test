import { Injectable, Logger } from '@nestjs/common';
import { ResourceClient } from 'Clients/Resource/Resource.client';
import {
  CreateResourceDTO,
  IResource,
  QueryResourceDTO,
  UpdateResourceDTO,
} from 'Models/Resource/Resource.model';
import { IUser } from 'Models/User/User.model';

@Injectable()
export class ResourceService {
  constructor(
    private readonly resourceClient: ResourceClient,
  ) { }

  async getResourceById(id: string): Promise<IResource> {
    return this.resourceClient.getResourceById(id);
  }

  async getAllResources(filters: QueryResourceDTO): Promise<IResource[]> {
    return this.resourceClient.getAllResources(filters);
  }

  async createResource(resource: CreateResourceDTO, user: IUser): Promise<string> {
    return this.resourceClient.createResource(resource, user);
  }

  async updateResource(id: string, resource: UpdateResourceDTO, user: IUser): Promise<string> {
    return this.resourceClient.updateResource(id, resource, user);
  }

  async deleteResource(id: string, user: IUser): Promise<void> {
    await this.resourceClient.deleteResource(id, user);
  }

  public async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldResourceIds = await this.resourceClient.getOldResourceIds(
      cutoffDate,
      compareColumn,
    );
    logger.log(`Found ${oldResourceIds.length} old resources to delete`);

    if (oldResourceIds.length === 0) {
      return 0;
    }

    const trx = await this.resourceClient.getTransaction();

    try {
      const evidenceDeleted = await this.resourceClient.deleteEvidenceByResourceIds(
        oldResourceIds,
        trx,
      );
      logger.log(`Deleted ${evidenceDeleted} related evidence records`);

      const resourcesDeleted = await this.resourceClient.permanentlyDeleteResources(
        oldResourceIds,
        trx,
      );
      logger.log(`Deleted ${resourcesDeleted} resources`);

      const totalDeleted = evidenceDeleted + resourcesDeleted;
      logger.log(`Total records deleted: ${totalDeleted}`);
      await trx.commit();
      return totalDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during resource cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }
}
