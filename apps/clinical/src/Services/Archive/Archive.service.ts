import { Inject, Injectable } from '@nestjs/common';
import { ArchiveClient } from 'Clients/Archive/Archive.client';
import { IMolecularAlterationDetail, IUserWithMetadata } from 'Models';
import { IArchiveSample, IArchiveSamplesQuery } from 'Models/Archive/Archive.model';
import { MolecularAlterationsService } from '../MolecularAlterations/MolecularAlterations.service';

@Injectable()
export class ArchiveService {
  constructor(
    @Inject(ArchiveClient) private readonly archiveClient: ArchiveClient,
    @Inject(MolecularAlterationsService)
      private readonly molAlterationService: MolecularAlterationsService,
  ) {}

  public async getArchiveSamples(
    filters: IArchiveSamplesQuery,
    user: IUserWithMetadata,
  ): Promise<IArchiveSample[]> {
    const samples = await this.archiveClient.getArchiveSamples(filters, user);
    return Promise.all(samples.map(async (sample) => ({
      ...sample,
      relevantMolAlterations: await this.getRelevantMolecularAlterations(sample, filters),
    })));
  }

  public async getArchiveSamplesCount(
    filters: IArchiveSamplesQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.archiveClient.getArchiveSamplesCount(filters, user);
  }

  private async getRelevantMolecularAlterations(
    sample: IArchiveSample,
    filters: IArchiveSamplesQuery,
  ): Promise<IMolecularAlterationDetail[]> {
    const alterations: IMolecularAlterationDetail[] = [];
    if (filters.geneMutations?.length) {
      alterations.push(
        ...(
          await this.molAlterationService.getMolecularAlterations(
            sample.clinicalVersionId,
            {
              geneMutations: filters.geneMutations,
            },
          )
        ),
      );
    }

    if (filters.geneIds?.length) {
      alterations.push(
        ...(
          await this.molAlterationService.getMolecularAlterations(
            sample.clinicalVersionId,
            {
              geneIds: filters.geneIds,
            },
          )
        ),
      );
    }

    if (filters.classifiers?.length) {
      alterations.push(
        ...(
          await this.molAlterationService.getMolecularAlterations(
            sample.clinicalVersionId,
            {
              mutationIds: filters.classifiers,
            },
          )
        ),
      );
    }

    return alterations.filter((alteration, index, self) => (
      self.findIndex((a) => a.id === alteration.id) === index
    ));
  }
}
