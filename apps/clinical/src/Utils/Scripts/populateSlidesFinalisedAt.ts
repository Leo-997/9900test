/* eslint-disable no-console */
/*
 * This script back-fills the zcc_clinical_versions.slides_finalised_at field.
 * For rows where slides_finalised_at is null and status is 'Done',
 * it sets slides_finalised_at to the row's existing updated_at value.
 */

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

async function populateSlidesFinalisedAt(): Promise<void> {
  console.log('Running slides_finalised_at update script...');

  try {
    const updatedRows = await clinicalKnex
      .update({
        slides_finalised_at: clinicalKnex.ref('updated_at'),
      })
      .from('zcc_clinical_versions')
      .whereNull('slides_finalised_at')
      .andWhere('status', 'Done');

    console.log(`Successfully updated ${updatedRows} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating slides_finalised_at column:', error);
    process.exit(1);
  }
}

populateSlidesFinalisedAt();
