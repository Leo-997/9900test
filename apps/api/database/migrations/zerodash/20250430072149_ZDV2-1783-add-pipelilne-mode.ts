import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_pipelines', (table) => {
    table.string('mode', 45).nullable().defaultTo(null).after('pipeline_vers');
    table.string('pipeline_id', 26).notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {

}
