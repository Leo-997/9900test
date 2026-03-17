import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_sv', (table) => {
    table.integer('parent_id').unsigned().after('sample_id').defaultTo(null);

    table
      .foreign('parent_id')
      .references('internal_id')
      .inTable('zcc_curated_sample_somatic_sv')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
