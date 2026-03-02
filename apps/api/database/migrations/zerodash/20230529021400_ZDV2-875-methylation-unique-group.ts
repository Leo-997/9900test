import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_group', (table) => {
    table.unique(['meth_classifier_id', 'meth_class_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
}