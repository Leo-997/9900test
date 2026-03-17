import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_sv', async (table) => {
    table.string('biosample_id', 150).after('sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('sample_id'),
        })
        .from('zcc_curated_sample_somatic_sv')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_sv', (table) => {
        table.dropUnique(
          [
            'variant_id',
            'sample_id',
            knex.raw('`start_fusion`(250)'),
            knex.raw('`end_fusion`(250)'),
            'chr_bkpt1',
            'pos_bkpt1',
            'chr_bkpt2',
            'pos_bkpt2',
          ],
          'uniq_cur_sample_somatic_sv_idx',
        );
        table.dropIndex(['sample_id'], 'zcc_curated_sample_somatic_sv_sample_id_index');
        table.unique(
          [
            'variant_id',
            'biosample_id',
            knex.raw('`start_fusion`(250)'),
            knex.raw('`end_fusion`(250)'),
            'chr_bkpt1',
            'pos_bkpt1',
            'chr_bkpt2',
            'pos_bkpt2',
          ],
          'uniq_cur_sample_somatic_sv_idx',
        );
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_sv', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_sv', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
