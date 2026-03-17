/* eslint-disable no-console */

/*
* This script renames "Upcoming" status to "Sequencing"
* in zcc_analysis_set.curation_status field.
*/

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const zdKnex = knex(knexConnectionConfig);

async function renameUpcomingCurationStatus(): Promise<void> {
  console.log('Running script...');
  console.log('Renaming "Upcoming" status in zcc_analysis_set.curation_status...');

  try {
    const updatedRows = await zdKnex
      .update({
        curation_status: 'Sequencing',
      })
      .from('zcc_analysis_set')
      .where('curation_status', 'Upcoming');

    if (updatedRows === 0) {
      console.log('No rows matched "Upcoming" status. Nothing updated.');
    } else {
      console.log(`Updated ${updatedRows} rows.`);
    }
    console.log('zcc_analysis_set table successfully updated.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_analysis_set.curation_status field:', error);
    process.exit(1);
  }
}

renameUpcomingCurationStatus();
