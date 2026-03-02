import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_immunoprofile', async (table) => {
    table.string('biosample_id', 150).after('rnaseq_id');

    table.foreign('biosample_id')
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
        .from('zcc_curated_sample_immunoprofile')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
        table.dropForeign(['rnaseq_id'], 'zcc_curated_sample_immunoprofile_rnaseq_biosample');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
        table.dropPrimary();
        table.primary(['biosample_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
        table.dropColumn('rnaseq_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
