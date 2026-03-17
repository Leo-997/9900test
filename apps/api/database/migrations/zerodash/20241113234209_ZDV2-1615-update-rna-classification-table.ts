import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', async (table) => {
    table.string('biosample_id', 150).after('rnaseq_id');

    table.foreign('biosample_id', 'rnaseq_classification_biosample_id_fk')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('rnaseq_id'),
        })
        .from('zcc_curated_sample_somatic_rnaseq_classification')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
        table.dropForeign(['rnaseq_id'], 'rnaseq_classification_rnaseq_id_fk');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
        table.dropPrimary();
        table.primary(['biosample_id', 'classifier', 'version', 'prediction']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
        table.dropColumn('rnaseq_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
