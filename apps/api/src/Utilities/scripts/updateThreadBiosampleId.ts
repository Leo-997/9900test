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
  const commentThreads = await zdKnex
    .distinct({
      analysisSetId: 'analysis_set_id',
      entityType: 'entity_type',
      entityId: 'entity_id',
    })
    .from('zcc_curation_comment_thread')
    .whereNotNull('analysis_set_id');

  for (const thread of commentThreads) {
    try {
      const biosamples = await biosampleClient.getBiosamples(
        { analysisSetId: thread.analysisSetId },
        user,
        true,
      );

      const biosample = await getBiosample(
        thread.entityType,
        thread.analysisSetId,
        biosamples,
        thread.entityId,
      );
      if (biosample) {
        console.log(`Adding ${biosample.biosampleId} to threads ${thread.analysisSetId}, ${thread.entityType}, ${thread.entityId}`);
        await zdKnex
          .update({ biosample_id: biosample?.biosampleId })
          .from('zcc_curation_comment_thread')
          .where({
            analysis_set_id: thread.analysisSetId,
            entity_type: thread.entityType,
            entity_id: thread.entityId,
          });
      }
    } catch (e) {
      console.log(e);
    }
  }

  process.exit(0);
}

main();
