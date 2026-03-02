/* eslint-disable no-console */

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

async function populateGermlineRecommendationTitle(): Promise<void> {
  console.log('Running zcc_clinical_recommendation.title update script...');

  try {
    const updatedRows = await clinicalKnex
      .update({
        title: 'Germline Recommendation',
      })
      .from('zcc_clinical_recommendations')
      .whereNull('deleted_at')
      .andWhere('type', 'GERMLINE')
      .andWhere(function custom() {
        this
          .whereNull('title')
          .orWhere('title', '');
      });

    console.log(`Successfully updated ${updatedRows} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating slides_finalised_at column:', error);
    process.exit(1);
  }
}

populateGermlineRecommendationTitle();
