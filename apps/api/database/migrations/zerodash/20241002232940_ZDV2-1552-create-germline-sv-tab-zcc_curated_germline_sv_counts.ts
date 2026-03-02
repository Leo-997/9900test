import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_germline_sv_counts', (table) => {
    table.integer('variant_id').unsigned().notNullable();

    table.integer('sample_count').unsigned().defaultTo(null);
    table.integer('cancer_types').unsigned().defaultTo(null);
    table.integer('reported_count').unsigned().defaultTo(null);
    table.integer('targetable_count').unsigned().defaultTo(null);

    table.primary(['variant_id']);
    table
      .foreign('variant_id')
      .references('variant_id')
      .inTable('zcc_curated_sample_germline_sv')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
