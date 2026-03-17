import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_anno', async (table) => {
    table.string('biosample_id', 150).after('meth_sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('meth_sample_id'),
        })
        .from({ meth: 'zcc_methylation_anno' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_methylation_anno', (table) => {
        table.dropPrimary();
        table.dropUnique(['meth_sample_id', 'probe_id'], 'zcc_meth_anno_unique_probe_id');
        table.dropIndex(['meth_sample_id'], 'zcc_meth_anno_id_idx');
        table.primary(['biosample_id', 'probe_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_methylation_anno', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_methylation_anno', (table) => {
        table.dropColumn('meth_sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
