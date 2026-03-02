import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

async function migrateTherapyEvidence(): Promise<void> {
  await clinicalKnex.update({
    entity_type: 'THERAPY',
    entity_id: clinicalKnex.raw('r.therapy_id'),
  })
    .from({ e: 'zcc_clinical_evidence' })
    .where('entity_type', 'RECOMMENDATION')
    .leftJoin({ r: 'zcc_clinical_recommendations' }, 'e.entity_id', 'r.id');

  process.exit(0);
}

migrateTherapyEvidence();
