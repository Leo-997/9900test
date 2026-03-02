import { Injectable, Logger } from '@nestjs/common';
import { EvidenceClient } from 'Clients/Evidence/Evidence.client';
import {
  CreateEvidenceDTO, IEvidence, UpdateEvidenceDTO, QueryEvidenceDTO,
} from 'Models/Evidence/Evidence.model';
import { IUser } from 'Models/User/User.model';
import { CitationService } from '../Citation/Citation.service';
import { ResourceService } from '../Resource/Resource.service';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly evidenceClient: EvidenceClient,
    private readonly resourceService: ResourceService,
    private readonly citationService: CitationService,
  ) { }

  public async getEvidenceById(id: string): Promise<IEvidence> {
    return this.evidenceClient.getEvidenceById(id);
  }

  public async getAllEvidences(filters: QueryEvidenceDTO): Promise<IEvidence[]> {
    return this.evidenceClient.getAllEvidences(filters);
  }

  public async getEvidenceCount(filters: QueryEvidenceDTO): Promise<number> {
    return this.evidenceClient.getEvidenceCount(filters);
  }

  public async createEvidence(
    evidence: CreateEvidenceDTO,
    user: IUser,
  ): Promise<string> {
    const id = evidence.citationData
      ? await this.citationService.createCitation(evidence.citationData, user)
      : await this.resourceService.createResource(evidence.resourceData, user);

    return this.evidenceClient.createEvidence(
      evidence.citationData
        ? { citationId: id }
        : { resourceId: id },
      user,
    );
  }

  public async updateEvidence(
    id: string,
    evidence: UpdateEvidenceDTO,
    user: IUser,
  ): Promise<string> {
    return this.evidenceClient.updateEvidence(id, evidence, user);
  }

  public async deleteEvidence(id: string, user: IUser): Promise<void> {
    const evidenceData = await this.evidenceClient.getEvidenceById(id);

    // Soft delete corresponding resource/citation
    if (evidenceData.citationId) this.citationService.deleteCitation(evidenceData.citationId, user);
    if (evidenceData.resourceId) this.resourceService.deleteResource(evidenceData.resourceId, user);

    return this.evidenceClient.deleteEvidence(id, user);
  }

  async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      // Count records to be deleted for logging
      const countToDelete = await this.evidenceClient.countOldRecords(
        cutoffDate,
        compareColumn,
      );

      logger.log(
        `Found ${countToDelete} old records in table zcc_evidences`,
      );

      if (countToDelete > 0) {
        const deletedCount = await this.evidenceClient.deleteOldRecords(
          cutoffDate,
          compareColumn,
        );

        logger.log(
          `Deleted ${deletedCount} old records in table zcc_evidences`,
        );
        return deletedCount;
      }

      return 0;
    } catch (error) {
      logger.error(
        `Error cleaning up table 'zcc_evidences': ${error instanceof Error ? error.message : String(error)}`,
      );
      return 0;
    }
  }
}
