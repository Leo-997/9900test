import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_somatic_methylation_counts', table => {
    table.dropForeign(['meth_class_id']);
    table.dropPrimary();
    table.dropColumn('meth_class_id');
    table.uuid('meth_group_id').notNullable().first().primary();
  }).then(async () => {
    await knex.schema.alterTable('zcc_curated_sample_somatic_methylation', table => {
      table.dropIndex(['meth_class_id']);
      table.dropPrimary();
      table.dropColumn('meth_class_id');
      table.uuid('meth_group_id').notNullable().after('sample_id');
      table.primary(['sample_id', 'meth_group_id']);
      table.foreign('meth_group_id')
        .references('meth_group_id')
        .inTable('zcc_methylation_group');
    });
  }).then(async () => {
    await knex.schema.alterTable('zcc_curated_somatic_methylation_counts', table => {
      table.foreign('meth_group_id')
        .references('meth_group_id')
        .inTable('zcc_curated_sample_somatic_methylation');
    });
  });

}


export async function down(knex: Knex): Promise<void> {
}

