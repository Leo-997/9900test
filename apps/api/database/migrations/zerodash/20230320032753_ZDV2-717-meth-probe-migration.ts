import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('zcc_methylation_anno');
  await knex.schema.dropTableIfExists('zcc_methylation_probe');
  await knex.schema.createTable('zcc_methylation_probe', (table) => {
    table.string('probe_id', 50).notNullable().primary();
    table.integer('platform_id', 10).unsigned().defaultTo(null);
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
  return knex.schema.createTable('zcc_methylation_anno', (table) => {
    table.string('meth_sample_id', 50).notNullable();
    table.string('probe_id', 50).notNullable();
    table.float('beta', 8, 2).defaultTo(null);
    table.float('mvalue', 8, 2).defaultTo(null);
    table.unique(
      ['meth_sample_id', 'probe_id'],
      'zcc_meth_anno_unique_probe_id',
    );
    table.index(['probe_id'], 'zcc_meth_anno_probe_idx');
    table.index(['meth_sample_id'], 'zcc_meth_anno_id_idx');
    table
      .foreign('probe_id', 'zcc_methylation_anno_probe_id_foreign')
      .references('probe_id')
      .inTable('zcc_methylation_probe');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
