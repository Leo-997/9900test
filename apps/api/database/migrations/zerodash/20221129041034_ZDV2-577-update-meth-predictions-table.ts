import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_predictions', table => {
    table.dropForeign(['meth_class_id']);
    table.dropIndex(['meth_class_id']);
    table.dropPrimary();
    table.dropColumn('meth_class_id');
    table.uuid('meth_group_id').notNullable().after('sample_id');
    table.primary(['sample_id', 'meth_group_id']);
    table.foreign('meth_group_id')
      .references('meth_group_id')
      .inTable('zcc_methylation_group');
  });
}


export async function down(knex: Knex): Promise<void> {
}

