import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_zd_fusion', (table) => {
    table.string('rnaseq_id', 150).after('file_id');
  });
}

export async function down(knex: Knex): Promise<void> {}
