import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample_somatic_rnaseq_sv', async (table) => {
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
        .from('zcc_sample_somatic_rnaseq_sv')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_sample_somatic_rnaseq_sv', (table) => {
        table.dropPrimary();
        table.primary(['biosample_id', 'variant_id', 'algorithm']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_sample_somatic_rnaseq_sv', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_sample_somatic_rnaseq_sv', (table) => {
        table.dropColumn('rnaseq_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
