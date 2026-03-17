/* eslint-disable no-console */

/*
 * This script back-fills the zcc_analysis_set.curation_started_at field.
 * It takes the sample's corresponding zcc_purity.created_at
 * as an approximation of when the curation status progressed to "Ready to Start"
 */

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);

type SampleId = {
  analysis_set_id: string;
};
const getRowsToUpdate = async (): Promise<SampleId[]> => zdKnex
  .select('analysis_set_id')
  .from('zcc_analysis_set')
  .whereNull('curation_started_at')
  .whereNotIn('curation_status', ['Upcoming', 'In Pipeline']);

const getPurityCreatedAt = async (id: string): Promise<string | undefined> => {
  const result = await zdKnex
    .select('created_at')
    .from('zcc_purity')
    .where('analysis_set_id', id)
    .first();

  return result?.created_at;
};

async function populateCurationStartedAt(): Promise<void> {
  console.log('Running script...');
  try {
    console.log('Fetching case data..');
    const cases = await getRowsToUpdate();

    console.log(`Found ${cases.length} case(s). Starting updates...`);
    console.log('Populating curation_started_at column for each case...');
    const updatePromises = cases.map(async (row): Promise<number | undefined> => {
      const purityCreatedAt = await getPurityCreatedAt(row.analysis_set_id);

      if (purityCreatedAt) {
        return zdKnex
          .update({
            curation_started_at: purityCreatedAt,
          })
          .from('zcc_analysis_set')
          .where('analysis_set_id', row.analysis_set_id);
      }

      return undefined;
    });

    await Promise.all(updatePromises);

    console.log('Table updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating curation_started_at column:', error);
    process.exit(1);
  }
}

populateCurationStartedAt();
