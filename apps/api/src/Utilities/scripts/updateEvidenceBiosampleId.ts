/* eslint-disable no-await-in-loop */
import { BiosamplesClient } from 'Clients/Analysis/Biosamples.client';
import knex from 'knex';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import {
  getBiosample,
} from 'Utilities/helpers/getBiosample';
import { knexConnectionConfig } from '../../../knexfile';

const user: IUserWithMetadata = {
  id: 'sysadmin',
  azureId: '',
  email: 'test@test.com',
  givenName: 'System',
  familyName: 'Admin',
  groups: [],
  roles: [],
  scopes: [],
  accessControls: [],
};

async function main(): Promise<void> {
  const zdKnex = knex(knexConnectionConfig);
  const biosampleClient = new BiosamplesClient(zdKnex);

  // get all the comment threads
  const evidences = await zdKnex
    .distinct({
      analysisSetId: 'analysis_set_id',
      entityType: 'entity_type',
      entityId: 'entity_id',
    })
    .from('zcc_evidences')
    .whereNotNull('analysis_set_id')
    .whereNotNull('entity_type');

  for (const evidence of evidences) {
    try {
      const biosamples = await biosampleClient.getBiosamples(
        { analysisSetId: evidence.analysisSetId },
        user,
        true,
      );

      const biosample = await getBiosample(
        evidence.entityType,
        evidence.analysisSetId,
        biosamples,
        evidence.entityId,
      );

      if (biosample) {
        console.log(`Adding ${biosample.biosampleId} to evidence ${evidence.analysisSetId}, ${evidence.entityType}, ${evidence.entityId}`);
        await zdKnex
          .update({ biosample_id: biosample?.biosampleId })
          .from('zcc_evidences')
          .where({
            analysis_set_id: evidence.analysisSetId,
            entity_type: evidence.entityType,
            entity_id: evidence.entityId,
          });
      }
    } catch (e) {
      console.log(e);
    }
  }

  process.exit(0);
}

main();
