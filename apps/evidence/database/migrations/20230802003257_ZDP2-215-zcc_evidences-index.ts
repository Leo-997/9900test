import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_evidences', (table) => {
    table
      .foreign('resourceId')
      .references('id')
      .inTable('zcc_resources')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table
      .foreign('citationId')
      .references('id')
      .inTable('zcc_citations')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
}
