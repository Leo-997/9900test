/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';



const clinicalKnex = knex(knexConnectionConfig);

async function updateClinicalStatus(): Promise<void> {
  await clinicalKnex.update({
    status: clinicalKnex.raw(`
      CASE 
        WHEN status = 'New' AND (cohort LIKE '%Cohort 1 %' OR cohort LIKE '%Cohort 2 %') THEN 'Ready to Start'
        WHEN status = 'New' THEN 'N/A'
        WHEN status = 'In Progress - MTB' THEN 'In Progress'
        WHEN status = 'Finalised - MTB' THEN 'Done'
        ELSE status
      END
    `),
  }).from('zcc_clinical_versions');

  process.exit(0);
}

updateClinicalStatus();
