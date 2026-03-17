/* eslint-disable no-console */
import { knex } from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);

async function updateCurationDoneStatus(): Promise<void> {
  try {
    console.log('Running script...');

    const updatedRowsNumber = await zdKnex
      .update({ curation_status: 'Done' })
      .from('zcc_analysis_set')
      .where('curation_status', 'Curation Done');

    console.log(`Updated ${updatedRowsNumber} rows`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_analysis_set.curation_status:', error);
    process.exit(1);
  }
}

updateCurationDoneStatus();
