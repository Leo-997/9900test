import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_pipelines', (table) => {
    table.unique(['biosample_id', 'task_id'], { indexName: 'biosample_task_index' });
  });
}

export async function down(knex: Knex): Promise<void> {
}
