import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_sample_curation_workflow', (table) => {
    table.string('sample_id', 150).notNullable();
    table.string('curation_status', 50).notNullable();
    table.integer('step').notNullable();
    table.string('created_by', 255).notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.foreign('created_by')
      .references('id')
      .inTable('zcc_users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.unique(['sample_id', 'curation_status', 'step'], { indexName: 'zcc_sample_curation_workflow_unique' });

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
