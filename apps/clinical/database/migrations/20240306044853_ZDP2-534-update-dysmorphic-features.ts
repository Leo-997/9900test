import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_information', async (table) => {
    table.string('other_information').after('personal_history_note');
    table.text('other_information_note').after('other_information');
  })
    .then(() => (
      knex
        .update({
          other_information: knex.raw('dysmorphic_features'),
          other_information_note: knex.raw('dysmorphic_features_note'),
        })
        .from('zcc_clinical_information')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_information', (table) => {
        table.dropColumns('dysmorphic_features', 'dysmorphic_features_note');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
