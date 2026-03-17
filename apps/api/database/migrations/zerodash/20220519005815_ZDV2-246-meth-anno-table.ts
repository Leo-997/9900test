import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_methylation_anno', (table) => {
    table.increments('internal_id').notNullable().primary();
    table.string('meth_sample_id', 50).notNullable();
    table.string('name', 50).notNullable();
    table.float('beta').notNullable();
    table.float('mvalue').notNullable();
    table.string('chr_hg38', 10).defaultTo(null);
    table.integer('start_hg38').defaultTo(null);
    table.integer('end_hg38').defaultTo(null);
    table.string('strand_hg38', 1).notNullable();
    table.string('relation_to_island', 50).defaultTo(null);
    table.text('ucsc_refgene_group', 'mediumtext');
    table.string('regulatory_feature_group', 50).defaultTo(null);
    table.text('gencodebasicv12_name', 'mediumtext');
    table.text('gencodebasicv12_accession', 'mediumtext');
    table.string('chr_hg19', 10).defaultTo(null);
    table.integer('pos_hg19').notNullable();
    table.string('strand_hg19', 1).notNullable();
    table.unique(['meth_sample_id', 'name'], { indexName: 'probe' });

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
