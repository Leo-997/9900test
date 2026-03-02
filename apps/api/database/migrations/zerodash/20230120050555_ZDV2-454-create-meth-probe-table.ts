import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_methylation_probe', (table) => {
    table.string('probe_id', 50).primary().notNullable();
    table.integer('platform_id').unsigned().defaultTo(null);
    table.string('chr_hg38', 10).defaultTo(null);
    table.integer('start_hg38', 11).defaultTo(null);
    table.integer('end_hg38', 11).defaultTo(null);
    table.string('strand_hg38', 1).defaultTo(null);
    table.string('relation_to_island', 50).defaultTo(null);
    table.text('ucsc_refgene_group', 'medium');
    table.string('regulatory_feature_group', 50).defaultTo(null);
    table.string('gencodebasicv12_name', 500).defaultTo(null);
    table.text('gencodebasicv12_accession', 'medium');
    table.string('chr_hg19', 10).defaultTo(null);
    table.integer('pos_hg19', 11).defaultTo(null);
    table.string('strand_hg19', 1).defaultTo(null);

    table.unique(['probe_id'], { indexName: 'probe_id_UNIQUE' });
    table.index(['chr_hg38', 'start_hg38', 'end_hg38'], 'meth_anno_hg38_index');
    table.index(['chr_hg19', 'pos_hg19'], 'meth_anno_hg19_index');
    table.index(['gencodebasicv12_name'], 'gencodebasicv12_name_index');
    table.index(['platform_id'], 'zcc_methylation_probe_platform_idx');

    table
      .foreign('platform_id', 'zcc_methylation_probe_platform')
      .references('platform_id')
      .inTable('zcc_platforms');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
