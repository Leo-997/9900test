import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_snv',
    function createCuratedSnvTbl(table) {
      table.increments('variant_id').primary();
      table.integer('gene_id', 10).unsigned().defaultTo(null);

      table.string('chr', 15).notNullable();
      table.integer('pos', 11).notNullable();
      table.string('ref', 100).notNullable();
      table.string('alt', 100).notNullable();
      table.string('transcript', 150).defaultTo(null);
      table.string('exon', 150).defaultTo(null);
      table.string('consequence', 150).defaultTo(null);
      table.string('hgvs', 4000).defaultTo(null);
      table.boolean('pecan').defaultTo(null);
      table.enum('sjc_medal', ['Gold', 'Silver', 'Bronze']).defaultTo(null);
      table
        .enum('hotspot', ['NON_HOTSPOT', 'NEAR_HOTSPOT', 'HOTSPOT'])
        .defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by').defaultTo(null);
      table.string('updated_by').defaultTo(null);

      table.unique(['chr', 'pos', 'ref', 'alt']);

      table.index('gene_id');

      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
