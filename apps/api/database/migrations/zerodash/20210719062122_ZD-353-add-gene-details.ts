import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(`zcc_genes`, function addGenesDetails(table) {
    table.string('chromosome_hg38', 30).defaultTo(null);
    table.bigInteger('start_hg38').defaultTo(null);
    table.bigInteger('end_hg38').defaultTo(null);
    table.string('chromosomeBand_hg38', 15).defaultTo(null);
    table.string('strand_hg38', 1).defaultTo(null);
    table.integer('entrezUID').defaultTo(null).after('gene');
    table.string('fullname', 1000).defaultTo(null).after('entrezUID');
    table.string('alias', 4000).defaultTo(null).after('fullname');
    table.text('summary').defaultTo(null).after('alias');
    table.text('expression').defaultTo(null).after('summary');
  });
}

export async function down(knex: Knex): Promise<void> {}
