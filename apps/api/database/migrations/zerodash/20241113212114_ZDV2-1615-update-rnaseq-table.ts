import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq', async (table) => {
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
        .from('zcc_curated_sample_somatic_rnaseq')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq', (table) => {
        table.dropPrimary();
        table.dropIndex(['rnaseq_id'], 'zcc_rnaseq_rnaseq_id_index');
        table.primary(['biosample_id', 'gene_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq', (table) => {
        table.dropColumn('rnaseq_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
