import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_curated_germline_snv`,
    function createCuratedGermlineSnvTbl(table) {
      table.increments('variant_id');
      table.integer('gene_id', 11).unsigned().notNullable();

      table.string('chr', 15).notNullable();
      table.integer('pos', 11).unsigned().notNullable();
      table.string('ref', 350).notNullable();
      table.string('alt', 500).notNullable();
      table.string('transcript', 150).defaultTo(null);
      table.string('exon', 150).defaultTo(null);
      table.string('consequence', 150).defaultTo(null);
      table.string('hgvs', 4000).defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.unique(
        [`chr`, `pos`, knex.raw('`ref`(250)'), knex.raw('`alt`(250)')],
        'uniq_var',
      );

      table.index('gene_id');
      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
