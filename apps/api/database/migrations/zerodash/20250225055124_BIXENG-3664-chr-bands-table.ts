import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ucsc_chromosome_bands', (table) => {
    table.string('chromosome', 45).notNullable();
    table.string('name', 45).notNullable();
    table.bigInteger('chrom_start').nullable();
    table.bigInteger('chrom_end').nullable();
    table.string('gie_stain', 45).nullable();
    table.string('assembly', 45).notNullable();

    table.primary(['chromosome', 'name', 'assembly']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
