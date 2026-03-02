/* eslint-disable no-console */
/*
 * This script back-fills the zcc_clinical_versions.slides_created_at field.
 * It checks all the case's created slides, and picks the first one created.
 * That slide "created_at" value will then be used to hydrate slides_created_at
 */

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

type SampleId = {
  id: string,
};

const getRowsToUpdate = async (): Promise<SampleId[]> => clinicalKnex
  .select('id')
  .from('zcc_clinical_versions')
  .where({ slides_started_at: null })
  .andWhereNot('status', 'Ready to Start');

const getFirstSlideDate = async (id: string): Promise<string | undefined> => {
  const result = await clinicalKnex
    .min<{ earliest_created_at: string }>('created_at as earliest_created_at')
    .from('zcc_clinical_slides')
    .where('clinical_version_id', id)
    .first();

  return result?.earliest_created_at;
};

async function populateSlidesStartedAt(): Promise<void> {
  console.log('Running script...');
  try {
    console.log('Fetching cases data...');
    // Fetch the rows that need updating
    const cases = await getRowsToUpdate();

    console.log(`Found ${cases.length} case(s). Starting updates...`);
    console.log('Populating slides_created_at column for each case...');
    const updatePromises = cases.map(async (row): Promise<number | undefined> => {
      const firstSlideDate = await getFirstSlideDate(row.id);

      if (firstSlideDate) {
        return clinicalKnex
          .update({
            slides_started_at: firstSlideDate,
          })
          .from('zcc_clinical_versions')
          .where('id', row.id);
      }

      return undefined;
    });

    await Promise.all(updatePromises);

    console.log('Table updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_clinical_versions', error);
    process.exit(1);
  }
}

populateSlidesStartedAt();
