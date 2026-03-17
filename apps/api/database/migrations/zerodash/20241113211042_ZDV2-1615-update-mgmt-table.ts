import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_mgmtstatus', async (table) => {
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
        .from({ meth: 'zcc_curated_sample_somatic_mgmtstatus' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_mgmtstatus', (table) => {
        table.dropPrimary();
        table.primary(['biosample_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_mgmtstatus', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_mgmtstatus', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
