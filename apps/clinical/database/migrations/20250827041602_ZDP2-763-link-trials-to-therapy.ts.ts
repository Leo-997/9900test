import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // add external_id column referring to external trial id in zcc_clinical_drug_trials
  await knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
    table.string('external_trial_id').after('trial_id');
  });

  await knex
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .update({ 'zcc_clinical_drug_trials.external_trial_id': knex.raw('zcc_clinical_trials.external_id') })
    .from('zcc_clinical_drug_trials')
    .innerJoin(
      'zcc_clinical_trials',
      'zcc_clinical_drug_trials.trial_id',
      'zcc_clinical_trials.id',
    );

  await knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
    table.dropForeign('trial_id');
    table.dropColumn('trial_id');
  });

  await knex.schema.dropTable('zcc_clinical_trials');

  await knex.schema.dropTable('zccdrugs.zcc_drug_trial_xref');

  // update therapy drug id to therapy id to which this drug is linkied
  await knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
    table.dropForeign('therapy_drug_id');
    table.dropIndex([], 'zcc_clinical_drug_trials_therapy_drug_id_foreign');
  });

  await knex
    // eslint-disable-next-line @typescript-eslint/naming-convention
    .update({ 'zcc_clinical_drug_trials.therapy_drug_id': knex.raw('zcc_clinical_therapy_drugs.therapy_id') })
    .from('zcc_clinical_drug_trials')
    .innerJoin(
      'zcc_clinical_therapy_drugs',
      'zcc_clinical_drug_trials.therapy_drug_id',
      'zcc_clinical_therapy_drugs.id',
    );

  // rename therapy_drug_id column to therapy_id in zcc_clinical_drug_trials
  await knex.schema.alterTable('zcc_clinical_drug_trials', async (table) => {
    table.string('therapy_id').after('therapy_drug_id');
  })
    .then(() => (
      knex
        .update({
          therapy_id: knex.raw('therapy_drug_id'),
        })
        .from('zcc_clinical_drug_trials')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
        table.dropColumn('therapy_drug_id');
      })
    ));

  // copy zcc_clinical_drug_trials to zcc_clinical_trials,
  // add foreign keys to zcc_clinical_therapies.id,
  // add unique constraint to ensure 1 external trial can only be added once to a therapy
  await knex.schema.createTableLike('zcc_clinical_trials', 'zcc_clinical_drug_trials', (table) => {
    table.foreign('therapy_id').references('zcc_clinical_therapies.id');
    table.unique(['therapy_id', 'external_trial_id']);
  });

  // copy data and remove duplication
  const trials = await knex
    .select('*')
    .from('zcc_clinical_drug_trials')
    .orderBy('created_at', 'desc');

  await Promise.all(
    trials.map((trial) => knex
      .insert(trial)
      .into('zcc_clinical_trials')
      .onConflict()
      .ignore()
      .then((resp) => {
        const [numRows] = resp;
        if (numRows === 0) {
          // ignored
          console.log(trial);
        }
      })),
  );

  await knex.schema.dropTable('zcc_clinical_drug_trials');
}

export async function down(knex: Knex): Promise<void> {
}
