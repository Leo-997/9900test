import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_methylation', async (table) => {
    table.string('biosample_id', 150).after('sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex
            .select('meth_sample_id')
            .from('zcc_sample')
            .where('sample_id', knex.raw('??', ['meth.sample_id']))
            .first(),
        })
        .from({ meth: 'zcc_curated_sample_somatic_methylation' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_methylation', (table) => {
        table.dropPrimary();
        table.dropIndex(['sample_id'], 'zcc_curated_sample_somatic_methylation_sample_id_index');
        table.primary(['biosample_id', 'meth_group_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_methylation', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_methylation', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
