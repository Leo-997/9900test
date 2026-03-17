import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_cnv',
    function addCnTypeField(table) {
      table
        .enu('cn_type', [
          'BAF_WEIGHTED',
          'GERMLINE_DUP',
          'GERMLINE_HET2HOM_DELETION',
          'GERMLINE_HET_DELETION',
          'GERMLINE_HET_DUP',
          'GERMLINE_HOM_DELETION',
          'DUP',
          'LOH',
          'DEL',
          'HOM_DEL',
        ])
        .defaultTo(null)
        .after('bkpt2');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
