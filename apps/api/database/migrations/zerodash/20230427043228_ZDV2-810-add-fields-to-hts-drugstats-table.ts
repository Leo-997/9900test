import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    table.double('ic50_log2').after('maximum_effect_mtc');
    table.double('lc50').after('ic50_log2');
    table.double('zscore_lc50').after('lc50');
    table.double('lc50_median').after('zscore_lc50');
    table.double('lc50_log2').after('lc50_median');
    table.double('cmax').after('lc50_log2');
    table.double('effect_cmax').after('cmax');
    table.double('css').after('effect_cmax');
    table.double('effect_css').after('css');
    table.double('crew').after('effect_css');
    table.string('cohort4zscore', 50).after('crew');
  });
}

export async function down(knex: Knex): Promise<void> {
}
