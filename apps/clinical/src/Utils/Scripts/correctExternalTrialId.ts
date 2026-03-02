// update zccclinical.zcc_clinical_trials a
// inner join zccdrugs.zcc_clinical_trials b on a.trial_id = b.trial_id
// set a.external_id = b.id
// ;

import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';

const clinicalKnex = knex(knexConnectionConfig);

async function correctExternalTrialId(): Promise<void> {
  await clinicalKnex
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .update({ 'clinicalTrial.external_id': clinicalKnex.raw('drugClinicalTrial.id') })
    .from({ clinicalTrial: 'zccclinical.zcc_clinical_trials' })
    .innerJoin(
      { drugClinicalTrial: 'zccdrugs.zcc_clinical_trials' },
      'drugClinicalTrial.trial_id',
      'clinicalTrial.trial_id',
    );

  process.exit(0);
}

correctExternalTrialId();
