import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_germline_snv', async (table) => {
    table.string('biosample_id', 150).after('matched_normal_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('matched_normal_id'),
        })
        .from('zcc_curated_sample_germline_snv')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_germline_snv', (table) => {
        table.dropUnique(['matched_normal_id', 'variant_id'], 'uniq_cur_sample_germ_snv');
        table.dropIndex(['matched_normal_id'], 'zcc_cur_sample_germ_snv_matched_id_idx');
        table.unique(['biosample_id', 'variant_id'], { indexName: 'uniq_cur_sample_germ_snv' });
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_germline_snv', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_germline_snv', (table) => {
        table.dropColumn('matched_normal_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
