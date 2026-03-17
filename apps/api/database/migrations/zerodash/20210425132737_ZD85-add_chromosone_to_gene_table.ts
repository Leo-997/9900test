import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_genes',
    function addChromosoneToZccGenes(table) {
      table.string('chromosome');
      table.string('chromosomeBand');
      table.integer('gene_start');
      table.integer('gene_end');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
