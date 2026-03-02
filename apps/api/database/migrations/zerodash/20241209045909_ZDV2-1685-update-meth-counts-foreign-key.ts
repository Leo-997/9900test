import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_somatic_methylation_counts', (table) => {
    table.dropForeign(['meth_group_id']);
  })
    .then(() => (
      knex.schema.alterTable('zcc_curated_somatic_methylation_counts', (table) => {
        table.foreign('meth_group_id')
          .references('meth_group_id')
          .inTable('zcc_methylation_group')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
