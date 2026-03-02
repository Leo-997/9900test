import type { Knex } from 'knex';
import updateReportableVariantBiosampleId from 'Utilities/scripts/updateReportableVariantBiosampleId';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_reportable_variants', (table) => {
    table.string('biosample_id', 150).after('analysis_set_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(async () => (
      updateReportableVariantBiosampleId(knex)
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_reportable_variants', (table) => {
        table.dropForeign(['analysis_set_id']);
        table.index(['analysis_set_id']);
        table
          .foreign('analysis_set_id')
          .references('analysis_set_id')
          .inTable('zcc_analysis_set')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');

        table.dropPrimary();
        table.primary(['analysis_set_id', 'biosample_id', 'variant_type', 'variant_id', 'report_type']);
      })
    ));
}

export async function down(): Promise<void> {
}
