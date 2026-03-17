import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_reportable_variants', (table) => {
    table.uuid('analysis_set_id').after('sample_id');

    table
      .foreign('analysis_set_id')
      .references('analysis_set_id')
      .inTable('zcc_analysis_set')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex.update({
        analysis_set_id: knex
          .select('analysis_set_id')
          .from('zcc_analysis_set_exp_xref')
          .where('biosample_id', knex.raw('??', ['variants.sample_id']))
          .first(),
      })
        .from({ variants: 'zcc_curated_reportable_variants' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_reportable_variants', (table) => {
        table.dropPrimary();
        table.primary(['analysis_set_id', 'variant_type', 'variant_id', 'report_type']);
      })
    ))
    .then(() => (
      // separating into separate queries as it was giving issues with the primary key drop
      knex.schema.alterTable('zcc_curated_reportable_variants', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(): Promise<void> {
}
