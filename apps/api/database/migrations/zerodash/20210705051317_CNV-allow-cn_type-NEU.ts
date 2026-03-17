import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_cnv',
    function cnTypeAddNEU(table) {
      table
        .enum('cn_type', [
          'NEU',
          'BAF_WEIGHTED',
          'GERMLINE_DUP',
          'GERMLINE_HET2HOM_DELETION',
          'GERMLINE_HET_DELETION',
          'GERMLINE_HET_DUP',
          'GERMLINE_HOM_DELETION',
          'GERMLINE_SEGMENTAL_DELETION',
          'DUP',
          'LOH',
          'DEL',
          'HOM_DEL',
        ])
        .defaultTo('NEU')
        .alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
