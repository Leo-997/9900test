/*
* Group therapy recommendations won't have their own tier anymore,
* This script is for fixing historical therapy recommendations (individual) that have no tier value
* The group recommendation is used for backfilling.
*/
import { Logger } from '@nestjs/common';
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);
const logger = new Logger('BackfillRecsScript');
const recommendationsTable = 'zcc_clinical_recommendations';
const recsXrefTable = 'zcc_clinical_discussion_recommendation_xref';

async function backfillNullRecommendationTier(): Promise<void> {
  logger.log('Running script...');

  try {
    logger.log('Updating rows in zcc_clinical_recommendations...');
    const updatedRecommendationsCount = await clinicalKnex
      .from({ recommendation: recommendationsTable })
      // eslint-disable-next-line @typescript-eslint/naming-convention
      .update({ 'recommendation.tier': clinicalKnex.ref('parentRec.tier') })
      .innerJoin({ xref: recsXrefTable }, 'xref.child_recommendation_id', 'recommendation.id')
      .innerJoin({ parentRec: recommendationsTable }, 'parentRec.id', 'xref.parent_recommendation_id')
      .whereNull('parentRec.deleted_at')
      .whereNotNull('parentRec.tier')
      .whereNull('recommendation.tier');

    if (!updatedRecommendationsCount) {
      logger.log('No record needs update. Ending script...');
      process.exit(0);
    }
    logger.log(updatedRecommendationsCount);
    logger.log(`Updated ${updatedRecommendationsCount} rows.`);
    process.exit(0);
  } catch (error) {
    logger.error('Error backfilling recommendation tier column:', error);
    process.exit(1);
  }
}

backfillNullRecommendationTier();
