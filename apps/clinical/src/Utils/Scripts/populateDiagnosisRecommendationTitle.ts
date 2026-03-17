/* eslint-disable no-console */

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

async function populateDiagnosisRecommendationTitle(): Promise<void> {
  console.log('Running zcc_clinical_recommendation.title update script...');

  const recs = await clinicalKnex
    .select({
      id: 'r.id',
      diagnosis: 'd.recommended_zero2_final_diagnosis',
    })
    .from({ r: 'zcc_clinical_recommendations' })
    .leftJoin(
      { d: 'zcc_clinical_diagnosis_recommendations' },
      'r.clinical_diagnosis_recommendation_id',
      'd.id',
    )
    .whereNull('r.deleted_at')
    .andWhere('r.type', 'CHANGE_DIAGNOSIS')
    .andWhere(function custom() {
      this
        .whereNull('r.title')
        .orWhere('r.title', '');
    });

  try {
    const count = await Promise.all(recs
      .filter((rec) => {
        if (rec.diagnosis) {
          return true;
        }
        console.log(`rec ${rec.id} has no recommended_zero2_final_diagnosis`);
        return false;
      })
      .map((rec) => clinicalKnex
        .update({ title: `Change diagnosis to ${rec.diagnosis}` })
        .where('id', rec.id)
        .from('zcc_clinical_recommendations')));
    console.log(`Successfully updated ${count.reduce((s, c) => s + c)} row(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating zcc_clinical_recommendation.title column:', error);
    process.exit(1);
  }
}

populateDiagnosisRecommendationTitle();
