import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curated_somatic_snv',
    function createCuratedSomaticSnvTbl(table) {
      table.increments('variant_id');
      table.integer('gene_id', 11).unsigned().notNullable();

      table.string('chr', 15).notNullable();
      table.integer('pos', 11).unsigned().notNullable();
      table.string('ref', 100).notNullable();
      table.string('alt', 100).notNullable();

      table.string('transcript', 150).defaultTo(null);
      table.string('consequence', 150).defaultTo(null);
      table.string('hgvs', 4000).defaultTo(null);
      table.boolean('pecan').defaultTo(null);
      table.enum('sjc_medal', ['Gold', 'Silver', 'Bronze']).notNullable();
      table
        .enum('hotspot', ['NON_HOTSPOT', 'NEAR_HOTSPOT', 'HOTSPOT'])
        .notNullable();

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.index('gene_id');

      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.unique(['chr', 'pos', 'ref', 'alt']);

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
